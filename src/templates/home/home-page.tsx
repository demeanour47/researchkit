import NextLink from "next/link";
import {
  ButtonLink,
  FeatureBanner,
  FeatureCard,
  Hero,
  Icon,
  Link,
  PageContainer,
  Section,
  SectionHeader,
  cardClasses,
  coverLinkClasses,
  cx,
  type IconName,
} from "@/ui";
import { TOOLS_INDEX_PATH, TOOL_CATEGORIES, toolsInCategory } from "@/domains/catalogue";
import { CATEGORY_ICONS, CatalogueList, CategoryCard, availableTools, toolIcon } from "@/features/catalogue";
import { ESSENTIAL_TOOL_IDS, FEATURED_TOOL_ID, LATEST_TOOL_IDS } from "@/config/highlights";
import { academicPrinciples, categories, essentials, featured, hero, latest, principles, roadmap, workflow } from "./copy";

const PLANNED_TOOLS_PATH = `${TOOLS_INDEX_PATH}?status=coming-soon`;

function HomeHero() {
  const stages = workflow.flatMap((step) => availableTools([step.toolId]).map((tool) => ({ ...step, tool })));
  const firstStage = stages[0]?.tool;

  return (
    <Hero
      titleId="home-title"
      size="home"
      eyebrow={
        <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 shadow-card">
          <Icon name="sparkles" className="text-accent" />
          {hero.eyebrow}
        </span>
      }
      title={hero.title}
      description={hero.description}
      actions={
        <>
          <ButtonLink href={TOOLS_INDEX_PATH} size="lg" trailingIcon="arrow-right">
            {hero.primaryAction}
          </ButtonLink>
          {firstStage && (
            <ButtonLink href={firstStage.href} size="lg" variant="secondary">
              {hero.secondaryAction}
            </ButtonLink>
          )}
        </>
      }
    >
      <ol aria-label={hero.workflowLabel} className="mt-4 grid w-full gap-2 sm:grid-cols-2 sm:gap-3 lg:mt-6 lg:grid-cols-5">
        {stages.map(({ stage, icon, tool }, index) => (
          <li key={stage} className={cx(cardClasses({ interactive: true, padding: "sm" }), "group flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-3")}>
            <span className="inline-flex items-center gap-2 text-caption font-semibold tracking-wide text-text-muted uppercase">
              <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <Icon name={icon as IconName} className="size-4 text-action" />
            </span>
            <Icon name="arrow-right" className="order-last ms-auto text-text-muted transition-transform duration-(--duration-quick) group-hover:translate-x-0.5 group-hover:text-action lg:absolute lg:end-4 lg:top-4" />
            <p className="grid gap-0.5">
              <span className="font-semibold">{stage}</span>
              <NextLink href={tool.href} className={cx(coverLinkClasses, "text-small text-text-muted group-hover:text-text")}>
                {tool.name}
              </NextLink>
            </p>
          </li>
        ))}
      </ol>
    </Hero>
  );
}

/** A decorative sketch of a PRISMA 2020 diagram's shape: stage names only, no numbers. */
function PrismaSketch() {
  const box = "rounded-control border border-border-strong bg-surface px-3 py-2 text-caption font-medium shadow-card";
  const side = "rounded-control border border-dashed border-border-strong px-3 py-2 text-caption text-text-muted";
  const arrow = <Icon name="arrow-down" className="mx-auto text-text-muted" />;
  const rows = [
    [featured.sketch.identification, featured.sketch.removed],
    [featured.sketch.screening, featured.sketch.excluded],
  ] as const;
  return (
    <div aria-hidden="true" className="grid gap-2 rounded-panel border border-border bg-sunken p-4 sm:p-6">
      {rows.map(([stage, removed], index) => (
        <div key={index} className="grid gap-2">
          <div className="grid grid-cols-[minmax(0,3fr)_auto_minmax(0,2fr)] items-center gap-2">
            <div className={box}>
              <span className="block text-action">{stage}</span>
              <span className="mt-1.5 block h-1.5 w-3/4 rounded-pill bg-secondary" />
            </div>
            <Icon name="arrow-right" className="text-text-muted" />
            <div className={side}>{removed}</div>
          </div>
          <div className="grid grid-cols-[minmax(0,3fr)_auto_minmax(0,2fr)] gap-2">{arrow}</div>
        </div>
      ))}
      <div className="grid grid-cols-[minmax(0,3fr)_auto_minmax(0,2fr)] gap-2">
        <div className={cx(box, "border-success/50 bg-success-soft")}>
          <span className="flex items-center gap-1.5 text-success">
            <Icon name="circle-check" />
            {featured.sketch.included}
          </span>
        </div>
      </div>
    </div>
  );
}

function FeaturedTool() {
  const [tool] = availableTools([FEATURED_TOOL_ID]);
  if (!tool) return null;
  return (
    <Section labelledBy="featured-title" spacing="compact" className="pt-section">
      <FeatureBanner
        titleId="featured-title"
        icon={toolIcon(tool)}
        eyebrow={featured.eyebrow}
        title={tool.name}
        description={tool.description}
        highlights={featured.highlights}
        actions={
          <ButtonLink href={tool.href} trailingIcon="arrow-right">
            {featured.action}
          </ButtonLink>
        }
        media={<PrismaSketch />}
      />
    </Section>
  );
}

function EssentialTools() {
  return (
    <Section labelledBy="essentials-title">
      <SectionHeader
        id="essentials-title"
        eyebrow={essentials.eyebrow}
        title={essentials.heading}
        description={essentials.description}
        action={
          <Link href={TOOLS_INDEX_PATH} variant="standalone">
            {essentials.action}
          </Link>
        }
      />
      <CatalogueList items={availableTools(ESSENTIAL_TOOL_IDS)} showCategory />
    </Section>
  );
}

function ResearchCategories() {
  return (
    <Section labelledBy="categories-title" divided>
      <SectionHeader id="categories-title" eyebrow={categories.eyebrow} title={categories.heading} description={categories.description} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOL_CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} summary={categories.summary} />
        ))}
      </ul>
    </Section>
  );
}

function WhyResearchKit() {
  return (
    <Section labelledBy="principles-title" divided>
      <SectionHeader id="principles-title" eyebrow={principles.eyebrow} title={principles.heading} description={principles.description} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {principles.items.map((item) => (
          <FeatureCard key={item.title} icon={item.icon} title={item.title}>
            {item.text}
          </FeatureCard>
        ))}
      </ul>
    </Section>
  );
}

function LatestAdditions() {
  return (
    <Section labelledBy="latest-title" divided>
      <SectionHeader id="latest-title" eyebrow={latest.eyebrow} title={latest.heading} description={latest.description} />
      <CatalogueList items={availableTools(LATEST_TOOL_IDS)} layout="quad" showCategory />
    </Section>
  );
}

function Roadmap() {
  return (
    <Section id="roadmap" labelledBy="roadmap-title" divided>
      <SectionHeader
        id="roadmap-title"
        eyebrow={roadmap.eyebrow}
        title={roadmap.heading}
        description={roadmap.description}
        action={
          <Link href={PLANNED_TOOLS_PATH} variant="standalone">
            {roadmap.action}
          </Link>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOL_CATEGORIES.map((category) => {
          const planned = toolsInCategory(category.id).filter((tool) => tool.status === "coming-soon");
          return (
            <li key={category.id} className={cx(cardClasses({ tone: "sunken" }), "grid content-start gap-4 border-dashed border-border-strong")}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-heading-sm font-semibold">
                  <Icon name={CATEGORY_ICONS[category.id]} className="text-action" />
                  {category.title}
                </h3>
                <span className="text-caption text-text-muted tabular-nums">{roadmap.count(planned.length)}</span>
              </div>
              {planned.length > 0 ? (
                <ul className="grid gap-2 text-small">
                  {planned.map((tool) => (
                    <li key={tool.id} className="flex gap-2">
                      <Icon name="hourglass" className="mt-[0.3em] shrink-0 text-text-muted" />
                      <span>{tool.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-small text-text-muted">{roadmap.none}</p>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function AcademicPrinciples() {
  return (
    <Section labelledBy="academic-title" divided>
      <SectionHeader id="academic-title" eyebrow={academicPrinciples.eyebrow} title={academicPrinciples.heading} />
      <ol className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {academicPrinciples.items.map((item, index) => (
          <li key={item.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 border-t border-border pt-6">
            <span aria-hidden="true" className="font-display text-heading font-semibold text-action/70 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="grid gap-1.5">
              <h3 className="text-subheading font-semibold">{item.title}</h3>
              <p className="text-text-muted">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** The homepage: what ResearchKit is, its featured tool, where to start, and what is coming. */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <PageContainer>
        <FeaturedTool />
        <EssentialTools />
        <ResearchCategories />
        <WhyResearchKit />
        <LatestAdditions />
        <Roadmap />
        <AcademicPrinciples />
      </PageContainer>
    </>
  );
}
