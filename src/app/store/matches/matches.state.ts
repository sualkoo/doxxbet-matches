import { ApiLabel, ApiMatch, ApiOdd } from '../../core/models/api-response.model';

export interface MatchesState {
  readonly data: readonly ApiMatch[];
  readonly odds: Readonly<Record<string, ApiOdd>>;
  readonly labels: Readonly<Record<string, ApiLabel>>;
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly highlightLevel: number;
}

export const initialMatchesState: MatchesState = {
  data: [],
  odds: {},
  labels: {},
  status: 'idle',
  error: null,
  highlightLevel: 0,
};
