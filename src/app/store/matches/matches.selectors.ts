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
      const id = match.EventChanceTypeID;
      const getOdd = (tipType: string): number | null => odds[`${id}_${tipType}`]?.OddsRate ?? null;

      const enrichedOdds: MatchOdds = {
        home: getOdd('1'),
        draw: getOdd('X'),
        away: getOdd('2'),
        homeOrDraw: getOdd('1X'),
        drawOrAway: getOdd('X2'),
      };

      return {
        ...match,
        sportName: labels['SP_' + match.SportID]?.Name ?? 'Unknown',
        regionName: labels['RE_' + match.RegionID]?.Name ?? 'Unknown',
        leagueName: labels['LC_' + match.LeagueCupID]?.Name ?? 'Unknown',
        odds: enrichedOdds,
      };
    }),
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

// ─── Highlight selectors ──────────────────────────────────────────────────────

export const selectSortedUniqueOddValues = createSelector(
  selectEnrichedMatches,
  (matches): number[] => {
    const allValues = matches.flatMap((m) =>
      [m.odds.home, m.odds.draw, m.odds.away, m.odds.homeOrDraw, m.odds.drawOrAway].filter(
        (v): v is number => v !== null,
      ),
    );
    return [...new Set(allValues)].sort((a, b) => b - a);
  },
);

export const selectCurrentHighlightedOddValue = createSelector(
  selectSortedUniqueOddValues,
  selectHighlightLevel,
  (sortedValues, highlightLevel): number | null => {
    if (sortedValues.length === 0) return null;
    return sortedValues[highlightLevel % sortedValues.length];
  },
);

// ─── Sports list ──────────────────────────────────────────────────────────────

export const selectSports = createSelector(
  selectGroupedMatches,
  (groups): { sportId: number; sportName: string; matchCount: number }[] =>
    groups.map((g) => ({
      sportId: g.sportId,
      sportName: g.sportName,
      matchCount: g.leagues.reduce((sum, l) => sum + l.matches.length, 0),
    })),
);

// ─── Countries list ───────────────────────────────────────────────────────────

export interface CountryItem {
  regionId: number;
  regionName: string;
  matchCount: number;
}

export const selectCountries = createSelector(selectEnrichedMatches, (matches): CountryItem[] => {
  const map = new Map<number, CountryItem>();
  for (const m of matches) {
    const existing = map.get(m.RegionID);
    if (existing) {
      map.set(m.RegionID, { ...existing, matchCount: existing.matchCount + 1 });
    } else {
      map.set(m.RegionID, { regionId: m.RegionID, regionName: m.regionName, matchCount: 1 });
    }
  }
  return [...map.values()].sort((a, b) => a.regionName.localeCompare(b.regionName));
});
