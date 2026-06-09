import { ApiMatch } from './api-response.model';

export interface MatchOdds {
  readonly home: number | null;
  readonly draw: number | null;
  readonly away: number | null;
  readonly homeOrDraw: number | null;
  readonly drawOrAway: number | null;
}

export interface EnrichedMatch extends ApiMatch {
  readonly sportName: string;
  readonly regionName: string;
  readonly leagueName: string;
  readonly odds: MatchOdds;
}
