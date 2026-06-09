import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { DatePipe } from '@angular/common';
import { matchesReducer } from './store/matches/matches.reducer';
import { loadMatchesEffect } from './store/matches/matches.effects';
import { ENVIRONMENT } from '../environments/environment.token';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes),
    provideStore({ matches: matchesReducer }),
    provideEffects([{ loadMatchesEffect }]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    DatePipe,
    { provide: ENVIRONMENT, useValue: environment },
  ],
};
