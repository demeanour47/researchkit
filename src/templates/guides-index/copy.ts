/** Guides index wording, kept together so it can move to the content layer unchanged. */
export const guidesIndex = {
  title: "Research Guides",
  eyebrow: "Learn",
  metaDescription:
    "Free guides to citation, research methods, academic writing and statistics, explaining the rules behind academic work.",
  intro:
    "Clear, free guides to the rules and methods behind academic work, from writing a research question to reporting statistics and citing sources. Each guide explains why, not just what.",
  plannedNote: "Guides marked “Coming soon” are planned but not yet published.",
  workflow: {
    heading: "Guides for every stage of research",
    description: "Guides arranged by the stage of a research project where you'll need them, from reading the literature to checking a final draft. Browse by subject below.",
    promises: [
      "What to do, and why it matters",
      "How to do it, step by step, with worked examples",
      "The common mistakes, and the limits of any rule",
      "Which ResearchKit tools help you apply it",
    ],
    step: (number: number) => `${number}.`,
  },
  plural: "guides",
  crossLink: { lead: "Need practical tools?", label: "Browse Academic Tools" },
} as const;
