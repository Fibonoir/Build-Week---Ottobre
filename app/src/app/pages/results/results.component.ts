import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent {
  @Input() winner: 'player1' | 'player2' = 'player1';

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
