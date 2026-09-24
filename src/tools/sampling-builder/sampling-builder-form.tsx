"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, SelectField, Tag, TextField, VisuallyHidden } from "@/ui";
import {
  CHECK_STATUS_LABELS,
  EMPTY_SAMPLING_PLAN,
  POPULATION_LABELS,
  RESEARCH_DESIGNS,
  SAMPLING_QUESTIONS,
  SAMPLING_TECHNIQUES,
  answerSamplingQuestion,
  applyDesign,
  applyHypotheses,
  applySampling,
  chooseDesign,
  chooseTechnique,
  consistentTechniques,
  createProjectDraft,
  describeProject,
  EMPTY_DESIGN,
  generateHypotheses,
  getTechnique,
  narrowTechniques,
  optionsFor,
  parseList,
  parseResponseRate,
  removeTechnique,
  samplingComparisonTable,
  samplingPlanText,
  setPlanText,
  setResponseRate,
  shortlistTechnique,
  toProjectHypotheses,
  updatePopulation,
  validateSamplingPlan,
  type DesignId,
  type LayerId,
  type PlanText,
  type PopulationDefinition,
  type SamplingPlan,
  type SamplingQuestionId,
  type SamplingTechniqueId,
} from "@/knowledge/research";
import { announcements, narrowingAnnouncement, responseRateError } from "./announcements";
import { ComparisonView } from "./comparison-view";
import { CompatibilityView, tones } from "./compatibility-view";
import { steps } from "./copy";
import { examplePopulation, exampleProject } from "./example";

type Inputs = Record<"researchQuestion" | "researchObjectives" | "independentVariables" | "dependentVariables" | "philosophy" | "approach" | "choice" | "strategy" | "timeHorizon" | "design", string>;
const emptyInputs: Inputs = { researchQuestion: "", researchObjectives: "", independentVariables: "", dependentVariables: "", philosophy: "", approach: "", choice: "", strategy: "", timeHorizon: "", design: "" };
const ONION_LAYERS: [LayerId & keyof Inputs, string][] = [
  ["philosophy", "Research philosophy"],
  ["approach", "Research approach"],
  ["choice", "Methodological choice"],
  ["strategy", "Research strategy"],
  ["timeHorizon", "Time horizon"],
];
const TEXT_POPULATION = ["targetPopulation", "accessiblePopulation", "samplingFrame", "unitOfAnalysis", "unitOfObservation", "geographicalCoverage", "samplingLocation"] as const;

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
 * The builder: the project it reads, the population, the decision questions, a
 * shortlist, compatibility checks, a comparison, and the researcher's own sampling
 * plan. Every judgement comes from the knowledge layer.
 */
export function SamplingBuilderForm({ guide }: { guide: ReactNode }) {
  const [inputs, setInputs] = useState<Inputs>(emptyInputs);
  const [withHypotheses, setWithHypotheses] = useState(true);
  const [plan, setPlan] = useState<SamplingPlan>(EMPTY_SAMPLING_PLAN);
  const [criteria, setCriteria] = useState({ inclusionCriteria: "", exclusionCriteria: "" });
  const [rateText, setRateText] = useState("");
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
    }
    if (inputs.design) draft = applyDesign(draft, chooseDesign(EMPTY_DESIGN, inputs.design as DesignId));
    return draft;
  }, [inputs, withHypotheses]);

  // Compatibility reads the population from the plan, so checks use the draft with the plan applied.
  const updated = useMemo(() => applySampling(project, plan), [project, plan]);
  const narrowing = useMemo(() => narrowTechniques(plan.answers), [plan.answers]);
  const consistent = useMemo(() => consistentTechniques(plan.answers), [plan.answers]);
  const answered = Object.keys(plan.answers).length;
  const shown = narrowing.filter((entry) => !onlyConsistent || consistent.includes(entry.technique));
  const checks = validateSamplingPlan(plan, updated);
  const rateError = responseRateError(rateText, parseResponseRate);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const add = (id: SamplingTechniqueId) => {
    setPlan(shortlistTechnique(plan, id));
    announce(announcements.added(getTechnique(id).name));
  };
  const answer = (question: SamplingQuestionId, value: string) => {
    const next = answerSamplingQuestion(plan, question, value === "yes" || value === "no" ? value : undefined);
    setPlan(next);
    announce(narrowingAnnouncement(consistentTechniques(next.answers).length, Object.keys(next.answers).length));
  };
  const population = (field: keyof PopulationDefinition, value: string) => setPlan(updatePopulation(plan, { [field]: value }));

  const text = (field: "researchQuestion" | "researchObjectives" | "independentVariables" | "dependentVariables", label: string, hint?: string) => (
    <TextField
      id={`sampling-${field}`}
      label={label}
      hint={hint}
      multiline
      rows={field === "researchQuestion" ? 2 : 3}
      value={inputs[field]}
      onChange={(event) => setInputs((current) => ({ ...current, [field]: event.target.value }))}
    />
  );
  const planText = (field: PlanText, label: string, hint?: string) => (
    <TextField id={`plan-${field}`} label={label} hint={hint} multiline rows={3} value={plan[field]} onChange={(event) => setPlan(setPlanText(plan, field, event.target.value))} />
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
              const { inclusionCriteria, exclusionCriteria, ...rest } = examplePopulation;
              setCriteria({ inclusionCriteria, exclusionCriteria });
              setPlan(updatePopulation(plan, { ...rest, inclusionCriteria: parseList(inclusionCriteria), exclusionCriteria: parseList(exclusionCriteria) }));
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
        <fieldset className="grid gap-4" aria-describedby="sampling-onion-hint">
          <legend className="mb-1 text-subheading font-semibold">{steps.onionHeading}</legend>
          <p id="sampling-onion-hint" className="text-small text-text-muted">
            {steps.onionHint}
          </p>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {ONION_LAYERS.map(([layer, label]) => (
              <SelectField
                key={layer}
                id={`sampling-${layer}`}
                label={label}
                emptyOption={steps.notChosen}
                options={optionsFor(layer).map((option) => ({ value: option.id, label: option.name }))}
                value={inputs[layer]}
                onChange={(event) => setInputs((current) => ({ ...current, [layer]: event.target.value }))}
              />
            ))}
            <SelectField
              id="sampling-design"
              label={steps.design}
              hint={steps.designHint}
              emptyOption={steps.notChosen}
              options={RESEARCH_DESIGNS.map((design) => ({ value: design.id, label: design.name }))}
              value={inputs.design}
              onChange={(event) => setInputs((current) => ({ ...current, design: event.target.value }))}
            />
          </div>
        </fieldset>
        <RadioGroup
          name="sampling-hypotheses"
          legend={steps.hypothesesLegend}
          hint={steps.hypothesesHint}
          variant="inline"
          options={[
            { value: "yes", label: steps.withHypotheses },
            { value: "no", label: steps.withoutHypotheses },
          ]}
          value={withHypotheses ? "yes" : "no"}
          onChange={(value) => setWithHypotheses(value === "yes")}
        />
      </Step>

      <Step id="population" heading={steps.population}>
        <p className="text-text-muted">{steps.populationIntro}</p>
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {TEXT_POPULATION.map((field) => (
            <TextField key={field} id={`population-${field}`} label={POPULATION_LABELS[field]} autoComplete="off" value={plan.population[field]} onChange={(event) => population(field, event.target.value)} />
          ))}
          {(["inclusionCriteria", "exclusionCriteria"] as const).map((field) => (
            <TextField
              key={field}
              id={`population-${field}`}
              label={POPULATION_LABELS[field]}
              hint={steps.criteriaHint}
              multiline
              rows={3}
              value={criteria[field]}
              onChange={(event) => {
                setCriteria((current) => ({ ...current, [field]: event.target.value }));
                setPlan(updatePopulation(plan, { [field]: parseList(event.target.value) }));
              }}
            />
          ))}
        </div>
      </Step>

      <Step id="decision" heading={steps.decision}>
        <p className="text-text-muted">{steps.decisionIntro}</p>
        {SAMPLING_QUESTIONS.map((question) => (
          <RadioGroup
            key={question.id}
            name={`sampling-${question.id}`}
            legend={question.question}
            variant="inline"
            options={[
              { value: "yes", label: steps.yes },
              { value: "no", label: steps.no },
              { value: "unsure", label: steps.unsure },
            ]}
            value={plan.answers[question.id] ?? "unsure"}
            onChange={(value) => answer(question.id, value)}
          />
        ))}
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{steps.relatesHeading}</h3>
          <p>{narrowingAnnouncement(consistent.length, answered)}</p>
          <RadioGroup
            name="sampling-filter"
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
              const technique = getTechnique(entry.technique);
              return (
                <li key={entry.technique} className="grid gap-2 rounded-panel border border-border p-4">
                  <h4 className="font-semibold">{technique.name} sampling</h4>
                  <p className="text-small text-text-muted">{technique.category === "probability" ? "Probability sampling" : "Non-probability sampling"}</p>
                  <p className="text-small">{technique.definition}</p>
                  {answered > 0 && (
                    <ul className="grid gap-1">
                      {[...entry.fits, ...entry.differs].map((judgement) => (
                        <li key={judgement.question} className="flex flex-wrap items-start gap-2 text-small">
                          <Tag tone={judgement.fits ? "info" : "caution"}>{judgement.fits ? steps.fitsTag : steps.differsTag}</Tag> <span>{judgement.explanation}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div>
                    {plan.shortlist.includes(entry.technique) ? (
                      <Tag>{steps.shortlisted}</Tag>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => add(entry.technique)}>
                        {steps.shortlistAdd(technique.name)}
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
        {plan.shortlist.length === 0 ? (
          <p className="text-text-muted">{steps.noShortlist}</p>
        ) : (
          <ul className="grid gap-2">
            {plan.shortlist.map((id) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border p-3">
                <span className="font-medium">{getTechnique(id).name} sampling</span>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setPlan(removeTechnique(plan, id));
                    announce(announcements.removed(getTechnique(id).name));
                  }}
                >
                  {steps.remove(getTechnique(id).name)}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="grid items-end gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (toAdd) add(toAdd as SamplingTechniqueId);
            setToAdd("");
          }}
        >
          <SelectField
            id="sampling-add"
            label={steps.addTechnique}
            emptyOption={steps.choose}
            options={SAMPLING_TECHNIQUES.filter((technique) => !plan.shortlist.includes(technique.id)).map((technique) => ({ value: technique.id, label: `${technique.name} sampling` }))}
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
        {plan.shortlist.length === 0 ? <p className="text-text-muted">{steps.noShortlist}</p> : plan.shortlist.map((id) => <CompatibilityView key={id} id={id} project={updated} />)}
      </Step>

      <Step id="compare" heading={steps.comparison}>
        <p className="text-text-muted">{steps.comparisonIntro}</p>
        {plan.shortlist.length < 2 ? (
          <p className="text-text-muted">{steps.comparisonEmpty}</p>
        ) : (
          <>
            <ComparisonView ids={plan.shortlist} />
            <div>
              <CopyButton
                text={samplingComparisonTable(plan.shortlist)}
                subject={steps.copySubject}
                copyLabel={steps.copyLabel}
                copiedLabel={steps.copiedLabel}
                onResult={(result) => announce(result === "copied" ? announcements.copied("Comparison table") : announcements.copyFailed)}
              />
            </div>
          </>
        )}
      </Step>

      <Step id="plan" heading={steps.plan}>
        <RadioGroup
          name="sampling-chosen"
          legend={steps.chosenLegend}
          hint={steps.chosenHint}
          options={[{ value: "", label: steps.noChoice }, ...plan.shortlist.map((id) => ({ value: id, label: `${getTechnique(id).name} sampling` }))]}
          value={plan.chosen ?? ""}
          onChange={(value) => {
            setPlan(chooseTechnique(plan, (value || null) as SamplingTechniqueId | null));
            announce(announcements.chosen(value ? getTechnique(value as SamplingTechniqueId).name : null));
          }}
        />
        {planText("reason", steps.reason, steps.reasonHint)}
        {planText("selectionProcedure", steps.procedure, steps.procedureHint)}
        <TextField
          id="plan-response-rate"
          label={steps.responseRate}
          hint={steps.responseRateHint}
          inputMode="decimal"
          autoComplete="off"
          value={rateText}
          error={rateError ?? undefined}
          onChange={(event) => {
            setRateText(event.target.value);
            if (!responseRateError(event.target.value, parseResponseRate)) setPlan(setResponseRate(plan, parseResponseRate(event.target.value)));
          }}
        />
        {planText("potentialBiases", steps.biases)}
        {planText("mitigation", steps.mitigation)}
        {planText("notes", steps.notes)}
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
        <div>
          <CopyButton
            text={samplingPlanText(plan)}
            subject={steps.planCopySubject}
            copyLabel={steps.planCopyLabel}
            copiedLabel={steps.planCopiedLabel}
            onResult={(result) => announce(result === "copied" ? announcements.copied("Sampling plan") : announcements.copyFailed)}
          />
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
