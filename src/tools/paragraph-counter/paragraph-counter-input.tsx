"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button, Callout, CopyButton, EmptyState, Icon, RadioGroup, TextField, VisuallyHidden } from "@/ui";
import { PARAGRAPH_BREAKS, analyseParagraphs, type ParagraphAnalysis, type ParagraphBreak } from "@/knowledge/text/paragraphs";
import { announcement, form, resultLines, results, resultsText } from "./copy";

/** How long typing must pause before results are announced to screen readers, as in the other text tools. */
const ANNOUNCE_AFTER_MS = 1000;

const breakOptions = PARAGRAPH_BREAKS.map((value) => ({ value, label: form.breaks[value] }));
const card = "grid min-w-0 content-start gap-1 rounded-panel border border-border bg-surface p-4";

/** Each paragraph's words, as a table; the bars repeat the numbers visually and are hidden from screen readers. */
function ParagraphTable({ analysis }: { analysis: ParagraphAnalysis }) {
  const most = analysis.longest?.words ?? 0;
  return (
    <details open className="rounded-panel border border-border">
      <summary className="cursor-pointer rounded-panel px-4 py-3 font-semibold focus-ring">{results.listSummary(analysis.count)}</summary>
      <div className="px-4 pb-4">
        <table className="w-full table-fixed border-collapse text-small">
          <caption className="sr-only">{results.listHeading}</caption>
          <thead>
            <tr className="border-b border-border text-start text-text-muted">
              <th scope="col" className="w-20 py-2 pe-2 text-start font-medium">
                {results.columns.paragraph}
              </th>
              <th scope="col" className="py-2 pe-2 text-start font-medium">
                {results.columns.opening}
              </th>
              <th scope="col" className="w-28 py-2 text-start font-medium sm:w-40">
                {results.columns.words}
              </th>
            </tr>
          </thead>
          <tbody>
            {analysis.paragraphs.map((paragraph) => {
              const note = paragraph === analysis.longest ? results.longestNote : paragraph === analysis.shortest && analysis.count > 1 ? results.shortestNote : null;
              return (
                <tr key={paragraph.position} className="border-b border-border align-top last:border-b-0">
                  <th scope="row" className="py-2 pe-2 text-start font-medium tabular-nums">
                    {paragraph.position}
                  </th>
                  <td className="py-2 pe-2 text-text-muted wrap-anywhere">{paragraph.opening}</td>
                  <td className="grid gap-1 py-2">
                    <span className="tabular-nums">
                      <span className="font-semibold">{paragraph.words}</span>
                      {note && <span className="text-text-muted"> · {note}</span>}
                    </span>
                    <span aria-hidden="true" className="block h-1.5 rounded-pill bg-action/70" style={{ width: `${most === 0 ? 0 : Math.max(4, (paragraph.words / most) * 100)}%` }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** The text box, the paragraph-break choice and the live results. Everything runs in the browser. */
export function ParagraphCounterInput() {
  const [text, setText] = useState("");
  const [breaks, setBreaks] = useState<ParagraphBreak>("blank-line");
  const [spoken, setSpoken] = useState("");
  const hasEdited = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deferredText = useDeferredValue(text);
  const analysis = useMemo(() => analyseParagraphs(deferredText, breaks), [deferredText, breaks]);
  const isEmpty = analysis.count === 0 && analysis.ignored === 0;

  useEffect(() => {
    if (!hasEdited.current) return;
    const timer = setTimeout(() => setSpoken(announcement(analysis)), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [analysis]);

  function clear() {
    hasEdited.current = false;
    setText("");
    setSpoken(results.cleared);
    textareaRef.current?.focus();
  }

  return (
    <div className="grid min-w-0 gap-8">
      <TextField
        ref={textareaRef}
        id="paragraph-text"
        multiline
        label={form.label}
        hint={form.hint}
        rows={12}
        value={text}
        placeholder={form.placeholder}
        onChange={(event) => {
          hasEdited.current = true;
          setText(event.target.value);
        }}
        spellCheck
      />

      <RadioGroup name="paragraph-breaks" variant="inline" legend={form.breaksLegend} hint={form.breaksHint} options={breakOptions} value={breaks} onChange={(value) => { hasEdited.current = true; setBreaks(value); }} />

      <section aria-labelledby="results-title" className="grid min-w-0 gap-4">
        <h2 id="results-title" className="text-heading font-semibold">
          {results.heading}
        </h2>
        {isEmpty ? (
          <EmptyState icon="file-text" title={results.empty.title} level={3}>
            {results.empty.description}
          </EmptyState>
        ) : (
          <>
            {analysis.lineBreaksWithoutBlankLines && (
              <Callout tone="info" title={results.lineBreaksTitle}>
                {results.lineBreaks}
              </Callout>
            )}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {resultLines(analysis).map(([label, value], index) => (
                <div key={label} className={index === 0 ? `${card} border-action/40` : card}>
                  <dt className="text-small text-text-muted">{label}</dt>
                  <dd className={index === 0 ? "text-heading font-semibold tabular-nums" : "text-subheading font-semibold tabular-nums"}>{value}</dd>
                </div>
              ))}
            </dl>
            {analysis.ignored > 0 && <p className="text-small text-text-muted">{results.ignored(analysis.ignored)}</p>}
            {analysis.count > 0 && <ParagraphTable analysis={analysis} />}
            <div className="flex flex-wrap gap-3">
              <CopyButton text={resultsText(analysis)} subject={results.copySubject} />
              <Button variant="outline" size="sm" onClick={clear}>
                <Icon name="trash" />
                {results.clear}
              </Button>
            </div>
          </>
        )}
      </section>

      <VisuallyHidden role="status">{spoken}</VisuallyHidden>
    </div>
  );
}
