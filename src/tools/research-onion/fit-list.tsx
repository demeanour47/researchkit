import { Tag } from "@/ui";
import { findOption, type Fit, type Judgement } from "@/knowledge/research";
import { explorer, fitLabels } from "./copy";

const tones: Record<Fit, "info" | "neutral" | "caution"> = { strong: "info", possible: "neutral", careful: "caution" };

/** A name for a judgement's pair, such as "Deductive with Positivism". */
function pairName(judgement: Judgement): string {
  return `${findOption(judgement.later)?.name} with ${findOption(judgement.earlier)?.name}`;
}

/**
 * Fit judgements, each with its rating, its reason and anything to justify.
 * The rating is written out in words; the tag's style only reinforces it.
 */
export function FitList({
  judgements,
  showPair = false,
  showJustify = true,
}: {
  judgements: readonly Judgement[];
  /** Name both options, for lists not tied to one option. */
  showPair?: boolean;
  /** Show what to justify, unless it is listed elsewhere. */
  showJustify?: boolean;
}) {
  return (
    <ul className="grid gap-4">
      {judgements.map((judgement) => (
        <li key={`${judgement.earlier}/${judgement.later}`} className="grid gap-2 rounded-panel border border-border p-4">
          <p className="flex flex-wrap items-center gap-2">
            <Tag tone={tones[judgement.fit]}>{fitLabels[judgement.fit]}</Tag>{" "}
            <span className="font-medium">{showPair ? pairName(judgement) : `with ${findOption(judgement.earlier)?.name}`}</span>
          </p>
          <p>{judgement.reason}</p>
          {showJustify && judgement.justify && (
            <p className="text-small text-text-muted">
              <span className="font-medium text-foreground">{explorer.justify}</span> {judgement.justify}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
