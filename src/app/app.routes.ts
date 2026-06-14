import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'DOXXbet',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then((m) => m.LandingPageComponent),
  },
  {
    path: 'matches',
    title: 'DOXXbet — Matches',
    loadComponent: () =>
      import('./pages/match-list/match-list.component').then((m) => m.MatchListComponent),
  },
  { path: '**', redirectTo: '' },
];
