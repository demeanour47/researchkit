import { TOOLS, publishedGuides } from "@/domains/catalogue";
import { CatalogueList } from "@/features/catalogue";
import { nextStepsFor } from "@/knowledge/journey/next-steps";
import { Section, SectionHeader } from "@/ui";

/** "What should I do next?" for a tool: why the next steps follow, and where they are. */
export function NextSteps({ toolId }: { toolId: string }) {
  const steps = nextStepsFor(toolId);
  if (!steps) return null;
  const tools = steps.toolIds.flatMap((id) => TOOLS.filter((tool) => tool.id === id && tool.status === "available"));
  const guides = publishedGuides(steps.guideSlugs);
  if (tools.length === 0 && guides.length === 0) return null;

  return (
    <Section id="next-steps" labelledBy="next-steps-title" spacing="compact" divided>
      <SectionHeader id="next-steps-title" title="What should I do next?" description={steps.lead} />
      <div className="grid gap-6">
        {tools.length > 0 && <CatalogueList items={tools} layout="pair" />}
        {guides.length > 0 && <CatalogueList items={guides} kind="guide" layout="pair" />}
      </div>
    </Section>
  );
}
