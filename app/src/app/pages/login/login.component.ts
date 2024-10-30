import { Component} from '@angular/core';
import { GameService } from '../../services/game.service';
import { iGame } from '../../interfaces/game';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private gameService: GameService, private router: Router){}

  ngOnInit() {
    this.gameService.loadSavedGames();
    this.savedGamesSubscription = this.gameService.savedGames$.subscribe((games) => this.savedGames = games)

  }

  selectSavedGame(gameId: string): void {
    localStorage.setItem('currentGameId', gameId);
    this.router.navigate(['/game']);
  }

  onSubmit() {

    if (!this.player1Name || !this.player2Name) {
      return;
    }

    this.gameService.setPlayers({
      player1: this.player1Name.trim(),
      player2: this.player2Name.trim()
    });

    this.gameService.createGame().subscribe({
      next: (gameId: string) => {
        console.log('Created New Game with ID:', gameId);

        localStorage.setItem('currentGameId', gameId);
        this.router.navigate(['/game']);
      },
      error: (error) => {
        console.error('Error creating new game:', error);
        alert('Errore nella creazione della partita. Riprova.');
      }
    });

    this.resetForm();
  }

  resetForm() {
    this.player1Name = ""
    this.player2Name = ""
  }
}
