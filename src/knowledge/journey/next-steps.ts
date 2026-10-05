/**
 * What to do after a tool. Hand-written entries say why a step follows; a tool
 * without one gets the tools of the next journey stage. Nothing is inferred
 * from usage: ResearchKit collects none.
 */

import { JOURNEY_STAGES, stageOfTool } from "./stages";

export interface NextStepsEntry {
  /** One sentence connecting this tool to what follows. */
  lead: string;
  toolIds: readonly string[];
  guideSlugs: readonly string[];
}

export const NEXT_STEPS: Readonly<Record<string, NextStepsEntry>> = {
  "literature-explorer": {
    lead: "You found literature. Now organise it.",
    toolIds: ["literature-matrix", "reference-checker"],
    guideSlugs: ["how-to-write-a-literature-review"],
  },
  "literature-matrix": {
    lead: "Your studies are side by side. Now check how you found them and how you will cite them.",
    toolIds: ["prisma-flow-builder", "apa-citation-generator", "reference-checker"],
    guideSlugs: ["how-to-write-a-literature-review"],
  },
  "statistical-test-finder": {
    lead: "You have a test to consider. Now plan and check the analysis.",
    toolIds: ["power-analysis", "effect-size-calculator", "spss-research-lab"],
    guideSlugs: ["how-to-choose-a-statistical-test"],
  },
  "power-analysis": {
    lead: "You know the sample you need. Now plan the analysis itself.",
    toolIds: ["statistical-test-finder", "effect-size-calculator"],
    guideSlugs: ["power-analysis"],
  },
  "effect-size-calculator": {
    lead: "You have an effect size. Now show its uncertainty.",
    toolIds: ["confidence-interval-calculator", "power-analysis"],
    guideSlugs: ["how-to-report-statistics-in-apa"],
  },
  "confidence-interval-calculator": {
    lead: "You have an interval. Now report it with the effect.",
    toolIds: ["effect-size-calculator", "results-interpretation"],
    guideSlugs: ["confidence-intervals"],
  },
  "apa-citation-generator": {
    lead: "You have formatted references. Now check the whole list.",
    toolIds: ["reference-checker", "literature-matrix"],
    guideSlugs: ["apa-7-citations-and-references"],
  },
  "mla-citation-generator": {
    lead: "You have formatted entries. Now check the whole list.",
    toolIds: ["reference-checker", "literature-matrix"],
    guideSlugs: ["mla-9-citations-and-works-cited"],
  },
  "reference-checker": {
    lead: "Your list is checked. Now keep the sources organised.",
    toolIds: ["literature-matrix", "apa-citation-generator"],
    guideSlugs: ["how-to-manage-your-references"],
  },
  "readability-checker": {
    lead: "You have read your text's readability. Now look at its structure.",
    toolIds: ["sentence-counter", "paragraph-counter"],
    guideSlugs: ["readability-in-academic-writing", "how-to-structure-an-academic-essay"],
  },
  "sentence-counter": {
    lead: "You have counted the sentences. Now look at paragraphs and readability.",
    toolIds: ["paragraph-counter", "readability-checker"],
    guideSlugs: ["sentence-structure-and-counting"],
  },
  "paragraph-counter": {
    lead: "You have counted the paragraphs. Now look at sentences and readability.",
    toolIds: ["sentence-counter", "readability-checker"],
    guideSlugs: ["paragraph-structure-and-counting"],
  },
  "research-question-builder": {
    lead: "You have a question. Now state objectives and hypotheses, then search for what is known.",
    toolIds: ["research-objectives-generator", "hypothesis-builder", "literature-explorer"],
    guideSlugs: ["how-to-write-a-research-question"],
  },
};

/** Steps after a tool, or null when there are none to suggest. */
export function nextStepsFor(toolId: string): NextStepsEntry | null {
  const explicit = NEXT_STEPS[toolId];
  if (explicit) return explicit;
  const stage = stageOfTool(toolId);
  if (!stage) return null;
  const following = JOURNEY_STAGES[JOURNEY_STAGES.indexOf(stage) + 1];
  if (!following || following.toolIds.length === 0) return null;
  return {
    lead: `Next in the research journey: ${following.title.toLowerCase()}.`,
    toolIds: following.toolIds.slice(0, 3),
    guideSlugs: following.guideSlugs.slice(0, 1),
  };
}
