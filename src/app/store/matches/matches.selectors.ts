import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MatchesState } from './matches.state';
import { EnrichedMatch, MatchOdds } from '../../core/models';

// ─── Base selectors ───────────────────────────────────────────────────────────

export const selectMatchesState = createFeatureSelector<MatchesState>('matches');

export const selectRawMatches = createSelector(selectMatchesState, (s) => s.data);
export const selectOdds = createSelector(selectMatchesState, (s) => s.odds);
export const selectLabels = createSelector(selectMatchesState, (s) => s.labels);
export const selectStatus = createSelector(selectMatchesState, (s) => s.status);
export const selectError = createSelector(selectMatchesState, (s) => s.error);
export const selectCollapsedLeagues = createSelector(selectMatchesState, (s) => s.collapsedLeagues);
export const selectHighlightLevel = createSelector(selectMatchesState, (s) => s.highlightLevel);

// ─── Enriched matches ─────────────────────────────────────────────────────────

export const selectEnrichedMatches = createSelector(
  selectRawMatches,
  selectOdds,
  selectLabels,
  (matches, odds, labels): EnrichedMatch[] =>
    matches.map((match) => {
      const matchOdds = odds.filter((o) => o.EventChanceTypeID === match.EventChanceTypeID);
      const getOdd = (typeId: number): number | null =>
        matchOdds.find((o) => o.OddTypeID === typeId)?.Value ?? null;

      const enrichedOdds: MatchOdds = {
        home: getOdd(1),
        draw: getOdd(2),
        away: getOdd(3),
        homeOrDraw: getOdd(4),
        drawOrAway: getOdd(5),
      };

      return {
        ...match,
        sportName: labels['SP_' + match.SportID] ?? 'Unknown',
        regionName: labels['RE_' + match.RegionID] ?? 'Unknown',
        leagueName: labels['LC_' + match.LeagueID] ?? 'Unknown',
        odds: enrichedOdds,
      };
    })
);

// ─── Grouping ─────────────────────────────────────────────────────────────────

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

      const leagueId = String(match.LeagueID);
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
  }
);

// ─── Highlight selectors ──────────────────────────────────────────────────────

export const selectSortedUniqueOddValues = createSelector(
  selectEnrichedMatches,
  (matches): number[] => {
    const allValues = matches.flatMap((m) =>
      [m.odds.home, m.odds.draw, m.odds.away, m.odds.homeOrDraw, m.odds.drawOrAway].filter(
        (v): v is number => v !== null
      )
    );
    return [...new Set(allValues)].sort((a, b) => b - a);
  }
);

export const selectCurrentHighlightedOddValue = createSelector(
  selectSortedUniqueOddValues,
  selectHighlightLevel,
  (sortedValues, highlightLevel): number | null => {
    if (sortedValues.length === 0) return null;
    return sortedValues[highlightLevel % sortedValues.length];
  }
);
