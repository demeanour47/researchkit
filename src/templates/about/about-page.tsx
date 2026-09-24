import { Link, PageContainer } from "@/ui";
import { GUIDES_INDEX_PATH, TOOLS_INDEX_PATH } from "@/domains/catalogue";
import type { ContentPage } from "@/domains/publishing";
import { ContentBlock } from "@/features/reading";

const labels = {
  next: "Get started",
  tools: "Browse Academic Tools",
  guides: "Browse Research Guides",
} as const;

/** A standalone content page: title, lead, then sections of content blocks. */
export function AboutPage({ page }: { page: ContentPage }) {
  return (
    <PageContainer width="reading">
      <article className="grid gap-12 py-section-compact">
        <header className="grid gap-4">
          <h1 className="font-display text-title font-semibold text-balance">{page.title}</h1>
          <p className="text-lead">{page.lead}</p>
        </header>

        {page.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="grid gap-4">
            <h2 id={`${section.id}-title`} className="text-heading font-semibold text-balance">
              {section.heading}
            </h2>
            {section.blocks.map((block, index) => (
              <ContentBlock key={index} block={block} />
            ))}
          </section>
        ))}

        <nav aria-labelledby="next-title" className="grid gap-3">
          <h2 id="next-title" className="text-heading font-semibold">
            {labels.next}
          </h2>
          <ul className="grid gap-2">
            <li>
              <Link href={TOOLS_INDEX_PATH} variant="standalone">
                {labels.tools}
              </Link>
            </li>
            <li>
              <Link href={GUIDES_INDEX_PATH} variant="standalone">
                {labels.guides}
              </Link>
            </li>
          </ul>
        </nav>
      </article>
    </PageContainer>
  );
}
