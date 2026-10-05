import { Hero, Icon, Link, PageContainer } from "@/ui";
import { Breadcrumbs } from "@/features/site";
import { ProjectHome } from "@/features/project";
import { PROJECT_TYPE_INFO } from "@/knowledge/project/sections";
import { projectPage as copy } from "./copy";

/**
 * The research journey. The introduction and the comparison of the three documents
 * are rendered on the server, so they are complete for search engines and without
 * scripts; the researcher's own journey, kept in their browser, appears once the
 * page is running.
 */
export function ProjectPage() {
  return (
    <>
      <Hero
        titleId="project-title"
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
      <PageContainer className="space-y-section pb-section">
        <ProjectHome />
        <section aria-labelledby="compare-title" className="space-y-4">
          <h2 id="compare-title" className="text-heading font-semibold">Which research document are you preparing?</h2>
          <p className="max-w-3xl text-text-muted">Institutions differ in what they require, so treat this as a general guide and follow your own instructions first.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-small">
              <caption className="sr-only">Research proposal, research paper and thesis compared</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="p-3"><span className="sr-only">Feature</span></th>
                  {PROJECT_TYPE_INFO.map((info) => <th key={info.type} scope="col" className="p-3 font-semibold">{info.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {([
                  ["What it is", "tagline"],
                  ["Purpose", "purpose"],
                  ["The research is", "research"],
                  ["Results and findings", "results"],
                  ["Length", "length"],
                ] as const).map(([label, key]) => (
                  <tr key={key} className="border-b border-border align-top">
                    <th scope="row" className="p-3 font-semibold">{label}</th>
                    {PROJECT_TYPE_INFO.map((info) => <td key={info.type} className="p-3 text-text-muted">{info[key]}</td>)}
                  </tr>
                ))}
                <tr className="align-top">
                  <th scope="row" className="p-3 font-semibold">Read the guide</th>
                  {PROJECT_TYPE_INFO.map((info) => <td key={info.type} className="p-3"><Link href={`/learn/${info.guide.slug}`}>{info.guide.title}</Link></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
