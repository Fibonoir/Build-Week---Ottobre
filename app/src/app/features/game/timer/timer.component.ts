import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, map, Observable, Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { keyframes } from '@angular/animations';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit {
  currentPlayer$!: Observable<string>;
  timer!: number;
  isPulsing: boolean = false;

  totalSeconds!: number;
  remainingSeconds!: number;
  timerSubscription!: Subscription;

  constructor(private gameSvc: GameService) {}

  ngOnInit(): void {
    this.gameSvc.gameState$.subscribe((game) => {
      if (game) {
        this.timer = game.timer;
        this.totalSeconds = this.timer; // Imposta il totale
        this.remainingSeconds = this.totalSeconds; // Imposta i secondi rimanenti
      }
    });

    this.currentPlayer$ = this.gameSvc.gameState$.pipe(
      map((state) => (state ? state.currentPlayer : ''))
    );
  }

  ngAfterViewInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
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
