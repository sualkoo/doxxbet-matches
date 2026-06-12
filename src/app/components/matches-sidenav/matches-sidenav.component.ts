import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { selectGroupedMatches } from '../../store/matches/matches.selectors';
import { sportIcon } from '../../shared/utils/sport-icon';

@Component({
  selector: 'app-matches-sidenav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSidenavModule, MatListModule, MatIconModule, MatExpansionModule],
  templateUrl: './matches-sidenav.component.html',
  styleUrl: './matches-sidenav.component.scss',
})
export class MatchesSidenavComponent {
  private readonly store = inject(Store);

  readonly selectedLeagueId = input<string | null>(null);
  readonly leagueSelected = output<string | null>();

  readonly sportGroups = toSignal(this.store.select(selectGroupedMatches), { initialValue: [] });

  readonly sportIcon = sportIcon;
}
