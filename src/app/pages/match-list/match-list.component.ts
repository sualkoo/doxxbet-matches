import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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

  readonly status = toSignal(this.store.select(selectStatus), { initialValue: 'idle' as const });

  private readonly highlightLevel = toSignal(this.store.select(selectHighlightLevel), {
    initialValue: 0,
  });
  private readonly allGroups = toSignal(this.store.select(selectGroupedMatches), {
    initialValue: [],
  });

  readonly groups = this.allGroups;

  readonly selectedLeagueId = signal<string | null>(null);
  readonly collapsedLeagues = signal<ReadonlySet<string>>(new Set());

  readonly visibleLeagues = computed<LeagueGroup[]>(() => {
    let leagues = this.groups().flatMap((s) => s.leagues);

    const leagueId = this.selectedLeagueId();

    if (leagueId !== null) leagues = this.filterLeaguesByLeague(leagues, leagueId);
    return leagues;
  });

  private filterLeaguesByLeague(leagues: LeagueGroup[], leagueId: string): LeagueGroup[] {
    return leagues.filter((l) => l.leagueId === leagueId);
  }

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

  readonly highlightedOdd = computed<number | null>(() => {
    const sortedValues = this.visibleSortedUniqueOddValues();
    if (sortedValues.length === 0) return null;
    const level = this.highlightLevel();
    const len = sortedValues.length;
    return sortedValues[((level % len) + len) % len];
  });

  readonly allLeaguesCollapsed = computed<boolean>(() => {
    const leagues = this.visibleLeagues();
    if (leagues.length === 0) return false;
    return leagues.every((l) => this.collapsedLeagues().has(l.leagueId));
  });

  ngOnInit(): void {
    if (this.status() === 'idle') {
      this.store.dispatch(MatchesActions.loadMatches());
    }
  }

  retry(): void {
    this.store.dispatch(MatchesActions.loadMatches());
  }

  cycleHighlightNext(): void {
    this.store.dispatch(MatchesActions.stepOddHighlight({ direction: 1 }));
  }

  cycleHighlightPrev(): void {
    this.store.dispatch(MatchesActions.stepOddHighlight({ direction: -1 }));
  }

  selectLeague(leagueId: string | null): void {
    if (leagueId === null) {
      this.selectedLeagueId.set(null);
      return;
    }
    this.selectedLeagueId.update((current) => (current === leagueId ? null : leagueId));
  }

  toggleAllVisibleLeagues(): void {
    if (this.allLeaguesCollapsed()) {
      this.collapsedLeagues.set(new Set());
    } else {
      this.collapsedLeagues.set(new Set(this.visibleLeagues().map((l) => l.leagueId)));
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
}
