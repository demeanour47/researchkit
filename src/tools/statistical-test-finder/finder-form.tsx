"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon, Link, RadioGroup, SelectField, TextField, VisuallyHidden } from "@/ui";
import { useWorkspace } from "@/features/workspace/store";
import { WORKSPACE_PATH } from "@/features/workspace/stage-links";
import {
  findTests,
  getQuestion,
  namesOutcome,
  namesPredictor,
  projectStarts,
  unansweredQuestions,
  visibleQuestions,
  type FinderAnswers,
  type FinderQuestionId,
  type ProjectStart,
} from "@/knowledge/research/test-finder";
import { TOOL_PATH as RECOMMENDER_PATH } from "@/tools/data-analysis-recommender/path";
import { TOOL_PATH as CHECKER_PATH } from "@/tools/statistical-assumption-checker/path";
import { TOOL_PATH as INTERPRETER_PATH } from "@/tools/results-interpretation/path";
import { TOOL_PATH as SPSS_LAB_PATH } from "@/tools/spss-research-lab/path";
import { resultAnnouncement, resultKey } from "./announcements";
import { CandidateCard } from "./candidate-card";
import { form, nextSteps, results as copy } from "./copy";

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

const optionLabel = (label: string, hint?: string) => (
  <span className="grid">
    <span>{label}</span>
    {hint && <span className="text-small font-normal text-text-muted">{hint}</span>}
  </span>
);

function nameLabels(answers: FinderAnswers): { outcome: string; predictor: string } {
  switch (answers.purpose) {
    case "describe":
      return { outcome: form.variableName, predictor: form.predictorName };
    case "relationship":
      return { outcome: form.firstName, predictor: form.secondName };
    case "compare":
      return { outcome: form.outcomeName, predictor: form.groupingName };
    default:
      return { outcome: form.outcomeName, predictor: form.predictorName };
  }
}

/**
 * The finder: a starting point from the project if there is one, the questions that
 * matter so far, and the result. Every judgement comes from the knowledge layer; this
 * component holds only the answers. It reads the workspace project but never writes to it.
 */
export function TestFinderForm() {
  const snapshot = useWorkspace();
  const project = snapshot?.status === "ready" ? snapshot.workspace.draft : null;
  const starts = useMemo(() => (project ? projectStarts(project) : []), [project]);
  const [answers, setAnswers] = useState<FinderAnswers>({});
  const [chosen, setChosen] = useState("");
  const [used, setUsed] = useState<ProjectStart | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const result = useMemo(() => findTests(answers), [answers]);
  const key = resultKey(result);
  const announced = useRef(key);
  useEffect(() => {
    if (key === announced.current) return;
    announced.current = key;
    setAnnouncement(resultAnnouncement(result));
  }, [key, result]);

  const answer = (id: FinderQuestionId, value: string) => setAnswers((current) => ({ ...current, [id]: value }) as FinderAnswers);
  const name = (field: "outcomeName" | "predictorName", value: string) => setAnswers((current) => ({ ...current, [field]: value }));
  const labels = nameLabels(answers);

  const startFromHypothesis = () => {
    const start = starts.find((candidate) => candidate.id === chosen);
    if (!start) return;
    announced.current = resultKey(findTests(start.answers));
    setAnswers(start.answers);
    setUsed(start);
    setAnnouncement(form.hypothesisUsed(unansweredQuestions(start.answers).length));
  };
  const startOver = () => {
    announced.current = resultKey(findTests({}));
    setAnswers({});
    setUsed(null);
    setAnnouncement(form.startedOver);
  };

  const nameField = (field: "outcomeName" | "predictorName", label: string) => (
    <TextField id={`finder-${field}`} label={label} hint={form.nameHint} value={answers[field] ?? ""} autoComplete="off" onChange={(event) => name(field, event.target.value)} />
  );

  return (
    <div className="grid gap-10">
      {starts.length > 0 && (
        <Step id="from-project" heading={form.projectHeading}>
          <p className="text-text-muted">{form.projectIntro}</p>
          {project?.researchQuestion && (
            <p className="rounded-panel border border-border bg-surface p-4">
              <span className="font-medium">{form.researchQuestion}:</span> {project.researchQuestion}
            </p>
          )}
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
            <SelectField id="finder-hypothesis" label={form.hypothesisLabel} emptyOption="—" options={starts.map((start) => ({ value: start.id, label: start.label }))} value={chosen} onChange={(event) => setChosen(event.target.value)} />
            <Button variant="secondary" onClick={startFromHypothesis} disabled={!chosen}>
              {form.useHypothesis}
            </Button>
          </div>
          {used && (
            <div className="grid gap-2">
              <h3 className="font-semibold">{form.readFromHeading}</h3>
              <ul className="grid list-disc gap-1 ps-5 text-small">
                {used.readFrom.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </Step>
      )}

      <Step id="questions" heading={form.questionsHeading}>
        <p className="text-text-muted">{form.questionsIntro}</p>
        {visibleQuestions(answers).map((id) => {
          const question = getQuestion(id, answers);
          return (
            <div key={id} className="grid gap-4">
              <RadioGroup
                name={`finder-${id}`}
                legend={question.prompt}
                hint={question.hint}
                options={question.options.map((option) => ({ value: option.value, label: optionLabel(option.label, option.hint) }))}
                value={(answers[id] as string | undefined) ?? undefined}
                onChange={(value) => answer(id, value)}
              />
              {id === "outcomeLevel" && namesOutcome(answers) && nameField("outcomeName", labels.outcome)}
              {(id === "groups" || id === "predictorLevel") && namesPredictor(answers) && nameField("predictorName", labels.predictor)}
            </div>
          );
        })}
        {Object.keys(answers).length > 0 && (
          <div>
            <Button variant="subtle" onClick={startOver}>
              {form.startOver}
            </Button>
          </div>
        )}
      </Step>

      <Step id="results" heading={copy.heading}>
        {result.status === "incomplete" && (
          <div className="grid gap-3">
            <h3 className="font-semibold">{copy.stillNeededHeading}</h3>
            <p className="text-small text-text-muted">{copy.stillNeededIntro}</p>
            <ol className="grid list-decimal gap-2 ps-5">
              {result.missing.map((entry) => (
                <li key={entry.question}>
                  <span className="font-medium">{entry.prompt}</span> <span className="text-small text-text-muted">{entry.why}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {result.status === "invalid" && (
          <div className="grid gap-2 rounded-panel border border-border bg-sunken p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Icon name="alert" className="text-warning" />
              {copy.problemsHeading}
            </h3>
            <ul className="grid list-disc gap-1 ps-5">
              {result.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}
        {result.status === "complete" && (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <h3 className="font-semibold">{copy.situationHeading}</h3>
              <ul className="grid list-disc gap-1 ps-5 text-small">
                {result.situation.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            {result.notes.length > 0 && (
              <div className="grid gap-2">
                <h3 className="font-semibold">{copy.notesHeading}</h3>
                <ul className="grid list-disc gap-1 ps-5 text-small">
                  {result.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.candidates.length > 0 ? (
              <>
                <p className="text-text-muted">{copy.intro}</p>
                <div className="grid gap-6">
                  {result.candidates.map((candidate) => (
                    <CandidateCard key={candidate.method} candidate={candidate} />
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-panel border border-border bg-surface p-4">{copy.noneCovered}</p>
            )}
          </div>
        )}
      </Step>

      <Step id="next" heading={nextSteps.heading}>
        <p className="text-text-muted">{nextSteps.intro}</p>
        <ul className="grid gap-2">
          <li>
            <Link href={RECOMMENDER_PATH} variant="standalone">
              {nextSteps.recommender}
            </Link>
          </li>
          <li>
            <Link href={CHECKER_PATH} variant="standalone">
              {nextSteps.checker}
            </Link>
          </li>
          <li>
            <Link href={INTERPRETER_PATH} variant="standalone">
              {nextSteps.interpreter}
            </Link>
          </li>
          <li>
            <Link href={SPSS_LAB_PATH} variant="standalone">
              {nextSteps.spssLab}
            </Link>
          </li>
          <li>
            <Link href={WORKSPACE_PATH} variant="standalone">
              {nextSteps.workspace}
            </Link>
          </li>
        </ul>
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
