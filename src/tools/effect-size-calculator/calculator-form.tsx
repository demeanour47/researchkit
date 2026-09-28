"use client";

import { useState, type ChangeEvent } from "react";
import { Button, SelectField, TextField } from "@/ui";
import { calculateEffectSizeFromText, EFFECT_SIZE_METHODS, type EffectSizeCalculation, type EffectSizeMethodId } from "@/knowledge/research/results/effect-size-calculate";
import { page } from "./copy";

const display = new Intl.NumberFormat("en", { maximumFractionDigits: 4 });

export function CalculatorForm() {
  const [method, setMethod] = useState<EffectSizeMethodId>(EFFECT_SIZE_METHODS[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EffectSizeCalculation | null>(null);
  const selected = EFFECT_SIZE_METHODS.find((entry) => entry.id === method)!;

  const changeMethod = (next: string) => {
    setMethod(next as EffectSizeMethodId);
    setValues({});
    setResult(null);
  };

  return (
    <div className="grid gap-8">
      <section aria-labelledby="effect-input-title" className="grid gap-5 border-t border-border pt-8">
        <h2 id="effect-input-title" className="text-heading font-semibold">Calculate an effect size</h2>
        <SelectField
          id="effect-method"
          label={page.method}
          options={EFFECT_SIZE_METHODS.map((entry) => ({ value: entry.id, label: entry.name }))}
          value={method}
          onChange={(event) => changeMethod(event.target.value)}
        />
        <p className="text-text-muted">{selected.description}</p>
        <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); setResult(calculateEffectSizeFromText(method, values)); }}>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {selected.fields.map((field) => (
              <TextField
                key={`${method}-${field.key}`}
                id={`effect-${field.key}`}
                label={field.label}
                hint={field.hint}
                multiline={field.kind === "counts"}
                inputMode={field.kind === "counts" ? undefined : "decimal"}
                autoComplete="off"
                value={values[field.key] ?? ""}
                onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            ))}
          </div>
          <div><Button type="submit">{page.calculate}</Button></div>
        </form>
      </section>

      {result?.status === "invalid" && (
        <section aria-labelledby="effect-problems-title" role="alert" className="grid gap-2 rounded-panel border border-danger bg-surface p-4">
          <h2 id="effect-problems-title" className="font-semibold">Check these inputs</h2>
          <ul className="grid list-disc gap-1 ps-5">
            {result.problems.map((problem) => <li key={problem}>{problem}</li>)}
          </ul>
        </section>
      )}

      {result?.status === "complete" && (
        <section aria-labelledby="effect-result-title" className="grid gap-5 border-t border-border pt-8">
          <h2 id="effect-result-title" tabIndex={-1} className="text-heading font-semibold focus-ring">{page.result}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.outputs.map((output) => (
              <div key={output.label} className="grid gap-1 rounded-panel border border-border bg-sunken p-4">
                <h3 className="text-small font-semibold">{output.label}</h3>
                <p className="font-mono text-heading tabular-nums">{display.format(output.value)}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <h3 className="font-semibold">{page.formula}</h3>
            <p className="overflow-x-auto rounded-control bg-sunken p-3 font-mono text-small break-words">{result.formula}</p>
          </div>
          <div className="grid gap-2">
            <h3 className="font-semibold">{page.steps}</h3>
            <ol className="grid gap-3">
              {result.steps.map((step, index) => (
                <li key={`${step.label}-${index}`} className="grid gap-1 border-s-2 border-border-strong ps-3">
                  <h4 className="font-medium">{index + 1}. {step.label}</h4>
                  <p className="font-mono text-small break-words">{step.substitution}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">{page.note}</h3>
            <p>{result.note}</p>
          </div>
        </section>
      )}
    </div>
  );
}