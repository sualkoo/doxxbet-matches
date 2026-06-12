import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EnrichedMatch } from '../../core/models';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';

@Component({
  selector: '[app-match-row]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatDatePipe],
  templateUrl: './match-row.component.html',
  styleUrl: './match-row.component.scss',
  providers: [DecimalPipe],
})
export class MatchRowComponent {
  private readonly decimalPipe = inject(DecimalPipe);

  match = input.required<EnrichedMatch>();
  highlightedOdd = input<number | null>(null);

  isOddHighlighted(value: number | null): boolean {
    return value !== null && value === this.highlightedOdd();
  }

  formatOdd(value: number | null): string {
    return value === null ? '—' : (this.decimalPipe.transform(value, '1.2-2') ?? '—');
  }
}
