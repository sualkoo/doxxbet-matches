import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ApiResponse } from '../models';
import { ENVIRONMENT } from '../../../environments/environment.token';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  getMatches(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.env.apiUrl).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch matches:', error);
        return throwError(() => error);
      })
    );
  }
}
