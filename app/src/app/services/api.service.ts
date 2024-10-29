// src/app/core/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { iGame } from '../interfaces/game';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private gameUrl = environment.gameUrl;

  constructor(private http: HttpClient) {}

  get<T>(id: string): Observable<iGame> {
    return this.http.get<iGame>(`${this.gameUrl}/${id}`)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  getSavedGames<T>(): Observable<iGame[]> {
    return this.http.get<iGame[]>(`${this.gameUrl}`)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  post<T>(body: any): Observable<iGame> {
    return this.http.post<iGame>(`${this.gameUrl}`, body)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  put<T>(id: string, body: any): Observable<iGame> {
    const url = `${this.gameUrl}/${id}`;
    return this.http.put<iGame>(url, body)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('PUT request error:', error);
        return throwError(() => new Error(error.message || 'Server Error'));
      })
    );
  }

  delete<T>(id: string): Observable<iGame> {
    return this.http.delete<iGame>(`${this.gameUrl}/${id}`)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }
}
