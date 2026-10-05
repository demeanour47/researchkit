/**
 * The research journey: the stages of a project in the order most students meet
 * them, and the ResearchKit tools and guides that help at each. A stage with no
 * tool is an educational stage: it is explained, and links only to guides.
 * Tool ids and guide slugs are checked against the catalogue by tests, so a
 * stage can't link to a page that doesn't exist.
 */

export interface JourneyStage {
  id: string;
  title: string;
  /** One line shown with the title. */
  summary: string;
  /** What the stage means. */
  meaning: string;
  /** Why it matters. */
  why: string;
  /** Catalogue ids of tools for this stage, empty for an educational stage. */
  toolIds: readonly string[];
  /** Slugs of published guides for this stage. */
  guideSlugs: readonly string[];
}

export const JOURNEY_STAGES: readonly JourneyStage[] = [
  {
    id: "idea",
    title: "Idea",
    summary: "Find a topic worth asking about.",
    meaning: "A topic or problem that interests you and that others could care about, before it has been turned into a question.",
    why: "A clear problem keeps every later choice, from the literature you read to the test you run, pointed in one direction.",
    toolIds: [],
    guideSlugs: ["how-to-plan-a-dissertation", "how-to-read-a-research-paper"],
  },
  {
    id: "question",
    title: "Research question",
    summary: "Turn the topic into something answerable.",
    meaning: "A focused question, with objectives and, for quantitative work, hypotheses, that your study can actually answer.",
    why: "Your question decides your design, your data and your analysis. A vague question produces a vague study.",
    toolIds: ["research-question-builder", "research-objectives-generator", "hypothesis-builder", "research-title-builder"],
    guideSlugs: ["how-to-write-a-research-question", "how-to-write-research-objectives", "how-to-write-a-good-research-title"],
  },
  {
    id: "keywords",
    title: "Keywords",
    summary: "Name your concepts and the words authors use for them.",
    meaning: "The main concepts in your question, with the synonyms and phrases that scholars use to describe them.",
    why: "Databases match words, not meaning. Good search terms decide whether you find the work that matters.",
    toolIds: ["literature-explorer"],
    guideSlugs: ["how-to-search-academic-literature"],
  },
  {
    id: "literature",
    title: "Literature",
    summary: "Find, read and compare what is already known.",
    meaning: "Searching for existing studies, recording what each found and how, and comparing them to see what is established and what is not.",
    why: "A literature review shows where your study fits, and it supplies the concepts, methods and measures your work builds on.",
    toolIds: ["literature-explorer", "literature-matrix", "prisma-flow-builder"],
    guideSlugs: ["how-to-write-a-literature-review", "how-to-read-a-research-paper", "how-to-search-academic-literature"],
  },
  {
    id: "design",
    title: "Research design",
    summary: "Decide how you will answer the question.",
    meaning: "The approach, variables, sample and instruments that let your study answer its question.",
    why: "The design determines which conclusions your data can support. It is hard to repair after the data are collected.",
    toolIds: ["research-design-builder", "variables-builder", "sampling-builder", "sample-size-calculator", "conceptual-framework-builder"],
    guideSlugs: ["qualitative-or-quantitative-research", "how-to-plan-a-dissertation"],
  },
  {
    id: "data",
    title: "Data",
    summary: "Collect, organise and prepare your data.",
    meaning: "Gathering responses or measurements, and preparing them for analysis: coding, cleaning and describing them.",
    why: "Analysis can only be as sound as the data behind it, and the way you collect data limits the tests you can use.",
    toolIds: ["questionnaire-builder", "spss-research-lab", "table-builder"],
    guideSlugs: ["spss-from-data-preparation-to-reporting"],
  },
  {
    id: "statistics",
    title: "Statistics",
    summary: "Choose a test and understand what it shows.",
    meaning: "Choosing an analysis that fits your question and data, checking its assumptions, and reporting size and uncertainty as well as significance.",
    why: "The right test answers your question; the wrong one can mislead. Effect sizes and confidence intervals tell readers how much, not only whether.",
    toolIds: ["statistical-test-finder", "statistical-assumption-checker", "power-analysis", "effect-size-calculator", "confidence-interval-calculator"],
    guideSlugs: ["how-to-choose-a-statistical-test", "what-a-p-value-tells-you", "how-to-report-statistics-in-apa"],
  },
  {
    id: "writing",
    title: "Writing",
    summary: "Present the work as a clear argument.",
    meaning: "Structuring your findings and reasoning into an essay, report or thesis, within the limits you were given.",
    why: "Readers judge research through the writing. Clear structure and plain sentences let your evidence be seen.",
    toolIds: ["word-counter", "readability-checker", "paragraph-counter", "sentence-counter"],
    guideSlugs: ["how-to-structure-an-academic-essay", "how-to-write-an-abstract", "how-to-meet-a-word-limit"],
  },
  {
    id: "references",
    title: "References",
    summary: "Credit every source in the required style.",
    meaning: "Citing each source in the text and listing it in a reference list, in the style your institution requires.",
    why: "Accurate citation credits other people's work, lets readers find your sources and protects you from accusations of plagiarism.",
    toolIds: ["apa-citation-generator", "mla-citation-generator", "reference-checker", "citation-style-finder"],
    guideSlugs: ["how-to-choose-a-citation-style", "how-to-manage-your-references", "how-to-avoid-plagiarism"],
  },
];

export const getJourneyStage = (id: string): JourneyStage | undefined => JOURNEY_STAGES.find((stage) => stage.id === id);

/** The stage whose tools include this tool: the first one in journey order. */
export const stageOfTool = (toolId: string): JourneyStage | undefined => JOURNEY_STAGES.find((stage) => stage.toolIds.includes(toolId));
