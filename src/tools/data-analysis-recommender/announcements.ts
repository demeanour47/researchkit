import type { AnalysisPlan } from "@/knowledge/research";

/** Everything the Data Analysis Recommender announces to screen readers. Pure, so it is tested. */

export const announcements = {
  exampleLoaded: "Example project loaded. It is fictional, for trying the recommender.",
  copied: "Analysis plan copied.",
  copyFailed: "It couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** A summary of the plan after a change: how many recommendations of each verdict. Counts describe the plan; they never grade it. */
export function planAnnouncement(plan: Pick<AnalysisPlan, "stages">): string {
  const all = plan.stages.flatMap((stage) => stage.questions.flatMap((question) => question.recommendations));
  if (all.length === 0) return "No recommendations yet. Add your variables to see them.";
  const count = (strength: string) => all.filter((recommendation) => recommendation.strength === strength).length;
  const part = (number: number, one: string, many: string) => `${number} ${number === 1 ? one : many}`;
  return `Plan updated: ${part(count("strong"), "strong recommendation", "strong recommendations")}, ${part(count("possible"), "possible recommendation", "possible recommendations")}, ${part(count("justify"), "method needing justification", "methods needing justification")}.`;
}
