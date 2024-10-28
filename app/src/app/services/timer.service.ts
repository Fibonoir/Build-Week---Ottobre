// src/app/core/services/timer.service.ts

import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { Subscription, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubscription: Subscription | null = null;
  private countdownInterval: number = 1000; // 1 secondo

  constructor(private gameService: GameService) {
    this.gameService.gameState$.subscribe(game => {
      if (game && !game.isGameOver) {
        this.resetTimer(game.timer);
      } else {
        this.stopTimer();
      }
    });
  }

  startTimer(): void {
    this.stopTimer();
    this.timerSubscription = interval(this.countdownInterval).subscribe(() => {
      const game = this.gameService['gameStateSubject'].value;
      if (game) {
        if (game.timer > 0) {
          const updatedGame = { ...game, timer: game.timer - 1 };
          this.gameService['gameStateSubject'].next(updatedGame);
          // Aggiorna il timer nell'API
          this.gameService['apiService'].put(`games/${game.id}`, updatedGame).subscribe({
            next: () => {},
            error: (error) => console.error('Errore nell\'aggiornamento del timer:', error)
          });
        } else {
          // Tempo scaduto, il giocatore corrente perde
          const winner = game.currentPlayer === 'Player1' ? 'Player2' : 'Player1';
          this.gameService.setWinner(winner);
          this.stopTimer();
        }
      }
    });
  }

  resetTimer(initialTime: number): void {
    this.stopTimer();
    const game = this.gameService['gameStateSubject'].value;
    if (game) {
      const updatedGame = { ...game, timer: initialTime };
      this.gameService['gameStateSubject'].next(updatedGame);
      // Aggiorna il timer nell'API
      this.gameService['apiService'].put(`games/${game.id}`, updatedGame).subscribe({
        next: () => {},
        error: (error) => console.error('Errore nell\'aggiornamento del timer:', error)
      });
    }
    this.startTimer();
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
}
