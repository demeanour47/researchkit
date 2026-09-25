"use client";

import { useState } from "react";
import { RadioGroup, SelectField, TextField } from "@/ui";
import {
  SCALE_PRESETS,
  SCALE_PRESET_IDS,
  createScale,
  scaleCoding,
  scaleProblems,
  setReverseScored,
  setScaleAnchors,
  setScaleDirection,
  setScaleLabels,
  setScaleStart,
  type QuestionScale,
  type ScalePresetId,
} from "@/knowledge/research";
import { steps } from "./copy";

/** Edits one question's scale: preset or custom labels, end words, numbering, direction and reverse scoring. */
export function ScaleEditor({ id, scale, onChange }: { id: string; scale: QuestionScale; onChange: (scale: QuestionScale) => void }) {
  const [labels, setLabels] = useState(scale.labels.join("\n"));
  const [basis, setBasis] = useState<ScalePresetId>(scale.preset);
  const [error, setError] = useState<string | null>(null);
  // A new preset replaces the labels being edited; custom edits keep the text as typed.
  if (basis !== scale.preset && scale.preset !== "custom") {
    setBasis(scale.preset);
    setLabels(scale.labels.join("\n"));
    setError(null);
  }
  const problems = scaleProblems(scale);
  const start = Math.min(...scale.values);

  return (
    <fieldset className="grid gap-4 rounded-panel border border-border p-4" aria-describedby={`${id}-coding`}>
      <legend className="px-1 font-semibold">{steps.scale}</legend>
      <SelectField
        id={`${id}-preset`}
        label={steps.scalePreset}
        options={SCALE_PRESET_IDS.map((preset) => ({ value: preset, label: SCALE_PRESETS[preset].name }))}
        value={scale.preset}
        onChange={(event) => {
          const next = createScale(event.target.value as ScalePresetId);
          onChange(setReverseScored(next, scale.reverseScored));
        }}
      />
      <TextField
        id={`${id}-labels`}
        label={steps.scaleLabels}
        hint={steps.scaleLabelsHint}
        multiline
        rows={Math.min(10, scale.labels.length + 1)}
        value={labels}
        error={error ?? undefined}
        onChange={(event) => {
          setLabels(event.target.value);
          setBasis("custom");
          try {
            onChange(setScaleLabels(scale, event.target.value.split("\n")));
            setError(null);
          } catch (problem) {
            setError(problem instanceof Error ? problem.message : String(problem));
          }
        }}
      />
      {scale.anchors && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id={`${id}-low`} label={steps.lowAnchor} autoComplete="off" value={scale.anchors[0]} onChange={(event) => onChange(setScaleAnchors(scale, [event.target.value, scale.anchors![1]]))} />
          <TextField id={`${id}-high`} label={steps.highAnchor} autoComplete="off" value={scale.anchors[1]} onChange={(event) => onChange(setScaleAnchors(scale, [scale.anchors![0], event.target.value]))} />
        </div>
      )}
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <SelectField
          id={`${id}-start`}
          label={steps.scaleStart}
          options={[
            { value: "0", label: "0" },
            { value: "1", label: "1" },
          ]}
          value={String(start)}
          onChange={(event) => onChange(setScaleStart(scale, Number(event.target.value)))}
        />
        <RadioGroup
          name={`${id}-direction`}
          legend={steps.scaleDirection}
          variant="inline"
          options={[
            { value: "ascending", label: steps.ascending },
            { value: "descending", label: steps.descending },
          ]}
          value={scale.direction}
          onChange={(value) => onChange(setScaleDirection(scale, value))}
        />
      </div>
      <RadioGroup
        name={`${id}-reverse`}
        legend={steps.reverse}
        hint={steps.reverseHint}
        variant="inline"
        options={[
          { value: "no", label: steps.no },
          { value: "yes", label: steps.yes },
        ]}
        value={scale.reverseScored ? "yes" : "no"}
        onChange={(value) => onChange(setReverseScored(scale, value === "yes"))}
      />
      <p id={`${id}-coding`} className="text-small">
        <span className="font-medium">{steps.coding}:</span> {scaleCoding(scale)}
      </p>
      {problems.length > 0 && (
        <ul className="grid list-disc gap-1 ps-6 text-small">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
