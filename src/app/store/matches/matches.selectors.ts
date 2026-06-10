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
//
// Highlight cycling is computed per-page in MatchListComponent because it must be
// scoped to the currently visible (country-filtered) leagues. selectHighlightLevel
// above provides the shared counter that the page logic wraps with modulo.

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
  flagEmoji: string | null;
}

const COUNTRY_ID_TO_ALPHA2: Readonly<Record<string, string>> = {
  ARG: 'ar',
  AUS: 'au',
  BRA: 'br',
  BUL: 'bg',
  CYP: 'cy',
  CZE: 'cz',
  DEN: 'dk',
  ENG: 'gb',
  ESP: 'es',
  FRA: 'fr',
  GRE: 'gr',
  INA: 'id',
  ITA: 'it',
};

function toAlpha2(countryId: string | undefined): string | null {
  if (!countryId) return null;
  const normalized = countryId.trim().toUpperCase();
  if (!normalized) return null;

  if (normalized.length === 2) {
    return normalized.toLowerCase();
  }

  return COUNTRY_ID_TO_ALPHA2[normalized] ?? null;
}

function toFlagEmoji(countryId: string | undefined): string | null {
  const alpha2 = toAlpha2(countryId);
  if (!alpha2) return null;

  const [first, second] = alpha2.toUpperCase();
  if (!first || !second) return null;

  const base = 0x1f1e6;
  const firstCode = first.charCodeAt(0) - 65;
  const secondCode = second.charCodeAt(0) - 65;

  if (firstCode < 0 || firstCode > 25 || secondCode < 0 || secondCode > 25) {
    return null;
  }

  return String.fromCodePoint(base + firstCode, base + secondCode);
}

export const selectCountries = createSelector(selectEnrichedMatches, (matches): CountryItem[] => {
  const map = new Map<number, CountryItem>();
  for (const m of matches) {
    const existing = map.get(m.RegionID);
    if (existing) {
      map.set(m.RegionID, { ...existing, matchCount: existing.matchCount + 1 });
    } else {
      map.set(m.RegionID, {
        regionId: m.RegionID,
        regionName: m.regionName,
        matchCount: 1,
        flagEmoji: toFlagEmoji(m.CountryID),
      });
    }
  }
  return [...map.values()].sort((a, b) => a.regionName.localeCompare(b.regionName));
});
