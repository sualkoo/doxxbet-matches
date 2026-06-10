import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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

@Component({
  selector: 'app-match-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressBarModule, MatCardModule, MatchesToolbarComponent, MatchesSidenavComponent],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.scss',
})
export class MatchListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routeSportId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('sportId')) || null)),
    { initialValue: null },
  );

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
  collapseAllToken = signal(0);
  allVisibleLeaguesCollapsed = signal(false);

  visibleLeagues = computed<LeagueGroup[]>(() => {
    const regionId = this.selectedRegionId();
    const allLeagues = this.groups().flatMap((s) => s.leagues);
    if (regionId === null) return allLeagues;
    return allLeagues.filter((l) => l.matches.some((m) => m.RegionID === regionId));
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

  selectCountry(regionId: number | null): void {
    if (regionId === null) {
      this.selectedRegionId.set(null);
      return;
    }
    this.selectedRegionId.update((current) => (current === regionId ? null : regionId));
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
    this.allVisibleLeaguesCollapsed.update((v) => !v);
    this.collapseAllToken.update((v) => v + 1);
  }

  retry(): void {
    this.store.dispatch(MatchesActions.loadMatches());
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
