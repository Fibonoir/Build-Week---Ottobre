// src/app/core/services/timer.service.ts

import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timerSubscription: Subscription | null = null;
  private countdownInterval: number = 1000; // 1 second

  constructor(private gameService: GameService) {
    this.gameService.gameState$.subscribe((state) => {
      if (state && !state.isGameOver) {
        this.startTimer(state.timer);
      } else {
        this.stopTimer();
      }
    });
  }

  startTimer(initialTime: number): void {
    this.stopTimer(); // Ensure no multiple timers are running

    this.timerSubscription = interval(this.countdownInterval).subscribe(() => {
      const currentState = this.gameService.getCurrentGameState();

      if (currentState && !currentState.isGameOver) {
        if (currentState.timer > 0) {
          const updatedTimer = currentState.timer - 1;
          this.gameService.updateTimer(updatedTimer);
        } else {
          // Time's up, determine the winner
          const winner =
            currentState.currentPlayer === 'Player1' ? 'Player2' : 'Player1';
          this.gameService.setWinner(winner);
          this.stopTimer();
        }
      }
    });
  }

  resetTimer(initialTime: number): void {
    this.stopTimer();
    this.startTimer(initialTime);
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
}
