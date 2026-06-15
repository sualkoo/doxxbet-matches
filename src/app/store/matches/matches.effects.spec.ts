import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { firstValueFrom, of, ReplaySubject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MatchesService } from '../../core/services/matches.service';
import { MatchesActions } from './matches.actions';
import { loadMatchesEffect } from './matches.effects';

describe('loadMatchesEffect', () => {
  let actions$: ReplaySubject<Action>;
  let matchesService: { getMatches: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    matchesService = {
      getMatches: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Actions,
          useValue: actions$,
        },
        {
          provide: MatchesService,
          useValue: matchesService,
        },
      ],
    });
  });

  it('should dispatch loadMatchesSuccess when service succeeds', async () => {
    const response = {
      EventChanceTypes: [],
      Odds: {},
      Labels: {},
    };
    matchesService.getMatches.mockReturnValue(of(response));

    const effect$ = TestBed.runInInjectionContext(() => loadMatchesEffect());
    const resultPromise = firstValueFrom(effect$);

    actions$.next(MatchesActions.loadMatches());

    await expect(resultPromise).resolves.toEqual(MatchesActions.loadMatchesSuccess({ response }));
    expect(matchesService.getMatches).toHaveBeenCalledTimes(1);
  });

  it('should dispatch loadMatchesFailure with error message when service fails', async () => {
    matchesService.getMatches.mockReturnValue(throwError(() => new Error('Boom')));

    const effect$ = TestBed.runInInjectionContext(() => loadMatchesEffect());
    const resultPromise = firstValueFrom(effect$);

    actions$.next(MatchesActions.loadMatches());

    await expect(resultPromise).resolves.toEqual(
      MatchesActions.loadMatchesFailure({ error: 'Boom' }),
    );
  });

  it('should fallback to Unknown error when thrown error has no message', async () => {
    matchesService.getMatches.mockReturnValue(throwError(() => ({ code: 500 })));

    const effect$ = TestBed.runInInjectionContext(() => loadMatchesEffect());
    const resultPromise = firstValueFrom(effect$);

    actions$.next(MatchesActions.loadMatches());

    await expect(resultPromise).resolves.toEqual(
      MatchesActions.loadMatchesFailure({ error: 'Unknown error' }),
    );
  });
});
