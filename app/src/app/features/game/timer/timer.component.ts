import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, map, Observable, Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit {
  timer$!: Observable<number>;
  currentPlayer$!: Observable<string>;

  totalSeconds: number = 60;
  remainingSeconds: number = this.totalSeconds;
  seconds: number = this.remainingSeconds;
  private timerSubscription!: Subscription;

  constructor(private gameSvc: GameService) {}

  @ViewChild('progressCircle') progressCircle!: ElementRef<SVGCircleElement>;
  circumference: number = 2 * Math.PI * 59;

  ngOnInit(): void {
    //   this.timer$ = this.gameSvc.gameState$.pipe(map((state) => state.timer));
    //   this.currentPlayer$ = this.gameSvc.gameState$.pipe(
    //     map((state) => state.currentPlayer)
    //   );
  }

  ngAfterViewInit(): void {
    this.initializeCircle();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private initializeCircle(): void {
    const circle = this.progressCircle.nativeElement;
    circle.style.strokeDasharray = `${this.circumference}`;
    circle.style.strokeDashoffset = `${this.circumference}`;
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.remainingSeconds--;
      this.updateTimer();

      if (this.remainingSeconds <= 0) {
        this.stopTimer();
      }
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private updateTimer(): void {
    this.seconds = this.remainingSeconds;
    const offset =
      this.circumference -
      (this.circumference * this.remainingSeconds) / this.totalSeconds;
    this.progressCircle.nativeElement.style.strokeDashoffset = `${offset}`;
  }
}
