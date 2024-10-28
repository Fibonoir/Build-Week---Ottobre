// src/app/core/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { iApiResponse } from '../interfaces/game';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private gameUrl = environment.gameUrl; // Sostituisci con l'URL reale della tua API

  constructor(private http: HttpClient) {}

  get<T>(id: string): Observable<iApiResponse<T>> {
    return this.http.get<iApiResponse<T>>(`${this.gameUrl}/:${id}`)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  post<T>(body: any): Observable<iApiResponse<T>> {
    return this.http.post<iApiResponse<T>>(`${this.gameUrl}`, body)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  put<T>(id: string, body: any): Observable<iApiResponse<T>> {
    return this.http.put<iApiResponse<T>>(`${this.gameUrl}/:${id}`, body)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }

  delete<T>(id: string): Observable<iApiResponse<T>> {
    return this.http.delete<iApiResponse<T>>(`${this.gameUrl}/`)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }));
  }
}
