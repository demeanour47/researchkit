import type { ReactNode } from "react";
import { Link, PageContainer, Section } from "@/ui";
import { TOOLS_INDEX_PATH, type CatalogueItem } from "@/domains/catalogue";
import { CatalogueList } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";

const labels = {
  home: "Home",
  tools: "Tools",
  relatedGuide: "Related guide",
  relatedGuides: "Related guides",
  relatedTool: "Related tool",
  relatedTools: "Related tools",
} as const;

export interface ToolPageSection {
  /** Anchor for the section; its heading's id is `${id}-title`. */
  id: string;
  heading: string;
  items?: readonly string[];
  text?: string;
  /** A sub-section shown under the main points, such as limitations. */
  aside?: { heading: string; items: readonly string[] };
  /** Links shown at the end of the section. */
  links?: readonly { label: string; href: string }[];
}

export interface ToolPageLayoutProps {
  title: string;
  intro: string;
  /** Shown when JavaScript is unavailable, for tools that work in the browser. */
  noScript?: string;
  /** The tool itself. */
  children: ReactNode;
  sections: readonly ToolPageSection[];
  relatedGuides?: readonly CatalogueItem[];
  browseGuides?: { lead: string; label: string; href: string };
  relatedTools?: readonly CatalogueItem[];
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid list-disc gap-2 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * The layout shared by tool pages: breadcrumbs, title, the tool, then explanation
 * sections and related content. Everything except the tool's own interactivity is
 * rendered on the server.
 */
export function ToolPageLayout({
  title,
  intro,
  noScript,
  children,
  sections,
  relatedGuides = [],
  browseGuides,
  relatedTools = [],
}: ToolPageLayoutProps) {
  return (
    <PageContainer width="reading">
      <div className="pt-8">
        <Breadcrumbs items={[{ label: labels.home, href: "/" }, { label: labels.tools, href: TOOLS_INDEX_PATH }, { label: title }]} />
      </div>

      <Section labelledBy="tool-title" spacing="compact">
        <div className="grid gap-4">
          <h1 id="tool-title" className="font-display text-title font-semibold text-balance">
            {title}
          </h1>
          <p className="text-lead text-text-muted">{intro}</p>
        </div>
      </Section>

      {children}
      {noScript && (
        <noscript>
          <p className="mt-6 rounded-panel border border-border-control bg-surface p-4">{noScript}</p>
        </noscript>
      )}

      {sections.map((section) => (
        <Section key={section.id} labelledBy={`${section.id}-title`} spacing="compact">
          <div className="grid gap-4">
            <h2 id={`${section.id}-title`} className="text-heading font-semibold">
              {section.heading}
            </h2>
            {section.text && <p>{section.text}</p>}
            {section.items && <List items={section.items} />}
            {section.aside && (
              <>
                <h3 className="mt-4 text-subheading font-semibold">{section.aside.heading}</h3>
                <List items={section.aside.items} />
              </>
            )}
            {section.links && (
              <ul className="grid gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} variant="standalone">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      ))}

      {relatedGuides.length > 0 && (
        <Section labelledBy="related-guides-title" spacing="compact">
          <div className="grid gap-4">
            <h2 id="related-guides-title" className="text-heading font-semibold">
              {relatedGuides.length === 1 ? labels.relatedGuide : labels.relatedGuides}
            </h2>
            <CatalogueList items={relatedGuides} layout="stack" />
            {browseGuides && (
              <p className="text-small">
                {browseGuides.lead} <Link href={browseGuides.href}>{browseGuides.label}</Link>.
              </p>
            )}
          </div>
        </Section>
      )}

      {relatedTools.length > 0 && (
        <Section labelledBy="related-tools-title" spacing="compact">
          <div className="grid gap-4">
            <h2 id="related-tools-title" className="text-heading font-semibold">
              {relatedTools.length === 1 ? labels.relatedTool : labels.relatedTools}
            </h2>
            <CatalogueList items={relatedTools} layout="stack" />
          </div>
        </Section>
      )}
    </PageContainer>
  );
}
