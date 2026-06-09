export interface ApiMatch {
  readonly ID: number;
  readonly Name: string;
  readonly EventDate: string;
  readonly SportID: number;
  readonly RegionID: number;
  readonly LeagueID: number;
  readonly EventChanceTypeID: number;
}

export interface ApiOdd {
  readonly EventChanceTypeID: number;
  readonly Value: number;
  readonly OddTypeID: number; // 1=home(1), 2=draw(X), 3=away(2), 4=homeOrDraw(1X), 5=drawOrAway(X2)
}

export interface ApiResponse {
  readonly EventChanceTypes: readonly ApiMatch[];
  readonly Odds: readonly ApiOdd[];
  readonly Labels: Readonly<Record<string, string>>;
}
