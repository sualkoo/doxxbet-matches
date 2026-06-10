import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiResponse } from '../../core/models';

export const MatchesActions = createActionGroup({
  source: 'Matches',
  events: {
    'Load Matches': emptyProps(),
    'Load Matches Success': props<{ response: ApiResponse }>(),
    'Load Matches Failure': props<{ error: string }>(),
    'Toggle League': props<{ leagueId: string }>(),
    'Cycle Odd Highlight': emptyProps(),
    'Step Odd Highlight': props<{ direction: 1 | -1 }>(),
  },
});
