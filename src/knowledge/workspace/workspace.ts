/**
 * The research workspace: one project draft, when each stage was last saved, and the
 * rules for changing it. Pure data: where it is kept is the interface's concern. Times
 * are milliseconds since 1970, passed in, so every function gives the same answer for
 * the same input.
 */

import { createProjectDraft, type ResearchProjectChanges, type ResearchProjectDraft } from "../research/research-project";
import { changedFields, commitModule } from "./commit";
import { MODULES, getModule, isModuleId, type ModuleId, type WorkspaceModule } from "./modules";

export const WORKSPACE_VERSION = 1;
/** Marks an exported file as a ResearchKit workspace. */
export const WORKSPACE_FORMAT = "researchkit-workspace";

export interface Workspace {
  version: typeof WORKSPACE_VERSION;
  id: string;
  createdAt: number;
  updatedAt: number;
  draft: ResearchProjectDraft;
  /** When each stage last changed the project. A stage never saved has no entry. */
  saved: Partial<Record<ModuleId, number>>;
}

export function createWorkspace(id: string, now: number, title = ""): Workspace {
  const draft = createProjectDraft({ projectTitle: title });
  return { version: WORKSPACE_VERSION, id, createdAt: now, updatedAt: now, draft, saved: title.trim() ? { problem: now } : {} };
}

/**
 * Saves a stage's work from a draft a tool has worked on. Only the stage's own fields
 * are taken. When none of them changed, the same workspace is returned, so opening a
 * tool never marks its stage as edited.
 */
export function saveModule(workspace: Workspace, id: ModuleId, source: ResearchProjectDraft, now: number): Workspace {
  const draft = commitModule(workspace.draft, id, source);
  if (changedFields(workspace.draft, draft, [...new Set([...getModule(id).owns, "methodology" as const])]).length === 0) return workspace;
  return { ...workspace, draft, updatedAt: now, saved: { ...workspace.saved, [id]: now } };
}

/**
 * Changes fields of a stage edited in the workspace itself, such as the objectives.
 * Changes to fields the stage doesn't own are refused, so each field has one editor.
 */
export function editModule(workspace: Workspace, id: ModuleId, changes: ResearchProjectChanges, now: number): Workspace {
  const stage = getModule(id);
  const foreign = Object.keys(changes).filter((field) => !stage.owns.includes(field as never));
  if (foreign.length > 0) throw new RangeError(`${stage.name} doesn't own ${foreign.join(", ")}.`);
  return saveModule(workspace, id, { ...workspace.draft, ...changes } as ResearchProjectDraft, now);
}

/** The stages saved most recently, newest first. */
export function recentModules(workspace: Workspace, limit = 5): { stage: WorkspaceModule; savedAt: number }[] {
  return MODULES.flatMap((stage) => (workspace.saved[stage.id] !== undefined ? [{ stage, savedAt: workspace.saved[stage.id]! }] : []))
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, limit);
}

export type ParseResult = { ok: true; workspace: Workspace } | { ok: false; reason: string };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isTime = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

/**
 * Reads a workspace from untrusted data, such as browser storage or an imported file.
 * The project is cleaned by the same rules as every other change; anything unknown or
 * malformed is refused with a reason rather than half-read.
 */
export function parseWorkspace(value: unknown): ParseResult {
  if (!isRecord(value)) return { ok: false, reason: "The file isn't a ResearchKit workspace." };
  const notWorkspace = { ok: false as const, reason: "The file isn't a ResearchKit workspace." };
  if ("format" in value ? value.format !== WORKSPACE_FORMAT : !("version" in value)) return notWorkspace;
  if (value.version !== WORKSPACE_VERSION) return { ok: false, reason: "The workspace was saved by a version of ResearchKit this one can't read." };
  if (typeof value.id !== "string" || !value.id) return { ok: false, reason: "The workspace has no project id." };
  if (!isTime(value.createdAt) || !isTime(value.updatedAt)) return { ok: false, reason: "The workspace's dates can't be read." };
  if (!isRecord(value.draft)) return { ok: false, reason: "The workspace has no project." };
  if (!isRecord(value.saved)) return { ok: false, reason: "The workspace's stage history can't be read." };
  const saved: Partial<Record<ModuleId, number>> = {};
  for (const [id, time] of Object.entries(value.saved)) {
    if (!isModuleId(id) || !isTime(time)) return { ok: false, reason: "The workspace's stage history can't be read." };
    saved[id] = time;
  }
  const shapeProblem = draftShapeProblem(value.draft);
  if (shapeProblem) return { ok: false, reason: `The project can't be read: ${shapeProblem}` };
  let draft: ResearchProjectDraft;
  try {
    draft = createProjectDraft(value.draft as ResearchProjectDraft);
  } catch (error) {
    return { ok: false, reason: `The project can't be read: ${error instanceof Error ? error.message : "it holds values ResearchKit doesn't recognise"}.` };
  }
  return { ok: true, workspace: { version: WORKSPACE_VERSION, id: value.id, createdAt: value.createdAt, updatedAt: value.updatedAt, draft, saved } };
}

const TEXT_FIELDS = ["projectTitle", "researchProblem", "background", "researchGap", "researchArea", "topic", "researchAim", "researchQuestion", "population", "location", "timeContext", "methodology", "notes"];
const LIST_FIELDS = ["references", "researchObjectives", "independentVariables", "dependentVariables", "moderatorVariables", "mediatorVariables", "controlVariables", "interpretationNotes"];
const LIST_OF_RECORDS = ["variables", "hypotheses"];
const RECORDS = ["conceptualFramework", "researchDesign", "samplingPlan", "sampleSizePlan", "questionnaire", "researchOnionSelection", "dataAnalysisPlan", "statisticalAssumptions"];

/** The first field whose kind of value is wrong, described; null when every field has the right kind. Details are checked by the model's own cleaning. */
function draftShapeProblem(draft: Record<string, unknown>): string | null {
  for (const field of TEXT_FIELDS) if (field in draft && typeof draft[field] !== "string") return `${field} should be text.`;
  for (const field of LIST_FIELDS) if (field in draft && !(Array.isArray(draft[field]) && (draft[field] as unknown[]).every((item) => typeof item === "string"))) return `${field} should be a list of text.`;
  for (const field of LIST_OF_RECORDS) if (field in draft && !(Array.isArray(draft[field]) && (draft[field] as unknown[]).every(isRecord))) return `${field} should be a list.`;
  for (const field of RECORDS) if (field in draft && !isRecord(draft[field])) return `${field} should be a record.`;
  return null;
}

/** The workspace as a file: readable JSON, marked with its format so it can be recognised when imported. */
export function serializeWorkspace(workspace: Workspace): string {
  return JSON.stringify({ format: WORKSPACE_FORMAT, ...workspace }, null, 2);
}
