import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePipe, DecimalPipe } from '@angular/common';
import { vi } from 'vitest';
import { EnrichedMatch } from '../../core/models/enriched-match.model';
import { LeagueGroup } from '../../store/matches/matches.selectors';
import { MatchRowComponent } from '../match-row/match-row.component';
import { LeagueSectionComponent } from './league-section.component';

function createEnrichedMatch(id: number, name: string): EnrichedMatch {
  return {
    EventID: id,
    EventName: name,
    EventDate: '2026-06-15T12:00:00Z',
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
    ChannelID: 'ch',
    EventType: 'PREMATCH',
    CountryID: 'GB',
    HasStatistics: false,
    HasBetradarHostedStatistics: false,
    SeasonID: 1,
    BetradarSportID: 1,
    HasMatchTracker: false,
    BetBuilderID: 0,
    Provider: 'Provider',
    BetradarStatisticsUrn: '',
    BetradarStatisticsUrl: '',
    Widgets: [],
    sportName: 'Football',
    regionName: 'Europe',
    leagueName: 'Premier League',
    odds: {
      home: 2.35,
      draw: 3.2,
      away: 2.75,
      homeOrDraw: 1.4,
      drawOrAway: 1.6,
    },
  };
}

describe('LeagueSectionComponent', () => {
  let component: LeagueSectionComponent;
  let fixture: ComponentFixture<LeagueSectionComponent>;

  const league: LeagueGroup = {
    leagueId: '10',
    leagueName: 'Premier League',
    matches: [
      createEnrichedMatch(1, 'Arsenal vs Chelsea'),
      createEnrichedMatch(2, 'Liverpool vs Everton'),
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueSectionComponent],
      providers: [DatePipe, DecimalPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(LeagueSectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('league', league);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render league title and rows when expanded', () => {
    fixture.componentRef.setInput('league', league);
    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const title = nativeElement.querySelector('.league-title');
    const rows = fixture.debugElement.queryAll(By.directive(MatchRowComponent));

    expect(title?.textContent?.trim()).toBe('Premier League');
    expect(nativeElement.querySelector('table')).toBeTruthy();
    expect(rows.length).toBe(2);
  });

  it('should hide table and set collapsed icon class when collapsed', () => {
    fixture.componentRef.setInput('league', league);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const icon = nativeElement.querySelector('mat-icon');

    expect(nativeElement.querySelector('table')).toBeNull();
    expect(icon?.classList.contains('collapsed')).toBe(true);
  });

  it('should emit league id when toggled', () => {
    fixture.componentRef.setInput('league', league);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.toggled, 'emit');

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith('10');
  });

  it('should pass highlighted odd to each match row', () => {
    fixture.componentRef.setInput('league', league);
    fixture.componentRef.setInput('highlightedOdd', 2.35);
    fixture.detectChanges();

    const rowComponents = fixture.debugElement
      .queryAll(By.directive(MatchRowComponent))
      .map((de) => de.componentInstance as MatchRowComponent);

    expect(rowComponents.length).toBe(2);
    expect(rowComponents.every((row) => row.highlightedOdd() === 2.35)).toBe(true);
  });
});
