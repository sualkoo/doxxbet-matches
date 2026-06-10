export interface ApiMatch {
  readonly EventID: number;
  readonly EventName: string;
  readonly EventDate: string;
  readonly BetType: string;
  readonly EventChanceTypeID: number;
  readonly EventChanceTypeStatus: string;
  readonly LiveBetting: string;
  readonly SportEventID: number;
  readonly SportID: number;
  readonly RegionID: number;
  readonly LeagueCupID: number;
  readonly ChanceTypeID: string;
  readonly ChanceTypeName: string;
  readonly SideBet: number;
  readonly ActualGamePartID: string;
  readonly ActualGamePartTime: number;
  readonly LiveFeedReference: number;
  readonly LiveBettingView: number;
  readonly ChannelID: string;
  readonly EventType: string;
  readonly CountryID: string;
  readonly HasStatistics: boolean;
  readonly HasBetradarHostedStatistics: boolean;
  readonly SeasonID: number;
  readonly BetradarSportID: number;
  readonly HasMatchTracker: boolean;
  readonly BetBuilderID: number;
  readonly Provider: string;
  readonly BetradarStatisticsUrn: string;
  readonly BetradarStatisticsUrl: string;
  readonly Widgets: readonly string[];
}

export interface ApiOdd {
  readonly EventChanceTypeID: number;
  readonly OddsID: number;
  readonly OddsRate: number;
  readonly Status: string;
  readonly TipID: string;
  readonly TipType: string; // "1"=home, "X"=draw, "2"=away, "1X"=homeOrDraw, "X2"=drawOrAway
  readonly TipOrder: string;
  readonly CompetitorID: number;
  readonly PlayerID: number;
}

export interface ApiLabel {
  readonly Typ: string;
  readonly ID: number;
  readonly LanguageID: string;
  readonly Name: string;
  readonly CountryID?: string;
}

export interface ApiResponse {
  readonly EventChanceTypes: readonly ApiMatch[];
  readonly Odds: Readonly<Record<string, ApiOdd>>;
  readonly Labels?: Readonly<Record<string, ApiLabel>>;
}
