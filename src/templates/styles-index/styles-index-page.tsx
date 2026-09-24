import { Link, PageContainer, Section, SectionHeader } from "@/ui";
import type { CatalogueItem } from "@/domains/catalogue";
import { getStyleProfile, profiledStyles, stylePath } from "@/domains/publishing";
import { CatalogueList } from "@/features/catalogue";
import { styleTitle } from "@/knowledge/citation/styles";
import { TOOL_PATH as CITATION_STYLE_FINDER_PATH } from "@/tools/citation-style-finder/path";
import { stylesIndex } from "./copy";

const styles: CatalogueItem[] = profiledStyles().map((style) => ({
  id: style,
  name: styleTitle(style),
  description: getStyleProfile(style).summary,
  status: "available",
  href: stylePath(style),
}));

/** The directory of citation style pages. */
export function StylesIndexPage() {
  return (
    <PageContainer>
      <Section labelledBy="styles-title" spacing="compact">
        <div className="grid max-w-reading gap-4">
          <h1 id="styles-title" className="font-display text-title font-semibold text-balance">
            {stylesIndex.title}
          </h1>
          <p className="text-lead text-text-muted">{stylesIndex.intro}</p>
          <p className="text-small">
            {stylesIndex.crossLink.lead}{" "}
            <Link href={CITATION_STYLE_FINDER_PATH}>{stylesIndex.crossLink.label}</Link>.
          </p>
        </div>
      </Section>

      <Section labelledBy="styles-list-title" spacing="compact">
        <SectionHeader id="styles-list-title" title={stylesIndex.listHeading} />
        <CatalogueList items={styles} showStatus={false} />
      </Section>
    </PageContainer>
  );
}
