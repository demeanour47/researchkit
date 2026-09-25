"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, VisuallyHidden } from "@/ui";
import { ProjectFields } from "@/features/research";
import { EMPTY_TYPED_PROJECT, assumptionChecklist, checklistText, projectFromTyped, type MeasurementLevel, type TypedProject } from "@/knowledge/research";
import { announcements, checklistAnnouncement } from "./announcements";
import { ChecklistView } from "./checklist-view";
import { steps } from "./copy";
import { exampleLevels, exampleProject } from "./example";

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
export function ChecklistForm({ guide }: { guide: ReactNode }) {
  const [project, setProject] = useState<TypedProject>(EMPTY_TYPED_PROJECT);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [announcement, setAnnouncement] = useState("");
  const checklist = useMemo(() => assumptionChecklist(projectFromTyped(project, levels)), [project, levels]);

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
      </Step>

      <Step id="checklist" heading={steps.checklist}>
        <p className="text-text-muted">{steps.checklistIntro}</p>
        <ChecklistView checklist={checklist} />
        <div>
          <CopyButton text={checklistText(checklist)} subject={steps.copySubject} copyLabel={steps.copyLabel} copiedLabel={steps.copiedLabel} onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
        </div>
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
