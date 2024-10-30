import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { iGame } from '../../interfaces/game';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent {
  winner!: string | null | undefined;
  loser!: string | null | undefined;
  game!: iGame | null;

  constructor(private gameService: GameService, private router: Router){}

  ngOnInit(){
    const currentGame = localStorage.getItem("currentGameId")

    this.gameService.gameState$.subscribe((game) => {
      console.log(game);
      this.winner = game?.winner;
      if(game?.players.player1 === this.winner){
        this.loser = game?.players.player2
      } else {
        this.loser = game?.players.player1
      }
      this.game = game;

    })
    if(!currentGame) {
      this.router.navigate([""])
    } else {
    localStorage.removeItem("currentGameId");
    }


  }

  getResultMessage() {
    return this.winner === 'player1' ? 'Hai vinto!' : 'Hai perso!';
  }

  getResultSubMessage() {
    return this.winner === 'player1' ? 'Complimenti!' : 'Peccato!';
  }

  getConfettiDirection() {
    return this.winner === 'player1' ? 'left' : 'right';
  }
}
