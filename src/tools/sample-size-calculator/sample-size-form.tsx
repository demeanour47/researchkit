"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, SelectField, Tag, TextField, VisuallyHidden } from "@/ui";
import { LearnMore } from "@/features/research";
import {
  CHECK_STATUS_LABELS,
  CONFIDENCE_LEVELS,
  EMPTY_DESIGN,
  EMPTY_SAMPLING_PLAN,
  INPUT_INFO,
  MEASUREMENT_LEVELS,
  MEASUREMENT_LEVEL_INFO,
  RESEARCH_DESIGNS,
  SAMPLE_SIZE_METHODS,
  SAMPLING_TECHNIQUES,
  SCENARIO_GROUPS,
  addProjectVariable,
  applyDesign,
  applyHypotheses,
  applySampleSize,
  applySampling,
  applyVariables,
  assumptionsFor,
  calculateSampleSize,
  checkInputs,
  checkSampleSizeCompatibility,
  chooseDesign,
  chooseTechnique,
  createProjectDraft,
  describeProject,
  formatNumber,
  generateHypotheses,
  getSampleSizeMethod,
  inputProblems,
  parseList,
  parseNumber,
  parseResponseRate,
  sampleSizeReport,
  sensitivity,
  setResponseRate,
  suggestedInputs,
  toProjectHypotheses,
  updatePopulation,
  updateVariable,
  type CheckStatus,
  type ConfidenceLevel,
  type DesignId,
  type InputId,
  type MeasurementLevel,
  type ProjectVariable,
  type ResearchProjectDraft,
  type SampleSizeCheck,
  type SampleSizeMethodId,
  type SampleSizePlan,
  type SamplingTechniqueId,
  type Scenario,
} from "@/knowledge/research";
import { announcements, numberError, resultSentence } from "./announcements";
import { steps } from "./copy";
import { exampleInputs, exampleProject } from "./example";

type ProjectInputs = Record<keyof typeof exampleProject, string>;
const emptyProject: ProjectInputs = {
  researchQuestion: "",
  researchObjectives: "",
  independentVariables: "",
  dependentVariables: "",
  outcomeLevel: "",
  design: "",
  technique: "",
  targetPopulation: "",
  samplingFrame: "",
  planResponseRate: "",
};

type NumberInput = keyof typeof exampleInputs;
const emptyNumbers: Record<NumberInput, string> = { populationSize: "", margin: "5", proportion: "50", responseRate: "", designEffect: "1" };
const OPTIONAL: ReadonlySet<NumberInput> = new Set(["responseRate"]);

const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = { aligned: "info", review: "neutral", "worth-checking": "caution", missing: "caution", clarify: "caution" };

/** A number as typed: null when empty, NaN when unreadable, so the knowledge layer's own checks report it. */
function readNumber(text: string): number | null {
  try {
    return parseNumber(text);
  } catch {
    return Number.NaN;
  }
}

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

/** What an input means, when it matters, typical values and its limitations, behind a disclosure. */
function InputHelp({ input }: { input: InputId }) {
  const info = INPUT_INFO[input];
  return (
    <LearnMore label={`${steps.explain}: ${info.label.toLowerCase()}`}>
      <dl className="grid gap-x-6 gap-y-2 text-small sm:grid-cols-[max-content_1fr]">
        {(
          [
            [steps.meaning, info.meaning],
            [steps.whenMatters, info.whenMatters],
            [steps.typicalValues, info.typicalValues],
            [steps.limitations, info.limitations],
          ] as const
        ).map(([term, text]) => (
          <div key={term} className="contents">
            <dt className="font-medium">{term}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </LearnMore>
  );
}

function CheckList({ checks }: { checks: readonly SampleSizeCheck[] }) {
  return (
    <ul className="grid gap-3">
      {checks.map((check) => (
        <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
          </p>
          <p className="text-small">{check.explanation}</p>
          {check.supports.length > 0 && (
            <p className="text-small text-text-muted">
              {steps.supports}: {check.supports.join("; ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/** One group of alternative scenarios. The current one is marked in words, not by colour. */
function ScenarioTable({ caption, scenarios }: { caption: string; scenarios: readonly Scenario[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-start text-small">
        <caption className="mb-2 text-start font-medium">{caption}</caption>
        <thead>
          <tr className="border-b border-border-control">
            {[steps.scenario, steps.required, steps.adjusted, steps.invite].map((heading) => (
              <th key={heading} scope="col" className="px-2 py-2 text-start font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario) => (
            <tr key={scenario.label} className="border-b border-border align-top">
              <th scope="row" className="px-2 py-2 text-start font-medium">
                <span className="flex flex-wrap items-center gap-2">
                  {scenario.label}
                  {scenario.current && <Tag>{steps.yours}</Tag>}
                </span>
              </th>
              <td className="px-2 py-2 tabular-nums">{scenario.required}</td>
              <td className="px-2 py-2 tabular-nums">{scenario.adjusted}</td>
              <td className="px-2 py-2 tabular-nums">{scenario.invite ?? steps.noRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The project draft the calculator reads, built from the details entered in the first step. */
function buildProject(inputs: ProjectInputs, withHypotheses: boolean): ResearchProjectDraft {
  const independent = parseList(inputs.independentVariables);
  const dependent = parseList(inputs.dependentVariables);
  let draft = createProjectDraft({
    researchQuestion: inputs.researchQuestion,
    researchObjectives: parseList(inputs.researchObjectives),
    independentVariables: independent,
    dependentVariables: dependent,
  });
  if (withHypotheses && independent.length > 0 && dependent.length > 0) {
    draft = applyHypotheses(draft, toProjectHypotheses(generateHypotheses(draft, { form: "relationship", direction: "non-directional" }), {}));
  }
  if (independent.length + dependent.length > 0) {
    let variables = independent.reduce<ProjectVariable[]>((list, name) => addProjectVariable(list, name, "independent"), []);
    variables = dependent.reduce((list, name) => addProjectVariable(list, name, "dependent"), variables);
    if (inputs.outcomeLevel) {
      for (const variable of variables.filter((item) => item.variableType === "dependent")) {
        variables = updateVariable(variables, variable.id, { measurementLevel: inputs.outcomeLevel as MeasurementLevel });
      }
    }
    draft = applyVariables(draft, variables);
  }
  if (inputs.design) draft = applyDesign(draft, chooseDesign(EMPTY_DESIGN, inputs.design as DesignId));
  let rate: number | null = null;
  try {
    rate = parseResponseRate(inputs.planResponseRate);
  } catch {
    // An unreadable rate is shown as an error on its field and left out of the plan.
  }
  if (inputs.technique || inputs.targetPopulation || inputs.samplingFrame || rate !== null) {
    let sampling = updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: inputs.targetPopulation, samplingFrame: inputs.samplingFrame });
    if (inputs.technique) sampling = chooseTechnique(sampling, inputs.technique as SamplingTechniqueId);
    draft = applySampling(draft, setResponseRate(sampling, rate));
  }
  return draft;
}

/**
 * The calculator: the project it reads, the method, the assumptions, the result with
 * its full working, the checks, the sensitivity tables and the report. Every number
 * and judgement comes from the knowledge layer.
 */
export function SampleSizeForm({ guide }: { guide: ReactNode }) {
  const [projectInputs, setProjectInputs] = useState<ProjectInputs>(emptyProject);
  const [withHypotheses, setWithHypotheses] = useState(false);
  const [method, setMethod] = useState<SampleSizeMethodId>("cochran");
  const [populationType, setPopulationType] = useState<"finite" | "unknown">("unknown");
  const [confidence, setConfidence] = useState<ConfidenceLevel>(95);
  const [numbers, setNumbers] = useState(emptyNumbers);
  const [justification, setJustification] = useState("");
  const [notes, setNotes] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const project = useMemo(() => buildProject(projectInputs, withHypotheses), [projectInputs, withHypotheses]);
  const plan: SampleSizePlan = useMemo(
    () => ({
      method,
      inputs: {
        populationType,
        populationSize: populationType === "finite" ? readNumber(numbers.populationSize) : null,
        confidence,
        margin: readNumber(numbers.margin) ?? Number.NaN,
        proportion: readNumber(numbers.proportion) ?? Number.NaN,
        responseRate: readNumber(numbers.responseRate),
        designEffect: readNumber(numbers.designEffect) ?? Number.NaN,
      },
      justification,
      notes,
    }),
    [method, populationType, confidence, numbers, justification, notes],
  );
  const updated = useMemo(() => applySampleSize(project, plan), [project, plan]);
  const problems = inputProblems(plan);
  const result = problems.length === 0 ? calculateSampleSize(plan) : null;
  const inputChecks = checkInputs(plan);
  const scenarios = useMemo(() => sensitivity(plan), [plan]);
  const report = sampleSizeReport(plan, updated);
  const suggested = suggestedInputs(updated).responseRate;
  const planRateError = numberError(projectInputs.planResponseRate, parseResponseRate, false);
  const populationProblem = populationType === "unknown" ? problems.find((problem) => problem.input === "populationSize") : undefined;

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const fieldError = (field: NumberInput) => numberError(numbers[field], parseNumber, !OPTIONAL.has(field)) ?? problems.find((problem) => problem.input === field)?.message;
  const setNumber = (field: NumberInput, value: string) => setNumbers((current) => ({ ...current, [field]: value }));
  const setProject = (field: keyof ProjectInputs, value: string) => setProjectInputs((current) => ({ ...current, [field]: value }));

  const projectText = (field: "researchQuestion" | "researchObjectives" | "independentVariables" | "dependentVariables", label: string, hint?: string) => (
    <TextField id={`size-${field}`} label={label} hint={hint} multiline rows={field === "researchQuestion" ? 2 : 3} value={projectInputs[field]} onChange={(event) => setProject(field, event.target.value)} />
  );
  const numberField = (field: NumberInput, label: string, hint?: string) => (
    <TextField id={`size-${field}`} label={label} hint={hint} inputMode="decimal" autoComplete="off" value={numbers[field]} error={fieldError(field)} onChange={(event) => setNumber(field, event.target.value)} />
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
              setProjectInputs({ ...exampleProject });
              setPopulationType("finite");
              setMethod("finite-population-correction");
              setNumbers({ ...exampleInputs });
              announce(steps.exampleLoaded);
            }}
          >
            {steps.example}
          </Button>
        </div>
        {projectText("researchQuestion", steps.question)}
        {projectText("researchObjectives", steps.objectives, steps.perLine)}
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {projectText("independentVariables", steps.independent, steps.perLine)}
          {projectText("dependentVariables", steps.dependent, steps.perLine)}
          <SelectField
            id="size-outcomeLevel"
            label={steps.outcomeLevel}
            hint={steps.outcomeLevelHint}
            emptyOption={steps.notChosen}
            options={MEASUREMENT_LEVELS.map((level) => ({ value: level, label: MEASUREMENT_LEVEL_INFO[level].label }))}
            value={projectInputs.outcomeLevel}
            onChange={(event) => setProject("outcomeLevel", event.target.value)}
          />
          <SelectField
            id="size-design"
            label={steps.design}
            hint={steps.designHint}
            emptyOption={steps.notChosen}
            options={RESEARCH_DESIGNS.map((design) => ({ value: design.id, label: design.name }))}
            value={projectInputs.design}
            onChange={(event) => setProject("design", event.target.value)}
          />
          <SelectField
            id="size-technique"
            label={steps.technique}
            hint={steps.techniqueHint}
            emptyOption={steps.notChosen}
            options={SAMPLING_TECHNIQUES.map((technique) => ({ value: technique.id, label: `${technique.name} sampling` }))}
            value={projectInputs.technique}
            onChange={(event) => setProject("technique", event.target.value)}
          />
          <TextField id="size-targetPopulation" label={steps.targetPopulation} autoComplete="off" value={projectInputs.targetPopulation} onChange={(event) => setProject("targetPopulation", event.target.value)} />
          <TextField id="size-samplingFrame" label={steps.samplingFrame} autoComplete="off" value={projectInputs.samplingFrame} onChange={(event) => setProject("samplingFrame", event.target.value)} />
          <TextField
            id="size-planResponseRate"
            label={steps.planResponseRate}
            inputMode="decimal"
            autoComplete="off"
            value={projectInputs.planResponseRate}
            error={planRateError ?? undefined}
            onChange={(event) => setProject("planResponseRate", event.target.value)}
          />
        </div>
        <RadioGroup
          name="size-hypotheses"
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

      <Step id="method" heading={steps.method}>
        <p className="text-text-muted">{steps.methodIntro}</p>
        <RadioGroup
          name="size-method"
          legend={steps.methodLegend}
          options={SAMPLE_SIZE_METHODS.map((item) => ({
            value: item.id,
            label: (
              <span className="grid gap-1">
                <span>{item.available ? item.name : `${item.name} (${steps.notAvailable})`}</span>
                <span className="text-small font-normal text-text-muted">{item.definition}</span>
              </span>
            ),
          }))}
          value={method}
          onChange={(value) => {
            setMethod(value);
            const next = getSampleSizeMethod(value);
            announce(announcements.methodChosen(next.name, next.available));
          }}
        />
      </Step>

      <Step id="inputs" heading={steps.inputs}>
        <p className="text-text-muted">{steps.inputsIntro}</p>
        <div className="grid gap-3">
          <RadioGroup
            name="size-population"
            legend={steps.populationLegend}
            variant="inline"
            options={[
              { value: "unknown", label: steps.unknown },
              { value: "finite", label: steps.finite },
            ]}
            value={populationType}
            onChange={(value) => {
              setPopulationType(value);
              announce(announcements.populationType(value === "finite"));
            }}
          />
          <InputHelp input={populationType} />
          {populationProblem && <p className="rounded-panel border border-dashed border-foreground/60 p-4">{populationProblem.message}</p>}
        </div>
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {populationType === "finite" && (
            <div className="grid content-start gap-2">
              {numberField("populationSize", steps.populationSize)}
              <InputHelp input="populationSize" />
            </div>
          )}
          <div className="grid content-start gap-2">
            <SelectField
              id="size-confidence"
              label={steps.confidence}
              options={CONFIDENCE_LEVELS.map((level) => ({ value: String(level.level), label: `${level.level}% (z = ${level.z})` }))}
              value={String(confidence)}
              onChange={(event) => setConfidence(Number(event.target.value) as ConfidenceLevel)}
            />
            <InputHelp input="confidence" />
          </div>
          {(
            [
              ["margin", steps.margin],
              ["proportion", steps.proportion],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="grid content-start gap-2">
              {numberField(field, label)}
              <InputHelp input={field} />
            </div>
          ))}
          <div className="grid content-start gap-2">
            {numberField("responseRate", steps.responseRate, steps.responseRateHint)}
            {suggested !== null && suggested !== plan.inputs.responseRate && (
              <div>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setNumber("responseRate", formatNumber(suggested, 2));
                    announce(announcements.rateUsed(formatNumber(suggested, 2)));
                  }}
                >
                  {steps.useSamplingRate(formatNumber(suggested, 2))}
                </Button>
              </div>
            )}
            <InputHelp input="responseRate" />
          </div>
          <div className="grid content-start gap-2">
            {numberField("designEffect", steps.designEffect)}
            <InputHelp input="designEffect" />
          </div>
        </div>
      </Step>

      <Step id="result" heading={steps.result}>
        <p className="text-text-muted">{steps.resultIntro}</p>
        {problems.length > 0 ? (
          <div className="grid gap-2 rounded-panel border border-dashed border-foreground/60 p-4">
            <p className="font-medium">{steps.cannotCalculate}</p>
            <ul className="grid list-disc gap-1 ps-6">
              {problems.map((problem) => (
                <li key={problem.message}>{problem.message}</li>
              ))}
            </ul>
          </div>
        ) : !result?.available ? (
          <p className="rounded-panel border border-dashed border-foreground/60 p-4">{steps.powerNotAvailable}</p>
        ) : (
          <>
            <p className="text-subheading font-semibold">{resultSentence(result)}</p>
            <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
              {[
                [steps.required, String(result.required)],
                [steps.adjusted, String(result.adjusted)],
                [steps.invite, result.invite === null ? steps.noRate : String(result.invite)],
                [steps.expected, result.expectedResponses === null ? steps.noRate : String(result.expectedResponses)],
                ...(result.samplingFraction === null ? [] : [[steps.fraction, `${formatNumber(result.samplingFraction, 1)}%`]]),
              ].map(([term, value]) => (
                <div key={term} className="contents">
                  <dt className="font-medium">{term}</dt>
                  <dd className="tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="grid gap-4">
              <h3 className="text-subheading font-semibold">{steps.workingHeading}</h3>
              <ol className="grid gap-4">
                {result.steps.map((step, index) => (
                  <li key={step.id} className="grid gap-2 rounded-panel border border-border p-4">
                    <h4 className="font-semibold">
                      {index + 1}. {step.label}
                    </h4>
                    <dl className="grid gap-x-6 gap-y-1 text-small sm:grid-cols-[max-content_1fr]">
                      {[
                        [steps.formula, step.formula],
                        [steps.substitution, step.substitution],
                        ...step.intermediate.map((value) => [value.label, value.value]),
                        [steps.unrounded, `${formatNumber(step.value)}, ${steps.usedAs} ${step.rounded}`],
                      ].map(([term, value]) => (
                        <div key={term} className="contents">
                          <dt className="font-medium">{term}</dt>
                          <dd className="font-mono break-words">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-small">{step.explanation}</p>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
        <div className="grid gap-3">
          <h3 className="text-subheading font-semibold">{steps.inputChecks}</h3>
          {inputChecks.length > 0 ? <CheckList checks={inputChecks} /> : <p className="text-text-muted">{steps.noInputChecks}</p>}
        </div>
      </Step>

      <Step id="assumptions" heading={steps.assumptions}>
        <p className="text-text-muted">{steps.assumptionsIntro}</p>
        <ul className="grid gap-3">
          {assumptionsFor(plan, updated).map((assumption) => (
            <li key={assumption.id} className="grid gap-1 border-s-2 border-border ps-4">
              <p>
                <span className="font-medium">{assumption.label}:</span> {assumption.value}
              </p>
              <p className="text-small text-text-muted">
                {steps.source}: {assumption.source}
              </p>
              <p className="text-small">{assumption.explanation}</p>
            </li>
          ))}
        </ul>
      </Step>

      <Step id="fit" heading={steps.compatibility}>
        <p className="text-text-muted">{steps.compatibilityIntro}</p>
        <CheckList checks={checkSampleSizeCompatibility(plan, updated)} />
      </Step>

      <Step id="sensitivity" heading={steps.sensitivity}>
        <p className="text-text-muted">{steps.sensitivityIntro}</p>
        {scenarios.length === 0 ? (
          <p className="text-text-muted">{steps.sensitivityEmpty}</p>
        ) : (
          (Object.keys(SCENARIO_GROUPS) as Scenario["group"][]).map((group) => (
            <ScenarioTable key={group} caption={SCENARIO_GROUPS[group]} scenarios={scenarios.filter((scenario) => scenario.group === group)} />
          ))
        )}
      </Step>

      <Step id="report" heading={steps.justification}>
        <TextField id="size-justification" label={steps.justificationLabel} hint={steps.justificationHint} multiline rows={4} value={justification} onChange={(event) => setJustification(event.target.value)} />
        <TextField id="size-notes" label={steps.notes} multiline rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
        <div>
          <CopyButton
            text={report}
            subject={steps.copySubject}
            copyLabel={steps.copyLabel}
            copiedLabel={steps.copiedLabel}
            onResult={(copyResult) => announce(copyResult === "copied" ? announcements.copied("Sample size report") : announcements.copyFailed)}
          />
        </div>
        <LearnMore label={steps.preview}>
          <pre className="whitespace-pre-wrap break-words font-sans text-small">{report}</pre>
        </LearnMore>
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
