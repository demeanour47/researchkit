"use client";

import { RadioGroup, SelectField, TextField } from "@/ui";
import {
  DEFAULT_SAMPLE_SIZE_PLAN,
  MEASUREMENT_LEVELS,
  MEASUREMENT_LEVEL_INFO,
  RESEARCH_DESIGNS,
  SAMPLING_TECHNIQUES,
  TYPED_MARGINS,
  TYPED_VARIABLE_FIELDS,
  calculateSampleSize,
  optionsFor,
  updateInputs,
  variablesFromTyped,
  type MeasurementLevel,
  type TypedProject,
} from "@/knowledge/research";

/** Wording for the shared project fields. */
export const projectFieldsCopy = {
  question: "Research question",
  objectives: "Research objectives",
  perLine: "One per line.",
  variablesHint: "One variable per line. Put its indicators after a colon, separated by semicolons, such as “wellbeing: life satisfaction; positive mood”.",
  independent: "Independent variables",
  dependent: "Dependent variables",
  moderator: "Moderator variables",
  mediator: "Mediator variables",
  control: "Control variables",
  levelsLegend: "How each variable is measured",
  levelsHint: "The measurement level decides which tests fit. A Likert variable with several indicators is treated as a multi-item scale.",
  levelLabel: (name: string) => `${name}: measured as`,
  notSet: "Not set",
  hypothesesLegend: "Hypotheses",
  hypothesesHint: "Until the tools share a saved project, hypotheses can be drafted from your variables with the Hypothesis Builder's rules.",
  noHypotheses: "No hypotheses",
  relationship: "Relationship",
  difference: "Difference",
  prediction: "Prediction",
  onionLegend: "Research onion choices",
  philosophy: "Research philosophy",
  approach: "Research approach",
  choice: "Methodological choice",
  timeHorizon: "Time horizon",
  design: "Research design",
  technique: "Sampling technique",
  sampleSize: "Sample size plan",
  sampleSizeHint: "A plan from the Sample Size Calculator, using Cochran's formula at 95% confidence.",
  sampleOption: (margin: string, size: number) => `±${margin}% margin of error: ${size} participants`,
  notChosen: "Not chosen",
} as const;

const copy = projectFieldsCopy;
const ONION = [
  ["philosophy", copy.philosophy],
  ["approach", copy.approach],
  ["choice", copy.choice],
  ["timeHorizon", copy.timeHorizon],
] as const;
const SAMPLE_OPTIONS = TYPED_MARGINS.map((margin) => ({ value: margin, label: copy.sampleOption(margin, calculateSampleSize(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { margin: Number(margin) })).adjusted!) }));

export interface ProjectFieldsProps {
  /** Prefixes every id, so two tools' fields never clash. */
  prefix: string;
  value: TypedProject;
  levels: Readonly<Record<string, MeasurementLevel | "">>;
  /** Typing in a text field. */
  onType: (field: keyof TypedProject, text: string) => void;
  /** A choice that changes the project at once, such as a design or a measurement level. */
  onChoose: (value: TypedProject, levels: Record<string, MeasurementLevel | "">) => void;
}

/**
 * The project step shared by the research tools that read the whole project: question,
 * objectives, variables and their levels, hypotheses, onion choices, design, sampling
 * and sample size. Every value is turned into a draft by the knowledge layer.
 */
export function ProjectFields({ prefix, value, levels, onType, onChoose }: ProjectFieldsProps) {
  const typed = variablesFromTyped(value);
  const text = (field: keyof TypedProject, label: string, hint?: string, describedBy?: string) => (
    <TextField id={`${prefix}-${field}`} label={label} hint={hint} multiline rows={field === "researchQuestion" ? 2 : 3} aria-describedby={describedBy} value={value[field]} onChange={(event) => onType(field, event.target.value)} />
  );
  const select = (field: keyof TypedProject, label: string, options: readonly { value: string; label: string }[], hint?: string) => (
    <SelectField id={`${prefix}-${field}`} label={label} hint={hint} emptyOption={copy.notChosen} options={options} value={value[field]} onChange={(event) => onChoose({ ...value, [field]: event.target.value }, { ...levels })} />
  );
  return (
    <>
      {text("researchQuestion", copy.question)}
      {text("researchObjectives", copy.objectives, copy.perLine)}
      <p id={`${prefix}-variables-hint`} className="text-small text-text-muted">
        {copy.variablesHint}
      </p>
      <div className="grid items-start gap-6 sm:grid-cols-2">{TYPED_VARIABLE_FIELDS.map((field) => <div key={field}>{text(field, copy[field], undefined, `${prefix}-variables-hint`)}</div>)}</div>
      {typed.length > 0 && (
        <fieldset className="grid gap-4" aria-describedby={`${prefix}-levels-hint`}>
          <legend className="mb-1 text-subheading font-semibold">{copy.levelsLegend}</legend>
          <p id={`${prefix}-levels-hint`} className="text-small text-text-muted">
            {copy.levelsHint}
          </p>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {typed.map((variable) => (
              <SelectField
                key={variable.id}
                id={`${prefix}-level-${variable.id}`}
                label={copy.levelLabel(variable.name)}
                emptyOption={copy.notSet}
                options={MEASUREMENT_LEVELS.map((level) => ({ value: level, label: MEASUREMENT_LEVEL_INFO[level].label }))}
                value={levels[variable.id] ?? ""}
                onChange={(event) => onChoose(value, { ...levels, [variable.id]: event.target.value as MeasurementLevel | "" })}
              />
            ))}
          </div>
        </fieldset>
      )}
      <RadioGroup
        name={`${prefix}-hypotheses`}
        legend={copy.hypothesesLegend}
        hint={copy.hypothesesHint}
        variant="inline"
        options={[
          { value: "", label: copy.noHypotheses },
          { value: "relationship", label: copy.relationship },
          { value: "difference", label: copy.difference },
          { value: "prediction", label: copy.prediction },
        ]}
        value={value.hypotheses}
        onChange={(hypotheses) => onChoose({ ...value, hypotheses }, { ...levels })}
      />
      <fieldset className="grid gap-4">
        <legend className="mb-1 text-subheading font-semibold">{copy.onionLegend}</legend>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          {ONION.map(([layer, label]) => (
            <div key={layer}>{select(layer, label, optionsFor(layer).map((option) => ({ value: option.id, label: option.name })))}</div>
          ))}
        </div>
      </fieldset>
      <div className="grid items-start gap-4 sm:grid-cols-2">
        {select("design", copy.design, RESEARCH_DESIGNS.map((design) => ({ value: design.id, label: design.name })))}
        {select("technique", copy.technique, SAMPLING_TECHNIQUES.map((technique) => ({ value: technique.id, label: `${technique.name} sampling` })))}
        {select("margin", copy.sampleSize, SAMPLE_OPTIONS, copy.sampleSizeHint)}
      </div>
    </>
  );
}
