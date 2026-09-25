"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, SelectField, TextField, VisuallyHidden } from "@/ui";
import {
  DEFAULT_SAMPLE_SIZE_PLAN,
  MEASUREMENT_LEVELS,
  MEASUREMENT_LEVEL_INFO,
  RESEARCH_DESIGNS,
  SAMPLING_TECHNIQUES,
  analysisPlanText,
  calculateSampleSize,
  optionsFor,
  recommendAnalyses,
  updateInputs,
  type MeasurementLevel,
} from "@/knowledge/research";
import { announcements, planAnnouncement } from "./announcements";
import { steps } from "./copy";
import { exampleInputs, exampleLevels } from "./example";
import { PlanView } from "./plan-view";
import { EMPTY_PROJECT_INPUTS, MARGINS, VARIABLE_FIELDS, projectFromInputs, variablesFromInputs, type ProjectInputs } from "./project-input";

const ONION = [
  ["philosophy", steps.philosophy],
  ["approach", steps.approach],
  ["choice", steps.choice],
  ["timeHorizon", steps.timeHorizon],
] as const;
const SAMPLE_OPTIONS = MARGINS.map((margin) => ({ value: margin, label: steps.sampleOption(margin, calculateSampleSize(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { margin: Number(margin) })).adjusted!) }));

function Step({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-border pt-8">
      <h2 id={`${id}-title`} className="text-heading font-semibold">
        {heading}
      </h2>
      {children}
    </section>
  );
}

/** The project the recommender reads, and the plan it gives. Every rule runs in the knowledge layer. */
export function RecommenderForm({ guide }: { guide: ReactNode }) {
  const [inputs, setInputs] = useState<ProjectInputs>(EMPTY_PROJECT_INPUTS);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [announcement, setAnnouncement] = useState("");
  const project = useMemo(() => projectFromInputs(inputs, levels), [inputs, levels]);
  const plan = useMemo(() => recommendAnalyses(project), [project]);
  const typed = useMemo(() => variablesFromInputs(inputs), [inputs]);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  /** Choices change the plan at once, so the change is announced; typing isn't, to avoid constant interruptions. */
  const choose = (next: ProjectInputs, nextLevels = levels) => {
    setInputs(next);
    setLevels(nextLevels);
    announce(planAnnouncement(recommendAnalyses(projectFromInputs(next, nextLevels))));
  };
  const text = (field: keyof ProjectInputs, label: string, hint?: string, describedBy?: string) => (
    <TextField id={`da-${field}`} label={label} hint={hint} multiline rows={field === "researchQuestion" ? 2 : 3} aria-describedby={describedBy} value={inputs[field]} onChange={(event) => setInputs((current) => ({ ...current, [field]: event.target.value }))} />
  );
  const select = (field: keyof ProjectInputs, label: string, options: readonly { value: string; label: string }[], hint?: string) => (
    <SelectField id={`da-${field}`} label={label} hint={hint} emptyOption={steps.notChosen} options={options} value={inputs[field]} onChange={(event) => choose({ ...inputs, [field]: event.target.value })} />
  );

  return (
    <div className="grid gap-10">
      <Step id="project" heading={steps.project}>
        <p className="text-text-muted">{steps.projectIntro}</p>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setInputs({ ...exampleInputs });
              setLevels({ ...exampleLevels });
              announce(`${announcements.exampleLoaded} ${planAnnouncement(recommendAnalyses(projectFromInputs(exampleInputs, exampleLevels)))}`);
            }}
          >
            {steps.example}
          </Button>
        </div>
        {text("researchQuestion", steps.question)}
        {text("researchObjectives", steps.objectives, steps.perLine)}
        <p id="da-variables-hint" className="text-small text-text-muted">
          {steps.variablesHint}
        </p>
        <div className="grid items-start gap-6 sm:grid-cols-2">{VARIABLE_FIELDS.map((field) => <div key={field}>{text(field, steps[field], undefined, "da-variables-hint")}</div>)}</div>
        {typed.length > 0 && (
          <fieldset className="grid gap-4" aria-describedby="da-levels-hint">
            <legend className="mb-1 text-subheading font-semibold">{steps.levelsLegend}</legend>
            <p id="da-levels-hint" className="text-small text-text-muted">
              {steps.levelsHint}
            </p>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {typed.map((variable) => (
                <SelectField
                  key={variable.id}
                  id={`da-level-${variable.id}`}
                  label={steps.levelLabel(variable.name)}
                  emptyOption={steps.notSet}
                  options={MEASUREMENT_LEVELS.map((level) => ({ value: level, label: MEASUREMENT_LEVEL_INFO[level].label }))}
                  value={levels[variable.id] ?? ""}
                  onChange={(event) => choose(inputs, { ...levels, [variable.id]: event.target.value as MeasurementLevel | "" })}
                />
              ))}
            </div>
          </fieldset>
        )}
        <RadioGroup
          name="da-hypotheses"
          legend={steps.hypothesesLegend}
          hint={steps.hypothesesHint}
          variant="inline"
          options={[
            { value: "", label: steps.noHypotheses },
            { value: "relationship", label: steps.relationship },
            { value: "difference", label: steps.difference },
            { value: "prediction", label: steps.prediction },
          ]}
          value={inputs.hypotheses}
          onChange={(value) => choose({ ...inputs, hypotheses: value })}
        />
        <fieldset className="grid gap-4">
          <legend className="mb-1 text-subheading font-semibold">{steps.onionLegend}</legend>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {ONION.map(([layer, label]) => (
              <div key={layer}>{select(layer, label, optionsFor(layer).map((option) => ({ value: option.id, label: option.name })))}</div>
            ))}
          </div>
        </fieldset>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          {select("design", steps.design, RESEARCH_DESIGNS.map((design) => ({ value: design.id, label: design.name })))}
          {select("technique", steps.technique, SAMPLING_TECHNIQUES.map((technique) => ({ value: technique.id, label: `${technique.name} sampling` })))}
          {select("margin", steps.sampleSize, SAMPLE_OPTIONS, steps.sampleSizeHint)}
        </div>
      </Step>

      <Step id="plan" heading={steps.plan}>
        <p className="text-text-muted">{steps.planIntro}</p>
        <PlanView plan={plan} />
        <div>
          <CopyButton text={analysisPlanText(plan)} subject={steps.copySubject} copyLabel={steps.copyLabel} copiedLabel={steps.copiedLabel} onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
        </div>
      </Step>

      <Step id="guide" heading={steps.guide}>
        {guide}
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
