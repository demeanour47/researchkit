/** Homepage wording, kept together so it can move to the content layer unchanged. */

export const hero = {
  title: "Academic tools that get it exactly right.",
  description:
    "Free tools for citations, academic writing and research. Every result shows the rule behind it, so you can check it and learn it.",
  primaryAction: "Try Citation Style Finder",
  secondaryAction: "Browse Tools",
} as const;

export const featured = {
  heading: "Featured tool",
  why: "Assignments and papers are marked on citation rules that are rarely explained. The finder tells you which style fits your subject and situation, what to check before you start, and why.",
  action: "Open tool",
} as const;

export const principles = {
  heading: "Why ResearchKit",
  items: [
    {
      title: "Accurate",
      text: "Each tool follows the authority it names, such as a style manual, and is tested before release. When we get something wrong, we correct it and say so.",
    },
    {
      title: "Explainable",
      text: "Every result shows the reasoning behind it, so you can check it for yourself and understand the rule for next time.",
    },
    {
      title: "Free",
      text: "No account, no paywall and no email address. Every tool is free to use, and your work stays yours.",
    },
  ],
} as const;

export const start = {
  heading: "Start your research",
  comingSoon: "Coming soon",
  areas: {
    cite: { title: "Cite", text: "Find the citation style your work needs." },
    write: { title: "Write", text: "Word limits, structure and academic conventions." },
    analyse: { title: "Analyse", text: "Statistical tests, effect sizes and reporting results." },
    learn: { title: "Learn", text: "Guides that explain the rules behind the tools." },
  },
} as const;
