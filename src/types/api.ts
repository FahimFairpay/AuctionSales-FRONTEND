import type { RecipeFilters } from "./filters";

export type Role = "Admin" | "User";
export type AuctionSource = "IAAI" | "COPART";
export type RunStatus =
  | "PROCESSING"
  | "SCRAPED"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED"
  | "ANALYSIS_FAILED"
  | "SKIPPED";

export type PublicUser = {
  userId: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  role: Role | string;
  watchlistCap: number;
  emailOnZeroMatches?: boolean;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  privacyAccepted?: boolean;
  notifyConsent?: boolean;
  notifyConsentAt?: string;
  isActive: boolean;
  createdAt?: string;
  activeWatchlistCount?: number;
  isDeleted?: boolean;
  disabledBy?: string;
  deletedBy?: string;
};

export type MeUser = PublicUser & {
  activeWatchlistCount: number;
};

export type InviteBody = {
  email: string;
  name?: string;
  phoneNumber?: string;
  role?: Role;
  watchlistCap?: number;
};

export type PatchUserBody = {
  name?: string;
  phoneNumber?: string;
  watchlistCap?: number;
  isActive?: boolean;
  role?: Role;
};

export type TopPick = {
  rank: number;
  stockNumber?: string;
  year?: number;
  make?: string;
  model?: string;
  rationale?: string;
  valueNotes?: string;
};

export type TopPicksPayload = { topPicks: TopPick[] };

export type WatchlistSummary = {
  watchlistId: string;
  userId: string;
  name?: string;
  isActive: boolean;
  lastRunStatus?: RunStatus | string;
  lastLogId?: string;
  lastProcessingDate?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  username?: string;
  totalVehicles?: number;
  llmProvider?: string;
  llmFallback?: boolean;
  errorMessage?: string;
  filterCount?: number;
  schedule?: {
    enabled?: boolean;
    cronExpression?: string;
    timezone?: string;
  };
};

export type WatchlistDetail = WatchlistSummary & {
  payload?: RecipeFilters | string;
  topPicks?: TopPicksPayload | string;
  presignedUrl?: string;
  presignedUrlError?: string;
  s3Key?: string;
  totalPages?: number;
  llmModel?: string;
  processingDate?: string;
  schedule?: {
    enabled?: boolean;
    cronExpression?: string;
    timezone?: string;
  };
};

export type CreateWatchlistResult = {
  watchlistId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  activeWatchlistCount?: number;
  watchlistCap?: number;
};

export type PatchWatchlistBody = {
  name?: string;
  isActive?: boolean;
  payload?: RecipeFilters;
  schedule?: {
    enabled?: boolean;
    cronExpression: string;
    timezone: string;
  };
};

export type PatchWatchlistResult = {
  watchlistId: string;
  isActive?: boolean;
};

export type ActivityLog = {
  logId: string;
  processingDate?: string;
  watchlistId: string;
  watchlistName?: string;
  userId?: string;
  username?: string;
  status: RunStatus | string;
  startedAt?: string;
  completedAt?: string;
  emailSent?: boolean;
};

export type ActivityLogDetail = ActivityLog & {
  topPicks?: TopPicksPayload | string;
  presignedUrl?: string;
  presignedUrlError?: string;
  llmFallback?: boolean;
};

export type PublicRecipe = {
  recipeVersion?: string;
  itemsPerPage?: number;
  filters?: RecipeFilters;
  rules?: CopartRecipeRules;
  source?: AuctionSource;
  updatedAt?: string;
  updatedBy?: string;
};

export type InventoryItem = {
  stockNumber: string;
  title?: string;
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
  odometer?: number;
  vehicleScore?: number;
  primaryDamage?: string;
  secondaryDamage?: string;
  auctionDate?: string;
  auctionAt?: number;
  buyNowPrice?: number;
  currentBid?: number;
  startCode?: string;
  branch?: string;
  vehicleType?: string;
  fuelType?: string;
  transmission?: string;
  airbags?: string;
  imageUrl?: string;
  detailLink?: string;
  titleDoc?: string;
  keyStatus?: string;
  bodyStyle?: string;
  engine?: string;
  extColor?: string;
  intColor?: string;
  seller?: string;
  market?: string;
  lossType?: string;
  newInvTime?: string;
  vehicleSubtype?: string;
  cylinders?: string;
  drivelineType?: string;
  countryOfOrigin?: string;
  laneRun?: string;
  sellerType?: string;
  acv?: number;
  region?: string;
  state?: string;
  source?: AuctionSource;
  sourceId?: string;
  gallery?: Array<{ sequence?: number; thumb?: string; large?: string; hd?: string }> | string[];
  outboundAuctionUrl?: string;
  titleCategory?: "CLEAN" | "SALVAGE";
  cleanTitle?: boolean;
};

export type InventoryLotItem = InventoryItem;

export type FailureItem = {
  kind: "desk" | "scrape";
  id: string;
  status?: string;
  when?: string;
  title?: string;
  owner?: string;
  errorMessage?: string;
  watchlistId?: string;
  runId?: string;
  lastLogId?: string;
  lastProcessingDate?: string;
  scrapeRunId?: string;
  recipeVersion?: string;
  llmFallback?: boolean;
};

export type FailurePage = {
  items: FailureItem[];
  nextCursor?: string | null;
  limit: number;
};

export type InventoryPage = {
  items: InventoryItem[];
  nextCursor?: string | null;
  limit: number;
  total?: number;
  totalPages?: number;
  page?: number;
  hasMore?: boolean;
};

export type ScrapeRun = {
  scrapeRunId: string;
  status?: string;
  startedAt?: string;
  completedAt?: string;
  lastHeartbeatAt?: string;
  pagesVisited?: number;
  itemsSeen?: number;
  itemsWritten?: number;
  itemsFailed?: number;
  csvRowCount?: number;
  s3CsvKey?: string;
  pageComplete?: boolean | string;
  needsIngest?: boolean;
  errorMessage?: string;
  recipeVersion?: string;
};

export type ScrapeRunList = {
  day: string;
  runs: ScrapeRun[];
};

export type CrawlSchedule = {
  scheduleId: string;
  name: string;
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  source?: AuctionSource;
  recipeId?: string;
  eventBridgeScheduleName?: string;
  createdAt?: string;
  lastRunAt?: string;
};

export type AdminSchedule = CrawlSchedule;

export interface CopartRecipeRules {
  source?: "COPART";
  min_year: number;
  max_odometer: number;
  sale_title_type: string;
  allowed_doc_types: string[];
  makes: string[];
  primary_damages: string[];
  fuel_types: string[];
  has_keys?: string;
  transmission?: string;
  runs_drives?: string;
  secondary_damages_allowed?: string[];
}

export interface IaaiRecipeRules {
  source: "IAAI";
  facets: Record<string, string[]>;
  rangeFilters: Record<string, { min?: number; max?: number }>;
}

export type ScrapeRecipe = CopartRecipeRules | IaaiRecipeRules;

export type RecipeWriteResult = {
  recipeVersion?: string;
  filters?: RecipeFilters;
  watchlistsStripped?: number;
};

export type { RecipeFilters, RangeFilter } from "./filters";

export type Preset = WatchlistSummary;
export type ExecutionLog = ActivityLog;

export type FavoriteItem = {
  stockNumber: string;
  source?: AuctionSource | string;
  title: string;
  imageUrl?: string;
  vin?: string;
  branch?: string;
  auctionDate?: string;
  auctionAt?: number;
  currentBid?: number;
  acv?: number;
  primaryDamage?: string;
  savedAt?: string;
};

export type ToggleFavoriteResponse = {
  stockNumber: string;
  source?: string;
  isFavorite: boolean;
  savedAt?: string;
  removedAt?: string;
  adminNotified?: boolean;
};
