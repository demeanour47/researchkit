/** All wording for the Research Onion Explorer. The teaching content itself lives in the knowledge layer. */

import { EVIDENCE_DESCRIPTIONS, EVIDENCE_LABELS } from "@/knowledge/research";

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
  evidenceHeading: "How strong the evidence is",
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

/** How the evidence behind each rating is described, from the knowledge layer's own definitions. */
export const evidenceGuide: readonly string[] = (["textbook", "guidance", "interpretive"] as const).map(
  (level) => `${EVIDENCE_LABELS[level]}: ${EVIDENCE_DESCRIPTIONS[level]}`,
);

export const limits: readonly string[] = [
  "The fit ratings describe common practice in methodology textbooks. Your discipline, supervisor or institution may view some combinations differently, which is why differing views are shown alongside the ratings.",
  "Real studies often combine several techniques. The explorer asks for your main technique only; describe any others in your methodology chapter.",
  "Phenomenology is shown as a strategy, as many courses treat it, although it is also a research philosophy.",
  "The further reading is a starting point, not a complete literature. Check which editions your library holds, and cite the edition you actually read.",
];

export const explorer = {
  progressLabel: "Research onion layers",
  layerNumber: (number: number, total: number) => `Layer ${number} of ${total}`,
  notChosen: "Not chosen",
  chooseFirst: "Choose an option to see what it means and how it fits your earlier choices.",
  whyUsed: "Why it is used",
  strengths: "Strengths",
  limitations: "Limitations",
  learnMore: (name: string) => `Learn more about ${name}`,
  examples: "Typical examples",
  mistakes: "Common mistakes",
  furtherReading: "Further reading",
  fits: "How it fits your earlier choices",
  noEarlierLayers: "This is the outer layer, so there are no earlier choices to compare it with.",
  noEarlierChoices: "You haven't chosen anything yet in the layers this one is compared with.",
  justify: "What to justify:",
  evidence: "Evidence:",
  learnMoreFit: "Learn more about this rating",
  alternativeView: "Another view",
  sources: "Sources",
  back: "Back",
  next: (layerName: string) => `Next: ${layerName}`,
  seeSummary: "See summary",
} as const;

export const diagram = {
  title: "Research onion",
  description: (current: string | null, chosen: string[]) =>
    [
      "Six rings, from research philosophy on the outside to techniques and procedures at the centre.",
      current ? `The ${current} ring is highlighted.` : "",
      chosen.length > 0 ? `Chosen so far: ${chosen.join("; ")}.` : "Nothing chosen yet.",
    ]
      .filter(Boolean)
      .join(" "),
  legend: "Numbers match the layers. A bold outline marks the layer you are on; shaded rings have a choice.",
} as const;

export const summary = {
  missing: (names: string) => `You haven't chosen: ${names}. Go back to those layers to complete your design.`,
  exportHeading: "Save your summary",
  exportHint: "Download the summary with its evidence, differing views and further reading.",
  exportMarkdown: "Download Markdown",
  exportText: "Download plain text",
  exportHtml: "Download print-friendly page",
  editLast: "Change your choices",
  startAgain: "Start again",
  reminder: "Talk your design through with your supervisor. They know the expectations of your discipline and institution.",
} as const;

export const exportFiles = {
  markdown: { name: "research-onion-summary.md", type: "text/markdown", label: "Markdown file" },
  text: { name: "research-onion-summary.txt", type: "text/plain", label: "Plain text file" },
  html: { name: "research-onion-summary.html", type: "text/html", label: "Print-friendly page" },
} as const;

export const announcements = {
  chosen: (name: string, fits: string) => (fits ? `${name} chosen. ${fits}` : `${name} chosen.`),
  fitWith: (label: string, name: string, evidence: string) => `${label} with ${name}, ${evidence.toLowerCase()}.`,
  cleared: "Choices cleared. Starting again from the first layer.",
  downloaded: (label: string) => `${label} downloaded.`,
} as const;
