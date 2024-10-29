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
    return this.http.get<iGame>(`${this.gameUrl}/${id}`, {
      headers: { 'Accept': 'application/json' }
    })
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  post<T>(body: any): Observable<iGame> {
    return this.http.post<iGame>(`${this.gameUrl}`, JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json' }
    })
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  put<T>(id: string, body: any): Observable<iGame> {
    return this.http.put<iGame>(`${this.gameUrl}/:${id}`, JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json' }
    })
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  delete<T>(id: string): Observable<iGame> {
    return this.http.delete<iGame>(`${this.gameUrl}/`)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }
}
