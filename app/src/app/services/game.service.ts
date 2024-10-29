// src/app/core/services/game.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { iCell, iGame, iMove, Player } from '../interfaces/game';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private initialRows: number = 6;
  private initialCols: number = 7;
  private initialTimer: number = 30;

  private gameStateSubject = new BehaviorSubject<iGame | null>(null);
  gameState$ = this.gameStateSubject.asObservable();

  constructor(private apiService: ApiService) {
  }

  private createEmptyBoard(): iCell[][] {
    const board: iCell[][] = [];
    for (let row = 0; row < this.initialRows; row++) {
      const currentRow: iCell[] = [];
      for (let col = 0; col < this.initialCols; col++) {
        currentRow.push({ row, col, occupiedBy: null });
      }
      board.push(currentRow);
    }
    return board;
  }

  loadGame(gameId: number): void {
    this.apiService.get<iGame>(`${gameId}`).subscribe({
      next: (response: iGame) => {
        if (response) {
          this.gameStateSubject.next(response);
        } else {
          // Se la partita non esiste, creane una nuova
          this.createGame();
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento della partita:', error);
      }
    });
  }

  createGame(): void {
    const newGame: Partial<iGame> = {
      board: this.createEmptyBoard(),
      currentPlayer: 'Player1',
      timer: this.initialTimer,
      isGameOver: false,
      winner: null,
      moves: [],
    };
    this.apiService.post<iGame>(newGame).subscribe({
      next: (response: iGame) => {
        if (response) {
          this.gameStateSubject.next(response);
        }
      },
      error: (error) => {
        console.error('Errore nella creazione della partita:', error);
      }
    });
  }

  makeMove(col: number): void {
    const state = this.gameStateSubject.value;
    if (!state || state.isGameOver) {
      return;
    }

    // Trova la prima cella libera dalla base
    for (let row = this.initialRows - 1; row >= 0; row--) {
      if (!state.board[row][col].occupiedBy) {
        const updatedBoard = state.board.map(r => r.map(c => ({ ...c })));
        updatedBoard[row][col].occupiedBy = state.currentPlayer;

        const newMove: iMove = {
          id: state.moves.length + 1,
          gameId: state.id,
          player: state.currentPlayer,
          column: col,
          timestamp: new Date()
        };

        const updatedMoves = [...state.moves, newMove];
        let isGameOver = false;
        let winner: Player | null = null;

        // Controlla se il movimento ha portato a una vittoria
        if (this.checkWin(updatedBoard, row, col, state.currentPlayer)) {
          isGameOver = true;
          winner = state.currentPlayer;
        } else if (this.isBoardFull(updatedBoard)) {
          isGameOver = true;
          winner = null; // Pareggio
        }

        const nextPlayer: Player = state.currentPlayer === 'Player1' ? 'Player2' : 'Player1';

        const updatedGame: iGame = {
          ...state,
          board: updatedBoard,
          currentPlayer: nextPlayer,
          timer: this.initialTimer,
          isGameOver,
          winner,
          moves: updatedMoves
        };

        // Aggiorna lo stato del gioco nell'API
        this.apiService.put<iGame>(`games/${state.id}`, updatedGame).subscribe({
          next: (response: iGame) => {
            if (response) {
              this.gameStateSubject.next(response);
            }
          },
          error: (error) => {
            console.error('Errore nell\'aggiornamento della partita:', error);
          }
        });

        return;
      }
    }

    // Se la colonna è piena, puoi mostrare un messaggio o gestire l'errore
    console.warn('Colonna piena. Scegli un\'altra colonna.');
  }

  private isBoardFull(board: iCell[][]): boolean {
    return board[0].every(cell => cell.occupiedBy !== null);
  }

  private checkWin(board: iCell[][], row: number, col: number, player: Player): boolean {
    return (
      this.checkDirection(board, row, col, player, 0, 1) || // Orizzontale
      this.checkDirection(board, row, col, player, 1, 0) || // Verticale
      this.checkDirection(board, row, col, player, 1, 1) || // Diagonale positiva
      this.checkDirection(board, row, col, player, 1, -1)   // Diagonale negativa
    );
  }

  private checkDirection(board: iCell[][], row: number, col: number, player: Player, deltaRow: number, deltaCol: number): boolean {
    let count = 1;

    // Controlla in una direzione
    let r = row + deltaRow;
    let c = col + deltaCol;
    while (this.isValidCell(r, c) && board[r][c].occupiedBy === player) {
      count++;
      r += deltaRow;
      c += deltaCol;
    }

    // Controlla nella direzione opposta
    r = row - deltaRow;
    c = col - deltaCol;
    while (this.isValidCell(r, c) && board[r][c].occupiedBy === player) {
      count++;
      r -= deltaRow;
      c -= deltaCol;
    }

    return count >= 4;
  }

  private isValidCell(row: number, col: number): boolean {
    return row >= 0 && row < this.initialRows && col >= 0 && col < this.initialCols;
  }

  resetGame(): void {
    const state = this.gameStateSubject.value;
    if (!state) return;

    const resetGame: iGame = {
      ...state,
      board: this.createEmptyBoard(),
      currentPlayer: 'Player1',
      timer: this.initialTimer,
      isGameOver: false,
      winner: null,
      moves: []
    };

    this.apiService.put<iGame>(`games/${state.id}`, resetGame).subscribe({
      next: (response: iGame) => {
        if (response) {
          this.gameStateSubject.next(response);
        }
      },
      error: (error) => {
        console.error('Errore nel reset della partita:', error);
      }
    });
  }

  setWinner(winner: Player | null): void {
    const state = this.gameStateSubject.value;
    if (!state) return;

    const updatedGame: iGame = {
      ...state,
      isGameOver: true,
      winner
    };

    this.apiService.put<iGame>(`games/${state.id}`, updatedGame).subscribe({
      next: (response: iGame) => {
        if (response) {
          this.gameStateSubject.next(response);
        }
      },
      error: (error) => {
        console.error('Errore nell\'aggiornamento del vincitore:', error);
      }
    });
  }
}
