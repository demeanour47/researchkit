import type { SearchItem } from "./types";

const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/** Lower case without accents, so “Mendeley” matches “mendeley” and “Méthode” matches “methode”. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase();
}

/** The words of a query, normalised; empty when the query is blank. */
export function queryWords(query: string): string[] {
  return normalize(query).split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * The items that contain every word of the query, in their title, description,
 * group or keywords. Items whose title contains every word come first, those
 * whose title starts with the first word before them; otherwise the index's own
 * order is kept. A blank query returns every item.
 */
export function searchItems<T extends SearchItem>(items: readonly T[], query: string): T[] {
  const words = queryWords(query);
  if (words.length === 0) return [...items];

  const placed = items
    .map((item, index) => {
      const title = normalize(item.title);
      const haystack = `${title} ${normalize(item.description)} ${normalize(item.group)} ${normalize(item.keywords ?? "")}`;
      if (!words.every((word) => haystack.includes(word))) return null;
      const inTitle = words.every((word) => title.includes(word));
      const titleStart = title.split(/[^a-z0-9]+/).some((part) => part.startsWith(words[0]));
      const tier = inTitle ? (titleStart ? 0 : 1) : 2;
      return { item, index, tier };
    })
    .filter((entry): entry is { item: T; index: number; tier: number } => entry !== null);

  return placed.sort((a, b) => a.tier - b.tier || a.index - b.index).map((entry) => entry.item);
}
