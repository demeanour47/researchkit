/**
 * Research readiness: how far each part of the project has got. An educational
 * indicator computed from the journey, not a score of quality and not a grade.
 */

import { READINESS_DIMENSIONS, type Journey, type ReadinessDimension } from "./journey";

export interface ReadinessBar {
  dimension: ReadinessDimension;
  label: string;
  completed: number;
  applicable: number;
  /** 0 to 100, or null when nothing in this dimension applies. */
  percent: number | null;
}

export interface Readiness {
  bars: readonly ReadinessBar[];
  sentence: string;
}

const LABELS: Record<ReadinessDimension, string> = {
  foundation: "Foundation",
  question: "Question",
  evidence: "Evidence",
  methodology: "Methodology",
  writing: "Writing",
};

export function readinessOf(journey: Journey): Readiness {
  const bars = READINESS_DIMENSIONS.map((dimension): ReadinessBar => {
    const nodes = journey.nodes.filter((node) => node.group === dimension && node.state !== "not-applicable" && node.state !== "optional");
    const completed = nodes.filter((node) => node.state === "completed").length;
    return { dimension, label: LABELS[dimension], completed, applicable: nodes.length, percent: nodes.length === 0 ? null : Math.round((completed / nodes.length) * 100) };
  });
  return { bars, sentence: sentenceFor(bars) };
}

function sentenceFor(bars: readonly ReadinessBar[]): string {
  const counted = bars.filter((bar) => bar.percent !== null);
  if (counted.every((bar) => bar.completed === 0)) return "Nothing is recorded yet. Start with your interest or topic.";
  if (counted.every((bar) => bar.percent === 100)) return "Every part is in place. Review the document against your institution's requirements.";
  const strongest = counted.reduce((a, b) => ((b.percent ?? 0) > (a.percent ?? 0) ? b : a));
  const next = counted.find((bar) => (bar.percent ?? 0) < 100);
  return `${strongest.label} is furthest along. ${next && next !== strongest ? `${next.label} is the next area to build.` : "Keep going where you are."}`;
}
