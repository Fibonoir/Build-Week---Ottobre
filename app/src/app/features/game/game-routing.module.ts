import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game.component';
import { GameBoardComponent } from './game-board/game-board.component';

const routes: Routes = [{ path: '', component: GameBoardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
