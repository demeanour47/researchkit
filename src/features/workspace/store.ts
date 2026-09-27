"use client";

/**
 * Where the workspace is kept: this browser's local storage, and nowhere else. Nothing
 * is sent to a server. Reads go through `useSyncExternalStore`, so every part of the
 * page sees the same project, and other tabs catch up through storage events.
 */

import { useSyncExternalStore } from "react";
// Imported by file, not through the knowledge barrels, so tools don't load the analysis engine just to save.
import type { ModuleId } from "@/knowledge/workspace/modules";
import { createWorkspace, editModule, parseWorkspace, saveModule, serializeWorkspace, type Workspace } from "@/knowledge/workspace/workspace";
import type { ResearchProjectChanges, ResearchProjectDraft } from "@/knowledge/research/research-project";

export const WORKSPACE_STORAGE_KEY = "researchkit-workspace";

export type WorkspaceSnapshot =
  | { status: "none" }
  | { status: "ready"; workspace: Workspace }
  /** Something is stored but can't be read; it is kept until the researcher deletes it. */
  | { status: "unreadable"; reason: string }
  /** The browser refuses storage, such as in some private windows. */
  | { status: "unavailable" };

const NONE: WorkspaceSnapshot = { status: "none" };
const UNAVAILABLE: WorkspaceSnapshot = { status: "unavailable" };
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: WorkspaceSnapshot = NONE;

function read(): WorkspaceSnapshot {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
  } catch {
    return UNAVAILABLE;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  if (raw === null) cached = NONE;
  else {
    try {
      const parsed = parseWorkspace(JSON.parse(raw));
      cached = parsed.ok ? { status: "ready", workspace: parsed.workspace } : { status: "unreadable", reason: parsed.reason };
    } catch {
      cached = { status: "unreadable", reason: "The saved project isn't valid JSON." };
    }
  }
  return cached;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === WORKSPACE_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Writes the workspace, or removes it for null. False when the browser refused. */
function write(workspace: Workspace | null): boolean {
  try {
    if (workspace === null) window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    else window.localStorage.setItem(WORKSPACE_STORAGE_KEY, serializeWorkspace(workspace));
  } catch {
    return false;
  }
  emit();
  return true;
}

/** The workspace as this browser holds it; null while rendering on the server, which can't know. */
export function useWorkspace(): WorkspaceSnapshot | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

function current(): Workspace | null {
  const snapshot = read();
  return snapshot.status === "ready" ? snapshot.workspace : null;
}

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

export const workspaceActions = {
  start(title: string): boolean {
    return write(createWorkspace(newId(), Date.now(), title));
  },
  /** Saves a stage's fields from a tool's draft. Values the project model rejects are not saved. Returns whether anything changed. */
  save(id: ModuleId, source: ResearchProjectDraft): boolean {
    const workspace = current();
    if (!workspace) return false;
    let next: Workspace;
    try {
      next = saveModule(workspace, id, source, Date.now());
    } catch {
      return false;
    }
    return next !== workspace && write(next);
  },
  edit(id: ModuleId, changes: ResearchProjectChanges): boolean {
    const workspace = current();
    if (!workspace) return false;
    const next = editModule(workspace, id, changes, Date.now());
    return next !== workspace && write(next);
  },
  /** Puts back a workspace as it was, such as before this visit's changes. */
  restore(workspace: Workspace): boolean {
    return write(workspace);
  },
  remove(): boolean {
    return write(null);
  },
  /** Replaces the project with one read from a file. */
  import(text: string): { ok: true } | { ok: false; reason: string } {
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      return { ok: false, reason: "The file isn't a ResearchKit workspace." };
    }
    const parsed = parseWorkspace(value);
    if (!parsed.ok) return parsed;
    return write(parsed.workspace) ? { ok: true } : { ok: false, reason: "Your browser didn't allow the project to be saved." };
  },
  current,
};
