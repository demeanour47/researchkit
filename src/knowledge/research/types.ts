/**
 * Types for the research onion: six layers of research design decisions, the
 * options within each, and how well a pair of choices typically fits together.
 */

export const LAYER_ORDER = ["philosophy", "approach", "choice", "strategy", "timeHorizon", "technique"] as const;

export type LayerId = (typeof LAYER_ORDER)[number];

export interface OnionLayer {
  id: LayerId;
  /** 1 to 6, from the outer layer inwards. */
  number: number;
  name: string;
  /** The question the layer asks the researcher. */
  question: string;
  description: string;
}

/**
 * How well two choices typically fit. None of these forbids a combination:
 * "careful" means the combination is unusual and needs to be justified.
 */
export type Fit = "strong" | "possible" | "careful";

/** Earlier choices that an option typically suits strongly, or can work with. Anything unlisted needs careful justification. */
export interface FitRule {
  strong?: readonly string[];
  possible?: readonly string[];
}

export interface OnionOption {
  id: string;
  layer: LayerId;
  /** The label, such as "Grounded Theory". */
  name: string;
  /** How the option is referred to within a sentence, such as "a deductive approach". */
  subject: string;
  /** What the option typically does, completing "…usually …": "develops theory inductively". */
  essence: string;
  definition: string;
  whyUsed: string;
  strengths: readonly string[];
  limitations: readonly string[];
  examples: readonly string[];
  /** Academic references. Empty until added at editorial review. */
  references: readonly string[];
  /** How this option fits with choices in earlier layers, for each layer it is compared with. */
  fits: Partial<Record<LayerId, FitRule>>;
}

/** The researcher's choices so far: at most one option per layer. */
export type OnionSelection = Partial<Record<LayerId, string>>;

export interface Judgement {
  /** The option from the earlier (outer) layer. */
  earlier: string;
  /** The option from the later (inner) layer. */
  later: string;
  fit: Fit;
  /** Why the fit was judged this way. */
  reason: string;
  /** What the researcher should justify, for any fit other than strong. */
  justify: string | null;
}
