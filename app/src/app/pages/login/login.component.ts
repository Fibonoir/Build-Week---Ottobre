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


  /**
   * Handles form submission for creating a new game.
   */
  onSubmit() {
    if (this.isNewGame) {
      this.createNewGame();
    }
    // No action needed for saved games as selection is handled separately
  }

  /**
   * Creates a new game based on the selected game mode.
   */
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

  /**
   * Handles the selection of a saved game.
   * @param game The selected game.
   */
  selectSavedGame(game: iGame): void {
    localStorage.setItem('currentGameId', game.id);
    this.authGuard.allowGameAccess = true;
    this.router.navigate(['/game']);
  }

  /**
   * Toggles between creating a new game and loading a saved game.
   */
  toggleNewGame(): void {
    this.isNewGame = true;
    this.isSavedGame = false;
  }

  /**
   * Toggles between loading a saved game and creating a new game.
   */
  toggleSavedGame(): void {
    this.isSavedGame = true;
    this.isNewGame = false;
  }

  /**
   * Resets the form fields.
   */
  resetForm() {
    this.player1Name = ""
    this.player2Name = ""
    this.isAgainstAI = false; // Reset game mode selection
  }

  /**
   * Deletes a saved game.
   * @param id The ID of the game to delete.
   */
  delete(id: string) {
    this.gameService.cancelGame(id);
    this.gameService.loadSavedGames();
    this.gameService.savedGames$.subscribe((games) => (this.savedGames = games));
  }

  /**
   * Toggles the AI opponent selection.
   */
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
