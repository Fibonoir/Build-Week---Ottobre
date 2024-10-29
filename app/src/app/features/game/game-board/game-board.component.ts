
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { iGame } from '../../../interfaces/game';
import { TimerService } from '../../../services/timer.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  game: iGame | null = null;
  gameSubscription!: Subscription;
  isGameLoaded: boolean = false

  constructor(private gameService: GameService, private timerService: TimerService) {}

  ngOnInit(): void {
    this.gameService.createGame();
    this.gameSubscription = this.gameService.gameState$.subscribe(game => {
      this.isGameLoaded = true;
      // if (game) {
      //   this.timerService.startTimer(game.timer);
      // }
      this.game = game;

    });
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
      // this.timerService.resetTimer(this.game.timer);
    }
  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }
}
