"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, SelectField, Tag, TextField, VisuallyHidden } from "@/ui";
import {
  CHECK_STATUS_LABELS,
  MEASUREMENT_LEVELS,
  MEASUREMENT_LEVEL_INFO,
  addMissingQuestions,
  addQuestion,
  addSection,
  applyQuestionnaire,
  buildQuestionnaire,
  checkQuestionnaire,
  describeProject,
  layoutPdf,
  questionNumbers,
  questionnaireCounts,
  questionnaireDocument,
  questionnaireDocx,
  questionnaireMarkdown,
  questionnairePdf,
  questionnaireText,
  questionnaireVariables,
  sectionQuestions,
  setQuestionnaireTitle,
  type CheckStatus,
  type MeasurementLevel,
  type Questionnaire,
} from "@/knowledge/research";
import { announcements } from "./announcements";
import { steps } from "./copy";
import { exampleInputs, exampleLevels } from "./example";
import { download } from "./export-files";
import { fileName } from "./file-name";
import { FormPreview, PrintPreview, WordPreview } from "./preview";
import { EMPTY_PROJECT_INPUTS, projectFromInputs, variablesFromInputs, type ProjectInputs } from "./project-input";
import { QuestionItem, type Update } from "./question-editor";
import { SectionEditor } from "./section-editor";

const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = { aligned: "info", review: "neutral", "worth-checking": "caution", missing: "caution", clarify: "caution" };
type PreviewMode = "desktop" | "mobile" | "print" | "word";
const PREVIEW_LABELS: Record<PreviewMode, string> = { desktop: steps.desktop, mobile: steps.mobile, print: steps.print, word: steps.word };

function Step({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-border pt-8">
      <h2 id={`${id}-title`} tabIndex={-1} className="text-heading font-semibold focus-ring">
        {heading}
      </h2>
      {children}
    </section>
  );
}

/**
 * The builder: the project it reads, the questionnaire built from it, its sections and
 * questions, checks, previews and exports. Every rule comes from the knowledge layer.
 */
export function QuestionnaireForm({ guide }: { guide: ReactNode }) {
  const [inputs, setInputs] = useState<ProjectInputs>(EMPTY_PROJECT_INPUTS);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [withHypotheses, setWithHypotheses] = useState(true);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  // Remounts the editors after a rebuild, so no field keeps text from the replaced questionnaire.
  const [generation, setGeneration] = useState(0);
  const [confirmRebuild, setConfirmRebuild] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [newSectionError, setNewSectionError] = useState<string | null>(null);
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const [announcement, setAnnouncement] = useState("");

  const project = useMemo(() => projectFromInputs(inputs, levels, withHypotheses), [inputs, levels, withHypotheses]);
  const variables = useMemo(() => questionnaireVariables(project), [project]);
  const typedVariables = useMemo(() => variablesFromInputs(inputs), [inputs]);
  const updated = useMemo(() => (questionnaire ? applyQuestionnaire(project, questionnaire) : project), [project, questionnaire]);
  const blocks = useMemo(() => (questionnaire ? questionnaireDocument(questionnaire, project) : []), [questionnaire, project]);
  const pages = useMemo(() => (mode === "print" ? layoutPdf(blocks) : []), [mode, blocks]);
  const checks = questionnaire ? checkQuestionnaire(questionnaire, project) : [];
  const counts = questionnaire ? questionnaireCounts(questionnaire, project) : null;
  const title = questionnaire?.title.trim() || "questionnaire";

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const focusLater = (id: string) => setTimeout(() => document.getElementById(id)?.focus(), 60);
  const update: Update = (next, message, focus) => {
    setQuestionnaire(next);
    if (message) announce(message);
    if (focus) focusLater(focus);
  };
  const build = (from = project) => {
    const built = buildQuestionnaire(from);
    setQuestionnaire(built);
    setGeneration((current) => current + 1);
    setConfirmRebuild(false);
    announce(announcements.built(built.questions.length));
    return built;
  };
  const setInput = (field: keyof ProjectInputs, value: string) => setInputs((current) => ({ ...current, [field]: value }));
  const text = (field: keyof ProjectInputs, label: string, hint?: string, rows = 2, describedBy?: string) => (
    <TextField id={`q-input-${field}`} label={label} hint={hint} multiline rows={rows} aria-describedby={describedBy} value={inputs[field]} onChange={(event) => setInput(field, event.target.value)} />
  );

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
              setWithHypotheses(true);
              build(projectFromInputs(exampleInputs, exampleLevels, true));
              announce(steps.exampleLoaded);
            }}
          >
            {steps.example}
          </Button>
        </div>
        <TextField id="q-input-topic" label={steps.topic} hint={steps.topicHint} autoComplete="off" value={inputs.topic} onChange={(event) => setInput("topic", event.target.value)} />
        {text("researchAim", steps.aim)}
        {text("researchQuestion", steps.question)}
        {text("researchObjectives", steps.objectives, steps.perLine, 3)}
        <p id="q-variables-hint" className="text-small text-text-muted">
          {steps.variablesHint}
        </p>
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {text("independent", steps.independent, undefined, 3, "q-variables-hint")}
          {text("dependent", steps.dependent, undefined, 3, "q-variables-hint")}
          {text("control", steps.control, steps.controlHint, 3, "q-variables-hint")}
          <TextField id="q-input-targetPopulation" label={steps.population} hint={steps.populationHint} autoComplete="off" value={inputs.targetPopulation} onChange={(event) => setInput("targetPopulation", event.target.value)} />
        </div>
        {typedVariables.length > 0 && (
          <fieldset className="grid gap-4" aria-describedby="q-levels-hint">
            <legend className="mb-1 text-subheading font-semibold">{steps.levelsLegend}</legend>
            <p id="q-levels-hint" className="text-small text-text-muted">
              {steps.levelsHint}
            </p>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {typedVariables.map((variable) => (
                <SelectField
                  key={variable.id}
                  id={`q-level-${variable.id}`}
                  label={steps.levelLabel(variable.name)}
                  emptyOption={steps.notSet}
                  options={MEASUREMENT_LEVELS.map((level) => ({ value: level, label: MEASUREMENT_LEVEL_INFO[level].label }))}
                  value={levels[variable.id] ?? ""}
                  onChange={(event) => setLevels((current) => ({ ...current, [variable.id]: event.target.value as MeasurementLevel | "" }))}
                />
              ))}
            </div>
          </fieldset>
        )}
        <RadioGroup
          name="q-hypotheses"
          legend={steps.hypothesesLegend}
          hint={steps.hypothesesHint}
          variant="inline"
          options={[
            { value: "yes", label: steps.withHypotheses },
            { value: "no", label: steps.withoutHypotheses },
          ]}
          value={withHypotheses ? "yes" : "no"}
          onChange={(value) => setWithHypotheses(value === "yes")}
        />
      </Step>

      <Step id="build" heading={steps.build}>
        <p className="text-text-muted">{steps.buildIntro}</p>
        {!questionnaire ? (
          <div>
            <Button onClick={() => build()}>{steps.buildButton}</Button>
          </div>
        ) : confirmRebuild ? (
          <div className="grid gap-3 rounded-panel border border-dashed border-foreground/60 p-4">
            <p id="q-rebuild-warning">{steps.rebuildWarning}</p>
            <div className="flex flex-wrap gap-3">
              <Button aria-describedby="q-rebuild-warning" onClick={() => build()}>
                {steps.rebuildConfirm}
              </Button>
              <Button id="q-rebuild-cancel" variant="secondary" onClick={() => setConfirmRebuild(false)}>
                {steps.rebuildCancel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                const before = questionnaire.questions.length;
                const next = addMissingQuestions(questionnaire, project);
                update(next, announcements.missingAdded(next.questions.length - before));
              }}
            >
              {steps.addMissing}
            </Button>
            <Button
              variant="subtle"
              onClick={() => {
                setConfirmRebuild(true);
                focusLater("q-rebuild-cancel");
              }}
            >
              {steps.rebuildButton}
            </Button>
          </div>
        )}
      </Step>

      {questionnaire && (
        <>
          <Step id="sections" heading={steps.structure}>
            <p className="text-text-muted">{steps.structureIntro}</p>
            <TextField id="q-title" label={steps.title} autoComplete="off" value={questionnaire.title} onChange={(event) => update(setQuestionnaireTitle(questionnaire, event.target.value))} />
            <ol className="grid gap-4" key={generation}>
              {questionnaire.sections.map((section, position) => (
                <SectionEditor key={section.id} section={section} position={position} questionnaire={questionnaire} project={project} update={update} />
              ))}
            </ol>
            <form
              className="grid items-end gap-3 sm:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newSection.trim()) {
                  setNewSectionError(steps.titleRequired);
                  return;
                }
                const result = addSection(questionnaire, newSection);
                setNewSection("");
                setNewSectionError(null);
                update(result.questionnaire, announcements.sectionAdded(newSection.trim()), `section-${result.id}-heading`);
              }}
            >
              <TextField id="new-section" label={steps.newSection} autoComplete="off" value={newSection} error={newSectionError ?? undefined} onChange={(event) => setNewSection(event.target.value)} />
              <Button type="submit" variant="secondary">
                {steps.addSection}
              </Button>
            </form>
          </Step>

          <Step id="questions" heading={steps.questions}>
            <p className="text-text-muted">{steps.questionsIntro}</p>
            {questionnaire.sections.map((section) => {
              const questions = sectionQuestions(questionnaire, section.id);
              return (
                <section key={`${generation}-${section.id}`} aria-labelledby={`questions-${section.id}-title`} className="grid gap-3">
                  <h3 id={`questions-${section.id}-title`} className="text-subheading font-semibold">
                    {section.title}
                  </h3>
                  <p className="text-small text-text-muted">{steps.sectionQuestionsCount(questions.length)}</p>
                  {questions.length > 0 && (
                    <ol className="grid gap-3">
                      {questions.map((question) => (
                        <QuestionItem key={question.id} question={question} questionnaire={questionnaire} project={project} variables={variables} update={update} />
                      ))}
                    </ol>
                  )}
                  <div>
                    <Button
                      id={`add-${section.id}`}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const result = addQuestion(questionnaire, section.id);
                        update(result.questionnaire, announcements.questionAdded(questionNumbers(result.questionnaire).get(result.id)!, section.title), `question-${result.id}-title`);
                      }}
                    >
                      {steps.addQuestion(section.title)}
                    </Button>
                  </div>
                </section>
              );
            })}
          </Step>

          <Step id="checks" heading={steps.checks}>
            <p className="text-text-muted">{steps.checksIntro}</p>
            <ul className="grid gap-3">
              {checks.map((check) => (
                <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
                  </p>
                  <p className="text-small">{check.explanation}</p>
                </li>
              ))}
            </ul>
            {counts && (
              <div className="grid gap-2">
                <h3 className="text-subheading font-semibold">{steps.counts}</h3>
                <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
                  {(
                    [
                      [steps.countSections, String(counts.sections)],
                      [steps.countQuestions, String(counts.questions)],
                      [steps.countRequired, String(counts.required)],
                      [steps.countUnwritten, String(counts.unwritten)],
                      [steps.byType, counts.byType.map((entry) => `${entry.label}: ${entry.count}`).join("; ") || "–"],
                      [steps.byVariable, counts.byVariable.map((entry) => `${entry.name}: ${entry.count}`).join("; ") || "–"],
                    ] as const
                  ).map(([term, value]) => (
                    <div key={term} className="contents">
                      <dt className="font-medium">{term}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Step>

          <Step id="preview" heading={steps.preview}>
            <p className="text-text-muted">{steps.previewIntro}</p>
            <RadioGroup
              name="q-preview"
              legend={steps.previewLegend}
              variant="inline"
              options={(Object.keys(PREVIEW_LABELS) as PreviewMode[]).map((value) => ({ value, label: PREVIEW_LABELS[value] }))}
              value={mode}
              onChange={(value) => {
                setMode(value);
                announce(announcements.preview(PREVIEW_LABELS[value]));
              }}
            />
            <div aria-label={PREVIEW_LABELS[mode]} role="region" className="grid gap-3">
              {mode === "desktop" && <FormPreview blocks={blocks} prefix="desktop" />}
              {mode === "mobile" && (
                <div className="grid gap-2">
                  <p className="text-small text-text-muted">{steps.mobileNote}</p>
                  <div className="mx-auto w-full max-w-[375px] rounded-panel border border-border-control p-4">
                    <FormPreview blocks={blocks} prefix="mobile" />
                  </div>
                </div>
              )}
              {mode === "print" && <PrintPreview blocks={blocks} pages={pages} />}
              {mode === "word" && <WordPreview blocks={blocks} />}
            </div>
          </Step>

          <Step id="export" heading={steps.export}>
            <p className="text-text-muted">{steps.exportIntro}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  download(questionnaireDocx(blocks, title), "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName(title, "docx"));
                  announce(announcements.downloaded("Word"));
                }}
              >
                {steps.docx}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  download(questionnairePdf(blocks, title), "application/pdf", fileName(title, "pdf"));
                  announce(announcements.downloaded("PDF"));
                }}
              >
                {steps.pdf}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  download(questionnaireMarkdown(blocks), "text/markdown;charset=utf-8", fileName(title, "md"));
                  announce(announcements.downloaded("Markdown"));
                }}
              >
                {steps.markdown}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  download(questionnaireText(blocks), "text/plain;charset=utf-8", fileName(title, "txt"));
                  announce(announcements.downloaded("Plain text"));
                }}
              >
                {steps.text}
              </Button>
              <CopyButton
                text={questionnaireText(blocks)}
                subject={steps.copySubject}
                copyLabel={steps.copyLabel}
                copiedLabel={steps.copiedLabel}
                onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)}
              />
            </div>
          </Step>
        </>
      )}

      <Step id="draft" heading={steps.projectDraft}>
        <p className="text-text-muted">{steps.projectDraftIntro}</p>
        {questionnaire ? null : <p className="text-text-muted">{steps.notBuilt}</p>}
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {describeProject(updated).map((row) => (
            <div key={row.field} className="contents">
              <dt className="font-medium">{row.label}</dt>
              <dd className="break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
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
