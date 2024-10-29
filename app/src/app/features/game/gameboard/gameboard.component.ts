import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrl: './gameboard.component.scss',
})
export class GameboardComponent implements OnInit {
  rows: number = 6; // Numero di righe
  columns: number = 7; // Numero di colonne
  board: string[][] = []; // Griglia di gioco
  currentPlayer: string = 'R'; // Giocatore corrente (R per Rosso, Y per Giallo)
  gameOver: boolean = false; // Flag per la fine del gioco
  winner: string | null = null; // Giocatore vincente

  ngOnInit(): void {
    this.initializeBoard();
  }

  // Inizializza la griglia con celle vuote
  initializeBoard(): void {
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.columns).fill('')
    );
  }

  // Gestisce il piazzamento di un gettone in una colonna
  placeToken(column: number): void {
    if (this.gameOver) return;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][column]) {
        this.board[row][column] = this.currentPlayer;
        if (this.checkWin(row, column)) {
          this.gameOver = true;
          this.winner = this.currentPlayer;
        } else {
          this.togglePlayer();
        }
        break;
      }
    }
  }

  // Cambia il giocatore corrente
  togglePlayer(): void {
    this.currentPlayer = this.currentPlayer === 'R' ? 'Y' : 'R';
  }

  // Controlla se l'ultimo gettone piazzato ha determinato una vittoria
  checkWin(row: number, column: number): boolean {
    return (
      this.checkDirection(row, column, 1, 0) || // orizzontale
      this.checkDirection(row, column, 0, 1) || // verticale
      this.checkDirection(row, column, 1, 1) || // diagonale \
      this.checkDirection(row, column, 1, -1) // diagonale /
    );
  }

  // Verifica la presenza di 4 gettoni consecutivi in una direzione specifica
  checkDirection(
    row: number,
    column: number,
    rowDir: number,
    colDir: number
  ): boolean {
    let count = 0;

    for (let i = -3; i <= 3; i++) {
      const r = row + i * rowDir;
      const c = column + i * colDir;
      if (
        r >= 0 &&
        r < this.rows &&
        c >= 0 &&
        c < this.columns &&
        this.board[r][c] === this.currentPlayer
      ) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
    }
    return false;
  }

  // Reset della partita
  resetGame(): void {
    this.initializeBoard();
    this.currentPlayer = 'R';
    this.gameOver = false;
    this.winner = null;
  }
}
