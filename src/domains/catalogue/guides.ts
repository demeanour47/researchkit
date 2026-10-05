/**
 * The guide catalogue: which guides exist or are planned, and how they are
 * grouped. Published guides take their title and description from the guide
 * registry, so a listing can never disagree with the guide itself.
 */

import { getGuide, guidePath } from "@/domains/publishing";
import { GUIDE_PLAN, type GuideCategoryId, type GuidePlacement, type ResearchStageId } from "./guide-plan";
import { availableFirst, comingSoon as catalogueComingSoon, type CatalogueItem } from "./item";

/** The guides index address. Provisional until the URL strategy (ADR-0005) is accepted. */
export const GUIDES_INDEX_PATH = "/learn";

export { GUIDE_CATEGORIES, RESEARCH_STAGES, type GuideCategoryId, type ResearchStageId } from "./guide-plan";

/** The id of a research stage's section on the guides index. */
export const stageAnchor = (stage: ResearchStageId) => `stage-${stage}`;
/** The address of a research stage's guides on the guides index. */
export const stagePath = (stage: ResearchStageId) => `${GUIDES_INDEX_PATH}#${stageAnchor(stage)}`;

export type GuideEntry = CatalogueItem & {
  category: GuideCategoryId;
  stage: ResearchStageId;
  /** For planned guides: tools the guide will support. Published guides declare this in their content. */
  relatedToolIds?: readonly string[];
};

/** A guide's listing. A published guide's title and description come from the guide itself; the build fails if it is missing. */
function listing({ slug, category, stage, planned }: GuidePlacement): GuideEntry {
  if (planned) return catalogueComingSoon(slug, planned.title, planned.description, { category, stage, relatedToolIds: planned.relatedToolIds ?? [] });
  const guide = getGuide(slug);
  if (!guide) throw new Error(`Guide plan lists "${slug}", but no such guide is published.`);
  return { id: slug, name: guide.title, description: guide.description, category, stage, status: "available", href: guidePath(slug) };
}

export const GUIDE_LISTINGS: readonly GuideEntry[] = GUIDE_PLAN.map(listing);

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

/** A stage's guides, available ones first, in reading order otherwise. */
export function guidesInStage(stage: ResearchStageId): GuideEntry[] {
  return availableFirst(GUIDE_LISTINGS.filter((guide) => guide.stage === stage));
}

/** The published guides with these slugs, in the order given. */
export function publishedGuides(slugs: readonly string[]): (GuideEntry & { status: "available" })[] {
  return slugs.flatMap((slug) => GUIDE_LISTINGS.filter((guide): guide is GuideEntry & { status: "available" } => guide.id === slug && guide.status === "available"));
}
