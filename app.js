/* ========================================
   Snake Surge - Web3 Ular Tangga Game
   Game Logic, Dice, Phantom Wallet
   Supports 2-4 Players
   ======================================== */

// ===== Game Configuration =====
const BOARD_SIZE = 100;
const ROWS = 10;
const COLS = 10;

// Snakes: head -> tail (turun)
const SNAKES = {
    99: 78,
    95: 56,
    93: 73,
    87: 24,
    64: 60,
    62: 19,
    54: 34,
    17: 7,
    48: 26,
    31: 9
};

// Ladders: bottom -> top (naik)
const LADDERS = {
    2: 38,
    4: 14,
    8: 31,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    80: 100
};

// All 4 player definitions
const ALL_PLAYERS = [
    { name: 'Player 1', position: 0, color: 'p1', emoji: '🔴' },
    { name: 'Player 2', position: 0, color: 'p2', emoji: '🔵' },
    { name: 'Player 3', position: 0, color: 'p3', emoji: '🟢' },
    { name: 'Player 4', position: 0, color: 'p4', emoji: '🟠' }
];

// ===== Game State =====
// Simulated wallet address
const MOCK_WALLET_ADDRESS = '7xKX...q4Fp2nWrPBrRz9tHyZ...mV3d';
const MOCK_FULL_ADDRESS = '7xKXnR8Pq4Fp2nWrPBrRz9tHyZGmV3d';

// Roll cost per dice throw
const ROLL_COST = 0.01;
const PLATFORM_FEE_PERCENT = 0.1; // 10%
const INITIAL_BALANCE = 2.0;

// Skill Prices
const SKILL_PRICES = {
    shield: 0.025,
    doubleDice: 0.04
};

let gameState = {
    playerCount: 2,
    players: ALL_PLAYERS.slice(0, 2).map(p => ({ 
        ...p, 
        activeSkills: { shield: false, doubleDice: false } 
    })),
    currentPlayer: 0,
    isRolling: false,
    gameStarted: false,
    gameOver: false,
    walletConnected: false,
    walletAddress: null,
    walletBalance: 0,
    // Per-player balances
    playerBalances: [INITIAL_BALANCE, INITIAL_BALANCE, INITIAL_BALANCE, INITIAL_BALANCE],
    // Prize pool accumulates from dice rolls
    prizePool: 0,
    totalPlatformFees: 0
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    generateBoard();
    drawSnakesAndLadders();
    setupScrollEffects();
    setupNavScrollEffect();
    animateStats();
    setupRevealAnimations();
    updatePlayerVisibility();
    initPrizePoolDisplay();
});

// ===== Player Count Selector =====
function setPlayerCount(count) {
    if (gameState.gameStarted && !gameState.gameOver) {
        if (!confirm('Mengubah jumlah pemain akan mereset game. Lanjutkan?')) {
            return;
        }
    }

    gameState.playerCount = count;

    // Update selector buttons
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.count) === count);
    });

    // Reset and update players
    gameState.players = ALL_PLAYERS.slice(0, count).map(p => ({ 
        ...p, 
        activeSkills: { shield: false, doubleDice: false } 
    }));
    gameState.currentPlayer = 0;
    gameState.isRolling = false;
    gameState.gameStarted = false;
    gameState.gameOver = false;

    updatePlayerVisibility();
    updatePlayerInfo();
    placePlayerTokens();
    updateDiceFace(1);

    document.getElementById('diceResult').textContent = 'Klik dadu untuk mulai';
    document.getElementById('gameLog').innerHTML = '<div class="log-entry">🎮 Game di-reset! ' + count + ' pemain siap bermain. Klik dadu untuk memulai.</div>';

    document.querySelectorAll('.player-card').forEach(c => c.classList.remove('active'));
    document.getElementById('player1Card').classList.add('active');

    addLogEntry('👥 Jumlah pemain diubah menjadi ' + count + ' pemain');
}

function updatePlayerVisibility() {
    const count = gameState.playerCount;

    // Show/hide player cards
    const card3 = document.getElementById('player3Card');
    const card4 = document.getElementById('player4Card');

    if (card3) {
        card3.classList.toggle('hidden-player', count < 3);
    }
    if (card4) {
        card4.classList.toggle('hidden-player', count < 4);
    }

    // Show/hide legend items
    const legendP3 = document.querySelector('.legend-p3');
    const legendP4 = document.querySelector('.legend-p4');
    if (legendP3) legendP3.style.display = count >= 3 ? 'flex' : 'none';
    if (legendP4) legendP4.style.display = count >= 4 ? 'flex' : 'none';
}

// ===== Background Particles =====
function createParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['#8b5cf6', '#06d6a0', '#f72585', '#4cc9f0', '#ffd60a'];
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (8 + Math.random() * 15) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ===== Generate Game Board =====
function generateBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    // Generate cells in correct order (100 at top-left, 1 at bottom-right pattern)
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const actualRow = row;
            let cellNumber;

            // Zigzag pattern
            if (actualRow % 2 === 0) {
                // Even rows (from top): right to left
                cellNumber = (ROWS - actualRow) * COLS - col;
            } else {
                // Odd rows (from top): left to right
                cellNumber = (ROWS - actualRow - 1) * COLS + col + 1;
            }

            const cell = document.createElement('div');
            cell.className = `board-cell ${actualRow % 2 === 0 ? 'even-row' : 'odd-row'}`;
            cell.id = `cell-${cellNumber}`;
            cell.dataset.number = cellNumber;

            // Number label
            const numLabel = document.createElement('span');
            numLabel.className = 'cell-number';
            numLabel.textContent = cellNumber;
            cell.appendChild(numLabel);

            // Special cells
            if (cellNumber === 100) {
                cell.classList.add('cell-100');
                const icon = document.createElement('span');
                icon.className = 'cell-icon';
                icon.textContent = '🏆';
                cell.appendChild(icon);
            } else if (cellNumber === 1) {
                cell.classList.add('cell-1');
                const icon = document.createElement('span');
                icon.className = 'cell-icon';
                icon.textContent = '🚀';
                cell.appendChild(icon);
            }

            // Snake heads
            if (SNAKES[cellNumber]) {
                cell.classList.add('snake-head');
                const icon = document.createElement('span');
                icon.className = 'cell-icon';
                icon.textContent = '🐍';
                cell.appendChild(icon);
            }

            // Snake tails
            if (Object.values(SNAKES).includes(cellNumber)) {
                cell.classList.add('snake-tail');
            }

            // Ladder bottoms
            if (LADDERS[cellNumber]) {
                cell.classList.add('ladder-bottom');
                const icon = document.createElement('span');
                icon.className = 'cell-icon';
                icon.textContent = '🪜';
                cell.appendChild(icon);
            }

            // Ladder tops
            if (Object.values(LADDERS).includes(cellNumber)) {
                cell.classList.add('ladder-top');
            }

            board.appendChild(cell);
        }
    }

    // Place initial player tokens
    placePlayerTokens();
}

// ===== Draw Snakes and Ladders on Canvas =====
function drawSnakesAndLadders() {
    const canvas = document.getElementById('boardOverlay');
    const board = document.getElementById('gameBoard');

    if (!board.offsetWidth) {
        requestAnimationFrame(drawSnakesAndLadders);
        return;
    }

    canvas.width = board.offsetWidth;
    canvas.height = board.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellWidth = board.offsetWidth / COLS;
    const cellHeight = board.offsetHeight / ROWS;

    // Draw Ladders
    Object.entries(LADDERS).forEach(([from, to]) => {
        const fromPos = getCellCenter(parseInt(from), cellWidth, cellHeight);
        const toPos = getCellCenter(parseInt(to), cellWidth, cellHeight);

        // Ladder rails
        const offsetX = cellWidth * 0.15;

        ctx.strokeStyle = 'rgba(6, 214, 160, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);

        // Left rail
        ctx.beginPath();
        ctx.moveTo(fromPos.x - offsetX, fromPos.y);
        ctx.lineTo(toPos.x - offsetX, toPos.y);
        ctx.stroke();

        // Right rail
        ctx.beginPath();
        ctx.moveTo(fromPos.x + offsetX, fromPos.y);
        ctx.lineTo(toPos.x + offsetX, toPos.y);
        ctx.stroke();

        // Rungs
        const steps = 4;
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const rx = fromPos.x + (toPos.x - fromPos.x) * t;
            const ry = fromPos.y + (toPos.y - fromPos.y) * t;

            ctx.beginPath();
            ctx.moveTo(rx - offsetX, ry);
            ctx.lineTo(rx + offsetX, ry);
            ctx.stroke();
        }

        // Glow effect
        ctx.shadowColor = 'rgba(6, 214, 160, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    });

    // Draw Snakes
    Object.entries(SNAKES).forEach(([from, to]) => {
        const fromPos = getCellCenter(parseInt(from), cellWidth, cellHeight);
        const toPos = getCellCenter(parseInt(to), cellWidth, cellHeight);

        // Snake body (curved line)
        ctx.strokeStyle = 'rgba(247, 37, 133, 0.5)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.setLineDash([]);

        const midX = (fromPos.x + toPos.x) / 2 + (Math.random() - 0.5) * cellWidth * 1.5;
        const midY = (fromPos.y + toPos.y) / 2;

        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.quadraticCurveTo(midX, midY, toPos.x, toPos.y);
        ctx.stroke();

        // Snake head dot
        ctx.fillStyle = 'rgba(247, 37, 133, 0.8)';
        ctx.beginPath();
        ctx.arc(fromPos.x, fromPos.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Snake tail dot
        ctx.fillStyle = 'rgba(247, 37, 133, 0.5)';
        ctx.beginPath();
        ctx.arc(toPos.x, toPos.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function getCellCenter(cellNumber, cellWidth, cellHeight) {
    // Convert cell number to grid position
    const row = Math.ceil(cellNumber / COLS);
    const isEvenRow = row % 2 === 0;

    let col;
    if (isEvenRow) {
        col = COLS - ((cellNumber - 1) % COLS);
    } else {
        col = ((cellNumber - 1) % COLS) + 1;
    }

    // Convert to pixel position (row 1 is at bottom)
    const pixelX = (col - 0.5) * cellWidth;
    const pixelY = (ROWS - row + 0.5) * cellHeight;

    return { x: pixelX, y: pixelY };
}

// ===== Player Token Placement =====
// Token offset positions for up to 4 players in same cell
const TOKEN_OFFSETS = [
    { bottom: '2px', left: '2px', right: 'auto', top: 'auto' },     // P1: bottom-left
    { bottom: '2px', right: '2px', left: 'auto', top: 'auto' },     // P2: bottom-right
    { top: '2px', left: '2px', bottom: 'auto', right: 'auto' },     // P3: top-left
    { top: '2px', right: '2px', bottom: 'auto', left: 'auto' }      // P4: top-right
];

function placePlayerTokens() {
    // Remove existing tokens
    document.querySelectorAll('.player-token').forEach(t => t.remove());

    gameState.players.forEach((player, index) => {
        const pos = player.position === 0 ? 1 : player.position;
        const cell = document.getElementById(`cell-${pos}`);
        if (cell) {
            const token = document.createElement('div');
            token.className = `player-token ${player.color}`;
            token.id = `token-${index}`;

            // Apply position offsets
            const offset = TOKEN_OFFSETS[index];
            token.style.bottom = offset.bottom;
            token.style.left = offset.left;
            token.style.right = offset.right;
            token.style.top = offset.top;

            cell.appendChild(token);
        }
    });
}

function moveToken(playerIndex, newPosition) {
    const token = document.getElementById(`token-${playerIndex}`);
    if (token) token.remove();

    const pos = newPosition === 0 ? 1 : newPosition;
    const cell = document.getElementById(`cell-${pos}`);
    if (cell) {
        const token = document.createElement('div');
        token.className = `player-token ${gameState.players[playerIndex].color} bounce`;
        token.id = `token-${playerIndex}`;

        // Apply position offsets
        const offset = TOKEN_OFFSETS[playerIndex];
        token.style.bottom = offset.bottom;
        token.style.left = offset.left;
        token.style.right = offset.right;
        token.style.top = offset.top;

        cell.appendChild(token);

        // Remove bounce animation after it plays
        setTimeout(() => {
            token.classList.remove('bounce');
        }, 500);
    }
}

// ===== Dice =====
function rollDice() {
    if (gameState.isRolling || gameState.gameOver) return;

    const currentIdx = gameState.currentPlayer;

    // Only Player 1 needs wallet connected
    if (currentIdx === 0 && !gameState.walletConnected) {
        const diceResult = document.getElementById('diceResult');
        diceResult.textContent = '⚠️ Hubungkan wallet dulu!';
        diceResult.style.color = '#ffd60a';
        setTimeout(() => { diceResult.style.color = ''; }, 2000);
        return;
    }

    // Check current player's balance
    if (gameState.playerBalances[currentIdx] < ROLL_COST) {
        const diceResult = document.getElementById('diceResult');
        const player = gameState.players[currentIdx];
        diceResult.textContent = `❌ ${player.name} saldo habis!`;
        diceResult.style.color = '#f72585';
        setTimeout(() => { diceResult.style.color = ''; }, 2000);
        addLogEntry(`❌ ${player.name} saldo SOL habis!`, 'snake-log');
        // Skip to next player
        gameState.isRolling = false;
        switchPlayer();
        return;
    }

    // Deduct balance from current player
    const platformFee = ROLL_COST * PLATFORM_FEE_PERCENT;
    const toPool = ROLL_COST - platformFee;
    
    gameState.playerBalances[currentIdx] -= ROLL_COST;
    gameState.playerBalances[currentIdx] = Math.round(gameState.playerBalances[currentIdx] * 1000) / 1000;
    
    gameState.prizePool += toPool;
    gameState.prizePool = Math.round(gameState.prizePool * 1000) / 1000;
    
    gameState.totalPlatformFees += platformFee;
    gameState.totalPlatformFees = Math.round(gameState.totalPlatformFees * 1000) / 1000;

    // Update Player 1's wallet balance in sync
    if (currentIdx === 0) {
        gameState.walletBalance = gameState.playerBalances[0];
    }

    const player = gameState.players[currentIdx];
    addLogEntry(`💸 ${player.emoji} ${player.name} -${ROLL_COST} SOL → Prize Pool (Sisa: ${gameState.playerBalances[currentIdx].toFixed(3)} SOL)`);
    updateWalletDisplay();
    updatePrizePoolDisplay();
    updatePlayerBalancesUI();

    gameState.isRolling = true;
    if (!gameState.gameStarted) gameState.gameStarted = true;

    const dice = document.getElementById('dice');
    const diceResult = document.getElementById('diceResult');
    dice.classList.add('rolling');

    // Rolling animation with changing values
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        const tempValue = Math.floor(Math.random() * 6) + 1;
        updateDiceFace(tempValue);
        rollCount++;
    }, 80);

    setTimeout(() => {
        clearInterval(rollInterval);

        const isDouble = gameState.players[currentIdx].activeSkills.doubleDice;
        let value;
        if (isDouble) {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            value = d1 + d2;
            diceResult.textContent = `${player.emoji} ${player.name} lemparan ganda: ${d1} + ${d2} = ${value}!`;
            updateDiceFace(value); // This might look weird for >6 but okay for now
            // Reset skill
            gameState.players[currentIdx].activeSkills.doubleDice = false;
            updateSkillButtons();
        } else {
            value = Math.floor(Math.random() * 6) + 1;
            updateDiceFace(value);
            diceResult.textContent = `${player.emoji} ${player.name} mendapat ${value}!`;
        }

        dice.classList.remove('rolling');

        // Process move
        processMove(value);
    }, 700);
}

function updateDiceFace(value) {
    const diceFace = document.getElementById('diceFace');
    diceFace.innerHTML = '';
    diceFace.setAttribute('data-value', value);

    for (let i = 0; i < value; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        diceFace.appendChild(dot);
    }
}

// ===== Process Move =====
function processMove(diceValue) {
    const playerIndex = gameState.currentPlayer;
    const player = gameState.players[playerIndex];
    const oldPos = player.position === 0 ? 1 : player.position;
    let newPos = oldPos + diceValue;

    // Can't go beyond 100
    if (newPos > 100) {
        addLogEntry(`${player.emoji} ${player.name} perlu angka tepat untuk mencapai 100!`);
        gameState.isRolling = false;
        switchPlayer();
        return;
    }

    // Move to new position
    addLogEntry(`${player.emoji} ${player.name}: ${oldPos} → ${newPos}`);

    // Animate step by step
    animateMovement(playerIndex, oldPos, newPos, () => {
        player.position = newPos;

        // Check for snake
        if (SNAKES[newPos]) {
            const hasShield = gameState.players[playerIndex].activeSkills.shield;
            const snakeDest = SNAKES[newPos];
            
            setTimeout(() => {
                if (hasShield) {
                    addLogEntry(`🛡️ Terlindungi! ${player.name} menahan serangan ular di petak ${newPos}!`, 'ladder-log');
                    // Reset skill
                    gameState.players[playerIndex].activeSkills.shield = false;
                    updateSkillButtons();
                    checkWin(playerIndex);
                } else {
                    addLogEntry(`🐍 Ular! ${player.name} turun dari ${newPos} ke ${snakeDest}!`, 'snake-log');
                    player.position = snakeDest;
                    moveToken(playerIndex, snakeDest);
                    updatePlayerInfo();
                    checkWin(playerIndex);
                }
            }, 500);
        }
        // Check for ladder
        else if (LADDERS[newPos]) {
            const ladderDest = LADDERS[newPos];
            setTimeout(() => {
                addLogEntry(`🪜 Tangga! ${player.name} naik dari ${newPos} ke ${ladderDest}!`, 'ladder-log');
                player.position = ladderDest;
                moveToken(playerIndex, ladderDest);
                updatePlayerInfo();
                checkWin(playerIndex);
            }, 500);
        }
        else {
            checkWin(playerIndex);
        }

        updatePlayerInfo();

        setTimeout(() => {
            gameState.isRolling = false;
            if (!gameState.gameOver) {
                switchPlayer();
            }
        }, 800);
    });
}

function animateMovement(playerIndex, from, to, callback) {
    let current = from;
    const step = from < to ? 1 : -1;

    function moveStep() {
        if (current === to) {
            callback();
            return;
        }
        current += step;
        moveToken(playerIndex, current);

        setTimeout(moveStep, 120);
    }

    moveStep();
}

function switchPlayer() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;

    // Update active player card
    document.querySelectorAll('.player-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.getElementById(`player${gameState.currentPlayer + 1}Card`);
    if (activeCard) activeCard.classList.add('active');

    // If current player is AI (Player 2, 3, or 4), auto-roll after delay
    if (gameState.currentPlayer > 0 && !gameState.gameOver) {
        const aiPlayer = gameState.players[gameState.currentPlayer];
        const delay = 1500 + Math.random() * 1000; // 1.5-2.5s delay for natural feel
        
        setTimeout(() => {
            if (!gameState.gameOver) {
                // AI Decision Making (Smart Buy)
                aiProcessSkills(gameState.currentPlayer);
                
                setTimeout(() => {
                    if (!gameState.gameOver) {
                        addLogEntry(`🤖 ${aiPlayer.emoji} ${aiPlayer.name} melempar dadu...`);
                        rollDice();
                    }
                }, 800);
            }
        }, delay);
    }
    
    updateSkillButtons();
}

// ===== AI Smart Logic =====
function aiProcessSkills(aiIdx) {
    const ai = gameState.players[aiIdx];
    const pos = ai.position;
    const bal = gameState.playerBalances[aiIdx];
    
    // Logic 1: Buy Shield if near a lethal snake (1-6 tiles ahead)
    const snakesAhead = Object.keys(SNAKES).map(Number).filter(s => s > pos && s <= pos + 6);
    if (snakesAhead.length > 0 && bal >= SKILL_PRICES.shield && !ai.activeSkills.shield) {
        // Higher probability to buy if it's a "big" drop
        const biggestDrop = snakesAhead.reduce((max, s) => Math.max(max, s - SNAKES[s]), 0);
        if (biggestDrop > 15 || Math.random() > 0.4) {
            buySkill('shield', aiIdx);
            return;
        }
    }
    
    // Logic 2: Buy Double Dice if trailing far behind leader
    const leadPos = Math.max(...gameState.players.map(p => p.position));
    if (leadPos - pos > 20 && bal >= SKILL_PRICES.doubleDice && !ai.activeSkills.doubleDice) {
        if (Math.random() > 0.5) {
            buySkill('doubleDice', aiIdx);
            return;
        }
    }
}

// ===== Skill Management =====
function buySkill(skillType, playerIdx = gameState.currentPlayer) {
    if (gameState.gameOver || (playerIdx === 0 && gameState.isRolling)) return;
    
    const player = gameState.players[playerIdx];
    const price = SKILL_PRICES[skillType];
    
    if (player.activeSkills[skillType]) {
        if (playerIdx === 0) alert('Skill ini sudah aktif untuk giliran ini!');
        return;
    }
    
    if (gameState.playerBalances[playerIdx] < price) {
        if (playerIdx === 0) alert('Saldo SOL tidak cukup untuk membeli skill ini!');
        return;
    }
    
    // Deduct SOL
    gameState.playerBalances[playerIdx] -= price;
    gameState.playerBalances[playerIdx] = Math.round(gameState.playerBalances[playerIdx] * 1000) / 1000;
    
    // Add to platform fees (revenue)
    gameState.totalPlatformFees += price;
    gameState.totalPlatformFees = Math.round(gameState.totalPlatformFees * 1000) / 1000;
    
    // Activate skill
    player.activeSkills[skillType] = true;
    
    const skillName = skillType === 'shield' ? '🛡️ Anti-Turun' : '🎲🎲 Dadu Ganda';
    addLogEntry(`🛒 ${player.emoji} ${player.name} membeli ${skillName} (-${price} SOL)`, 'ladder-log');
    
    updateWalletDisplay();
    updatePlayerBalancesUI();
    updateSkillButtons();
}

function updateSkillButtons() {
    const p1 = gameState.players[0];
    const shieldBtn = document.getElementById('btnShield');
    const doubleBtn = document.getElementById('btnDoubleDice');
    
    if (!shieldBtn || !doubleBtn) return;
    
    // Toggle active classes
    shieldBtn.classList.toggle('active', p1.activeSkills.shield);
    doubleBtn.classList.toggle('active', p1.activeSkills.doubleDice);
    
    // Disable if not player 1 turn or rolling or balance low
    const isP1Turn = gameState.currentPlayer === 0 && gameState.gameStarted && !gameState.gameOver;
    const canAffordShield = gameState.playerBalances[0] >= SKILL_PRICES.shield;
    const canAffordDouble = gameState.playerBalances[0] >= SKILL_PRICES.doubleDice;
    
    shieldBtn.disabled = !isP1Turn || gameState.isRolling || (!p1.activeSkills.shield && !canAffordShield);
    doubleBtn.disabled = !isP1Turn || gameState.isRolling || (!p1.activeSkills.doubleDice && !canAffordDouble);
}

function updatePlayerInfo() {
    gameState.players.forEach((player, index) => {
        const posEl = document.getElementById(`player${index + 1}Pos`);
        if (posEl) {
            posEl.textContent = player.position === 0 ? 1 : player.position;
        }
    });
}

function checkWin(playerIndex) {
    if (gameState.players[playerIndex].position >= 100) {
        gameState.gameOver = true;
        const player = gameState.players[playerIndex];
        addLogEntry(`🏆 ${player.name} MENANG! Selamat! 🎉`, 'win-log');

        // Show winner modal
        setTimeout(() => {
            showWinnerModal(player);
        }, 1000);
    }
}

// ===== Game Log =====
function addLogEntry(text, className = '') {
    const log = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    entry.textContent = text;
    log.insertBefore(entry, log.firstChild);

    // Keep max 50 entries
    while (log.children.length > 50) {
        log.removeChild(log.lastChild);
    }
}

// ===== Reset Game =====
function resetGame() {
    gameState.players = ALL_PLAYERS.slice(0, gameState.playerCount).map(p => ({ 
        ...p, 
        activeSkills: { shield: false, doubleDice: false } 
    }));
    gameState.currentPlayer = 0;
    gameState.isRolling = false;
    gameState.gameStarted = false;
    gameState.gameOver = false;

    // Reset all player balances
    gameState.playerBalances = [INITIAL_BALANCE, INITIAL_BALANCE, INITIAL_BALANCE, INITIAL_BALANCE];
    gameState.prizePool = 0;
    if (gameState.walletConnected) {
        gameState.walletBalance = INITIAL_BALANCE;
    }

    // Reset UI
    updatePlayerInfo();
    placePlayerTokens();
    updateDiceFace(1);
    updateWalletDisplay();
    updatePrizePoolDisplay();
    updatePlayerBalancesUI();

    document.getElementById('diceResult').textContent = 'Klik dadu untuk mulai';
    document.getElementById('gameLog').innerHTML = '<div class="log-entry">🎮 Game di-reset! Semua pemain punya 2.000 SOL. Klik dadu untuk memulai.</div>';

    document.querySelectorAll('.player-card').forEach(c => c.classList.remove('active'));
    document.getElementById('player1Card').classList.add('active');
}

// ===== Simulated Wallet Integration =====

function connectPhantomWallet() {
    if (gameState.walletConnected) {
        // Already connected, show info
        showWalletInfo();
        return;
    }

    const modal = document.getElementById('walletModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalWalletInfo = document.getElementById('modalWalletInfo');
    const modalBtn = document.getElementById('modalBtn');

    modal.classList.add('active');
    modalWalletInfo.style.display = 'none';
    modalMessage.textContent = '🔍 Menghubungkan ke Phantom Wallet...';
    modalBtn.style.display = 'none';

    // Simulate connection delay
    setTimeout(() => {
        gameState.walletConnected = true;
        gameState.walletAddress = MOCK_FULL_ADDRESS;
        gameState.walletBalance = 2.0;

        // Update navbar button
        const btnText = document.getElementById('walletBtnText');
        if (btnText) {
            btnText.textContent = '7xKX...mV3d';
        }

        const connectBtn = document.getElementById('btnConnectWallet');
        if (connectBtn) {
            connectBtn.classList.add('connected');
        }

        // Show wallet info in modal
        modalBtn.style.display = '';
        modalMessage.textContent = 'Wallet berhasil terhubung! 🎉';
        modalWalletInfo.style.display = 'block';
        document.getElementById('modalWalletAddress').textContent = MOCK_FULL_ADDRESS;
        document.getElementById('modalWalletBalance').textContent = '💰 Saldo: 2.000 SOL';

        modalBtn.textContent = 'Mulai Bermain! 🎲';
        modalBtn.onclick = () => {
            closeWalletModal();
            document.getElementById('game').scrollIntoView({ behavior: 'smooth' });
        };

        updateWalletDisplay();
        addLogEntry('👻 Phantom Wallet terhubung! Saldo: 2.000 SOL', 'ladder-log');
    }, 1200);
}

function showWalletInfo() {
    const modal = document.getElementById('walletModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalWalletInfo = document.getElementById('modalWalletInfo');
    const modalBtn = document.getElementById('modalBtn');

    modal.classList.add('active');
    modalMessage.textContent = 'Wallet terhubung ✅';
    modalWalletInfo.style.display = 'block';
    document.getElementById('modalWalletAddress').textContent = gameState.walletAddress;
    document.getElementById('modalWalletBalance').textContent = `💰 Saldo: ${gameState.walletBalance.toFixed(3)} SOL`;
    modalBtn.textContent = 'Tutup';
    modalBtn.onclick = closeWalletModal;
}

function updateWalletDisplay() {
    // Update the entry button to show Player 1 balance
    const btnEntry = document.getElementById('btnEntry');
    if (btnEntry) {
        btnEntry.innerHTML = `💰 P1 Saldo: ${gameState.playerBalances[0].toFixed(3)} SOL`;
    }

    // Update modal balance if visible
    const modalBalance = document.getElementById('modalWalletBalance');
    if (modalBalance && gameState.walletConnected) {
        modalBalance.textContent = `💰 Saldo: ${gameState.playerBalances[0].toFixed(3)} SOL`;
    }

    // Update navbar button color based on balance
    const connectBtn = document.getElementById('btnConnectWallet');
    if (connectBtn && gameState.walletConnected) {
        if (gameState.playerBalances[0] <= 0) {
            connectBtn.style.borderColor = '#f72585';
        } else {
            connectBtn.style.borderColor = '';
        }
    }
}

// ===== Prize Pool Display =====
function initPrizePoolDisplay() {
    // Set prize pool to 0 on start
    const prizeEl = document.getElementById('prizePoolValue');
    if (prizeEl) prizeEl.textContent = '0.000';
    const usdEl = document.getElementById('prizeUSD');
    if (usdEl) usdEl.textContent = '≈ $0.00 USD';
}

function updatePrizePoolDisplay() {
    const prizeEl = document.getElementById('prizePoolValue');
    if (prizeEl) {
        prizeEl.textContent = gameState.prizePool.toFixed(3);
    }
    const usdEl = document.getElementById('prizeUSD');
    if (usdEl) {
        usdEl.textContent = `≈ $${(gameState.prizePool * 150).toFixed(2)} USD`;
    }
}

// ===== Player Balances UI =====
function updatePlayerBalancesUI() {
    // Update each player card to show their balance
    gameState.players.forEach((player, index) => {
        const card = document.getElementById(`player${index + 1}Card`);
        if (!card) return;

        let balEl = card.querySelector('.player-balance');
        if (!balEl) {
            balEl = document.createElement('div');
            balEl.className = 'player-balance';
            card.querySelector('.player-details').appendChild(balEl);
        }
        balEl.textContent = `◎ ${gameState.playerBalances[index].toFixed(3)} SOL`;
        balEl.style.color = gameState.playerBalances[index] <= 0 ? '#f72585' : '#06d6a0';
    });
}

function shortenAddress(address) {
    return address.slice(0, 4) + '...' + address.slice(-4);
}

function closeWalletModal() {
    document.getElementById('walletModal').classList.remove('active');
}

// ===== Enter Game (shows wallet info or connects) =====
function enterGame() {
    if (!gameState.walletConnected) {
        connectPhantomWallet();
        return;
    }
    showWalletInfo();
}

// ===== Winner Modal =====
function showWinnerModal(player) {
    const modal = document.getElementById('winnerModal');
    const winnerText = document.getElementById('winnerText');
    winnerText.textContent = `${player.emoji} ${player.name} Menang!`;

    // Update winner prize display with actual prize pool (100% to winner)
    const winnerPrizeEl = document.getElementById('winnerPrizeAmount');
    if (winnerPrizeEl) {
        winnerPrizeEl.textContent = `${gameState.prizePool.toFixed(3)} SOL`;
    }

    // Create confetti
    createConfetti();

    modal.classList.add('active');
}

function closeWinnerModal() {
    document.getElementById('winnerModal').classList.remove('active');
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    const colors = ['#8b5cf6', '#06d6a0', '#f72585', '#ffd60a', '#4cc9f0', '#ff6b35'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        confetti.style.width = (5 + Math.random() * 10) + 'px';
        confetti.style.height = (5 + Math.random() * 10) + 'px';
        container.appendChild(confetti);
    }
}

// ===== Mobile Nav Toggle =====
function toggleMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// ===== Scroll Effects =====
function setupNavScrollEffect() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function setupScrollEffects() {
    // Close mobile nav on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.remove('active');
        });
    });
}

// ===== Scroll Reveal Animations =====
function setupRevealAnimations() {
    const revealElements = document.querySelectorAll(
        '.step-card, .feature-card, .pf-card, .prize-pool-card, .cta-card'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// ===== Animate Stats =====
function animateStats() {
    const stats = [
        { id: 'statPlayers', end: 2847, prefix: '', suffix: '' },
        { id: 'statGames', end: 12493, prefix: '', suffix: '' },
    ];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        if (!el) return;

        let current = 0;
        const duration = 2000;
        const increment = stat.end / (duration / 16);

        const timer = setInterval(() => {
            current += increment;
            if (current >= stat.end) {
                current = stat.end;
                clearInterval(timer);
            }
            el.textContent = stat.prefix + Math.floor(current).toLocaleString() + stat.suffix;
        }, 16);
    });
}

// ===== Redraw canvas on resize =====
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        drawSnakesAndLadders();
    }, 250);
});

// ===== Prize Pool Animation removed (using real prize pool from game) =====

// ===== Keyboard Support =====
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        rollDice();
    }
});

// ===== Auto-connect removed (using simulated wallet) =====
