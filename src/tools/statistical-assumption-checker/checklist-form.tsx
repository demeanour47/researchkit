"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, VisuallyHidden } from "@/ui";
import { ProjectFields } from "@/features/research";
import { EMPTY_TYPED_PROJECT, assumptionChecklist, checklistText, projectFromTyped, updateProjectDraft, type MeasurementLevel, type TypedProject } from "@/knowledge/research";
import { acceptance, checklistMethods } from "@/knowledge/workspace/accepted";
import { announcements, checklistAnnouncement } from "./announcements";
import { ChecklistView } from "./checklist-view";
import { steps } from "./copy";
import { exampleLevels, exampleProject } from "./example";
import { WorkspaceProjectSummary } from "@/features/workspace/project-summary";
import { SaveToProject } from "@/features/workspace/save-to-project";
import { useWorkspaceLink, WorkspaceScope } from "@/features/workspace/workspace-scope";

function Step({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-border pt-8">
      <h2 id={`${id}-title`} className="text-heading font-semibold">
        {heading}
      </h2>
      {children}
    </section>
  );
}

/** The project and its assumption checklist. The guide to every analysis is rendered on the server and passed in. */
function ChecklistFormContent({ guide }: { guide: ReactNode }) {
  const link = useWorkspaceLink();
  const [project, setProject] = useState<TypedProject>(EMPTY_TYPED_PROJECT);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [announcement, setAnnouncement] = useState("");
  // In the workspace the checklist reads the saved project; on its own, the details typed here.
  const draft = useMemo(() => link.project ?? projectFromTyped(project, levels), [link.project, project, levels]);
  const checklist = useMemo(() => assumptionChecklist(draft), [draft]);
  const methods = useMemo(() => checklistMethods(checklist), [checklist]);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  /** Choices change the checklist at once, so they are announced; typing isn't, to avoid constant interruptions. */
  const choose = (next: TypedProject, nextLevels: Record<string, MeasurementLevel | "">) => {
    setProject(next);
    setLevels(nextLevels);
    announce(checklistAnnouncement(assumptionChecklist(projectFromTyped(next, nextLevels))));
  };

  return (
    <div className="grid gap-10">
      <Step id="project" heading={steps.project}>
        {link.project ? (
          <WorkspaceProjectSummary stage="assumptions" project={link.project} />
        ) : (
          <>
            <p className="text-text-muted">{steps.projectIntro}</p>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setProject({ ...exampleProject });
                  setLevels({ ...exampleLevels });
                  announce(`${steps.exampleLoaded} ${checklistAnnouncement(assumptionChecklist(projectFromTyped(exampleProject, { ...exampleLevels })))}`);
                }}
              >
                {steps.example}
              </Button>
            </div>
            <ProjectFields prefix="ac" value={project} levels={levels} onType={(field, text) => setProject((current) => ({ ...current, [field]: text }))} onChoose={choose} />
          </>
        )}
      </Step>

      <Step id="checklist" heading={steps.checklist}>
        <p className="text-text-muted">{steps.checklistIntro}</p>
        <ChecklistView checklist={checklist} />
        <div>
          <CopyButton text={checklistText(checklist)} subject={steps.copySubject} copyLabel={steps.copyLabel} copiedLabel={steps.copiedLabel} onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
        </div>
        {link.project && (
          <SaveToProject
            subject={steps.saveSubject}
            state={acceptance(link.project.statisticalAssumptions, methods)}
            onSave={() => link.save(updateProjectDraft(draft, { statisticalAssumptions: { methods, notes: link.project?.statisticalAssumptions?.notes ?? "" } }))}
          />
        )}
      </Step>

      <Step id="guide" heading={steps.guide}>
        {guide}
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}

/** The tool, working in the workspace project when there is one. */
export function ChecklistForm(props: Parameters<typeof ChecklistFormContent>[0]) {
  return (
    <WorkspaceScope stage="assumptions">
      <ChecklistFormContent {...props} />
    </WorkspaceScope>
  );
}
