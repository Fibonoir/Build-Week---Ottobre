import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, map, Observable, Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { TimerService } from '../../../services/timer.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit {
  timer$!: Observable<number>;
  currentPlayer$!: Observable<string>;
  timer!: number;

  totalSeconds: number = 60;
  remainingSeconds: number = this.totalSeconds;
  seconds: number = this.remainingSeconds;
  timerSubscription!: Subscription;

  constructor(private gameSvc: GameService, private timerSvc: TimerService) {}

  @ViewChild('progressCircle') progressCircle!: ElementRef<SVGCircleElement>;
  circumference: number = 2 * Math.PI * 59;

  ngOnInit(): void {
    this.gameSvc.gameState$.subscribe((game) => {
      if (game){
        this.timer = game.timer

      }
    })

    this.currentPlayer$ = this.gameSvc.gameState$.pipe(
      map((state) => state ? state.currentPlayer : '')
    );



  }

  ngAfterViewInit(): void {
    this.initializeCircle();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  initializeCircle(): void {
    const circle = this.progressCircle.nativeElement;
    circle.style.strokeDasharray = `${this.circumference}`;
    circle.style.strokeDashoffset = `${this.circumference}`;
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.remainingSeconds--;
      this.updateTimer();

      if (this.remainingSeconds <= 0) {
        this.stopTimer();
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  updateTimer(): void {
    this.seconds = this.remainingSeconds;
    const offset =
      this.circumference -
      (this.circumference * this.remainingSeconds) / this.totalSeconds;
    this.progressCircle.nativeElement.style.strokeDashoffset = `${offset}`;
  }

  // questo dovrebbe funzionare in concomitanza con il nostro timerService

  // seconds: number = 0;
  // timerSubscription!: Subscription;

  // @ViewChild('progressCircle') progressCircle!: ElementRef<SVGCircleElement>;
  // circumference: number = 2 * Math.PI * 59; // Circumference for the circle

  // ngOnInit(): void {
  //   this.timerSubscription = this.timerSvc.gameSvc.gameStateSubject.subscribe(state => {
  //     this.seconds = state.timer;
  //     this.updateCircle(state.timer);
  //   });

  //   this.timerSvc.startTimer(); // Avvia il timer all'inizio
  // }

  // ngOnDestroy(): void {
  //   this.timerSubscription.unsubscribe(); // Ferma la sottoscrizione quando il componente è distrutto
  //   this.timerSvc.stopTimer(); // Ferma il timer quando il componente è distrutto
  // }

  // private updateCircle(remainingTime: number): void {
  //   const offset = this.circumference - (this.circumference * remainingTime) / this.timerSvc.countdownInterval / 1000; // Assicurati di avere i secondi corretti
  //   this.progressCircle.nativeElement.style.strokeDasharray = `${this.circumference}`;
  //   this.progressCircle.nativeElement.style.strokeDashoffset = `${offset}`;
  // }
}
