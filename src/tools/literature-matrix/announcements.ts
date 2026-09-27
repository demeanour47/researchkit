import type { ImportResult } from "../../knowledge/literature";

/** Everything the Literature Matrix Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  added: (label: string) => `${label} added. Its details are open for editing.`,
  duplicated: (label: string) => `${label} duplicated.`,
  deleted: (label: string) => `${label} deleted. Use Undo delete to restore it.`,
  restored: (label: string) => `${label} restored.`,
  moved: (label: string, position: number, total: number) => `${label} moved to position ${position} of ${total}.`,
  favourite: (label: string, on: boolean) => `${label} ${on ? "marked as a favourite" : "no longer a favourite"}.`,
  exampleLoaded: (count: number) => `Example matrix loaded: ${count} fictional studies.`,
  exported: (format: string) => `${format} downloaded.`,
  exportFailed: (format: string) => `The ${format} file couldn't be created. Try another format.`,
  copied: "Synthesis copied.",
  copyFailed: "It couldn't be copied automatically. Select the synthesis and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** The outcome of an import, in one sentence or two. */
export function importAnnouncement(result: Pick<ImportResult, "added" | "duplicates" | "notes">): string {
  const parts = [result.added === 0 ? "No studies were added." : `${result.added} ${result.added === 1 ? "study" : "studies"} added.`];
  if (result.duplicates.length > 0) parts.push(`${result.duplicates.length} already in the matrix ${result.duplicates.length === 1 ? "was" : "were"} skipped.`);
  if (result.notes.length > 0) parts.push(result.notes[0]);
  return parts.join(" ");
}

/** What the matrix shows after searching or filtering. */
export const viewAnnouncement = (shown: number, total: number) => (shown === total ? `Showing all ${total} ${total === 1 ? "study" : "studies"}.` : `Showing ${shown} of ${total} studies.`);
