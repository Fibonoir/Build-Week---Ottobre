import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { iCell, iGame, iMove } from '../../../interfaces/game';
import { TimerService } from '../../../services/timer.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthGuard } from '../../../guards/auth.guard';

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
    console.log(gameId);

    if (gameId) {
      this.gameService.loadGame(gameId)
      this.gameSubscription = this.gameService.gameState$.subscribe((loadedGame) => {

          if(loadedGame) {
          this.game = loadedGame;


          if (loadedGame.moves.length > 0) {
            this.game.currentPlayer === loadedGame.moves[loadedGame.moves.length - 1].player
            this.lastMove = loadedGame.moves[loadedGame.moves.length - 1];
          } else {
            this.lastMove = null;
          }

          if (loadedGame.isGameOver && loadedGame.winner) {
            setTimeout(() => {
              this.authGuard.allowResultsAccess = true;
              this.router.navigate(['/results']);
            }, 800);
          }
        }

      });
    } else {
      this.router.navigate(['']);
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
      console.log(col);
      //just for debugging

      this.gameService.makeMove(col);
    }
  }

  resetGame(): void {
    if (this.game) {
      this.gameService.resetGame();
    }
  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }

  cancelGame(id: string) {
    this.gameService.cancelGame(id);
  }
}
