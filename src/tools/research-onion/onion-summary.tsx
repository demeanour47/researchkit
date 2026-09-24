import type { Ref } from "react";
import { Button } from "@/ui";
import { LAYER_ORDER, SUMMARY_LABELS, SUMMARY_TEXT, getLayer, type OnionSummary } from "@/knowledge/research";
import { summary as copy } from "./copy";
import { ExportActions } from "./export-actions";
import { FitList } from "./fit-list";
import { ReferenceList } from "@/features/research";

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
  onExported: (label: string) => void;
}

/**
 * The Research Onion Summary: the researcher's choices, why they work, the evidence
 * and differing views, weaknesses, what to justify and further reading.
 */
export function OnionSummaryView({ summary, headingRef, onEdit, onStartAgain, onExported }: OnionSummaryViewProps) {
  const strong = summary.judgements.filter((judgement) => judgement.fit === "strong");
  const needsAttention = summary.judgements.filter((judgement) => judgement.fit !== "strong");
  const chosen = new Map(summary.choices.map(({ layer, option }) => [layer, option.name]));

  return (
    <section aria-labelledby="onion-summary-title" className="grid gap-8">
      <div className="grid gap-2">
        <h2 id="onion-summary-title" ref={headingRef} tabIndex={-1} className="text-heading font-semibold focus-ring">
          {SUMMARY_TEXT.title}
        </h2>
        <p className="text-text-muted">{SUMMARY_TEXT.intro}</p>
      </div>

      {summary.missing.length > 0 && (
        <p className="rounded-panel border border-dashed border-foreground/60 p-4">
          {copy.missing(summary.missing.map((layer) => getLayer(layer).name.toLowerCase()).join(", "))}
        </p>
      )}

      <div className="grid gap-4">
        <h3 className="text-subheading font-semibold">{SUMMARY_TEXT.choices}</h3>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {LAYER_ORDER.map((layer) => (
            <div key={layer} className="contents">
              <dt className="font-medium">{SUMMARY_LABELS[layer]}</dt>
              <dd className={chosen.has(layer) ? undefined : "text-text-muted"}>{chosen.get(layer) ?? SUMMARY_TEXT.notChosen}</dd>
            </div>
          ))}
        </dl>
      </div>

      {summary.judgements.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{SUMMARY_TEXT.whyItWorks}</h3>
          {strong.length > 0 ? <FitList judgements={strong} showPair headingLevel={4} /> : <p>{SUMMARY_TEXT.noStrongFits}</p>}
        </div>
      )}

      {needsAttention.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{SUMMARY_TEXT.needsAttention}</h3>
          <FitList judgements={needsAttention} showPair showJustify={false} headingLevel={4} />
        </div>
      )}

      {summary.weaknesses.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{SUMMARY_TEXT.weaknesses}</h3>
          <List items={summary.weaknesses} />
        </div>
      )}

      {summary.toJustify.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{SUMMARY_TEXT.toJustify}</h3>
          <List items={summary.toJustify} />
        </div>
      )}

      {summary.furtherReading.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-subheading font-semibold">{SUMMARY_TEXT.furtherReading}</h3>
          <ReferenceList references={summary.furtherReading} />
        </div>
      )}

      <p className="text-small text-text-muted">{copy.reminder}</p>

      <ExportActions summary={summary} onExported={onExported} />

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
