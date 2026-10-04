"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button, Callout, CopyButton, EmptyState, Icon, RadioGroup, TextField, VisuallyHidden } from "@/ui";
import { WordLengthTable } from "@/features/text-analysis";
import { PARAGRAPH_BREAKS, type ParagraphBreak } from "@/knowledge/text/paragraphs";
import { analyseSentences, sentenceOpening } from "@/knowledge/text/sentences";
import { OPEN_LIST_UP_TO, announcement, form, resultLines, results, resultsText, tableLabels } from "./copy";

/** How long typing must pause before results are announced to screen readers, as in the other text tools. */
const ANNOUNCE_AFTER_MS = 1000;

const breakOptions = PARAGRAPH_BREAKS.map((value) => ({ value, label: form.breaks[value] }));
const card = "grid min-w-0 content-start gap-1 rounded-panel border border-border bg-surface p-4";

/** The text box, the paragraph-break choice and the live results. Everything runs in the browser. */
export function SentenceCounterInput() {
  const [text, setText] = useState("");
  const [breaks, setBreaks] = useState<ParagraphBreak>("blank-line");
  const [spoken, setSpoken] = useState("");
  const hasEdited = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deferredText = useDeferredValue(text);
  const analysis = useMemo(() => analyseSentences(deferredText, breaks), [deferredText, breaks]);
  const items = useMemo(() => analysis.sentences.map((sentence) => ({ position: sentence.position, opening: sentenceOpening(sentence), words: sentence.words })), [analysis]);

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
        id="sentence-text"
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
        name="sentence-breaks"
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
          {results.heading}
        </h2>
        {analysis.count === 0 ? (
          <EmptyState icon="file-text" title={results.empty.title} level={3}>
            {results.empty.description}
          </EmptyState>
        ) : (
          <>
            {analysis.joinedUnpunctuatedLine && (
              <Callout tone="info" title={results.joinedTitle}>
                {results.joined}
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
            <WordLengthTable
              key={analysis.count > OPEN_LIST_UP_TO ? "folded" : "open"}
              items={items}
              shortest={analysis.shortest?.position ?? null}
              longest={analysis.longest?.position ?? null}
              labels={tableLabels(analysis.count)}
              open={analysis.count <= OPEN_LIST_UP_TO}
            />
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
