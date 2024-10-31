// src/app/game/components/game-board/game-board.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { iCell, iGame, iMove } from '../../../interfaces/game';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
})
export class GameBoardComponent implements OnInit, OnDestroy {
  game: iGame | null = null;
  gameSubscription!: Subscription;
  lastMove: iMove | null = null;
  savedGames: iGame[] = [];
  savedGamesSubscription!: Subscription;

  constructor(public gameService: GameService, private router: Router) {}

  ngOnInit(): void {
    const gameId = localStorage.getItem('currentGameId');

    if (gameId) {
      // Load the saved game
      this.gameService.loadGame(gameId);

      this.gameSubscription = this.gameService.gameState$.subscribe({
        next: (loadedGame: iGame | null) => {
          if (loadedGame) {
            this.game = loadedGame;
            console.log('Loaded Game:', loadedGame);

            if (loadedGame.moves.length > 0) {
              this.lastMove = loadedGame.moves[loadedGame.moves.length - 1];
            } else {
              this.lastMove = null;
            }

            if (loadedGame.isGameOver && loadedGame.winner) {
              setTimeout(() => {
                this.router.navigate(['/results']);
              }, 800);
            }
          }
        },
        error: (error) => {
          console.error('Error loading game:', error);
          alert('Errore nel caricamento della partita. Ritorna alla schermata iniziale.');
          this.router.navigate(['/login']);
        }
      });
    } else {
      // No game ID found, redirect to login
      alert('Nessuna partita selezionata. Ritorna alla schermata iniziale.');
      this.router.navigate(['/login']);
    }

    // Load saved games for possible future use (optional)
    this.gameService.loadSavedGames();
    this.savedGamesSubscription = this.gameService.savedGames$.subscribe(
      (games) => (this.savedGames = games)
    );
  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.savedGamesSubscription) {
      this.savedGamesSubscription.unsubscribe();
    }
  }

  /**
   * Determines if the current cell is the last move made.
   * @param cell The cell to check.
   * @returns True if it's the last move, false otherwise.
   */
  isLastMove(cell: iCell): boolean {
    if (!this.lastMove) return false;
    if (cell.col !== this.lastMove.column) return false;

    // Iterate from the top row downwards to find the last disc placed by the player in the column
    for (let row = 0; row < this.game!.board.length; row++) {
      const currentCell = this.game!.board[row][cell.col];
      if (currentCell.occupiedBy === this.lastMove.player) {
        return cell.row === row;
      }
    }

    return false;
  }

  /**
   * Handles the click event on a column to make a move.
   * @param col The column index clicked.
   */
  onColumnClick(col: number): void {
    if (this.game && !this.game.isGameOver) {
      console.log('Column clicked:', col);
      this.gameService.makeMove(col);
    }
  }

  /**
   * Resets the game to its initial state.
   */
  resetGame(): void {
    if (this.game) {
      this.gameService.resetGame();
      this.game = null;
      this.lastMove = null;
      localStorage.removeItem('currentGameId');
      this.router.navigate(['/login']);
    }
  }

  /**
   * Cancels the current game.
   * @param id The ID of the game to cancel.
   */

}
