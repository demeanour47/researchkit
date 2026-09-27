"use client";

import { Button, SelectField, TextField } from "@/ui";
import { COMMON_REASONS, type CountedSource, type ExclusionReason } from "@/knowledge/prisma";
import { steps } from "./copy";
import { NumberField } from "./number-field";

let counter = 0;
/** A fresh id for a new row; ids only need to be unique on the page. */
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Sources searched, each with its record count, as a list of rows that can be added to and removed. */
export function SourceList({ id, legend, noun, sources, onChange, errorFor }: { id: string; legend: string; noun: string; sources: readonly CountedSource[]; onChange: (sources: CountedSource[]) => void; errorFor: (field: string) => string | undefined }) {
  const update = (index: number, change: Partial<CountedSource>) => onChange(sources.map((source, position) => (position === index ? { ...source, ...change } : source)));
  return (
    <fieldset id={`field-${id}`} tabIndex={-1} className="grid gap-3 focus-ring">
      <legend className="mb-2 font-semibold">{legend}</legend>
      {sources.map((source, index) => (
        <div key={source.id} className="grid items-end gap-3 sm:grid-cols-[1fr_10rem_auto]">
          <TextField id={`field-${id}-${source.id}-name`} label={`${steps.sourceName} (${noun} ${index + 1})`} value={source.name} onChange={(event) => update(index, { name: event.target.value })} />
          <NumberField id={`field-${id}-${source.id}`} label={steps.sourceCount} value={source.count} error={errorFor(`${id}.${source.id}`)} onChange={(count) => update(index, { count })} />
          <Button variant="subtle" size="sm" aria-label={steps.removeSource(source.name.trim() || `${noun} ${index + 1}`)} onClick={() => onChange(sources.filter((_, position) => position !== index))}>
            Remove
          </Button>
        </div>
      ))}
      <div>
        <Button variant="secondary" size="sm" onClick={() => onChange([...sources, { id: newId(id), name: "", count: null }])}>
          {steps.addSource(noun)}
        </Button>
      </div>
    </fieldset>
  );
}

/** Exclusion reasons with their counts: common reasons offered, any reason renamed, custom reasons added. */
export function ReasonList({ id, legend, reasons, onChange, errorFor }: { id: string; legend: string; reasons: readonly ExclusionReason[]; onChange: (reasons: ExclusionReason[]) => void; errorFor: (field: string) => string | undefined }) {
  const update = (index: number, change: Partial<ExclusionReason>) => onChange(reasons.map((reason, position) => (position === index ? { ...reason, ...change } : reason)));
  const unused = COMMON_REASONS.filter((label) => !reasons.some((reason) => reason.label.trim().toLowerCase() === label.toLowerCase()));
  return (
    <fieldset id={`field-${id}`} tabIndex={-1} className="grid gap-3 focus-ring">
      <legend className="mb-2 font-semibold">{legend}</legend>
      {reasons.map((reason, index) => (
        <div key={reason.id} className="grid items-end gap-3 sm:grid-cols-[1fr_10rem_auto]">
          <TextField id={`field-${id}-${reason.id}-label`} label={`${steps.reasonLabel} ${index + 1}`} value={reason.label} onChange={(event) => update(index, { label: event.target.value })} />
          <NumberField id={`field-${id}-${reason.id}`} label={steps.reasonCount} value={reason.count} error={errorFor(`${id}.${reason.id}`)} onChange={(count) => update(index, { count })} />
          <Button variant="subtle" size="sm" aria-label={steps.removeSource(reason.label.trim() || `${steps.reasonLabel.toLowerCase()} ${index + 1}`)} onClick={() => onChange(reasons.filter((_, position) => position !== index))}>
            Remove
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap items-end gap-3">
        {unused.length > 0 && (
          <SelectField
            label={steps.addCommon}
            emptyOption={steps.chooseReason}
            options={unused.map((label) => ({ value: label, label }))}
            value=""
            onChange={(event) => {
              if (event.target.value) onChange([...reasons, { id: newId(id), label: event.target.value, count: null }]);
            }}
          />
        )}
        <Button variant="secondary" size="sm" onClick={() => onChange([...reasons, { id: newId(id), label: "", count: null }])}>
          {steps.addReason}
        </Button>
      </div>
    </fieldset>
  );
}
