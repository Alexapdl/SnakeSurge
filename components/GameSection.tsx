"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  SNAKES,
  LADDERS,
  ALL_PLAYERS,
  ROLL_COST,
  PLATFORM_FEE_PERCENT,
  INITIAL_BALANCE,
  SKILL_PRICES,
  GameState,
  createInitialGameState,
} from "@/lib/gameConstants";
import { drawSnakesAndLadders } from "@/lib/gameUtils";

// Token offset positions for up to 4 players in same cell
const TOKEN_OFFSETS = [
  { bottom: "2px", left: "2px", right: "auto", top: "auto" },
  { bottom: "2px", right: "2px", left: "auto", top: "auto" },
  { top: "2px", left: "2px", bottom: "auto", right: "auto" },
  { top: "2px", right: "2px", bottom: "auto", left: "auto" },
];

interface LogEntry {
  id: number;
  text: string;
  cls: string;
}

interface GameSectionProps {
  onPrizePoolChange: (v: number) => void;
}

export default function GameSection({ onPrizePoolChange }: GameSectionProps) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [gs, setGs] = useState<GameState>(() => createInitialGameState(2));
  const [diceValue, setDiceValue] = useState(1);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState("Klik dadu untuk mulai");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 0,
      text: "🎮 Selamat datang! Klik dadu untuk memulai permainan.",
      cls: "",
    },
  ]);
  const logIdRef = useRef(1);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef(gs);
  gsRef.current = gs;

  const addLog = useCallback((text: string, cls = "") => {
    setLogs((prev) => {
      const next = [{ id: logIdRef.current++, text, cls }, ...prev].slice(
        0,
        50,
      );
      return next;
    });
  }, []);

  // Update prize pool display in parent
  useEffect(() => {
    onPrizePoolChange(gs.prizePool);
  }, [gs.prizePool, onPrizePoolChange]);

  // Draw snakes and ladders on board mount
  useEffect(() => {
    const draw = () => {
      if (
        canvasRef.current &&
        boardRef.current &&
        boardRef.current.offsetWidth
      ) {
        drawSnakesAndLadders(canvasRef.current, boardRef.current);
      }
    };
    const timer = setTimeout(draw, 200);
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 250);
    };
    let resizeTimer: ReturnType<typeof setTimeout>;
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Redraw on component rerender (player count change etc.)
  useEffect(() => {
    const draw = () => {
      if (
        canvasRef.current &&
        boardRef.current &&
        boardRef.current.offsetWidth
      ) {
        drawSnakesAndLadders(canvasRef.current, boardRef.current);
      }
    };
    setTimeout(draw, 100);
  });

  const setPlayerCount = (count: number) => {
    if (gsRef.current.gameStarted && !gsRef.current.gameOver) {
      if (!confirm("Mengubah jumlah pemain akan mereset game. Lanjutkan?"))
        return;
    }
    setGs(createInitialGameState(count));
    setDiceValue(1);
    setDiceResult("Klik dadu untuk mulai");
    setLogs([
      {
        id: logIdRef.current++,
        text: `🎮 Game di-reset! ${count} pemain siap bermain.`,
        cls: "",
      },
    ]);
  };

  const updateGs = (updater: (prev: GameState) => GameState) => {
    setGs((prev) => {
      const next = updater(prev);
      return next;
    });
  };

  const rollDice = useCallback(() => {
    const current = gsRef.current;
    if (current.isRolling || current.gameOver) return;

    const idx = current.currentPlayer;

    // Player 1 needs wallet connected
    if (idx === 0 && !connected) {
      setDiceResult("⚠️ Hubungkan wallet dulu!");
      setVisible(true);
      return;
    }

    if (current.playerBalances[idx] < ROLL_COST) {
      setDiceResult(`❌ ${current.players[idx].name} saldo habis!`);
      addLog(`❌ ${current.players[idx].name} saldo SOL habis!`, "snake-log");
      // Switch player
      setGs((prev) => {
        const next = { ...prev };
        next.currentPlayer = (prev.currentPlayer + 1) % prev.players.length;
        return next;
      });
      return;
    }

    // Deduct balance
    const platformFee = ROLL_COST * PLATFORM_FEE_PERCENT;
    const toPool = ROLL_COST - platformFee;

    setGs((prev) => {
      const balances = [...prev.playerBalances];
      balances[idx] = Math.round((balances[idx] - ROLL_COST) * 1000) / 1000;
      const player = prev.players[idx];
      addLog(
        `💸 ${player.emoji} ${player.name} -${ROLL_COST} SOL → Prize Pool (Sisa: ${balances[idx].toFixed(3)} SOL)`,
      );
      return {
        ...prev,
        isRolling: true,
        gameStarted: true,
        playerBalances: balances,
        prizePool: Math.round((prev.prizePool + toPool) * 1000) / 1000,
        totalPlatformFees:
          Math.round((prev.totalPlatformFees + platformFee) * 1000) / 1000,
      };
    });

    setDiceRolling(true);

    // Rolling animation
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
    }, 80);

    setTimeout(() => {
      clearInterval(rollInterval);
      setDiceRolling(false);

      const snap = gsRef.current;
      const player = snap.players[snap.currentPlayer];
      let value: number;

      if (player.activeSkills.doubleDice) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        value = Math.min(d1 + d2, 6); // cap at 6 for display
        setDiceResult(
          `${player.emoji} ${player.name} lemparan ganda: ${d1} + ${d2} = ${d1 + d2}!`,
        );
        value = d1 + d2;
        setGs((prev) => {
          const players = prev.players.map((p, i) =>
            i === prev.currentPlayer
              ? { ...p, activeSkills: { ...p.activeSkills, doubleDice: false } }
              : p,
          );
          return { ...prev, players };
        });
      } else {
        value = Math.floor(Math.random() * 6) + 1;
        setDiceValue(value);
        setDiceResult(`${player.emoji} ${player.name} mendapat ${value}!`);
      }

      processMove(value);
    }, 700);
  }, [connected, addLog, setVisible]);

  const processMove = (diceVal: number) => {
    setGs((prev) => {
      const playerIdx = prev.currentPlayer;
      const player = prev.players[playerIdx];
      const oldPos = player.position === 0 ? 1 : player.position;
      let newPos = oldPos + diceVal;

      if (newPos > 100) {
        addLog(
          `${player.emoji} ${player.name} perlu angka tepat untuk mencapai 100!`,
        );
        // switch player
        const next = { ...prev, isRolling: false };
        next.currentPlayer = (prev.currentPlayer + 1) % prev.players.length;
        scheduleAI(next);
        return next;
      }

      addLog(`${player.emoji} ${player.name}: ${oldPos} → ${newPos}`);

      // Animate movement step by step then apply final pos
      animateAndSetPosition(playerIdx, oldPos, newPos, prev);

      return { ...prev }; // will be overwritten by animation
    });
  };

  const animateAndSetPosition = (
    playerIdx: number,
    from: number,
    to: number,
    prevGs: GameState,
  ) => {
    let current = from;
    const step = from < to ? 1 : -1;

    const moveStep = () => {
      if (current === to) {
        // Final position reached, check for snake/ladder
        applyFinalPosition(playerIdx, to, prevGs);
        return;
      }
      current += step;
      // Update token visually
      setGs((prev) => {
        const players = prev.players.map((p, i) =>
          i === playerIdx ? { ...p, position: current } : p,
        );
        return { ...prev, players };
      });
      setTimeout(moveStep, 120);
    };
    setTimeout(moveStep, 120);
  };

  const applyFinalPosition = (
    playerIdx: number,
    newPos: number,
    prevGs: GameState,
  ) => {
    setTimeout(() => {
      setGs((prev) => {
        const players = [...prev.players];
        let finalPos = newPos;
        let updatedPlayers = players.map((p, i) =>
          i === playerIdx ? { ...p, position: newPos } : p,
        );

        const player = players[playerIdx];
        const hasShield = player.activeSkills.shield;

        if (SNAKES[newPos] !== undefined) {
          if (hasShield) {
            addLog(
              `🛡️ Terlindungi! ${player.name} menahan serangan ular di petak ${newPos}!`,
              "ladder-log",
            );
            updatedPlayers = updatedPlayers.map((p, i) =>
              i === playerIdx
                ? { ...p, activeSkills: { ...p.activeSkills, shield: false } }
                : p,
            );
          } else {
            finalPos = SNAKES[newPos];
            addLog(
              `🐍 Ular! ${player.name} turun dari ${newPos} ke ${finalPos}!`,
              "snake-log",
            );
            updatedPlayers = updatedPlayers.map((p, i) =>
              i === playerIdx ? { ...p, position: finalPos } : p,
            );
          }
        } else if (LADDERS[newPos] !== undefined) {
          finalPos = LADDERS[newPos];
          addLog(
            `🪜 Tangga! ${player.name} naik dari ${newPos} ke ${finalPos}!`,
            "ladder-log",
          );
          updatedPlayers = updatedPlayers.map((p, i) =>
            i === playerIdx ? { ...p, position: finalPos } : p,
          );
        }

        // Check win
        if (finalPos >= 100) {
          addLog(`🏆 ${player.name} MENANG! Selamat! 🎉`, "win-log");
          return {
            ...prev,
            players: updatedPlayers,
            gameOver: true,
            isRolling: false,
          };
        }

        // Switch player
        const nextPlayer = (prev.currentPlayer + 1) % prev.players.length;
        const next = {
          ...prev,
          players: updatedPlayers,
          currentPlayer: nextPlayer,
          isRolling: false,
        };
        scheduleAI(next);
        return next;
      });
    }, 500);
  };

  const scheduleAI = (snap: GameState) => {
    if (snap.currentPlayer === 0 || snap.gameOver) return;
    const aiIdx = snap.currentPlayer;
    const delay = 1500 + Math.random() * 1000;
    setTimeout(() => {
      if (gsRef.current.gameOver) return;
      // AI buy skills
      aiProcessSkills(aiIdx);
      setTimeout(() => {
        const gs = gsRef.current;
        if (gs.gameOver) return;
        const player = gs.players[aiIdx];
        addLog(`🤖 ${player.emoji} ${player.name} melempar dadu...`);
        rollDice();
      }, 800);
    }, delay);
  };

  const aiProcessSkills = (aiIdx: number) => {
    setGs((prev) => {
      const ai = prev.players[aiIdx];
      const pos = ai.position;
      const bal = prev.playerBalances[aiIdx];
      let players = [...prev.players];
      let balances = [...prev.playerBalances];

      const snakesAhead = Object.keys(SNAKES)
        .map(Number)
        .filter((s) => s > pos && s <= pos + 6);

      if (
        snakesAhead.length > 0 &&
        bal >= SKILL_PRICES.shield &&
        !ai.activeSkills.shield
      ) {
        const biggestDrop = snakesAhead.reduce(
          (max, s) => Math.max(max, s - SNAKES[s]),
          0,
        );
        if (biggestDrop > 15 || Math.random() > 0.4) {
          balances[aiIdx] =
            Math.round((bal - SKILL_PRICES.shield) * 1000) / 1000;
          const skillName = "🛡️ Anti-Turun";
          addLog(
            `🛒 ${ai.emoji} ${ai.name} membeli ${skillName} (-${SKILL_PRICES.shield} SOL)`,
            "ladder-log",
          );
          players = players.map((p, i) =>
            i === aiIdx
              ? { ...p, activeSkills: { ...p.activeSkills, shield: true } }
              : p,
          );
          return { ...prev, players, playerBalances: balances };
        }
      }

      const leadPos = Math.max(...prev.players.map((p) => p.position));
      if (
        leadPos - pos > 20 &&
        bal >= SKILL_PRICES.doubleDice &&
        !ai.activeSkills.doubleDice
      ) {
        if (Math.random() > 0.5) {
          balances[aiIdx] =
            Math.round((bal - SKILL_PRICES.doubleDice) * 1000) / 1000;
          addLog(
            `🛒 ${ai.emoji} ${ai.name} membeli 🎲🎲 Dadu Ganda (-${SKILL_PRICES.doubleDice} SOL)`,
            "ladder-log",
          );
          players = players.map((p, i) =>
            i === aiIdx
              ? { ...p, activeSkills: { ...p.activeSkills, doubleDice: true } }
              : p,
          );
          return { ...prev, players, playerBalances: balances };
        }
      }
      return prev;
    });
  };

  const buySkill = (skillType: "shield" | "doubleDice") => {
    const snap = gsRef.current;
    if (snap.gameOver || snap.isRolling || snap.currentPlayer !== 0) return;
    const player = snap.players[0];
    const price = SKILL_PRICES[skillType];
    if (player.activeSkills[skillType]) {
      alert("Skill ini sudah aktif!");
      return;
    }
    if (snap.playerBalances[0] < price) {
      alert("Saldo SOL tidak cukup!");
      return;
    }
    const skillName =
      skillType === "shield" ? "🛡️ Anti-Turun" : "🎲🎲 Dadu Ganda";
    addLog(
      `🛒 ${player.emoji} ${player.name} membeli ${skillName} (-${price} SOL)`,
      "ladder-log",
    );
    setGs((prev) => {
      const balances = [...prev.playerBalances];
      balances[0] = Math.round((balances[0] - price) * 1000) / 1000;
      const players = prev.players.map((p, i) =>
        i === 0
          ? { ...p, activeSkills: { ...p.activeSkills, [skillType]: true } }
          : p,
      );
      return { ...prev, players, playerBalances: balances };
    });
  };

  const resetGame = () => {
    setGs(createInitialGameState(gs.playerCount));
    setDiceValue(1);
    setDiceResult("Klik dadu untuk mulai");
    setLogs([
      {
        id: logIdRef.current++,
        text: `🎮 Game di-reset! ${gs.playerCount} pemain siap bermain.`,
        cls: "",
      },
    ]);
  };

  // --- Board Generation ---
  const generateBoard = () => {
    const cells = [];
    const ROWS = 10,
      COLS = 10;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let cellNumber: number;
        if (row % 2 === 0) {
          cellNumber = (ROWS - row) * COLS - col;
        } else {
          cellNumber = (ROWS - row - 1) * COLS + col + 1;
        }

        let cellClass = `board-cell ${row % 2 === 0 ? "even-row" : "odd-row"}`;
        if (cellNumber === 100) cellClass += " cell-100";
        else if (cellNumber === 1) cellClass += " cell-1";
        if (SNAKES[cellNumber]) cellClass += " snake-head";
        else if (Object.values(SNAKES).includes(cellNumber))
          cellClass += " snake-tail";
        if (LADDERS[cellNumber]) cellClass += " ladder-bottom";
        else if (Object.values(LADDERS).includes(cellNumber))
          cellClass += " ladder-top";

        // Player tokens on this cell
        const tokensHere = gs.players
          .map((p, i) => ({ ...p, idx: i }))
          .filter((p) => (p.position === 0 ? 1 : p.position) === cellNumber);

        cells.push(
          <div
            className={cellClass}
            key={`cell-${cellNumber}`}
            id={`cell-${cellNumber}`}
            data-number={cellNumber}
          >
            <span className="cell-number">{cellNumber}</span>
            {cellNumber === 100 && <span className="cell-icon">🏆</span>}
            {cellNumber === 1 && <span className="cell-icon">🚀</span>}
            {SNAKES[cellNumber] && <span className="cell-icon">🐍</span>}
            {LADDERS[cellNumber] && <span className="cell-icon">🪜</span>}
            {tokensHere.map((p) => (
              <div
                key={`token-${p.idx}`}
                className={`player-token ${p.color} bounce`}
                style={{
                  bottom: TOKEN_OFFSETS[p.idx].bottom,
                  left: TOKEN_OFFSETS[p.idx].left,
                  right: TOKEN_OFFSETS[p.idx].right,
                  top: TOKEN_OFFSETS[p.idx].top,
                }}
              />
            ))}
          </div>,
        );
      }
    }
    return cells;
  };

  const p1 = gs.players[0];
  const isP1Turn = gs.currentPlayer === 0 && gs.gameStarted && !gs.gameOver;
  const canAffordShield = gs.playerBalances[0] >= SKILL_PRICES.shield;
  const canAffordDouble = gs.playerBalances[0] >= SKILL_PRICES.doubleDice;

  // Winner detection
  const winner = gs.gameOver ? gs.players.find((p) => p.position >= 100) : null;

  return (
    <section className="game-section" id="game">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">🎮 Play Now</span>
          <h2 className="section-title">
            Papan <span className="gradient-text">Ular Tangga</span>
          </h2>
          <p className="section-desc">
            Klik dadu untuk bermain! Hindari ular dan cari tangga menuju kotak
            100!
          </p>
        </div>

        <div className="game-wrapper">
          {/* Game Info Panel */}
          <div className="game-info-panel">
            {/* Player Count Selector */}
            <div className="player-count-selector">
              <div className="selector-label">👥 Jumlah Pemain</div>
              <div className="selector-buttons">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    className={`selector-btn${gs.playerCount === count ? " active" : ""}`}
                    onClick={() => setPlayerCount(count)}
                  >
                    {count} Pemain
                  </button>
                ))}
              </div>
            </div>

            {/* Player Cards */}
            <div className="player-info">
              {ALL_PLAYERS.slice(0, 4).map((pDef, i) => {
                const player = gs.players[i];
                const hidden = i >= gs.playerCount;
                const isActive = gs.currentPlayer === i;
                return (
                  <div
                    key={i}
                    className={`player-card${hidden ? " hidden-player" : ""}${isActive && !hidden ? " active" : ""}`}
                    id={`player${i + 1}Card`}
                  >
                    <div className="player-avatar">{pDef.emoji}</div>
                    <div className="player-details">
                      <span className="player-name">
                        {pDef.name}{" "}
                        {i === 0 ? (
                          <small style={{ color: "#06d6a0" }}>(You)</small>
                        ) : (
                          <small style={{ color: "#ffd60a" }}>🤖 AI</small>
                        )}
                      </span>
                      <span className="player-pos">
                        Position:{" "}
                        <strong id={`player${i + 1}Pos`}>
                          {player
                            ? player.position === 0
                              ? 1
                              : player.position
                            : 1}
                        </strong>
                      </span>
                      {player && (
                        <div
                          className="player-balance"
                          style={{
                            color:
                              gs.playerBalances[i] <= 0 ? "#f72585" : "#06d6a0",
                          }}
                        >
                          ◎ {gs.playerBalances[i].toFixed(3)} SOL
                        </div>
                      )}
                    </div>
                    {isActive && !hidden && (
                      <div className="player-turn-indicator">GILIRAN</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dice */}
            <div className="dice-container">
              <div className="dice-label">Lempar Dadu!</div>
              <div
                className={`dice${diceRolling ? " rolling" : ""}`}
                onClick={rollDice}
                id="dice"
              >
                <div
                  className="dice-face"
                  data-value={Math.min(diceValue, 6)}
                  id="diceFace"
                >
                  {Array.from({ length: Math.min(diceValue, 6) }).map(
                    (_, i) => (
                      <span className="dot" key={i} />
                    ),
                  )}
                </div>
              </div>
              <div className="dice-result" id="diceResult">
                {diceResult}
              </div>
            </div>

            {/* Game Log */}
            <div className="game-log">
              <div className="log-title">📜 Game Log</div>
              <div className="log-entries" id="gameLog">
                {logs.map((entry) => (
                  <div
                    key={entry.id}
                    className={`log-entry${entry.cls ? ` ${entry.cls}` : ""}`}
                  >
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Shop */}
            <div className="skill-shop">
              <div className="shop-title">🛒 Skill Shop (SOL)</div>
              <div className="shop-grid">
                <button
                  className={`skill-btn${p1?.activeSkills.shield ? " active" : ""}`}
                  id="btnShield"
                  onClick={() => buySkill("shield")}
                  disabled={
                    !isP1Turn ||
                    gs.isRolling ||
                    (!p1?.activeSkills.shield && !canAffordShield)
                  }
                  title="Hindari turun saat kena ular (Hanya 1x jalan)"
                >
                  <span className="skill-icon">🛡️</span>
                  <span className="skill-name">Anti-Turun</span>
                  <span className="skill-price">◎ 0.025 SOL</span>
                </button>
                <button
                  className={`skill-btn${p1?.activeSkills.doubleDice ? " active" : ""}`}
                  id="btnDoubleDice"
                  onClick={() => buySkill("doubleDice")}
                  disabled={
                    !isP1Turn ||
                    gs.isRolling ||
                    (!p1?.activeSkills.doubleDice && !canAffordDouble)
                  }
                  title="Lempar 2 dadu sekaligus (Hanya 1x jalan)"
                >
                  <span className="skill-icon">🎲🎲</span>
                  <span className="skill-name">Dadu Ganda</span>
                  <span className="skill-price">◎ 0.04 SOL</span>
                </button>
              </div>
            </div>

            {/* Game Controls */}
            <div className="game-controls">
              <button className="btn-reset" id="btnReset" onClick={resetGame}>
                🔄 Reset Game
              </button>
              <button
                className="btn-entry"
                id="btnEntry"
                onClick={connected ? undefined : () => setVisible(true)}
              >
                💰 P1 Saldo: {gs.playerBalances[0].toFixed(3)} SOL
              </button>
            </div>

            {/* Legend */}
            <div className="game-legend">
              <div className="legend-item">
                <span className="legend-color snake-color" /> Ular (Turun)
              </div>
              <div className="legend-item">
                <span className="legend-color ladder-color" /> Tangga (Naik)
              </div>
              <div className="legend-item">
                <span className="legend-dot p1" /> Player 1
              </div>
              <div className="legend-item">
                <span className="legend-dot p2" /> Player 2
              </div>
              {gs.playerCount >= 3 && (
                <div className="legend-item legend-p3">
                  <span className="legend-dot p3" /> Player 3
                </div>
              )}
              {gs.playerCount >= 4 && (
                <div className="legend-item legend-p4">
                  <span className="legend-dot p4" /> Player 4
                </div>
              )}
            </div>
          </div>

          {/* Game Board */}
          <div className="game-board-container">
            <div className="game-board" id="gameBoard" ref={boardRef}>
              {generateBoard()}
            </div>
            <canvas
              className="board-overlay"
              id="boardOverlay"
              ref={canvasRef}
            />
          </div>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="modal-overlay active" id="winnerModal">
            <div className="modal-card winner-modal">
              <div className="modal-icon">🏆</div>
              <h3 id="winnerText">
                {winner.emoji} {winner.name} Menang!
              </h3>
              <p>
                Selamat! Hadiah dari prize pool akan dikirim ke wallet Anda.
              </p>
              <div className="winner-prize">
                <span className="sol-icon">◎</span>
                <span id="winnerPrizeAmount">
                  {gs.prizePool.toFixed(3)} SOL
                </span>
              </div>
              <button className="btn-primary" onClick={resetGame}>
                🎉 Main Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
