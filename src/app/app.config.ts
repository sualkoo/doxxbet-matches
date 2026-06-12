import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { DatePipe, DecimalPipe } from '@angular/common';
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
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideStore({ matches: matchesReducer }),
    provideEffects([{ loadMatchesEffect }]),
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25 })]),
    DatePipe,
    DecimalPipe,
    { provide: ENVIRONMENT, useValue: environment },
  ],
};
