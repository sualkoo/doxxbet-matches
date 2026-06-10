import { createReducer, on } from '@ngrx/store';
import { MatchesActions } from './matches.actions';
import { initialMatchesState } from './matches.state';

export const matchesReducer = createReducer(
  initialMatchesState,

  on(MatchesActions.loadMatches, (state) => ({
    ...state,
    status: 'loading' as const,
    error: null,
  })),

  on(MatchesActions.loadMatchesSuccess, (state, { response }) => ({
    ...state,
    data: response.EventChanceTypes,
    odds: response.Odds,
    labels: response.Labels ?? {},
    status: 'success' as const,
    error: null,
  })),

  on(MatchesActions.loadMatchesFailure, (state, { error }) => ({
    ...state,
    status: 'error' as const,
    error,
  })),

  on(MatchesActions.stepOddHighlight, (state, { direction }) => ({
    ...state,
    highlightLevel: state.highlightLevel + direction,
  })),
);
