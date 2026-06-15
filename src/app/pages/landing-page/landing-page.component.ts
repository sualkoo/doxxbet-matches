import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { sportIcon } from '../../shared/utils/sport-icon';

type FloatingSportIcon = {
  modifier: string;
  icon: string;
};

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly floatingSportIcons: FloatingSportIcon[] = [
    { modifier: 'soccer', icon: sportIcon('football') },
    { modifier: 'basketball', icon: sportIcon('basketball') },
    { modifier: 'tennis', icon: sportIcon('tennis') },
    { modifier: 'hockey', icon: sportIcon('hockey') },
    { modifier: 'esports', icon: sportIcon('esports') },
    { modifier: 'motorsport', icon: sportIcon('motorsport') },
  ];
}
