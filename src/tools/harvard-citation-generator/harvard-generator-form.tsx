"use client";

import { useMemo, useState } from "react";
import { Button, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import { LocatorFields, SourceFields, useAnnounceWhenTyped, useCitationForm } from "@/features/citation";
import { formatHarvard, issuesFor, provenanceIssue } from "@/knowledge/citation/harvard";
import { plainText } from "@/knowledge/citation/source";
import { actions, announcements, authorLabels, form, locator as locatorCopy, yearLetter as yearLetterCopy, type CopyTarget } from "./copy";
import { EXAMPLE_LOCATOR, exampleDraft } from "./draft";
import { HarvardOutput } from "./harvard-output";

const ID_PREFIX = "harvard";

/** Harvard citations take page numbers; other locators vary between institutions and aren't formatted. */
const locatorKinds = [
  { value: "page", label: locatorCopy.page },
  { value: "page-range", label: locatorCopy.pageRange },
] as const;

/** The form and its live result. Everything runs in the browser; nothing is sent anywhere. */
export function HarvardGeneratorForm() {
  const state = useCitationForm<(typeof locatorKinds)[number]["value"]>({ idPrefix: ID_PREFIX, defaultLocator: "page" });
  const [yearLetter, setYearLetter] = useState("");
  const { record, locator } = state;

  const citation = useMemo(() => (record ? formatHarvard({ record, locator, yearLetter }) : null), [record, locator, yearLetter]);
  const issues = useMemo(() => (citation && record ? [...issuesFor(citation.notes), provenanceIssue(record)] : []), [citation, record]);
  const toCheck = issues.filter((issue) => issue.severity !== "information").length;
  useAnnounceWhenTyped(state, citation ? announcements.referenceUpdated(plainText(citation.reference), toCheck) : null);

  const handleCopy = (target: CopyTarget, result: CopyResult) =>
    state.announce(result === "copied" ? announcements.copied(target) : announcements.copyFailed(target));

  const clear = () => {
    setYearLetter("");
    state.clear(announcements.formCleared);
  };

  const loadExample = () => {
    setYearLetter("");
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
        options={{ journalMonth: false, dateOrder: "day-month-year", accessDates: true }}
        addAuthorButton={state.addAuthorButton}
        onChange={state.update}
        onTypeChange={state.setType}
        onAuthorChange={state.updateAuthor}
        onAddAuthor={state.addAuthor}
        onRemoveAuthor={state.removeAuthor}
      />

      {record && (
        <>
          <LocatorFields
            idPrefix={ID_PREFIX}
            labels={locatorCopy}
            kinds={locatorKinds}
            kind={state.locatorKind}
            value={state.locatorValue}
            onKindChange={state.setLocatorKind}
            onValueChange={state.setLocatorValue}
          />
          <section aria-labelledby="harvard-year-letter-title" className="grid gap-3">
            <h2 id="harvard-year-letter-title" className="text-heading font-semibold">
              {yearLetterCopy.heading}
            </h2>
            <p className="text-small text-text-muted">{yearLetterCopy.intro}</p>
            <div className="max-w-48">
              <TextField id="harvard-year-letter" label={yearLetterCopy.label} hint={yearLetterCopy.hint} value={yearLetter} onChange={(event) => setYearLetter(event.target.value)} autoComplete="off" />
            </div>
          </section>
        </>
      )}

      <div className={record ? "border-t border-border pt-8" : undefined}>
        <HarvardOutput citation={citation} issues={issues} onCopy={handleCopy} />
      </div>
      <VisuallyHidden role="status" aria-live="polite">
        {state.announcement}
      </VisuallyHidden>
    </div>
  );
}
