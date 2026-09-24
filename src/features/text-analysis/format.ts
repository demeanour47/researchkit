/**
 * Display formatting shared by the text-analysis tools. Counting itself lives in
 * the knowledge layer; this module only turns results into words.
 */

import type { Duration, TextStatistics } from "@/knowledge/text/text-statistics";

export type StatKey = keyof TextStatistics;

export interface StatField {
  key: StatKey;
  label: string;
}

export const statLabels = {
  words: "Words",
  charactersWithSpaces: "Characters (with spaces)",
  charactersWithoutSpaces: "Characters (without spaces)",
  sentences: "Sentences",
  paragraphs: "Paragraphs",
  readingTime: "Reading time",
  speakingTime: "Speaking time",
  averageWordsPerSentence: "Average words per sentence",
  averageCharactersPerWord: "Average characters per word",
  averageSentencesPerParagraph: "Average sentences per paragraph",
  longestSentenceWords: "Longest sentence (words)",
  longestParagraphWords: "Longest paragraph (words)",
  estimatedPagesSingleSpaced: "Estimated pages, single spaced",
  estimatedPagesDoubleSpaced: "Estimated pages, double spaced",
} as const satisfies Record<StatKey, string>;

/** The privacy statement shared by every text-analysis tool. True because analysis runs only in the browser. */
export const PRIVACY_NOTICE =
  "Your text is analysed entirely in your browser. It is never sent to ResearchKit or anyone else, and it isn't stored: closing or reloading the page clears it.";

/** Shown where a result has no value, such as an average of no sentences. */
export const NO_VALUE = "None";

/** Result fields with their standard labels, in the order given. */
export const statFields = (keys: readonly StatKey[]): StatField[] =>
  keys.map((key) => ({ key, label: statLabels[key] }));

const numbers = new Intl.NumberFormat("en");

export const formatCount = (count: number) => numbers.format(count);

export function formatDuration(duration: Duration): string {
  switch (duration.kind) {
    case "none":
      return "0 minutes";
    case "under-a-minute":
      return "Less than one minute";
    case "minutes":
      return duration.minutes === 1 ? "1 minute" : `${formatCount(duration.minutes)} minutes`;
  }
}

export function formatStat(stats: TextStatistics, key: StatKey): string {
  const value = stats[key];
  if (value === null) return NO_VALUE;
  return typeof value === "number" ? formatCount(value) : formatDuration(value);
}

export const formatPace = (wordsPerMinute: number) => `${formatCount(wordsPerMinute)} words per minute`;

/** A spoken summary of the given results, e.g. "Words: 10. Reading time: Less than one minute." */
export function describeStats(stats: TextStatistics, fields: readonly StatField[]): string {
  return fields.map(({ key, label }) => `${label}: ${formatStat(stats, key)}.`).join(" ");
}
