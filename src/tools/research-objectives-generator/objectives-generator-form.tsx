"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, CopyButton, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import {
  addObjective,
  buildDraftGeneralObjective,
  createProjectDraft,
  describeProject,
  duplicateObjective,
  editObjective,
  evaluateObjectives,
  getVerbCategory,
  moveObjective,
  parseList,
  removeObjective,
  suggestSpecificObjectiveOutlines,
  suggestVerbCategories,
  updateProjectDraft,
  type ObjectiveVerbCategoryId,
} from "@/knowledge/research";
import { announcements, evaluationAnnouncement } from "./announcements";
import { actions, evaluation as evaluationCopy, form, general as generalCopy, project as projectCopy, specific, verbs as verbsCopy } from "./copy";
import { ObjectivesEvaluationView } from "./objectives-evaluation";
import { ObjectivesList } from "./objectives-list";
import { emptyInput, ProjectDetailInputs, type ObjectivesInput } from "./project-inputs";
import { VerbChooser } from "./verb-chooser";
import { WorkspaceProjectSummary } from "@/features/workspace/project-summary";
import { useWorkspaceLink, WorkspaceScope } from "@/features/workspace/workspace-scope";

/** How long typing must pause before the evaluation summary is announced. */
const ANNOUNCE_AFTER_MS = 1200;
const GENERAL_OBJECTIVE_FIELD_ID = "general-objective";

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

/** The general objective and numbered specific objectives, as one block of plain text. */
function objectivesText(generalObjective: string, specificObjectives: readonly string[]): string {
  const lines = [`${generalCopy.heading}: ${generalObjective || "—"}`];
  if (specificObjectives.length > 0) {
    lines.push("", `${specific.heading}:`, ...specificObjectives.map((objective, index) => `${index + 1}. ${objective}`));
  }
  return lines.join("\n");
}

/**
 * The generator: a verb category and verb, a draft and editable general objective, an
 * editable list of specific objectives, and their alignment and quality checks. All
 * academic logic comes from the knowledge layer; this component only holds what the
 * researcher typed and chose.
 */
function ObjectivesGeneratorFormContent() {
  const link = useWorkspaceLink();
  const [input, setInput] = useState<ObjectivesInput>(emptyInput);
  const [category, setCategory] = useState<ObjectiveVerbCategoryId | null>(null);
  const [verb, setVerb] = useState("");
  const [generalObjective, setGeneralObjective] = useState(() => link.project?.researchAim ?? "");
  const [specificObjectives, setSpecificObjectives] = useState<string[]>(() => [...(link.project?.researchObjectives ?? [])]);
  const [announcement, setAnnouncement] = useState("");
  const changed = useRef(false);

  const typedProject = useMemo(
    () =>
      createProjectDraft({
        researchQuestion: input.researchQuestion,
        topic: input.topic,
        population: input.population,
        location: input.location,
        timeContext: input.timeContext,
        independentVariables: parseList(input.independentVariables),
        dependentVariables: parseList(input.dependentVariables),
      }),
    [input],
  );
  const project = link.project ?? typedProject;

  const suggestions = useMemo(() => suggestVerbCategories(project.researchQuestion), [project.researchQuestion]);
  const categoryName = category ? getVerbCategory(category).name : "";
  const draft = useMemo(() => (category && verb ? buildDraftGeneralObjective(category, verb, project, categoryName) : null), [category, verb, project, categoryName]);
  const outlines = useMemo(() => (category && verb ? suggestSpecificObjectiveOutlines(category, verb, project, categoryName) : []), [category, verb, project, categoryName]);
  const result = useMemo(() => evaluateObjectives(generalObjective, specificObjectives, project), [generalObjective, specificObjectives, project]);
  const updated = useMemo(() => updateProjectDraft(project, { researchAim: generalObjective, researchObjectives: specificObjectives }), [project, generalObjective, specificObjectives]);
  useEffect(() => link.save(updated), [link, updated]);

  const summary = evaluationAnnouncement([
    ...result.general.map((check) => check.status),
    ...result.specificOverall.map((check) => check.status),
    ...result.specific.flatMap((entry) => entry.checks.map((check) => check.status)),
  ]);
  useEffect(() => {
    if (!changed.current || !summary) return;
    const timer = setTimeout(() => setAnnouncement(summary), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [summary]);

  const chooseCategory = (next: ObjectiveVerbCategoryId) => {
    setCategory(next);
    setVerb(getVerbCategory(next).verbs[0]);
    setAnnouncement(announcements.categoryChosen(getVerbCategory(next).name));
  };

  const useDraft = () => {
    if (!draft) return;
    changed.current = true;
    setGeneralObjective(draft.text);
    setAnnouncement(announcements.draftUsed);
    document.getElementById(GENERAL_OBJECTIVE_FIELD_ID)?.focus();
  };

  const addOutline = (text: string) => {
    changed.current = true;
    setSpecificObjectives((current) => addObjective(current, text));
    setAnnouncement(announcements.outlineAdded);
  };

  const addSpecific = (text: string) => {
    changed.current = true;
    setSpecificObjectives((current) => addObjective(current, text));
    setAnnouncement(announcements.objectiveAdded);
  };
  const editSpecific = (index: number, text: string) => {
    changed.current = true;
    setSpecificObjectives((current) => editObjective(current, index, text));
  };
  const removeSpecific = (index: number) => {
    changed.current = true;
    setSpecificObjectives((current) => removeObjective(current, index));
    setAnnouncement(announcements.objectiveRemoved(index + 1));
  };
  const duplicateSpecific = (index: number) => {
    changed.current = true;
    setSpecificObjectives((current) => duplicateObjective(current, index));
    setAnnouncement(announcements.objectiveDuplicated(index + 1));
  };
  const moveSpecific = (index: number, toIndex: number) => {
    changed.current = true;
    setSpecificObjectives((current) => {
      const next = moveObjective(current, index, toIndex);
      setAnnouncement(announcements.objectiveMoved(toIndex + 1, next.length));
      return next;
    });
  };

  const copied = (outcome: CopyResult) => setAnnouncement(outcome === "copied" ? announcements.copied(actions.copySubject) : announcements.copyFailed(actions.copySubject));

  return (
    <div className="grid gap-10">
      {link.project ? (
        <Step id="from-project" heading={form.questionHeading}>
          <WorkspaceProjectSummary stage="objectives" project={link.project} />
        </Step>
      ) : (
        <Step id="question" heading={form.questionHeading}>
          <TextField
            id="objectives-research-question"
            label={form.questionLabel}
            hint={form.questionHint}
            multiline
            rows={3}
            value={input.researchQuestion}
            onChange={(event) => setInput((current) => ({ ...current, researchQuestion: event.target.value }))}
          />
          <h3 className="text-subheading font-semibold">{form.detailsHeading}</h3>
          <p className="text-small text-text-muted">{form.detailsHint}</p>
          <ProjectDetailInputs input={input} onChange={(changes) => setInput((current) => ({ ...current, ...changes }))} />
        </Step>
      )}

      <Step id="verbs" heading={verbsCopy.heading}>
        <p className="text-text-muted">{verbsCopy.intro}</p>
        <VerbChooser suggestions={suggestions} category={category} verb={verb} onCategory={chooseCategory} onVerb={setVerb} />
      </Step>

      <Step id="general" heading={generalCopy.heading}>
        <div className="grid gap-3 rounded-panel border border-border bg-surface p-4 sm:p-6">
          <h3 className="text-subheading font-semibold">{generalCopy.draftHeading}</h3>
          {draft ? (
            <>
              <p className="text-lead">{draft.text}</p>
              <p className="text-small text-text-muted">{draft.explanation}</p>
              <div>
                <Button variant="secondary" onClick={useDraft}>
                  {generalCopy.useDraft}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-text-muted">{generalCopy.draftIntro}</p>
          )}
        </div>
        <TextField
          id={GENERAL_OBJECTIVE_FIELD_ID}
          label={generalCopy.label}
          hint={generalCopy.hint}
          multiline
          rows={3}
          value={generalObjective}
          onChange={(event) => {
            changed.current = true;
            setGeneralObjective(event.target.value);
          }}
        />
      </Step>

      <Step id="specific" heading={specific.heading}>
        <p className="text-text-muted">{specific.intro}</p>
        {outlines.length > 0 && (
          <div className="grid gap-3">
            <h3 className="text-subheading font-semibold">{specific.outlinesHeading}</h3>
            <p className="text-small text-text-muted">{specific.outlinesIntro}</p>
            <ul className="grid gap-2">
              {outlines.map((outline, index) => (
                <li key={index} className="grid gap-2 rounded-panel border border-border bg-surface p-4">
                  <p>{outline.text}</p>
                  <div>
                    <Button variant="secondary" size="sm" onClick={() => addOutline(outline.text)}>
                      {specific.addOutline}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ObjectivesList objectives={specificObjectives} onAdd={addSpecific} onEdit={editSpecific} onRemove={removeSpecific} onDuplicate={duplicateSpecific} onMove={moveSpecific} />
      </Step>

      <Step id="evaluation" heading={evaluationCopy.heading}>
        <ObjectivesEvaluationView result={result} />
      </Step>

      <Step id="copy" heading={actions.copyHeading}>
        <CopyButton text={objectivesText(generalObjective, specificObjectives)} subject={actions.copySubject} onResult={copied} />
      </Step>

      <Step id="project" heading={projectCopy.heading}>
        <p className="text-text-muted">{projectCopy.intro}</p>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {describeProject(updated).map((row) => (
            <div key={row.field} className="contents">
              <dt className="font-medium">{row.label}</dt>
              <dd className="break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}

/** The tool, working in the workspace project when there is one. */
export function ObjectivesGeneratorForm() {
  return (
    <WorkspaceScope stage="objectives">
      <ObjectivesGeneratorFormContent />
    </WorkspaceScope>
  );
}
