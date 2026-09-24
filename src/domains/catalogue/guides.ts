/**
 * The guide catalogue: which guides exist or are planned, and how they are
 * grouped. Published guides take their title and description from the guide
 * registry, so a listing can never disagree with the guide itself.
 */

import { getGuide, guidePath } from "@/domains/publishing";
import { TOOL_ID as WORD_COUNTER_ID } from "@/tools/word-counter/path";
import { availableFirst, comingSoon as catalogueComingSoon, type CatalogueItem } from "./item";

/** The guides index address. Provisional until the URL strategy (ADR-0005) is accepted. */
export const GUIDES_INDEX_PATH = "/learn";

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

export type GuideEntry = CatalogueItem & {
  category: GuideCategoryId;
  /** For planned guides: tools the guide will support. Published guides declare this in their content. */
  relatedToolIds?: readonly string[];
};

/** A published guide's listing, read from the registry. Fails the build if the guide is missing. */
function published(slug: string, category: GuideCategoryId): GuideEntry {
  const guide = getGuide(slug);
  if (!guide) throw new Error(`Guide catalogue lists "${slug}", but no such guide is published.`);
  return {
    id: slug,
    name: guide.title,
    description: guide.description,
    category,
    status: "available",
    href: guidePath(slug),
  };
}

const comingSoon = (
  id: string,
  name: string,
  description: string,
  category: GuideCategoryId,
  relatedToolIds: readonly string[] = [],
): GuideEntry => catalogueComingSoon(id, name, description, { category, relatedToolIds });

export const GUIDE_LISTINGS: readonly GuideEntry[] = [
  published("how-to-choose-a-citation-style", "citation"),
  comingSoon("how-to-cite-a-website", "How to cite a website", "What to include when citing a web page, and what to do when details are missing.", "citation"),
  comingSoon("how-to-avoid-plagiarism", "How to avoid plagiarism", "How quoting, paraphrasing and citing work together to credit other people's ideas.", "citation"),
  comingSoon("reference-list-or-bibliography", "Reference list or bibliography?", "What each term means, and which one your citation style uses.", "citation"),

  comingSoon("how-to-write-a-research-question", "How to write a research question", "What makes a research question focused, answerable and worth asking.", "research-methods"),
  comingSoon("qualitative-or-quantitative-research", "Qualitative or quantitative research?", "How the two approaches differ, and how to choose between them.", "research-methods"),
  comingSoon("how-to-write-a-literature-review", "How to write a literature review", "How to find, organise and synthesise sources into a coherent review.", "research-methods"),

  comingSoon("how-to-structure-an-academic-essay", "How to structure an academic essay", "How introductions, arguments and conclusions fit together.", "writing"),
  comingSoon("how-to-write-an-abstract", "How to write an abstract", "What an abstract must include, and how to fit it within a word limit.", "writing"),
  comingSoon("how-to-paraphrase", "How to paraphrase correctly", "How to restate a source in your own words while crediting it.", "writing"),
  comingSoon(
    "how-to-meet-a-word-limit",
    "How to meet a word limit",
    "What usually counts towards a word limit, and how to cut words without losing substance.",
    "writing",
    [WORD_COUNTER_ID],
  ),

  comingSoon("how-to-choose-a-statistical-test", "How to choose a statistical test", "How your data and research question point to the right test.", "statistics"),
  comingSoon("what-a-p-value-tells-you", "What a p-value tells you", "What a p-value means, and the common ways it is misread.", "statistics"),
  comingSoon("how-to-report-statistics-in-apa", "How to report statistics in APA Style", "How to present test results, effect sizes and confidence intervals.", "statistics"),

  comingSoon("how-to-read-a-research-paper", "How to read a research paper", "How to find what matters in a paper without reading every word.", "academic-skills"),
  comingSoon("how-to-manage-your-references", "How to manage your references", "How to keep track of sources from the start of a project.", "academic-skills"),
  comingSoon("how-to-plan-a-dissertation", "How to plan a dissertation", "How to break a dissertation into stages with realistic deadlines.", "academic-skills"),
];

/**
 * Guides related to this tool, published ones first. The relationship is declared
 * once, on the guide (in its content once published), so a tool and its guides
 * always point to each other.
 */
export function guidesForTool(toolId: string): GuideEntry[] {
  return availableFirst(
    GUIDE_LISTINGS.filter((entry) =>
      entry.status === "available"
        ? getGuide(entry.id)?.relatedToolIds.includes(toolId)
        : entry.relatedToolIds?.includes(toolId),
    ),
  );
}

export function guidesInCategory(category: GuideCategoryId): GuideEntry[] {
  return availableFirst(GUIDE_LISTINGS.filter((guide) => guide.category === category));
}
