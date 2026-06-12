import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'DOXXbet — Matches',
    loadComponent: () =>
      import('./pages/match-list/match-list.component').then((m) => m.MatchListComponent),
  },
  { path: '**', redirectTo: '' },
];
