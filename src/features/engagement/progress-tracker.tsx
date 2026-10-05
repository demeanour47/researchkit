"use client";

import { useEffect } from "react";
import type { ProgressKind } from "@/knowledge/journey/progress";
import { record } from "./progress-store";

/** Records that this page was opened in the session. Renders nothing. */
export function ProgressTracker({ kind, id }: { kind: ProgressKind; id: string }) {
  useEffect(() => record(kind, id), [kind, id]);
  return null;
}
