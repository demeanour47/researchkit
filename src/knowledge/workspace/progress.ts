/**
 * The progress engine: how far each stage has come, and the project as a whole.
 *
 * - Not started: nothing for the stage yet.
 * - In progress: begun, but something the stage needs is missing.
 * - Completed: everything the stage needs is there.
 * - Needs review: completed, but something it rests on changed after it was saved,
 *   or a project check found a problem in it.
 * Stages that don't apply to the project, such as hypotheses in qualitative research,
 * are shown as not needed and left out of the percentage.
 */

import { assumptionChecklist } from "../research/assumptions/checklist";
import { recommendAnalyses } from "../research/data-analysis";
import { LAYERS } from "../research/research-onion";
import type { ResearchProjectDraft } from "../research/research-project";
import { inputProblems } from "../research/sample-size-validator";
import { acceptance, checklistMethods, planMethods } from "./accepted";
import { MODULES, type ModuleId, type WorkspaceModule } from "./modules";
import { validateProject, type ProjectIssue } from "./validation";

export const STAGE_STATUSES = ["not-started", "in-progress", "completed", "needs-review", "not-needed"] as const;
export type StageStatus = (typeof STAGE_STATUSES)[number];

export const STAGE_STATUS_LABELS: Readonly<Record<StageStatus, string>> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
  "needs-review": "Needs review",
  "not-needed": "Not needed",
};

interface Assessment {
  state: "empty" | "partial" | "complete";
  /** What is still missing, when partial. */
  missing: string[];
}

const has = (value: unknown) => value !== undefined;
const assess = (filled: boolean[], missing: [boolean, string][]): Assessment => {
  const gaps = missing.filter(([ok]) => !ok).map(([, what]) => what);
  if (!filled.some(Boolean)) return { state: "empty", missing: gaps };
  return { state: gaps.length === 0 ? "complete" : "partial", missing: gaps };
};

/** The analysis ids the plan recommends now, sorted, to compare with what was accepted. */
export const currentAnalysisMethods = (draft: ResearchProjectDraft): string[] => planMethods(recommendAnalyses(draft));

/** The analyses whose assumptions the checklist covers now, sorted. */
export const currentAssumptionMethods = (draft: ResearchProjectDraft): string[] => checklistMethods(assumptionChecklist(draft));

function assessModule(id: ModuleId, draft: ResearchProjectDraft): Assessment {
  switch (id) {
    case "problem":
      return assess(
        [has(draft.projectTitle), has(draft.researchProblem), has(draft.background), has(draft.researchGap)],
        [
          [has(draft.projectTitle), "a working title"],
          [has(draft.researchProblem), "the research problem"],
          [has(draft.researchGap), "the research gap"],
        ],
      );
    case "question":
      return assess(
        [has(draft.researchQuestion), has(draft.topic), has(draft.researchArea), has(draft.population)],
        [[has(draft.researchQuestion), "the research question"]],
      );
    case "objectives":
      return assess(
        [has(draft.researchAim), has(draft.researchObjectives)],
        [
          [has(draft.researchAim), "a general objective"],
          [has(draft.researchObjectives), "at least one specific objective"],
        ],
      );
    case "hypotheses": {
      const alternatives = (draft.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative");
      return assess([has(draft.hypotheses)], [[alternatives.length > 0, "an alternative hypothesis"]]);
    }
    case "variables": {
      const variables = draft.variables ?? [];
      return assess(
        [variables.length > 0],
        [
          [variables.every((variable) => variable.conceptualDefinition), "a conceptual definition for every variable"],
          [variables.every((variable) => variable.operationalDefinition), "an operational definition for every variable"],
          [variables.every((variable) => variable.measurementLevel !== null), "a measurement level for every variable"],
        ],
      );
    }
    case "framework": {
      const framework = draft.conceptualFramework;
      return assess([has(framework)], [[(framework?.relationships.length ?? 0) > 0, "at least one relationship between variables"]]);
    }
    case "onion": {
      const selection = draft.researchOnionSelection ?? {};
      const missing = LAYERS.filter((layer) => !selection[layer.id]).map((layer) => layer.name.toLowerCase());
      return assess([has(draft.researchOnionSelection)], [[missing.length === 0, `a choice for ${missing.join(", ")}`]]);
    }
    case "design":
      return assess([has(draft.researchDesign)], [[Boolean(draft.researchDesign?.chosen), "a chosen design"]]);
    case "sampling": {
      const plan = draft.samplingPlan;
      return assess(
        [has(plan)],
        [
          [Boolean(plan?.chosen), "a chosen sampling technique"],
          [Boolean(plan?.population.targetPopulation), "the target population"],
        ],
      );
    }
    case "sample-size": {
      const plan = draft.sampleSizePlan;
      return assess([has(plan)], [[plan !== undefined && inputProblems(plan).length === 0, "assumptions the calculation can use"]]);
    }
    case "questionnaire":
      return assess([has(draft.questionnaire)], [[(draft.questionnaire?.questions.length ?? 0) > 0, "at least one question"]]);
    case "analysis":
      return assess([has(draft.dataAnalysisPlan)], [[(draft.dataAnalysisPlan?.methods.length ?? 0) > 0, "at least one accepted analysis"]]);
    case "assumptions":
      return assess([has(draft.statisticalAssumptions)], [[(draft.statisticalAssumptions?.methods.length ?? 0) > 0, "the assumptions of at least one analysis reviewed"]]);
    case "interpretation":
      return assess([has(draft.interpretationNotes)], []);
    case "references":
      return assess([has(draft.references)], []);
  }
}

export interface StageProgress {
  stage: WorkspaceModule;
  status: StageStatus;
  /** What the stage still needs, when in progress. */
  missing: string[];
  /** Why the stage needs review, when it does. */
  reviewReasons: string[];
  savedAt: number | null;
}

export interface ProjectProgress {
  stages: StageProgress[];
  /** Completed stages as a whole percentage of the stages that apply. */
  percent: number;
  completed: number;
  applicable: number;
  counts: Readonly<Record<StageStatus, number>>;
}

/**
 * Every stage's status, and the project's completion. `saved` holds when each stage last
 * changed the project; `issues` defaults to the project checks.
 */
export function projectProgress(draft: ResearchProjectDraft, saved: Partial<Record<ModuleId, number>> = {}, issues: readonly ProjectIssue[] = validateProject(draft)): ProjectProgress {
  const stages = MODULES.map((stage): StageProgress => {
    const savedAt = saved[stage.id] ?? null;
    const base = { stage, savedAt, missing: [] as string[], reviewReasons: [] as string[] };
    if (!stage.applies(draft)) return { ...base, status: "not-needed" };
    const assessment = assessModule(stage.id, draft);
    if (assessment.state === "empty") return { ...base, status: "not-started" };
    if (assessment.state === "partial") return { ...base, status: "in-progress", missing: assessment.missing };

    const reasons: string[] = [];
    if (savedAt !== null) {
      for (const dependency of stage.dependsOn) {
        const changed = saved[dependency];
        if (changed !== undefined && changed > savedAt) reasons.push(`${MODULES.find((candidate) => candidate.id === dependency)!.name} changed after this was saved.`);
      }
    }
    if (stage.id === "analysis" && acceptance(draft.dataAnalysisPlan, currentAnalysisMethods(draft)) === "changed") reasons.push("The project now leads to a different set of analyses than the one you accepted.");
    if (stage.id === "assumptions" && acceptance(draft.statisticalAssumptions, currentAssumptionMethods(draft)) === "changed") reasons.push("Your analysis plan now includes different analyses than the ones whose assumptions you reviewed.");
    for (const issue of issues) if (issue.stage === stage.id && issue.severity === "problem") reasons.push(issue.message);
    return { ...base, status: reasons.length > 0 ? "needs-review" : "completed", reviewReasons: reasons };
  });

  const counts = Object.fromEntries(STAGE_STATUSES.map((status) => [status, stages.filter((stage) => stage.status === status).length])) as Record<StageStatus, number>;
  const applicable = stages.length - counts["not-needed"];
  const completed = counts.completed;
  return { stages, percent: applicable === 0 ? 0 : Math.round((completed / applicable) * 100), completed, applicable, counts };
}

/** Where to pick up: the first stage that applies and isn't completed. Null when every stage is complete. */
export function nextStage(progress: ProjectProgress): StageProgress | null {
  return progress.stages.find((stage) => stage.status === "needs-review" || stage.status === "in-progress" || stage.status === "not-started") ?? null;
}
