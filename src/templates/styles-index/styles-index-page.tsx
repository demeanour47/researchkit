import { Hero, Link, PageContainer, Section, SectionHeader } from "@/ui";
import { CatalogueList, STYLE_LISTINGS } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";
import { TOOL_PATH as CITATION_STYLE_FINDER_PATH } from "@/tools/citation-style-finder/path";
import { stylesIndex } from "./copy";

/** The directory of citation style pages. */
export function StylesIndexPage() {
  return (
    <>
      <Hero
        titleId="styles-title"
        eyebrow={stylesIndex.eyebrow}
        title={stylesIndex.title}
        description={stylesIndex.intro}
        before={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: stylesIndex.title }]} />}
      >
        <p className="text-small text-text-muted">
          {stylesIndex.crossLink.lead} <Link href={CITATION_STYLE_FINDER_PATH}>{stylesIndex.crossLink.label}</Link>.
        </p>
      </Hero>

      <PageContainer>
        <Section labelledBy="styles-list-title">
          <SectionHeader id="styles-list-title" title={stylesIndex.listHeading} />
          <CatalogueList items={STYLE_LISTINGS} kind="style" />
        </Section>
      </PageContainer>
    </>
  );
}
