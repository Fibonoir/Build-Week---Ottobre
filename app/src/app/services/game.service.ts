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
import { v4 as uuidv4 } from 'uuid';


@Injectable({
  providedIn: 'root',
})
export class GameService {
  private initialRows: number = 6;
  private initialCols: number = 7;
  private initialTimer: number = 30;
  public players: iPlayers = { player1: '', player2: '' };
  private isAgainstAI: boolean = false;

  private readonly MAX_DEPTH: number = 4; // Adjust based on performance needs
  private AI_PLAYER: string = 'Computer';
  HUMAN_PLAYER: string = '';

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
    this.HUMAN_PLAYER = players.player1;
  }

  createGame(isAgainstAI: boolean = false): Observable<string> {
    this.isAgainstAI = isAgainstAI; // Set the opponent type


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

  private initiateAIMove(): void {
    if (!this.isAgainstAI || this.gameStateSubject.value?.isGameOver) {
      return;
    }

    const state = this.gameStateSubject.value;
    if (!state) return;

    // Determine the AI's move using Minimax
    const bestMove = this.getBestMove(state.board);

    if (bestMove !== -1) {
      this.makeMove(bestMove, this.AI_PLAYER);
    }
  }


  makeMove(col: number, player: string = this.HUMAN_PLAYER): void {
    const state = this.gameStateSubject.value;

    if (!state || state.isGameOver) {
      return;
    }

    // Find the first available row in the selected column
    for (let row = this.initialRows - 1; row >= 0; row--) {
      if (!state.board[row][col].occupiedBy) {
        const updatedBoard = state.board.map(r => r.map(c => ({ ...c })));
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

        // Check if this move wins the game
        if (this.checkWin(updatedBoard, row, col, player)) {
          isGameOver = true;
          winner = player;
        } else if (this.isBoardFull(updatedBoard)) {
          isGameOver = true;
          winner = null; // Draw
        }

        const nextPlayer: string = state.currentPlayer === state.players.player1 ? state.players.player2 : state.players.player1;

        const updatedGame: iGame = {
          ...state,
          board: updatedBoard,
          currentPlayer: nextPlayer,
          timer: this.initialTimer,
          isGameOver,
          winner,
          moves: updatedMoves,
        };

        // Update the game state in the backend
        this.apiService.put<iGame>(updatedGame.id, updatedGame).subscribe({
          next: (response: iGame) => {
            if (response) {
              this.gameStateSubject.next(response);

              // If the next player is AI, initiate AI move
              if (this.isAgainstAI && response.currentPlayer === this.AI_PLAYER && !response.isGameOver) {
                setTimeout(() => {
                  this.initiateAIMove();
                }, 1000); // Optional delay for better UX
              }
            }
          },
          error: (error) => {
            console.error('Error updating game:', error);
          },
        });

        return;
      }
    }

    // If the column is full, you can show a message or handle the error
    console.warn('Colonna piena. Scegli un\'altra colonna.');
  }

  private getBestMove(board: iCell[][]): number {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let col = 0; col < this.initialCols; col++) {
      if (board[0][col].occupiedBy === null) {
        // Clone the board
        const tempBoard = board.map(r => r.map(c => ({ ...c })));

        // Simulate the move
        let rowToPlace = -1;
        for (let row = this.initialRows - 1; row >= 0; row--) {
          if (tempBoard[row][col].occupiedBy === null) {
            tempBoard[row][col].occupiedBy = this.AI_PLAYER;
            rowToPlace = row;
            break;
          }
        }

        if (rowToPlace === -1) continue; // Column is full

        const score = this.minimax(tempBoard, this.MAX_DEPTH - 1, -Infinity, Infinity, false);

        // Undo the move
        tempBoard[rowToPlace][col].occupiedBy = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = col;
        }
      }
    }

    return bestMove;
  }

  private minimax(board: iCell[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || this.isBoardFull(board)) {
      return this.evaluateBoard(board);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let col = 0; col < this.initialCols; col++) {
        if (board[0][col].occupiedBy === null) {
          // Clone the board
          const tempBoard = board.map(r => r.map(c => ({ ...c })));

          // Simulate the move
          let rowToPlace = -1;
          for (let row = this.initialRows - 1; row >= 0; row--) {
            if (tempBoard[row][col].occupiedBy === null) {
              tempBoard[row][col].occupiedBy = this.AI_PLAYER;
              rowToPlace = row;
              break;
            }
          }

          if (rowToPlace === -1) continue; // Column is full

          // Check for win
          if (this.checkWin(tempBoard, rowToPlace, col, this.AI_PLAYER)) {
            return 1000 + depth; // Prefer faster wins
          }

          const evalScore = this.minimax(tempBoard, depth - 1, alpha, beta, false);
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) {
            break; // Beta cut-off
          }
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let col = 0; col < this.initialCols; col++) {
        if (board[0][col].occupiedBy === null) {
          // Clone the board
          const tempBoard = board.map(r => r.map(c => ({ ...c })));

          // Simulate the move
          let rowToPlace = -1;
          for (let row = this.initialRows - 1; row >= 0; row--) {
            if (tempBoard[row][col].occupiedBy === null) {
              tempBoard[row][col].occupiedBy = this.HUMAN_PLAYER;
              rowToPlace = row;
              break;
            }
          }

          if (rowToPlace === -1) continue; // Column is full

          // Check for win
          if (this.checkWin(tempBoard, rowToPlace, col, this.HUMAN_PLAYER)) {
            return -1000 - depth; // Prefer faster losses
          }

          const evalScore = this.minimax(tempBoard, depth - 1, alpha, beta, true);
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) {
            break; // Alpha cut-off
          }
        }
      }
      return minEval;
    }
  }

  private evaluateBoard(board: iCell[][]): number {
    let score = 0;

    // Center column preference
    const centerColumn = Math.floor(this.initialCols / 2);
    let centerCount = 0;
    for (let row = 0; row < this.initialRows; row++) {
      if (board[row][centerColumn].occupiedBy === this.AI_PLAYER) {
        centerCount++;
      }
    }
    score += centerCount * 3;

    // Score horizontal
    for (let row = 0; row < this.initialRows; row++) {
      const rowArray = board[row].map(cell => cell.occupiedBy);
      for (let col = 0; col < this.initialCols - 3; col++) {
        const window = rowArray.slice(col, col + 4);
        score += this.evaluateWindow(window);
      }
    }

    // Score vertical
    for (let col = 0; col < this.initialCols; col++) {
      const colArray = board.map(row => row[col].occupiedBy);
      for (let row = 0; row < this.initialRows - 3; row++) {
        const window = colArray.slice(row, row + 4);
        score += this.evaluateWindow(window);
      }
    }

    // Score positive sloped diagonals
    for (let row = 0; row < this.initialRows - 3; row++) {
      for (let col = 0; col < this.initialCols - 3; col++) {
        const window = [
          board[row][col].occupiedBy,
          board[row + 1][col + 1].occupiedBy,
          board[row + 2][col + 2].occupiedBy,
          board[row + 3][col + 3].occupiedBy
        ];
        score += this.evaluateWindow(window);
      }
    }

    // Score negative sloped diagonals
    for (let row = 3; row < this.initialRows; row++) {
      for (let col = 0; col < this.initialCols - 3; col++) {
        const window = [
          board[row][col].occupiedBy,
          board[row - 1][col + 1].occupiedBy,
          board[row - 2][col + 2].occupiedBy,
          board[row - 3][col + 3].occupiedBy
        ];
        score += this.evaluateWindow(window);
      }
    }

    return score;
  }

  private evaluateWindow(window: (string | null)[]): number {
    let score = 0;

    const aiCount = window.filter(cell => cell === this.AI_PLAYER).length;
    const humanCount = window.filter(cell => cell === this.HUMAN_PLAYER).length;
    const emptyCount = window.filter(cell => cell === null).length;

    if (aiCount === 4) {
      score += 100;
    } else if (aiCount === 3 && emptyCount === 1) {
      score += 5;
    } else if (aiCount === 2 && emptyCount === 2) {
      score += 2;
    }

    if (humanCount === 3 && emptyCount === 1) {
      score -= 4;
    }

    return score;
  }


  private isBoardFull(board: iCell[][]): boolean {
    return board[0].every((cell) => cell.occupiedBy !== null);
  }


  private checkWin(board: iCell[][], row: number, col: number, player: string): boolean {
    return (
      this.checkDirection(board, row, col, player, 0, 1) || // Horizontal
      this.checkDirection(board, row, col, player, 1, 0) || // Vertical
      this.checkDirection(board, row, col, player, 1, 1) || // Positive Diagonal
      this.checkDirection(board, row, col, player, 1, -1)   // Negative Diagonal
    );
  }


  private checkDirection(board: iCell[][], row: number, col: number, player: string, deltaRow: number, deltaCol: number): boolean {
    let count = 1;

    // Check in the positive direction
    let r = row + deltaRow;
    let c = col + deltaCol;
    while (this.isValidCell(r, c) && board[r][c].occupiedBy === player) {
      count++;
      r += deltaRow;
      c += deltaCol;
    }

    // Check in the negative direction
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
      currentPlayer: this.players.player1,
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
