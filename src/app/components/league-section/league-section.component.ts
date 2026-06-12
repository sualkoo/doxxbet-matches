import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { LeagueGroup } from '../../store/matches/matches.selectors';
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
  collapsed = input(false);
  toggled = output<string>();

  toggle(): void {
    this.toggled.emit(this.league().leagueId);
  }
}
