// ===== Game Configuration =====
export const BOARD_SIZE = 100;
export const ROWS = 10;
export const COLS = 10;

// Roll cost per dice throw
export const ROLL_COST = 0.01;
export const PLATFORM_FEE_PERCENT = 0.1; // 10%
export const INITIAL_BALANCE = 2.0;

// Skill Prices
export const SKILL_PRICES = {
  shield: 0.025,
  doubleDice: 0.04,
};

// Snakes: head -> tail (turun)
export const SNAKES: Record<number, number> = {
  99: 78,
  95: 56,
  93: 73,
  87: 24,
  64: 60,
  62: 19,
  54: 34,
  17: 7,
  48: 26,
  31: 9,
};

// Ladders: bottom -> top (naik)
export const LADDERS: Record<number, number> = {
  2: 38,
  4: 14,
  8: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

export interface PlayerDef {
  name: string;
  color: string;
  emoji: string;
}

// All 4 player definitions
export const ALL_PLAYERS: PlayerDef[] = [
  { name: "Player 1", color: "p1", emoji: "🔴" },
  { name: "Player 2", color: "p2", emoji: "🔵" },
  { name: "Player 3", color: "p3", emoji: "🟢" },
  { name: "Player 4", color: "p4", emoji: "🟠" },
];

export interface PlayerState extends PlayerDef {
  position: number;
  activeSkills: { shield: boolean; doubleDice: boolean };
}

export interface GameState {
  playerCount: number;
  players: PlayerState[];
  currentPlayer: number;
  isRolling: boolean;
  gameStarted: boolean;
  gameOver: boolean;
  playerBalances: number[];
  prizePool: number;
  totalPlatformFees: number;
}

export function createInitialGameState(count: number): GameState {
  return {
    playerCount: count,
    players: ALL_PLAYERS.slice(0, count).map((p) => ({
      ...p,
      position: 0,
      activeSkills: { shield: false, doubleDice: false },
    })),
    currentPlayer: 0,
    isRolling: false,
    gameStarted: false,
    gameOver: false,
    playerBalances: [
      INITIAL_BALANCE,
      INITIAL_BALANCE,
      INITIAL_BALANCE,
      INITIAL_BALANCE,
    ],
    prizePool: 0,
    totalPlatformFees: 0,
  };
}
