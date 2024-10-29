
// export type Player = 'Player1' | 'Player2';

export interface iCell {
  row: number;
  col: number;
  occupiedBy: string | null;
}

export interface iMove {
  id: number;
  gameId: string;
  player: string;
  column: number;
  timestamp: Date;
}

export interface iPlayers {
  player1: string,
  player2: string
}

export interface iGame {
  id: string;
  board: iCell[][];
  players: iPlayers
  currentPlayer: string;
  timer: number;
  isGameOver: boolean;
  winner: string | null;
  moves: iMove[];
}

