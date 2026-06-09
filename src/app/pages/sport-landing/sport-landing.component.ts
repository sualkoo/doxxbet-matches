import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatchesActions } from '../../store/matches/matches.actions';
import { selectSports, selectStatus } from '../../store/matches/matches.selectors';
import { sportIcon } from '../../shared/utils/sport-icon';

export interface DisplaySport {
  name: string;
  sportId: number | null;
  matchCount: number;
  hasMatches: boolean;
}

/**
 * Static mapping of display name → known SportID from the API.
 * Add entries here as IDs are discovered.
 */
const SPORT_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  ['Football', 54],
  ['Tennis', 13],
  ['Basketball', 3],
  ['Ice Hockey', 5],
  ['Volleyball', 23],
  ['Handball', 11],
  ['Baseball', 2],
  ['Rugby', 12],
  ['American Football', 1],
  ['Boxing', 4],
  ['Motorsport', 25],
  ['Cycling', 36],
  ['Golf', 9],
  ['E-Sports', 107],
]);

/** Fixed set of sports always shown on the landing page. */
const STATIC_SPORTS: readonly string[] = [...SPORT_ID_MAP.keys()];

@Component({
  selector: 'app-sport-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatRippleModule],
  templateUrl: './sport-landing.component.html',
  styleUrl: './sport-landing.component.scss',
})
export class SportLandingComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  private readonly liveSports = toSignal(this.store.select(selectSports), { initialValue: [] });
  readonly status = toSignal(this.store.select(selectStatus), { initialValue: 'idle' as const });

  readonly isLoading = computed(() => this.status() === 'idle' || this.status() === 'loading');

  /** Skeleton placeholder array shown while loading. */
  readonly skeletons = Array.from({ length: STATIC_SPORTS.length });

  readonly sportIcon = sportIcon;

  /** Static sport list merged with live match counts looked up by known SportID. */
  readonly displaySports = computed<DisplaySport[]>(() => {
    const live = this.liveSports();
    return STATIC_SPORTS.map((name): DisplaySport => {
      const sportId = SPORT_ID_MAP.get(name) ?? null;
      const liveMatch = sportId === null ? null : live.find((s) => s.sportId === sportId);
      return {
        name,
        sportId,
        matchCount: liveMatch?.matchCount ?? 0,
        hasMatches: liveMatch != null,
      };
    });
  });

  ngOnInit(): void {
    this.store.dispatch(MatchesActions.loadMatches());
  }

  selectSport(sportId: number | null): void {
    if (sportId !== null) {
      this.router.navigate(['/matches', sportId]);
    }
  }
}
