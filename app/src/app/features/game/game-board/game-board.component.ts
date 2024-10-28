// src/app/features/game/components/game-board/game-board.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { TimerService } from '../../../services/timer.service';
import { iGame } from '../../../interfaces/game';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  game: iGame | null = null;
  gameSubscription!: Subscription;

  constructor(private gameService: GameService, private timerService: TimerService) {}

  ngOnInit(): void {
    this.gameSubscription = this.gameService.gameState$.subscribe(game => {
      if (game) {
        this.game = game;
        if (!game.isGameOver) {
          this.timerService.startTimer();
        } else {
          this.timerService.stopTimer();
        }
      }
    });
  }

  onColumnClick(col: number): void {
    if (this.game && !this.game.isGameOver) {
      this.gameService.makeMove(col);
    }
  }

  resetGame(): void {
    if (this.game) {
      this.gameService.resetGame();
      this.timerService.resetTimer(this.game.timer);
    }
  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }
}
