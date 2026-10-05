/**
 * The research journey: the stages a student moves through from interest to final
 * output, for a proposal, a paper or a thesis. Progress is measured from what the
 * student has actually produced (fields of the shared project draft, notes, confirmed
 * stages and section text), never from which pages they have opened.
 */

import type { ResearchProjectDraft } from "../research/research-project";
import type { ModuleId } from "../workspace/modules";
import { projectProgress, type StageStatus } from "../workspace/progress";
import { sectionsFor } from "./sections";
import { type JourneyStageId, type NoteStageId, type ProjectState, type ProjectType, type SectionStatus } from "./state";

export const READINESS_DIMENSIONS = ["foundation", "question", "evidence", "methodology", "writing"] as const;
export type ReadinessDimension = (typeof READINESS_DIMENSIONS)[number];

export const NODE_STATES = ["completed", "current", "available", "blocked", "optional", "not-applicable"] as const;
export type NodeState = (typeof NODE_STATES)[number];

export const NODE_STATE_LABELS: Readonly<Record<NodeState, string>> = {
  completed: "Completed",
  current: "You are here",
  available: "Available",
  blocked: "Not ready yet",
  optional: "Optional",
  "not-applicable": "Not applicable",
};

export interface Handoff {
  /** The tool's path; a stage with none is worked on in the journey itself. */
  href: string;
  label: string;
}

interface Assessment {
  state: "empty" | "partial" | "complete";
  artifact: string | null;
  review?: boolean;
}

interface Context {
  draft: ResearchProjectDraft;
  project: ProjectState;
  type: ProjectType;
  modules: Partial<Record<ModuleId, StageStatus>>;
}

interface StageDefinition {
  id: JourneyStageId;
  name: string;
  summary: string;
  /** What the stage asks for, by project type, where the wording differs. */
  summaryFor?: Partial<Record<ProjectType, string>>;
  group: ReadinessDimension;
  dependsOn: readonly JourneyStageId[];
  types: readonly ProjectType[];
  handoff?: Handoff;
  learn?: { slug: string; title: string };
  /** Why the stage is set aside, or null when it applies. */
  setAside?: (context: Context) => string | null;
  /** True for stages that are only worth doing in some projects. */
  optional?: (context: Context) => boolean;
  assess: (context: Context) => Assessment;
}

const ALL: readonly ProjectType[] = ["proposal", "paper", "thesis"];
const text = (value: string | undefined): Assessment => (value?.trim() ? { state: "complete", artifact: value.trim() } : { state: "empty", artifact: null });
const fromModule = (context: Context, id: ModuleId, artifact: string | null): Assessment => {
  const status = context.modules[id];
  if (status === "completed") return { state: "complete", artifact };
  if (status === "needs-review") return { state: "complete", artifact, review: true };
  if (status === "in-progress") return { state: "partial", artifact };
  return { state: artifact ? "partial" : "empty", artifact };
};
const note = (context: Context, stage: NoteStageId) => text(context.project.notes[stage]);
const qualitative = (context: Context) => context.draft.methodology === "qualitative";
const statistical = (context: Context) => (qualitative(context) ? "Qualitative research doesn't use this stage." : null);

const STAGES: readonly StageDefinition[] = [
  {
    id: "interest", name: "Interest", group: "foundation", dependsOn: [], types: ALL,
    summary: "Say what you are curious about. A rough interest is enough to start.",
    assess: ({ project, draft }) => text(project.profile.interest ?? draft.projectTitle ?? draft.researchArea ?? draft.topic),
  },
  {
    id: "topic", name: "Topic", group: "foundation", dependsOn: [], types: ALL,
    summary: "Narrow the interest to a specific subject within a field.",
    handoff: { href: "/tools/research-question-builder", label: "Research Question Builder" },
    assess: ({ draft }) => text(draft.topic),
  },
  {
    id: "keywords", name: "Keywords", group: "foundation", dependsOn: ["topic"], types: ALL,
    summary: "List the words and synonyms that describe your topic, to search with.",
    handoff: { href: "/tools/literature-explorer", label: "Literature Explorer" },
    learn: { slug: "how-to-search-academic-literature", title: "How to search academic literature" },
    assess: (context) => note(context, "keywords"),
  },
  {
    id: "literature", name: "Literature", group: "evidence", dependsOn: ["keywords"], types: ALL,
    summary: "Explore what researchers already know and record what you found.",
    handoff: { href: "/tools/literature-matrix", label: "Literature Matrix" },
    learn: { slug: "how-to-write-a-literature-review", title: "How to write a literature review" },
    assess: (context) => note(context, "literature"),
  },
  {
    id: "gap", name: "Research gap", group: "evidence", dependsOn: ["literature"], types: ALL,
    summary: "State what is not yet known or done, which your project addresses.",
    handoff: { href: "/workspace#stage-problem", label: "Project problem and gap" },
    assess: ({ draft }) => text(draft.researchGap),
  },
  {
    id: "problem", name: "Problem", group: "question", dependsOn: ["topic"], types: ALL,
    summary: "Describe the problem the research responds to.",
    handoff: { href: "/workspace#stage-problem", label: "Project problem and gap" },
    assess: ({ draft }) => text(draft.researchProblem),
  },
  {
    id: "questions", name: "Research questions", group: "question", dependsOn: ["problem"], types: ALL,
    summary: "Write the question your research will answer.",
    handoff: { href: "/tools/research-question-builder", label: "Research Question Builder" },
    learn: { slug: "how-to-write-a-research-question", title: "How to write a research question" },
    assess: ({ draft }) => text(draft.researchQuestion),
  },
  {
    id: "objectives", name: "Objectives", group: "question", dependsOn: ["questions"], types: ALL,
    summary: "Turn the aim into specific, achievable objectives.",
    handoff: { href: "/tools/research-objectives-generator", label: "Research Objectives Generator" },
    learn: { slug: "how-to-write-research-objectives", title: "How to write research objectives" },
    assess: (context) => fromModule(context, "objectives", context.draft.researchObjectives?.join("; ") || context.draft.researchAim || null),
  },
  {
    id: "hypothesis", name: "Hypothesis", group: "question", dependsOn: ["questions"], types: ALL,
    summary: "Where the study tests a relationship, state what you expect and why.",
    handoff: { href: "/tools/hypothesis-builder", label: "Hypothesis Builder" },
    setAside: (context) => statistical(context),
    optional: (context) => context.draft.methodology !== "quantitative" && context.draft.methodology !== "mixed-methods",
    assess: (context) => fromModule(context, "hypotheses", context.draft.hypotheses?.map((item) => item.text).filter(Boolean).join("; ") || null),
  },
  {
    id: "approach", name: "Research approach", group: "methodology", dependsOn: ["questions"], types: ALL,
    summary: "Choose quantitative, qualitative or mixed methods, and why.",
    handoff: { href: "/tools/research-onion", label: "Research Onion" },
    learn: { slug: "qualitative-or-quantitative-research", title: "Qualitative or quantitative research?" },
    assess: ({ draft }) => text(draft.methodology),
  },
  {
    id: "design", name: "Research design", group: "methodology", dependsOn: ["approach"], types: ALL,
    summary: "Choose the design that fits the question, such as a survey or an experiment.",
    handoff: { href: "/tools/research-design-builder", label: "Research Design Builder" },
    assess: (context) => fromModule(context, "design", context.draft.researchDesign ? "Design chosen" : null),
  },
  {
    id: "framework", name: "Conceptual framework", group: "methodology", dependsOn: ["literature"], types: ["thesis"],
    summary: "Show how the main concepts or variables relate, drawing on the literature.",
    handoff: { href: "/tools/conceptual-framework-builder", label: "Conceptual Framework Builder" },
    assess: (context) => fromModule(context, "framework", context.draft.conceptualFramework ? "Framework drawn" : null),
  },
  {
    id: "variables", name: "Variables", group: "methodology", dependsOn: ["questions"], types: ALL,
    summary: "Define each variable and how it is measured.",
    handoff: { href: "/tools/variables-builder", label: "Variables Builder" },
    setAside: (context) => statistical(context),
    assess: (context) => fromModule(context, "variables", context.draft.variables?.map((item) => item.name).join(", ") || null),
  },
  {
    id: "measurement", name: "Measurement", group: "methodology", dependsOn: ["variables"], types: ALL,
    summary: "Decide how each variable or concept will be measured or captured.",
    handoff: { href: "/tools/questionnaire-builder", label: "Questionnaire Builder" },
    setAside: (context) => statistical(context),
    assess: (context) => fromModule(context, "questionnaire", context.draft.questionnaire ? "Instrument drafted" : null),
  },
  {
    id: "data-collection", name: "Data collection", group: "methodology", dependsOn: ["design"], types: ALL,
    summary: "Describe how you will collect the data, and for a proposal, when and where.",
    summaryFor: { proposal: "Plan how you will collect the data. Nothing has been collected yet." },
    learn: { slug: "qualitative-or-quantitative-research", title: "Qualitative or quantitative research?" },
    assess: (context) => note(context, "data-collection"),
  },
  {
    id: "population", name: "Population", group: "methodology", dependsOn: ["questions"], types: ALL,
    summary: "Say who or what you will study, and where.",
    assess: ({ draft }) => text(draft.population),
  },
  {
    id: "sampling", name: "Sampling", group: "methodology", dependsOn: ["population"], types: ALL,
    summary: "Choose how participants or cases will be selected.",
    handoff: { href: "/tools/sampling-builder", label: "Sampling Builder" },
    assess: (context) => fromModule(context, "sampling", context.draft.samplingPlan ? "Sampling plan" : null),
  },
  {
    id: "sample-size", name: "Sample size", group: "methodology", dependsOn: ["sampling"], types: ALL,
    summary: "Work out how many participants you need.",
    handoff: { href: "/tools/power-analysis", label: "Power Analysis" },
    setAside: (context) => statistical(context),
    assess: (context) => fromModule(context, "sample-size", context.draft.sampleSizePlan ? "Sample size plan" : null),
  },
  {
    id: "analysis", name: "Analysis", group: "methodology", dependsOn: ["design"], types: ALL,
    summary: "Choose how the data will be analysed.",
    handoff: { href: "/tools/statistical-test-finder", label: "Statistical Test Finder" },
    learn: { slug: "how-to-choose-a-statistical-test", title: "How to choose a statistical test" },
    assess: (context) => fromModule(context, "analysis", context.draft.dataAnalysisPlan ? "Analysis plan" : null),
  },
  {
    id: "ethics", name: "Ethics", group: "methodology", dependsOn: ["design"], types: ALL,
    summary: "Note consent, confidentiality, risks and the approval your institution requires.",
    assess: (context) => note(context, "ethics"),
  },
  {
    id: "structure", name: "Document structure", group: "writing", dependsOn: [], types: ALL,
    summary: "Confirm the sections of your document, adjusted to your institution's requirements.",
    assess: ({ project }) => (project.confirmed.includes("structure") ? { state: "complete", artifact: "Outline confirmed" } : { state: "empty", artifact: null }),
  },
  {
    id: "writing", name: "Writing", group: "writing", dependsOn: ["structure"], types: ALL,
    summary: "Write each section. Mark it as you go.",
    handoff: { href: "/tools/readability-checker", label: "Readability Checker" },
    assess: ({ project, type }) => {
      const sections = sectionsFor(type).filter((section) => section.id !== "references");
      const states = sections.map((section) => project.sections[section.id]?.status ?? "not-started");
      const written = states.filter((status) => status === "draft-complete" || status === "complete").length;
      const started = states.some((status) => status !== "not-started");
      const artifact = `${written} of ${sections.length} sections drafted`;
      return written === sections.length ? { state: "complete", artifact } : started ? { state: "partial", artifact } : { state: "empty", artifact: null };
    },
  },
  {
    id: "references", name: "References", group: "evidence", dependsOn: [], types: ALL,
    summary: "Collect and check the sources you cite.",
    handoff: { href: "/tools/reference-checker", label: "Reference Checker" },
    learn: { slug: "how-to-manage-your-references", title: "How to manage your references" },
    assess: (context) => fromModule(context, "references", context.draft.references?.length ? `${context.draft.references.length} references` : null),
  },
  {
    id: "final-review", name: "Final review", group: "writing", dependsOn: ["writing", "references"], types: ALL,
    summary: "Read it through against your institution's requirements and confirm.",
    assess: ({ project }) => (project.confirmed.includes("final-review") ? { state: "complete", artifact: "Review confirmed" } : { state: "empty", artifact: null }),
  },
  {
    id: "final-output", name: "Final output", group: "writing", dependsOn: ["final-review"], types: ALL,
    summary: "Assemble the document from your own sections.",
    assess: ({ project, type }) => {
      const sections = sectionsFor(type);
      const complete = sections.every((section) => project.sections[section.id]?.status === "complete");
      return complete && project.confirmed.includes("final-review") ? { state: "complete", artifact: "Every section complete" } : { state: "empty", artifact: null };
    },
  },
];

export const STAGE_DEFINITIONS = STAGES;

export interface JourneyNode {
  id: JourneyStageId;
  name: string;
  summary: string;
  state: NodeState;
  group: ReadinessDimension;
  /** What the student has produced for this stage, or null when nothing yet. */
  artifact: string | null;
  partial: boolean;
  needsReview: boolean;
  /** Why the stage is blocked, optional or set aside. */
  reason: string | null;
  handoff: Handoff | null;
  learn: { slug: string; title: string } | null;
}

export interface Journey {
  type: ProjectType;
  nodes: readonly JourneyNode[];
  percent: number;
  completed: number;
  applicable: number;
  current: JourneyNode | null;
  next: JourneyNode | null;
}

export const STAGE_ORDER = STAGES.map((stage) => stage.id);

/** The journey for a project: every stage with its state, and the progress made. */
export function buildJourney(draft: ResearchProjectDraft, project: ProjectState, saved: Partial<Record<ModuleId, number>> = {}): Journey {
  const type = project.profile.type;
  const progress = projectProgress(draft, saved);
  const modules = Object.fromEntries(progress.stages.map((stage) => [stage.stage.id, stage.status])) as Partial<Record<ModuleId, StageStatus>>;
  const context: Context = { draft, project, type, modules };

  const assessed = STAGES.filter((stage) => stage.types.includes(type)).map((stage) => {
    const setAside = stage.setAside?.(context) ?? null;
    return { stage, setAside, assessment: stage.assess(context), optional: stage.optional?.(context) ?? false };
  });
  const doneIds = new Set(assessed.filter((item) => !item.setAside && item.assessment.state === "complete").map((item) => item.stage.id));
  const skipped = new Set(assessed.filter((item) => item.setAside).map((item) => item.stage.id));
  const nameOf = (id: JourneyStageId) => STAGES.find((stage) => stage.id === id)!.name;

  let current: JourneyStageId | null = null;
  const nodes = assessed.map(({ stage, setAside, assessment, optional }): JourneyNode => {
    const unmet = stage.dependsOn.filter((id) => !doneIds.has(id) && !skipped.has(id) && assessed.some((item) => item.stage.id === id));
    let state: NodeState;
    let reason: string | null = null;
    if (setAside) {
      state = "not-applicable";
      reason = setAside;
    } else if (assessment.state === "complete") {
      state = "completed";
    } else if (optional && assessment.state === "empty") {
      state = "optional";
      reason = "Worth doing if your study tests a relationship.";
    } else if (unmet.length > 0) {
      state = "blocked";
      reason = `Works best after ${unmet.map(nameOf).join(" and ")}.`;
    } else if (current === null) {
      current = stage.id;
      state = "current";
    } else {
      state = "available";
    }
    return {
      id: stage.id,
      name: stage.name,
      summary: stage.summaryFor?.[type] ?? stage.summary,
      state,
      group: stage.group,
      artifact: assessment.artifact,
      partial: assessment.state === "partial",
      needsReview: assessment.review ?? false,
      reason,
      handoff: stage.handoff ?? null,
      learn: stage.learn ?? null,
    };
  });

  // Not-applicable stages and optional stages left empty don't count towards progress.
  const counted = nodes.filter((node) => node.state !== "not-applicable" && node.state !== "optional");
  const completed = counted.filter((node) => node.state === "completed").length;
  const applicable = counted.length;
  const currentNode = nodes.find((node) => node.state === "current") ?? nodes.find((node) => node.state === "blocked") ?? null;
  const next = nodes.find((node) => node !== currentNode && (node.state === "available" || node.state === "blocked")) ?? null;
  return {
    type,
    nodes,
    percent: applicable === 0 ? 0 : Math.round((completed / applicable) * 100),
    completed,
    applicable,
    current: currentNode,
    next,
  };
}

export function sectionStatusOf(project: ProjectState, id: string): SectionStatus {
  return project.sections[id]?.status ?? "not-started";
}
