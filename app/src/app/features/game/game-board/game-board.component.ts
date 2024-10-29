
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { iCell, iGame, iMove } from '../../../interfaces/game';
import { TimerService } from '../../../services/timer.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  game: iGame | null = null;
  gameSubscription!: Subscription;
  lastMove: iMove | null = null;
  savedGames: iGame[] = [];
  savedGamesSubscription!: Subscription;


  constructor(public gameService: GameService, private timerService: TimerService) {}

  ngOnInit(): void {
    this.gameService.createGame();
    this.gameSubscription = this.gameService.gameState$.subscribe((game) => {
      if (game) {
        this.game = game;

        if (game.moves.length > 0) {
          this.lastMove = game.moves[game.moves.length - 1];

        } else {
          this.lastMove = null;
        }
      }
    });
    this.gameService.loadSavedGames();
    this.savedGamesSubscription = this.gameService.savedGames$.subscribe((games) => this.savedGames = games)
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
    this.gameService.cancelGame(id)
  }
}
