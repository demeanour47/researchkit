import { Link, Section, SectionHeader, cardClasses, cx, type IconName } from "@/ui";
import { GUIDE_CATEGORIES, RESEARCH_STAGES, TOOLS, TOOLS_INDEX_PATH, guidesInCategory, guidesInStage, stageAnchor, type GuideCategoryId, type GuideEntry } from "@/domains/catalogue";
import { getGuide } from "@/domains/publishing";
import { CatalogueIndexPage } from "@/templates/catalogue-index";
import { guidesIndex } from "./copy";

const CATEGORY_ICONS: Record<GuideCategoryId, IconName> = {
  citation: "citation",
  "research-methods": "methodology",
  writing: "writing",
  statistics: "statistics",
  "academic-skills": "learning",
};

/** Words a guide can also be found by: its research stage and the tools it connects to (ADR-0010). */
function keywords(entry: GuideEntry): string {
  const stage = RESEARCH_STAGES.find((candidate) => candidate.id === entry.stage)?.title ?? "";
  const toolIds = entry.status === "available" ? (getGuide(entry.id)?.relatedToolIds ?? []) : (entry.relatedToolIds ?? []);
  const tools = TOOLS.filter((tool) => toolIds.includes(tool.id)).map((tool) => tool.name);
  return [stage, ...tools].join(" ");
}

/** The research workflow: every stage in order, with its published guides. */
function Workflow() {
  return (
    <Section labelledBy="workflow-title" spacing="compact">
      <SectionHeader id="workflow-title" title={guidesIndex.workflow.heading} description={guidesIndex.workflow.description} />
      <ul className="mb-8 grid max-w-intro list-disc gap-1 ps-6 marker:text-action">
        {guidesIndex.workflow.promises.map((promise) => (
          <li key={promise}>{promise}</li>
        ))}
      </ul>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_STAGES.map((stage, index) => {
          const guides = guidesInStage(stage.id).filter((guide): guide is Extract<GuideEntry, { status: "available" }> => guide.status === "available");
          return (
            <li key={stage.id} id={stageAnchor(stage.id)} aria-labelledby={`${stageAnchor(stage.id)}-title`} className={cx(cardClasses(), "grid scroll-mt-24 content-start gap-3")}>
              <h3 id={`${stageAnchor(stage.id)}-title`} className="flex items-baseline gap-2 text-heading-sm font-semibold">
                <span className="text-small text-text-muted tabular-nums">{guidesIndex.workflow.step(index + 1)}</span>
                {stage.title}
              </h3>
              <p className="text-small text-text-muted">{stage.description}</p>
              <ul className="grid gap-1.5">
                {guides.map((guide) => (
                  <li key={guide.id}>
                    <Link href={guide.href}>{guide.name}</Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

/** The directory of every ResearchKit guide: the research workflow, then each category with search and filters. */
export function GuidesIndexPage() {
  return (
    <CatalogueIndexPage
      title={guidesIndex.title}
      eyebrow={guidesIndex.eyebrow}
      intro={guidesIndex.intro}
      plannedNote={guidesIndex.plannedNote}
      plural={guidesIndex.plural}
      kind="guide"
      sections={GUIDE_CATEGORIES.map((category) => ({
        ...category,
        icon: CATEGORY_ICONS[category.id],
        items: guidesInCategory(category.id).map((entry) => ({ ...entry, keywords: keywords(entry) })),
      }))}
      crossLink={{ ...guidesIndex.crossLink, href: TOOLS_INDEX_PATH }}
      highlights={<Workflow />}
    />
  );
}
