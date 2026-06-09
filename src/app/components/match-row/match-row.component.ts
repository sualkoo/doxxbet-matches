import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EnrichedMatch } from '../../core/models';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { OddCellComponent } from '../odd-cell/odd-cell.component';

@Component({
  selector: '[app-match-row]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatDatePipe, OddCellComponent],
  templateUrl: './match-row.component.html',
  styleUrl: './match-row.component.scss',
})
export class MatchRowComponent {
  match = input.required<EnrichedMatch>();
  highlightedOdd = input<number | null>(null);
}
