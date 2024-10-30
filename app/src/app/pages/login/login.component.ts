import { Component, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game.service';
import { iGame } from '../../interfaces/game';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  player1Name: string = '';
  player2Name: string = '';
  savedGames: iGame[] = [];
  savedGamesSubscription!: Subscription;
  isNewGame: boolean = false;
  isSavedGame: boolean = false;

  constructor(
    private gameService: GameService,
    private router: Router,
    private authGuard: AuthGuard
  ) {}

  ngOnInit() {
    this.gameService.loadSavedGames();
    this.savedGamesSubscription = this.gameService.savedGames$.subscribe(
      (games) => (this.savedGames = games)
    );
  }

  onSubmit() {
    if (!this.player1Name || !this.player2Name) {
      return;
    }

    // Imposta i giocatori nel servizio
    this.gameService.setPlayers({
      player1: this.player1Name.trim(),
      player2: this.player2Name.trim(),
    });

    // Consenti accesso a /game e naviga verso la pagina
    this.authGuard.allowGameAccess = true;
    this.router.navigate(['/game']);

    // Reset del form
    this.resetForm();
  }

  resetForm() {
    this.player1Name = '';
    this.player2Name = '';
  }

  ngOnDestroy() {
    if (this.savedGamesSubscription) {
      this.savedGamesSubscription.unsubscribe();
    }
  }
}
