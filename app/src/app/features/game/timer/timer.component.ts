import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit {
  timer$!: Observable<number>;
  currentPlayer$!: Observable<string>;

  constructor(private gameSvc: GameService) {}

  ngOnInit() {
    // this.timer$ = this.gameSvc.gameState$.pipe(map((state) => state.timer));
    // this.currentPlayer$ = this.gameSvc.gameState$.pipe(
    //   map((state) => state.currentPlayer)
    // );
  }
}
