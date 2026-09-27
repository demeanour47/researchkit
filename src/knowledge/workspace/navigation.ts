/** Moving through the stages: what comes before and after each one. */

import { MODULES, getModule, type ModuleId, type WorkspaceModule } from "./modules";
import type { ResearchProjectDraft } from "../research/research-project";

export interface StagePosition {
  stage: WorkspaceModule;
  /** 1-based, among the stages that apply to the project. */
  number: number;
  total: number;
  previous: WorkspaceModule | null;
  next: WorkspaceModule | null;
}

/**
 * Where a stage sits among those that apply to the project. With no project, every
 * stage counts, so the order is the same on every page before anything is saved.
 * A stage that doesn't apply to this project still has neighbours, the nearest that do.
 */
export function stagePosition(id: ModuleId, draft: ResearchProjectDraft | null = null): StagePosition {
  const stage = getModule(id);
  const index = MODULES.findIndex((candidate) => candidate.id === id);
  const applies = (candidate: WorkspaceModule) => draft === null || candidate.applies(draft);
  const shown = MODULES.filter((candidate) => applies(candidate) || candidate.id === id);
  const previous = [...MODULES.slice(0, index)].reverse().find(applies) ?? null;
  const next = MODULES.slice(index + 1).find(applies) ?? null;
  return { stage, number: shown.findIndex((candidate) => candidate.id === id) + 1, total: shown.length, previous, next };
}
