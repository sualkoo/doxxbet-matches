import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { selectCountries, LeagueGroup } from '../../store/matches/matches.selectors';
import { LeagueSectionComponent } from '../league-section/league-section.component';

@Component({
  selector: 'app-matches-sidenav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    LeagueSectionComponent,
  ],
  templateUrl: './matches-sidenav.component.html',
  styleUrl: './matches-sidenav.component.scss',
})
export class MatchesSidenavComponent {
  private readonly store = inject(Store);

  readonly selectedRegionId = input<number | null>(null);
  readonly visibleLeagues = input.required<LeagueGroup[]>();
  readonly highlightedOdd = input<number | null>(null);
  readonly countrySelected = output<number | null>();

  readonly countries = toSignal(this.store.select(selectCountries), { initialValue: [] });
  readonly sidenavOpen = signal(true);

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }
}
