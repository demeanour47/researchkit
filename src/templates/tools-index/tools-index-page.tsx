import { ButtonLink, FeatureBanner, Section, SectionHeader } from "@/ui";
import { GUIDES_INDEX_PATH, TOOL_CATEGORIES, toolsInCategory } from "@/domains/catalogue";
import { CATEGORY_ICONS, CatalogueList, availableTools, toolIcon } from "@/features/catalogue";
import { CatalogueIndexPage } from "@/templates/catalogue-index";
import { ESSENTIAL_TOOL_IDS, FEATURED_TOOL_ID, LATEST_TOOL_IDS } from "@/config/highlights";
import { featured as featuredCopy } from "@/templates/home/copy";
import { toolsIndex } from "./copy";

/** The featured tool, recommended starting points and newest tools, shown before the full directory. */
function Highlights() {
  const [featured] = availableTools([FEATURED_TOOL_ID]);
  return (
    <>
      {featured && (
        <Section labelledBy="featured-title" spacing="compact">
          <FeatureBanner
            titleId="featured-title"
            icon={toolIcon(featured)}
            eyebrow={toolsIndex.featured.eyebrow}
            title={featured.name}
            description={featured.description}
            highlights={featuredCopy.highlights}
            actions={
              <ButtonLink href={featured.href} trailingIcon="arrow-right">
                {toolsIndex.featured.action}
              </ButtonLink>
            }
          />
        </Section>
      )}
      <Section labelledBy="recommended-title" spacing="compact">
        <SectionHeader id="recommended-title" title={toolsIndex.recommended.heading} description={toolsIndex.recommended.description} />
        <CatalogueList items={availableTools(ESSENTIAL_TOOL_IDS)} showCategory />
      </Section>
      <Section labelledBy="latest-title" spacing="compact">
        <SectionHeader id="latest-title" title={toolsIndex.latest.heading} description={toolsIndex.latest.description} />
        <CatalogueList items={availableTools(LATEST_TOOL_IDS)} layout="quad" showCategory />
      </Section>
    </>
  );
}

/** The directory of every ResearchKit tool, grouped by category, with search and filters. */
export function ToolsIndexPage() {
  return (
    <CatalogueIndexPage
      title={toolsIndex.title}
      eyebrow={toolsIndex.eyebrow}
      intro={toolsIndex.intro}
      plannedNote={toolsIndex.plannedNote}
      plural={toolsIndex.plural}
      kind="tool"
      sections={TOOL_CATEGORIES.map((category) => ({ ...category, icon: CATEGORY_ICONS[category.id], items: toolsInCategory(category.id) }))}
      crossLink={{ ...toolsIndex.crossLink, href: GUIDES_INDEX_PATH }}
      highlights={<Highlights />}
    />
  );
}
