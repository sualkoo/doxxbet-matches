import { MatchesState } from './matches.state';
import {
  selectEnrichedMatches,
  selectGroupedMatches,
  selectHighlightLevel,
  selectMatchesState,
  selectOdds,
  selectRawMatches,
  selectStatus,
} from './matches.selectors';

function createMatch(
  id: number,
  sportId: number,
  regionId: number,
  leagueCupId: number,
  name: string,
) {
  return {
    EventID: id,
    EventName: name,
    EventDate: '2026-06-15T09:05:00Z',
    BetType: '1X2',
    EventChanceTypeID: id,
    EventChanceTypeStatus: 'Open',
    LiveBetting: 'N',
    SportEventID: id,
    SportID: sportId,
    RegionID: regionId,
    LeagueCupID: leagueCupId,
    ChanceTypeID: '1',
    ChanceTypeName: 'Match Winner',
    SideBet: 0,
    ActualGamePartID: '0',
    ActualGamePartTime: 0,
    LiveFeedReference: 0,
    LiveBettingView: 0,
    ChannelID: 'main',
    EventType: 'PREMATCH',
    CountryID: 'GB',
    HasStatistics: false,
    HasBetradarHostedStatistics: false,
    SeasonID: 2026,
    BetradarSportID: 1,
    HasMatchTracker: false,
    BetBuilderID: 0,
    Provider: 'Provider',
    BetradarStatisticsUrn: '',
    BetradarStatisticsUrl: '',
    Widgets: [],
  };
}

describe('matches selectors', () => {
  const state: MatchesState = {
    data: [
      createMatch(10, 2, 20, 200, 'Tigers vs Hawks'),
      createMatch(11, 1, 10, 100, 'United vs City'),
      createMatch(12, 1, 10, 101, 'Lions vs Bears'),
    ],
    odds: {
      '10_1': {
        EventChanceTypeID: 10,
        OddsID: 1,
        OddsRate: 2.4,
        Status: 'Open',
        TipID: 'A',
        TipType: '1',
        TipOrder: '1',
        CompetitorID: 1,
        PlayerID: 0,
      },
      '10_X': {
        EventChanceTypeID: 10,
        OddsID: 2,
        OddsRate: 3.1,
        Status: 'Open',
        TipID: 'B',
        TipType: 'X',
        TipOrder: '2',
        CompetitorID: 2,
        PlayerID: 0,
      },
      '11_2': {
        EventChanceTypeID: 11,
        OddsID: 3,
        OddsRate: 1.8,
        Status: 'Open',
        TipID: 'C',
        TipType: '2',
        TipOrder: '3',
        CompetitorID: 3,
        PlayerID: 0,
      },
      '12_1X': {
        EventChanceTypeID: 12,
        OddsID: 4,
        OddsRate: 1.5,
        Status: 'Open',
        TipID: 'D',
        TipType: '1X',
        TipOrder: '4',
        CompetitorID: 4,
        PlayerID: 0,
      },
    },
    labels: {
      SP_1: { Typ: 'SP', ID: 1, LanguageID: 'en', Name: 'Football' },
      SP_2: { Typ: 'SP', ID: 2, LanguageID: 'en', Name: 'Basketball' },
      RE_10: { Typ: 'RE', ID: 10, LanguageID: 'en', Name: 'Europe' },
      LC_100: { Typ: 'LC', ID: 100, LanguageID: 'en', Name: 'Premier League' },
      LC_101: { Typ: 'LC', ID: 101, LanguageID: 'en', Name: 'Championship' },
      LC_200: { Typ: 'LC', ID: 200, LanguageID: 'en', Name: 'NBA' },
    },
    status: 'success',
    error: null,
    highlightLevel: 3,
  };

  it('should expose basic feature selectors', () => {
    const root = { matches: state };

    expect(selectMatchesState(root)).toEqual(state);
    expect(selectRawMatches(root)).toEqual(state.data);
    expect(selectOdds(root)).toEqual(state.odds);
    expect(selectStatus(root)).toBe('success');
    expect(selectHighlightLevel(root)).toBe(3);
  });

  it('should enrich matches with labels and resolved odds', () => {
    const enriched = selectEnrichedMatches.projector(state.data, state.odds, state.labels);

    expect(enriched[0].sportName).toBe('Basketball');
    expect(enriched[0].regionName).toBe('Unknown');
    expect(enriched[0].leagueName).toBe('NBA');
    expect(enriched[0].odds.home).toBe(2.4);
    expect(enriched[0].odds.draw).toBe(3.1);
    expect(enriched[0].odds.away).toBeNull();
    expect(enriched[2].odds.homeOrDraw).toBe(1.5);
  });

  it('should group matches by sport and league and sort both levels by name', () => {
    const enriched = selectEnrichedMatches.projector(state.data, state.odds, state.labels);
    const grouped = selectGroupedMatches.projector(enriched);

    expect(grouped.map((sport) => sport.sportName)).toEqual(['Basketball', 'Football']);

    const football = grouped[1];
    expect(football.leagues.map((league) => league.leagueName)).toEqual([
      'Championship',
      'Premier League',
    ]);
    expect(football.leagues[0].matches).toHaveLength(1);
  });
});
