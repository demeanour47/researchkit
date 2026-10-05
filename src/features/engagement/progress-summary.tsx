"use client";

import { countOf, isEmpty } from "@/knowledge/journey/progress";
import { useProgress } from "./progress-store";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** What the visitor has opened this session. Nothing is stored beyond the tab, and nothing is sent. */
export function ProgressSummary() {
  const progress = useProgress();
  const empty = isEmpty(progress);
  return (
    <p className="text-small text-text-muted" aria-live="polite">
      {empty
        ? "Open a tool or a guide and your session progress will appear here."
        : `This session: ${plural(countOf(progress, "tools"), "tool", "tools")} opened, ${plural(countOf(progress, "guides"), "guide", "guides")} read, ${plural(countOf(progress, "challenges"), "challenge", "challenges")} answered.`}{" "}
      It stays in this tab and is cleared when you close it.
    </p>
  );
}
