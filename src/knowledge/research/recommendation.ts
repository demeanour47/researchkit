/**
 * The research onion summary. It describes and explains the researcher's own
 * choices; it never ranks them or chooses a methodology on their behalf.
 */

import { allJudgements, validateSelection } from "./compatibility";
import { LAYERS, findOption } from "./research-onion";
import { getReference } from "./references";
import type { Fit, Judgement, LayerId, OnionOption, OnionSelection, Reference } from "./types";
import { LAYER_ORDER } from "./types";

export interface OnionSummary {
  /** The chosen option for each layer, in layer order. */
  choices: { layer: LayerId; option: OnionOption }[];
  /** Layers without a choice yet. */
  missing: LayerId[];
  complete: boolean;
  judgements: Judgement[];
  counts: Record<Fit, number>;
  /** Why the combination works: the reasons behind each strong fit. */
  whyItWorks: string[];
  /** A main limitation of each chosen option. */
  weaknesses: string[];
  /** What the researcher should justify, including every pairing that isn't a strong fit. */
  toJustify: string[];
  /** The further reading for every chosen option, each work once, in order of first appearance. */
  furtherReading: Reference[];
}

export const GENERAL_JUSTIFICATION = "Explain how your research question led to each of these choices.";

export function summarise(selection: OnionSelection): OnionSummary {
  validateSelection(selection);

  const choices = LAYER_ORDER.flatMap((layer) => {
    const id = selection[layer];
    const option = id ? findOption(id) : undefined;
    return option ? [{ layer, option }] : [];
  });
  const missing = LAYERS.map((layer) => layer.id).filter((layer) => !selection[layer]);
  const judgements = allJudgements(selection);

  const counts: Record<Fit, number> = { strong: 0, possible: 0, careful: 0 };
  for (const judgement of judgements) counts[judgement.fit] += 1;

  const readingIds = [...new Set(choices.flatMap(({ option }) => option.references))];

  return {
    choices,
    missing,
    complete: missing.length === 0,
    judgements,
    counts,
    whyItWorks: judgements.filter((judgement) => judgement.fit === "strong").map((judgement) => judgement.reason),
    weaknesses: choices.map(({ option }) => `${option.name}: ${option.limitations[0]}`),
    toJustify:
      choices.length === 0
        ? []
        : [
            GENERAL_JUSTIFICATION,
            ...judgements.flatMap((judgement) => (judgement.justify ? [judgement.justify] : [])),
          ],
    furtherReading: readingIds.map(getReference),
  };
}
