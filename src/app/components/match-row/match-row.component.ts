import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EnrichedMatch } from '../../core/models/enriched-match.model';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { FormatOddPipe } from '../../shared/pipes/format-odd.pipe';

@Component({
  selector: 'app-match-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatDatePipe, FormatOddPipe],
  templateUrl: './match-row.component.html',
  styleUrl: './match-row.component.scss',
})
export class MatchRowComponent {
  match = input.required<EnrichedMatch>();
  highlightedOdd = input<number | null>(null);

  isOddHighlighted(value: number | null): boolean {
    return value !== null && value === this.highlightedOdd();
  }
}
