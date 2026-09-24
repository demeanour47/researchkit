import { Link, PageContainer, Section, SectionHeader } from "@/ui";
import { countByStatus, type CatalogueCategory, type CatalogueItem } from "@/domains/catalogue";
import { CatalogueList } from "@/features/catalogue";
import { statusSummary } from "./copy";

export interface CatalogueIndexSection extends CatalogueCategory {
  items: readonly CatalogueItem[];
}

export interface CatalogueIndexPageProps {
  title: string;
  intro: string;
  /** Explains what "Coming soon" means on this page. */
  plannedNote: string;
  /** Accessible name of the category navigation. */
  categoriesLabel: string;
  sections: readonly CatalogueIndexSection[];
  /** A pointer to a companion directory, e.g. from tools to guides. */
  crossLink?: { lead: string; label: string; href: string };
}

/** A directory page: introduction, links to each category, then each category's items. */
export function CatalogueIndexPage({
  title,
  intro,
  plannedNote,
  categoriesLabel,
  sections,
  crossLink,
}: CatalogueIndexPageProps) {
  const categories = sections.map((section) => {
    const counts = countByStatus(section.items);
    return { ...section, summary: statusSummary(counts.available, counts["coming-soon"]) };
  });

  return (
    <PageContainer>
      <Section labelledBy="index-title" spacing="compact">
        <div className="grid max-w-reading gap-4">
          <h1 id="index-title" className="font-display text-title font-semibold text-balance">
            {title}
          </h1>
          <p className="text-lead text-text-muted">{intro}</p>
          <p className="text-small text-text-muted">{plannedNote}</p>
          {crossLink && (
            <p className="text-small">
              {crossLink.lead} <Link href={crossLink.href}>{crossLink.label}</Link>.
            </p>
          )}
        </div>

        <nav aria-label={categoriesLabel} className="mt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`#${category.id}`} variant="standalone">
                  {category.title}
                </Link>
                <span className="ms-2 text-small text-text-muted">{category.summary}</span>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      {categories.map((category) => (
        <Section key={category.id} id={category.id} labelledBy={`${category.id}-title`} spacing="compact">
          <SectionHeader id={`${category.id}-title`} title={category.title} note={category.summary} />
          <p className="mb-6 max-w-reading text-text-muted">{category.description}</p>
          <CatalogueList items={category.items} />
        </Section>
      ))}
    </PageContainer>
  );
}
