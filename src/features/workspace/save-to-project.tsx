"use client";

import { Button, Icon } from "@/ui";

export interface SaveToProjectProps {
  /** What saving keeps, such as “this analysis plan”. */
  subject: string;
  /** Whether what is shown is what the project already holds. */
  state: "unsaved" | "saved" | "changed";
  onSave: () => void;
}

const copy = {
  save: (subject: string) => `Save ${subject} to your project`,
  saved: (subject: string) => `Your project holds ${subject}.`,
  changed: (subject: string) => `Your project has changed since you saved ${subject}. Save again to keep this version.`,
  saveAgain: "Save again",
} as const;

/**
 * An explicit save, for tools whose results are worked out from the project: the
 * researcher decides when a result becomes part of it. The state is said in words,
 * with an icon, never by colour alone.
 */
export function SaveToProject({ subject, state, onSave }: SaveToProjectProps) {
  if (state === "saved")
    return (
      <p className="flex items-center gap-2 text-small">
        <Icon name="circle-check" className="text-success" />
        {copy.saved(subject)}
      </p>
    );
  return (
    <div className="grid gap-2 rounded-panel border border-border bg-sunken p-4">
      {state === "changed" && (
        <p className="flex items-start gap-2 text-small">
          <Icon name="alert" className="mt-[0.2em] text-warning" />
          {copy.changed(subject)}
        </p>
      )}
      <div>
        <Button variant="secondary" size="sm" onClick={onSave}>
          {state === "changed" ? copy.saveAgain : copy.save(subject)}
        </Button>
      </div>
    </div>
  );
}
