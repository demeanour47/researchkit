/**
 * Where every guide sits in Learn: its subject category and its research stage
 * (ADR-0010). The one place a guide is added to the catalogue. It has no imports, so
 * tests can check it; the catalogue builds its listings from it.
 */

export const GUIDE_CATEGORIES = [
  {
    id: "citation",
    title: "Citation",
    description: "How citation works, and how to credit sources correctly in any style.",
  },
  {
    id: "research-methods",
    title: "Research Methods",
    description: "Planning research: questions, approaches and reviewing the literature.",
  },
  {
    id: "writing",
    title: "Writing",
    description: "Structuring and writing academic work that meets its requirements.",
  },
  {
    id: "statistics",
    title: "Statistics",
    description: "Choosing, interpreting and reporting statistical analyses.",
  },
  {
    id: "academic-skills",
    title: "Academic Skills",
    description: "Reading, organising and planning your academic work.",
  },
] as const;

export type GuideCategoryId = (typeof GUIDE_CATEGORIES)[number]["id"];

/** The stages of a research project, in order. Each guide belongs to the stage where a reader most needs it. */
export const RESEARCH_STAGES = [
  { id: "discover", title: "Discover", description: "Read research critically and find what is already known." },
  { id: "plan", title: "Plan", description: "Turn a topic into a question, objectives and a workable plan." },
  { id: "review", title: "Review", description: "Search, organise and synthesise the literature." },
  { id: "design", title: "Design", description: "Choose an approach and plan the data you need." },
  { id: "analyse", title: "Collect and analyse", description: "Choose the right analysis and understand what it shows." },
  { id: "write", title: "Write", description: "Structure an argument and write it clearly." },
  { id: "cite", title: "Cite", description: "Credit every source correctly, in the style required." },
  { id: "report", title: "Report", description: "Present results and summarise the work for readers." },
  { id: "finalise", title: "Finalise", description: "Meet the limits and check the details before submission." },
] as const;

export type ResearchStageId = (typeof RESEARCH_STAGES)[number]["id"];

export interface GuidePlacement {
  slug: string;
  category: GuideCategoryId;
  stage: ResearchStageId;
  /** Planned but not yet published. A published guide's content lives in content/guides. */
  planned?: { title: string; description: string; relatedToolIds?: readonly string[] };
}

/** Every guide in the catalogue, in reading order within its category. */
export const GUIDE_PLAN: readonly GuidePlacement[] = [
  { slug: "how-to-choose-a-citation-style", category: "citation", stage: "cite" },
  { slug: "apa-7-citations-and-references", category: "citation", stage: "cite" },
  { slug: "mla-9-citations-and-works-cited", category: "citation", stage: "cite" },
  { slug: "chicago-author-date-citations", category: "citation", stage: "cite" },
  { slug: "chicago-notes-bibliography", category: "citation", stage: "cite" },
  { slug: "ieee-citations-and-references", category: "citation", stage: "cite" },
  { slug: "harvard-citations-and-references", category: "citation", stage: "cite" },
  { slug: "how-to-cite-a-website", category: "citation", stage: "cite" },
  { slug: "reference-list-or-bibliography", category: "citation", stage: "cite" },
  { slug: "how-to-avoid-plagiarism", category: "citation", stage: "cite" },
  { slug: "reference-checker", category: "citation", stage: "finalise" },

  { slug: "how-to-write-a-research-question", category: "research-methods", stage: "plan" },
  { slug: "how-to-write-research-objectives", category: "research-methods", stage: "plan" },
  { slug: "how-to-write-a-good-research-title", category: "research-methods", stage: "plan" },
  { slug: "qualitative-or-quantitative-research", category: "research-methods", stage: "design" },
  { slug: "how-to-write-a-literature-review", category: "research-methods", stage: "review" },
  { slug: "how-to-search-academic-literature", category: "research-methods", stage: "review" },

  { slug: "how-to-structure-an-academic-essay", category: "writing", stage: "write" },
  { slug: "paragraph-structure-and-counting", category: "writing", stage: "write" },
  { slug: "sentence-structure-and-counting", category: "writing", stage: "write" },
  { slug: "readability-in-academic-writing", category: "writing", stage: "write" },
  { slug: "how-to-paraphrase", category: "writing", stage: "write" },
  { slug: "how-to-write-an-abstract", category: "writing", stage: "report" },
  { slug: "how-to-meet-a-word-limit", category: "writing", stage: "finalise" },
  { slug: "how-to-count-characters-in-academic-writing", category: "writing", stage: "finalise" },

  { slug: "how-to-choose-a-statistical-test", category: "statistics", stage: "analyse" },
  { slug: "power-analysis", category: "statistics", stage: "design" },
  { slug: "confidence-intervals", category: "statistics", stage: "analyse" },
  { slug: "what-a-p-value-tells-you", category: "statistics", stage: "analyse" },
  { slug: "spss-from-data-preparation-to-reporting", category: "statistics", stage: "analyse" },
  { slug: "how-to-report-statistics-in-apa", category: "statistics", stage: "report" },

  { slug: "how-to-read-a-research-paper", category: "academic-skills", stage: "discover" },
  { slug: "how-to-manage-your-references", category: "academic-skills", stage: "review" },
  { slug: "how-to-plan-a-dissertation", category: "academic-skills", stage: "plan" },
  { slug: "how-to-write-a-research-proposal", category: "academic-skills", stage: "plan" },
  { slug: "how-to-write-a-research-paper", category: "academic-skills", stage: "report" },
  { slug: "how-to-write-a-thesis-or-dissertation", category: "academic-skills", stage: "report" },
];
