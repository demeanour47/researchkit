"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button, Callout, CopyButton, EmptyState, Icon, RadioGroup, TextField, VisuallyHidden } from "@/ui";
import { PARAGRAPH_BREAKS, type ParagraphBreak } from "@/knowledge/text/paragraphs";
import { MEASURES, analyseReadability } from "@/knowledge/text/readability";
import { announcement, characteristicLines, form, measureNote, measureValue, measures, results, resultsText } from "./copy";

/** How long typing must pause before results are announced to screen readers, as in the other text tools. */
const ANNOUNCE_AFTER_MS = 1000;

const breakOptions = PARAGRAPH_BREAKS.map((value) => ({ value, label: form.breaks[value] }));
const card = "grid min-w-0 content-start gap-1 rounded-panel border border-border bg-surface p-4";

/** The text box, the paragraph-break choice, the measures and the counts behind them. Everything runs in the browser. */
export function ReadabilityCheckerInput() {
  const [text, setText] = useState("");
  const [breaks, setBreaks] = useState<ParagraphBreak>("blank-line");
  const [spoken, setSpoken] = useState("");
  const hasEdited = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deferredText = useDeferredValue(text);
  const analysis = useMemo(() => analyseReadability(deferredText, breaks), [deferredText, breaks]);

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
        id="readability-text"
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

      <RadioGroup
        name="readability-breaks"
        variant="inline"
        legend={form.breaksLegend}
        hint={form.breaksHint}
        options={breakOptions}
        value={breaks}
        onChange={(value) => {
          hasEdited.current = true;
          setBreaks(value);
        }}
      />

      <section aria-labelledby="results-title" className="grid min-w-0 gap-4">
        <h2 id="results-title" className="text-heading font-semibold">
          {results.overviewHeading}
        </h2>
        {analysis.words === 0 ? (
          <EmptyState icon="file-text" title={results.empty.title} level={3}>
            {results.empty.description}
          </EmptyState>
        ) : (
          <>
            {analysis.shortText && (
              <Callout tone="caution" title={results.shortTitle}>
                {results.short(analysis.words)}
              </Callout>
            )}
            {analysis.joinedUnpunctuatedLine && (
              <Callout tone="info" title={results.joinedTitle}>
                {results.joined}
              </Callout>
            )}
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MEASURES.map((id) => {
                const measure = analysis.measures[id];
                const note = measureNote(measure, analysis);
                return (
                  <div key={id} className={card}>
                    <dt className="font-semibold">{measures[id].name}</dt>
                    <dd className="grid gap-1">
                      <span className="text-heading font-semibold tabular-nums">{measureValue(measure)}</span>
                      <span className="text-small text-text-muted">{measures[id].scale}</span>
                      {note && <span className="text-small font-medium">{note}</span>}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <section aria-labelledby="characteristics-title" className="grid min-w-0 gap-3">
              <h3 id="characteristics-title" className="text-subheading font-semibold">
                {results.characteristicsHeading}
              </h3>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {characteristicLines(analysis).map(([label, value]) => (
                  <div key={label} className={card}>
                    <dt className="text-small text-text-muted">{label}</dt>
                    <dd className="font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              {analysis.longestSentence && analysis.sentences > 1 && <p className="text-small text-text-muted">{results.longestNote(analysis.longestSentence.words, analysis.longestSentence.position)}</p>}
            </section>

            <details className="rounded-panel border border-border">
              <summary className="cursor-pointer rounded-panel px-4 py-3 font-semibold focus-ring">{results.detailsSummary}</summary>
              <div className="grid gap-5 px-4 pb-4">
                {MEASURES.map((id) => (
                  <section key={id} aria-labelledby={`formula-${id}`} className="grid min-w-0 gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
                    <h3 id={`formula-${id}`} className="font-semibold">
                      {measures[id].name}
                    </h3>
                    <dl className="grid gap-2 text-small">
                      {(
                        [
                          [results.formula, measures[id].formula],
                          [results.variables, measures[id].variables],
                          [results.interpretation, measures[id].interpretation],
                          [results.limitation, measures[id].limitation],
                          [results.source, measures[id].source],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="grid gap-0.5 sm:grid-cols-[8rem_1fr] sm:gap-3">
                          <dt className="font-medium text-text-muted">{label}</dt>
                          <dd className={label === results.formula ? "font-mono wrap-anywhere" : "wrap-anywhere"}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            </details>

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
