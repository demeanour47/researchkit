"use client";

import { useState } from "react";
import { SelectField } from "@/ui";
import { compareStudies, FIELD_INFO, studyLabel, type Matrix } from "@/knowledge/literature";
import { steps } from "./copy";

/** Two studies side by side, column by column, with what they share. */
export function ComparePanel({ matrix }: { matrix: Matrix }) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const a = matrix.find((study) => study.id === first);
  const b = matrix.find((study) => study.id === second);
  const options = matrix.map((study) => ({ value: study.id, label: studyLabel(study) }));
  const comparison = a && b ? compareStudies(a, b) : null;
  const shared = (items: readonly string[]) => (items.length > 0 ? items.join(", ") : steps.nothingShared);
  return (
    <div className="grid gap-4">
      <p className="text-text-muted">{steps.compareIntro}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label={steps.first} emptyOption={steps.choose} options={options} value={a ? first : ""} onChange={(event) => setFirst(event.target.value)} />
        <SelectField label={steps.second} emptyOption={steps.choose} options={options} value={b ? second : ""} onChange={(event) => setSecond(event.target.value)} />
      </div>
      {a && b && comparison && (
        <>
          <dl className="grid gap-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
            <dt className="font-medium">{`${steps.shared}: ${steps.sharedVariables}`}</dt>
            <dd>{shared(comparison.sharedVariables)}</dd>
            <dt className="font-medium">{`${steps.shared}: ${steps.sharedMethods}`}</dt>
            <dd>{shared(comparison.sharedMethods)}</dd>
            <dt className="font-medium">{`${steps.shared}: ${steps.sharedTheories}`}</dt>
            <dd>{shared(comparison.sharedTheories)}</dd>
          </dl>
          <div role="region" aria-labelledby="comparison-caption" tabIndex={0} className="overflow-x-auto rounded-panel border border-border focus-ring">
            <table className="min-w-full border-collapse text-small">
              <caption id="comparison-caption" className="p-3 text-start font-medium">{`${steps.comparison}: ${studyLabel(a)} and ${studyLabel(b)}`}</caption>
              <thead>
                <tr className="border-b border-border bg-sunken">
                  <th scope="col" className="px-3 py-2 text-start">{steps.column}</th>
                  <th scope="col" className="min-w-56 px-3 py-2 text-start">{studyLabel(a)}</th>
                  <th scope="col" className="min-w-56 px-3 py-2 text-start">{studyLabel(b)}</th>
                  <th scope="col" className="px-3 py-2 text-start">{steps.comparison}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows
                  .filter((row) => row.a || row.b)
                  .map((row) => (
                    <tr key={row.field} className="border-b border-border align-top">
                      <th scope="row" className="px-3 py-2 text-start font-medium">{FIELD_INFO[row.field].label}</th>
                      <td className="whitespace-pre-line px-3 py-2">{row.a}</td>
                      <td className="whitespace-pre-line px-3 py-2">{row.b}</td>
                      <td className="px-3 py-2">{steps.relations[row.relation]}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
