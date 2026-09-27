import type { ReactNode } from "react";
import { Badge, Card, Hero, Icon, IconTile, Link, PageContainer, Section, SectionHeader, type IconName } from "@/ui";
import { TOOLS, TOOLS_INDEX_PATH, TOOL_CATEGORIES, type CatalogueItem } from "@/domains/catalogue";
import { CatalogueList, toolIcon } from "@/features/catalogue";
import { Breadcrumbs } from "@/features/site";
import { LATEST_TOOL_IDS } from "@/config/highlights";
import { NextStage, StageNav } from "@/features/workspace/stage-nav";
import { moduleForTool } from "@/knowledge/workspace/modules";

const labels = {
  home: "Home",
  tools: "Tools",
  onThisPage: "On this page",
  free: "Free, no account",
  workspacePrivacy: "If you start a project in your research workspace, your work is also saved in this browser, and only this browser, until you delete the project.",
  new: "New",
  relatedGuide: "Related guide",
  relatedGuides: "Related guides",
  relatedTool: "Related tool",
  relatedTools: "Related tools",
  relatedToolsIntro: "Tools that work on the same material, for the next step in your project.",
  learningIntro: "The reasoning behind the tool, explained step by step.",
} as const;

/** The icon beside each kind of explanatory section; others get a document. */
const SECTION_ICONS: Record<string, IconName> = {
  how: "workflow",
  method: "methodology",
  rules: "scale",
  limits: "alert",
  review: "shield-check",
  privacy: "lock",
  evidence: "library",
  fits: "target",
  layout: "layout-grid",
  about: "info",
  finer: "list-checks",
};

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
  sections?: readonly ToolPageSection[];
  relatedGuides?: readonly CatalogueItem[];
  browseGuides?: { lead: string; label: string; href: string };
  relatedTools?: readonly CatalogueItem[];
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-pill bg-action" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ExplanationSection({ section }: { section: ToolPageSection }) {
  const titleId = `${section.id}-title`;
  return (
    <Card as="section" id={section.id} aria-labelledby={titleId} padding="lg" className="grid gap-5">
      <div className="flex items-center gap-3">
        <IconTile icon={SECTION_ICONS[section.id] ?? "file-text"} size="sm" tone="neutral" />
        <h2 id={titleId} className="text-subheading font-semibold">
          {section.heading}
        </h2>
      </div>
      {section.text && <p>{section.text}</p>}
      {section.items && <List items={section.items} />}
      {section.aside && (
        <div className="grid gap-3 border-t border-border pt-5">
          <h3 className="text-heading-sm font-semibold">{section.aside.heading}</h3>
          <List items={section.aside.items} />
        </div>
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
    </Card>
  );
}

/**
 * The layout every tool page shares: a hero naming the tool, the tool itself as
 * the page's focus, then its explanation, related tools and guides. Everything
 * except the tool's own interactivity is rendered on the server.
 */
export function ToolPageLayout({ title, intro, noScript, children, sections = [], relatedGuides = [], browseGuides, relatedTools = [] }: ToolPageLayoutProps) {
  const tool = TOOLS.find((entry) => entry.name === title);
  const category = tool && TOOL_CATEGORIES.find((entry) => entry.id === tool.category);
  const stage = tool ? moduleForTool(tool.id) : null;
  const shownSections = stage ? sections.map((section) => (section.id === "privacy" && section.text ? { ...section, text: `${section.text} ${labels.workspacePrivacy}` } : section)) : sections;
  const isNew = tool !== undefined && (LATEST_TOOL_IDS as readonly string[]).includes(tool.id);
  const relatedToolsHeading = relatedTools.length === 1 ? labels.relatedTool : labels.relatedTools;
  const relatedGuidesHeading = relatedGuides.length === 1 ? labels.relatedGuide : labels.relatedGuides;
  const contents = [
    ...sections.map(({ id, heading }) => ({ id, heading })),
    ...(relatedTools.length > 0 ? [{ id: "related-tools", heading: relatedToolsHeading }] : []),
    ...(relatedGuides.length > 0 ? [{ id: "related-guides", heading: relatedGuidesHeading }] : []),
  ];

  return (
    <>
      <Hero
        titleId="tool-title"
        title={title}
        width="reading"
        description={intro}
        before={
          <Breadcrumbs
            items={[
              { label: labels.home, href: "/" },
              { label: labels.tools, href: TOOLS_INDEX_PATH },
              ...(category ? [{ label: category.title, href: `${TOOLS_INDEX_PATH}#${category.id}` }] : []),
              { label: title },
            ]}
          />
        }
        eyebrow={
          tool && (
            <span className="flex flex-wrap items-center gap-3">
              <IconTile icon={toolIcon(tool)} size="sm" />
              {category?.title}
            </span>
          )
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success" icon="check">
            {labels.free}
          </Badge>
          {isNew && (
            <Badge tone="accent" icon="sparkles">
              {labels.new}
            </Badge>
          )}
        </div>
        {stage && <StageNav stage={stage.id} />}
        {contents.length > 0 && (
          <nav aria-label={labels.onThisPage} className="print:hidden">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small">
              {contents.map(({ id, heading }) => (
                <li key={id}>
                  <a href={`#${id}`} className="inline-flex min-h-6 items-center gap-1 rounded-sm text-text-muted underline-offset-4 hover:text-text hover:underline focus-ring">
                    <Icon name="chevron-right" className="text-[0.85em]" />
                    {heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Hero>

      <PageContainer width="reading">
        {children}
        {noScript && (
          <noscript>
            <p className="mt-6 rounded-panel border border-border-control bg-surface p-4">{noScript}</p>
          </noscript>
        )}

        {stage && (
          <div className="pt-section-compact print:hidden">
            <NextStage stage={stage.id} />
          </div>
        )}

        {shownSections.length > 0 && <div className="grid gap-6 py-section-compact">{shownSections.map((section) => <ExplanationSection key={section.id} section={section} />)}</div>}

        {relatedTools.length > 0 && (
          <Section id="related-tools" labelledBy="related-tools-title" spacing="compact" divided>
            <SectionHeader id="related-tools-title" title={relatedToolsHeading} description={labels.relatedToolsIntro} />
            <CatalogueList items={relatedTools} layout="pair" />
          </Section>
        )}

        {relatedGuides.length > 0 && (
          <Section id="related-guides" labelledBy="related-guides-title" spacing="compact" divided>
            <SectionHeader id="related-guides-title" title={relatedGuidesHeading} description={labels.learningIntro} />
            <CatalogueList items={relatedGuides} kind="guide" layout="pair" />
            {browseGuides && (
              <p className="mt-6 text-small">
                {browseGuides.lead} <Link href={browseGuides.href}>{browseGuides.label}</Link>.
              </p>
            )}
          </Section>
        )}
      </PageContainer>
    </>
  );
}
