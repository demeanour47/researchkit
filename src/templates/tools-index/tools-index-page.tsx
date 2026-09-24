import { Link, PageContainer, Section, SectionHeader } from "@/ui";
import { TOOL_CATEGORIES, countByStatus, toolsInCategory } from "@/domains/catalogue";
import { ToolList } from "@/features/catalogue";
import { toolsIndex } from "./copy";

const categories = TOOL_CATEGORIES.map((category) => {
  const tools = toolsInCategory(category.id);
  const counts = countByStatus(tools);
  return { ...category, tools, summary: toolsIndex.summary(counts.available, counts["coming-soon"]) };
});

/** The directory of every ResearchKit tool, grouped by category. */
export function ToolsIndexPage() {
  return (
    <PageContainer>
      <Section labelledBy="tools-title" spacing="compact">
        <div className="grid max-w-reading gap-4">
          <h1 id="tools-title" className="font-display text-title font-semibold text-balance">
            {toolsIndex.title}
          </h1>
          <p className="text-lead text-text-muted">{toolsIndex.intro}</p>
          <p className="text-small text-text-muted">{toolsIndex.plannedNote}</p>
        </div>

        <nav aria-label={toolsIndex.categoriesLabel} className="mt-8">
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
          <ToolList tools={category.tools} />
        </Section>
      ))}
    </PageContainer>
  );
}
