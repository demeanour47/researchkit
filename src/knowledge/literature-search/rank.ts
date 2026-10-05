/**
 * Relevance scoring. The rule is fixed and published on the tool page, so a student can
 * see why one paper outranks another:
 *
 *   each search word found in the title            3 points
 *   each search word found in the abstract         1 point
 *   each search word found in provider keywords
 *     or topic names                               2 points
 *   each quoted phrase found in the title          6 points
 *   each quoted phrase found in the abstract       3 points
 *
 * The total is divided by the most a work could score for this search and shown as 0–100.
 * Ties keep the provider's own order (which is already by its relevance).
 */

import { queryTerms } from "./query";
import { containsPhrase, wordsOf } from "./text";
import type { LiteratureRecord } from "./types";

export const RANK_WEIGHTS = { titleWord: 3, abstractWord: 1, keywordWord: 2, titlePhrase: 6, abstractPhrase: 3 } as const;

export interface Scored {
  record: LiteratureRecord;
  index: number;
}

/** Fills in `relevance` and `matchedKeywords`, and orders by score. Stable, deterministic, no randomness. */
export function rank(records: readonly LiteratureRecord[], query: string): LiteratureRecord[] {
  const { words, phrases } = queryTerms(query);
  const stemmedWords = words.flatMap((word) => wordsOf(word));
  const stemmedPhrases = phrases.map((phrase) => wordsOf(phrase));
  const maximum =
    stemmedWords.length * (RANK_WEIGHTS.titleWord + RANK_WEIGHTS.abstractWord + RANK_WEIGHTS.keywordWord) +
    stemmedPhrases.length * (RANK_WEIGHTS.titlePhrase + RANK_WEIGHTS.abstractPhrase);

  const scored = records.map((record, index) => {
    const title = wordsOf(record.source.title);
    const abstract = wordsOf(record.abstract ?? "");
    const keywords = wordsOf([...record.providerKeywords, ...record.topics.map((topic) => topic.name)].join(" "));
    let points = 0;
    const matched: string[] = [];
    let inTitle = false;
    let inAbstract = false;
    let inKeywords = false;

    stemmedWords.forEach((word, position) => {
      const label = words[position] ?? word;
      const t = title.includes(word);
      const a = abstract.includes(word);
      const k = keywords.includes(word);
      if (t) points += RANK_WEIGHTS.titleWord;
      if (a) points += RANK_WEIGHTS.abstractWord;
      if (k) points += RANK_WEIGHTS.keywordWord;
      if (t || a || k) matched.push(label);
      inTitle ||= t;
      inAbstract ||= a;
      inKeywords ||= k;
    });
    stemmedPhrases.forEach((phrase, position) => {
      const t = containsPhrase(title, phrase);
      const a = containsPhrase(abstract, phrase);
      if (t) points += RANK_WEIGHTS.titlePhrase;
      if (a) points += RANK_WEIGHTS.abstractPhrase;
      if (t || a) matched.push(phrases[position]);
      inTitle ||= t;
      inAbstract ||= a;
    });

    const score = maximum === 0 ? 0 : Math.round((points / maximum) * 100);
    const ranked: LiteratureRecord = { ...record, matchedKeywords: matched, relevance: { score, inTitle, inAbstract, inKeywords } };
    return { record: ranked, index };
  });

  return scored.sort((a, b) => (b.record.relevance?.score ?? 0) - (a.record.relevance?.score ?? 0) || a.index - b.index).map((entry) => entry.record);
}
