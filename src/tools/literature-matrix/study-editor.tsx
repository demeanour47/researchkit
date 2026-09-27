"use client";

import { useEffect, useRef } from "react";
import { Button, RadioGroup, SelectField, TextField } from "@/ui";
import {
  COLOUR_TAGS,
  FIELD_GROUPS,
  FIELD_GROUP_LABELS,
  FIELD_INFO,
  MATRIX_FIELDS,
  PRIORITIES,
  PRIORITY_LABELS,
  READING_STATUSES,
  READING_STATUS_LABELS,
  studyLabel,
  type ColourTag,
  type MatrixField,
  type MatrixIssue,
  type Priority,
  type ReadingStatus,
  type Study,
} from "@/knowledge/literature";
import { steps } from "./copy";
import { TagBadge } from "./parts";

export interface StudyEditorProps {
  study: Study;
  issues: readonly MatrixIssue[];
  onField: (field: MatrixField, value: string) => void;
  onStatus: (status: ReadingStatus) => void;
  onPriority: (priority: Priority | null) => void;
  onTag: (tag: ColourTag | null) => void;
  onFavourite: (favourite: boolean) => void;
  onClose: () => void;
}

/** Every column of one study, grouped as the matrix groups them, with the study's organisation. Focus moves to its heading when it opens. */
export function StudyEditor({ study, issues, onField, onStatus, onPriority, onTag, onFavourite, onClose }: StudyEditorProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), [study.id]);
  const errorFor = (field: MatrixField) => issues.find((issue) => issue.field === field && issue.severity === "problem")?.message;
  return (
    <section aria-labelledby="editor-title" className="grid gap-6 rounded-panel border border-border bg-surface p-4 sm:p-6">
      <h3 id="editor-title" ref={heading} tabIndex={-1} className="text-subheading font-semibold focus-ring">
        {steps.editor(studyLabel(study))}
      </h3>
      <fieldset className="grid gap-4">
        <legend className="mb-2 font-semibold">{steps.organisation}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label={steps.status} options={READING_STATUSES.map((value) => ({ value, label: READING_STATUS_LABELS[value] }))} value={study.status} onChange={(event) => onStatus(event.target.value as ReadingStatus)} />
          <SelectField label={steps.priority} emptyOption={steps.none} options={PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }))} value={study.priority ?? ""} onChange={(event) => onPriority((event.target.value || null) as Priority | null)} />
        </div>
        <RadioGroup
          name={`tag-${study.id}`}
          legend={steps.tag}
          variant="inline"
          options={[{ value: "none", label: steps.none }, ...COLOUR_TAGS.map((tag) => ({ value: tag, label: <TagBadge tag={tag} /> }))]}
          value={study.tag ?? "none"}
          onChange={(value) => onTag(value === "none" ? null : (value as ColourTag))}
        />
        <RadioGroup name={`favourite-${study.id}`} legend="Favourite" variant="inline" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} value={study.favourite ? "yes" : "no"} onChange={(value) => onFavourite(value === "yes")} />
      </fieldset>
      {FIELD_GROUPS.map((group) => (
        <fieldset key={group} className="grid gap-4">
          <legend className="mb-2 font-semibold">{FIELD_GROUP_LABELS[group]}</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {MATRIX_FIELDS.filter((field) => FIELD_INFO[field].group === group).map((field) => {
              const shared = { id: `field-${study.id}-${field}`, label: FIELD_INFO[field].label, hint: FIELD_INFO[field].hint, error: errorFor(field), value: study.fields[field] };
              return FIELD_INFO[field].multiline ? (
                <TextField key={field} {...shared} multiline rows={3} onChange={(event) => onField(field, event.target.value)} />
              ) : (
                <TextField key={field} {...shared} onChange={(event) => onField(field, event.target.value)} />
              );
            })}
          </div>
        </fieldset>
      ))}
      <div>
        <Button onClick={onClose}>{steps.closeEditor}</Button>
      </div>
    </section>
  );
}
