import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  player1: { playerName1: string; playerColor1: string } = {
    playerName1: '',
    playerColor1: '',
  };
  player2: { playerName2: string; playerColor2: string } = {
    playerName2: '',
    playerColor2: '',
  };

  colors: string[] = ['red', 'blue', 'green', 'yellow'];

  onSubmit() {
    if (this.player1.playerColor1 === this.player2.playerColor2) {
      alert('I colori dei giocatori devono essere diversi');
      return;
    }
    if (!this.player1.playerName1 || !this.player2.playerName2) {
      alert('Inserisci i nomi dei giocatori');
      return;
    }
    if (!this.player1.playerColor1 || !this.player2.playerColor2) {
      alert('Inserisci i colori dei giocatori');
      return;
    }
    console.log('Utente1', this.player1);
    console.log('Utente2', this.player2);

    this.resetForm();
  }

  resetForm() {
    this.player1 = {
      playerName1: '',
      playerColor1: '',
    };
    this.player2 = {
      playerName2: '',
      playerColor2: '',
    };
  }
}
