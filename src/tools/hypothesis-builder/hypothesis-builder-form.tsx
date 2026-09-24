"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CopyButton, RadioGroup, VisuallyHidden, type CopyResult } from "@/ui";
import {
  DIRECTIONS,
  DIRECTION_LABELS,
  HYPOTHESIS_FORMS,
  applyHypotheses,
  createProjectDraft,
  describeDirection,
  describeProject,
  evaluateHypotheses,
  generateHypotheses,
  hypothesesText,
  parseList,
  toProjectHypotheses,
  type Direction,
  type HypothesisEdits,
  type HypothesisForm,
  type MethodologyId,
} from "@/knowledge/research";
import { announcements, evaluationAnnouncement } from "./announcements";
import { steps } from "./copy";
import { HypothesisEvaluationView } from "./hypothesis-evaluation";
import { HypothesisPairs } from "./hypothesis-pairs";
import { Field, VariableInputs, emptyInput, type HypothesisInput } from "./project-inputs";

/** How long typing must pause before the evaluation summary is announced. */
const ANNOUNCE_AFTER_MS = 1200;

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

/**
 * The builder: the project details it reads, the hypothesis type, editable drafts,
 * their evaluation and the updated project draft. All academic logic comes from the
 * knowledge layer; this component only holds what the researcher typed.
 */
export function HypothesisBuilderForm({ typeGuide }: { typeGuide: ReactNode }) {
  const [input, setInput] = useState<HypothesisInput>(emptyInput);
  const [form, setForm] = useState<HypothesisForm>("relationship");
  const [direction, setDirection] = useState<Direction>("non-directional");
  const [edits, setEdits] = useState<HypothesisEdits>({});
  const [announcement, setAnnouncement] = useState("");
  const changed = useRef(false);

  const change = (changes: Partial<HypothesisInput>) => {
    changed.current = true;
    setInput((current) => ({ ...current, ...changes }));
  };

  const project = useMemo(
    () =>
      createProjectDraft({
        researchQuestion: input.researchQuestion,
        researchAim: input.researchAim,
        researchObjectives: parseList(input.researchObjectives),
        independentVariables: parseList(input.independentVariables),
        dependentVariables: parseList(input.dependentVariables),
        moderatorVariables: parseList(input.moderatorVariables),
        mediatorVariables: parseList(input.mediatorVariables),
        controlVariables: parseList(input.controlVariables),
        population: input.population,
        location: input.location,
        timeContext: input.timeContext,
        methodology: (input.methodology || undefined) as MethodologyId | undefined,
        researchOnionSelection: { philosophy: input.philosophy || undefined, approach: input.approach || undefined },
      }),
    [input],
  );
  const set = useMemo(() => generateHypotheses(project, { form, direction }), [project, form, direction]);
  const evaluation = useMemo(() => evaluateHypotheses(set, edits, project), [set, edits, project]);
  const updated = useMemo(() => applyHypotheses(project, toProjectHypotheses(set, edits)), [project, set, edits]);

  const summary = evaluationAnnouncement(evaluation.pairs.flatMap((pair) => pair.checks.map((check) => check.status)));
  useEffect(() => {
    if (!changed.current || !summary) return;
    const timer = setTimeout(() => setAnnouncement(summary), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [summary]);

  const chooseForm = (next: HypothesisForm) => {
    setForm(next);
    setAnnouncement(announcements.drafted(next, direction, generateHypotheses(project, { form: next, direction }).pairs.length));
  };
  const chooseDirection = (next: Direction) => {
    setDirection(next);
    setAnnouncement(announcements.drafted(form, next, set.pairs.length));
  };
  const edit = (id: string, text: string) => {
    changed.current = true;
    setEdits((current) => ({ ...current, [id]: text }));
  };
  const reset = (pairId: string, label: string) => {
    setEdits((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !id.startsWith(`${pairId}-`))));
    setAnnouncement(announcements.restored(label));
  };
  const copied = (subject: string, result: CopyResult) =>
    setAnnouncement(result === "copied" ? announcements.copied(subject) : announcements.copyFailed(subject));

  const field = (name: keyof HypothesisInput, label: string, hint: string, multiline = false) => (
    <Field field={name} label={label} hint={hint} input={input} onChange={change} multiline={multiline} />
  );

  return (
    <div className="grid gap-10">
      <Step id="question" heading={steps.question}>
        {field("researchQuestion", steps.questionLabel, steps.questionHint, true)}
        {field("researchAim", steps.aimLabel, steps.aimHint, true)}
      </Step>

      <Step id="objectives" heading={steps.objectives}>
        {field("researchObjectives", steps.objectivesLabel, steps.objectivesHint, true)}
      </Step>

      <Step id="variables" heading={steps.variables}>
        <p className="text-text-muted">{steps.variablesIntro}</p>
        <VariableInputs input={input} onChange={change} />
      </Step>

      <Step id="type" heading={steps.type}>
        <p className="text-text-muted">{steps.typeIntro}</p>
        {typeGuide}
        <RadioGroup
          name="hypothesis-form"
          legend={steps.formLegend}
          options={HYPOTHESIS_FORMS.map((value) => ({ value, label: steps.forms[value] }))}
          value={form}
          onChange={chooseForm}
        />
        <RadioGroup
          name="hypothesis-direction"
          legend={steps.directionLegend}
          hint={steps.directionHint}
          options={DIRECTIONS.map((value) => ({ value, label: DIRECTION_LABELS[value] }))}
          value={direction}
          onChange={chooseDirection}
        />
        <p className="rounded-panel border border-border bg-surface p-4">{describeDirection(form, direction)}</p>
      </Step>

      <Step id="drafts" heading={steps.drafts}>
        <p className="text-text-muted">{steps.draftsIntro}</p>
        <p className="text-small text-text-muted">{set.explanation}</p>
        <div>
          <CopyButton
            text={hypothesesText(set, edits)}
            subject={steps.copyAllSubject}
            copyLabel={steps.copyAllLabel}
            copiedLabel={steps.copiedAllLabel}
            onResult={(result) => copied(steps.copyAll, result)}
          />
        </div>
        <HypothesisPairs set={set} edits={edits} onEdit={edit} onReset={reset} onCopy={copied} />
      </Step>

      <Step id="evaluation" heading={steps.evaluation}>
        <HypothesisEvaluationView set={set} evaluation={evaluation} />
      </Step>

      <Step id="project" heading={steps.project}>
        <p className="text-text-muted">{steps.projectIntro}</p>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {describeProject(updated).map((row) => (
            <div key={row.field} className="contents">
              <dt className="font-medium">{row.label}</dt>
              <dd className="break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
