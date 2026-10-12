export const paths = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  forgotConfirm: "/forgot-password/confirm",
  newPassword: "/new-password",
  home: "/app",
  publicInventory: "/inventory",
  publicInventoryItem: (stock: string) => `/inventory/${encodeURIComponent(stock)}`,
  inventory: "/app/inventory",
  inventoryItem: (stock: string) => `/app/inventory/${encodeURIComponent(stock)}`,
  presets: "/app/presets",
  presetNew: "/app/presets/new",
  preset: (id: string) => `/app/presets/${id}`,
  presetEdit: (id: string) => `/app/presets/${id}/edit`,
  history: "/app/history",
  historyLog: (id: string, date?: string) => {
    const params = new URLSearchParams();
    params.set("log", id);
    if (date) {
      params.set("date", date);
    }
    return `${paths.history}?${params.toString()}`;
  },
  account: "/app/account",
  adminUsers: "/admin/users",
  adminInvite: "/admin/users/invite",
  adminUser: (id: string) => `/admin/users/${id}`,
  adminPresets: "/admin/presets",
  adminFailures: "/admin/failures",
  adminCrawler: "/admin/schedules",
  adminCrawlerRun: (id: string) => `/admin/schedules/${encodeURIComponent(id)}`,
  adminSettings: "/admin/settings",
  get watchlists() {
    return paths.presets;
  },
  get watchlistNew() {
    return paths.presetNew;
  },
  watchlist(id: string) {
    return paths.preset(id);
  },
  watchlistEdit(id: string) {
    return paths.presetEdit(id);
  },
  get activity() {
    return paths.history;
  },
  activityLog(id: string, date?: string) {
    return paths.historyLog(id, date);
  },
  get adminWatchlists() {
    return paths.adminPresets;
  },
  get adminScrapeRuns() {
    return paths.adminCrawler;
  },
  adminScrapeRun(id: string) {
    return paths.adminCrawlerRun(id);
  },
  get adminRecipe() {
    return paths.adminSettings;
  },
};

export function recipeRedirectTo(): string {
  return paths.adminCrawler;
}

export function activityHref(query?: { date?: string; userId?: string }): string {
  const params = new URLSearchParams();
  if (query?.date) {
    params.set("date", query.date);
  }
  if (query?.userId) {
    params.set("userId", query.userId);
  }
  const suffix = params.toString();
  return suffix ? `${paths.history}?${suffix}` : paths.history;
}

export function signInWithNext(next?: string): string {
  if (!next) {
    return paths.signIn;
  }
  return `${paths.signIn}?next=${encodeURIComponent(next)}`;
}
