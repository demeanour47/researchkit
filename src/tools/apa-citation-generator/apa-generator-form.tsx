"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, RadioGroup, SelectField, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import { MONTHS, plainText, type SourceType } from "@/knowledge/citation/apa";
import { duplicateReason, formatCitationRequest, type CitationMode, type LocatorKind, type SourceRecord } from "@/knowledge/citation/workflow";
import { announcements } from "./announcements";
import { AuthorFields, firstFieldId } from "./author-fields";
import { CitationOutput } from "./citation-output";
import { actions, form } from "./copy";
import { collection, locator } from "./copy";
import type { CopyTarget } from "./copy-texts";
import { blankDraft, emptyAuthor, exampleDraft, isEmptyDraft, toSource, type Draft } from "./draft";
import { TemporaryReferenceCollection } from "./temporary-reference-collection";

/** How long typing must pause before the reference is announced to screen readers. */
const ANNOUNCE_AFTER_MS = 1000;
/** The first field in the form, which receives focus after the form is cleared. */
const FIRST_FIELD_SELECTOR = 'input[name="source-type"]:checked';

const monthOptions = MONTHS.map((name, index) => ({ value: String(index + 1), label: name }));

/** The form and its live result. Everything runs in the browser; nothing is sent anywhere. */
export function ApaGeneratorForm() {
  const nextKey = useRef(2);
  const [draft, setDraft] = useState<Draft>(() => blankDraft(1));
  const [records, setRecords] = useState<SourceRecord[]>([]);
  const [mode, setMode] = useState<CitationMode>("paraphrase");
  const [locatorKind, setLocatorKind] = useState<LocatorKind>("page");
  const [locatorValue, setLocatorValue] = useState("");
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  /** Whether the latest change came from typing, so the updated reference should be announced. */
  const typed = useRef(false);
  const addButton = useRef<HTMLButtonElement>(null);
  /** An author just added, whose first field should receive focus once it has rendered. */
  const focusAuthorKey = useRef<number | null>(null);
  const focusFirstField = useRef(false);

  const record = useMemo<SourceRecord | null>(() => (isEmptyDraft(draft) ? null : { source: toSource(draft), provenance: "user-entered" }), [draft]);
  const formatted = useMemo(
    () => (record ? formatCitationRequest({ record, mode, locator: locatorValue.trim() ? { kind: locatorKind, value: locatorValue } : undefined }) : null),
    [record, mode, locatorKind, locatorValue],
  );
  const citation = formatted?.citation ?? null;
  const referenceText = citation ? plainText(citation.reference) : "";

  /** Announces a message, even if it repeats the last one, by clearing the region first. */
  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 50);
  };

  const update = (changes: Partial<Draft>) => {
    typed.current = true;
    setDraft((current) => ({ ...current, ...changes }));
  };

  useEffect(() => {
    if (!typed.current || !referenceText) return;
    const timer = setTimeout(() => setAnnouncement(announcements.referenceUpdated(referenceText)), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [referenceText]);

  useEffect(() => {
    if (focusFirstField.current) {
      document.querySelector<HTMLInputElement>(FIRST_FIELD_SELECTOR)?.focus();
      focusFirstField.current = false;
    }
    if (focusAuthorKey.current === null) return;
    const author = draft.authors.find((candidate) => candidate.key === focusAuthorKey.current);
    if (author) document.getElementById(firstFieldId(author))?.focus();
    focusAuthorKey.current = null;
  }, [draft]);

  const addAuthor = () => {
    const key = nextKey.current++;
    focusAuthorKey.current = key;
    update({ authors: [...draft.authors, emptyAuthor(key)] });
  };

  const removeAuthor = (key: number) => {
    update({ authors: draft.authors.filter((author) => author.key !== key) });
    addButton.current?.focus();
  };

  const clearForm = () => {
    typed.current = false;
    focusFirstField.current = true;
    setMode("paraphrase");
    setLocatorKind("page");
    setLocatorValue("");
    setDuplicate(null);
    setDraft(blankDraft(nextKey.current++));
    announce(announcements.formCleared);
  };

  const loadExample = () => {
    typed.current = false;
    const example = exampleDraft(nextKey.current);
    nextKey.current += example.authors.length;
    setDraft(example);
    announce(announcements.exampleLoaded);
  };

  const handleCopy = (target: CopyTarget, result: CopyResult) =>
    announce(result === "copied" ? announcements.copied(target) : announcements.copyFailed(target));

  const addToCollection = (allowDuplicate = false) => {
    if (!record || !formatted) return;
    if (formatted.issues.some((issue) => issue.severity === "error")) {
      announce(collection.blocked);
      return;
    }
    const reason = duplicateReason(record, records);
    setDuplicate(reason);
    if (reason && !allowDuplicate) {
      announce(collection.duplicate(reason));
      return;
    }
    setRecords((current) => [...current, record]);
    setDuplicate(null);
    announce(collection.added);
  };

  const field = (key: keyof Draft, label: string, hint?: string, extra: { inputMode?: "numeric" } = {}) => (
    <TextField
      id={`source-${key}`}
      label={label}
      hint={hint}
      value={draft[key] as string}
      onChange={(event) => update({ [key]: event.target.value })}
      autoComplete="off"
      {...extra}
    />
  );

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={loadExample}>
          {actions.loadExample}
        </Button>
        <Button variant="subtle" size="sm" onClick={clearForm}>
          {actions.clear}
        </Button>
      </div>

      <form className="grid gap-8" onSubmit={(event) => event.preventDefault()}>
        <RadioGroup
          name="source-type"
          legend={form.sourceType}
          options={(Object.entries(form.sourceTypes) as [SourceType, string][]).map(([value, label]) => ({ value, label }))}
          value={draft.type}
          onChange={(type) => update({ type })}
        />

        <fieldset className="grid gap-4" aria-describedby="authors-hint">
          <legend className="mb-1 text-subheading font-semibold">{form.authors}</legend>
          <p id="authors-hint" className="text-small text-text-muted">
            {form.authorsHint}
          </p>
          {draft.authors.map((author, index) => (
            <AuthorFields
              key={author.key}
              author={author}
              position={index + 1}
              canRemove={draft.authors.length > 1}
              onChange={(changed) => update({ authors: draft.authors.map((a) => (a.key === changed.key ? changed : a)) })}
              onRemove={() => removeAuthor(author.key)}
            />
          ))}
          <div>
            <Button ref={addButton} variant="secondary" size="sm" onClick={addAuthor}>
              {form.addAuthor}
            </Button>
          </div>
        </fieldset>

        <fieldset className="grid gap-4" aria-describedby="date-hint">
          <legend className="mb-1 text-subheading font-semibold">{form.date}</legend>
          <p id="date-hint" className="text-small text-text-muted">
            {form.dateHint}
          </p>
          <div className="grid items-start gap-3 sm:grid-cols-3">
            {field("year", form.year, undefined, { inputMode: "numeric" })}
            {draft.type === "webpage" && (
              <>
                <SelectField
                  id="source-month"
                  label={form.month}
                  emptyOption={form.noMonth}
                  options={monthOptions}
                  value={draft.month}
                  onChange={(event) => update({ month: event.target.value })}
                />
                {field("day", form.day, undefined, { inputMode: "numeric" })}
              </>
            )}
          </div>
        </fieldset>

        {field("title", form.title, form.titleHint)}

        {draft.type === "book" && (
          <>
            {field("edition", form.edition, form.editionHint)}
            {field("publisher", form.publisher)}
            {field("doi", form.doi, form.doiHint)}
            {field("url", form.url, form.urlHintOptional)}
          </>
        )}

        {draft.type === "journal-article" && (
          <>
            {field("journal", form.journal, form.journalHint)}
            <div className="grid items-start gap-3 sm:grid-cols-3">
              {field("volume", form.volume)}
              {field("issue", form.issue)}
              {field("pages", form.pages, form.pagesHint)}
            </div>
            {field("articleNumber", form.articleNumber, form.articleNumberHint)}
            {field("doi", form.doi, form.doiHint)}
            {field("url", form.url, form.urlHintOptional)}
          </>
        )}

        {draft.type === "webpage" && (
          <>
            {field("siteName", form.siteName, form.siteNameHint)}
            {field("url", form.url)}
          </>
        )}
      </form>

      {record && (
        <section aria-labelledby="locator-title" className="grid gap-4 border-t border-border pt-8">
          <h2 id="locator-title" className="text-heading font-semibold">{locator.mode}</h2>
          <RadioGroup
            name="citation-mode"
            legend={locator.mode}
            options={[{ value: "paraphrase", label: locator.paraphrase }, { value: "direct-quotation", label: locator.directQuotation }]}
            value={mode}
            onChange={(value) => setMode(value as CitationMode)}
          />
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <SelectField
              id="citation-locator-kind"
              label={locator.kind}
              emptyOption={locator.noLocator}
              options={[{ value: "page", label: locator.page }, { value: "page-range", label: locator.pageRange }, { value: "paragraph", label: locator.paragraph }, { value: "section", label: locator.section }]}
              value={locatorValue ? locatorKind : ""}
              onChange={(event) => {
                setLocatorKind(event.target.value as LocatorKind);
                if (!event.target.value) setLocatorValue("");
              }}
            />
            <TextField id="citation-locator-value" label={locator.value} hint={locator.valueHint} value={locatorValue} onChange={(event) => setLocatorValue(event.target.value)} />
          </div>
        </section>
      )}

      {formatted && (
        <section aria-labelledby="validation-title" className="grid gap-3 border-t border-border pt-8">
          <h2 id="validation-title" className="text-heading font-semibold">Validation and provenance</h2>
          <ul className="grid gap-2" aria-live="polite">
            {formatted.issues.map((issue, index) => <li key={`${issue.code}-${index}`} className="rounded-panel border border-border bg-sunken p-3"><span className="font-semibold">{issue.severity === "error" ? "Error" : issue.severity === "warning" ? "Warning" : "Information"}:</span> {issue.message}</li>)}
          </ul>
          {duplicate && <p className="rounded-panel border border-caution bg-sunken p-3" role="status">{collection.duplicate(duplicate)}</p>}
          <div><Button onClick={() => addToCollection(Boolean(duplicate))}>{duplicate ? collection.addDuplicate : actions.addToCollection}</Button></div>
        </section>
      )}

      <CitationOutput citation={citation} onCopy={handleCopy} />
      <TemporaryReferenceCollection records={records} onRemove={(removed) => { setRecords((current) => current.filter((item) => item !== removed)); announce(collection.removed); }} onClear={() => setRecords([])} />
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
