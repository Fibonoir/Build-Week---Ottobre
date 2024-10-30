import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [  {
  path: 'game',
  loadChildren: () =>
    import('./features/game/game.module').then((m) => m.GameModule),
},
{
  path: '',
  loadChildren: () =>
    import('./pages/login/login.module').then((m) => m.LoginModule),
},
{ path: 'results',
  loadChildren: () => import('./pages/results/results.module').then(m => m.ResultsModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
