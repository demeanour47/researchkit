/**
 * Keyword discovery. Two kinds of term are kept apart because they mean different things:
 * terms the provider assigned (OpenAlex tags works automatically, they are not author
 * keywords) and terms ResearchKit counted in the titles and abstracts it was given.
 * ResearchKit's terms are a prompt for new searches, not a claim about the field.
 */

import { queryTerms } from "./query";
import { GENERIC_WORDS, STOPWORDS, fold, stem } from "./text";
import type { LiteratureRecord, TermCount } from "./types";

const MAX_TERMS = 12;
/** A term must appear in at least this many works to be suggested. */
const MIN_WORKS = 2;

function sortCounts(counts: Map<string, { label: string; count: number }>): TermCount[] {
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "en"))
    .map(({ label, count }) => ({ term: label, count }));
}

/** Provider-assigned keywords by the number of works carrying them. */
export function providerTerms(records: readonly LiteratureRecord[]): TermCount[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const record of records) {
    const seen = new Set<string>();
    for (const keyword of record.providerKeywords) {
      const key = fold(keyword);
      if (key === "" || seen.has(key)) continue;
      seen.add(key);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { label: keyword, count: 1 });
    }
  }
  return sortCounts(counts).slice(0, MAX_TERMS);
}

const usable = (word: string) => word.length > 2 && !STOPWORDS.has(word) && !GENERIC_WORDS.has(word) && !/^\d+$/.test(word);

/** Words and two-word phrases in one text, folded; phrases never cross a stop word. */
function candidates(text: string): Set<string> {
  const found = new Set<string>();
  const words = fold(text).split(" ").filter(Boolean);
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (!usable(word)) continue;
    found.add(stem(word));
    const next = words[i + 1];
    if (next !== undefined && usable(next)) found.add(`${stem(word)} ${stem(next)}`);
  }
  return found;
}

/** Terms from the results' own titles and abstracts, excluding the words already searched for. */
export function researchKitTerms(records: readonly LiteratureRecord[], query: string): TermCount[] {
  const searched = new Set([...queryTerms(query).words.map(stem), ...queryTerms(query).phrases.flatMap((phrase) => phrase.split(" ").map(stem))]);
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const candidate of candidates(`${record.source.title} ${record.abstract ?? ""}`)) {
      counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
    }
  }
  const eligible = [...counts.entries()].filter(([term, count]) => count >= MIN_WORKS && !term.split(" ").every((word) => searched.has(word)));
  // Prefer a phrase to its own words when both appear in the same works.
  const phrases = eligible.filter(([term]) => term.includes(" "));
  const covered = new Set<string>();
  for (const [term, count] of phrases) {
    for (const word of term.split(" ")) if (counts.get(word) === count) covered.add(word);
  }
  const labelled = new Map<string, { label: string; count: number }>();
  for (const [term, count] of eligible) {
    if (covered.has(term)) continue;
    labelled.set(term, { label: term, count });
  }
  return sortCounts(labelled).slice(0, MAX_TERMS);
}

/** Adds, to each record, the suggested ResearchKit terms that occur in its title or abstract. */
export function attachResearchKitKeywords(records: readonly LiteratureRecord[], terms: readonly TermCount[]): LiteratureRecord[] {
  return records.map((record) => {
    const present = candidates(`${record.source.title} ${record.abstract ?? ""}`);
    return { ...record, researchKitKeywords: terms.filter(({ term }) => present.has(term)).map(({ term }) => term) };
  });
}
