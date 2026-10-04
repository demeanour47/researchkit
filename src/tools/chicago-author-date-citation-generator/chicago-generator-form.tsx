"use client";

import { useMemo } from "react";
import { Button, VisuallyHidden, type CopyResult } from "@/ui";
import { LocatorFields, SourceFields, useAnnounceWhenTyped, useCitationForm } from "@/features/citation";
import { formatChicagoAuthorDate, issuesFor, provenanceIssue } from "@/knowledge/citation/chicago/author-date";
import { plainText } from "@/knowledge/citation/source";
import { actions, announcements, authorLabels, form, locator as locatorCopy, type CopyTarget } from "./copy";
import { EXAMPLE_LOCATOR, exampleDraft } from "./draft";
import { ChicagoOutput } from "./chicago-output";

const ID_PREFIX = "chicago";

/** Chicago author-date text citations take page numbers; other locators aren't formatted. */
const locatorKinds = [
  { value: "page", label: locatorCopy.page },
  { value: "page-range", label: locatorCopy.pageRange },
] as const;

/** The form and its live result. Everything runs in the browser; nothing is sent anywhere. */
export function ChicagoGeneratorForm() {
  const state = useCitationForm<(typeof locatorKinds)[number]["value"]>({ idPrefix: ID_PREFIX, defaultLocator: "page" });
  const { record, locator } = state;

  const citation = useMemo(() => (record ? formatChicagoAuthorDate(record, locator) : null), [record, locator]);
  const issues = useMemo(() => (citation && record ? [...issuesFor(citation.notes), provenanceIssue(record)] : []), [citation, record]);
  const toCheck = issues.filter((issue) => issue.severity !== "information").length;
  useAnnounceWhenTyped(state, citation ? announcements.referenceUpdated(plainText(citation.reference), toCheck) : null);

  const handleCopy = (target: CopyTarget, result: CopyResult) =>
    state.announce(result === "copied" ? announcements.copied(target) : announcements.copyFailed(target));

  return (
    <div className="grid min-w-0 gap-10">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={() => state.loadExample(exampleDraft, EXAMPLE_LOCATOR, announcements.exampleLoaded)}>
          {actions.loadExample}
        </Button>
        <Button variant="subtle" size="sm" onClick={() => state.clear(announcements.formCleared)}>
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
        <LocatorFields
          idPrefix={ID_PREFIX}
          labels={locatorCopy}
          kinds={locatorKinds}
          kind={state.locatorKind}
          value={state.locatorValue}
          onKindChange={state.setLocatorKind}
          onValueChange={state.setLocatorValue}
        />
      )}

      <div className={record ? "border-t border-border pt-8" : undefined}>
        <ChicagoOutput citation={citation} issues={issues} onCopy={handleCopy} />
      </div>
      <VisuallyHidden role="status" aria-live="polite">
        {state.announcement}
      </VisuallyHidden>
    </div>
  );
}
