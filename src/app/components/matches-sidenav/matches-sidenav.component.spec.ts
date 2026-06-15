import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { SportGroup, selectGroupedMatches } from '../../store/matches/matches.selectors';
import { MatchesSidenavComponent } from './matches-sidenav.component';

describe('MatchesSidenavComponent', () => {
  let fixture: ComponentFixture<MatchesSidenavComponent>;
  let component: MatchesSidenavComponent;

  const groupedMatches: SportGroup[] = [
    {
      sportId: 1,
      sportName: 'Football',
      leagues: [
        {
          leagueId: '10',
          leagueName: 'Premier League',
          matches: [],
        },
        {
          leagueId: '11',
          leagueName: 'La Liga',
          matches: [{ EventID: 2 } as never],
        },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesSidenavComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectGroupedMatches, value: groupedMatches }],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read grouped matches from selector signal', () => {
    expect(component.sportGroups().length).toBe(1);
    expect(component.sportGroups()[0].sportName).toBe('Football');
  });

  it('should render sport title and leagues', async () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const header = nativeElement.querySelector('mat-expansion-panel-header') as HTMLElement;

    header.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const sportTitle = nativeElement.querySelector('.sport-title');
    const leagueNames = Array.from(nativeElement.querySelectorAll('.league-name')).map((el) =>
      el.textContent?.trim(),
    );

    expect(sportTitle?.textContent?.trim()).toBe('Football');
    expect(leagueNames).toEqual(['Premier League', 'La Liga']);
  });

  it('should emit league id when league is clicked', async () => {
    const emitSpy = vi.spyOn(component.leagueSelected, 'emit');
    const nativeElement = fixture.nativeElement as HTMLElement;
    const header = nativeElement.querySelector('mat-expansion-panel-header') as HTMLElement;

    header.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const leagueItems = nativeElement.querySelectorAll('.sport-league');
    (leagueItems[1] as HTMLElement).click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith('11');
  });

  it('should apply active class for selected league', async () => {
    fixture.componentRef.setInput('selectedLeagueId', '10');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const header = nativeElement.querySelector('mat-expansion-panel-header') as HTMLElement;

    header.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const leagueItems = nativeElement.querySelectorAll('.sport-league');

    expect((leagueItems[0] as HTMLElement).classList.contains('active')).toBe(true);
    expect((leagueItems[1] as HTMLElement).classList.contains('active')).toBe(false);
  });
});
