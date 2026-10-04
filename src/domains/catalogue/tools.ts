/**
 * The tool catalogue: the single source of truth for which tools exist, how they
 * are grouped, and whether they are available yet. Every page that lists tools
 * reads from here. The wording will move to the content layer when it exists.
 */

import { page as apaGenerator } from "@/tools/apa-citation-generator/copy";
import { page as characterCounter } from "@/tools/character-counter/copy";
import { TOOL_ID as CHARACTER_COUNTER_ID, TOOL_PATH as CHARACTER_COUNTER_PATH } from "@/tools/character-counter/path";
import { TOOL_ID as APA_GENERATOR_ID, TOOL_PATH as APA_GENERATOR_PATH } from "@/tools/apa-citation-generator/path";
import { page as chicagoAuthorDateGenerator } from "@/tools/chicago-author-date-citation-generator/copy";
import {
  TOOL_ID as CHICAGO_AUTHOR_DATE_GENERATOR_ID,
  TOOL_PATH as CHICAGO_AUTHOR_DATE_GENERATOR_PATH,
} from "@/tools/chicago-author-date-citation-generator/path";
import { page as mlaGenerator } from "@/tools/mla-citation-generator/copy";
import { TOOL_ID as MLA_GENERATOR_ID, TOOL_PATH as MLA_GENERATOR_PATH } from "@/tools/mla-citation-generator/path";
import { page as referenceChecker } from "@/tools/reference-checker/copy";
import { TOOL_ID as REFERENCE_CHECKER_ID, TOOL_PATH as REFERENCE_CHECKER_PATH } from "@/tools/reference-checker/path";
import { page as citationStyleFinder } from "@/tools/citation-style-finder/copy";
import {
  TOOL_ID as CITATION_STYLE_FINDER_ID,
  TOOL_PATH as CITATION_STYLE_FINDER_PATH,
} from "@/tools/citation-style-finder/path";
import { page as conceptualFrameworkBuilder } from "@/tools/conceptual-framework-builder/copy";
import {
  TOOL_ID as CONCEPTUAL_FRAMEWORK_BUILDER_ID,
  TOOL_PATH as CONCEPTUAL_FRAMEWORK_BUILDER_PATH,
} from "@/tools/conceptual-framework-builder/path";
import { page as hypothesisBuilder } from "@/tools/hypothesis-builder/copy";
import { page as sampleSizeCalculator } from "@/tools/sample-size-calculator/copy";
import { TOOL_ID as SAMPLE_SIZE_CALCULATOR_ID, TOOL_PATH as SAMPLE_SIZE_CALCULATOR_PATH } from "@/tools/sample-size-calculator/path";
import { page as statisticalTestFinder } from "@/tools/statistical-test-finder/copy";
import { TOOL_ID as STATISTICAL_TEST_FINDER_ID, TOOL_PATH as STATISTICAL_TEST_FINDER_PATH } from "@/tools/statistical-test-finder/path";
import { page as effectSizeCalculator } from "@/tools/effect-size-calculator/copy";
import { TOOL_ID as EFFECT_SIZE_CALCULATOR_ID, TOOL_PATH as EFFECT_SIZE_CALCULATOR_PATH } from "@/tools/effect-size-calculator/path";
import { page as spssResearchLab } from "@/tools/spss-research-lab/copy";
import { TOOL_ID as SPSS_RESEARCH_LAB_ID, TOOL_PATH as SPSS_RESEARCH_LAB_PATH } from "@/tools/spss-research-lab/path";
import { page as dataAnalysisRecommender } from "@/tools/data-analysis-recommender/copy";
import { TOOL_ID as DATA_ANALYSIS_RECOMMENDER_ID, TOOL_PATH as DATA_ANALYSIS_RECOMMENDER_PATH } from "@/tools/data-analysis-recommender/path";
import { page as questionnaireBuilder } from "@/tools/questionnaire-builder/copy";
import { page as resultsInterpretation } from "@/tools/results-interpretation/copy";
import { page as chartBuilder } from "@/tools/chart-builder/copy";
import { page as tableBuilder } from "@/tools/table-builder/copy";
import { page as literatureMatrix } from "@/tools/literature-matrix/copy";
import { page as prismaFlowBuilder } from "@/tools/prisma-flow-builder/copy";
import { TOOL_ID as PRISMA_FLOW_BUILDER_ID, TOOL_PATH as PRISMA_FLOW_BUILDER_PATH } from "@/tools/prisma-flow-builder/path";
import { TOOL_ID as LITERATURE_MATRIX_ID, TOOL_PATH as LITERATURE_MATRIX_PATH } from "@/tools/literature-matrix/path";
import { TOOL_ID as TABLE_BUILDER_ID, TOOL_PATH as TABLE_BUILDER_PATH } from "@/tools/table-builder/path";
import { TOOL_ID as CHART_BUILDER_ID, TOOL_PATH as CHART_BUILDER_PATH } from "@/tools/chart-builder/path";
import { page as statisticalAssumptionChecker } from "@/tools/statistical-assumption-checker/copy";
import { TOOL_ID as STATISTICAL_ASSUMPTION_CHECKER_ID, TOOL_PATH as STATISTICAL_ASSUMPTION_CHECKER_PATH } from "@/tools/statistical-assumption-checker/path";
import { TOOL_ID as RESULTS_INTERPRETATION_ID, TOOL_PATH as RESULTS_INTERPRETATION_PATH } from "@/tools/results-interpretation/path";
import { TOOL_ID as QUESTIONNAIRE_BUILDER_ID, TOOL_PATH as QUESTIONNAIRE_BUILDER_PATH } from "@/tools/questionnaire-builder/path";
import { page as samplingBuilder } from "@/tools/sampling-builder/copy";
import { TOOL_ID as SAMPLING_BUILDER_ID, TOOL_PATH as SAMPLING_BUILDER_PATH } from "@/tools/sampling-builder/path";
import { page as researchDesignBuilder } from "@/tools/research-design-builder/copy";
import {
  TOOL_ID as RESEARCH_DESIGN_BUILDER_ID,
  TOOL_PATH as RESEARCH_DESIGN_BUILDER_PATH,
} from "@/tools/research-design-builder/path";
import { page as variablesBuilder } from "@/tools/variables-builder/copy";
import { TOOL_ID as VARIABLES_BUILDER_ID, TOOL_PATH as VARIABLES_BUILDER_PATH } from "@/tools/variables-builder/path";
import { TOOL_ID as HYPOTHESIS_BUILDER_ID, TOOL_PATH as HYPOTHESIS_BUILDER_PATH } from "@/tools/hypothesis-builder/path";
import { page as readingTime } from "@/tools/reading-time/copy";
import { page as researchTitleBuilder } from "@/tools/research-title-builder/copy";
import { TOOL_ID as RESEARCH_TITLE_BUILDER_ID, TOOL_PATH as RESEARCH_TITLE_BUILDER_PATH } from "@/tools/research-title-builder/path";
import { page as researchOnion } from "@/tools/research-onion/copy";
import { TOOL_ID as RESEARCH_ONION_ID, TOOL_PATH as RESEARCH_ONION_PATH } from "@/tools/research-onion/path";
import { page as researchQuestionBuilder } from "@/tools/research-question-builder/copy";
import {
  TOOL_ID as RESEARCH_QUESTION_BUILDER_ID,
  TOOL_PATH as RESEARCH_QUESTION_BUILDER_PATH,
} from "@/tools/research-question-builder/path";
import { page as researchObjectivesGenerator } from "@/tools/research-objectives-generator/copy";
import {
  TOOL_ID as RESEARCH_OBJECTIVES_GENERATOR_ID,
  TOOL_PATH as RESEARCH_OBJECTIVES_GENERATOR_PATH,
} from "@/tools/research-objectives-generator/path";
import { page as textStatistics } from "@/tools/text-statistics/copy";
import { TOOL_ID as TEXT_STATISTICS_ID, TOOL_PATH as TEXT_STATISTICS_PATH } from "@/tools/text-statistics/path";
import { TOOL_ID as READING_TIME_ID, TOOL_PATH as READING_TIME_PATH } from "@/tools/reading-time/path";
import { page as wordCounter } from "@/tools/word-counter/copy";
import { TOOL_ID as WORD_COUNTER_ID, TOOL_PATH as WORD_COUNTER_PATH } from "@/tools/word-counter/path";
import { availableFirst, comingSoon as catalogueComingSoon, type CatalogueItem } from "./item";

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

/** Tools that work on the same material and point to one another. */
export type ToolFamily = "citation" | "text-analysis" | "research" | "statistics";

export type ToolEntry = CatalogueItem & {
  category: ToolCategoryId;
  family?: ToolFamily;
};

const comingSoon = (id: string, name: string, description: string, category: ToolCategoryId): ToolEntry =>
  catalogueComingSoon(id, name, description, { category });

export const TOOLS: readonly ToolEntry[] = [
  {
    id: CITATION_STYLE_FINDER_ID,
    name: citationStyleFinder.title,
    description: citationStyleFinder.description,
    category: "citation",
    family: "citation",
    status: "available",
    href: CITATION_STYLE_FINDER_PATH,
  },
  {
    id: APA_GENERATOR_ID,
    name: apaGenerator.title,
    description: apaGenerator.summary,
    category: "citation",
    family: "citation",
    status: "available",
    href: APA_GENERATOR_PATH,
  },
  {
    id: MLA_GENERATOR_ID,
    name: mlaGenerator.title,
    description: mlaGenerator.summary,
    category: "citation",
    family: "citation",
    status: "available",
    href: MLA_GENERATOR_PATH,
  },
  {
    id: CHICAGO_AUTHOR_DATE_GENERATOR_ID,
    name: chicagoAuthorDateGenerator.title,
    description: chicagoAuthorDateGenerator.summary,
    category: "citation",
    family: "citation",
    status: "available",
    href: CHICAGO_AUTHOR_DATE_GENERATOR_PATH,
  },
  comingSoon("chicago-notes-bibliography-citation-generator", "Chicago Notes-Bibliography Citation Generator", "Formats footnotes and bibliography entries in Chicago style, 18th edition.", "citation"),
  comingSoon("ieee-citation-generator", "IEEE Citation Generator", "Formats numbered references in IEEE Style.", "citation"),
  comingSoon("harvard-citation-generator", "Harvard Citation Generator", "Formats author–date references in Harvard style.", "citation"),
  {
    id: REFERENCE_CHECKER_ID,
    name: referenceChecker.title,
    description: referenceChecker.summary,
    category: "citation",
    family: "citation",
    status: "available",
    href: REFERENCE_CHECKER_PATH,
  },

  {
    id: WORD_COUNTER_ID,
    name: wordCounter.title,
    description: wordCounter.summary,
    category: "writing",
    family: "text-analysis",
    status: "available",
    href: WORD_COUNTER_PATH,
  },
  {
    id: CHARACTER_COUNTER_ID,
    name: characterCounter.title,
    description: characterCounter.summary,
    category: "writing",
    family: "text-analysis",
    status: "available",
    href: CHARACTER_COUNTER_PATH,
  },
  {
    id: READING_TIME_ID,
    name: readingTime.title,
    description: readingTime.summary,
    category: "writing",
    family: "text-analysis",
    status: "available",
    href: READING_TIME_PATH,
  },
  {
    id: TEXT_STATISTICS_ID,
    name: textStatistics.title,
    description: textStatistics.summary,
    category: "writing",
    family: "text-analysis",
    status: "available",
    href: TEXT_STATISTICS_PATH,
  },
  comingSoon("paragraph-counter", "Paragraph Counter", "Counts the paragraphs in your text.", "writing"),
  comingSoon("sentence-counter", "Sentence Counter", "Counts sentences and shows their average length.", "writing"),
  comingSoon("readability-checker", "Readability Checker", "Scores how easy your text is to read, using established readability formulas.", "writing"),

  {
    id: SAMPLE_SIZE_CALCULATOR_ID,
    name: sampleSizeCalculator.title,
    description: sampleSizeCalculator.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: SAMPLE_SIZE_CALCULATOR_PATH,
  },
  {
    id: STATISTICAL_TEST_FINDER_ID,
    name: statisticalTestFinder.title,
    description: statisticalTestFinder.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: STATISTICAL_TEST_FINDER_PATH,
  },
  {
    id: EFFECT_SIZE_CALCULATOR_ID,
    name: effectSizeCalculator.title,
    description: effectSizeCalculator.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: EFFECT_SIZE_CALCULATOR_PATH,
  },
  {
    id: SPSS_RESEARCH_LAB_ID,
    name: spssResearchLab.title,
    description: spssResearchLab.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: SPSS_RESEARCH_LAB_PATH,
  },
  comingSoon("power-analysis", "Power Analysis", "Estimates a study's statistical power, or the sample size needed to reach it.", "statistics"),
  comingSoon("confidence-interval-calculator", "Confidence Interval Calculator", "Calculates confidence intervals for means and proportions.", "statistics"),

  {
    id: RESEARCH_ONION_ID,
    name: researchOnion.title,
    description: researchOnion.summary,
    category: "research",
    family: "research",
    status: "available",
    href: RESEARCH_ONION_PATH,
  },
  {
    id: RESEARCH_QUESTION_BUILDER_ID,
    name: researchQuestionBuilder.title,
    description: researchQuestionBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: RESEARCH_QUESTION_BUILDER_PATH,
  },
  {
    id: RESEARCH_OBJECTIVES_GENERATOR_ID,
    name: researchObjectivesGenerator.title,
    description: researchObjectivesGenerator.summary,
    category: "research",
    family: "research",
    status: "available",
    href: RESEARCH_OBJECTIVES_GENERATOR_PATH,
  },
  {
    id: HYPOTHESIS_BUILDER_ID,
    name: hypothesisBuilder.title,
    description: hypothesisBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: HYPOTHESIS_BUILDER_PATH,
  },
  {
    id: VARIABLES_BUILDER_ID,
    name: variablesBuilder.title,
    description: variablesBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: VARIABLES_BUILDER_PATH,
  },
  {
    id: CONCEPTUAL_FRAMEWORK_BUILDER_ID,
    name: conceptualFrameworkBuilder.title,
    description: conceptualFrameworkBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: CONCEPTUAL_FRAMEWORK_BUILDER_PATH,
  },
  {
    id: RESEARCH_TITLE_BUILDER_ID,
    name: researchTitleBuilder.title,
    description: researchTitleBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: RESEARCH_TITLE_BUILDER_PATH,
  },
  {
    id: RESEARCH_DESIGN_BUILDER_ID,
    name: researchDesignBuilder.title,
    description: researchDesignBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: RESEARCH_DESIGN_BUILDER_PATH,
  },
  {
    id: SAMPLING_BUILDER_ID,
    name: samplingBuilder.title,
    description: samplingBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: SAMPLING_BUILDER_PATH,
  },
  {
    id: QUESTIONNAIRE_BUILDER_ID,
    name: questionnaireBuilder.title,
    description: questionnaireBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: QUESTIONNAIRE_BUILDER_PATH,
  },
  {
    id: DATA_ANALYSIS_RECOMMENDER_ID,
    name: dataAnalysisRecommender.title,
    description: dataAnalysisRecommender.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: DATA_ANALYSIS_RECOMMENDER_PATH,
  },
  {
    id: RESULTS_INTERPRETATION_ID,
    name: resultsInterpretation.title,
    description: resultsInterpretation.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: RESULTS_INTERPRETATION_PATH,
  },
  {
    id: STATISTICAL_ASSUMPTION_CHECKER_ID,
    name: statisticalAssumptionChecker.title,
    description: statisticalAssumptionChecker.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: STATISTICAL_ASSUMPTION_CHECKER_PATH,
  },
  {
    id: CHART_BUILDER_ID,
    name: chartBuilder.title,
    description: chartBuilder.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: CHART_BUILDER_PATH,
  },
  {
    id: TABLE_BUILDER_ID,
    name: tableBuilder.title,
    description: tableBuilder.summary,
    category: "statistics",
    family: "statistics",
    status: "available",
    href: TABLE_BUILDER_PATH,
  },
  {
    id: LITERATURE_MATRIX_ID,
    name: literatureMatrix.title,
    description: literatureMatrix.summary,
    category: "research",
    family: "research",
    status: "available",
    href: LITERATURE_MATRIX_PATH,
  },
  {
    id: PRISMA_FLOW_BUILDER_ID,
    name: prismaFlowBuilder.title,
    description: prismaFlowBuilder.summary,
    category: "research",
    family: "research",
    status: "available",
    href: PRISMA_FLOW_BUILDER_PATH,
  },
];

/** The other tools in a tool's family, available ones first. Empty for a tool without a family. */
export function relatedTools(toolId: string): ToolEntry[] {
  const family = TOOLS.find((tool) => tool.id === toolId)?.family;
  if (!family) return [];
  return availableFirst(TOOLS.filter((tool) => tool.family === family && tool.id !== toolId));
}

/** A category's tools, available ones first, in catalogue order otherwise. */
export function toolsInCategory(category: ToolCategoryId): ToolEntry[] {
  return availableFirst(TOOLS.filter((tool) => tool.category === category));
}
