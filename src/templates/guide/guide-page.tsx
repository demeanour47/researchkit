import { Link, PageContainer } from "@/ui";
import { TOOLS } from "@/domains/catalogue";
import type { Guide } from "@/domains/publishing";
import { CatalogueList } from "@/features/catalogue";
import { ContentBlock } from "@/features/reading";
import { guideLabels } from "./copy";

const FAQ_ID = "faq";
const RELATED_ID = "related-tools";

function Credentials({ guide }: { guide: Guide }) {
  const updated = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(guide.updated));

  return (
    <p className="text-small text-text-muted">
      {guideLabels.updated} <time dateTime={guide.updated}>{updated}</time>
      {" · "}
      {guide.reviewedBy ? `${guideLabels.reviewedBy} ${guide.reviewedBy}` : guideLabels.notReviewed}
    </p>
  );
}

/** The layout every guide shares: the answer first, then contents, sections, questions and related tools. */
export function GuidePage({ guide }: { guide: Guide }) {
  const relatedTools = TOOLS.filter((tool) => guide.relatedToolIds.includes(tool.id));
  const contents = [
    ...guide.sections.map(({ id, heading }) => ({ id, heading })),
    ...(guide.faq.length > 0 ? [{ id: FAQ_ID, heading: guideLabels.faq }] : []),
    ...(relatedTools.length > 0 ? [{ id: RELATED_ID, heading: relatedTools.length === 1 ? guideLabels.relatedTool : guideLabels.relatedTools }] : []),
  ];

  return (
    <PageContainer width="reading">
      <article className="grid gap-12 py-section-compact">
        <header className="grid gap-4">
          <h1 className="font-display text-title font-semibold text-balance">{guide.title}</h1>
          <p className="text-lead">{guide.summary}</p>
          <Credentials guide={guide} />
        </header>

        <nav aria-labelledby="contents-title" className="rounded-panel border border-border bg-surface p-6">
          <h2 id="contents-title" className="mb-3 text-body font-semibold">
            {guideLabels.contents}
          </h2>
          <ol className="grid list-decimal gap-1 ps-6">
            {contents.map(({ id, heading }) => (
              <li key={id}>
                <Link href={`#${id}`}>{heading}</Link>
              </li>
            ))}
          </ol>
        </nav>

        {guide.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="grid gap-4">
            <h2 id={`${section.id}-title`} className="text-heading font-semibold text-balance">
              {section.heading}
            </h2>
            {section.blocks.map((block, index) => (
              <ContentBlock key={index} block={block} />
            ))}
          </section>
        ))}

        {guide.faq.length > 0 && (
          <section id={FAQ_ID} aria-labelledby={`${FAQ_ID}-title`} className="grid gap-6">
            <h2 id={`${FAQ_ID}-title`} className="text-heading font-semibold">
              {guideLabels.faq}
            </h2>
            {guide.faq.map(({ question, answer }) => (
              <div key={question} className="grid gap-1">
                <h3 className="text-subheading font-semibold">{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </section>
        )}

        {relatedTools.length > 0 && (
          <section id={RELATED_ID} aria-labelledby={`${RELATED_ID}-title`} className="grid gap-4">
            <h2 id={`${RELATED_ID}-title`} className="text-heading font-semibold">
              {relatedTools.length === 1 ? guideLabels.relatedTool : guideLabels.relatedTools}
            </h2>
            <CatalogueList items={relatedTools} layout="stack" />
          </section>
        )}
      </article>
    </PageContainer>
  );
}
