import type { ReactNode } from "react";
import { COMPARED_LAYERS, explainOption, type Judgement, type OnionOption } from "@/knowledge/research";
import { explorer } from "./copy";
import { FitList } from "./fit-list";
import { LearnMore, ReferenceList } from "@/features/research";

function Detail({ heading, level = 4, children }: { heading: string; level?: 4 | 5; children: ReactNode }) {
  const Heading = `h${level}` as const;
  return (
    <div className="grid gap-2">
      <Heading className="font-semibold">{heading}</Heading>
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

/**
 * Everything the explorer teaches about one option: a summary and how it fits the
 * earlier choices up front, with examples, common mistakes and reading under "learn more".
 */
export function OptionDetails({ option, judgements }: { option: OnionOption; judgements: readonly Judgement[] }) {
  const explanation = explainOption(option.id);
  const headingId = `option-${option.id}-title`;
  return (
    <section aria-labelledby={headingId} className="grid gap-6 rounded-panel border border-border bg-surface p-4 sm:p-6">
      <div className="grid gap-2">
        <h3 id={headingId} className="text-subheading font-semibold">
          {option.name}
        </h3>
        <p>{explanation.summary}</p>
      </div>
      <Detail heading={explorer.whyUsed}>
        <p>{explanation.whyUsed}</p>
      </Detail>
      <div className="grid items-start gap-6 sm:grid-cols-2">
        <Detail heading={explorer.strengths}>
          <List items={explanation.strengths} />
        </Detail>
        <Detail heading={explorer.limitations}>
          <List items={explanation.limitations} />
        </Detail>
      </div>
      <LearnMore label={explorer.learnMore(option.name)}>
        <Detail heading={explorer.examples} level={5}>
          <List items={explanation.learnMore.examples} />
        </Detail>
        <Detail heading={explorer.mistakes} level={5}>
          <List items={explanation.learnMore.mistakes} />
        </Detail>
        <Detail heading={explorer.furtherReading} level={5}>
          <ReferenceList references={explanation.learnMore.furtherReading} />
        </Detail>
      </LearnMore>
      <Detail heading={explorer.fits}>
        {COMPARED_LAYERS[option.layer].length === 0 ? (
          <p className="text-text-muted">{explorer.noEarlierLayers}</p>
        ) : judgements.length === 0 ? (
          <p className="text-text-muted">{explorer.noEarlierChoices}</p>
        ) : (
          <FitList judgements={judgements} />
        )}
      </Detail>
    </section>
  );
}
