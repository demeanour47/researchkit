/** Where each stage's work is done: its tool, or its section of the workspace page. */

import type { ModuleId } from "@/knowledge/workspace";
import { TOOL_PATH as CONCEPTUAL_FRAMEWORK } from "@/tools/conceptual-framework-builder/path";
import { TOOL_PATH as DATA_ANALYSIS } from "@/tools/data-analysis-recommender/path";
import { TOOL_PATH as HYPOTHESES } from "@/tools/hypothesis-builder/path";
import { TOOL_PATH as QUESTIONNAIRE } from "@/tools/questionnaire-builder/path";
import { TOOL_PATH as DESIGN } from "@/tools/research-design-builder/path";
import { TOOL_PATH as OBJECTIVES } from "@/tools/research-objectives-generator/path";
import { TOOL_PATH as ONION } from "@/tools/research-onion/path";
import { TOOL_PATH as QUESTION } from "@/tools/research-question-builder/path";
import { TOOL_PATH as TITLE } from "@/tools/research-title-builder/path";
import { TOOL_PATH as INTERPRETATION } from "@/tools/results-interpretation/path";
import { TOOL_PATH as SAMPLE_SIZE } from "@/tools/sample-size-calculator/path";
import { TOOL_PATH as SAMPLING } from "@/tools/sampling-builder/path";
import { TOOL_PATH as ASSUMPTIONS } from "@/tools/statistical-assumption-checker/path";
import { TOOL_PATH as VARIABLES } from "@/tools/variables-builder/path";

/** The workspace page's address. */
export const WORKSPACE_PATH = "/workspace";

/** The anchor of a stage edited on the workspace page. */
export const stageAnchor = (id: ModuleId) => `stage-${id}`;

export const STAGE_LINKS: Readonly<Record<ModuleId, string>> = {
  problem: `${WORKSPACE_PATH}#${stageAnchor("problem")}`,
  question: QUESTION,
  objectives: OBJECTIVES,
  title: TITLE,
  hypotheses: HYPOTHESES,
  variables: VARIABLES,
  framework: CONCEPTUAL_FRAMEWORK,
  onion: ONION,
  design: DESIGN,
  sampling: SAMPLING,
  "sample-size": SAMPLE_SIZE,
  questionnaire: QUESTIONNAIRE,
  analysis: DATA_ANALYSIS,
  assumptions: ASSUMPTIONS,
  interpretation: INTERPRETATION,
  references: `${WORKSPACE_PATH}#${stageAnchor("references")}`,
};
