import { Callout, Card, Hero, Link, PageContainer, Section, SectionHeader } from "@/ui";
import { GUIDE_LISTINGS, TOOLS, type CatalogueItem } from "@/domains/catalogue";
import { STYLES_INDEX_PATH, getStyleProfile, type ProfiledStyleId } from "@/domains/publishing";
import { CatalogueCard } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";
import { CITATION_STYLES, styleTitle } from "@/knowledge/citation/styles";
import { publishedResources, stylePageCopy as copy, usefulNowIds, type PublishedResources } from "./copy";

const availableTool = (id: string) => TOOLS.find((tool) => tool.id === id && tool.status === "available");
const availableGuide = (id: string) => GUIDE_LISTINGS.find((guide) => guide.id === id && guide.status === "available");

/** The style's own guide and generator, when both are published, and what they cover. */
function published(style: ProfiledStyleId): { tool: CatalogueItem; guide: CatalogueItem; coverage?: PublishedResources["coverage"] } | null {
  const ids = publishedResources[style];
  const tool = ids && availableTool(ids.tool);
  const guide = ids && availableGuide(ids.guide);
  return tool && guide ? { tool, guide, coverage: ids.coverage } : null;
}

/** The style page's description of its published guide and generator, or null while they are coming soon. */
export function publishedMeta(style: ProfiledStyleId): string | null {
  const resources = published(style);
  return resources ? (resources.coverage?.meta ?? copy.publishedMeta) : null;
}

/** A citation style's page: what it is, where it's used, and its guide and generator, or what to use until they are published. */
export function StylePage({ style }: { style: ProfiledStyleId }) {
  const profile = getStyleProfile(style);
  const facts = CITATION_STYLES[style];
  const resources = published(style);
  const tool = resources?.tool ?? availableTool(usefulNowIds.tool);
  const guide = resources?.guide ?? availableGuide(usefulNowIds.guide);
  const usefulNow: [CatalogueItem, "tool" | "guide"][] = [
    ...(tool ? [[tool, "tool"] as [CatalogueItem, "tool"]] : []),
    ...(guide ? [[guide, "guide"] as [CatalogueItem, "guide"]] : []),
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

        {resources ? (
          <Callout tone="info" title={resources.coverage?.title ?? copy.published}>
            {resources.coverage?.text ?? copy.publishedText(facts.name)}
          </Callout>
        ) : (
          <Callout tone="info" icon="hourglass" title={copy.status}>
            {copy.comingSoon(facts.name)}
          </Callout>
        )}

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
