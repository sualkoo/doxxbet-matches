import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { MatchesService } from '../../core/services/matches.service';
import { MatchesActions } from './matches.actions';

export const loadMatchesEffect = createEffect(
  (actions$ = inject(Actions), matchesService = inject(MatchesService)) => {
    return actions$.pipe(
      ofType(MatchesActions.loadMatches),
      switchMap(() =>
        matchesService.getMatches().pipe(
          map((response) => MatchesActions.loadMatchesSuccess({ response })),
          catchError((err) =>
            of(MatchesActions.loadMatchesFailure({ error: err.message ?? 'Unknown error' }))
          )
        )
      )
    );
  },
  { functional: true }
);
