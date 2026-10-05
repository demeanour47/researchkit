"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_PROGRESS, parseProgress, recordProgress, type Progress, type ProgressKind } from "@/knowledge/journey/progress";

const KEY = "researchkit:session-progress";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Progress } = { raw: null, value: EMPTY_PROGRESS };

function read(): Progress {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(KEY);
  } catch {
    return EMPTY_PROGRESS;
  }
  if (raw !== cache.raw) cache = { raw, value: parseProgress(raw) };
  return cache.value;
}

/** Notes that a tool, guide or challenge was opened or answered. Session storage only; failures are ignored. */
export function record(kind: ProgressKind, id: string): void {
  const current = read();
  const next = recordProgress(current, kind, id);
  if (next === current) return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** The session's progress; empty on the server and before hydration. */
export const useProgress = (): Progress => useSyncExternalStore(subscribe, read, () => EMPTY_PROGRESS);
