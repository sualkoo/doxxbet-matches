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

  readonly allGroups = toSignal(this.store.select(selectGroupedMatches), {
    initialValue: [],
  });

  readonly selectedLeagueId = signal<string | null>(null);
  readonly collapsedLeagues = signal<ReadonlySet<string>>(new Set());

  readonly visibleLeagues = computed<LeagueGroup[]>(() => {
    return this.getVisibleLeagues(this.allGroups(), this.selectedLeagueId());
  });

  private getVisibleLeagues(
    groups: ReadonlyArray<{ leagues: LeagueGroup[] }>,
    selectedLeagueId: string | null,
  ): LeagueGroup[] {
    const leagues = this.getAllLeagues(groups);
    return this.selectLeagueById(leagues, selectedLeagueId);
  }

  private getAllLeagues(groups: ReadonlyArray<{ leagues: LeagueGroup[] }>): LeagueGroup[] {
    return groups.flatMap((group) => group.leagues);
  }

  private selectLeagueById(leagues: LeagueGroup[], leagueId: string | null): LeagueGroup[] {
    if (leagueId === null) return leagues;
    const league = leagues.find((l) => l.leagueId === leagueId);
    return league ? [league] : [];
  }

  private readonly visibleSortedUniqueOddValues = computed<number[]>(() => {
    return this.getVisibleSortedUniqueOddValues();
  });

  readonly highlightedOdd = computed<number | null>(() => {
    return this.getHighlightedOdd(this.visibleSortedUniqueOddValues(), this.highlightLevel());
  });

  readonly allLeaguesCollapsed = computed<boolean>(() => {
    return this.areAllVisibleLeaguesCollapsed(this.visibleLeagues(), this.collapsedLeagues());
  });

  private getVisibleSortedUniqueOddValues(): number[] {
    const uniqueOdds = this.collectUniqueVisibleOdds();
    return [...uniqueOdds].sort((a, b) => b - a);
  }

  private collectUniqueVisibleOdds(): Set<number> {
    const uniqueOdds = new Set<number>();

    for (const league of this.visibleLeagues()) {
      for (const match of league.matches) {
        this.addMatchOdds(uniqueOdds, match.odds);
      }
    }

    return uniqueOdds;
  }

  private addMatchOdds(target: Set<number>, odds: LeagueGroup['matches'][number]['odds']): void {
    const values = [odds.home, odds.draw, odds.away, odds.homeOrDraw, odds.drawOrAway];
    for (const value of values) {
      if (value != null) target.add(value);
    }
  }

  private getHighlightedOdd(sortedValues: number[], level: number): number | null {
    if (sortedValues.length === 0) return null;
    const len = sortedValues.length;
    return sortedValues[((level % len) + len) % len];
  }

  private areAllVisibleLeaguesCollapsed(
    leagues: LeagueGroup[],
    collapsedLeagues: ReadonlySet<string>,
  ): boolean {
    if (leagues.length === 0) return false;
    return leagues.every((l) => collapsedLeagues.has(l.leagueId));
  }

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
      this.collapsedLeagues.set(new Set(this.getVisibleLeagueIds()));
    }
  }

  private getVisibleLeagueIds(): string[] {
    return this.visibleLeagues().map((league) => league.leagueId);
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
