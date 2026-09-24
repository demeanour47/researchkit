import { Link, PageContainer, Section } from "@/ui";
import { GUIDES_INDEX_PATH, TOOLS, TOOLS_INDEX_PATH, guidesForTool } from "@/domains/catalogue";
import { CatalogueList } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";
import { TextAnalysisInput } from "@/features/text-analysis";
import { announcedResults, limits, page, rules, shownResults } from "./copy";
import { TOOL_ID as READING_TIME_ID } from "@/tools/reading-time/path";
import { TOOL_ID } from "./path";

const relatedTools = TOOLS.filter((tool) => tool.id === READING_TIME_ID);

/**
 * The Word Counter page. Everything except the live counting is rendered on the
 * server; the counting itself runs only in the browser.
 */
export function WordCounter() {
  const relatedGuides = guidesForTool(TOOL_ID);

  return (
    <PageContainer width="reading">
      <div className="pt-8">
        <Breadcrumbs
          items={[{ label: page.breadcrumbHome, href: "/" }, { label: page.breadcrumbTools, href: TOOLS_INDEX_PATH }, { label: page.title }]}
        />
      </div>

      <Section labelledBy="tool-title" spacing="compact">
        <div className="grid gap-4">
          <h1 id="tool-title" className="font-display text-title font-semibold text-balance">
            {page.title}
          </h1>
          <p className="text-lead text-text-muted">{page.intro}</p>
        </div>
      </Section>

      <TextAnalysisInput
        label={page.inputLabel}
        hint={page.inputHint}
        resultsHeading={page.countsHeading}
        fields={shownResults}
        announced={announcedResults}
      />
      <noscript>
        <p className="mt-6 rounded-panel border border-border-control bg-surface p-4">{page.noScript}</p>
      </noscript>

      <Section labelledBy="rules-title" spacing="compact">
        <div className="grid gap-4">
          <h2 id="rules-title" className="text-heading font-semibold">
            {page.rulesHeading}
          </h2>
          <ul className="grid list-disc gap-2 ps-6">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <h3 className="mt-4 text-subheading font-semibold">{page.limitsHeading}</h3>
          <ul className="grid list-disc gap-2 ps-6">
            {limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>
      </Section>

      {relatedGuides.length > 0 && (
        <Section labelledBy="related-guides-title" spacing="compact">
          <div className="grid gap-4">
            <h2 id="related-guides-title" className="text-heading font-semibold">
              {page.relatedHeading}
            </h2>
            <CatalogueList items={relatedGuides} layout="stack" />
            <p className="text-small">
              {page.browseGuides.lead} <Link href={GUIDES_INDEX_PATH}>{page.browseGuides.label}</Link>.
            </p>
          </div>
        </Section>
      )}

      {relatedTools.length > 0 && (
        <Section labelledBy="related-tools-title" spacing="compact">
          <div className="grid gap-4">
            <h2 id="related-tools-title" className="text-heading font-semibold">
              {page.relatedToolHeading}
            </h2>
            <CatalogueList items={relatedTools} layout="stack" />
          </div>
        </Section>
      )}
    </PageContainer>
  );
}
