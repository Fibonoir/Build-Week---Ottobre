import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../../../services/game.service';
import { iCell, iGame, iMove } from '../../../interfaces/game';
import { Router } from '@angular/router';
import { AuthGuard } from '../../../guards/auth.guard';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
})
export class GameBoardComponent implements OnInit, OnDestroy {
  game: iGame | null = null;
  gameSubscription!: Subscription;
  lastMove: iMove | null = null;
  savedGames: iGame[] = [];
  savedGamesSubscription!: Subscription;

  constructor(
    public gameService: GameService,
    private router: Router,
    private authGuard: AuthGuard
  ) {}

  ngOnInit(): void {
    // Crea una nuova partita all'inizio
    this.gameService.createGame();

    // Sottoscrizione allo stato del gioco
    this.gameSubscription = this.gameService.gameState$.subscribe((game) => {
      if (game) {
        this.game = game;

        // Memorizza l'ultima mossa
        if (game.moves.length > 0) {
          this.lastMove = game.moves[game.moves.length - 1];
        } else {
          this.lastMove = null;
        }
      }

      // Controlla se c'è un vincitore e reindirizza ai risultati
      if (this.game?.winner) {
        // Consente l'accesso alla pagina dei risultati
        this.authGuard.allowResultsAccess = true;

        // Reindirizza alla pagina dei risultati
        setTimeout(() => {
          this.router.navigate(['/results']);
        }, 800);
      }
    });

    // Carica i giochi salvati e sottoscrivi all'aggiornamento della lista
    this.gameService.loadSavedGames();
    this.savedGamesSubscription = this.gameService.savedGames$.subscribe(
      (games) => (this.savedGames = games)
    );
  }

  // Metodo per verificare se una cella è l'ultima mossa
  isLastMove(cell: iCell): boolean {
    if (!this.lastMove) return false;
    if (cell.col !== this.lastMove.column) return false;

    for (let row = 0; row < this.game!.board.length; row++) {
      const currentCell = this.game!.board[row][cell.col];
      if (currentCell.occupiedBy === this.lastMove.player) {
        return cell.row === row;
      }
    }

    return false;
  }

  // Gestore del click sulla colonna per eseguire una mossa
  onColumnClick(col: number): void {
    if (this.game && !this.game.isGameOver) {
      console.log(col); // Debug: log della colonna cliccata
      this.gameService.makeMove(col);
    }
  }

  // Metodo per resettare il gioco
  resetGame(): void {
    if (this.game) {
      this.gameService.resetGame();
    }
  }

  // Annulla un gioco salvato
  cancelGame(id: string) {
    this.gameService.cancelGame(id);
  }

  // Cleanup delle sottoscrizioni per evitare memory leaks
  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.savedGamesSubscription) {
      this.savedGamesSubscription.unsubscribe();
    }
  }
}
