import { ChangeDetectionStrategy, Component, effect, input, OnInit, signal } from '@angular/core';
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
export class LeagueSectionComponent implements OnInit {
  league = input.required<LeagueGroup>();
  highlightedOdd = input<number | null>(null);
  collapseAllToken = input(0);
  allVisibleLeaguesCollapsed = input(false);

  isCollapsed = signal(false);
  private lastCollapseAllToken = 0;

  constructor() {
    effect(() => {
      const token = this.collapseAllToken();
      if (token !== this.lastCollapseAllToken) {
        this.lastCollapseAllToken = token;
        this.isCollapsed.set(this.allVisibleLeaguesCollapsed());
      }
    });
  }

  ngOnInit(): void {
    this.lastCollapseAllToken = this.collapseAllToken();
    if (this.allVisibleLeaguesCollapsed()) {
      this.isCollapsed.set(true);
    }
  }

  toggle(): void {
    this.isCollapsed.update((v) => !v);
  }
}
