/** Everything the Sampling Technique Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  added: (name: string) => `${name} sampling added to your shortlist.`,
  removed: (name: string) => `${name} sampling removed from your shortlist.`,
  chosen: (name: string | null) => (name ? `You chose ${name.toLowerCase()} sampling. Its checks are shown below your plan.` : "No technique chosen."),
  copied: (what: string) => `${what} copied.`,
  copyFailed: "It couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** How many techniques fit every answer. A count of techniques, never a score for any one. */
export function narrowingAnnouncement(consistent: number, answered: number): string {
  if (answered === 0) return "No answers yet. Every technique is shown.";
  if (consistent === 0) return "No technique fits every answer. Each technique shows where it differs.";
  return `${consistent} ${consistent === 1 ? "technique fits" : "techniques fit"} every answer so far.`;
}

/** The message for a response rate that can't be read, or null when it is valid or empty. */
export function responseRateError(text: string, parse: (text: string) => number | null): string | null {
  try {
    parse(text);
    return null;
  } catch (error) {
    return error instanceof RangeError ? error.message : "Enter a percentage between 0 and 100.";
  }
}
