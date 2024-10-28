// src/app/core/models/game.models.ts

export type Player = 'Player1' | 'Player2';

export interface iCell {
  row: number;
  col: number;
  occupiedBy: Player | null;
}

export interface iMove {
  id: number;
  gameId: string;
  player: Player;
  column: number;
  timestamp: Date;
}

export interface iGame {
  id: string;
  board: iCell[][];
  currentPlayer: Player;
  timer: number; // in seconds
  isGameOver: boolean;
  winner: Player | null;
  moves: iMove[];
}

export interface iApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
