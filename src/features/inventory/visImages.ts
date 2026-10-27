const VIS_INDEXES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 115, 116, 117, 118, 119] as const;

const BOTH = ["S0", "S1"] as const;
const ONLY_S0 = ["S0"] as const;

const SETS: Record<(typeof VIS_INDEXES)[number], readonly string[]> = {
  1: BOTH,
  2: BOTH,
  3: BOTH,
  4: BOTH,
  5: BOTH,
  6: BOTH,
  7: ONLY_S0,
  8: BOTH,
  9: ONLY_S0,
  10: ONLY_S0,
  11: BOTH,
  115: BOTH,
  116: BOTH,
  117: BOTH,
  118: ONLY_S0,
  119: BOTH,
};

export const VIS_SLOT_COUNT = VIS_INDEXES.length;

const STAGE = { width: 960, height: 720 };
const THUMB_FALLBACK = { width: 161, height: 120 };

export type VisCandidate = {
  thumb: string;
  large: string;
  index: number;
  set: string | null;
};

export function galleryShots(
  gallery?: Array<{ thumb?: string; large?: string; hd?: string } | string> | null,
): VisCandidate[] {
  if (!Array.isArray(gallery) || gallery.length === 0) {
    return [];
  }
  return gallery.flatMap((shot, index) => {
    if (typeof shot === "string") {
      return shot ? [{ thumb: shot, large: shot, index, set: null }] : [];
    }
    const large = shot.large || shot.hd || shot.thumb || "";
    if (!large) {
      return [];
    }
    return [{ thumb: shot.thumb || large, large, index, set: null }];
  });
}

export function expandVisImages(src: string): VisCandidate[] {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return [];
  }
  const key = url.searchParams.get("imageKeys");
  if (!key || !/~I\d+/.test(key)) {
    return [];
  }
  const storedMatch = key.match(/~S(\d+)/);
  const stored = storedMatch ? `S${storedMatch[1]}` : null;
  const thumbW = positive(url.searchParams.get("width")) ?? THUMB_FALLBACK.width;
  const thumbH = positive(url.searchParams.get("height")) ?? THUMB_FALLBACK.height;
  const seen = new Set<string>();
  const shots: VisCandidate[] = [];
  for (const index of VIS_INDEXES) {
    const sets = stored ? orderSets(SETS[index], stored) : [null];
    for (const set of sets) {
      const nextKey = rewriteKey(key, index, set);
      if (seen.has(nextKey)) {
        continue;
      }
      seen.add(nextKey);
      shots.push({
        index,
        set,
        thumb: paint(url, nextKey, thumbW, thumbH),
        large: paint(url, nextKey, STAGE.width, STAGE.height),
      });
    }
  }
  return shots;
}

function orderSets(allowed: readonly string[], stored: string): Array<string | null> {
  const preferred = allowed.includes(stored) ? [stored] : [];
  return [...preferred, ...allowed.filter((set) => set !== stored)];
}

function rewriteKey(key: string, index: number, set: string | null): string {
  let next = key.replace(/~I\d+/, `~I${index}`);
  if (set && /~S\d+/.test(next)) {
    next = next.replace(/~S\d+/, `~${set}`);
  }
  return next;
}

function paint(source: URL, imageKeys: string, width: number, height: number): string {
  const url = new URL(source.href);
  url.searchParams.set("imageKeys", imageKeys);
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  return url.toString();
}

function positive(value: string | null): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
