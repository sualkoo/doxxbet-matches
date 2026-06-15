import { DatePipe, DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrichedMatch } from '../../core/models/enriched-match.model';
import { MatchRowComponent } from './match-row.component';

function createMatch(overrides?: Partial<EnrichedMatch>): EnrichedMatch {
  return {
    EventID: 1,
    EventName: 'Arsenal vs Chelsea',
    EventDate: '2026-06-15T09:05:00Z',
    BetType: '1X2',
    EventChanceTypeID: 101,
    EventChanceTypeStatus: 'Open',
    LiveBetting: 'N',
    SportEventID: 1001,
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
    leagueName: 'Premier League',
    odds: {
      home: 2.35,
      draw: 3.2,
      away: 2.75,
      homeOrDraw: 1.4,
      drawOrAway: null,
    },
    ...overrides,
  };
}

describe('MatchRowComponent', () => {
  let fixture: ComponentFixture<MatchRowComponent>;
  let component: MatchRowComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchRowComponent],
      providers: [DatePipe, DecimalPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchRowComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('match', createMatch());
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should return true only for highlighted odd value', () => {
    fixture.componentRef.setInput('match', createMatch());
    fixture.componentRef.setInput('highlightedOdd', 2.35);
    fixture.detectChanges();

    expect(component.isOddHighlighted(2.35)).toBe(true);
    expect(component.isOddHighlighted(3.2)).toBe(false);
    expect(component.isOddHighlighted(null)).toBe(false);
  });

  it('should render formatted row values', () => {
    fixture.componentRef.setInput('match', createMatch());
    fixture.detectChanges();

    const cells = Array.from(fixture.nativeElement.querySelectorAll('td')) as HTMLElement[];

    expect(cells.length).toBe(10);
    expect(cells[0].textContent?.trim()).toBe('Arsenal vs Chelsea');
    expect(cells[2].textContent?.trim()).toBe('Football');
    expect(cells[3].textContent?.trim()).toBe('Europe');
    expect(cells[4].textContent?.trim()).toBe('Premier League');
    expect(cells[5].textContent?.trim()).toBe('2.35');
    expect(cells[6].textContent?.trim()).toBe('3.20');
    expect(cells[9].textContent?.trim()).toBe('—');
  });

  it('should apply highlight class only on matching odd cells', () => {
    fixture.componentRef.setInput('match', createMatch());
    fixture.componentRef.setInput('highlightedOdd', 3.2);
    fixture.detectChanges();

    const cells = Array.from(fixture.nativeElement.querySelectorAll('td')) as HTMLElement[];
    const oddCells = cells.slice(5, 10);

    expect(oddCells[0].classList.contains('odd--highlighted')).toBe(false);
    expect(oddCells[1].classList.contains('odd--highlighted')).toBe(true);
    expect(oddCells[2].classList.contains('odd--highlighted')).toBe(false);
    expect(oddCells[3].classList.contains('odd--highlighted')).toBe(false);
    expect(oddCells[4].classList.contains('odd--highlighted')).toBe(false);
  });
});
