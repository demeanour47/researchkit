/**
 * One vocabulary for research stages. The canonical ids are STAGE_IDS in ./state: the
 * stages of a research project. Three older systems group the work more coarsely (the
 * workspace's tool modules, the progress tracker's stages and Learn's guide phases).
 * They keep their own ids so routes, stored data and pages are unchanged, but each id
 * is mapped here to the canonical stages it covers, and tests keep the maps complete.
 */

import type { ModuleId } from "../workspace/modules";
import type { JourneyStageId } from "./state";

/** The canonical stage a workspace module (and so its tool) feeds. */
export const MODULE_STAGE: Readonly<Record<ModuleId, JourneyStageId>> = {
  problem: "problem",
  question: "questions",
  objectives: "objectives",
  title: "topic",
  hypotheses: "hypothesis",
  variables: "variables",
  framework: "framework",
  onion: "approach",
  design: "design",
  sampling: "sampling",
  "sample-size": "sample-size",
  questionnaire: "measurement",
  analysis: "analysis",
  assumptions: "analysis",
  interpretation: "analysis",
  references: "references",
};

/** The canonical stages covered by each progress-tracker stage (src/knowledge/journey). */
export const TRACKER_STAGE_COVERS: Readonly<Record<string, readonly JourneyStageId[]>> = {
  idea: ["interest", "topic"],
  question: ["problem", "questions", "objectives", "hypothesis"],
  keywords: ["keywords"],
  literature: ["literature", "gap"],
  design: ["approach", "design", "framework", "variables", "population", "sampling", "sample-size", "ethics"],
  data: ["measurement", "data-collection"],
  statistics: ["analysis"],
  writing: ["structure", "writing", "final-review", "final-output"],
  references: ["references"],
};

/** The canonical stages covered by each Learn guide phase (RESEARCH_STAGES in the catalogue). */
export const GUIDE_PHASE_COVERS: Readonly<Record<string, readonly JourneyStageId[]>> = {
  discover: ["interest", "topic"],
  plan: ["problem", "questions", "objectives", "hypothesis"],
  review: ["keywords", "literature", "gap"],
  design: ["approach", "design", "framework", "variables", "population", "sampling", "sample-size", "ethics", "measurement"],
  analyse: ["data-collection", "analysis"],
  write: ["structure", "writing"],
  cite: ["references"],
  report: ["final-output"],
  finalise: ["final-review"],
};
