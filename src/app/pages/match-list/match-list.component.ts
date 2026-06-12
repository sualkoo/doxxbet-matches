import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatchesActions } from '../../store/matches/matches.actions';
import {
  selectGroupedMatches,
  selectStatus,
  selectHighlightLevel,
  LeagueGroup,
} from '../../store/matches/matches.selectors';
import { MatchesSidenavComponent } from '../../components/matches-sidenav/matches-sidenav.component';
import { MatchesToolbarComponent } from '../../components/matches-toolbar/matches-toolbar.component';
import { LeagueSectionComponent } from '../../components/league-section/league-section.component';

@Component({
  selector: 'app-match-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatProgressBarModule,
    MatCardModule,
    MatchesToolbarComponent,
    MatchesSidenavComponent,
    LeagueSectionComponent,
  ],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.scss',
})
export class MatchListComponent implements OnInit {
  private readonly store = inject(Store);

  /** Bound from the `:sportId` route param via withComponentInputBinding(). */
  readonly sportId = input<string>();
  private readonly routeSportId = computed(() => Number(this.sportId()) || null);

  private readonly allGroups = toSignal(this.store.select(selectGroupedMatches), {
    initialValue: [],
  });

  groups = computed(() => {
    const id = this.routeSportId();
    return id === null ? this.allGroups() : this.allGroups().filter((g) => g.sportId === id);
  });

  sportName = computed(() => this.groups()[0]?.sportName ?? '');

  status = toSignal(this.store.select(selectStatus), { initialValue: 'idle' as const });
  private readonly highlightLevel = toSignal(this.store.select(selectHighlightLevel), {
    initialValue: 0,
  });

  selectedRegionId = signal<number | null>(null);
  selectedLeagueId = signal<string | null>(null);
  collapsedLeagues = signal<ReadonlySet<string>>(new Set());

  visibleLeagues = computed<LeagueGroup[]>(() => {
    const regionId = this.selectedRegionId();
    const leagueId = this.selectedLeagueId();
    const allLeagues = this.groups().flatMap((s) => s.leagues);
    let leagues = allLeagues;
    if (regionId !== null) {
      leagues = leagues.filter((l) => l.matches.some((m) => m.RegionID === regionId));
    }
    if (leagueId !== null) {
      leagues = leagues.filter((l) => l.leagueId === leagueId);
    }
    return leagues;
  });

  private readonly visibleSortedUniqueOddValues = computed<number[]>(() => {
    const allValues = this.visibleLeagues().flatMap((league) =>
      league.matches.flatMap((m) =>
        [m.odds.home, m.odds.draw, m.odds.away, m.odds.homeOrDraw, m.odds.drawOrAway].filter(
          (v): v is number => v !== null,
        ),
      ),
    );
    return [...new Set(allValues)].sort((a, b) => b - a);
  });

  highlightedOdd = computed<number | null>(() => {
    const sortedValues = this.visibleSortedUniqueOddValues();
    if (sortedValues.length === 0) return null;

    const level = this.highlightLevel();
    const len = sortedValues.length;
    return sortedValues[((level % len) + len) % len];
  });

  allLeaguesCollapsed = computed<boolean>(() => {
    const leagues = this.visibleLeagues();
    if (leagues.length === 0) return false;
    const collapsed = this.collapsedLeagues();
    return leagues.every((l) => collapsed.has(l.leagueId));
  });

  selectCountry(regionId: number | null): void {
    if (regionId === null) {
      this.selectedRegionId.set(null);
      return;
    }
    this.selectedRegionId.update((current) => (current === regionId ? null : regionId));
  }

  selectLeague(leagueId: string | null): void {
    if (leagueId === null) {
      this.selectedLeagueId.set(null);
      return;
    }
    this.selectedLeagueId.update((current) => (current === leagueId ? null : leagueId));
  }

  ngOnInit(): void {
    if (this.status() === 'idle') {
      this.store.dispatch(MatchesActions.loadMatches());
    }
  }

  cycleHighlightNext(): void {
    this.store.dispatch(MatchesActions.stepOddHighlight({ direction: 1 }));
  }

  cycleHighlightPrev(): void {
    this.store.dispatch(MatchesActions.stepOddHighlight({ direction: -1 }));
  }

  toggleAllVisibleLeagues(): void {
    const leagues = this.visibleLeagues();
    if (this.allLeaguesCollapsed()) {
      this.collapsedLeagues.set(new Set());
    } else {
      this.collapsedLeagues.set(new Set(leagues.map((l) => l.leagueId)));
    }
  }

  toggleLeague(leagueId: string): void {
    this.collapsedLeagues.update((set) => {
      const next = new Set(set);
      if (next.has(leagueId)) {
        next.delete(leagueId);
      } else {
        next.add(leagueId);
      }
      return next;
    });
  }

  retry(): void {
    this.store.dispatch(MatchesActions.loadMatches());
  }
}
