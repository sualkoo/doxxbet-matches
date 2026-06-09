# DoxxBet Match Viewer

A real-time sports match viewer built with Angular 21 and NgRx 21 that fetches and displays live betting data from the DoxxBet API, grouped by sport and league.

## Features

- Fetches match data from `https://static.doxxbet.sk/offer/list.json`
- Matches grouped by sport, then by league
- Collapsible league sections with animated chevron
- Formatted match dates (`d.M. HH:mm`)
- 5 odds columns: 1, X, 2, 1X, X2
- Cycling "Highlight Top Odds" feature with amber highlight
- Sport-specific colour-coded left borders
- Dark theme throughout
- Loading indicator and error/retry state
- Empty state when no matches available
- Responsive horizontal scrolling on narrow screens

## Tech Stack

- **Angular 21** — Standalone components, zoneless change detection, signal APIs
- **NgRx 21** — Functional effects, memoized selectors, store devtools
- **Angular Material 21** — Toolbar, cards, buttons, icons, progress bar
- **SCSS** — Component and global styles

## Getting Started

**Prerequisites:** Node.js 20+, Angular CLI 21+

```bash
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

## Architecture

```
Action → Effect → Reducer → Selector → Component
  ↓         ↓        ↓          ↓           ↓
loadMatches  HTTP   state    enriched     renders
             call   update   matches      table
```

- **Actions** (`matches.actions.ts`): `loadMatches`, `loadMatchesSuccess`, `loadMatchesFailure`, `toggleLeague`, `cycleOddHighlight`
- **Effects** (`matches.effects.ts`): Listens for `loadMatches`, calls `MatchesService`, dispatches success/failure
- **Reducer** (`matches.reducer.ts`): Updates state based on actions
- **Selectors** (`matches.selectors.ts`): `selectEnrichedMatches`, `selectGroupedMatches`, `selectCurrentHighlightedOddValue`
- **Components**: `MatchListComponent` → `SportSectionComponent` → `LeagueSectionComponent` → `MatchRowComponent` → `OddCellComponent`

## Highlight Feature

Clicking "Highlight Odds" dispatches `cycleOddHighlight`. The selector `selectCurrentHighlightedOddValue` computes the current value as:

```
sortedUniqueOddValues[highlightLevel % sortedUniqueOddValues.length]
```

For example, with values `[2.53, 2.30, 1.54, 1.01]`:

- Click 1 → highlights **2.53**
- Click 2 → highlights **2.30**
- Click 3 → highlights **1.54**
- Click 4 → highlights **1.01**
- Click 5 → wraps back to **2.53**

All `OddCellComponent` cells with a matching value get the amber highlight simultaneously.

## API

**Endpoint:** `GET https://static.doxxbet.sk/offer/list.json`

**Response structure:**

```json
{
  "EventChanceTypes": [ { "ID", "Name", "EventDate", "SportID", "RegionID", "LeagueID", "EventChanceTypeID" } ],
  "Odds":             [ { "EventChanceTypeID", "Value", "OddTypeID" } ],
  "Labels":           { "SP_1": "Football", "RE_10": "Slovakia", "LC_100": "Fortuna Liga", ... }
}
```

`OddTypeID` mapping: `1`=1 (home), `2`=X (draw), `3`=2 (away), `4`=1X, `5`=X2

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
