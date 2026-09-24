import { GUIDE_CATEGORIES, TOOLS_INDEX_PATH, guidesInCategory } from "@/domains/catalogue";
import { CatalogueIndexPage } from "@/templates/catalogue-index";
import { guidesIndex } from "./copy";

/** The directory of every ResearchKit guide, grouped by category. */
export function GuidesIndexPage() {
  return (
    <CatalogueIndexPage
      title={guidesIndex.title}
      intro={guidesIndex.intro}
      plannedNote={guidesIndex.plannedNote}
      categoriesLabel={guidesIndex.categoriesLabel}
      sections={GUIDE_CATEGORIES.map((category) => ({ ...category, items: guidesInCategory(category.id) }))}
      crossLink={{ ...guidesIndex.crossLink, href: TOOLS_INDEX_PATH }}
    />
  );
}
