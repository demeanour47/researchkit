"use client";

import { useState } from "react";
import { Badge, Button, ButtonLink, Link, TextField } from "@/ui";
import { NODE_STATE_LABELS, type JourneyNode } from "@/knowledge/project/journey";
import { isConfirmStage, isNoteStage, type ProjectState } from "@/knowledge/project/state";
import { projectActions } from "./store";

const TONE = { completed: "success", current: "accent", available: "info", blocked: "neutral", optional: "outline", "not-applicable": "outline" } as const;

const NOTE_LABELS = {
  keywords: "Your keywords and synonyms",
  literature: "What you found: key sources and what they say",
  "data-collection": "How and when you will collect the data",
  ethics: "Ethical considerations and approvals",
} as const;

/** Text kept on the page while typing and saved when the field loses focus. */
function NoteField({ label, value, onSave }: { label: string; value: string; onSave: (text: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <div className="space-y-2">
      <TextField label={label} multiline rows={4} value={text} onChange={(event) => setText(event.target.value)} onBlur={() => text !== value && onSave(text)} />
      <Button size="sm" variant="secondary" onClick={() => onSave(text)}>Save</Button>
    </div>
  );
}

/** What the student has produced for one stage, and how to work on it. */
export function NodePanel({ node, project }: { node: JourneyNode; project: ProjectState }) {
  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-heading font-semibold">{node.name}</h3>
        <Badge tone={TONE[node.state]}>{NODE_STATE_LABELS[node.state]}</Badge>
        {node.needsReview && <Badge tone="caution">Needs review</Badge>}
        {node.partial && <Badge tone="outline">Started</Badge>}
      </div>
      <p className="text-text-muted">{node.summary}</p>
      {node.reason && <p className="text-small text-text-muted">{node.reason}</p>}
      {node.artifact ? (
        <blockquote className="border-l-4 border-action bg-sunken p-3 text-small whitespace-pre-line wrap-anywhere">{node.artifact.length > 600 ? `${node.artifact.slice(0, 600)}…` : node.artifact}</blockquote>
      ) : (
        node.state !== "not-applicable" && <p className="text-small text-text-muted">Nothing recorded for this stage yet.</p>
      )}
      {isNoteStage(node.id) && <NoteField key={node.id} label={NOTE_LABELS[node.id]} value={project.notes[node.id] ?? ""} onSave={(text) => projectActions.note(node.id as never, text)} />}
      {isConfirmStage(node.id) && (
        <label className="flex items-start gap-2 text-small">
          <input type="checkbox" className="mt-1" checked={project.confirmed.includes(node.id)} onChange={(event) => projectActions.confirm(node.id as never, event.target.checked)} />
          <span>{node.id === "structure" ? "I have checked this document structure against my institution's requirements." : "I have read the whole document through and checked it against my institution's requirements."}</span>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {node.handoff && node.state !== "not-applicable" && <ButtonLink href={node.handoff.href} size="sm" trailingIcon="arrow-right">Open {node.handoff.label}</ButtonLink>}
        {node.learn && <Link href={`/learn/${node.learn.slug}`}>Learn: {node.learn.title}</Link>}
      </div>
    </div>
  );
}
