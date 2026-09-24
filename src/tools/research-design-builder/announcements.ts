/** Everything the Research Design Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  added: (name: string) => `${name} added to your shortlist.`,
  removed: (name: string) => `${name} removed from your shortlist.`,
  chosen: (name: string | null) => (name ? `You chose ${name}. Its checks are shown under Justify your design.` : "No design chosen."),
  copied: "Comparison table copied.",
  copyFailed: "The table couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** How many designs fit every answer, in words. A count of designs, never a score for any one of them. */
export function narrowingAnnouncement(consistent: number, answered: number): string {
  if (answered === 0) return "No answers yet. Every design is shown.";
  if (consistent === 0) return "No design fits every answer. Each design shows where it differs.";
  return `${consistent} ${consistent === 1 ? "design fits" : "designs fit"} every answer so far.`;
}
