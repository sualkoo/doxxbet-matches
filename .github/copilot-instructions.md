# GitHub Copilot Instructions — DoxxBet Match Viewer

Place this file at `.github/copilot-instructions.md` in the project root.
Copilot will use it automatically as workspace context in VS Code.

---

## Project Overview

Angular 21 + NgRx 21 SPA that fetches sports match data from
`https://static.doxxbet.sk/offer/list.json` and displays matches grouped by
sport and league, with collapsible leagues, formatted dates, 5 odds columns,
and a cycling "highlight top odds" feature.

**Stack:** Angular 21, NgRx 21, Angular Material 21, SCSS

---

## Code Style Rules — always follow these

- Standalone components everywhere — no NgModules
- `inject()` for DI — never constructor injection
- `OnPush` change detection on every component
- Angular control flow: `@if`, `@for`, `@switch` — never `*ngIf` / `*ngFor`
- `signal()` and `computed()` for local component state
- `input()` / `output()` signal APIs — never `@Input()` / `@Output()`
- `DestroyRef` + `takeUntilDestroyed()` for RxJS cleanup in components
- SCSS only — no inline styles, no plain CSS files
- All NgRx selectors memoized with `createSelector`
- Effects use functional `createEffect` + `inject(Actions)` style
- Zoneless change detection (`provideExperimentalZonelessChangeDetection`)

---

## Folder Structure

```
src/
  environments/
    environment.ts          # { apiUrl: '...' }
    environment.prod.ts
  app/
    core/
      models/
        api-response.model.ts
        match.model.ts
        odd.model.ts
        enriched-match.model.ts
      services/
        matches.service.ts
    store/
      matches/
        matches.actions.ts
        matches.reducer.ts
        matches.effects.ts
        matches.selectors.ts
        matches.state.ts
    components/
      match-list/
        match-list.component.ts
        match-list.component.html
        match-list.component.scss
      sport-section/
        sport-section.component.ts
        sport-section.component.html
        sport-section.component.scss
      league-section/
        league-section.component.ts
        league-section.component.html
        league-section.component.scss
      match-row/
        match-row.component.ts
        match-row.component.html
        match-row.component.scss
    shared/
      directives/
        highlight-odd.directive.ts
      pipes/
        format-date.pipe.ts
        sport-color.pipe.ts
    app.config.ts
    app.component.ts
    app.component.html
    app.component.scss
```

---

## Phase 1 — Scaffold & Configuration

### Step 1.1 — Create the project

Run in terminal:

```bash
ng new doxxbet-matches --style=scss --routing=false --ssr=false
cd doxxbet-matches
ng add @angular/material
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
```

### Step 1.2 — Environments

```typescript
// Copilot: create src/environments/environment.ts with a typed Environment interface:
// { production: boolean, apiUrl: string }
// Set production: false and apiUrl: 'https://static.doxxbet.sk/offer/list.json'
```

```typescript
// Copilot: create src/environments/environment.prod.ts
// Same shape as environment.ts but production: true, same apiUrl
```

### Step 1.3 — App config

```typescript
// Copilot: create app.config.ts as an Angular 21 ApplicationConfig.
// Provide:
// - provideExperimentalZonelessChangeDetection()
// - provideHttpClient()
// - provideStore({ matches: matchesReducer })
// - provideEffects([MatchesEffects])
// - provideStoreDevtools({ maxAge: 25, logOnly: environment.production })
// - provideAnimationsAsync()
```

### Step 1.4 — App shell

```typescript
// Copilot: create a minimal standalone AppComponent (OnPush) with a mat-toolbar
// showing the title "DoxxBet Matches" and a <router-outlet> placeholder comment.
// Import MatToolbarModule.
```

### Acceptance Criteria

- `ng serve` runs with no errors or warnings
- Angular Material toolbar renders in the browser
- NgRx DevTools extension shows an empty store

---

## Phase 2 — Models

### Step 2.1 — Raw API models

```typescript
// Copilot: create src/app/core/models/api-response.model.ts
// Define readonly interfaces:
// - ApiResponse { EventChanceTypes: readonly Match[], Odds: readonly Odd[], Labels: Record<string, string> }
// - Match { ID: number, Name: string, EventDate: string, SportID: number, RegionID: number, LeagueID: number, EventChanceTypeID: number }
// - Odd { EventChanceTypeID: number, Value: number, OddTypeID: number }
// OddTypeID values: 1=home(1), 2=draw(X), 3=away(2), 4=homeOrDraw(1X), 5=drawOrAway(X2)
// Export all from an index.ts barrel in the models folder
```

### Step 2.2 — Enriched match model

```typescript
// Copilot: create src/app/core/models/enriched-match.model.ts
// MatchOdds { home: number|null, draw: number|null, away: number|null, homeOrDraw: number|null, drawOrAway: number|null }
// EnrichedMatch extends Match and adds:
//   sportName: string, regionName: string, leagueName: string, odds: MatchOdds
// All fields readonly
```

### Acceptance Criteria

- `ng build` compiles with `strict: true` and no `any` types
- All models exported from the barrel `core/models/index.ts`

---

## Phase 3 — API Service

### Step 3.1 — MatchesService

```typescript
// Copilot: create src/app/core/services/matches.service.ts
// Standalone injectable service using inject(HttpClient).
// One public method: getMatches(): Observable<ApiResponse>
// GET from inject(ENVIRONMENT).apiUrl  (provide ENVIRONMENT via InjectionToken in app.config.ts)
// Apply retry(2) and catchError that logs the error and rethrows it.
// No data transformation here — service only fetches.
```

### Acceptance Criteria

- Service returns typed `Observable<ApiResponse>`
- Calling it in browser network tab shows the JSON response
- Retries twice on network error before throwing

---

## Phase 4 — NgRx: Actions

### Step 4.1 — Action definitions

```typescript
// Copilot: create src/app/store/matches/matches.actions.ts
// Use createActionGroup with source 'Matches' to define:
// - loadMatches                (no props)
// - loadMatchesSuccess         (props: { response: ApiResponse })
// - loadMatchesFailure         (props: { error: string })
// - toggleLeague               (props: { leagueId: string })
// - cycleOddHighlight          (no props)
```

### Acceptance Criteria

- Actions are importable and type-safe
- No runtime errors when dispatching in DevTools

---

## Phase 5 — NgRx: State & Reducer

### Step 5.1 — State interface

```typescript
// Copilot: create src/app/store/matches/matches.state.ts
// MatchesState interface with readonly fields:
// - data: readonly Match[]
// - odds: readonly Odd[]
// - labels: Readonly<Record<string, string>>
// - status: 'idle' | 'loading' | 'success' | 'error'
// - error: string | null
// - collapsedLeagues: readonly string[]  (league IDs currently collapsed)
// - highlightLevel: number               (index into sorted unique odds, starts at 0)
//
// Export initialMatchesState: MatchesState with empty arrays, status 'idle', error null, highlightLevel 0
```

### Step 5.2 — Reducer

```typescript
// Copilot: create src/app/store/matches/matches.reducer.ts
// createReducer on initialMatchesState handling:
// - loadMatches          → { ...state, status: 'loading', error: null }
// - loadMatchesSuccess   → spread response fields into state, status: 'success'
// - loadMatchesFailure   → { ...state, status: 'error', error: action.error }
// - toggleLeague         → if leagueId in collapsedLeagues remove it, else add it (immutably)
// - cycleOddHighlight    → increment highlightLevel by 1 (selector handles wrapping/modulo)
// Export as matchesReducer with feature key 'matches'
```

### Acceptance Criteria

- DevTools shows state shape after `loadMatches` is dispatched
- `toggleLeague` adds/removes IDs correctly in DevTools
- `highlightLevel` increments each time `cycleOddHighlight` is dispatched

---

## Phase 6 — NgRx: Effects

### Step 6.1 — MatchesEffects

```typescript
// Copilot: create src/app/store/matches/matches.effects.ts
// Functional-style NgRx effect class using inject().
// loadMatches$ effect:
//   - listens for MatchesActions.loadMatches
//   - uses switchMap to call MatchesService.getMatches()
//   - on success: map to MatchesActions.loadMatchesSuccess({ response })
//   - on error: catchError returns of(MatchesActions.loadMatchesFailure({ error: err.message }))
// The catchError must be INSIDE the switchMap so the effect stays alive on error.
```

### Acceptance Criteria

- Dispatching `loadMatches` in DevTools triggers an HTTP request
- Success populates `data`, `odds`, `labels` in state
- Simulating a network error dispatches `loadMatchesFailure`

---

## Phase 7 — NgRx: Selectors

### Step 7.1 — Base selectors

```typescript
// Copilot: create src/app/store/matches/matches.selectors.ts
// createFeatureSelector<MatchesState>('matches') → selectMatchesState
// createSelector projections for each top-level field:
// selectRawMatches, selectOdds, selectLabels, selectStatus,
// selectCollapsedLeagues, selectHighlightLevel, selectError
```

### Step 7.2 — Enrichment selector

```typescript
// Copilot: add selectEnrichedMatches to matches.selectors.ts
// Combines selectRawMatches + selectOdds + selectLabels.
// For each match:
//   - Look up sportName: labels['SP_' + match.SportID]  (or 'Unknown')
//   - Look up regionName: labels['RE_' + match.RegionID] (or 'Unknown')
//   - Look up leagueName: labels['LC_' + match.LeagueID] (or 'Unknown')
//   - Build MatchOdds by filtering odds where EventChanceTypeID === match.EventChanceTypeID,
//     then map by OddTypeID: 1→home, 2→draw, 3→away, 4→homeOrDraw, 5→drawOrAway; null if missing
// Returns EnrichedMatch[]
```

### Step 7.3 — Grouping selector

```typescript
// Copilot: add selectGroupedMatches to matches.selectors.ts
// Input: selectEnrichedMatches
// Output: Array<SportGroup> where
//   SportGroup = { sportName: string, sportId: number,
//                  leagues: Array<{ leagueId: string, leagueName: string, matches: EnrichedMatch[] }> }
// Group by sportName first, then by leagueId within each sport.
// Sort sports alphabetically, leagues alphabetically within each sport.
```

### Step 7.4 — Highlight selectors

```typescript
// Copilot: add two more selectors to matches.selectors.ts:
//
// selectSortedUniqueOddValues:
//   input: selectEnrichedMatches
//   flatten all non-null odd values from all matches, deduplicate, sort DESCENDING
//   e.g. [2.53, 2.30, 1.54, 1.01]
//
// selectCurrentHighlightedOddValue:
//   inputs: selectSortedUniqueOddValues + selectHighlightLevel
//   return sortedValues[highlightLevel % sortedValues.length] or null if empty
```

### Acceptance Criteria

- `selectGroupedMatches` visible in DevTools with correct sport/league grouping
- Dispatching `cycleOddHighlight` changes `selectCurrentHighlightedOddValue` in DevTools
- After reaching the last value, next dispatch wraps back to the highest

---

## Phase 8 — Pipes

### Step 8.1 — FormatDatePipe

```typescript
// Copilot: create src/app/shared/pipes/format-date.pipe.ts
// Standalone pure pipe, name: 'formatDate'
// transform(value: string | Date | null): string
// Use Angular's DatePipe internally (inject DatePipe — add it to providers in app.config.ts)
// Format: 'd.M. HH:mm'  → e.g. "21.3. 13:20"
// Return '' for null/undefined input
```

### Step 8.2 — SportColorPipe

```typescript
// Copilot: create src/app/shared/pipes/sport-color.pipe.ts
// Standalone pure pipe, name: 'sportColor'
// transform(sportName: string): string
// Returns a CSS class string for the sport's accent color:
// 'Football' | 'Soccer' → 'sport--football'
// 'Tennis'              → 'sport--tennis'
// 'Basketball'          → 'sport--basketball'
// 'Ice Hockey'          → 'sport--hockey'
// default               → 'sport--default'
// Define the corresponding CSS classes in the global styles.scss
```

### Acceptance Criteria

- `{{ match.EventDate | formatDate }}` renders "21.3. 13:20" in template
- Each sport section has a distinct left-border color from the pipe

---

## Phase 9 — Components

### Step 9.1 — OddCellComponent

```typescript
// Copilot: create src/app/components/odd-cell/ (ts + html + scss)
// Standalone OnPush component, selector: 'app-odd-cell'
// Signal inputs: value = input<number | null>(null), highlightedOdd = input<number | null>(null)
// computed: isHighlighted = computed(() => value() !== null && value() === highlightedOdd())
// Template: <td> showing value() | number:'1.2-2' or '—' if null
// Apply host class binding: [class.odd--highlighted]="isHighlighted()"
// SCSS: .odd--highlighted { background: #f59e0b; color: #000; font-weight: 700; border-radius: 4px; }
```

### Step 9.2 — MatchRowComponent

```typescript
// Copilot: create src/app/components/match-row/ (ts + html + scss)
// Standalone OnPush component, selector: 'app-match-row'
// Signal inputs: match = input.required<EnrichedMatch>(), highlightedOdd = input<number | null>(null)
// Template: <tr> with cells for:
//   match().Name, match().EventDate | formatDate,
//   match().sportName, match().regionName, match().leagueName
//   then one <app-odd-cell> for each of: home, draw, away, homeOrDraw, drawOrAway
//   passing [value]="match().odds.home" [highlightedOdd]="highlightedOdd()" etc.
// Import: FormatDatePipe, OddCellComponent
```

### Step 9.3 — LeagueSectionComponent

```typescript
// Copilot: create src/app/components/league-section/ (ts + html + scss)
// Standalone OnPush component, selector: 'app-league-section'
// Signal inputs: league = input.required<LeagueGroup>(), highlightedOdd = input<number | null>(null)
// Inject Store.
// Local signal: isCollapsed = signal(false)
// Method: toggle() { isCollapsed.update(v => !v); store.dispatch(MatchesActions.toggleLeague({ leagueId: league().leagueId })) }
// Template:
//   - mat-card
//   - header row: league name + mat-icon-button with expand_more/expand_less icon (based on isCollapsed())
//     clicking header button calls toggle()
//   - @if (!isCollapsed()):
//       <table> with <thead> (Name, Date, Sport, Region, League, 1, X, 2, 1X, X2)
//       <tbody> @for (match of league().matches):  <app-match-row>
// SCSS: chevron rotates 180deg when collapsed, CSS transition 200ms
```

### Step 9.4 — SportSectionComponent

```typescript
// Copilot: create src/app/components/sport-section/ (ts + html + scss)
// Standalone OnPush component, selector: 'app-sport-section'
// Signal inputs: sportGroup = input.required<SportGroup>(), highlightedOdd = input<number | null>(null)
// Template:
//   <section> with host class bound to sportGroup().sportName | sportColor
//   <h2> showing sportGroup().sportName
//   @for (league of sportGroup().leagues):  <app-league-section>
// SCSS: host has border-left: 4px solid; each .sport-- class sets a CSS custom property or direct color
```

### Step 9.5 — MatchListComponent

```typescript
// Copilot: create src/app/components/match-list/ (ts + html + scss)
// Standalone OnPush component, selector: 'app-match-list'
// Inject Store.
// Declare as signals using toSignal():
//   groups = toSignal(store.select(selectGroupedMatches), { initialValue: [] })
//   status = toSignal(store.select(selectStatus), { initialValue: 'idle' })
//   highlightedOdd = toSignal(store.select(selectCurrentHighlightedOddValue), { initialValue: null })
// ngOnInit: store.dispatch(MatchesActions.loadMatches())
// Template:
//   - mat-toolbar with "DoxxBet Matches" title and a mat-raised-button "Highlight Odds"
//     (click) dispatches cycleOddHighlight; show current highlighted value next to button if not null
//   - @if (status() === 'loading'): <mat-progress-bar mode="indeterminate">
//   - @if (status() === 'error'): error message div
//   - @if (status() === 'success'):
//       @for (sport of groups()): <app-sport-section>
//   - @if (status() === 'idle'): empty placeholder
```

### Acceptance Criteria

- Matches appear in the browser grouped by sport then league
- Clicking a league header collapses/expands its matches
- "Highlight Odds" button cycles the amber highlight across all visible odds cells
- Missing odds show '—'

---

## Phase 10 — Styling

### Step 10.1 — Global styles

```scss
// Copilot: write styles.scss for DoxxBet app:
// - body: background #0f172a, color #e2e8f0, font-family from Angular Material typography
// - mat-toolbar: background #1e293b, color white
// - General table styles: width 100%, border-collapse collapse
//   th: background #1e293b, text-align left, padding 8px 12px, font-size 0.75rem, uppercase, letter-spacing 0.05em
//   td: padding 6px 12px, border-bottom 1px solid #334155, font-size 0.875rem
//   tr:hover td: background #1e293b
// - .odd--highlighted: background #f59e0b, color #000, font-weight 700, border-radius 4px,
//     padding 2px 6px, transition background 200ms ease
// - Sport color classes — each sets a border-left color on the host:
//   .sport--football: #22c55e, .sport--tennis: #eab308, .sport--basketball: #f97316,
//   .sport--hockey: #60a5fa, .sport--default: #94a3b8
// - Responsive: @media (max-width: 768px): table wrapper overflow-x: auto; display: block
```

### Step 10.2 — Component SCSS

```scss
// Copilot: write league-section.component.scss:
// mat-card: background #1e293b, no box-shadow, margin-bottom 16px, border-radius 8px
// .league-header: display flex, justify-content space-between, align-items center,
//   padding 12px 16px, cursor pointer
// .league-title: font-size 1rem, font-weight 600, color #e2e8f0
// .chevron: transition transform 200ms ease
// .chevron.collapsed: transform rotate(180deg)
// table: width 100%, margin 0
```

```scss
// Copilot: write sport-section.component.scss:
// :host: display block, border-left 4px solid currentColor, margin-bottom 32px, padding-left 0
// Apply the sport color as border-left color via the .sport-- class on :host
// h2: padding 8px 16px, font-size 1.25rem, font-weight 700, color inherit, margin 0 0 8px
// Fade-in animation: @keyframes fadeIn { from opacity 0, translateY -4px; to opacity 1, translateY 0 }
//   :host { animation: fadeIn 300ms ease }
```

### Acceptance Criteria

- Dark theme renders consistently, no white flashes
- Sport sections have distinct colored left borders
- Chevron animates on collapse/expand
- Table is scrollable horizontally on narrow screens

---

## Phase 11 — Final polish & GitHub

### Step 11.1 — Error boundary & empty state

```typescript
// Copilot: add a mat-card "No matches available" empty state to match-list template
// shown when status === 'success' and groups().length === 0.
// Add a "Retry" button that dispatches loadMatches.
```

### Step 11.2 — README

```markdown
// Copilot: write README.md with these sections:
// # DoxxBet Match Viewer
// ## Overview — 2 sentences describing the app
// ## Features — bullet list of all implemented features
// ## Tech Stack — Angular 21, NgRx 21, Angular Material, SCSS
// ## Getting Started — prerequisites (Node 20+, Angular CLI), npm install, ng serve
// ## Architecture — NgRx data flow diagram in text (Action → Effect → Reducer → Selector → Component)
// ## Highlight Feature — explain the cycleOddHighlight cycling logic with the 2.53→2.30→1.54→1.01→2.53 example
// ## API — document the GET endpoint and response structure
```

### Step 11.3 — Git

Commit message convention per phase:

```
feat: phase 1 — project scaffold and configuration
feat: phase 2 — data models
feat: phase 3 — matches HTTP service
feat: phase 4 — NgRx actions
feat: phase 5 — NgRx state and reducer
feat: phase 6 — NgRx effects
feat: phase 7 — NgRx selectors
feat: phase 8 — pipes (formatDate, sportColor)
feat: phase 9 — components (odd-cell → match-row → league → sport → match-list)
feat: phase 10 — global and component styles
feat: phase 11 — polish, empty state, README
```

### Acceptance Criteria

- `ng build --configuration production` succeeds with no errors
- README renders on GitHub with all sections
- Repository is public

---

## General Copilot Correction Rules

When Copilot generates code that violates the style rules above, apply these fixes:

| Copilot writes                             | Replace with                        |
| ------------------------------------------ | ----------------------------------- |
| `constructor(private svc: SomeService)`    | `private svc = inject(SomeService)` |
| `@Input() value`                           | `value = input<T>()`                |
| `@Output() clicked`                        | `clicked = output<T>()`             |
| `*ngIf="x"`                                | `@if (x)`                           |
| `*ngFor="let i of items"`                  | `@for (i of items; track i.id)`     |
| `ngOnDestroy + takeUntil`                  | `DestroyRef + takeUntilDestroyed()` |
| `NgModule`                                 | Delete — use standalone only        |
| selector without `createSelector`          | Wrap in `createSelector`            |
| `this.store.pipe(select(...))` in template | `toSignal(this.store.select(...))`  |
