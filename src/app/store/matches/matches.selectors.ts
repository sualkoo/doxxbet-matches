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
  /** ISO 3166-1 alpha-2 country code (lowercase), used to build a flag image URL. Null when unknown. */
  flagCode: string | null;
}

// FIFA / IOC three-letter codes → ISO 3166-1 alpha-2 (lowercase).
const COUNTRY_ID_TO_ALPHA2: Readonly<Record<string, string>> = {
  ALB: 'al',
  ALG: 'dz',
  AND: 'ad',
  ANG: 'ao',
  ARG: 'ar',
  ARM: 'am',
  AUS: 'au',
  AUT: 'at',
  AZE: 'az',
  BEL: 'be',
  BIH: 'ba',
  BLR: 'by',
  BOL: 'bo',
  BRA: 'br',
  BUL: 'bg',
  CAN: 'ca',
  CHI: 'cl',
  CHN: 'cn',
  CMR: 'cm',
  COL: 'co',
  CRC: 'cr',
  CRO: 'hr',
  CYP: 'cy',
  CZE: 'cz',
  DEN: 'dk',
  ECU: 'ec',
  EGY: 'eg',
  ENG: 'gb',
  ESP: 'es',
  EST: 'ee',
  FIN: 'fi',
  FRA: 'fr',
  GEO: 'ge',
  GER: 'de',
  GRE: 'gr',
  HUN: 'hu',
  INA: 'id',
  IND: 'in',
  IRL: 'ie',
  IRN: 'ir',
  ISL: 'is',
  ISR: 'il',
  ITA: 'it',
  JPN: 'jp',
  KAZ: 'kz',
  KOR: 'kr',
  KSA: 'sa',
  LAT: 'lv',
  LTU: 'lt',
  LUX: 'lu',
  MAR: 'ma',
  MEX: 'mx',
  MKD: 'mk',
  MLT: 'mt',
  MNE: 'me',
  NED: 'nl',
  NGA: 'ng',
  NIR: 'gb',
  NOR: 'no',
  NZL: 'nz',
  PAR: 'py',
  PER: 'pe',
  POL: 'pl',
  POR: 'pt',
  QAT: 'qa',
  ROU: 'ro',
  RSA: 'za',
  RUS: 'ru',
  SCO: 'gb',
  SRB: 'rs',
  SVK: 'sk',
  SVN: 'si',
  SWE: 'se',
  SUI: 'ch',
  THA: 'th',
  TUN: 'tn',
  TUR: 'tr',
  UAE: 'ae',
  UKR: 'ua',
  URU: 'uy',
  USA: 'us',
  UZB: 'uz',
  VEN: 've',
  WAL: 'gb',
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
        flagCode: toAlpha2(m.CountryID),
      });
    }
  }
  return [...map.values()].sort((a, b) => a.regionName.localeCompare(b.regionName));
});
