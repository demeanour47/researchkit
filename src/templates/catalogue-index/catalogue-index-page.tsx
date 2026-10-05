import type { ReactNode } from "react";
import { Hero, Link, MetricCard, PageContainer, type IconName } from "@/ui";
import { countByStatus, type CatalogueCategory, type CatalogueItem } from "@/domains/catalogue";
import { CatalogueCard, CatalogueExplorer, type CatalogueKind } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";
import { statsLabels } from "./copy";

export interface CatalogueIndexSection extends CatalogueCategory {
  /** Each item, with any extra words it can be found by in search, such as related tools. */
  items: readonly (CatalogueItem & { keywords?: string })[];
  icon: IconName;
}

export interface CatalogueIndexPageProps {
  title: string;
  /** A few words above the title naming the area, such as “Tools”. */
  eyebrow: string;
  intro: string;
  /** Explains what "Coming soon" means on this page; shown only while something is coming soon. */
  plannedNote: string;
  /** What the items are called, in the plural, such as “tools”. */
  plural: string;
  /** What the items are, which chooses their icons and wording. */
  kind: CatalogueKind;
  sections: readonly CatalogueIndexSection[];
  /** A pointer to a companion directory, e.g. from tools to guides. */
  crossLink?: { lead: string; label: string; href: string };
  /** Featured and recommended items, shown above the categories while nothing is filtered. */
  highlights?: ReactNode;
}

/**
 * A directory page: a hero with the directory's size, search and filters, then
 * each category's items. Items are rendered here, on the server; the explorer
 * only shows or hides them.
 */
export function CatalogueIndexPage({ title, eyebrow, intro, plannedNote, kind, sections, crossLink, highlights, plural }: CatalogueIndexPageProps) {
  const counts = countByStatus(sections.flatMap((section) => section.items));

  return (
    <>
      <Hero
        titleId="index-title"
        eyebrow={eyebrow}
        title={title}
        description={intro}
        before={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />}
      >
        <ul className="grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-6">
          <MetricCard icon="circle-check" value={counts.available} label={statsLabels.available} />
          <MetricCard icon="hourglass" value={counts["coming-soon"]} label={statsLabels.comingSoon} />
          <MetricCard icon="layout-grid" value={sections.length} label={statsLabels.categories} />
        </ul>
        <div className="grid gap-1 text-small text-text-muted">
          {counts["coming-soon"] > 0 && <p>{plannedNote}</p>}
          {crossLink && (
            <p>
              {crossLink.lead} <Link href={crossLink.href}>{crossLink.label}</Link>.
            </p>
          )}
        </div>
      </Hero>

      <PageContainer className="pb-section">
        <CatalogueExplorer
          plural={plural}
          highlights={highlights}
          sections={sections.map((section) => ({
            id: section.id,
            title: section.title,
            description: section.description,
            icon: section.icon,
            items: section.items.map((item) => ({
              id: item.id,
              text: `${item.name} ${item.description} ${section.title} ${item.keywords ?? ""}`,
              status: item.status,
              card: <CatalogueCard item={item} kind={kind} />,
            })),
          }))}
        />
      </PageContainer>
    </>
  );
}
