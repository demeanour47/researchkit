import type { ReactNode } from "react";
import { Tag } from "@/ui";
import { HYPOTHESIS_STATUS_LABELS, type HypothesisStatus, type ResultInterpretation, type SignificanceStatus } from "@/knowledge/research";
import { steps } from "./copy";

const significanceTone: Record<SignificanceStatus, "info" | "neutral" | "caution"> = { significant: "info", "not-significant": "neutral", "no-test": "neutral" };
const hypothesisTone: Record<HypothesisStatus, "info" | "neutral" | "caution"> = { supported: "info", "not-supported": "neutral", opposite: "caution", "not-tested": "neutral", unlinked: "neutral" };
const significanceLabel: Record<SignificanceStatus, string> = { significant: "Statistically significant", "not-significant": "Not statistically significant", "no-test": "No significance test" };

function Part({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-subheading font-semibold">{heading}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid list-disc gap-1 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Every part of an interpretation, in the order a results section would use it. */
export function InterpretationView({ interpretation }: { interpretation: ResultInterpretation }) {
  return (
    <div className="grid gap-6">
      <Part heading={steps.meaning}>
        <p>{interpretation.meaning}</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start text-small">
            <caption className="mb-2 text-start font-medium">{steps.numbersTable}</caption>
            <thead>
              <tr className="border-b border-border-control">
                {[steps.statistic, steps.value, steps.means].map((heading) => (
                  <th key={heading} scope="col" className="px-2 py-2 text-start font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interpretation.statistics.map((line, index) => (
                <tr key={index} className="border-b border-border align-top">
                  <th scope="row" className="px-2 py-2 text-start font-medium">
                    {line.symbol}
                  </th>
                  <td className="px-2 py-2 tabular-nums">{line.value}</td>
                  <td className="px-2 py-2">{line.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Part>
      <Part heading={steps.significance}>
        <p>
          <Tag tone={significanceTone[interpretation.significance.status]}>{significanceLabel[interpretation.significance.status]}</Tag>
        </p>
        <p>{interpretation.significance.statement}</p>
        <p className="text-small text-text-muted">{interpretation.significance.meaning}</p>
      </Part>
      {interpretation.magnitude && (
        <Part heading={steps.magnitude}>
          <p>
            <span className="font-medium">{interpretation.magnitude.label.charAt(0).toUpperCase() + interpretation.magnitude.label.slice(1)}</span>, by {interpretation.magnitude.convention}.
          </p>
        </Part>
      )}
      <Part heading={steps.plain}>
        <p>{interpretation.plain}</p>
      </Part>
      <Part heading={steps.academic}>
        <p className="rounded-panel border border-border bg-surface p-4">{interpretation.academic}</p>
      </Part>
      <Part heading={steps.implication}>
        <p>{interpretation.implication}</p>
      </Part>
      <Part heading={steps.hypothesisHeading}>
        <p>
          <Tag tone={hypothesisTone[interpretation.hypothesis.status]}>{HYPOTHESIS_STATUS_LABELS[interpretation.hypothesis.status]}</Tag>
        </p>
        {interpretation.hypothesis.hypothesis && <p className="italic">{`${interpretation.hypothesis.label}: ${interpretation.hypothesis.hypothesis}`}</p>}
        <p>{interpretation.hypothesis.explanation}</p>
      </Part>
      <Part heading={steps.objectives}>
        <List items={interpretation.objectives} />
      </Part>
      <Part heading={steps.researchQuestion}>
        <p>{interpretation.researchQuestion}</p>
      </Part>
      <Part heading={steps.plan}>
        <p>{interpretation.plan}</p>
      </Part>
      {interpretation.warnings.length > 0 && (
        <Part heading={steps.warnings}>
          <List items={interpretation.warnings} />
        </Part>
      )}
      <Part heading={steps.limitations}>
        <List items={interpretation.limitations} />
      </Part>
      <Part heading={steps.mistakes}>
        <List items={interpretation.mistakes} />
      </Part>
    </div>
  );
}
