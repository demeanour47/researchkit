import type { ChartIssue, ChartType } from "../../knowledge/charts";
import { CHART_TYPE_INFO } from "../../knowledge/charts";

/** Everything the Research Chart Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  copied: "Chart copied. Paste it into your document.",
  altCopied: "Alt text copied.",
  captionCopied: "Caption copied.",
  tableCopied: "Data copied as CSV.",
  copyFailed: "It couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
  exported: (format: string) => `${format} downloaded.`,
  exportFailed: (format: string) => `The ${format} couldn't be created. Try another format, or a different browser.`,
  exampleLoaded: (type: ChartType) => `Example data for the ${CHART_TYPE_INFO[type].label.toLowerCase()} loaded. It is fictional.`,
} as const;

/** The chart after a choice: drawn with its warnings counted, or the first problem stopping it. */
export function chartAnnouncement(type: ChartType, issues: readonly ChartIssue[], hasData: boolean): string {
  const label = CHART_TYPE_INFO[type].label;
  if (!hasData) return `${label} chosen. Enter or paste data to draw it.`;
  const problem = issues.find((issue) => issue.severity === "problem");
  if (problem) return `${label} can't be drawn yet: ${problem.message}`;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  return `${label} drawn.${warnings === 0 ? "" : ` ${warnings} ${warnings === 1 ? "point" : "points"} to check.`}`;
}
