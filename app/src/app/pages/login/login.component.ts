// src/app/login/login.component.ts

import { AuthGuard } from './../../guards/auth.guard';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game.service';
import { iGame, iPlayers } from '../../interfaces/game';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  player1Name: string = "";
  player2Name: string = "";
  savedGames: iGame[] = [];
  isNewGame: boolean = false;
  isSavedGame: boolean = false;
  isAgainstAI: boolean = false; // New property to track game mode

  private savedGamesSubscription!: Subscription;

  constructor(
    public gameService: GameService,
    private router: Router,
    private authGuard: AuthGuard
  ){}

  ngOnInit() {
    this.gameService.loadSavedGames();
    this.savedGamesSubscription = this.gameService.savedGames$.subscribe((games: iGame[]) => {
      this.savedGames = games;
    });
  }



  onSubmit() {
    if (this.isNewGame) {
      this.createNewGame();
    }
  }


  createNewGame(): void {
    if (!this.player1Name.trim() || (!this.player2Name.trim() && !this.isAgainstAI)) {
      alert('Inserisci i nomi dei giocatori');
      return;
    }

    const players: iPlayers = {
      player1: this.player1Name.trim(),
      player2: this.isAgainstAI ? 'Computer' : this.player2Name.trim()
    };

    this.gameService.setPlayers(players);

    // Create the game, specifying if it's against AI
    this.gameService.createGame(this.isAgainstAI).subscribe({
      next: (gameId: string) => {
        console.log('Created New Game with ID:', gameId);

        localStorage.setItem('currentGameId', gameId);
        this.authGuard.allowGameAccess = true;
        this.router.navigate(['/game']);
      },
      error: (error) => {
        console.error('Error creating new game:', error);
        alert('Errore nella creazione della partita. Riprova.');
      }
    });

    this.resetForm();
  }


  selectSavedGame(game: iGame): void {
    localStorage.setItem('currentGameId', game.id);
    this.authGuard.allowGameAccess = true;
    this.router.navigate(['/game']);
  }


  toggleNewGame(): void {
    this.isNewGame = true;
    this.isSavedGame = false;
  }


  toggleSavedGame(): void {
    this.isSavedGame = true;
    this.isNewGame = false;
  }


  resetForm() {
    this.player1Name = ""
    this.player2Name = ""
    this.isAgainstAI = false; // Reset game mode selection
  }


  delete(id: string) {
    this.gameService.cancelGame(id);
    this.gameService.loadSavedGames();
    this.gameService.savedGames$.subscribe((games) => (this.savedGames = games));
  }


  toggleAI(): void {
    this.isAgainstAI = !this.isAgainstAI;
    if (this.isAgainstAI) {
      this.isSavedGame = false;
    }
  }

  ngOnDestroy(): void {
    if (this.savedGamesSubscription) {
      this.savedGamesSubscription.unsubscribe();
    }
  }
}
