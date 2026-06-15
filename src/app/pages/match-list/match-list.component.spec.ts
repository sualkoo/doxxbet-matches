import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, DecimalPipe } from '@angular/common';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import { MatchesActions } from '../../store/matches/matches.actions';
import {
  selectGroupedMatches,
  selectHighlightLevel,
  selectStatus,
  SportGroup,
} from '../../store/matches/matches.selectors';
import { MatchListComponent } from './match-list.component';

function createComponent(): ComponentFixture<MatchListComponent> {
  return TestBed.createComponent(MatchListComponent);
}

function createMatch(
  id: number,
  overrides?: Partial<SportGroup['leagues'][number]['matches'][number]>,
) {
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
    sportName: 'Football',
    regionName: 'Europe',
    leagueName: 'League',
    odds: {
      home: 2.5,
      draw: 2.1,
      away: 1.9,
      homeOrDraw: 1.7,
      drawOrAway: null,
    },
    ...overrides,
  };
}

describe('MatchListComponent', () => {
  let store: MockStore;

  const groupedMatches: SportGroup[] = [
    {
      sportId: 1,
      sportName: 'Football',
      leagues: [
        {
          leagueId: '10',
          leagueName: 'Premier League',
          matches: [createMatch(1)],
        },
        {
          leagueId: '11',
          leagueName: 'La Liga',
          matches: [
            createMatch(2, {
              odds: {
                home: 3.2,
                draw: 2.5,
                away: 1.9,
                homeOrDraw: null,
                drawOrAway: 1.6,
              },
            }),
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchListComponent],
      providers: [
        provideRouter([]),
        DatePipe,
        DecimalPipe,
        provideMockStore({
          selectors: [
            { selector: selectStatus, value: 'idle' },
            { selector: selectHighlightLevel, value: 0 },
            { selector: selectGroupedMatches, value: groupedMatches },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    const fixture = createComponent();
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should dispatch loadMatches on init when status is idle', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = createComponent();

    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(MatchesActions.loadMatches());
  });

  it('should not dispatch loadMatches on init when status is not idle', () => {
    store.overrideSelector(selectStatus, 'success');
    store.refreshState();

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = createComponent();

    fixture.detectChanges();

    expect(dispatchSpy).not.toHaveBeenCalledWith(MatchesActions.loadMatches());
  });

  it('should dispatch retry and highlight actions', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.retry();
    component.cycleHighlightNext();
    component.cycleHighlightPrev();

    expect(dispatchSpy).toHaveBeenCalledWith(MatchesActions.loadMatches());
    expect(dispatchSpy).toHaveBeenCalledWith(MatchesActions.stepOddHighlight({ direction: 1 }));
    expect(dispatchSpy).toHaveBeenCalledWith(MatchesActions.stepOddHighlight({ direction: -1 }));
  });

  it('should filter visible leagues by selected league id and toggle selected value', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    expect(component.visibleLeagues().map((league) => league.leagueId)).toEqual(['10', '11']);

    component.selectLeague('11');
    expect(component.selectedLeagueId()).toBe('11');
    expect(component.visibleLeagues().map((league) => league.leagueId)).toEqual(['11']);

    component.selectLeague('11');
    expect(component.selectedLeagueId()).toBeNull();
    expect(component.visibleLeagues().map((league) => league.leagueId)).toEqual(['10', '11']);
  });

  it('should provide sorted unique visible odds for toolbar highlighting', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    expect(component.visibleSortedUniqueOddValues()).toEqual([3.2, 2.5, 2.1, 1.9, 1.7, 1.6]);
  });

  it('should toggle collapse state for all visible leagues and individual leagues', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    expect(component.allLeaguesCollapsed()).toBe(false);

    component.toggleAllVisibleLeagues();
    expect(component.allLeaguesCollapsed()).toBe(true);
    expect(component.collapsedLeagues().has('10')).toBe(true);
    expect(component.collapsedLeagues().has('11')).toBe(true);

    component.toggleLeague('10');
    expect(component.collapsedLeagues().has('10')).toBe(false);
    expect(component.allLeaguesCollapsed()).toBe(false);

    component.toggleAllVisibleLeagues();
    expect(component.allLeaguesCollapsed()).toBe(true);

    component.toggleAllVisibleLeagues();
    expect(component.allLeaguesCollapsed()).toBe(false);
    expect(component.collapsedLeagues().size).toBe(0);
  });
});
