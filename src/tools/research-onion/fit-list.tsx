import { Tag } from "@/ui";
import {
  EVIDENCE_LABELS,
  FIT_LABELS,
  explainJudgement,
  findOption,
  type Fit,
  type Judgement,
} from "@/knowledge/research";
import { explorer } from "./copy";
import { LearnMore, ReferenceList } from "@/features/research";

const tones: Record<Fit, "info" | "neutral" | "caution"> = { strong: "info", possible: "neutral", careful: "caution" };

const name = (id: string) => findOption(id)?.name ?? id;

/**
 * Fit judgements, each with its rating, the evidence behind it, its reason and
 * anything to justify. Differing views and sources are one step away, under
 * "learn more". Ratings are written out in words; the tag's style only reinforces them.
 */
export function FitList({
  judgements,
  showPair = false,
  showJustify = true,
  headingLevel = 5,
}: {
  judgements: readonly Judgement[];
  /** Name both options, for lists not tied to one option. */
  showPair?: boolean;
  /** Show what to justify, unless it is listed elsewhere. */
  showJustify?: boolean;
  /** The level for headings inside "learn more", one below the list's own heading. */
  headingLevel?: 4 | 5;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <ul className="grid gap-4">
      {judgements.map((judgement) => {
        const explanation = explainJudgement(judgement);
        const { alternativeView, evidence } = explanation.learnMore;
        return (
          <li key={`${judgement.earlier}/${judgement.later}`} className="grid gap-3 rounded-panel border border-border p-4">
            <p className="flex flex-wrap items-center gap-2">
              <Tag tone={tones[judgement.fit]}>{FIT_LABELS[judgement.fit]}</Tag>{" "}
              <span className="font-medium">
                {showPair ? `${name(judgement.later)} with ${name(judgement.earlier)}` : `with ${name(judgement.earlier)}`}
              </span>
            </p>
            <p>{explanation.summary}</p>
            <p className="text-small">
              <span className="font-medium">{explorer.evidence}</span> {EVIDENCE_LABELS[judgement.evidence.level]}
            </p>
            {showJustify && explanation.justify && (
              <p className="text-small text-text-muted">
                <span className="font-medium text-foreground">{explorer.justify}</span> {explanation.justify}
              </p>
            )}
            {(alternativeView || evidence.length > 0) && (
              <LearnMore label={explorer.learnMoreFit}>
                {alternativeView && (
                  <div className="grid gap-2">
                    <Heading className="font-semibold">{explorer.alternativeView}</Heading>
                    <p>{alternativeView.text}</p>
                    <ReferenceList references={alternativeView.references} />
                  </div>
                )}
                {evidence.length > 0 && (
                  <div className="grid gap-2">
                    <Heading className="font-semibold">{explorer.sources}</Heading>
                    <ReferenceList references={evidence} />
                  </div>
                )}
              </LearnMore>
            )}
          </li>
        );
      })}
    </ul>
  );
}
