import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-matches-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, DecimalPipe],
  templateUrl: './matches-toolbar.component.html',
  styleUrl: './matches-toolbar.component.scss',
})
export class MatchesToolbarComponent {
  readonly sportName = input('');
  readonly highlightedOdd = input<number | null>(null);
  readonly allLeaguesCollapsed = input(false);

  readonly toggleAllLeagues = output<void>();
  readonly cycleHighlight = output<void>();
  readonly cyclePrev = output<void>();
}
