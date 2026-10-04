"use client";

import { SelectField, TextField } from "@/ui";
import type { LocatorKind } from "@/knowledge/citation/source";

export interface LocatorFieldLabels {
  heading: string;
  intro: string;
  kind: string;
  noLocator: string;
  value: string;
  valueHint: string;
}

export interface LocatorFieldsProps<Kind extends LocatorKind> {
  idPrefix: string;
  labels: LocatorFieldLabels;
  /** The kinds of locator the style formats, with their labels. */
  kinds: readonly { value: Kind; label: string }[];
  kind: Kind | "";
  value: string;
  onKindChange: (kind: Kind | "") => void;
  onValueChange: (value: string) => void;
}

/** Where in the source a citation points: a page, a range, or whatever else the style formats. */
export function LocatorFields<Kind extends LocatorKind>({ idPrefix, labels, kinds, kind, value, onKindChange, onValueChange }: LocatorFieldsProps<Kind>) {
  return (
    <section aria-labelledby={`${idPrefix}-locator-title`} className="grid gap-4 border-t border-border pt-8">
      <h2 id={`${idPrefix}-locator-title`} className="text-heading font-semibold">
        {labels.heading}
      </h2>
      <p className="text-small text-text-muted">{labels.intro}</p>
      <div className="grid items-start gap-3 sm:grid-cols-2">
        <SelectField
          id={`${idPrefix}-locator-kind`}
          label={labels.kind}
          emptyOption={labels.noLocator}
          options={kinds}
          value={kind}
          onChange={(event) => onKindChange(kinds.find((option) => option.value === event.target.value)?.value ?? "")}
        />
        <TextField
          id={`${idPrefix}-locator-value`}
          label={labels.value}
          hint={labels.valueHint}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          autoComplete="off"
        />
      </div>
    </section>
  );
}
