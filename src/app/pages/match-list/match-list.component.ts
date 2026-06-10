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
  selectCurrentHighlightedOddValue,
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
  highlightedOdd = toSignal(this.store.select(selectCurrentHighlightedOddValue), {
    initialValue: null,
  });

  selectedRegionId = signal<number | null>(null);

  visibleLeagues = computed<LeagueGroup[]>(() => {
    const regionId = this.selectedRegionId();
    const allLeagues = this.groups().flatMap((s) => s.leagues);
    if (regionId === null) return allLeagues;
    return allLeagues.filter((l) => l.matches.some((m) => m.RegionID === regionId));
  });

  selectCountry(regionId: number): void {
    this.selectedRegionId.update((current) => (current === regionId ? null : regionId));
  }

  ngOnInit(): void {
    this.store.dispatch(MatchesActions.loadMatches());
  }

  cycleHighlight(): void {
    this.store.dispatch(MatchesActions.cycleOddHighlight());
  }

  retry(): void {
    this.store.dispatch(MatchesActions.loadMatches());
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
