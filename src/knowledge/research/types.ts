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

/**
 * How firmly the methodology literature supports a fit judgement.
 * - textbook: major methods textbooks consistently present the combination this way.
 * - guidance: methods texts commonly advise it, though with more variation.
 * - interpretive: ResearchKit's reasoning from general principles, not a position stated directly in the sources.
 */
export type EvidenceLevel = "textbook" | "guidance" | "interpretive";

export interface Evidence {
  level: EvidenceLevel;
  /** Ids of the references that support the judgement. Empty for an interpretive judgement. */
  sources: readonly string[];
}

/** A view that differs from the judgement, presented without taking a side. */
export interface AlternativeView {
  text: string;
  sources: readonly string[];
}

/** A published academic work, formatted in APA 7th edition style. */
export interface Reference {
  id: string;
  /** The parenthetical in-text form without brackets, such as "Saunders et al., 2019". */
  cite: string;
  year: number;
  /** The APA reference without its DOI. The italic part is wrapped in asterisks. */
  apa: string;
  /** The DOI, without "https://doi.org/", where one exists. */
  doi?: string;
}

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
  /** Mistakes students commonly make with this option. */
  mistakes: readonly string[];
  /** Ids of references for further reading. */
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
  evidence: Evidence;
  /** A differing view held by some researchers, where there is one. */
  alternativeView: AlternativeView | null;
}
