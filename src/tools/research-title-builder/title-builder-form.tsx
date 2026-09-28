"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, CopyButton, SelectField, TextField, VisuallyHidden } from "@/ui";
import { download } from "@/features/figure-export";
import { TitleExamples } from "@/features/research/title-examples";
import { WorkspaceProjectSummary } from "@/features/workspace/project-summary";
import { WorkspaceScope, useWorkspaceLink } from "@/features/workspace/workspace-scope";
import { EMPTY_DESIGN, RESEARCH_DESIGNS, chooseDesign, createProjectDraft, parseList, updateProjectDraft, type DesignId } from "@/knowledge/research";
import { questionnaireDocx, questionnairePdf } from "@/knowledge/research/questionnaire-export";
import { questionnaireMarkdown } from "@/knowledge/research/questionnaire-summary";
import {
  REPORT_TITLE,
  TITLE_EXAMPLES,
  addTitle,
  alignTitle,
  editTitle,
  evaluateTitle,
  removeTitle,
  restoreVersion,
  setWorkingTitle,
  titleReport,
  titleSetFrom,
  toggleFavourite,
  workingTitle,
  type TitleSet,
} from "@/knowledge/research/title";
import { AlignmentPanel } from "./alignment-panel";
import { announcements, ratingAnnouncement } from "./announcements";
import { steps } from "./copy";
import { KeywordPanelView } from "./keyword-panel";
import { TitleComparison } from "./title-comparison";
import { TitleEvaluationView } from "./title-evaluation";
import { TitleList } from "./title-list";

/** How long typing must pause before a changed rating is announced. */
const ANNOUNCE_AFTER_MS = 1200;
const NEW_TITLE_ID = "new-title";

type Inputs = Record<"problem" | "gap" | "question" | "objectives" | "independent" | "dependent" | "population" | "location" | "design", string>;
const EMPTY_INPUTS: Inputs = { problem: "", gap: "", question: "", objectives: "", independent: "", dependent: "", population: "", location: "", design: "" };

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

const fileName = (extension: string) => `research-title-review.${extension}`;

/** The typed drafts without one title's, once it is committed or gone. */
const without = (drafts: Readonly<Record<string, string>>, id: string) => Object.fromEntries(Object.entries(drafts).filter(([key]) => key !== id));

/**
 * The builder: the project the titles are checked against, the researcher's titles,
 * the working title's evaluation, keywords and alignment, a comparison of every title,
 * worked examples and export. Every judgement comes from the knowledge layer; this
 * component only holds what the researcher typed.
 */
function TitleBuilderFormContent() {
  const link = useWorkspaceLink();
  const [inputs, setInputs] = useState<Inputs>(EMPTY_INPUTS);
  const [set, setSet] = useState<TitleSet>(() => titleSetFrom(link.project?.projectTitle));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newTitle, setNewTitle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const rated = useRef<string | null>(null);

  const typedProject = useMemo(() => {
    const draft = createProjectDraft({
      researchProblem: inputs.problem,
      researchGap: inputs.gap,
      researchQuestion: inputs.question,
      researchObjectives: parseList(inputs.objectives),
      independentVariables: parseList(inputs.independent),
      dependentVariables: parseList(inputs.dependent),
      population: inputs.population,
      location: inputs.location,
    });
    return inputs.design ? updateProjectDraft(draft, { researchDesign: chooseDesign(EMPTY_DESIGN, inputs.design as DesignId) }) : draft;
  }, [inputs]);
  const project = link.project ?? typedProject;

  const textOf = (id: string, text: string) => drafts[id] ?? text;
  const evaluations = useMemo(
    () => set.titles.map((title) => ({ ...title, text: drafts[title.id] ?? title.text, working: title.id === set.workingId, evaluation: evaluateTitle(drafts[title.id] ?? title.text, project) })),
    [set, drafts, project],
  );
  const working = evaluations.find((title) => title.working) ?? null;
  const alignment = useMemo(() => (working ? alignTitle(working.text, project, working.evaluation.analysis, working.evaluation.keywords) : null), [working, project]);

  // Only the working title is saved, and only as committed, not while it is being typed.
  const committedWorking = workingTitle(set)?.text ?? null;
  const updated = useMemo(() => updateProjectDraft(project, { projectTitle: committedWorking }), [project, committedWorking]);
  useEffect(() => link.save(updated), [link, updated]);

  const rating = working ? ratingAnnouncement(working.evaluation.category, working.evaluation.criteria.filter((criterion) => criterion.status === "attention").map((criterion) => criterion.label)) : "";
  useEffect(() => {
    if (!rating || rating === rated.current) return;
    const timer = setTimeout(() => {
      rated.current = rating;
      setAnnouncement(rating);
    }, ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [rating]);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const titleText = (id: string) => {
    const title = set.titles.find((candidate) => candidate.id === id);
    return title ? textOf(id, title.text) : "";
  };

  const add = (event: FormEvent) => {
    event.preventDefault();
    const next = addTitle(set, newTitle);
    if (next === set) {
      setAddError(steps.addError);
      document.getElementById(NEW_TITLE_ID)?.focus();
      return;
    }
    const added = next.titles[next.titles.length - 1];
    setSet(next);
    setNewTitle("");
    setAddError(null);
    announce(announcements.added(added.text, next.workingId === added.id));
  };
  const commit = (id: string) => {
    if (drafts[id] === undefined) return;
    setSet((current) => editTitle(current, id, drafts[id], Date.now()));
    setDrafts((current) => without(current, id));
  };
  const makeWorking = (id: string) => {
    setSet((current) => setWorkingTitle(current, id));
    announce(announcements.working(titleText(id)));
  };
  const favourite = (id: string) => {
    const on = !set.titles.find((title) => title.id === id)?.favourite;
    setSet((current) => toggleFavourite(current, id));
    announce(announcements.favourite(titleText(id), on));
  };
  const remove = (id: string) => {
    const text = titleText(id);
    setSet((current) => removeTitle(current, id));
    setDrafts((current) => without(current, id));
    announce(announcements.removed(text));
    document.getElementById(NEW_TITLE_ID)?.focus();
  };
  const restore = (id: string, index: number) => {
    const version = set.titles.find((title) => title.id === id)?.history[index];
    setSet((current) => restoreVersion(current, id, index, Date.now()));
    setDrafts((current) => without(current, id));
    if (version) announce(announcements.restored(version.text));
  };

  const report = () => titleReport({ ...set, titles: set.titles.map((title) => ({ ...title, text: textOf(title.id, title.text) })) }, working?.evaluation ?? null, alignment);
  const exportAs = (format: "Markdown" | "Word" | "PDF") => {
    const blocks = report();
    if (format === "Markdown") download(new Blob([questionnaireMarkdown(blocks)], { type: "text/markdown;charset=utf-8" }), fileName("md"));
    if (format === "Word") download(new Blob([questionnaireDocx(blocks, REPORT_TITLE)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), fileName("docx"));
    if (format === "PDF") download(new Blob([questionnairePdf(blocks, REPORT_TITLE)], { type: "application/pdf" }), fileName("pdf"));
    announce(announcements.downloaded(format));
  };

  const change = (field: keyof Inputs, value: string) => setInputs((current) => ({ ...current, [field]: value }));
  const input = (field: keyof Inputs, label: string, hint?: string, multiline = true) =>
    multiline ? (
      <TextField id={`title-project-${field}`} label={label} hint={hint} multiline rows={2} value={inputs[field]} onChange={(event) => change(field, event.target.value)} />
    ) : (
      <TextField id={`title-project-${field}`} label={label} hint={hint} value={inputs[field]} onChange={(event) => change(field, event.target.value)} />
    );

  return (
    <div className="grid gap-10">
      {link.project ? (
        <Step id="from-project" heading={steps.fromProject}>
          <WorkspaceProjectSummary stage="title" project={link.project} />
        </Step>
      ) : (
        <Step id="project" heading={steps.project}>
          <p className="text-text-muted">{steps.projectIntro}</p>
          {input("problem", steps.problem)}
          {input("gap", steps.gap)}
          {input("question", steps.question)}
          {input("objectives", steps.objectives, steps.perLine)}
          <div className="grid items-start gap-6 sm:grid-cols-2">
            {input("independent", steps.independent, steps.perLine)}
            {input("dependent", steps.dependent, steps.perLine)}
            {input("population", steps.population, undefined, false)}
            {input("location", steps.location, undefined, false)}
          </div>
          <SelectField
            id="title-project-design"
            label={steps.design}
            emptyOption={steps.notChosen}
            options={RESEARCH_DESIGNS.map((design) => ({ value: design.id, label: design.name }))}
            value={inputs.design}
            onChange={(event) => setInputs((current) => ({ ...current, design: event.target.value }))}
          />
        </Step>
      )}

      <Step id="titles" heading={steps.titles}>
        <p className="text-text-muted">{steps.titlesIntro}</p>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <TextField
            id={NEW_TITLE_ID}
            label={steps.newTitle}
            hint={steps.newTitleHint}
            error={addError ?? undefined}
            value={newTitle}
            onChange={(event) => {
              setNewTitle(event.target.value);
              if (addError) setAddError(null);
            }}
          />
          <Button type="submit">{steps.add}</Button>
        </form>
        <TitleList
          titles={set.titles}
          workingId={set.workingId}
          drafts={drafts}
          categories={Object.fromEntries(evaluations.map((title) => [title.id, title.evaluation.category]))}
          onType={(id, text) => setDrafts((current) => ({ ...current, [id]: text }))}
          onCommit={commit}
          onWorking={makeWorking}
          onFavourite={favourite}
          onRemove={remove}
          onRestore={restore}
        />
      </Step>

      <Step id="evaluation" heading={steps.evaluation}>
        <p className="text-text-muted">{steps.evaluationIntro}</p>
        {working ? <TitleEvaluationView evaluation={working.evaluation} /> : <p className="text-text-muted">{steps.noWorking}</p>}
      </Step>

      {working && alignment && (
        <>
          <Step id="keywords" heading={steps.keywords}>
            <p className="text-text-muted">{steps.keywordsIntro}</p>
            <KeywordPanelView keywords={working.evaluation.keywords} />
          </Step>

          <Step id="alignment" heading={steps.alignment}>
            <p className="text-text-muted">{steps.alignmentIntro}</p>
            <AlignmentPanel alignment={alignment} />
          </Step>
        </>
      )}

      <Step id="compare" heading={steps.compare}>
        <p className="text-text-muted">{steps.compareIntro}</p>
        {evaluations.length >= 2 ? <TitleComparison titles={evaluations} /> : <p className="text-text-muted">{steps.compareNeedsTwo}</p>}
      </Step>

      <Step id="learn" heading={steps.learn}>
        <p className="text-text-muted">{steps.learnIntro}</p>
        <TitleExamples examples={TITLE_EXAMPLES} labels={steps} />
      </Step>

      <Step id="export" heading={steps.export}>
        <p className="text-text-muted">{steps.exportIntro}</p>
        <div className="flex flex-wrap gap-3">
          {working && (
            <CopyButton
              text={working.text}
              subject={steps.copySubject}
              copyLabel={steps.copyTitle}
              copiedLabel={steps.copiedTitle}
              onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)}
            />
          )}
          <Button variant="secondary" onClick={() => exportAs("Markdown")}>
            {steps.markdown}
          </Button>
          <Button variant="secondary" onClick={() => exportAs("Word")}>
            {steps.word}
          </Button>
          <Button variant="secondary" onClick={() => exportAs("PDF")}>
            {steps.pdf}
          </Button>
        </div>
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}

/** The tool, working in the workspace project when there is one. */
export function TitleBuilderForm() {
  return (
    <WorkspaceScope stage="title">
      <TitleBuilderFormContent />
    </WorkspaceScope>
  );
}
