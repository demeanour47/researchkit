import type { SampleSizeResult } from "@/knowledge/research";

/** Everything the Sample Size Calculator announces to screen readers. Pure, so it is tested. */

export const announcements = {
  methodChosen: (name: string, available: boolean) =>
    available ? `Method chosen: ${name}. The working has been recalculated.` : `Method chosen: ${name}. It isn't calculated here; the result section explains why.`,
  populationType: (finite: boolean) => (finite ? "Known population size. Enter the number of people in your population." : "Unknown or very large population."),
  rateUsed: (rate: string) => `Response rate set to ${rate}% from your sampling plan.`,
  copied: (what: string) => `${what} copied.`,
  copyFailed: "It couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** The message for a number field that can't be read, or null when it is valid. Empty is valid only for optional fields. */
export function numberError(text: string, parse: (text: string) => number | null, required: boolean): string | null {
  try {
    return parse(text) === null && required ? "Enter a number." : null;
  } catch (error) {
    return error instanceof Error ? error.message : "Enter a number.";
  }
}

/** One sentence summing up the result, stating that it follows from the assumptions. */
export function resultSentence(result: SampleSizeResult): string {
  if (!result.available || result.adjusted === null) return "No sample size calculated.";
  const invite = result.invite === null ? "" : ` Invite ${result.invite} to expect about ${result.expectedResponses} responses.`;
  return `With these assumptions, the sample size is ${result.adjusted}.${invite}`;
}
