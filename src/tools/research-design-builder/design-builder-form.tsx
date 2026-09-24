"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, SelectField, Tag, TextField, VisuallyHidden } from "@/ui";
import {
  CHECK_STATUS_LABELS,
  DECISION_QUESTIONS,
  DECISION_UNSURE,
  EMPTY_DESIGN,
  RESEARCH_DESIGNS,
  answerQuestion,
  applyDesign,
  applyFramework,
  applyHypotheses,
  chooseDesign,
  comparisonTable,
  consistentDesigns,
  createProjectDraft,
  describeProject,
  frameworkFromProject,
  generateHypotheses,
  getDesign,
  narrowDesigns,
  optionsFor,
  parseList,
  removeDesign,
  setDesignNotes,
  setJustification,
  shortlistDesign,
  toProjectHypotheses,
  validateDesign,
  type DecisionQuestionId,
  type DesignId,
  type LayerId,
  type ResearchDesignRecord,
} from "@/knowledge/research";
import { announcements, narrowingAnnouncement } from "./announcements";
import { ComparisonView } from "./comparison-view";
import { CompatibilityView, tones } from "./compatibility-view";
import { steps } from "./copy";
import { exampleProject } from "./example";

type Inputs = Record<"researchQuestion" | "researchObjectives" | "independentVariables" | "dependentVariables" | "philosophy" | "approach" | "choice" | "strategy" | "timeHorizon", string>;
const emptyInputs: Inputs = { researchQuestion: "", researchObjectives: "", independentVariables: "", dependentVariables: "", philosophy: "", approach: "", choice: "", strategy: "", timeHorizon: "" };
const ONION_LAYERS: [keyof Inputs & LayerId, string][] = [
  ["philosophy", "Research philosophy"],
  ["approach", "Research approach"],
  ["choice", "Methodological choice"],
  ["strategy", "Research strategy"],
  ["timeHorizon", "Time horizon"],
];

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
 * The builder: the project it reads, the decision questions, a shortlist, compatibility
 * checks, a comparison, the researcher's own choice and justification, and the updated
 * project draft. Every judgement comes from the knowledge layer.
 */
export function DesignBuilderForm({ guide }: { guide: ReactNode }) {
  const [inputs, setInputs] = useState<Inputs>(emptyInputs);
  const [withHypotheses, setWithHypotheses] = useState(true);
  const [record, setRecord] = useState<ResearchDesignRecord>(EMPTY_DESIGN);
  const [onlyConsistent, setOnlyConsistent] = useState(false);
  const [toAdd, setToAdd] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const project = useMemo(() => {
    let draft = createProjectDraft({
      researchQuestion: inputs.researchQuestion,
      researchObjectives: parseList(inputs.researchObjectives),
      independentVariables: parseList(inputs.independentVariables),
      dependentVariables: parseList(inputs.dependentVariables),
      researchOnionSelection: Object.fromEntries(ONION_LAYERS.map(([layer]) => [layer, inputs[layer] || undefined])),
    });
    if (withHypotheses && (draft.independentVariables?.length ?? 0) > 0 && (draft.dependentVariables?.length ?? 0) > 0) {
      draft = applyHypotheses(draft, toProjectHypotheses(generateHypotheses(draft, { form: "relationship", direction: "non-directional" }), {}));
      draft = applyFramework(draft, frameworkFromProject(draft));
    }
    return draft;
  }, [inputs, withHypotheses]);

  const narrowing = useMemo(() => narrowDesigns(record.answers), [record.answers]);
  const consistent = useMemo(() => consistentDesigns(record.answers), [record.answers]);
  const answered = Object.keys(record.answers).length;
  const shown = narrowing.filter((entry) => !onlyConsistent || consistent.includes(entry.design));
  const updated = useMemo(() => applyDesign(project, record), [project, record]);
  const checks = validateDesign(record, project);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const add = (id: DesignId) => {
    setRecord(shortlistDesign(record, id));
    announce(announcements.added(getDesign(id).name));
  };
  const answer = (question: DecisionQuestionId, value: string) => {
    const next = answerQuestion(record, question, value);
    setRecord(next);
    announce(narrowingAnnouncement(consistentDesigns(next.answers).length, Object.keys(next.answers).length));
  };

  const text = (field: "researchQuestion" | "researchObjectives" | "independentVariables" | "dependentVariables", label: string, hint?: string) => (
    <TextField
      id={`design-${field}`}
      label={label}
      hint={hint}
      multiline
      rows={field === "researchQuestion" ? 2 : 3}
      value={inputs[field]}
      onChange={(event) => setInputs((current) => ({ ...current, [field]: event.target.value }))}
    />
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
              setInputs({ ...exampleProject });
              announce(steps.exampleLoaded);
            }}
          >
            {steps.example}
          </Button>
        </div>
        {text("researchQuestion", steps.question)}
        {text("researchObjectives", steps.objectives, steps.perLine)}
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {text("independentVariables", steps.independent, steps.perLine)}
          {text("dependentVariables", steps.dependent, steps.perLine)}
        </div>
        <fieldset className="grid gap-4" aria-describedby="onion-hint">
          <legend className="mb-1 text-subheading font-semibold">{steps.onionHeading}</legend>
          <p id="onion-hint" className="text-small text-text-muted">
            {steps.onionHint}
          </p>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {ONION_LAYERS.map(([layer, label]) => (
              <SelectField
                key={layer}
                id={`design-${layer}`}
                label={label}
                emptyOption={steps.notChosen}
                options={optionsFor(layer).map((option) => ({ value: option.id, label: option.name }))}
                value={inputs[layer]}
                onChange={(event) => setInputs((current) => ({ ...current, [layer]: event.target.value }))}
              />
            ))}
          </div>
        </fieldset>
        <RadioGroup
          name="design-hypotheses"
          legend={steps.hypothesesLegend}
          hint={steps.hypothesesHint}
          options={[
            { value: "yes", label: steps.withHypotheses },
            { value: "no", label: steps.withoutHypotheses },
          ]}
          value={withHypotheses ? "yes" : "no"}
          onChange={(value) => setWithHypotheses(value === "yes")}
        />
      </Step>

      <Step id="decision" heading={steps.decision}>
        <p className="text-text-muted">{steps.decisionIntro}</p>
        {DECISION_QUESTIONS.map((question) => (
          <RadioGroup
            key={question.id}
            name={`decision-${question.id}`}
            legend={question.question}
            variant="inline"
            options={[...question.options.map((option) => ({ value: option.value, label: option.label })), { value: DECISION_UNSURE, label: steps.unsure }]}
            value={record.answers[question.id] ?? DECISION_UNSURE}
            onChange={(value) => answer(question.id, value)}
          />
        ))}
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{steps.relatesHeading}</h3>
          <p aria-live="off">{narrowingAnnouncement(consistent.length, answered)}</p>
          <RadioGroup
            name="design-filter"
            legend={steps.filterLegend}
            variant="inline"
            options={[
              { value: "all", label: steps.showAll },
              { value: "consistent", label: steps.showConsistent },
            ]}
            value={onlyConsistent ? "consistent" : "all"}
            onChange={(value) => setOnlyConsistent(value === "consistent")}
          />
          {onlyConsistent && consistent.length === 0 && <p>{steps.noneConsistent}</p>}
          <ul className="grid gap-3">
            {shown.map((entry) => {
              const design = getDesign(entry.design);
              return (
                <li key={entry.design} className="grid gap-2 rounded-panel border border-border p-4">
                  <h4 className="font-semibold">{design.name}</h4>
                  <p className="text-small">{design.definition}</p>
                  {answered === 0 ? null : (
                    <ul className="grid gap-1">
                      {[...entry.fits, ...entry.differs].map((judgement) => (
                        <li key={judgement.question} className="flex flex-wrap items-start gap-2 text-small">
                          <Tag tone={judgement.fits ? "info" : "caution"}>{judgement.fits ? steps.fitsTag : steps.differsTag}</Tag>{" "}
                          <span>{judgement.explanation}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div>
                    {record.shortlist.includes(entry.design) ? (
                      <Tag>{steps.shortlisted}</Tag>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => add(entry.design)}>
                        {steps.shortlistAdd(design.name)}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Step>

      <Step id="shortlist" heading={steps.shortlist}>
        <p className="text-text-muted">{steps.shortlistIntro}</p>
        {record.shortlist.length === 0 ? (
          <p className="text-text-muted">{steps.noShortlist}</p>
        ) : (
          <ul className="grid gap-2">
            {record.shortlist.map((id) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border p-3">
                <span className="font-medium">{getDesign(id).name}</span>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setRecord(removeDesign(record, id));
                    announce(announcements.removed(getDesign(id).name));
                  }}
                >
                  {steps.remove(getDesign(id).name)}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="grid items-end gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (toAdd) add(toAdd as DesignId);
            setToAdd("");
          }}
        >
          <SelectField
            id="design-add"
            label={steps.addDesign}
            emptyOption={steps.choose}
            options={RESEARCH_DESIGNS.filter((design) => !record.shortlist.includes(design.id)).map((design) => ({ value: design.id, label: design.name }))}
            value={toAdd}
            onChange={(event) => setToAdd(event.target.value)}
          />
          <Button type="submit" variant="secondary">
            {steps.add}
          </Button>
        </form>
      </Step>

      <Step id="fit" heading={steps.compatibility}>
        <p className="text-text-muted">{steps.compatibilityIntro}</p>
        {record.shortlist.length === 0 ? (
          <p className="text-text-muted">{steps.noShortlist}</p>
        ) : (
          record.shortlist.map((id) => <CompatibilityView key={id} id={id} project={project} />)
        )}
      </Step>

      <Step id="compare" heading={steps.comparison}>
        <p className="text-text-muted">{steps.comparisonIntro}</p>
        {record.shortlist.length < 2 ? (
          <p className="text-text-muted">{steps.comparisonEmpty}</p>
        ) : (
          <>
            <ComparisonView ids={record.shortlist} />
            <div>
              <CopyButton text={comparisonTable(record.shortlist)} subject={steps.copySubject} copyLabel={steps.copyLabel} copiedLabel={steps.copiedLabel} onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
            </div>
          </>
        )}
      </Step>

      <Step id="justify" heading={steps.justification}>
        <RadioGroup
          name="design-chosen"
          legend={steps.chosenLegend}
          hint={steps.chosenHint}
          options={[{ value: "", label: steps.noChoice }, ...record.shortlist.map((id) => ({ value: id, label: getDesign(id).name }))]}
          value={record.chosen ?? ""}
          onChange={(value) => {
            setRecord(chooseDesign(record, (value || null) as DesignId | null));
            announce(announcements.chosen(value ? getDesign(value as DesignId).name : null));
          }}
        />
        <TextField id="design-justification" label={steps.justificationLabel} hint={steps.justificationHint} multiline rows={6} value={record.justification} onChange={(event) => setRecord(setJustification(record, event.target.value))} />
        <TextField id="design-notes" label={steps.notesLabel} multiline rows={3} value={record.notes} onChange={(event) => setRecord(setDesignNotes(record, event.target.value))} />
        <div className="grid gap-3">
          <h3 className="text-subheading font-semibold">{steps.checks}</h3>
          <ul className="grid gap-3">
            {checks.map((check) => (
              <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
                </p>
                <p className="text-small text-text-muted">{check.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      </Step>

      <Step id="draft" heading={steps.projectDraft}>
        <p className="text-text-muted">{steps.projectDraftIntro}</p>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {describeProject(updated).map((row) => (
            <div key={row.field} className="contents">
              <dt className="font-medium">{row.label}</dt>
              <dd className="break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
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

