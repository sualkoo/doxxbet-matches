import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-odd-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './odd-cell.component.html',
  styleUrl: './odd-cell.component.scss',
  host: {
    '[class.odd--highlighted]': 'isHighlighted()',
  },
})
export class OddCellComponent {
  value = input<number | null>(null);
  highlightedOdd = input<number | null>(null);

  isHighlighted = computed(() => this.value() !== null && this.value() === this.highlightedOdd());
}
