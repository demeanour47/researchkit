"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, TextField, VisuallyHidden } from "@/ui";
import {
  buildDraftQuestion,
  createProjectDraft,
  evaluateQuestion,
  getQuestionType,
  parseList,
  suggestQuestionTypes,
  type MethodologyId,
  type QuestionTypeId,
} from "@/knowledge/research";
import { announcements, drafting, feedback as feedbackCopy, form, types as typesCopy } from "./copy";
import { ProjectFields, emptyProjectInput, type ProjectInput } from "./project-fields";
import { QuestionFeedback } from "./question-feedback";
import { TypeChooser } from "./type-chooser";

/** How long typing must pause before the feedback summary is announced. */
const ANNOUNCE_AFTER_MS = 1200;
const QUESTION_FIELD_ID = "research-question";

function Step({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-border pt-8">
      <h2 id={`${id}-title`} className="text-heading font-semibold">
        {heading}
      </h2>
      {children}
    </section>
  );
}

/**
 * The builder: project details, a question type, the researcher's own question, and
 * feedback. Everything is computed by the knowledge layer and held only in this page's memory.
 */
export function QuestionBuilderForm() {
  const [input, setInput] = useState<ProjectInput>(emptyProjectInput);
  const [type, setType] = useState<QuestionTypeId | null>(null);
  const [question, setQuestion] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const typed = useRef(false);

  const project = useMemo(
    () =>
      createProjectDraft({
        researchArea: input.researchArea,
        topic: input.topic,
        population: input.population,
        location: input.location,
        timeContext: input.timeContext,
        researchAim: input.researchAim,
        independentVariables: parseList(input.independentVariables),
        dependentVariables: parseList(input.dependentVariables),
        methodology: (input.methodology || undefined) as MethodologyId | undefined,
        researchOnionSelection: { philosophy: input.philosophy || undefined, approach: input.approach || undefined },
      }),
    [input],
  );
  const suggestions = useMemo(() => suggestQuestionTypes(project), [project]);
  const draft = useMemo(() => (type ? buildDraftQuestion(type, project) : null), [type, project]);
  const evaluation = useMemo(() => (question.trim() ? evaluateQuestion(question, project, type) : null), [question, project, type]);

  const summary = evaluation
    ? announcements.feedbackUpdated(evaluation.strengths.length, evaluation.weaknesses.length, evaluation.missing.length)
    : "";
  useEffect(() => {
    if (!typed.current || !summary) return;
    const timer = setTimeout(() => setAnnouncement(summary), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [summary]);

  const chooseType = (next: QuestionTypeId) => {
    setType(next);
    setAnnouncement(announcements.typeChosen(getQuestionType(next).name));
  };

  const startFromDraft = () => {
    if (!draft) return;
    typed.current = false;
    setQuestion(draft.text);
    setAnnouncement(announcements.draftUsed);
    document.getElementById(QUESTION_FIELD_ID)?.focus();
  };

  return (
    <div className="grid gap-10">
      <Step id="project" heading={form.projectHeading}>
        <p className="text-text-muted">{form.projectHint}</p>
        <ProjectFields input={input} onChange={(changes) => setInput((current) => ({ ...current, ...changes }))} />
      </Step>

      <Step id="type" heading={typesCopy.heading}>
        <p className="text-text-muted">{typesCopy.intro}</p>
        <TypeChooser suggestions={suggestions} value={type} onChange={chooseType} />
      </Step>

      <Step id="draft" heading={drafting.heading}>
        <div className="grid gap-3 rounded-panel border border-border bg-surface p-4 sm:p-6">
          <h3 className="text-subheading font-semibold">{drafting.draftHeading}</h3>
          {draft ? (
            <>
              <p className="text-lead">{draft.text}</p>
              <p className="text-small text-text-muted">{draft.explanation}</p>
              <div>
                <Button variant="secondary" onClick={startFromDraft}>
                  {drafting.useDraft}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-text-muted">{drafting.noType}</p>
          )}
        </div>
        <TextField
          id={QUESTION_FIELD_ID}
          label={drafting.questionLabel}
          hint={drafting.questionHint}
          multiline
          rows={4}
          value={question}
          onChange={(event) => {
            typed.current = true;
            setQuestion(event.target.value);
          }}
        />
      </Step>

      <Step id="feedback" heading={feedbackCopy.heading}>
        {evaluation ? <QuestionFeedback evaluation={evaluation} /> : <p className="text-text-muted">{feedbackCopy.empty}</p>}
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
