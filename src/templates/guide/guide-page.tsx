import { JourneyStrip } from "@/features/project";
import { Badge, ButtonLink, Hero, Icon, Link, PageContainer } from "@/ui";
import { ProgressTracker } from "@/features/engagement";
import { GUIDES_INDEX_PATH, GUIDE_LISTINGS, RESEARCH_STAGES, TOOLS, publishedGuides, stagePath } from "@/domains/catalogue";
import type { Guide } from "@/domains/publishing";
import { CatalogueList } from "@/features/catalogue";
import { ContentBlock } from "@/features/reading";
import { Breadcrumbs } from "@/features/site";
import { guideLabels } from "./copy";

const FAQ_ID = "faq";
const RELATED_ID = "related-tools";
const RELATED_GUIDES_ID = "related-guides";

function Credentials({ guide }: { guide: Guide }) {
  const updated = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(guide.updated));
  const stageId = GUIDE_LISTINGS.find((entry) => entry.id === guide.slug)?.stage;
  const stage = RESEARCH_STAGES.find((entry) => entry.id === stageId);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-text-muted">
      <span className="inline-flex items-center gap-1.5">
        <Icon name="clock" />
        {guideLabels.updated} <time dateTime={guide.updated}>{updated}</time>
      </span>
      {stage && (
        <span className="inline-flex items-center gap-1.5">
          <Icon name="layers" />
          {guideLabels.stage} <Link href={stagePath(stage.id)}>{stage.title}</Link>
        </span>
      )}
      {guide.reviewedBy ? (
        <Badge tone="success" icon="shield-check">
          {guideLabels.reviewedBy} {guide.reviewedBy}
        </Badge>
      ) : (
        <Badge tone="outline" icon="shield-check">
          {guideLabels.notReviewed}
        </Badge>
      )}
    </div>
  );
}

/** The layout every guide shares: the answer first, then contents, sections, questions and related tools. */
export function GuidePage({ guide }: { guide: Guide }) {
  const relatedTools = TOOLS.filter((tool) => guide.relatedToolIds.includes(tool.id));
  const relatedGuides = publishedGuides(guide.relatedGuideSlugs);
  const relatedGuidesHeading = relatedGuides.length === 1 ? guideLabels.relatedGuide : guideLabels.relatedGuides;
  const contents = [
    ...guide.sections.map(({ id, heading }) => ({ id, heading })),
    ...(guide.faq.length > 0 ? [{ id: FAQ_ID, heading: guideLabels.faq }] : []),
    ...(relatedGuides.length > 0 ? [{ id: RELATED_GUIDES_ID, heading: relatedGuidesHeading }] : []),
    ...(relatedTools.length > 0 ? [{ id: RELATED_ID, heading: relatedTools.length === 1 ? guideLabels.relatedTool : guideLabels.relatedTools }] : []),
  ];

  return (
    <article aria-labelledby="guide-title">
      <Hero
        titleId="guide-title"
        width="reading"
        eyebrow={guideLabels.eyebrow}
        title={guide.title}
        description={guide.summary}
        before={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: guideLabels.guides, href: GUIDES_INDEX_PATH }, { label: guide.title }]} />}
      >
        <Credentials guide={guide} />
      </Hero>

      <PageContainer width="reading" className="grid grid-cols-1 gap-14 py-section-compact">
        <JourneyStrip />
        <nav aria-labelledby="contents-title" className="w-full max-w-full min-w-0 rounded-panel border border-border bg-sunken p-6">
          <h2 id="contents-title" className="mb-3 text-caption font-semibold tracking-wide text-text-muted uppercase">
            {guideLabels.contents}
          </h2>
          <ol className="grid gap-1.5">
            {contents.map(({ id, heading }, index) => (
              <li key={id} className="flex gap-3">
                <span aria-hidden="true" className="w-5 shrink-0 text-small text-text-muted tabular-nums">
                  {index + 1}
                </span>
                <a href={`#${id}`} className="rounded-sm text-action underline-offset-4 hover:underline focus-ring">
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {guide.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="grid gap-4">
            <h2 id={`${section.id}-title`} className="font-display text-heading font-semibold text-balance">
              {section.heading}
            </h2>
            {section.blocks.map((block, index) => (
              <ContentBlock key={index} block={block} />
            ))}
          </section>
        ))}

        {guide.faq.length > 0 && (
          <section id={FAQ_ID} aria-labelledby={`${FAQ_ID}-title`} className="grid gap-4">
            <h2 id={`${FAQ_ID}-title`} className="font-display text-heading font-semibold">
              {guideLabels.faq}
            </h2>
            <div className="grid divide-y divide-border rounded-panel border border-border bg-surface">
              {guide.faq.map(({ question, answer }) => (
                <div key={question} className="grid gap-1.5 p-6">
                  <h3 className="text-heading-sm font-semibold">{question}</h3>
                  <p className="text-text-muted">{answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedGuides.length > 0 && (
          <section id={RELATED_GUIDES_ID} aria-labelledby={`${RELATED_GUIDES_ID}-title`} className="grid gap-6">
            <h2 id={`${RELATED_GUIDES_ID}-title`} className="font-display text-heading font-semibold">
              {relatedGuidesHeading}
            </h2>
            <CatalogueList items={relatedGuides} kind="guide" layout="pair" />
          </section>
        )}

        {relatedTools.length > 0 && (
          <section id={RELATED_ID} aria-labelledby={`${RELATED_ID}-title`} className="grid gap-6">
            <h2 id={`${RELATED_ID}-title`} className="font-display text-heading font-semibold">
              {relatedTools.length === 1 ? guideLabels.relatedTool : guideLabels.relatedTools}
            </h2>
            <CatalogueList items={relatedTools} layout="pair" />
          </section>
        )}

        {relatedTools.length > 0 && relatedTools[0].status === "available" && (
          <section aria-labelledby="apply-title" className="grid gap-3 rounded-panel border border-border bg-sunken p-6">
            <h2 id="apply-title" className="font-display text-heading-sm font-semibold">
              Ready to apply this?
            </h2>
            <p className="text-text-muted">Put what you have read into practice with {relatedTools[0].name}.</p>
            <div>
              <ButtonLink href={relatedTools[0].href} trailingIcon="arrow-right">
                Open {relatedTools[0].name}
              </ButtonLink>
            </div>
          </section>
        )}
        <ProgressTracker kind="guides" id={guide.slug} />
      </PageContainer>
    </article>
  );
}
