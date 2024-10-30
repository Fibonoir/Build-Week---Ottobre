import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, map, Observable, of, Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { TimerService } from '../../../services/timer.service';

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

  constructor(private gameSvc: GameService, private timerSvc: TimerService) {}

  ngOnInit(): void {
    this.gameSvc.gameState$.subscribe((game) => {
      if (game) {
        this.timer = game.timer;
        console.log(game);
        console.log(game?.timer);
      }
    });
  }

  get timerClass(): string {
    if (this.timer <= 0) {
      this.isPulsing = false;
      return 'red';
    } else if (this.timer <= 5) {
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
