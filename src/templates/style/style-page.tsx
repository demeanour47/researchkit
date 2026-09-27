import { Callout, Card, Hero, Link, PageContainer, Section, SectionHeader } from "@/ui";
import { GUIDE_LISTINGS, TOOLS, type CatalogueItem } from "@/domains/catalogue";
import { STYLES_INDEX_PATH, getStyleProfile, type ProfiledStyleId } from "@/domains/publishing";
import { CatalogueCard } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";
import { CITATION_STYLES, styleTitle } from "@/knowledge/citation/styles";
import { stylePageCopy as copy, usefulNowIds } from "./copy";

const usefulNowTool = TOOLS.find((tool) => tool.id === usefulNowIds.tool);
const usefulNowGuide = GUIDE_LISTINGS.find((guide) => guide.id === usefulNowIds.guide);

/** A citation style's page: what it is, where it's used, and what to use until its full guide is published. */
export function StylePage({ style }: { style: ProfiledStyleId }) {
  const profile = getStyleProfile(style);
  const facts = CITATION_STYLES[style];
  const usefulNow: [CatalogueItem, "tool" | "guide"][] = [
    ...(usefulNowTool ? [[usefulNowTool, "tool"] as [CatalogueItem, "tool"]] : []),
    ...(usefulNowGuide ? [[usefulNowGuide, "guide"] as [CatalogueItem, "guide"]] : []),
  ];

  return (
    <>
      <Hero
        titleId="style-title"
        width="reading"
        eyebrow={copy.eyebrow}
        title={styleTitle(style)}
        description={profile.summary}
        before={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: copy.allStyles, href: STYLES_INDEX_PATH }, { label: styleTitle(style) }]} />}
      >
        <p className="text-small text-text-muted">{copy.reviewStatus}</p>
      </Hero>

      <PageContainer width="reading" className="grid gap-8 py-section-compact">
        <Card as="dl" padding="lg" className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-1">
            <dt className="text-caption font-semibold tracking-wide text-text-muted uppercase">{copy.definedBy}</dt>
            <dd>{facts.authority}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-caption font-semibold tracking-wide text-text-muted uppercase">{copy.usedIn}</dt>
            <dd>{profile.usedIn}</dd>
          </div>
        </Card>

        <Callout tone="info" icon="hourglass" title={copy.status}>
          {copy.comingSoon(facts.name)}
        </Callout>

        {usefulNow.length > 0 && (
          <Section labelledBy="useful-now-title" spacing="compact">
            <SectionHeader id="useful-now-title" title={copy.usefulNow} />
            <ul className="grid gap-4 sm:grid-cols-2">
              {usefulNow.map(([item, kind]) => (
                <CatalogueCard key={item.id} item={item} kind={kind} />
              ))}
            </ul>
          </Section>
        )}

        <p>
          <Link href={STYLES_INDEX_PATH} variant="standalone">
            {copy.allStyles}
          </Link>
        </p>
      </PageContainer>
    </>
  );
}
