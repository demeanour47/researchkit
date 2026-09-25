"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, SelectField, TextField, VisuallyHidden } from "@/ui";
import { ProjectFields } from "@/features/research";
import {
  EMPTY_TYPED_PROJECT,
  RESULT_KINDS,
  SIGNIFICANCE_LEVELS,
  getAnalysisMethod,
  getFields,
  interpretResult,
  interpretationText,
  formatAlpha,
  levelPercent,
  projectFromTyped,
  resultProblems,
  questionnaireVariables,
  type MeasurementLevel,
  type ResultInterpretation,
  type ResultKind,
  type SignificanceLevel,
  type TypedProject,
} from "@/knowledge/research";
import { announcements, interpretedAnnouncement, problemsAnnouncement } from "./announcements";
import { steps } from "./copy";
import { exampleLevels, exampleProject, exampleResult } from "./example";
import { InterpretationView } from "./interpretation-view";
import { resultFromEntries, type ResultEntries } from "./result-input";

/** Option labels are cut at a word so long hypotheses don't stretch the page; the full wording appears in the interpretation. */
const shorten = (text: string, length = 80) => (text.length <= length ? text : `${text.slice(0, text.lastIndexOf(" ", length))}…`);
const SINGLE_VARIABLE = new Set<ResultKind>(["descriptive-statistics", "frequency", "percentage", "mean", "median", "standard-deviation", "cronbach-alpha", "factor-analysis"]);

function Step({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-border pt-8">
      <h2 id={`${id}-title`} tabIndex={-1} className="text-heading font-semibold focus-ring">
        {heading}
      </h2>
      {children}
    </section>
  );
}

/** The project, a result's numbers, and the interpretation of what was last submitted. */
export function InterpretationForm({ guide }: { guide: ReactNode }) {
  const [project, setProject] = useState<TypedProject>(EMPTY_TYPED_PROJECT);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [entries, setEntries] = useState<ResultEntries>({ kind: "pearson", texts: {}, variables: ["", ""], hypothesisId: "", alpha: 0.05 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{ interpretation: ResultInterpretation; entries: ResultEntries; project: TypedProject } | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const draft = useMemo(() => projectFromTyped(project, levels), [project, levels]);
  const variables = useMemo(() => questionnaireVariables(draft), [draft]);
  const hypotheses = (draft.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative");
  const fields = getFields(entries.kind);
  const single = SINGLE_VARIABLE.has(entries.kind);
  const stale = submitted !== null && (JSON.stringify(submitted.entries) !== JSON.stringify(entries) || JSON.stringify(submitted.project) !== JSON.stringify(project));

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const focusLater = (id: string) => setTimeout(() => document.getElementById(id)?.focus(), 60);
  const update = (changes: Partial<ResultEntries>) => setEntries((current) => ({ ...current, ...changes }));

  const interpret = (current: ResultEntries, currentProject: TypedProject, currentLevels: Record<string, MeasurementLevel | "">) => {
    const { input, unreadable } = resultFromEntries(SINGLE_VARIABLE.has(current.kind) ? { ...current, variables: current.variables.slice(0, 1) } : current);
    // Unreadable text is reported with every other problem, so all can be fixed at once.
    const unreadableFields = new Set(unreadable.map((problem) => problem.field));
    const outcome = unreadable.length > 0 ? { ok: false as const, problems: [...unreadable, ...resultProblems(input).filter((problem) => !unreadableFields.has(problem.field ?? ""))] } : interpretResult(input, projectFromTyped(currentProject, currentLevels));
    if (!outcome.ok) {
      setErrors(Object.fromEntries(outcome.problems.map((problem) => [problem.field ?? "", problem.message])));
      announce(problemsAnnouncement(outcome.problems.map((problem) => problem.message)));
      const first = outcome.problems[0]?.field;
      if (first) focusLater(`result-${first}`);
      return;
    }
    setErrors({});
    setSubmitted({ interpretation: outcome.interpretation, entries: current, project: currentProject });
    announce(interpretedAnnouncement(outcome.interpretation, current.alpha));
    focusLater("interpretation-title");
  };

  return (
    <div className="grid gap-10">
      <Step id="project" heading={steps.project}>
        <p className="text-text-muted">{steps.projectIntro}</p>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const next: ResultEntries = { kind: exampleResult.kind, texts: { ...exampleResult.values }, variables: [...exampleResult.variables], hypothesisId: "", alpha: 0.05 };
              setProject({ ...exampleProject });
              setLevels({ ...exampleLevels });
              setEntries(next);
              announce(steps.exampleLoaded);
              setTimeout(() => interpret(next, exampleProject, { ...exampleLevels }), 90);
            }}
          >
            {steps.example}
          </Button>
        </div>
        <ProjectFields prefix="ri" value={project} levels={levels} onType={(field, text) => setProject((current) => ({ ...current, [field]: text }))} onChoose={(value, nextLevels) => {
          setProject(value);
          setLevels(nextLevels);
        }} />
      </Step>

      <Step id="result" heading={steps.result}>
        <p className="text-text-muted">{steps.resultIntro}</p>
        <form
          className="grid gap-6"
          noValidate
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            interpret(entries, project, levels);
          }}
        >
          <SelectField
            id="result-kind"
            label={steps.kind}
            options={RESULT_KINDS.map((kind) => ({ value: kind, label: getAnalysisMethod(kind).name }))}
            value={entries.kind}
            onChange={(event) => {
              update({ kind: event.target.value as ResultKind });
              setErrors({});
            }}
          />
          <fieldset className="grid gap-4" aria-describedby="result-numbers-hint">
            <legend className="mb-1 text-subheading font-semibold">{steps.numbers}</legend>
            <p id="result-numbers-hint" className="text-small text-text-muted">
              {steps.numbersHint}
            </p>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <TextField
                  key={`${entries.kind}-${field.key}`}
                  id={`result-${field.key}`}
                  label={`${field.label} (${field.symbol})${field.required ? `, ${steps.required}` : ""}`}
                  hint={field.hint}
                  inputMode="decimal"
                  autoComplete="off"
                  required={field.required}
                  value={entries.texts[field.key] ?? ""}
                  error={errors[field.key]}
                  onChange={(event) => update({ texts: { ...entries.texts, [field.key]: event.target.value } })}
                />
              ))}
            </div>
          </fieldset>
          <div className="grid items-start gap-4 sm:grid-cols-2 [&>*]:min-w-0">
            {(single ? [0] : [0, 1]).map((index) => (
              <SelectField
                key={index}
                id={`result-variable-${index}`}
                label={single ? steps.singleVariable : index === 0 ? steps.firstVariable : steps.secondVariable}
                emptyOption={steps.noVariable}
                options={variables.map((variable) => ({ value: variable.name, label: variable.name }))}
                value={entries.variables[index] ?? ""}
                onChange={(event) => update({ variables: entries.variables.map((name, at) => (at === index ? event.target.value : name)) })}
              />
            ))}
            {!single && (
              <SelectField
                id="result-hypothesis"
                label={steps.hypothesis}
                emptyOption={steps.hypothesisAuto}
                options={hypotheses.map((hypothesis, index) => ({ value: hypothesis.id, label: shorten(`Hypothesis ${index + 1}: ${hypothesis.text}`) }))}
                value={entries.hypothesisId}
                onChange={(event) => update({ hypothesisId: event.target.value })}
              />
            )}
          </div>
          <RadioGroup
            name="result-alpha"
            legend={steps.alphaLegend}
            variant="inline"
            options={SIGNIFICANCE_LEVELS.map((level) => ({ value: String(level), label: `${levelPercent(level)} (${formatAlpha(level)})` }))}
            value={String(entries.alpha)}
            onChange={(value) => update({ alpha: Number(value) as SignificanceLevel })}
          />
          <div>
            <Button type="submit">{steps.interpret}</Button>
          </div>
        </form>
      </Step>

      {submitted && (
        <section aria-labelledby="interpretation-title" className="grid gap-6 border-t border-border pt-8">
          <h2 id="interpretation-title" tabIndex={-1} className="text-heading font-semibold focus-ring">
            {`${steps.interpretation}: ${submitted.interpretation.name}`}
          </h2>
          {stale && <p className="rounded-panel border border-dashed border-foreground/60 p-4">{steps.stale}</p>}
          <InterpretationView interpretation={submitted.interpretation} />
          <div>
            <CopyButton text={interpretationText(submitted.interpretation)} subject={steps.copySubject} copyLabel={steps.copyLabel} copiedLabel={steps.copiedLabel} onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
          </div>
        </section>
      )}

      <Step id="guide" heading={steps.guide}>
        {guide}
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
