import { GUIDES_INDEX_PATH, TOOL_CATEGORIES, toolsInCategory } from "@/domains/catalogue";
import { CatalogueIndexPage } from "@/templates/catalogue-index";
import { toolsIndex } from "./copy";

/** The directory of every ResearchKit tool, grouped by category. */
export function ToolsIndexPage() {
  return (
    <CatalogueIndexPage
      title={toolsIndex.title}
      intro={toolsIndex.intro}
      plannedNote={toolsIndex.plannedNote}
      categoriesLabel={toolsIndex.categoriesLabel}
      sections={TOOL_CATEGORIES.map((category) => ({ ...category, items: toolsInCategory(category.id) }))}
      crossLink={{ ...toolsIndex.crossLink, href: GUIDES_INDEX_PATH }}
    />
  );
}
