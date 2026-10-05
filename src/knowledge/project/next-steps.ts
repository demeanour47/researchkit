/**
 * What to do next, chosen from the state of the project. No AI: a fixed rule per
 * state, so the same project always gets the same recommendation.
 */

import type { Journey, JourneyNode } from "./journey";
import type { ProjectState } from "./state";

export interface NextStep {
  kind: "start" | "work" | "review" | "finish";
  headline: string;
  detail: string;
  node: JourneyNode | null;
}

export function nextStepFor(journey: Journey, project: ProjectState): NextStep {
  const started = journey.nodes.some((node) => node.state === "completed");
  if (!started && !project.profile.interest) {
    return { kind: "start", headline: "Say what you're interested in", detail: "A rough interest is enough to begin.", node: journey.current };
  }
  const review = journey.nodes.find((node) => node.needsReview);
  if (review) {
    return { kind: "review", headline: `Review ${review.name.toLowerCase()}`, detail: "Something it depends on changed since you saved it.", node: review };
  }
  if (journey.current && journey.percent < 100) {
    const node = journey.current;
    const blocked = node.state === "blocked";
    return {
      kind: "work",
      headline: blocked ? `Prepare for ${node.name.toLowerCase()}` : `Work on ${node.name.toLowerCase()}`,
      detail: blocked && node.reason ? node.reason : node.summary,
      node,
    };
  }
  return { kind: "finish", headline: "Every stage is complete", detail: "Read the document through against your institution's requirements.", node: null };
}
