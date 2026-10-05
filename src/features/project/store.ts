"use client";

/**
 * Where the research journey is kept: this browser's local storage, beside the
 * workspace. Nothing is sent anywhere. The shared draft stays in the workspace; this
 * holds only what the journey adds (project type, notes, confirmations, sections).
 */

import { useMemo, useSyncExternalStore } from "react";
import { createProjectDraft, type ResearchProjectDraft } from "@/knowledge/research/research-project";
import { buildJourney, type Journey } from "@/knowledge/project/journey";
import { createProjectState, parseProjectState, setConfirmed, setNote, setSection, updateProfile, type ConfirmStageId, type NoteStageId, type ProjectProfile, type ProjectState, type ProjectType, type SectionState } from "@/knowledge/project/state";
import { useWorkspace } from "@/features/workspace/store";
import { workspaceActions } from "@/features/workspace/store";

export const PROJECT_STORAGE_KEY = "researchkit-project";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: ProjectState | null = null;

function read(): ProjectState | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  cached = null;
  if (raw !== null) {
    try {
      const parsed = parseProjectState(JSON.parse(raw));
      if (parsed.ok) cached = parsed.state;
    } catch {
      cached = null;
    }
  }
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === PROJECT_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(state: ProjectState | null): boolean {
  try {
    if (state === null) window.localStorage.removeItem(PROJECT_STORAGE_KEY);
    else window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return false;
  }
  for (const listener of listeners) listener();
  return true;
}

/** The research project in this browser; undefined while rendering on the server, null when there is none. */
export function useProjectState(): ProjectState | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

const apply = (change: (state: ProjectState) => ProjectState) => {
  const state = read();
  if (!state) return false;
  try {
    return write(change(state));
  } catch {
    return false;
  }
};

export const projectActions = {
  /** Starts a project of a type. The shared workspace is started too when there isn't one. */
  start(type: ProjectType, details: Partial<Omit<ProjectProfile, "type">> = {}): boolean {
    if (!workspaceActions.current()) workspaceActions.start(details.interest?.trim().slice(0, 120) || "My research project");
    return write(createProjectState(type, details));
  },
  setType: (type: ProjectType) => apply((state) => updateProfile(state, { type })),
  profile: (changes: Partial<ProjectProfile>) => apply((state) => updateProfile(state, changes)),
  note: (stage: NoteStageId, text: string) => apply((state) => setNote(state, stage, text)),
  confirm: (stage: ConfirmStageId, confirmed: boolean) => apply((state) => setConfirmed(state, stage, confirmed)),
  section: (id: string, changes: Partial<SectionState>) => apply((state) => setSection(state, id, changes)),
  remove: () => write(null),
};

export interface ProjectView {
  project: ProjectState;
  draft: ResearchProjectDraft;
  journey: Journey;
}

/** The project with its journey, or null/undefined as for `useProjectState`. */
export function useProjectView(): ProjectView | null | undefined {
  const project = useProjectState();
  const snapshot = useWorkspace();
  const workspace = snapshot?.status === "ready" ? snapshot.workspace : null;
  return useMemo(() => {
    if (project === undefined || snapshot === null) return undefined;
    if (project === null) return null;
    const draft = workspace?.draft ?? createProjectDraft();
    return { project, draft, journey: buildJourney(draft, project, workspace?.saved ?? {}) };
  }, [project, snapshot, workspace]);
}
