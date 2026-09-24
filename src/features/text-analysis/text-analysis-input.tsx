"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { TextField, VisuallyHidden } from "@/ui";
import { analyseText } from "@/knowledge/text/text-statistics";
import { describeStats, formatStat, type StatField } from "./format";

/** How long typing must pause before results are announced to screen readers. */
const ANNOUNCE_AFTER_MS = 1000;

export interface TextAnalysisInputProps {
  label: string;
  hint: string;
  resultsHeading: string;
  /** The results to show, in order. */
  fields: readonly StatField[];
  /** Fixed values shown with the results, such as the assumptions behind them. */
  notes?: readonly { label: string; value: string }[];
  /** The results announced to screen readers once typing pauses. */
  announced: readonly StatField[];
}

/**
 * A text box with live results from analyseText(). Analysis runs in the browser
 * only: the text is never sent anywhere. Results are recalculated as a deferred
 * update, so typing stays responsive even for very long text.
 */
export function TextAnalysisInput({ label, hint, resultsHeading, fields, notes = [], announced }: TextAnalysisInputProps) {
  const [text, setText] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const hasEdited = useRef(false);
  const deferredText = useDeferredValue(text);
  const stats = useMemo(() => analyseText(deferredText), [deferredText]);

  useEffect(() => {
    if (!hasEdited.current) return;
    const timer = setTimeout(() => setAnnouncement(describeStats(stats, announced)), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [stats, announced]);

  const card = "grid content-start gap-1 rounded-panel border border-border bg-surface p-4";

  return (
    <div className="grid gap-8">
      <TextField
        multiline
        label={label}
        hint={hint}
        rows={12}
        value={text}
        onChange={(event) => {
          hasEdited.current = true;
          setText(event.target.value);
        }}
        spellCheck
      />

      <section aria-labelledby="results-title" className="grid gap-4">
        <h2 id="results-title" className="text-heading font-semibold">
          {resultsHeading}
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fields.map(({ key, label: fieldLabel }) => (
            <div key={key} className={card}>
              <dt className="text-small text-text-muted">{fieldLabel}</dt>
              <dd className="text-subheading font-semibold tabular-nums">{formatStat(stats, key)}</dd>
            </div>
          ))}
          {notes.map((note) => (
            <div key={note.label} className={card}>
              <dt className="text-small text-text-muted">{note.label}</dt>
              <dd className="font-medium">{note.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <VisuallyHidden role="status">{announcement}</VisuallyHidden>
    </div>
  );
}
