import { ButtonLink, Hero, PageContainer } from "@/ui";
import { GUIDES_INDEX_PATH, TOOLS_INDEX_PATH } from "@/domains/catalogue";
import type { ContentPage } from "@/domains/publishing";
import { ContentBlock } from "@/features/reading";
import { Breadcrumbs } from "@/features/site";

const labels = {
  eyebrow: "About",
  next: "Get started",
  tools: "Browse Academic Tools",
  guides: "Browse Research Guides",
} as const;

/** A standalone content page: title, lead, then sections of content blocks. */
export function AboutPage({ page }: { page: ContentPage }) {
  return (
    <article aria-labelledby="page-title">
      <Hero
        titleId="page-title"
        width="reading"
        eyebrow={labels.eyebrow}
        title={page.title}
        description={page.lead}
        before={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />}
      />

      <PageContainer width="reading" className="grid gap-14 py-section-compact">
        {page.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="grid gap-4">
            <h2 id={`${section.id}-title`} className="font-display text-heading font-semibold text-balance">
              {section.heading}
            </h2>
            {section.blocks.map((block, index) => (
              <ContentBlock key={index} block={block} />
            ))}
          </section>
        ))}

        <nav aria-labelledby="next-title" className="grid gap-4 rounded-panel border border-border bg-sunken p-6 sm:p-8">
          <h2 id="next-title" className="font-display text-heading font-semibold">
            {labels.next}
          </h2>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={TOOLS_INDEX_PATH} trailingIcon="arrow-right">
              {labels.tools}
            </ButtonLink>
            <ButtonLink href={GUIDES_INDEX_PATH} variant="secondary">
              {labels.guides}
            </ButtonLink>
          </div>
        </nav>
      </PageContainer>
    </article>
  );
}
