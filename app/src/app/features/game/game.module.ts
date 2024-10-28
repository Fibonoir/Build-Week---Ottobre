import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { GameBoardComponent } from './game-board/game-board.component';
import { TimerComponent } from './timer/timer.component';


@NgModule({
  declarations: [
    GameComponent,
    GameBoardComponent,
    TimerComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule
  ]
})
export class GameModule { }
