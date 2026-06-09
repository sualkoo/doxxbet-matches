import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SportGroup } from '../../store/matches/matches.selectors';
import { SportColorPipe } from '../../shared/pipes/sport-color.pipe';
import { LeagueSectionComponent } from '../league-section/league-section.component';

@Component({
  selector: 'app-sport-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LeagueSectionComponent],
  templateUrl: './sport-section.component.html',
  styleUrl: './sport-section.component.scss',
  host: {
    '[class]': 'sportColorClass()',
  },
})
export class SportSectionComponent {
  sportGroup = input.required<SportGroup>();
  highlightedOdd = input<number | null>(null);

  private readonly pipe = new SportColorPipe();
  sportColorClass = computed(() => this.pipe.transform(this.sportGroup().sportName));
}
