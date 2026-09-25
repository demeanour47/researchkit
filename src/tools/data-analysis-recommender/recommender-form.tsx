"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, VisuallyHidden } from "@/ui";
import { ProjectFields } from "@/features/research";
import { analysisPlanText, recommendAnalyses, type MeasurementLevel } from "@/knowledge/research";
import { announcements, planAnnouncement } from "./announcements";
import { steps } from "./copy";
import { exampleInputs, exampleLevels } from "./example";
import { PlanView } from "./plan-view";
import { EMPTY_PROJECT_INPUTS, projectFromInputs, type ProjectInputs } from "./project-input";

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

/** The project the recommender reads, and the plan it gives. Every rule runs in the knowledge layer. */
export function RecommenderForm({ guide }: { guide: ReactNode }) {
  const [inputs, setInputs] = useState<ProjectInputs>(EMPTY_PROJECT_INPUTS);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [announcement, setAnnouncement] = useState("");
  const project = useMemo(() => projectFromInputs(inputs, levels), [inputs, levels]);
  const plan = useMemo(() => recommendAnalyses(project), [project]);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  /** Choices change the plan at once, so the change is announced; typing isn't, to avoid constant interruptions. */
  const choose = (next: ProjectInputs, nextLevels = levels) => {
    setInputs(next);
    setLevels(nextLevels);
    announce(planAnnouncement(recommendAnalyses(projectFromInputs(next, nextLevels))));
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
              setInputs({ ...exampleInputs });
              setLevels({ ...exampleLevels });
              announce(`${announcements.exampleLoaded} ${planAnnouncement(recommendAnalyses(projectFromInputs(exampleInputs, exampleLevels)))}`);
            }}
          >
            {steps.example}
          </Button>
        </div>
        <ProjectFields prefix="da" value={inputs} levels={levels} onType={(field, text) => setInputs((current) => ({ ...current, [field]: text }))} onChoose={choose} />
      </Step>

      <Step id="plan" heading={steps.plan}>
        <p className="text-text-muted">{steps.planIntro}</p>
        <PlanView plan={plan} />
        <div>
          <CopyButton text={analysisPlanText(plan)} subject={steps.copySubject} copyLabel={steps.copyLabel} copiedLabel={steps.copiedLabel} onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
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
