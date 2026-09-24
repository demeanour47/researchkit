import { PageContainer, Section } from "@/ui";
import { TOOLS, TOOLS_INDEX_PATH } from "@/domains/catalogue";
import { CatalogueList } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";
import { TextAnalysisInput } from "@/features/text-analysis";
import { TOOL_ID as WORD_COUNTER_ID } from "@/tools/word-counter/path";
import { announcedResults, limits, method, paceNotes, page, privacy, shownResults } from "./copy";

const relatedTools = TOOLS.filter((tool) => tool.id === WORD_COUNTER_ID);

/**
 * The Reading Time Calculator page. It reuses the text analysis behind the Word
 * Counter; only the results shown and the explanation differ.
 */
export function ReadingTime() {
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
        resultsHeading={page.resultsHeading}
        fields={shownResults}
        notes={paceNotes}
        announced={announcedResults}
      />
      <noscript>
        <p className="mt-6 rounded-panel border border-border-control bg-surface p-4">{page.noScript}</p>
      </noscript>

      <Section labelledBy="method-title" spacing="compact">
        <div className="grid gap-4">
          <h2 id="method-title" className="text-heading font-semibold">
            {page.methodHeading}
          </h2>
          <ul className="grid list-disc gap-2 ps-6">
            {method.map((item) => (
              <li key={item}>{item}</li>
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

      <Section labelledBy="privacy-title" spacing="compact">
        <div className="grid gap-4">
          <h2 id="privacy-title" className="text-heading font-semibold">
            {page.privacyHeading}
          </h2>
          <p>{privacy}</p>
        </div>
      </Section>

      {relatedTools.length > 0 && (
        <Section labelledBy="related-tools-title" spacing="compact">
          <div className="grid gap-4">
            <h2 id="related-tools-title" className="text-heading font-semibold">
              {page.relatedHeading}
            </h2>
            <CatalogueList items={relatedTools} layout="stack" />
          </div>
        </Section>
      )}
    </PageContainer>
  );
}
