import { guidesForTool, relatedTools } from "@/domains/catalogue";
import { ToolPageLayout } from "@/features/tool";
import { page } from "./copy";
import { ReferenceCheckerForm } from "./reference-checker";
import { TOOL_ID } from "./path";

export function ReferenceChecker() {
  return (
    <ToolPageLayout
      title={page.title}
      intro={page.intro}
      noScript={page.noScript}
      sections={[
        { id: "how", heading: page.howHeading, items: page.how, links: [{ label: page.learnLink, href: "/learn/apa-7-citations-and-references#missing-metadata" }] },
        { id: "limits", heading: page.limitsHeading, items: page.limits },
        { id: "privacy", heading: page.privacyHeading, text: page.privacy },
      ]}
      relatedGuides={guidesForTool(TOOL_ID)}
      relatedTools={relatedTools(TOOL_ID)}
    >
      <ReferenceCheckerForm />
    </ToolPageLayout>
  );
}
