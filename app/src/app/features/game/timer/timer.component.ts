import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, map, Observable, of, Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit {
  timer!: number;
  isPulsing: boolean = false;

  totalSeconds!: number;
  remainingSeconds!: number;
  timerSubscription!: Subscription;

  constructor(private gameSvc: GameService) {}

  ngOnInit(): void {
    this.gameSvc.gameState$.subscribe((game) => {
      console.log(game);
      console.log(game?.timer);


      if (game) {
        this.timer = game.timer;
        // this.totalSeconds = 30; // Imposta il totale
        // this.remainingSeconds = game.timer;
         // Imposta i secondi rimanenti
      }
    });

    // this.currentPlayer$ = this.gameSvc.gameState$.pipe(
    //   map((state) => (state ? state.currentPlayer : ''))
    // );
  }

  ngAfterViewInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      // if (this.remainingSeconds > 0) {
      if (this.timer === 0) {
        this.stopTimer();
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  get timerClass(): string {
    if (this.timer <= 5) {
      this.isPulsing = true;
      return 'red';
    } else if (this.timer <= 10) {
      return 'orange';
    } else if (this.timer <= 20) {
      return 'yellow';
    } else {
      return 'green';
    }
  }
}
