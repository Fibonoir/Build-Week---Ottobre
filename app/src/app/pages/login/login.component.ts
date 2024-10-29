import { Component} from '@angular/core';
import { GameService } from '../../services/game.service';
import { iGame } from '../../interfaces/game';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  player1Name: string = "";
  player2Name: string = "";
  savedGames: iGame[] = [];
  savedGamesSubscription!: Subscription;
  isNewGame: boolean = false;
  isSavedGame: boolean = false;

  constructor(private gameService: GameService){}

  ngOnInit() {
    this.gameService.loadSavedGames();
    this.savedGamesSubscription = this.gameService.savedGames$.subscribe((games) => this.savedGames = games)

  }

  onSubmit() {

    if (!this.player1Name || !this.player2Name) {
      return;
    }

    this.gameService.setPlayers({
      player1: this.player1Name.trim(),
      player2: this.player2Name.trim()
    });


    this.resetForm();
  }

  resetForm() {
    this.player1Name = ""
    this.player2Name = ""
  }
}
