import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FormatOddPipe } from '../../shared/pipes/format-odd.pipe';

@Component({
  selector: 'app-matches-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, FormatOddPipe],
  templateUrl: './matches-toolbar.component.html',
  styleUrl: './matches-toolbar.component.scss',
})
export class MatchesToolbarComponent {
  readonly highlightedOdd = input<number | null>(null);
  readonly allLeaguesCollapsed = model(false);

  readonly cycleNextOdd = output<void>();
  readonly cyclePrevOdd = output<void>();
}
