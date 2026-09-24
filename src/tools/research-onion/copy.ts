/** All wording for the Research Onion Explorer. The teaching content itself lives in the knowledge layer. */

import type { Fit, LayerId } from "@/knowledge/research";

export const page = {
  title: "Research Onion Explorer",
  /** One sentence, for listings such as the tools index. */
  summary:
    "Works through the six layers of the research onion one at a time, explaining each choice and how well your choices fit together.",
  metaDescription:
    "Explore the research onion layer by layer: philosophy, approach, methodological choice, strategy, time horizon and techniques, with every option and every fit explained.",
  intro:
    "Work through the six layers of the research onion, from your research philosophy to how you will collect data. Each choice is explained, and you'll see how well it fits the choices you've already made, and why. The explorer never chooses a methodology for you.",
  noScript:
    "The Research Onion Explorer responds to your choices, which needs JavaScript. Turn on JavaScript to use it. The explanation of the research onion below works without it.",
  aboutHeading: "About the research onion",
  fitsHeading: "How to read the fit ratings",
  limitsHeading: "Limitations",
  privacyHeading: "Privacy",
  privacy: "Your choices stay in your browser. Nothing you choose is sent anywhere or saved.",
} as const;

export const about: readonly string[] = [
  "The research onion was developed by Mark Saunders, Philip Lewis and Adrian Thornhill in their textbook Research Methods for Business Students. It pictures research design as layers that you peel from the outside in.",
  "The outer layers are about your assumptions: what you believe about reality and knowledge, and how theory relates to data. The inner layers are practical: your strategy, your time frame and how you collect data.",
  "Decisions in the outer layers usually shape the ones inside them, which is why the explorer compares each choice with the earlier choices it depends on.",
];

export const fitGuide: readonly string[] = [
  "Strong fit: the two choices are commonly used together, and methodology textbooks treat the combination as typical.",
  "Possible: the combination is used, but you should explain how the two choices connect in your study.",
  "Needs careful justification: the combination is unusual because the two choices rest on different assumptions. It isn't ruled out, but you'll need to explain why it suits your research question.",
  "Only choices that directly shape each other are compared: for example, your time horizon is compared with your strategy, not with your philosophy.",
];

export const limits: readonly string[] = [
  "The fit ratings describe common practice in methodology textbooks. Your discipline, supervisor or institution may view some combinations differently.",
  "Real studies often combine several techniques. The explorer asks for your main technique only; describe any others in your methodology chapter.",
  "Phenomenology is shown as a strategy, as many courses treat it, although it is also a research philosophy.",
  "Academic references for each option haven't been added yet. They will be added after review by a methodology specialist.",
];

export const explorer = {
  progressLabel: "Research onion layers",
  layerNumber: (number: number, total: number) => `Layer ${number} of ${total}`,
  notChosen: "Not chosen",
  chooseFirst: "Choose an option to see what it means and how it fits your earlier choices.",
  whyUsed: "Why it is used",
  strengths: "Strengths",
  limitations: "Limitations",
  examples: "Typical examples",
  fits: "How it fits your earlier choices",
  noEarlierLayers: "This is the outer layer, so there are no earlier choices to compare it with.",
  noEarlierChoices: "You haven't chosen anything yet in the layers this one is compared with.",
  justify: "What to justify:",
  references: "Academic references",
  referencesPending: "References for this option will be added after review by a methodology specialist.",
  back: "Back",
  next: (layerName: string) => `Next: ${layerName}`,
  seeSummary: "See summary",
} as const;

export const summary = {
  heading: "Research Onion Summary",
  intro: "This summary describes the choices you made and how they fit together. It doesn't judge your design; use it to plan how you will justify your methodology.",
  missing: (names: string) => `You haven't chosen: ${names}. Go back to those layers to complete your design.`,
  choicesHeading: "Your choices",
  whyItWorks: "Why this combination works",
  noStrongFits:
    "None of your choices is a typical strong fit with another. That doesn't rule the design out, but every link between your choices will need a clear justification.",
  needsAttention: "Combinations that need attention",
  weaknesses: "Potential weaknesses",
  toJustify: "What you should justify",
  editLast: "Change your choices",
  startAgain: "Start again",
  reminder: "Talk your design through with your supervisor. They know the expectations of your discipline and institution.",
} as const;

/** The summary's name for each layer. */
export const summaryLabels: Record<LayerId, string> = {
  philosophy: "Philosophy",
  approach: "Approach",
  choice: "Method",
  strategy: "Strategy",
  timeHorizon: "Time horizon",
  technique: "Data collection",
};

export const fitLabels: Record<Fit, string> = {
  strong: "Strong fit",
  possible: "Possible",
  careful: "Needs careful justification",
};

export const announcements = {
  chosen: (name: string, fits: string) => (fits ? `${name} chosen. ${fits}` : `${name} chosen.`),
  fitWith: (label: string, name: string) => `${label} with ${name}.`,
  cleared: "Choices cleared. Starting again from the first layer.",
} as const;
