import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
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
    DecimalPipe,
    SportSectionComponent,
  ],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.scss',
})
export class MatchListComponent implements OnInit {
  private readonly store = inject(Store);

  groups = toSignal(this.store.select(selectGroupedMatches), { initialValue: [] });
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
}
