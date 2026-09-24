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
} as const satisfies Record<StatKey, string>;

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
  return typeof value === "number" ? formatCount(value) : formatDuration(value);
}

export const formatPace = (wordsPerMinute: number) => `${formatCount(wordsPerMinute)} words per minute`;

/** A spoken summary of the given results, e.g. "Words: 10. Reading time: Less than one minute." */
export function describeStats(stats: TextStatistics, fields: readonly StatField[]): string {
  return fields.map(({ key, label }) => `${label}: ${formatStat(stats, key)}.`).join(" ");
}
