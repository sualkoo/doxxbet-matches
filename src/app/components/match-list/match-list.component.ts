import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatchesActions } from '../../store/matches/matches.actions';
import {
  selectGroupedMatches,
  selectStatus,
  selectCurrentHighlightedOddValue,
} from '../../store/matches/matches.selectors';
import { SportSectionComponent } from '../sport-section/sport-section.component';

@Component({
  selector: 'app-match-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    MatIconModule,
    DecimalPipe,
    SportSectionComponent,
  ],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.scss',
})
export class MatchListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routeSportId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('sportId')) || null)),
    { initialValue: null as number | null },
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
