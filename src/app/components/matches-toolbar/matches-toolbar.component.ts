import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
  untracked,
} from '@angular/core';
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
  constructor() {
    effect(() => {
      this.syncHighlightedOdd();
    });
  }

  readonly sortedOddValues = input<number[]>([]);
  readonly highlightLevel = input(0);
  readonly highlightedOdd = model<number | null>(null);
  readonly allLeaguesCollapsed = model(false);

  private lastProcessedHighlightLevel: number | null = null;

  readonly cycleNextOdd = output<void>();
  readonly cyclePrevOdd = output<void>();

  private syncHighlightedOdd(): void {
    const sortedValues = this.sortedOddValues();
    const level = this.highlightLevel();

    if (this.hasNoVisibleOddValues(sortedValues)) {
      this.clearHighlightedOdd(level);
      return;
    }

    const highlightedByLevel = this.getHighlightedOdd(sortedValues, level);
    if (this.shouldRefreshHighlightedOdd(sortedValues, level)) {
      this.highlightedOdd.set(highlightedByLevel);
    }

    this.lastProcessedHighlightLevel = level;
  }

  private hasNoVisibleOddValues(sortedValues: number[]): boolean {
    return sortedValues.length === 0;
  }

  private clearHighlightedOdd(level: number): void {
    this.highlightedOdd.set(null);
    this.lastProcessedHighlightLevel = level;
  }

  private shouldRefreshHighlightedOdd(sortedValues: number[], level: number): boolean {
    return (
      this.hasHighlightLevelChanged(level) || this.currentHighlightedOddIsMissing(sortedValues)
    );
  }

  private hasHighlightLevelChanged(level: number): boolean {
    return this.lastProcessedHighlightLevel === null || level !== this.lastProcessedHighlightLevel;
  }

  private currentHighlightedOddIsMissing(sortedValues: number[]): boolean {
    const currentHighlightedOdd = this.getCurrentHighlightedOdd();
    return currentHighlightedOdd === null || !sortedValues.includes(currentHighlightedOdd);
  }

  private getCurrentHighlightedOdd(): number | null {
    return untracked(() => this.highlightedOdd());
  }

  private getHighlightedOdd(sortedValues: number[], level: number): number | null {
    if (sortedValues.length === 0) return null;

    const len = sortedValues.length;
    const highlightedOddIndex = ((level % len) + len) % len;

    return sortedValues[highlightedOddIndex];
  }
}
