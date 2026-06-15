# DoxxBet Match Viewer

A sports betting dashboard built with Angular 21 and NgRx 21. The app loads offer data from the DoxxBet feed, enriches it with labels and odds, and presents matches in a league-focused browsing experience.

## Current Features

- Landing page with branded hero section and route into the matches dashboard
- Lazy-loaded routes for the landing page (`/`) and match list (`/matches`)
- Fetches data from `https://static.doxxbet.sk/offer/list.json`
- Groups matches by sport, then by league in the store
- Persistent side navigation with sports accordion and per-league selection
- League cards with collapse and expand behavior
- Global "Collapse all" and "Expand all" controls for visible leagues
- Highlighted odd cycling across currently visible matches
- Five odds columns per match: `1`, `X`, `2`, `1X`, `X2`
- Formatted dates (`d.M. HH:mm`) and odds (`1.2-2`, fallback `—`)
- Loading, error, retry, and empty states
- Shared footer with link to the raw data feed

## Tech Stack

- **Angular 21**: standalone components, zoneless change detection, signals, lazy route loading
- **NgRx 21**: store, functional effects, memoized selectors, devtools in non-production builds
- **Angular Material 21**: toolbar, sidenav, expansion panels, cards, buttons, icons, progress bar
- **SCSS**: component-scoped and global styling
- **Vitest**: unit test runner via `ng test`

## Getting Started

**Prerequisites:** Node.js 20+ and npm

```bash
npm install
npm start
```

Open `http://localhost:4200` in your browser.

## App Structure

### Routes

- `/`: landing page with a branded intro and CTA to the dashboard
- `/matches`: match browser with toolbar, sidenav, and grouped league sections

### State Flow

```text
Action -> Effect -> Service -> Reducer -> Selector -> Component
```

- **Actions**: `loadMatches`, `loadMatchesSuccess`, `loadMatchesFailure`, `stepOddHighlight`
- **Effect**: `loadMatchesEffect` calls `MatchesService.getMatches()` and dispatches success or failure
- **Reducer**: tracks `data`, `odds`, `labels`, `status`, `error`, and `highlightLevel`
- **Selectors**:
  - `selectStatus`
  - `selectHighlightLevel`
  - `selectEnrichedMatches`
  - `selectGroupedMatches`

### Component Tree

```text
App
|- RouterOutlet
|  |- LandingPageComponent
|  \- MatchListComponent
|     |- MatchesToolbarComponent
|     |- MatchesSidenavComponent
|     |- LeagueSectionComponent
|     \- MatchRowComponent
\- SiteFooterComponent
```

## Highlighted Odd Behavior

The toolbar arrows dispatch `stepOddHighlight({ direction })`, which increments or decrements a shared `highlightLevel` in the store.

`MatchListComponent` collects all unique odd values from the currently visible leagues, sorts them descending, and resolves the active highlight with wraparound logic:

```ts
sortedUniqueOddValues[((highlightLevel % len) + len) % len];
```

All match cells whose odd value equals the current highlighted value receive the highlight state.

## Data Model

The app consumes a response shaped like this:

```json
{
  "EventChanceTypes": [
    {
      "EventID": 1,
      "EventName": "Team A - Team B",
      "EventDate": "2026-06-15T18:00:00",
      "SportID": 1,
      "RegionID": 10,
      "LeagueCupID": 100,
      "EventChanceTypeID": 999
    }
  ],
  "Odds": {
    "999_1": { "OddsRate": 1.85 },
    "999_X": { "OddsRate": 3.4 },
    "999_2": { "OddsRate": 4.2 },
    "999_1X": { "OddsRate": 1.2 },
    "999_X2": { "OddsRate": 1.9 }
  },
  "Labels": {
    "SP_1": { "Name": "Football" },
    "RE_10": { "Name": "Slovakia" },
    "LC_100": { "Name": "Fortuna Liga" }
  }
}
```

The selectors enrich raw matches with label names and resolve odds into these fields:

- `home`
- `draw`
- `away`
- `homeOrDraw`
- `drawOrAway`

## Scripts

```bash
npm start   # ng serve
npm run build
npm test    # ng test
```

## Build

```bash
npm run build
```

Production output is written to `dist/`.

## Tests

```bash
npm test
```

## Notes

- The HTTP service retries failed requests twice before surfacing an error state.
- Router preloading is enabled with `PreloadAllModules`.
- Store devtools are enabled only when `environment.production` is `false`.
