import { GameService } from './../../../services/game.service';
import { AuthGuard } from './../../../guards/auth.guard';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { iCell, iGame, iMove } from '../../../interfaces/game';

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

  constructor(public gameService: GameService, private router: Router, private authGuard: AuthGuard) {}

  ngOnInit(): void {
    const gameId = localStorage.getItem('currentGameId');

    if (gameId) {
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
                this.authGuard.allowResultsAccess = true
                this.router.navigate(['/results']);
              }, 800);
            }
          }
        },
        error: (error) => {
          console.error('Error loading game:', error);
          alert('Errore nel caricamento della partita. Ritorna alla schermata iniziale.');
          this.router.navigate(['']);
        }
      });
    } else {
      alert('Nessuna partita selezionata. Ritorna alla schermata iniziale.');
      this.router.navigate(['']);
    }

    console.log("human player", this.gameService.HUMAN_PLAYER);
    console.log("Players", this.gameService.players);

  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.savedGamesSubscription) {
      this.savedGamesSubscription.unsubscribe();
    }
  }


  isLastMove(cell: iCell): boolean {
    if (!this.lastMove) return false;
    if (cell.col !== this.lastMove.column) return false;

    for (let row = 0; row < this.game!.board.length; row++) {
      const currentCell = this.game!.board[row][cell.col];
      if (currentCell.occupiedBy === this.lastMove.player) {
        return cell.row === row;
      }
    }

    return false;
  }

  onColumnClick(col: number): void {
    if (this.game && !this.game.isGameOver) {
      console.log('Column clicked:', col);
      this.gameService.makeMove(col);
    }
  }


  resetGame(): void {
    if (this.game) {
      this.gameService.resetGame();
      this.game = null;
      this.lastMove = null;
      // localStorage.removeItem('currentGameId');
      // this.router.navigate(['/login']);
    }
  }


}
