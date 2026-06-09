import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { LeagueGroup } from '../../store/matches/matches.selectors';
import { MatchesActions } from '../../store/matches/matches.actions';
import { MatchRowComponent } from '../match-row/match-row.component';

@Component({
  selector: 'app-league-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatIconButton, MatchRowComponent],
  templateUrl: './league-section.component.html',
  styleUrl: './league-section.component.scss',
})
export class LeagueSectionComponent {
  league = input.required<LeagueGroup>();
  highlightedOdd = input<number | null>(null);

  private readonly store = inject(Store);
  isCollapsed = signal(false);

  toggle(): void {
    this.isCollapsed.update((v) => !v);
    this.store.dispatch(MatchesActions.toggleLeague({ leagueId: this.league().leagueId }));
  }
}
