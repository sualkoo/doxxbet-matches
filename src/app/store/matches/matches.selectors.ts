import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MatchesState } from './matches.state';
import { ApiOdd, EnrichedMatch, MatchOdds } from '../../core/models';

function resolveOdds(eventId: number, odds: Readonly<Record<string, ApiOdd>>): MatchOdds {
  return {
    home: odds[`${eventId}_1`]?.OddsRate ?? null,
    draw: odds[`${eventId}_X`]?.OddsRate ?? null,
    away: odds[`${eventId}_2`]?.OddsRate ?? null,
    homeOrDraw: odds[`${eventId}_1X`]?.OddsRate ?? null,
    drawOrAway: odds[`${eventId}_X2`]?.OddsRate ?? null,
  };
}

export const selectMatchesState = createFeatureSelector<MatchesState>('matches');

export const selectRawMatches = createSelector(selectMatchesState, (s) => s.data);
export const selectOdds = createSelector(selectMatchesState, (s) => s.odds);
export const selectLabels = createSelector(selectMatchesState, (s) => s.labels);
export const selectStatus = createSelector(selectMatchesState, (s) => s.status);
export const selectHighlightLevel = createSelector(selectMatchesState, (s) => s.highlightLevel);

export const selectEnrichedMatches = createSelector(
  selectRawMatches,
  selectOdds,
  selectLabels,
  (matches, odds, labels): EnrichedMatch[] =>
    matches.map((match) => {
      return {
        ...match,
        sportName: labels['SP_' + match.SportID]?.Name ?? 'Unknown',
        regionName: labels['RE_' + match.RegionID]?.Name ?? 'Unknown',
        leagueName: labels['LC_' + match.LeagueCupID]?.Name ?? 'Unknown',
        odds: resolveOdds(match.EventChanceTypeID, odds),
      };
    }),
);

export interface LeagueGroup {
  leagueId: string;
  leagueName: string;
  matches: EnrichedMatch[];
}

export interface SportGroup {
  sportName: string;
  sportId: number;
  leagues: LeagueGroup[];
}

export const selectGroupedMatches = createSelector(
  selectEnrichedMatches,
  (matches): SportGroup[] => {
    const sportMap = new Map<number, SportGroup>();

    for (const match of matches) {
      let sport = sportMap.get(match.SportID);
      if (!sport) {
        sport = { sportName: match.sportName, sportId: match.SportID, leagues: [] };
        sportMap.set(match.SportID, sport);
      }

      const leagueId = String(match.LeagueCupID);
      let league = sport.leagues.find((l) => l.leagueId === leagueId);
      if (!league) {
        league = { leagueId, leagueName: match.leagueName, matches: [] };
        sport.leagues.push(league);
      }
      league.matches.push(match);
    }

    return Array.from(sportMap.values())
      .sort((a, b) => a.sportName.localeCompare(b.sportName))
      .map((sport) => ({
        ...sport,
        leagues: [...sport.leagues].sort((a, b) => a.leagueName.localeCompare(b.leagueName)),
      }));
  },
);
