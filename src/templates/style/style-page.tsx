import { Link, PageContainer, Tag } from "@/ui";
import { GUIDE_LISTINGS, TOOLS, type CatalogueItem } from "@/domains/catalogue";
import { STYLES_INDEX_PATH, getStyleProfile, type ProfiledStyleId } from "@/domains/publishing";
import { CatalogueList } from "@/features/catalogue";
import { CITATION_STYLES, styleTitle } from "@/knowledge/citation/styles";
import { stylePageCopy as copy, usefulNowIds } from "./copy";

const usefulNow: CatalogueItem[] = [
  TOOLS.find((tool) => tool.id === usefulNowIds.tool),
  GUIDE_LISTINGS.find((guide) => guide.id === usefulNowIds.guide),
].filter((item): item is NonNullable<typeof item> => item !== undefined);

/** A citation style's page: what it is, where it's used, and what to use until its full guide is published. */
export function StylePage({ style }: { style: ProfiledStyleId }) {
  const profile = getStyleProfile(style);
  const facts = CITATION_STYLES[style];

  return (
    <PageContainer width="reading">
      <article className="grid gap-10 py-section-compact">
        <header className="grid gap-4">
          <h1 className="font-display text-title font-semibold text-balance">{styleTitle(style)}</h1>
          <p className="text-lead">{profile.summary}</p>
          <dl className="grid gap-3">
            <div>
              <dt className="text-small font-semibold">{copy.definedBy}</dt>
              <dd className="text-text-muted">{facts.authority}</dd>
            </div>
            <div>
              <dt className="text-small font-semibold">{copy.usedIn}</dt>
              <dd className="text-text-muted">{profile.usedIn}</dd>
            </div>
          </dl>
          <p className="text-small text-text-muted">{copy.reviewStatus}</p>
        </header>

        <div className="grid gap-3 rounded-panel border border-border-control bg-surface p-6">
          <div>
            <Tag>{copy.status}</Tag>
          </div>
          <p>{copy.comingSoon(facts.name)}</p>
        </div>

        {usefulNow.length > 0 && (
          <section aria-labelledby="useful-now-title" className="grid gap-4">
            <h2 id="useful-now-title" className="text-heading font-semibold">
              {copy.usefulNow}
            </h2>
            <CatalogueList items={usefulNow} layout="stack" />
          </section>
        )}

        <p>
          <Link href={STYLES_INDEX_PATH} variant="standalone">
            {copy.allStyles}
          </Link>
        </p>
      </article>
    </PageContainer>
  );
}
