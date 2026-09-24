import type { Ref } from "react";
import { Button } from "@/ui";
import type { OnionSummary } from "@/knowledge/research";
import { LAYER_ORDER, getLayer } from "@/knowledge/research";
import { explorer, summary as copy, summaryLabels } from "./copy";
import { FitList } from "./fit-list";

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid list-disc gap-2 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export interface OnionSummaryViewProps {
  summary: OnionSummary;
  headingRef: Ref<HTMLHeadingElement>;
  onEdit: () => void;
  onStartAgain: () => void;
}

/** The Research Onion Summary: the researcher's choices, why they work, their weaknesses and what to justify. */
export function OnionSummaryView({ summary, headingRef, onEdit, onStartAgain }: OnionSummaryViewProps) {
  const needsAttention = summary.judgements.filter((judgement) => judgement.fit !== "strong");
  const chosen = new Map(summary.choices.map(({ layer, option }) => [layer, option.name]));

  return (
    <section aria-labelledby="onion-summary-title" className="grid gap-8">
      <div className="grid gap-2">
        <h2 id="onion-summary-title" ref={headingRef} tabIndex={-1} className="text-heading font-semibold focus-ring">
          {copy.heading}
        </h2>
        <p className="text-text-muted">{copy.intro}</p>
      </div>

      {summary.missing.length > 0 && (
        <p className="rounded-panel border border-dashed border-foreground/60 p-4">
          {copy.missing(summary.missing.map((layer) => getLayer(layer).name.toLowerCase()).join(", "))}
        </p>
      )}

      <div className="grid gap-4">
        <h3 className="text-subheading font-semibold">{copy.choicesHeading}</h3>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {LAYER_ORDER.map((layer) => (
            <div key={layer} className="contents">
              <dt className="font-medium">{summaryLabels[layer]}</dt>
              <dd className={chosen.has(layer) ? undefined : "text-text-muted"}>{chosen.get(layer) ?? explorer.notChosen}</dd>
            </div>
          ))}
        </dl>
      </div>

      {summary.judgements.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{copy.whyItWorks}</h3>
          {summary.whyItWorks.length > 0 ? <List items={summary.whyItWorks} /> : <p>{copy.noStrongFits}</p>}
        </div>
      )}

      {needsAttention.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{copy.needsAttention}</h3>
          <FitList judgements={needsAttention} showPair showJustify={false} />
        </div>
      )}

      {summary.weaknesses.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{copy.weaknesses}</h3>
          <List items={summary.weaknesses} />
        </div>
      )}

      {summary.toJustify.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{copy.toJustify}</h3>
          <List items={summary.toJustify} />
        </div>
      )}

      <p className="text-small text-text-muted">{copy.reminder}</p>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onEdit}>
          {copy.editLast}
        </Button>
        <Button variant="subtle" onClick={onStartAgain}>
          {copy.startAgain}
        </Button>
      </div>
    </section>
  );
}
