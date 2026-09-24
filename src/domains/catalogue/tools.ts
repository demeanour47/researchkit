/**
 * The tool catalogue: the single source of truth for which tools exist, how they
 * are grouped, and whether they are available yet. Every page that lists tools
 * reads from here. The wording will move to the content layer when it exists.
 */

import { page as citationStyleFinder } from "@/tools/citation-style-finder/copy";
import { TOOL_PATH as CITATION_STYLE_FINDER_PATH } from "@/tools/citation-style-finder/path";

/** The tools index address. Provisional until the URL strategy (ADR-0005) is accepted. */
export const TOOLS_INDEX_PATH = "/tools";

export const TOOL_CATEGORIES = [
  {
    id: "citation",
    title: "Citation",
    description: "Find, format and check citations in the major academic styles.",
  },
  {
    id: "writing",
    title: "Writing",
    description: "Measure and check your text against assignment requirements.",
  },
  {
    id: "statistics",
    title: "Statistics",
    description: "Plan studies and analyse results, with every method explained.",
  },
  {
    id: "research",
    title: "Research",
    description: "Shape the questions, objectives and design of a research project.",
  },
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
export type ToolCategoryId = ToolCategory["id"];

interface ToolBase {
  id: string;
  name: string;
  /** One sentence describing what the tool does. */
  description: string;
  category: ToolCategoryId;
}

/** Only available tools have an address, so nothing can link to a tool that doesn't exist. */
export type ToolEntry =
  | (ToolBase & { status: "available"; href: string })
  | (ToolBase & { status: "coming-soon" });

export type ToolStatus = ToolEntry["status"];

const comingSoon = (id: string, name: string, description: string, category: ToolCategoryId): ToolEntry => ({
  id,
  name,
  description,
  category,
  status: "coming-soon",
});

export const TOOLS: readonly ToolEntry[] = [
  {
    id: "citation-style-finder",
    name: citationStyleFinder.title,
    description: citationStyleFinder.description,
    category: "citation",
    status: "available",
    href: CITATION_STYLE_FINDER_PATH,
  },
  comingSoon("apa-citation-generator", "APA Citation Generator", "Formats references and in-text citations in APA Style, 7th edition.", "citation"),
  comingSoon("mla-citation-generator", "MLA Citation Generator", "Formats works-cited entries and in-text citations in MLA Style, 9th edition.", "citation"),
  comingSoon("chicago-citation-generator", "Chicago Citation Generator", "Formats notes, bibliographies and author–date citations in Chicago Style, 18th edition.", "citation"),
  comingSoon("ieee-citation-generator", "IEEE Citation Generator", "Formats numbered references in IEEE Style.", "citation"),
  comingSoon("harvard-citation-generator", "Harvard Citation Generator", "Formats author–date references in Harvard style.", "citation"),
  comingSoon("reference-checker", "Reference Checker", "Checks a reference list for missing details and common formatting errors.", "citation"),

  comingSoon("word-counter", "Word Counter", "Counts the words in your text against an assignment's word limit.", "writing"),
  comingSoon("character-counter", "Character Counter", "Counts characters, with and without spaces.", "writing"),
  comingSoon("reading-time-calculator", "Reading Time Calculator", "Estimates how long a text takes to read, or to present aloud.", "writing"),
  comingSoon("paragraph-counter", "Paragraph Counter", "Counts the paragraphs in your text.", "writing"),
  comingSoon("sentence-counter", "Sentence Counter", "Counts sentences and shows their average length.", "writing"),
  comingSoon("readability-checker", "Readability Checker", "Scores how easy your text is to read, using established readability formulas.", "writing"),

  comingSoon("sample-size-calculator", "Sample Size Calculator", "Works out how many participants your study needs.", "statistics"),
  comingSoon("statistical-test-finder", "Statistical Test Finder", "Suggests a suitable statistical test for your data and research question.", "statistics"),
  comingSoon("effect-size-calculator", "Effect Size Calculator", "Calculates common effect sizes, such as Cohen's d, from your results.", "statistics"),
  comingSoon("power-analysis", "Power Analysis", "Estimates a study's statistical power, or the sample size needed to reach it.", "statistics"),
  comingSoon("confidence-interval-calculator", "Confidence Interval Calculator", "Calculates confidence intervals for means and proportions.", "statistics"),

  comingSoon("research-question-builder", "Research Question Builder", "Helps you shape a focused, answerable research question.", "research"),
  comingSoon("research-objectives-generator", "Research Objectives Generator", "Helps you turn a research question into clear, measurable objectives.", "research"),
  comingSoon("hypothesis-builder", "Hypothesis Builder", "Helps you state testable null and alternative hypotheses.", "research"),
  comingSoon("research-title-generator", "Research Title Generator", "Suggests title structures for your topic and method, for you to refine.", "research"),
  comingSoon("research-design-guide", "Research Design Guide", "Explains research designs and helps you choose one that fits your question.", "research"),
];

/** A category's tools, available ones first, in catalogue order otherwise. */
export function toolsInCategory(category: ToolCategoryId): ToolEntry[] {
  const tools = TOOLS.filter((tool) => tool.category === category);
  return [...tools.filter((tool) => tool.status === "available"), ...tools.filter((tool) => tool.status !== "available")];
}

export function countByStatus(tools: readonly ToolEntry[]): Record<ToolStatus, number> {
  return {
    available: tools.filter((tool) => tool.status === "available").length,
    "coming-soon": tools.filter((tool) => tool.status === "coming-soon").length,
  };
}
