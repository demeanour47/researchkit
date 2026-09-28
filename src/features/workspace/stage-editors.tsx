"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Card, Icon, IconTile, TextField } from "@/ui";
import { parseList, type ProjectField, type ResearchProjectChanges, type ResearchProjectDraft } from "@/knowledge/research/research-project";
import { getModule, type ModuleId } from "@/knowledge/workspace/modules";
import type { StageProgress } from "@/knowledge/workspace/progress";
import { dashboardCopy } from "./copy";
import { stageAnchor } from "./stage-links";
import { workspaceActions } from "./store";
import { StatusBadge } from "./stage-timeline";

const copy = dashboardCopy.editors;
/** How long typing must pause before it is saved. Leaving a field saves at once. */
const SAVE_AFTER_MS = 600;

type EditorField = Extract<ProjectField, keyof typeof copy>;

interface FieldSpec {
  field: EditorField;
  kind: "line" | "text" | "list";
}

const EDITED_STAGES: { id: ModuleId; icon: "research" | "target" | "library"; fields: FieldSpec[] }[] = [
  {
    id: "problem",
    icon: "research",
    fields: [
      { field: "researchProblem", kind: "text" },
      { field: "background", kind: "text" },
      { field: "researchGap", kind: "text" },
    ],
  },
  {
    id: "objectives",
    icon: "target",
    fields: [
      { field: "researchAim", kind: "text" },
      { field: "researchObjectives", kind: "list" },
    ],
  },
  { id: "references", icon: "library", fields: [{ field: "references", kind: "list" }] },
];

const asText = (value: unknown) => (Array.isArray(value) ? value.join("\n") : typeof value === "string" ? value : "");
const hintOf = (field: EditorField) => (copy as Record<string, string>)[`${field}Hint`];

/**
 * One stage edited on the workspace page. What is typed is kept here while typing, so
 * spaces and blank lines aren't tidied away mid-word, and saved after a pause or when
 * the field is left.
 */
function StageEditor({ id, icon, fields, draft, progress }: { id: ModuleId; icon: "research" | "target" | "library"; fields: FieldSpec[]; draft: ResearchProjectDraft; progress: StageProgress | undefined }) {
  const stage = getModule(id);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(({ field }) => [field, asText(draft[field])])));
  const pending = useRef(false);

  const commit = () => {
    if (!pending.current) return;
    pending.current = false;
    const changes = Object.fromEntries(fields.map(({ field, kind }) => [field, kind === "list" ? parseList(values[field]) : values[field]])) as ResearchProjectChanges;
    workspaceActions.edit(id, changes);
  };

  useEffect(() => {
    const timer = setTimeout(commit, SAVE_AFTER_MS);
    return () => clearTimeout(timer);
  });

  const titleId = `${stageAnchor(id)}-title`;
  return (
    <Card as="section" id={stageAnchor(id)} aria-labelledby={titleId} padding="lg" className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={titleId} className="flex items-center gap-3 text-subheading font-semibold">
          <IconTile icon={icon} size="sm" />
          {stage.name}
        </h3>
        {progress && <StatusBadge status={progress.status} />}
      </div>
      <p className="text-small text-text-muted">{stage.summary}</p>
      <div className="grid gap-5" onBlur={commit}>
        {fields.map(({ field, kind }) => (
          <TextField
            key={field}
            id={`workspace-${field}`}
            label={copy[field]}
            hint={hintOf(field)}
            multiline={kind !== "line"}
            rows={kind === "list" ? 4 : 3}
            value={values[field]}
            onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              pending.current = true;
              setValues((current) => ({ ...current, [field]: event.target.value }));
            }}
          />
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-caption text-text-muted">
        <Icon name="check" />
        {copy.saved}
      </p>
    </Card>
  );
}

/** The stages that have no tool of their own: the problem, the objectives and the references. */
export function StageEditors({ draft, progress }: { draft: ResearchProjectDraft; progress: readonly StageProgress[] }) {
  return (
    <div className="grid gap-6">
      {EDITED_STAGES.map((stage) => (
        <StageEditor key={stage.id} {...stage} draft={draft} progress={progress.find((entry) => entry.stage.id === stage.id)} />
      ))}
    </div>
  );
}
