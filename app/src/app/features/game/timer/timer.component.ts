import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit {
  timer!: number;
  currentPlayer$!: Observable<string>;

  constructor(private gameSvc: GameService) {}

  ngOnInit() {
    this.gameSvc.gameState$.subscribe((game) => {
      if (game){
        this.timer = game.timer

      }
    })

    console.log(this.timer);

    this.currentPlayer$ = this.gameSvc.gameState$.pipe(
      map((state) => state ? state.currentPlayer : '')
    );
  }
}
