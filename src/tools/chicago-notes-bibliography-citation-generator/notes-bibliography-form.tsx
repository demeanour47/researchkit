"use client";

import { useMemo, useState } from "react";
import { Button, RadioGroup, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import { LocatorFields, SourceFields, useAnnounceWhenTyped, useCitationForm } from "@/features/citation";
import {
  chicagoShortTitle,
  formatChicagoNotesBibliography,
  issuesFor,
  provenanceIssue,
  type NoteContext,
  type NoteLocator,
} from "@/knowledge/citation/chicago/notes-bibliography";
import { plainText } from "@/knowledge/citation/source";
import { actions, announcements, authorLabels, context as contextCopy, form, locator as locatorCopy, type CopyTarget } from "./copy";
import { EXAMPLE_LOCATOR, exampleDraft } from "./draft";
import { NotesBibliographyOutput } from "./notes-bibliography-output";

const ID_PREFIX = "nb";

/** Notes cite pages and chapters; paragraph and section locators aren't formatted. */
const locatorKinds = [
  { value: "page", label: locatorCopy.page },
  { value: "page-range", label: locatorCopy.pageRange },
  { value: "chapter", label: locatorCopy.chapter },
] as const;

const contextOptions = (Object.entries(contextCopy.options) as [NoteContext, string][]).map(([value, label]) => ({ value, label }));

/** The form and its live result. Everything runs in the browser; nothing is sent anywhere. */
export function NotesBibliographyForm() {
  const state = useCitationForm<(typeof locatorKinds)[number]["value"]>({ idPrefix: ID_PREFIX, defaultLocator: "" });
  const [noteContext, setNoteContext] = useState<NoteContext>("full-note");
  const [shortTitle, setShortTitle] = useState("");
  const { record, locatorKind, locatorValue } = state;

  // A locator type chosen without a number is passed on, so the generator can say so.
  const locator = useMemo<NoteLocator | undefined>(() => (locatorKind ? { kind: locatorKind, value: locatorValue } : undefined), [locatorKind, locatorValue]);
  const citation = useMemo(() => (record ? formatChicagoNotesBibliography({ record, locator, shortTitle }) : null), [record, locator, shortTitle]);
  const issues = useMemo(() => (citation && record ? [...issuesFor(citation.notes), provenanceIssue(record)] : []), [citation, record]);
  const toCheck = issues.filter((issue) => issue.severity !== "information").length;
  const chosenNote = citation ? plainText(noteContext === "full-note" ? citation.fullNote : citation.shortNote) : "";
  useAnnounceWhenTyped(state, citation ? announcements.noteUpdated(noteContext, chosenNote, toCheck) : null);

  const derivedShortTitle = record ? chicagoShortTitle(record.source.title).text : "";

  const handleCopy = (target: CopyTarget, result: CopyResult) =>
    state.announce(result === "copied" ? announcements.copied(target) : announcements.copyFailed(target));

  const clear = () => {
    setNoteContext("full-note");
    setShortTitle("");
    state.clear(announcements.formCleared);
  };

  const loadExample = () => {
    setNoteContext("full-note");
    setShortTitle("");
    state.loadExample(exampleDraft, EXAMPLE_LOCATOR, announcements.exampleLoaded);
  };

  return (
    <div className="grid min-w-0 gap-10">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={loadExample}>
          {actions.loadExample}
        </Button>
        <Button variant="subtle" size="sm" onClick={clear}>
          {actions.clear}
        </Button>
      </div>

      <SourceFields
        idPrefix={ID_PREFIX}
        draft={state.draft}
        labels={form}
        authorLabels={authorLabels}
        options={{ journalMonth: false, dateOrder: "month-day-year" }}
        addAuthorButton={state.addAuthorButton}
        onChange={state.update}
        onTypeChange={state.setType}
        onAuthorChange={state.updateAuthor}
        onAddAuthor={state.addAuthor}
        onRemoveAuthor={state.removeAuthor}
      />

      {record && (
        <>
          <section aria-labelledby="nb-context-title" className="grid gap-4 border-t border-border pt-8">
            <h2 id="nb-context-title" className="text-heading font-semibold">
              {contextCopy.heading}
            </h2>
            <p className="text-small text-text-muted">{contextCopy.intro}</p>
            <RadioGroup name="nb-note-context" legend={contextCopy.legend} options={contextOptions} value={noteContext} onChange={setNoteContext} />
            <TextField
              id="nb-short-title"
              label={contextCopy.shortTitle}
              hint={contextCopy.shortTitleHint(derivedShortTitle)}
              value={shortTitle}
              onChange={(event) => setShortTitle(event.target.value)}
              autoComplete="off"
            />
          </section>

          <LocatorFields
            idPrefix={ID_PREFIX}
            labels={locatorCopy}
            kinds={locatorKinds}
            kind={state.locatorKind}
            value={state.locatorValue}
            onKindChange={state.setLocatorKind}
            onValueChange={state.setLocatorValue}
          />
        </>
      )}

      <div className={record ? "border-t border-border pt-8" : undefined}>
        <NotesBibliographyOutput citation={citation} context={noteContext} issues={issues} onCopy={handleCopy} />
      </div>
      <VisuallyHidden role="status" aria-live="polite">
        {state.announcement}
      </VisuallyHidden>
    </div>
  );
}
