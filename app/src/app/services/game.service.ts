import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { ApiService } from './api.service';
import { iCell, iGame, iMove, iPlayers } from '../interfaces/game';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private initialRows: number = 6;
  private initialCols: number = 7;
  private initialTimer: number = 30;
  public players: iPlayers = { player1: '', player2: '' };

  private gameStateSubject = new BehaviorSubject<iGame | null>(null);
  gameState$ = this.gameStateSubject.asObservable();
  private savedGamesSubject = new BehaviorSubject<iGame[]>([]);
  savedGames$ = this.savedGamesSubject.asObservable();

  constructor(private apiService: ApiService) {}

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

  loadSavedGames(): void {
    this.apiService.getSavedGames<iGame[]>().subscribe({
      next: (res: iGame[]) => {
        this.savedGamesSubject.next(res);
      },
      error: (err) => {
        console.error('Error loading saved games:', err);
      },
    });
  }

  loadGame(gameId: string): void {
    this.apiService.get<iGame>(`${gameId}`).subscribe({
      next: (response: iGame) => {
        this.gameStateSubject.next(response);
      },
      error: (error) => {
        console.error('Errore nel caricamento della partita:', error);
      },
    });
  }

  setPlayers(players: iPlayers): void {
    this.players = players;
  }

  createGame(): Observable<string> {
    const newGame: Partial<iGame> = {
      board: this.createEmptyBoard(),
      players: this.players,
      currentPlayer: this.players.player1,
      timer: this.initialTimer,
      isGameOver: false,
      winner: null,
      moves: [],
    };
    return this.apiService.post<iGame>(newGame).pipe(
      tap((response: iGame) => {
        if (response) {
          this.gameStateSubject.next(response);
        }
      }),
      map((response: iGame) => response.id),
      catchError((error) => {
        console.error('Errore nella creazione della partita:', error);
        return throwError(() => new Error(error));
      })
    );
  }

  makeMove(col: number): void {
    const state = this.gameStateSubject.value;

    if (!state || state.isGameOver) {
      return;
    }

    // Trova la prima cella libera dalla base
    for (let row = this.initialRows - 1; row >= 0; row--) {
      if (!state.board[row][col].occupiedBy) {
        const updatedBoard = state.board.map((r) => r.map((c) => ({ ...c })));
        updatedBoard[row][col].occupiedBy = state.currentPlayer;

        const newMove: iMove = {
          id: state.moves.length + 1,
          gameId: state.id,
          player: state.currentPlayer,
          column: col,
          timestamp: new Date(),
        };

        const updatedMoves = [...state.moves, newMove];
        let isGameOver = false;
        let winner: string | null = null;

        // Controlla se il movimento ha portato a una vittoria
        if (this.checkWin(updatedBoard, row, col, state.currentPlayer)) {
          isGameOver = true;
          winner = state.currentPlayer;
        } else if (this.isBoardFull(updatedBoard)) {
          isGameOver = true;
          winner = null; // Pareggio
        }

        const nextPlayer: string =
          state.currentPlayer === state.players.player1
            ? state.players.player2
            : state.players.player1;

        const updatedGame: iGame = {
          ...state,
          board: updatedBoard,
          currentPlayer: nextPlayer,
          timer: this.initialTimer,
          isGameOver,
          winner,
          moves: updatedMoves,
        };

        console.log('Updating game with move:', updatedGame);

        // Update the game state in the backend
        this.apiService.put<iGame>(updatedGame.id, updatedGame).subscribe({
          next: (response: iGame) => {
            if (response) {
              this.gameStateSubject.next(response);
            }
          },
          error: (error) => {
            console.error('Error updating game:', error);
          },
        });

        return;
      }
    }

    // Se la colonna è piena, puoi mostrare un messaggio o gestire l'errore
    console.warn("Colonna piena. Scegli un'altra colonna.");
  }

  private isBoardFull(board: iCell[][]): boolean {
    return board[0].every((cell) => cell.occupiedBy !== null);
  }

  private checkWin(
    board: iCell[][],
    row: number,
    col: number,
    player: string
  ): boolean {
    return (
      this.checkDirection(board, row, col, player, 0, 1) || // Orizzontale
      this.checkDirection(board, row, col, player, 1, 0) || // Verticale
      this.checkDirection(board, row, col, player, 1, 1) || // Diagonale positiva
      this.checkDirection(board, row, col, player, 1, -1) // Diagonale negativa
    );
  }

  private checkDirection(
    board: iCell[][],
    row: number,
    col: number,
    player: string,
    deltaRow: number,
    deltaCol: number
  ): boolean {
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
    return (
      row >= 0 && row < this.initialRows && col >= 0 && col < this.initialCols
    );
  }

  resetGame(): void {
    const state = this.gameStateSubject.value;
    if (!state) return;

    const resetGame: iGame = {
      ...state,
      board: this.createEmptyBoard(),
      currentPlayer: 'player1',
      timer: this.initialTimer,
      isGameOver: false,
      winner: null,
      moves: [],
    };

    this.apiService.put<iGame>(`${state.id}`, resetGame).subscribe({
      next: (response: iGame) => {
        if (response) {
          this.gameStateSubject.next(response);
        }
      },
      error: (error) => {
        console.error('Errore nel reset della partita:', error);
      },
    });
  }

  setWinner(winner: string | null): void {
    const state = this.gameStateSubject.value;
    if (!state) return;

    const updatedGame: iGame = {
      ...state,
      isGameOver: true,
      winner,
    };

    this.apiService.put<iGame>(`${state.id}`, updatedGame).subscribe({
      next: (response: iGame) => {
        if (response) {
          this.gameStateSubject.next(response);
        }
      },
      error: (error) => {
        console.error("Errore nell'aggiornamento del vincitore:", error);
      },
    });
  }

  updateTimer(newTimer: number): void {
    const state = this.gameStateSubject.value;
    if (!state || state.isGameOver) {
      return;
    }

    const updatedGame: iGame = {
      ...state,
      timer: newTimer,
    };

    this.gameStateSubject.next(updatedGame);
  }

  getCurrentGameState(): iGame | null {
    return this.gameStateSubject.value;
  }

  cancelGame(id: string) {
    this.apiService.delete<iGame>(id).subscribe();
  }
}
