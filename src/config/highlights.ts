/**
 * Editorial choices about which tools to put forward. These are choices, not
 * measurements: ResearchKit collects no usage data, so nothing here claims
 * popularity. Ids that don't match an available tool are ignored.
 */

/** The tool the homepage and tools index present at length. */
export const FEATURED_TOOL_ID = "prisma-flow-builder";

/** Good first tools for someone new to ResearchKit, one from each stage of a project. */
export const ESSENTIAL_TOOL_IDS = [
  "research-question-builder",
  "research-design-builder",
  "sample-size-calculator",
  "data-analysis-recommender",
  "apa-citation-generator",
  "word-counter",
] as const;

/** The most recently published tools, newest first, from the project's release history. */
export const LATEST_TOOL_IDS = ["prisma-flow-builder", "literature-matrix", "table-builder", "chart-builder"] as const;
