import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent {
  @Input() winner: 'player1' | 'player2' = 'player1';

  constructor(private router: Router) {}

  getResultMessage() {
    return this.winner === 'player1' ? 'Hai vinto!' : 'Hai perso!';
  }

  getResultSubMessage() {
    return this.winner === 'player1' ? 'Complimenti!' : 'Peccato!';
  }

  playAgain() {
    console.log('Bottone Gioca di nuovo cliccato');
    this.router.navigate(['/login']);
  }
}
