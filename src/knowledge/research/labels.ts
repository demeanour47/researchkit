/** The names of the research onion's ratings and summary rows, shared by the tool and its exports. */

import type { EvidenceLevel, Fit, LayerId } from "./types";

export const FIT_LABELS: Readonly<Record<Fit, string>> = {
  strong: "Strong fit",
  possible: "Possible",
  careful: "Needs careful justification",
};

export const EVIDENCE_LABELS: Readonly<Record<EvidenceLevel, string>> = {
  textbook: "Strong textbook agreement",
  guidance: "Common methodology guidance",
  interpretive: "Interpretive judgement",
};

export const EVIDENCE_DESCRIPTIONS: Readonly<Record<EvidenceLevel, string>> = {
  textbook: "Major methods textbooks consistently present this combination this way.",
  guidance: "Methods texts commonly give this advice, though with more variation.",
  interpretive: "ResearchKit's reading of the general principles, not a position stated directly in the sources.",
};

/** The summary's name for each layer. */
export const SUMMARY_LABELS: Readonly<Record<LayerId, string>> = {
  philosophy: "Philosophy",
  approach: "Approach",
  choice: "Method",
  strategy: "Strategy",
  timeHorizon: "Time horizon",
  technique: "Data collection",
};

/** The wording of the Research Onion Summary, on the page and in every export. */
export const SUMMARY_TEXT = {
  title: "Research Onion Summary",
  intro:
    "This summary describes the choices you made and how they fit together. It doesn't choose a methodology for you; use it to plan how you will justify your design.",
  choices: "Your choices",
  notChosen: "Not chosen",
  whyItWorks: "Why this combination works",
  noStrongFits:
    "None of your choices is a typical strong fit with another. That doesn't rule the design out, but every link between your choices will need a clear justification.",
  needsAttention: "Combinations that need attention",
  evidence: "Evidence",
  sources: "Sources",
  alternativeView: "Alternative view",
  justify: "What to justify",
  weaknesses: "Potential weaknesses",
  toJustify: "What you should justify",
  furtherReading: "Further reading",
  footer:
    "Created with the ResearchKit Research Onion Explorer. Talk your design through with your supervisor, who knows the expectations of your discipline and institution.",
} as const;
