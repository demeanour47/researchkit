/**
 * Lightweight progress for one browser session: which tools and guides a visitor
 * has opened and which challenges they have answered. It is counts of public ids,
 * kept only in the tab's session storage and never sent anywhere.
 */

export const PROGRESS_KINDS = ["tools", "guides", "challenges"] as const;
export type ProgressKind = (typeof PROGRESS_KINDS)[number];

export type Progress = Readonly<Record<ProgressKind, readonly string[]>>;

export const EMPTY_PROGRESS: Progress = { tools: [], guides: [], challenges: [] };

/** Most ids kept for a kind, so a tampered store can't grow without limit. */
export const MAX_IDS = 200;
const MAX_ID_LENGTH = 100;
const ID = /^[a-z0-9][a-z0-9-]*$/;

const isId = (value: unknown): value is string => typeof value === "string" && value.length <= MAX_ID_LENGTH && ID.test(value);

/** Reads stored progress, ignoring anything that isn't the expected shape. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return EMPTY_PROGRESS;
    const read = (kind: ProgressKind): string[] => {
      const list = (data as Record<string, unknown>)[kind];
      return Array.isArray(list) ? [...new Set(list.filter(isId))].slice(0, MAX_IDS) : [];
    };
    return { tools: read("tools"), guides: read("guides"), challenges: read("challenges") };
  } catch {
    return EMPTY_PROGRESS;
  }
}

/** Progress with the id added; the same object when it was already there or isn't a valid id. */
export function recordProgress(progress: Progress, kind: ProgressKind, id: string): Progress {
  if (!isId(id) || progress[kind].includes(id) || progress[kind].length >= MAX_IDS) return progress;
  return { ...progress, [kind]: [...progress[kind], id] };
}

export const countOf = (progress: Progress, kind: ProgressKind): number => progress[kind].length;
export const isEmpty = (progress: Progress): boolean => PROGRESS_KINDS.every((kind) => progress[kind].length === 0);
