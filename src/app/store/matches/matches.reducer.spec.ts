import { ApiResponse } from '../../core/models/api-response.model';
import { MatchesActions } from './matches.actions';
import { matchesReducer } from './matches.reducer';
import { initialMatchesState } from './matches.state';

function createMatch(id: number) {
  return {
    EventID: id,
    EventName: `Match ${id}`,
    EventDate: '2026-06-15T09:05:00Z',
    BetType: '1X2',
    EventChanceTypeID: id,
    EventChanceTypeStatus: 'Open',
    LiveBetting: 'N',
    SportEventID: id,
    SportID: 1,
    RegionID: 100,
    LeagueCupID: 10,
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

describe('matchesReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = matchesReducer(undefined, { type: 'Unknown Action' });

    expect(state).toEqual(initialMatchesState);
  });

  it('should set loading status and clear error on loadMatches', () => {
    const previousState = {
      ...initialMatchesState,
      error: 'previous-error',
      highlightLevel: 2,
    };

    const state = matchesReducer(previousState, MatchesActions.loadMatches());

    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
    expect(state.highlightLevel).toBe(2);
  });

  it('should map payload into state on loadMatchesSuccess', () => {
    const response: ApiResponse = {
      EventChanceTypes: [createMatch(1)],
      Odds: {
        '1_1': {
          EventChanceTypeID: 1,
          OddsID: 11,
          OddsRate: 2.5,
          Status: 'Open',
          TipID: 'T1',
          TipType: '1',
          TipOrder: '1',
          CompetitorID: 1,
          PlayerID: 0,
        },
      },
      Labels: {
        SP_1: { Typ: 'SP', ID: 1, LanguageID: 'en', Name: 'Football' },
      },
    };

    const state = matchesReducer(
      initialMatchesState,
      MatchesActions.loadMatchesSuccess({ response }),
    );

    expect(state.data).toEqual(response.EventChanceTypes);
    expect(state.odds).toEqual(response.Odds);
    expect(state.labels).toEqual(response.Labels);
    expect(state.status).toBe('success');
    expect(state.error).toBeNull();
  });

  it('should default labels to empty object when omitted in success payload', () => {
    const response: ApiResponse = {
      EventChanceTypes: [createMatch(2)],
      Odds: {},
    };

    const state = matchesReducer(
      initialMatchesState,
      MatchesActions.loadMatchesSuccess({ response }),
    );

    expect(state.labels).toEqual({});
    expect(state.status).toBe('success');
  });

  it('should set error state on loadMatchesFailure', () => {
    const state = matchesReducer(
      {
        ...initialMatchesState,
        status: 'loading',
      },
      MatchesActions.loadMatchesFailure({ error: 'Network down' }),
    );

    expect(state.status).toBe('error');
    expect(state.error).toBe('Network down');
  });

  it('should step highlight level by direction', () => {
    const state1 = matchesReducer(
      initialMatchesState,
      MatchesActions.stepOddHighlight({ direction: 1 }),
    );
    const state2 = matchesReducer(state1, MatchesActions.stepOddHighlight({ direction: -1 }));

    expect(state1.highlightLevel).toBe(1);
    expect(state2.highlightLevel).toBe(0);
  });
});
