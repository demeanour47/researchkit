import type { Judgement, LayerId, OnionOption } from "@/knowledge/research";
import { COMPARED_LAYERS } from "@/knowledge/research";
import { explorer } from "./copy";
import { FitList } from "./fit-list";

function Detail({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <h4 className="font-semibold">{heading}</h4>
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

/** Everything the explorer teaches about one option, and how it fits the earlier choices. */
export function OptionDetails({ option, judgements }: { option: OnionOption; judgements: readonly Judgement[] }) {
  const layer: LayerId = option.layer;
  const headingId = `option-${option.id}-title`;
  return (
    <section aria-labelledby={headingId} className="grid gap-6 rounded-panel border border-border bg-surface p-4 sm:p-6">
      <div className="grid gap-2">
        <h3 id={headingId} className="text-subheading font-semibold">
          {option.name}
        </h3>
        <p>{option.definition}</p>
      </div>
      <Detail heading={explorer.whyUsed}>
        <p>{option.whyUsed}</p>
      </Detail>
      <div className="grid items-start gap-6 sm:grid-cols-2">
        <Detail heading={explorer.strengths}>
          <List items={option.strengths} />
        </Detail>
        <Detail heading={explorer.limitations}>
          <List items={option.limitations} />
        </Detail>
      </div>
      <Detail heading={explorer.examples}>
        <List items={option.examples} />
      </Detail>
      <Detail heading={explorer.fits}>
        {COMPARED_LAYERS[layer].length === 0 ? (
          <p className="text-text-muted">{explorer.noEarlierLayers}</p>
        ) : judgements.length === 0 ? (
          <p className="text-text-muted">{explorer.noEarlierChoices}</p>
        ) : (
          <FitList judgements={judgements} />
        )}
      </Detail>
      <Detail heading={explorer.references}>
        {option.references.length > 0 ? (
          <List items={option.references} />
        ) : (
          <p className="text-text-muted">{explorer.referencesPending}</p>
        )}
      </Detail>
    </section>
  );
}
