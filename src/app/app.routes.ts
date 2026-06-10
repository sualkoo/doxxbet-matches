import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sport-landing/sport-landing.component').then((m) => m.SportLandingComponent),
  },
  {
    path: 'matches/:sportId',
    loadComponent: () =>
      import('./pages/match-list/match-list.component').then((m) => m.MatchListComponent),
  },
  { path: '**', redirectTo: '' },
];
