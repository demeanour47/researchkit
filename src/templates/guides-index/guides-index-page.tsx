import type { IconName } from "@/ui";
import { GUIDE_CATEGORIES, TOOLS_INDEX_PATH, guidesInCategory, type GuideCategoryId } from "@/domains/catalogue";
import { CatalogueIndexPage } from "@/templates/catalogue-index";
import { guidesIndex } from "./copy";

const CATEGORY_ICONS: Record<GuideCategoryId, IconName> = {
  citation: "citation",
  "research-methods": "methodology",
  writing: "writing",
  statistics: "statistics",
  "academic-skills": "learning",
};

/** The directory of every ResearchKit guide, grouped by category, with search and filters. */
export function GuidesIndexPage() {
  return (
    <CatalogueIndexPage
      title={guidesIndex.title}
      eyebrow={guidesIndex.eyebrow}
      intro={guidesIndex.intro}
      plannedNote={guidesIndex.plannedNote}
      plural={guidesIndex.plural}
      kind="guide"
      sections={GUIDE_CATEGORIES.map((category) => ({ ...category, icon: CATEGORY_ICONS[category.id], items: guidesInCategory(category.id) }))}
      crossLink={{ ...guidesIndex.crossLink, href: TOOLS_INDEX_PATH }}
    />
  );
}
