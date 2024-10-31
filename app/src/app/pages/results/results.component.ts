import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { iGame } from '../../interfaces/game';
import { take } from 'rxjs';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent {
  winner!: string | null | undefined;
  loser!: string | null | undefined;
  game!: iGame | null;

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {
    const currentGame = localStorage.getItem('currentGameId');

    this.gameService.gameState$.pipe(take(1)).subscribe((game) => {
      this.winner = game?.winner;
      if (game?.players.player1 === this.winner) {
        this.loser = game?.players.player2;
      } else {
        this.loser = game?.players.player1;
      }
      this.game = game;
      if (!currentGame) {
        this.router.navigate(['']);
      } else {
        localStorage.removeItem('currentGameId');
        if (this.game?.id) {
          this.gameService.cancelGame(this.game.id).pipe(take(1)).subscribe({
            next: () => {
              console.log('Game canceled successfully.');
            },
            error: (error) => {
              console.error('Error canceling game:', error);
            }
          });

      }
      }
    });

  }

  goHome(): void {
    this.router.navigate(['']);
  }

}
