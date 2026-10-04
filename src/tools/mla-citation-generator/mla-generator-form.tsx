"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, RadioGroup, SelectField, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import { AuthorFields, emptyAuthor, firstFieldId } from "@/features/citation";
import { formatMla, issuesFor, provenanceIssue } from "@/knowledge/citation/mla";
import { MONTHS, SOURCE_TYPES, plainText, type CitationLocator, type SourceRecord } from "@/knowledge/citation/source";
import { actions, announcements, authorLabels, form, locator as locatorCopy, type CopyTarget } from "./copy";
import { blankDraft, exampleDraft, isEmptyDraft, toSource, withSourceType, type Draft } from "./draft";
import { MlaOutput } from "./mla-output";

/** How long typing must pause before the entry is announced to screen readers. */
const ANNOUNCE_AFTER_MS = 1000;
/** The first field in the form, which receives focus after the form is cleared. */
const FIRST_FIELD_SELECTOR = 'input[name="mla-source-type"]:checked';

const monthOptions = MONTHS.map((name, index) => ({ value: String(index + 1), label: name }));

type MlaLocatorKind = Exclude<CitationLocator["kind"], "section">;

/** Optional fields, folded away until wanted. */
function MoreDetails({ children }: { children: ReactNode }) {
  return (
    <details className="rounded-control border border-border">
      <summary className="cursor-pointer rounded-control px-3 py-2 font-semibold focus-ring">{form.moreDetails}</summary>
      <div className="grid gap-4 p-3">{children}</div>
    </details>
  );
}

/** The form and its live result. Everything runs in the browser; nothing is sent anywhere. */
export function MlaGeneratorForm() {
  const nextKey = useRef(2);
  const [draft, setDraft] = useState<Draft>(() => blankDraft(1));
  const [locatorKind, setLocatorKind] = useState<MlaLocatorKind | "">("page");
  const [locatorValue, setLocatorValue] = useState("");
  const [announcement, setAnnouncement] = useState("");
  /** Whether the latest change came from typing, so the updated entry should be announced. */
  const typed = useRef(false);
  const addButton = useRef<HTMLButtonElement>(null);
  /** An author just added, whose first field should receive focus once it has rendered. */
  const focusAuthorKey = useRef<number | null>(null);
  const focusFirstField = useRef(false);

  const record = useMemo<SourceRecord | null>(() => (isEmptyDraft(draft) ? null : { source: toSource(draft), provenance: "user-entered" }), [draft]);
  const locator = useMemo<CitationLocator | undefined>(
    () => (locatorKind && locatorValue.trim() ? { kind: locatorKind, value: locatorValue } : undefined),
    [locatorKind, locatorValue],
  );
  const citation = useMemo(() => (record ? formatMla(record, locator) : null), [record, locator]);
  const issues = useMemo(() => (citation && record ? [...issuesFor(citation.notes), provenanceIssue(record)] : []), [citation, record]);
  const entryText = citation ? plainText(citation.worksCited) : "";
  const toCheck = issues.filter((issue) => issue.severity !== "information").length;

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
    if (!typed.current || !entryText) return;
    const timer = setTimeout(() => setAnnouncement(announcements.entryUpdated(entryText, toCheck)), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [entryText, toCheck]);

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
    setLocatorKind("page");
    setLocatorValue("");
    setDraft(blankDraft(nextKey.current++));
    announce(announcements.formCleared);
  };

  const loadExample = () => {
    typed.current = false;
    const example = exampleDraft(nextKey.current);
    nextKey.current += example.authors.length;
    setDraft(example);
    setLocatorKind("page");
    setLocatorValue("437");
    announce(announcements.exampleLoaded);
  };

  const handleCopy = (target: CopyTarget, result: CopyResult) =>
    announce(result === "copied" ? announcements.copied(target) : announcements.copyFailed(target));

  const field = (key: keyof Draft, label: string, hint?: string, extra: { inputMode?: "numeric" | "url" } = {}) => (
    <TextField
      id={`mla-${key}`}
      label={label}
      hint={hint}
      value={draft[key] as string}
      onChange={(event) => update({ [key]: event.target.value })}
      autoComplete="off"
      {...extra}
    />
  );

  const monthField = (key: "month" | "accessedMonth") => (
    <SelectField
      id={`mla-${key}`}
      label={form.month}
      emptyOption={form.noMonth}
      options={monthOptions}
      value={draft[key]}
      onChange={(event) => update({ [key]: event.target.value })}
    />
  );

  return (
    <div className="grid min-w-0 gap-10">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={loadExample}>
          {actions.loadExample}
        </Button>
        <Button variant="subtle" size="sm" onClick={clearForm}>
          {actions.clear}
        </Button>
      </div>

      <form className="grid min-w-0 gap-8" onSubmit={(event) => event.preventDefault()}>
        <RadioGroup
          name="mla-source-type"
          legend={form.sourceType}
          options={SOURCE_TYPES.map((value) => ({ value, label: form.sourceTypes[value] }))}
          value={draft.type}
          onChange={(value) => {
            typed.current = true;
            setDraft((current) => withSourceType(current, value));
          }}
        />

        <fieldset className="grid gap-4" aria-describedby="mla-authors-hint">
          <legend className="mb-1 text-subheading font-semibold">{form.authors}</legend>
          <p id="mla-authors-hint" className="text-small text-text-muted">
            {form.authorsHint}
          </p>
          {draft.authors.map((author, index) => (
            <AuthorFields
              key={author.key}
              author={author}
              position={index + 1}
              canRemove={draft.authors.length > 1}
              labels={authorLabels}
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

        {field("title", form.title, form.titleHint)}

        {draft.type === "book" && field("publisher", form.publisher)}

        {draft.type === "journal-article" && (
          <>
            {field("journal", form.journal, form.journalHint)}
            <div className="grid items-start gap-3 sm:grid-cols-3">
              {field("volume", form.volume)}
              {field("issue", form.issue)}
              {field("pages", form.pages, form.pagesHint)}
            </div>
          </>
        )}

        {draft.type === "webpage" && field("siteName", form.siteName, form.siteNameHint)}

        <fieldset className="grid gap-4" aria-describedby="mla-date-hint">
          <legend className="mb-1 text-subheading font-semibold">{form.date}</legend>
          <p id="mla-date-hint" className="text-small text-text-muted">
            {draft.type === "journal-article" ? form.journalDateHint : form.dateHint}
          </p>
          <div className="grid items-start gap-3 sm:grid-cols-3">
            {draft.type === "webpage" && field("day", form.day, undefined, { inputMode: "numeric" })}
            {draft.type !== "book" && monthField("month")}
            {field("year", form.year, undefined, { inputMode: "numeric" })}
          </div>
        </fieldset>

        {draft.type === "book" && (
          <MoreDetails>
            {field("edition", form.edition, form.editionHint)}
            {field("doi", form.doi, form.doiHint)}
            {field("url", form.url, form.urlHintOptional, { inputMode: "url" })}
          </MoreDetails>
        )}

        {draft.type === "journal-article" && (
          <>
            {field("doi", form.doi, form.doiHint)}
            <MoreDetails>
              {field("url", form.url, form.urlHintOptional, { inputMode: "url" })}
              {field("articleNumber", form.articleNumber, form.articleNumberHint)}
            </MoreDetails>
          </>
        )}

        {draft.type === "webpage" && (
          <>
            {field("url", form.url, form.urlHint, { inputMode: "url" })}
            <MoreDetails>
              {field("publisher", form.webPublisher, form.webPublisherHint)}
              <fieldset className="grid gap-3" aria-describedby="mla-accessed-hint">
                <legend className="mb-1 font-semibold">{form.accessed}</legend>
                <p id="mla-accessed-hint" className="text-small text-text-muted">
                  {form.accessedHint}
                </p>
                <div className="grid items-start gap-3 sm:grid-cols-3">
                  {field("accessedDay", form.day, undefined, { inputMode: "numeric" })}
                  {monthField("accessedMonth")}
                  {field("accessedYear", form.year, undefined, { inputMode: "numeric" })}
                </div>
              </fieldset>
            </MoreDetails>
          </>
        )}
      </form>

      {record && (
        <section aria-labelledby="mla-locator-title" className="grid gap-4 border-t border-border pt-8">
          <h2 id="mla-locator-title" className="text-heading font-semibold">
            {locatorCopy.heading}
          </h2>
          <p className="text-small text-text-muted">{locatorCopy.intro}</p>
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <SelectField
              id="mla-locator-kind"
              label={locatorCopy.kind}
              emptyOption={locatorCopy.noLocator}
              options={[
                { value: "page", label: locatorCopy.page },
                { value: "page-range", label: locatorCopy.pageRange },
                { value: "paragraph", label: locatorCopy.paragraph },
              ]}
              value={locatorKind}
              onChange={(event) => {
                const kind = event.target.value as MlaLocatorKind | "";
                setLocatorKind(kind);
                if (!kind) setLocatorValue("");
              }}
            />
            <TextField
              id="mla-locator-value"
              label={locatorCopy.value}
              hint={locatorCopy.valueHint}
              value={locatorValue}
              onChange={(event) => setLocatorValue(event.target.value)}
              autoComplete="off"
            />
          </div>
        </section>
      )}

      <div className={record ? "border-t border-border pt-8" : undefined}>
        <MlaOutput citation={citation} issues={issues} onCopy={handleCopy} />
      </div>
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
