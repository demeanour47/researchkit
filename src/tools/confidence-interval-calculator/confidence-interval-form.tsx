"use client";

import { useRef, useState } from "react";
import { Button, Callout, CopyButton, RadioGroup, SelectField, TextField, VisuallyHidden } from "@/ui";
import { CI_METHODS, parseCiMethod, type CiMethod } from "@/knowledge/statistics/confidence-interval";
import { CI_FIELDS, calculateConfidenceInterval, type CiCalculation, type CiFieldId } from "@/knowledge/statistics/confidence-interval-request";
import { announcements, confidenceOptions, display, form, interpretation, methods, reportingSentence, results, working, zeroNote } from "./copy";

type Success = Extract<CiCalculation, { ok: true }>;

const methodOptions = CI_METHODS.map((value) => ({ value, label: methods[value].label }));
const INITIAL: Partial<Record<CiFieldId, string>> = { confidence: "0.95" };
/** Methods whose fields belong to two groups, shown side by side. */
const GROUPED: readonly CiMethod[] = ["two-means", "two-proportions"];

function Result({ calculation }: { calculation: Success }) {
  const copy = methods[calculation.method];
  const shown = display(calculation);
  const report = reportingSentence(calculation);
  const zero = zeroNote(calculation);

  return (
    <section aria-labelledby="ci-result-title" className="grid min-w-0 gap-6 border-t border-border pt-8">
      <h2 id="ci-result-title" className="text-heading font-semibold">
        {results.heading}
      </h2>

      <div className="grid min-w-0 gap-3 rounded-panel border border-action/40 bg-surface p-4">
        <h3 className="text-small text-text-muted">{results.intervalHeading(calculation)}</h3>
        <p className="text-heading font-semibold tabular-nums wrap-anywhere">{shown.interval}</p>
        <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {shown.rows.map(([label, value]) => (
            <div key={label} className="flex min-w-0 flex-wrap justify-between gap-x-3 border-b border-border py-1">
              <dt className="text-text-muted">{label}</dt>
              <dd className="font-medium tabular-nums wrap-anywhere">{value}</dd>
            </div>
          ))}
        </dl>
        {shown.note && <p className="text-small text-text-muted">{shown.note}</p>}
      </div>

      <section aria-labelledby="ci-interpretation-title" className="grid gap-2">
        <h3 id="ci-interpretation-title" className="text-subheading font-semibold">
          {results.interpretationHeading}
        </h3>
        {interpretation(calculation).map((sentence) => (
          <p key={sentence} className="wrap-anywhere">
            {sentence}
          </p>
        ))}
      </section>

      {zero && (
        <Callout tone="info" title={results.includesZeroTitle}>
          {zero}
        </Callout>
      )}

      <section aria-labelledby="ci-reporting-title" className="grid min-w-0 gap-2">
        <h3 id="ci-reporting-title" className="text-subheading font-semibold">
          {results.reportingHeading}
        </h3>
        <p className="text-small text-text-muted">{results.reportingHint}</p>
        <p id="ci-reporting-text" className="rounded-panel border border-border bg-surface p-4 wrap-anywhere">
          {report}
        </p>
        <div>
          <CopyButton text={report} subject={results.copyReporting} selectOnFailure="ci-reporting-text" />
        </div>
      </section>

      <details className="rounded-panel border border-border">
        <summary className="cursor-pointer rounded-panel px-4 py-3 font-semibold focus-ring">{results.assumptionsSummary}</summary>
        <ul className="grid list-disc gap-1 px-4 pb-4 ps-9">
          {copy.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {results.generalLimits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>

      <details className="rounded-panel border border-border">
        <summary className="cursor-pointer rounded-panel px-4 py-3 font-semibold focus-ring">{results.methodSummary}</summary>
        <div className="grid min-w-0 gap-3 px-4 pb-4">
          <p className="wrap-anywhere">{copy.method}</p>
          <dl className="grid min-w-0 gap-2">
            {working(calculation).map((step) => (
              <div key={step.label} className="grid min-w-0 gap-x-4 sm:grid-cols-[12rem_1fr]">
                <dt className="font-medium">{step.label}</dt>
                <dd className="tabular-nums wrap-anywhere">{step.working}</dd>
              </div>
            ))}
          </dl>
          <p className="text-small text-text-muted">Calculations use full precision; the numbers shown are rounded.</p>
        </div>
      </details>
    </section>
  );
}

/** The confidence interval form and its result. Everything runs in the browser. */
export function ConfidenceIntervalForm() {
  const [method, setMethod] = useState<CiMethod>("one-mean");
  const [values, setValues] = useState<Partial<Record<CiFieldId, string>>>(INITIAL);
  const [calculation, setCalculation] = useState<CiCalculation | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const errorSummary = useRef<HTMLDivElement>(null);
  const copy = methods[method];

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 50);
  };
  const set = (field: CiFieldId, value: string) => setValues((current) => ({ ...current, [field]: value }));
  const errors = calculation && !calculation.ok ? calculation.errors : [];
  const errorFor = (field: CiFieldId) => errors.find((error) => error.field === field)?.message;
  const field = (id: CiFieldId) => {
    const text = copy.fields[id];
    if (!text) return null;
    return <TextField key={id} id={`ci-${id}`} label={text.label} hint={text.hint} inputMode="decimal" autoComplete="off" value={values[id] ?? ""} error={errorFor(id)} onChange={(event) => set(id, event.target.value)} />;
  };
  const fields = CI_FIELDS[method];
  const half = fields.length / 2;

  function calculate() {
    const next = calculateConfidenceInterval({ method, values });
    setCalculation(next);
    if (next.ok) announce(announcements.calculated(next));
    else if (next.errors.length > 0) {
      announce(announcements.errors(next.errors.length));
      setTimeout(() => errorSummary.current?.focus(), 0);
    } else announce(results.unstable);
  }

  function reset() {
    setMethod("one-mean");
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
          id="ci-method"
          label={form.methodLabel}
          hint={form.methodHint}
          options={methodOptions}
          value={method}
          onChange={(event) => {
            setMethod(parseCiMethod(event.target.value) ?? "one-mean");
            setCalculation(null);
          }}
        />
        <p className="-mt-3 text-small text-text-muted">{copy.description}</p>

        {GROUPED.includes(method) ? (
          <div className="grid min-w-0 items-start gap-6 sm:grid-cols-2">
            {[fields.slice(0, half), fields.slice(half)].map((group, index) => (
              <fieldset key={index} className="grid min-w-0 gap-4">
                <legend className="mb-2 text-subheading font-semibold">{`Group ${index + 1}`}</legend>
                {group.map(field)}
              </fieldset>
            ))}
          </div>
        ) : (
          <fieldset className="grid min-w-0 gap-4">
            <legend className="mb-2 text-subheading font-semibold">Your sample</legend>
            {fields.map(field)}
          </fieldset>
        )}

        <RadioGroup name="ci-confidence" variant="inline" legend={form.confidenceLegend} hint={form.confidenceHint} options={[...confidenceOptions]} value={values.confidence ?? "0.95"} onChange={(value) => set("confidence", value)} />

        {errors.length > 0 && (
          <div ref={errorSummary} tabIndex={-1} role="alert" className="grid gap-2 rounded-panel border border-danger/40 bg-danger-soft p-4 focus-ring">
            <p className="font-semibold">{form.errorsHeading}</p>
            <ul className="grid list-disc gap-1 ps-6">
              {errors.map((error) => (
                <li key={error.field}>
                  <a href={`#ci-${error.field}`} className="underline">
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
        <Callout tone="caution" title="No interval">
          {results.unstable}
        </Callout>
      )}
      {calculation?.ok && <Result calculation={calculation} />}

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
