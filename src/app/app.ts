import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatchListComponent } from './components/match-list/match-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatchListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
