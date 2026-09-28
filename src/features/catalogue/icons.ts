import type { IconName } from "@/ui";
import type { ToolCategoryId, ToolEntry } from "@/domains/catalogue";

/**
 * The picture that stands for each tool and category, wherever it is listed.
 * Presentation only: the catalogue itself knows nothing about icons.
 */
export const CATEGORY_ICONS: Record<ToolCategoryId, IconName> = {
  citation: "citation",
  writing: "writing",
  statistics: "statistics",
  research: "research",
};

const TOOL_ICONS: Record<string, IconName> = {
  "citation-style-finder": "library",
  "apa-citation-generator": "citation",
  "word-counter": "hash",
  "character-counter": "keyboard",
  "reading-time-calculator": "clock",
  "text-statistics": "type",
  "sample-size-calculator": "statistics",
  "data-analysis-recommender": "analysis",
  "results-interpretation": "lightbulb",
  "statistical-assumption-checker": "list-checks",
  "chart-builder": "charts",
  "table-builder": "tables",
  "research-onion": "layers",
  "research-question-builder": "target",
  "hypothesis-builder": "flask",
  "variables-builder": "variable",
  "conceptual-framework-builder": "network",
  "research-design-builder": "methodology",
  "sampling-builder": "users",
  "questionnaire-builder": "clipboard-list",
  "literature-matrix": "layout-grid",
  "prisma-flow-builder": "workflow",
};

/** A tool's own icon, or its category's while it has none. */
export const toolIcon = (tool: Pick<ToolEntry, "id" | "category">): IconName => TOOL_ICONS[tool.id] ?? CATEGORY_ICONS[tool.category];
