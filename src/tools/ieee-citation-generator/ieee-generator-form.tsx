"use client";

import { useMemo, useState } from "react";
import { Button, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import { LocatorFields, SourceFields, useAnnounceWhenTyped, useCitationForm } from "@/features/citation";
import { formatIeee, issuesFor, provenanceIssue, type IeeeLocator } from "@/knowledge/citation/ieee";
import { ANY_SOURCE_TYPES, plainText } from "@/knowledge/citation/source";
import { actions, announcements, authorLabels, form, locator as locatorCopy, number as numberCopy, type CopyTarget } from "./copy";
import { EXAMPLE_NUMBER, exampleDraft } from "./draft";
import { IeeeOutput } from "./ieee-output";
import { MultipleCitation } from "./multiple-citation";

const ID_PREFIX = "ieee";

/** IEEE cites parts of a reference by page, chapter or section; paragraphs aren't among its forms. */
const locatorKinds = [
  { value: "page", label: locatorCopy.page },
  { value: "page-range", label: locatorCopy.pageRange },
  { value: "chapter", label: locatorCopy.chapter },
  { value: "section", label: locatorCopy.section },
] as const;

/** The form and its live result. Everything runs in the browser; nothing is sent anywhere. */
export function IeeeGeneratorForm() {
  const state = useCitationForm<(typeof locatorKinds)[number]["value"]>({ idPrefix: ID_PREFIX, defaultLocator: "", types: ANY_SOURCE_TYPES });
  const [referenceNumber, setReferenceNumber] = useState("1");
  const { anySource, locatorKind, locatorValue } = state;

  // A locator type chosen without a number is passed on, so the generator can say so.
  const locator = useMemo<IeeeLocator | undefined>(() => (locatorKind ? { kind: locatorKind, value: locatorValue } : undefined), [locatorKind, locatorValue]);
  const result = useMemo(() => (anySource ? formatIeee({ source: anySource, provenance: "user-entered", number: referenceNumber, locator }) : null), [anySource, referenceNumber, locator]);
  const issues = useMemo(() => (result ? [...issuesFor(result.notes), provenanceIssue("user-entered")] : []), [result]);
  const toCheck = issues.filter((issue) => issue.severity !== "information").length;
  useAnnounceWhenTyped(state, result?.entry ? announcements.entryUpdated(plainText(result.entry), toCheck) : null);

  const handleCopy = (target: CopyTarget, copied: CopyResult) =>
    state.announce(copied === "copied" ? announcements.copied(target) : announcements.copyFailed(target));

  const clear = () => {
    setReferenceNumber("1");
    state.clear(announcements.formCleared);
  };

  const loadExample = () => {
    setReferenceNumber(EXAMPLE_NUMBER);
    state.loadExample(exampleDraft, null, announcements.exampleLoaded);
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

      <section aria-labelledby="ieee-number-title" className="grid gap-3">
        <h2 id="ieee-number-title" className="text-heading font-semibold">
          {numberCopy.heading}
        </h2>
        <p className="text-small text-text-muted">{numberCopy.intro}</p>
        <div className="max-w-48">
          <TextField id="ieee-reference-number" label={numberCopy.label} hint={numberCopy.hint} value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} inputMode="numeric" autoComplete="off" />
        </div>
      </section>

      <SourceFields
        idPrefix={ID_PREFIX}
        draft={state.draft}
        labels={form}
        authorLabels={authorLabels}
        options={{ journalMonth: true, dateOrder: "month-day-year", bookPlace: true, types: ANY_SOURCE_TYPES }}
        addAuthorButton={state.addAuthorButton}
        onChange={state.update}
        onTypeChange={state.setType}
        onAuthorChange={state.updateAuthor}
        onAddAuthor={state.addAuthor}
        onRemoveAuthor={state.removeAuthor}
      />

      {anySource && (
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

      <div className={anySource ? "border-t border-border pt-8" : undefined}>
        <IeeeOutput result={result} issues={issues} onCopy={handleCopy} />
      </div>

      <MultipleCitation onCopy={handleCopy} />

      <VisuallyHidden role="status" aria-live="polite">
        {state.announcement}
      </VisuallyHidden>
    </div>
  );
}
