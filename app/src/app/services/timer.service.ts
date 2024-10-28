import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  //tiene traccia della sottoscrizione al timer
  //e permette di gestire l'avvio e l'arresto del timer in modo efficace e sicuro.
  private timerSubscription: Subscription | null = null;

  private countdownInterval: number = 15000; //15 secondi

  constructor(private gameService: GameService) {
    this.gameService.gamestate$.subscribe((state) => {
      //evita che il timer venga resettato una volta che il gioco è terminato,
      // impedendo così che il timer continui a funzionare dopo che il gioco è finito.
      if (!state.isGameOver) {
        this.resetTimer(state.timer);
      }
    });
  }

  startTimer(): void {
    // Ferma qualsiasi timer esistente per evitare che ci siano più timer attivi contemporaneamente
    this.stopTimer();

    // Avvia un nuovo timer con un intervallo di tempo definito (1 secondo in questo caso)
    this.timerSubscription = interval(this.countdownInterval).subscribe(() => {
      // Ottiene lo stato attuale del gioco
      const state = this.gameService.gameStateSubject.value;

      // Verifica se il timer è ancora maggiore di 0
      if (state.timer > 0) {
        // Se il timer è ancora in corso, decrementa il valore del timer di 1
        // e aggiorna lo stato del gioco con il nuovo valore del timer
        this.gameService.gameStateSubject.next({
          ...state, // Copia l'attuale stato
          timer: state.timer - 1, // Riduce il timer di 1
        });
      } else {
        // Se il timer è arrivato a 0, il tempo è scaduto
        // Determina il vincitore in base al giocatore attuale
        const winner =
          state.currentPlayer === 'Player1' ? 'Player2' : 'Player1';

        // Imposta il vincitore nel servizio di gioco
        this.gameService.setWinner(winner);

        // Ferma il timer dato che il gioco è finito
        this.stopTimer();
      }
    });
  }

  resetTimer(initialTime: number): void {
    // Ferma qualsiasi timer attivo per evitare conflitti
    this.stopTimer();

    // Imposta il timer al valore iniziale specificato (initialTime) aggiornando lo stato del gioco
    this.gameService.gameStateSubject.next({
      ...this.gameService.gameStateSubject.value, // Copia l'attuale stato del gioco
      timer: initialTime, // Imposta il timer al valore iniziale passato come argomento
    });

    // Avvia un nuovo timer per iniziare il countdown dal valore appena impostato
    this.startTimer();
  }

  stopTimer(): void {
    // Controlla se esiste una sottoscrizione attiva al timer
    if (this.timerSubscription) {
      // Se esiste, chiama unsubscribe per fermare il timer e interrompere il flusso di eventi
      this.timerSubscription.unsubscribe();

      // Imposta timerSubscription a null per indicare che il timer è stato fermato
      this.timerSubscription = null;
    }
  }
}
