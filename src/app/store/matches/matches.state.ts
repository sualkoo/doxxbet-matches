import { ApiLabel, ApiMatch, ApiOdd } from '../../core/models';

export interface MatchesState {
  readonly data: readonly ApiMatch[];
  readonly odds: Readonly<Record<string, ApiOdd>>;
  readonly labels: Readonly<Record<string, ApiLabel>>;
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly collapsedLeagues: readonly string[];
  readonly highlightLevel: number;
}

export const initialMatchesState: MatchesState = {
  data: [],
  odds: {},
  labels: {},
  status: 'idle',
  error: null,
  collapsedLeagues: [],
  highlightLevel: 0,
};
