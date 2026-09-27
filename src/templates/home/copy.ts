/** Homepage wording, kept together so it can move to the content layer unchanged. */

export const hero = {
  eyebrow: "Academic research workspace",
  title: "Every stage of your research, done right.",
  description:
    "Free, exact tools for research, methodology, analysis, writing and publication. Every result shows the reasoning behind it, so you can check it and learn it.",
  primaryAction: "Explore the tools",
  secondaryAction: "Start a project in your workspace",
  workflowLabel: "The research workflow",
} as const;

/** The stages of a project, each with the tool that starts it. Tool ids come from the catalogue. */
export const workflow = [
  { stage: "Research", icon: "research", toolId: "research-question-builder" },
  { stage: "Methodology", icon: "methodology", toolId: "research-design-builder" },
  { stage: "Analysis", icon: "analysis", toolId: "data-analysis-recommender" },
  { stage: "Writing", icon: "writing", toolId: "word-counter" },
  { stage: "Publication", icon: "publishing", toolId: "apa-citation-generator" },
] as const;

export const featured = {
  eyebrow: "Featured tool",
  /** What the featured tool does, taken from how the tool itself describes its steps. */
  highlights: [
    "PRISMA 2020, PRISMA-S, scoping, rapid and narrative review diagrams.",
    "Counts records straight from BibTeX, RIS or CSV exports, and finds duplicates.",
    "Checks that every stage adds up, and says how to fix what doesn't.",
    "Exports SVG, PDF or 300 DPI PNG, with a text alternative.",
  ],
  action: "Open the builder",
  /** Stage names drawn in the decorative sketch of a PRISMA 2020 diagram. */
  sketch: {
    identification: "Identification",
    screening: "Screening",
    included: "Included",
    removed: "Records removed",
    excluded: "Records and reports excluded",
  },
} as const;

export const essentials = {
  eyebrow: "Start here",
  heading: "Essential tools",
  description: "A good first tool for each stage of a project, chosen by the ResearchKit team.",
  action: "All tools",
} as const;

export const categories = {
  eyebrow: "Browse",
  heading: "Research categories",
  description: "Every tool belongs to one area of academic work.",
  summary: (available: number, comingSoon: number) =>
    comingSoon > 0 ? `${available} available, ${comingSoon} coming soon` : `${available} available`,
} as const;

export const principles = {
  eyebrow: "Why ResearchKit",
  heading: "Built to be trusted",
  description: "Tools you can rely on in work that is marked, examined and published.",
  items: [
    {
      icon: "shield-check",
      title: "Accurate",
      text: "Each tool follows the authority it names, such as a style manual, and is tested before release. When we get something wrong, we correct it and say so.",
    },
    {
      icon: "lightbulb",
      title: "Explainable",
      text: "Every result shows the reasoning behind it, so you can check it for yourself and understand the rule for next time.",
    },
    {
      icon: "check",
      title: "Free",
      text: "No account, no paywall and no email address. Every tool is free to use, and your work stays yours.",
    },
    {
      icon: "lock",
      title: "Private",
      text: "Nothing is tracked. Most tools work entirely in your browser, and each of those says so on its page.",
    },
  ],
} as const;

export const latest = {
  eyebrow: "What's new",
  heading: "Latest additions",
  description: "The most recently published tools.",
} as const;

export const roadmap = {
  eyebrow: "Roadmap",
  heading: "What's planned",
  description: "Tools we plan to build next, by area. They are listed as coming soon until they are published; no dates are promised.",
  action: "See planned tools",
  count: (count: number) => (count === 1 ? "1 planned" : `${count} planned`),
  none: "Nothing planned yet.",
} as const;

export const academicPrinciples = {
  eyebrow: "Academic principles",
  heading: "How every tool is made",
  items: [
    { title: "Show the work", text: "A result without a source is only an opinion. Every tool names the method, the assumptions and the authority it follows." },
    { title: "Never invent", text: "No reference, figure or finding is ever made up. When a tool can't know something, it asks you or says so." },
    { title: "Teach, not only automate", text: "Explanations sit beside every result, so the next piece of work is easier because you understand the rule." },
    { title: "Accessible to everyone", text: "Every tool is built to work with a keyboard alone, with assistive technology, on small screens and in light or dark." },
  ],
} as const;
