
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { iGame } from '../../../interfaces/game';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  game: iGame | null = null;
  gameSubscription!: Subscription;
  isGameLoaded: boolean = false

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.loadGame(1);
    this.gameSubscription = this.gameService.gameState$.subscribe(game => {
      console.log(game);
      this.isGameLoaded = true
      this.game = game

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
