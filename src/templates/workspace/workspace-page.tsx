import { Hero, Icon, PageContainer } from "@/ui";
import { WorkspaceDashboard } from "@/features/workspace/dashboard";
import { Breadcrumbs } from "@/features/site";
import { workspacePage as copy } from "./copy";

/**
 * The research workspace. The introduction and the list of stages are rendered on the
 * server, so the page is complete for search engines and without scripts; the
 * researcher's own project, kept in their browser, is shown once the page is running.
 */
export function WorkspacePage() {
  return (
    <>
      <Hero
        titleId="workspace-title"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.intro}
        before={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: copy.title }]} />}
      >
        <ul className="grid gap-3 text-small sm:grid-cols-3">
          {copy.points.map((point) => (
            <li key={point.text} className="flex items-start gap-2 text-text-muted">
              <Icon name={point.icon} className="mt-[0.2em] shrink-0 text-action" />
              {point.text}
            </li>
          ))}
        </ul>
      </Hero>
      <PageContainer className="pb-section">
        <WorkspaceDashboard />
      </PageContainer>
    </>
  );
}
