"use client";

import { useRef, useState } from "react";
import { Button, Callout, CopyButton, RadioGroup, SelectField, TextField, VisuallyHidden } from "@/ui";
import { dMagnitude, correlationMagnitude, fMagnitude, hMagnitude, type Magnitude } from "@/knowledge/research/results";
import { DESIGNS, DESIGN_INFO, MODES, parseDesign, type Design, type Mode, type Tails } from "@/knowledge/statistics/power";
import { calculatePower, type FieldId, type PowerCalculation } from "@/knowledge/statistics/power-request";
import { announcements, correlationFields, describeEffect, designs, form, formatDetectable, formatPower, meaning, proportionFields, reportingSentence, results } from "./copy";

type Success = Extract<PowerCalculation, { ok: true }>;

const designOptions = DESIGNS.map((value) => ({ value, label: designs[value].label }));
const modeOptions = MODES.map((value) => ({ value, label: form.modes[value] }));
const tailOptions = (["two-sided", "one-sided"] as const).map((value) => ({ value, label: form.tails[value] }));
const INITIAL: Partial<Record<FieldId, string>> = { alpha: "0.05", power: "0.80", r0: "0" };
const card = "grid min-w-0 content-start gap-1 rounded-panel border border-border bg-surface p-4";

/** Cohen's conventional benchmark for the effect, where his conventions apply to the metric. */
function benchmark(calculation: Success): Magnitude | null {
  const effect = calculation.effect;
  if (!effect || calculation.result.kind === "effect") return null;
  if (effect.metric === "d") return dMagnitude(effect.value);
  if (effect.metric === "f") return fMagnitude(effect.value);
  if (effect.metric === "h") return hMagnitude(effect.value);
  if (effect.metric === "r" && effect.nullValue === 0) return correlationMagnitude(effect.value);
  // dz depends on the correlation between paired measures, so Cohen's d conventions don't carry over.
  return null;
}

function Result({ calculation }: { calculation: Success }) {
  const copy = designs[calculation.design];
  const result = calculation.result;
  const report = reportingSentence(calculation);
  const conventional = benchmark(calculation);
  const summary: [string, string][] = [
    [results.analysis, `${copy.label} (${copy.test})`],
    ...(calculation.effect && result.kind !== "effect" ? [[results.effect, describeEffect(calculation.effect)] as [string, string]] : []),
    [results.alpha, String(calculation.alpha)],
    ...(calculation.targetPower !== null ? [[results.targetPower, calculation.targetPower.toFixed(2)] as [string, string]] : []),
    ...(DESIGN_INFO[calculation.design].directional ? [[results.direction, form.tails[calculation.tails]] as [string, string]] : []),
    ...(DESIGN_INFO[calculation.design].hasGroups ? [[results.groups, String(calculation.groups)] as [string, string]] : []),
  ];

  return (
    <section aria-labelledby="power-result-title" className="grid min-w-0 gap-6 border-t border-border pt-8">
      <h2 id="power-result-title" className="text-heading font-semibold">
        {results.heading}
      </h2>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {summary.map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-wrap justify-between gap-x-3 border-b border-border py-1">
            <dt className="text-text-muted">{label}</dt>
            <dd className="font-medium wrap-anywhere">{value}</dd>
          </div>
        ))}
      </dl>

      <div className={`${card} border-action/40`}>
        {result.kind === "sample-size" && (
          <>
            <h3 className="text-small text-text-muted">{results.requiredHeading}</h3>
            <p className="text-heading font-semibold tabular-nums">{result.perGroup !== null ? `${result.total.toLocaleString("en")} in total` : copy.sample.unit(result.total)}</p>
            {result.perGroup !== null && <p className="font-medium tabular-nums">{`${result.perGroup.toLocaleString("en")} per group${calculation.design === "anova" ? `, in each of ${calculation.groups} groups` : ""}`}</p>}
            <p className="text-small text-text-muted">{results.achieved(result.achievedPower)}</p>
          </>
        )}
        {result.kind === "power" && (
          <>
            <h3 className="text-small text-text-muted">{results.powerHeading}</h3>
            <p className="text-heading font-semibold tabular-nums">{formatPower(result.power)}</p>
          </>
        )}
        {result.kind === "effect" && (
          <>
            <h3 className="text-small text-text-muted">{results.effectHeading}</h3>
            <p className="text-heading font-semibold tabular-nums">
              {copy.effect.symbol === "r" ? `r ≈ ${(result.equivalent ?? 0).toFixed(3)}` : `${copy.effect.symbol} = ${formatDetectable(result.effect)}`}
            </p>
            {copy.effect.symbol === "h" && result.equivalent !== null && <p className="font-medium tabular-nums">{`Expected proportion ≈ ${result.equivalent.toFixed(3)}`}</p>}
          </>
        )}
      </div>

      <section aria-labelledby="power-meaning-title" className="grid gap-2">
        <h3 id="power-meaning-title" className="text-subheading font-semibold">
          {results.meaningHeading}
        </h3>
        <p>{meaning(calculation)}</p>
        {result.kind === "sample-size" && <p className="text-small text-text-muted">{results.attrition}</p>}
        {conventional && (
          <p className="text-small text-text-muted">
            <span className="font-medium">{results.effectBenchmark}:</span> {conventional.label} ({conventional.convention.replace(/^Cohen's conventions? for [^:]+: /, "")}). {results.benchmarkNote}
          </p>
        )}
      </section>

      {calculation.warnings.map((warning) => (
        <Callout key={warning} tone={warning === "observed-power" ? "info" : "caution"} title={warning === "observed-power" ? "Planned, not observed, power" : "Small expected counts"}>
          {warning === "observed-power" ? results.observedPower : results.normalApproximation}
        </Callout>
      ))}

      {result.kind === "sample-size" && result.sensitivity.length > 0 && (
        <section aria-labelledby="power-sensitivity-title" className="grid min-w-0 gap-2">
          <h3 id="power-sensitivity-title" className="text-subheading font-semibold">
            {results.sensitivityHeading}
          </h3>
          <table className="w-full max-w-md border-collapse text-small">
            <caption className="sr-only">{results.sensitivityCaption}</caption>
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th scope="col" className="py-2 pe-3 text-start font-medium">
                  Power
                </th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">
                  Total
                </th>
                {result.perGroup !== null && (
                  <th scope="col" className="py-2 text-start font-medium">
                    Per group
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {result.sensitivity.map((row) => (
                <tr key={row.power} className="border-b border-border last:border-b-0">
                  <th scope="row" className="py-2 pe-3 text-start font-medium tabular-nums">
                    {row.power.toFixed(2)}
                  </th>
                  <td className="py-2 pe-3 tabular-nums">{row.total.toLocaleString("en")}</td>
                  {result.perGroup !== null && <td className="py-2 tabular-nums">{row.n.toLocaleString("en")}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {report && (
        <section aria-labelledby="power-reporting-title" className="grid min-w-0 gap-2">
          <h3 id="power-reporting-title" className="text-subheading font-semibold">
            {results.reportingHeading}
          </h3>
          <p className="text-small text-text-muted">{results.reportingHint}</p>
          <p id="power-reporting-text" className="rounded-panel border border-border bg-surface p-4 wrap-anywhere">
            {report}
          </p>
          <div>
            <CopyButton text={report} subject={results.copyReporting} selectOnFailure="power-reporting-text" />
          </div>
        </section>
      )}

      <details className="rounded-panel border border-border">
        <summary className="cursor-pointer rounded-panel px-4 py-3 font-semibold focus-ring">{results.assumptionsSummary}</summary>
        <ul className="grid list-disc gap-1 px-4 pb-4 ps-9">
          {copy.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>The effect size, α and power you entered: the result holds only if they describe your study.</li>
        </ul>
      </details>

      <details className="rounded-panel border border-border">
        <summary className="cursor-pointer rounded-panel px-4 py-3 font-semibold focus-ring">{results.methodSummary}</summary>
        <div className="grid gap-2 px-4 pb-4">
          <p className="wrap-anywhere">{copy.method}</p>
          <p className="text-small text-text-muted wrap-anywhere">{copy.effect.definition}</p>
          <p className="text-small text-text-muted">Required sample sizes are the smallest whole numbers that reach the target power, so they are never rounded down.</p>
        </div>
      </details>
    </section>
  );
}

/** The power analysis form and its result. Everything runs in the browser. */
export function PowerAnalysisForm() {
  const [design, setDesign] = useState<Design>("two-means");
  const [mode, setMode] = useState<Mode>("sample-size");
  const [tails, setTails] = useState<Tails>("two-sided");
  const [values, setValues] = useState<Partial<Record<FieldId, string>>>(INITIAL);
  const [calculation, setCalculation] = useState<PowerCalculation | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const errorSummary = useRef<HTMLDivElement>(null);
  const info = DESIGN_INFO[design];
  const copy = designs[design];

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 50);
  };
  const set = (field: FieldId, value: string) => setValues((current) => ({ ...current, [field]: value }));
  const errors = calculation && !calculation.ok ? calculation.errors : [];
  const errorFor = (field: FieldId) => errors.find((error) => error.field === field)?.message;
  const field = (id: FieldId, label: string, hint: string) => (
    <TextField id={`power-${id}`} label={label} hint={hint} inputMode="decimal" autoComplete="off" value={values[id] ?? ""} error={errorFor(id)} onChange={(event) => set(id, event.target.value)} />
  );

  function calculate() {
    const next = calculatePower({ design, mode, tails, values });
    setCalculation(next);
    if (next.ok) announce(announcements.calculated(next));
    else if (next.errors.length > 0) {
      announce(announcements.errors(next.errors.length));
      setTimeout(() => errorSummary.current?.focus(), 0);
    } else announce(next.failure === "too-large" ? results.tooLarge : results.notReachable);
  }

  function reset() {
    setDesign("two-means");
    setMode("sample-size");
    setTails("two-sided");
    setValues(INITIAL);
    setCalculation(null);
    announce(results.resetDone);
  }

  return (
    <div className="grid min-w-0 gap-8">
      <form
        className="grid min-w-0 gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >
        <SelectField
          id="power-design"
          label={form.designLabel}
          hint={form.designHint}
          options={designOptions}
          value={design}
          onChange={(event) => {
            setDesign(parseDesign(event.target.value) ?? "two-means");
            setCalculation(null);
          }}
        />
        <p className="-mt-3 text-small text-text-muted">
          <span className="font-medium">{copy.test}:</span> {copy.description}
        </p>

        <RadioGroup name="power-mode" legend={form.modeLegend} hint={form.modeHint} options={modeOptions} value={mode} onChange={(value) => { setMode(value); setCalculation(null); }} />

        <fieldset className="grid min-w-0 gap-4">
          <legend className="mb-2 text-subheading font-semibold">Parameters</legend>
          {mode !== "effect" && info.effectInput === "standardized" && field("effect", copy.effect.label, copy.effect.hint)}
          {info.effectInput === "proportions" && (
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {design === "one-proportion" ? field("p0", proportionFields.p0.label, proportionFields.p0.hint) : field("p1", proportionFields.p1.label, proportionFields.p1.hint)}
              {mode !== "effect" && (design === "one-proportion" ? field("p1", proportionFields.p1OneSample.label, proportionFields.p1OneSample.hint) : field("p2", proportionFields.p2.label, proportionFields.p2.hint))}
            </div>
          )}
          {info.effectInput === "correlation" && (
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {mode !== "effect" && field("r", correlationFields.r.label, correlationFields.r.hint)}
              {field("r0", correlationFields.r0.label, correlationFields.r0.hint)}
            </div>
          )}
          {info.hasGroups && field("groups", form.groups, form.groupsHint)}
          {mode !== "sample-size" && field("n", copy.sample.label, copy.sample.hint)}
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {field("alpha", form.alpha, form.alphaHint)}
            {mode !== "power" && field("power", form.power, form.powerHint)}
          </div>
          {info.directional && <RadioGroup name="power-tails" variant="inline" legend={form.tailsLegend} hint={form.tailsHint} options={tailOptions} value={tails} onChange={setTails} />}
        </fieldset>

        {errors.length > 0 && (
          <div ref={errorSummary} tabIndex={-1} role="alert" className="grid gap-2 rounded-panel border border-danger/40 bg-danger-soft p-4 focus-ring">
            <p className="font-semibold">{form.errorsHeading}</p>
            <ul className="grid list-disc gap-1 ps-6">
              {errors.map((error) => (
                <li key={error.field}>
                  <a href={`#power-${error.field}`} className="underline">
                    {error.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{form.calculate}</Button>
          <Button variant="subtle" onClick={reset}>
            {form.reset}
          </Button>
        </div>
      </form>

      {!calculation && <p className="rounded-panel border border-dashed border-border-control p-4 text-text-muted">{results.empty}</p>}
      {calculation && !calculation.ok && calculation.errors.length === 0 && (
        <Callout tone="caution" title="No result">
          {calculation.failure === "too-large" ? results.tooLarge : results.notReachable}
        </Callout>
      )}
      {calculation?.ok && <Result calculation={calculation} />}

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
