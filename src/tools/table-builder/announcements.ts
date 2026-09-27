import type { BuildResult, TableType } from "../../knowledge/tables";
import { TABLE_TYPE_INFO } from "../../knowledge/tables";

/** Everything the Research Table Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  copied: "Table copied. Paste it into your document.",
  copyFailed: "It couldn't be copied automatically. Download the Word file instead, or select the table and copy it.",
  exported: (format: string) => `${format} downloaded.`,
  exportFailed: (format: string) => `The ${format} file couldn't be created. Try another format.`,
  exampleLoaded: (type: TableType) => `Example data loaded: ${TABLE_TYPE_INFO[type].label}. It is fictional.`,
} as const;

/** The table after a choice: built, with its rows and points to check counted, or the first problem stopping it. */
export function tableAnnouncement(type: TableType, result: BuildResult): string {
  const label = TABLE_TYPE_INFO[type].label;
  const problem = result.issues.find((issue) => issue.severity === "problem");
  if (!result.table) return `${label} can't be built yet${problem ? `: ${problem.message}` : "."}`;
  const rows = result.table.rows.length;
  const warnings = result.issues.filter((issue) => issue.severity === "warning").length;
  return `${label} built: ${rows} ${rows === 1 ? "row" : "rows"}.${warnings === 0 ? "" : ` ${warnings} ${warnings === 1 ? "point" : "points"} to check.`}`;
}
