/**
 * Default document structures for the three project types. They are starting points:
 * institutions differ, so the student can rename, reorder, add and remove sections.
 * Nothing here writes content for the student; each section only explains what the
 * section is for and what it usually has to answer.
 */

import type { ProjectType } from "./state";

export interface SectionLink {
  href: string;
  label: string;
}

export interface SectionTemplate {
  id: string;
  title: string;
  purpose: string;
  include: readonly string[];
  questions: readonly string[];
  mistakes: readonly string[];
  formatting: string;
  tools: readonly SectionLink[];
  guides: readonly { slug: string; title: string }[];
}

const tool = (id: string, label: string): SectionLink => ({ href: `/tools/${id}`, label });
const guide = (slug: string, title: string) => ({ slug, title });

const INTRODUCTION: SectionTemplate = {
  id: "introduction",
  title: "Introduction",
  purpose: "Introduce the topic, the problem and why it matters, and tell the reader what to expect.",
  include: ["Background to the topic", "The research problem and gap", "Aim, questions and objectives", "Why the study matters", "How the document is organised"],
  questions: ["What is this about, and why does it matter?", "What is not yet known?", "What will this document do about it?"],
  mistakes: ["Starting too broadly", "Stating a topic but no problem", "Promising more than the study can deliver"],
  formatting: "Usually a numbered or titled opening section. Follow your institution's heading levels.",
  tools: [tool("research-question-builder", "Research Question Builder"), tool("research-objectives-generator", "Research Objectives Generator")],
  guides: [guide("how-to-write-a-research-question", "How to write a research question")],
};

const LITERATURE: SectionTemplate = {
  id: "literature-review",
  title: "Literature review",
  purpose: "Show what is already known, how studies relate to each other, and where the gap is.",
  include: ["Key concepts and theory", "Studies grouped by theme, not one by one", "Agreements and disagreements", "The gap your work addresses"],
  questions: ["What do existing studies say?", "How do they differ in method or finding?", "What remains unanswered?"],
  mistakes: ["Listing summaries in sequence", "Citing sources you have not read", "Ending without stating the gap"],
  formatting: "Cite in your chosen style throughout. Every in-text citation needs a reference-list entry.",
  tools: [tool("literature-explorer", "Literature Explorer"), tool("literature-matrix", "Literature Matrix")],
  guides: [guide("how-to-write-a-literature-review", "How to write a literature review")],
};

const METHODOLOGY: SectionTemplate = {
  id: "methodology",
  title: "Methodology",
  purpose: "Explain how the study is, or will be, carried out so another researcher could judge or repeat it.",
  include: ["Research design and approach", "Population and sampling", "Measurement or data sources", "Data collection procedure", "Analysis plan", "Ethical considerations"],
  questions: ["Why is this design suited to the question?", "Who or what is studied, and how are they chosen?", "How will the data be analysed?"],
  mistakes: ["Describing methods without justifying them", "Choosing a test before the design", "Leaving out ethics"],
  formatting: "Use past tense for completed work and future or conditional tense for planned work.",
  tools: [tool("research-design-builder", "Research Design Builder"), tool("sampling-builder", "Sampling Builder"), tool("statistical-test-finder", "Statistical Test Finder")],
  guides: [guide("how-to-choose-a-statistical-test", "How to choose a statistical test")],
};

const REFERENCES: SectionTemplate = {
  id: "references",
  title: "References",
  purpose: "List every source cited, in one consistent style, so readers can find them.",
  include: ["Every cited source, and only cited sources", "One style throughout"],
  questions: ["Does every in-text citation have an entry?", "Is each entry complete and consistently formatted?"],
  mistakes: ["Mixed styles", "Missing DOIs or URLs", "Entries that are never cited"],
  formatting: "Follow the style guide you chose; alphabetical order in APA, MLA, Chicago author-date and Harvard, numbered in IEEE.",
  tools: [tool("reference-checker", "Reference Checker"), tool("apa-citation-generator", "APA 7 Citation Builder"), tool("mla-citation-generator", "MLA 9 Citation Generator")],
  guides: [guide("how-to-manage-your-references", "How to manage your references")],
};

const RESULTS: SectionTemplate = {
  id: "results",
  title: "Results",
  purpose: "Report what the analysis found, without explaining why.",
  include: ["Descriptive findings", "Test results with statistics", "Tables and figures, each referred to in the text"],
  questions: ["What did the data show?", "Which hypotheses were supported?"],
  mistakes: ["Interpreting in the Results section", "Reporting only significant results", "Tables nobody refers to"],
  formatting: "Report statistics in your style's format; number tables and figures.",
  tools: [tool("spss-research-lab", "SPSS Research Lab"), tool("effect-size-calculator", "Effect Size Calculator"), tool("table-builder", "Table Builder")],
  guides: [],
};

const DISCUSSION: SectionTemplate = {
  id: "discussion",
  title: "Discussion",
  purpose: "Explain what the results mean, link them back to the literature and the questions, and be honest about limits.",
  include: ["Answers to each research question", "Comparison with earlier studies", "Implications", "Limitations"],
  questions: ["What do the results mean?", "How do they fit earlier work?", "What cannot be concluded?"],
  mistakes: ["Repeating the results", "Claiming causation from correlation", "Ignoring limitations"],
  formatting: "Keep the interpretation separate from the Results section unless your institution combines them.",
  tools: [tool("results-interpretation", "Results Interpretation")],
  guides: [],
};

const CONCLUSION: SectionTemplate = {
  id: "conclusion",
  title: "Conclusion",
  purpose: "Close by answering the question, stating the contribution, and pointing to next steps.",
  include: ["Answer to the main question", "Contribution", "Recommendations or future research"],
  questions: ["What is the answer?", "What should happen next?"],
  mistakes: ["Introducing new evidence", "Overstating the findings"],
  formatting: "Short and direct; no new citations of substance.",
  tools: [tool("readability-checker", "Readability Checker")],
  guides: [],
};

const FRAMEWORK: SectionTemplate = {
  id: "framework",
  title: "Theoretical or conceptual framework",
  purpose: "State the theory or concepts that guide the study and how they relate.",
  include: ["Theories or concepts used", "How variables or themes relate", "How the framework shapes the design"],
  questions: ["Which theory explains the problem?", "How does it shape your questions?"],
  mistakes: ["Naming a theory but never using it", "A diagram with no explanation"],
  formatting: "Label any diagram as a figure and explain it in the text.",
  tools: [tool("conceptual-framework-builder", "Conceptual Framework Builder")],
  guides: [],
};

const SIGNIFICANCE: SectionTemplate = {
  id: "significance-scope",
  title: "Significance and scope",
  purpose: "Say who benefits from the research and what the study will and will not cover.",
  include: ["Contribution to knowledge or practice", "Boundaries of the study"],
  questions: ["Who is helped by the answer?", "What is deliberately left out?"],
  mistakes: ["Vague claims of importance", "No stated boundaries"],
  formatting: "Often a short subsection of the introduction.",
  tools: [],
  guides: [],
};

const TIMELINE: SectionTemplate = {
  id: "timeline",
  title: "Timeline and resources",
  purpose: "Show the planned work is achievable in the time and with the resources available.",
  include: ["Stages of the work in order", "Time for each", "Resources or access needed"],
  questions: ["Can this be done in the time available?"],
  mistakes: ["No time for analysis and writing", "No plan if access fails"],
  formatting: "A simple table or list is usually enough.",
  tools: [tool("table-builder", "Table Builder")],
  guides: [],
};

const ABSTRACT: SectionTemplate = {
  id: "abstract",
  title: "Abstract",
  purpose: "Summarise the whole document for a reader deciding whether to read on. Write it last.",
  include: ["Problem", "Method", "Findings (not in a proposal)", "Conclusion"],
  questions: ["Could someone understand the study from this alone?"],
  mistakes: ["Writing it first", "Including content that is not in the document"],
  formatting: "Respect the word limit your institution or journal sets.",
  tools: [tool("word-counter", "Word Counter")],
  guides: [],
};

const FINDINGS: SectionTemplate = { ...RESULTS, id: "findings", title: "Findings" };
const RECOMMENDATIONS: SectionTemplate = {
  id: "recommendations",
  title: "Recommendations and implications",
  purpose: "Say what the findings imply for practice, policy and future research.",
  include: ["Practical implications", "Recommendations that follow from the findings", "Future research"],
  questions: ["What should change because of this work?"],
  mistakes: ["Recommendations the findings do not support"],
  formatting: "Tie each recommendation to a finding.",
  tools: [],
  guides: [],
};
const APPENDICES: SectionTemplate = {
  id: "appendices",
  title: "Appendices",
  purpose: "Hold material that supports the work but would interrupt the main text.",
  include: ["Instruments and questionnaires", "Consent forms", "Extra tables", "Raw output"],
  questions: ["Is each appendix referred to in the text?"],
  mistakes: ["Dumping unreferenced material"],
  formatting: "Label Appendix A, B, C and refer to each in the text.",
  tools: [tool("questionnaire-builder", "Questionnaire Builder")],
  guides: [],
};

const STRUCTURES: Record<ProjectType, readonly SectionTemplate[]> = {
  proposal: [ABSTRACT, INTRODUCTION, SIGNIFICANCE, LITERATURE, METHODOLOGY, TIMELINE, REFERENCES],
  paper: [ABSTRACT, INTRODUCTION, LITERATURE, METHODOLOGY, RESULTS, DISCUSSION, CONCLUSION, REFERENCES],
  thesis: [ABSTRACT, INTRODUCTION, LITERATURE, FRAMEWORK, METHODOLOGY, FINDINGS, DISCUSSION, CONCLUSION, RECOMMENDATIONS, REFERENCES, APPENDICES],
};

export const sectionsFor = (type: ProjectType): readonly SectionTemplate[] => STRUCTURES[type];

export interface ProjectTypeInfo {
  type: ProjectType;
  name: string;
  tagline: string;
  /** Learn guide that explains the document. */
  guide: { slug: string; title: string };
  results: string;
  purpose: string;
  research: string;
  length: string;
}

export const PROJECT_TYPE_INFO: readonly ProjectTypeInfo[] = [
  {
    type: "proposal",
    name: "Research proposal",
    tagline: "A plan for research you have not done yet.",
    guide: { slug: "how-to-write-a-research-proposal", title: "How to write a research proposal" },
    results: "None. It describes planned work, so it has no findings.",
    purpose: "To convince a reader that the question matters and the plan is sound.",
    research: "Planned",
    length: "Usually the shortest of the three; set by your institution.",
  },
  {
    type: "paper",
    name: "Research paper",
    tagline: "A report of one completed study.",
    guide: { slug: "how-to-write-a-research-paper", title: "How to write a research paper" },
    results: "Yes. Results and discussion of the completed study.",
    purpose: "To report what was found and what it means.",
    research: "Completed",
    length: "Medium; often set by a course or journal.",
  },
  {
    type: "thesis",
    name: "Thesis or dissertation",
    tagline: "An extended, in-depth study with a framework and appendices.",
    guide: { slug: "how-to-write-a-thesis-or-dissertation", title: "How to write a thesis or dissertation" },
    results: "Yes, with deeper analysis, often across chapters.",
    purpose: "To show you can design, carry out and defend independent research.",
    research: "Completed, in depth",
    length: "The longest; chapters and length vary by institution.",
  },
];

export const PROJECT_GUIDANCE_NOTE = "These are common structures, not rules. Your institution, supervisor or journal decides the required format; follow their instructions first.";
