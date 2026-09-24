import { ButtonLink, Link, PageContainer, Section, SectionHeader, Tag, VisuallyHidden } from "@/ui";
import { TOOLS_INDEX_PATH } from "@/domains/catalogue";
import { CITATION_STYLE_FINDER_PATH, citationStyleFinderPage } from "@/tools/citation-style-finder";
import { featured, hero, principles, start } from "./copy";

const START_SECTION_ID = "start-research";

interface StartArea {
  title: string;
  text: string;
  /** Omitted while the area has nowhere to go, so no link leads to a dead end. */
  href?: string;
}

const startAreas: StartArea[] = [
  { ...start.areas.cite, href: CITATION_STYLE_FINDER_PATH },
  start.areas.write,
  start.areas.analyse,
  start.areas.learn,
];

const card = "rounded-panel border border-border bg-surface p-6";

function Hero() {
  return (
    <Section labelledBy="home-title">
      <div className="grid max-w-reading gap-6">
        <h1 id="home-title" className="font-display text-display font-semibold text-balance">
          {hero.title}
        </h1>
        <p className="text-lead text-text-muted">{hero.description}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={CITATION_STYLE_FINDER_PATH}>{hero.primaryAction}</ButtonLink>
          <ButtonLink href={TOOLS_INDEX_PATH} variant="secondary">
            {hero.secondaryAction}
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}

function FeaturedTool() {
  return (
    <Section labelledBy="featured-title" spacing="compact">
      <SectionHeader id="featured-title" title={featured.heading} />
      <article className={`${card} grid max-w-reading gap-4`}>
        <h3 className="text-subheading font-semibold">{citationStyleFinderPage.title}</h3>
        <p>{citationStyleFinderPage.description}</p>
        <p className="text-text-muted">{featured.why}</p>
        <div>
          <ButtonLink href={CITATION_STYLE_FINDER_PATH} variant="secondary">
            {featured.action}
            <VisuallyHidden>: {citationStyleFinderPage.title}</VisuallyHidden>
          </ButtonLink>
        </div>
      </article>
    </Section>
  );
}

function WhyResearchKit() {
  return (
    <Section labelledBy="principles-title" spacing="compact">
      <SectionHeader id="principles-title" title={principles.heading} />
      <ul className="grid gap-4 md:grid-cols-3">
        {principles.items.map((item) => (
          <li key={item.title} className={`${card} grid content-start gap-2`}>
            <h3 className="text-subheading font-semibold">{item.title}</h3>
            <p className="text-text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function StartYourResearch() {
  return (
    <Section id={START_SECTION_ID} labelledBy="start-title">
      <SectionHeader id="start-title" title={start.heading} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {startAreas.map((area) => (
          <li key={area.title} className={`${card} relative grid content-start gap-2`}>
            <h3 className="text-subheading font-semibold">
              {area.href ? (
                <Link href={area.href} variant="standalone" className="after:absolute after:inset-0 after:rounded-panel">
                  {area.title}
                </Link>
              ) : (
                area.title
              )}
            </h3>
            <p className="text-text-muted">{area.text}</p>
            {!area.href && (
              <div>
                <Tag>{start.comingSoon}</Tag>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The first public homepage: what ResearchKit is, why to trust it, and where to begin. */
export function HomePage() {
  return (
    <PageContainer>
      <Hero />
      <FeaturedTool />
      <WhyResearchKit />
      <StartYourResearch />
    </PageContainer>
  );
}
