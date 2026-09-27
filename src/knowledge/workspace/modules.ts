/**
 * The stages of a research project, in the order most projects work through them.
 * Each stage owns some fields of the project draft: only the stage that owns a field
 * changes it, so tools can share one project without overwriting each other's work.
 */

import type { ProjectField, ResearchProjectDraft } from "../research/research-project";

export const MODULE_IDS = [
  "problem",
  "question",
  "objectives",
  "hypotheses",
  "variables",
  "framework",
  "onion",
  "design",
  "sampling",
  "sample-size",
  "questionnaire",
  "analysis",
  "assumptions",
  "interpretation",
  "references",
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export interface WorkspaceModule {
  id: ModuleId;
  /** The stage's name, such as “Research question”. */
  name: string;
  /** What the stage produces, in one sentence. */
  summary: string;
  /** The fields this stage writes. No other stage writes them. */
  owns: readonly ProjectField[];
  /** The tool that does this stage's work, by catalogue id, or null when it is edited in the workspace itself. */
  toolId: string | null;
  /** Stages whose later changes mean this one should be looked at again. */
  dependsOn: readonly ModuleId[];
  /** Stages whose work the tool reads, shown as “from your project” in place of retyping it. */
  reads: readonly ModuleId[];
  /** Whether the stage applies to this project. Statistical stages don't apply to qualitative research. */
  applies: (draft: ResearchProjectDraft) => boolean;
}

const always = () => true;
const notQualitative = (draft: ResearchProjectDraft) => draft.methodology !== "qualitative";

export const MODULES: readonly WorkspaceModule[] = [
  {
    id: "problem",
    name: "Research problem",
    summary: "The working title, the problem, what is already known, and the gap your project fills.",
    owns: ["projectTitle", "researchProblem", "background", "researchGap"],
    toolId: null,
    dependsOn: [],
    reads: [],
    applies: always,
  },
  {
    id: "question",
    name: "Research question",
    summary: "The topic, who and where you study, the variables you name, and the question itself.",
    owns: ["researchArea", "topic", "population", "location", "timeContext", "independentVariables", "dependentVariables", "researchQuestion"],
    toolId: "research-question-builder",
    dependsOn: ["problem"],
    reads: ["problem", "objectives", "onion"],
    applies: always,
  },
  {
    id: "objectives",
    name: "Objectives",
    summary: "The general objective and the specific objectives that answer the question.",
    owns: ["researchAim", "researchObjectives"],
    toolId: null,
    dependsOn: ["question"],
    reads: ["problem", "question"],
    applies: always,
  },
  {
    id: "hypotheses",
    name: "Hypotheses",
    summary: "Null and alternative hypotheses for each relationship you will test.",
    owns: ["hypotheses"],
    toolId: "hypothesis-builder",
    dependsOn: ["question"],
    reads: ["question"],
    applies: notQualitative,
  },
  {
    id: "variables",
    name: "Variables",
    summary: "Every variable with its conceptual and operational definitions, indicators and measurement level.",
    owns: ["variables", "independentVariables", "dependentVariables", "moderatorVariables", "mediatorVariables", "controlVariables"],
    toolId: "variables-builder",
    dependsOn: ["question", "hypotheses"],
    reads: ["question", "objectives", "hypotheses", "framework"],
    applies: always,
  },
  {
    id: "framework",
    name: "Conceptual framework",
    summary: "How your variables relate, drawn as a figure.",
    owns: ["conceptualFramework"],
    toolId: "conceptual-framework-builder",
    dependsOn: ["variables", "hypotheses"],
    reads: ["question", "variables", "hypotheses"],
    applies: always,
  },
  {
    id: "onion",
    name: "Research onion",
    summary: "Your philosophy, approach, methodological choice, strategy, time horizon and techniques.",
    owns: ["researchOnionSelection", "methodology"],
    toolId: "research-onion",
    dependsOn: [],
    reads: [],
    applies: always,
  },
  {
    id: "design",
    name: "Research design",
    summary: "The design you chose, the ones you considered, and why.",
    owns: ["researchDesign"],
    toolId: "research-design-builder",
    dependsOn: ["onion", "variables"],
    reads: ["question", "objectives", "variables", "hypotheses", "onion"],
    applies: always,
  },
  {
    id: "sampling",
    name: "Sampling",
    summary: "The population, the sampling technique and how participants will be selected.",
    owns: ["samplingPlan"],
    toolId: "sampling-builder",
    dependsOn: ["question", "design"],
    reads: ["question", "objectives", "variables", "onion", "design"],
    applies: always,
  },
  {
    id: "sample-size",
    name: "Sample size",
    summary: "How many participants you need, with the working shown.",
    owns: ["sampleSizePlan"],
    toolId: "sample-size-calculator",
    dependsOn: ["sampling"],
    reads: ["question", "variables", "design", "sampling"],
    applies: notQualitative,
  },
  {
    id: "questionnaire",
    name: "Questionnaire",
    summary: "Sections and questions, each linked to the variable and indicator it measures.",
    owns: ["questionnaire"],
    toolId: "questionnaire-builder",
    dependsOn: ["variables"],
    reads: ["question", "objectives", "variables", "hypotheses", "sampling"],
    applies: always,
  },
  {
    id: "analysis",
    name: "Data analysis plan",
    summary: "The analyses that answer each question and hypothesis.",
    owns: ["dataAnalysisPlan"],
    toolId: "data-analysis-recommender",
    dependsOn: ["variables", "hypotheses", "design", "sampling"],
    reads: ["question", "variables", "hypotheses", "design", "sampling"],
    applies: always,
  },
  {
    id: "assumptions",
    name: "Statistical assumptions",
    summary: "What to check before running each analysis in your plan.",
    owns: ["statisticalAssumptions"],
    toolId: "statistical-assumption-checker",
    dependsOn: ["analysis"],
    reads: ["variables", "hypotheses", "design", "sampling", "analysis"],
    applies: notQualitative,
  },
  {
    id: "interpretation",
    name: "Results interpretation",
    summary: "What your results mean for your hypotheses, question and objectives.",
    owns: ["interpretationNotes"],
    toolId: "results-interpretation",
    dependsOn: ["analysis", "hypotheses"],
    reads: ["question", "objectives", "variables", "hypotheses", "analysis"],
    applies: always,
  },
  {
    id: "references",
    name: "References",
    summary: "The sources you cite, kept together as you work.",
    owns: ["references"],
    toolId: null,
    dependsOn: [],
    reads: [],
    applies: always,
  },
];

export function getModule(id: ModuleId): WorkspaceModule {
  const stage = MODULES.find((candidate) => candidate.id === id);
  if (!stage) throw new RangeError(`Unknown workspace stage: ${id}`);
  return stage;
}

export const isModuleId = (value: string): value is ModuleId => (MODULE_IDS as readonly string[]).includes(value);

/** The stage a tool works on, or null for a tool outside the workspace, such as the Word Counter. */
export const moduleForTool = (toolId: string): WorkspaceModule | null => MODULES.find((stage) => stage.toolId === toolId) ?? null;

/** The stage that owns a field: the one place it is changed. */
export function ownerOf(field: ProjectField): WorkspaceModule | null {
  // The named variable lists are identified with the question and kept in step by the Variables Builder; the question stage identifies them first.
  return MODULES.find((stage) => stage.owns.includes(field)) ?? null;
}
