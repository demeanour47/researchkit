import type { PrismaIssue } from "../../knowledge/prisma";

/** Everything the PRISMA Flow Diagram Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  copied: "Diagram copied. Paste it into your document or slides.",
  textCopied: "Copied.",
  copyFailed: "It couldn't be copied automatically. Select the text and copy it with Control+C, or Command+C on a Mac.",
  exported: (format: string) => `${format} downloaded.`,
  exportFailed: (format: string) => `The ${format} file couldn't be created. Try another format.`,
  counted: (total: number, duplicates: number) => `${total} records counted, ${duplicates} of them duplicates.`,
  countsUsed: "Counts from the files filled in.",
  studiesCounted: (count: number) => `${count} included ${count === 1 ? "study" : "studies"} filled in.`,
} as const;

/** The checks after a change, in one sentence. */
export function checksAnnouncement(issues: readonly PrismaIssue[]): string {
  const problems = issues.filter((issue) => issue.severity === "problem").length;
  const warnings = issues.length - problems;
  if (issues.length === 0) return "Diagram updated. Every number adds up.";
  const parts = [problems > 0 ? `${problems} ${problems === 1 ? "problem" : "problems"}` : "", warnings > 0 ? `${warnings} ${warnings === 1 ? "point" : "points"} to check` : ""].filter(Boolean);
  return `Diagram updated. ${parts.join(" and ")}.`;
}
