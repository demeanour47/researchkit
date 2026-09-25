"use client";

import { Button, RadioGroup, SelectField, Tag, TextField } from "@/ui";
import { LearnMore } from "@/features/research";
import {
  QUESTIONNAIRE_ITEM_TYPES,
  QUESTION_TYPE_INFO,
  changeSection,
  changeType,
  deleteQuestion,
  duplicateQuestion,
  linkQuestion,
  moveQuestion,
  questionNumbers,
  questionOrigin,
  questionWording,
  sectionQuestions,
  setQuestionScale,
  updateQuestion,
  type ProjectVariable,
  type Question,
  type Questionnaire,
  type QuestionnaireItemType,
  type ResearchProjectDraft,
} from "@/knowledge/research";
import { announcements } from "./announcements";
import { steps } from "./copy";
import { ScaleEditor } from "./scale-editor";

export type Update = (next: Questionnaire, message?: string, focus?: string) => void;

function List({ items }: { items: readonly string[] }) {
  return items.length > 0 ? (
    <ul className="grid list-disc gap-1 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-text-muted">{steps.none}</p>
  );
}

/** Everything that links a question to the project, so the researcher can see why it exists. */
function Origin({ question, questionnaire, project }: { question: Question; questionnaire: Questionnaire; project: ResearchProjectDraft }) {
  const origin = questionOrigin(question, project, questionnaire);
  return (
    <>
      {origin.explanation.map((sentence) => (
        <p key={sentence}>{sentence}</p>
      ))}
      <div className="grid gap-1">
        <h5 className="font-semibold">{steps.chain}</h5>
        <ol className="grid list-decimal gap-1 ps-6">
          {origin.chain.map((step) => (
            <li key={step.label}>
              <span className="font-medium">{step.label}:</span> <span className={step.missing ? "italic text-text-muted" : undefined}>{step.value}</span>
            </li>
          ))}
        </ol>
      </div>
      {(
        [
          [steps.researchQuestion, origin.researchQuestion ? [origin.researchQuestion] : []],
          [steps.objectivesHeading, origin.objectives],
          [steps.hypothesesHeading, origin.hypotheses.map((hypothesis) => `${hypothesis.label}: ${hypothesis.text}`)],
          [steps.frameworkHeading, origin.framework],
          [steps.populationHeading, origin.population ? [origin.population] : []],
        ] as const
      ).map(([heading, items]) => (
        <div key={heading} className="grid gap-1">
          <h5 className="font-semibold">{heading}</h5>
          <List items={items} />
        </div>
      ))}
    </>
  );
}

export interface QuestionItemProps {
  question: Question;
  questionnaire: Questionnaire;
  project: ResearchProjectDraft;
  variables: readonly ProjectVariable[];
  update: Update;
}

/** One question: its summary, an editor behind a disclosure, and the trace back to the project. */
export function QuestionItem({ question, questionnaire, project, variables, update }: QuestionItemProps) {
  const numbers = questionNumbers(questionnaire);
  const number = numbers.get(question.id)!;
  const info = QUESTION_TYPE_INFO[question.type];
  const section = questionnaire.sections.find((candidate) => candidate.id === question.section)!;
  const wording = questionWording(question, variables, section.kind);
  const variable = variables.find((candidate) => candidate.id === question.variableId);
  const siblings = sectionQuestions(questionnaire, question.section);
  const position = siblings.findIndex((candidate) => candidate.id === question.id);
  const id = `question-${question.id}`;

  const move = (to: number, button: "up" | "down") => {
    const next = moveQuestion(questionnaire, question.id, to);
    // At either end of the section the button becomes disabled, so focus moves to the question itself.
    const atEnd = (button === "up" && to === 0) || (button === "down" && to === siblings.length - 1);
    update(next, announcements.questionMoved(number, questionNumbers(next).get(question.id)!), atEnd ? `${id}-title` : `${id}-${button}`);
  };

  return (
    <li className="grid gap-3 rounded-panel border border-border p-4">
      <div className="grid gap-1">
        <h4 id={`${id}-title`} tabIndex={-1} className="font-semibold focus-ring">
          {steps.questionHeading(number)}
        </h4>
        <p className={wording.placeholder ? "italic text-text-muted" : undefined}>{wording.text}</p>
        <p className="flex flex-wrap gap-2">
          <Tag>{info.label}</Tag>
          <Tag>{question.required ? steps.required : steps.optional}</Tag>
          <Tag tone={variable ? "info" : "caution"}>{variable ? steps.linkedTo(variable.name) : steps.notLinked}</Tag>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button id={`${id}-up`} variant="subtle" size="sm" disabled={position === 0} onClick={() => move(position - 1, "up")} aria-label={steps.moveQuestionUp(number)}>
          {steps.moveUp}
        </Button>
        <Button id={`${id}-down`} variant="subtle" size="sm" disabled={position === siblings.length - 1} onClick={() => move(position + 1, "down")} aria-label={steps.moveQuestionDown(number)}>
          {steps.moveDown}
        </Button>
        <Button
          variant="subtle"
          size="sm"
          aria-label={steps.duplicateQuestion(number)}
          onClick={() => {
            const result = duplicateQuestion(questionnaire, question.id);
            update(result.questionnaire, announcements.questionDuplicated(number, questionNumbers(result.questionnaire).get(result.id)!), `question-${result.id}-title`);
          }}
        >
          {steps.duplicate}
        </Button>
        <Button
          variant="subtle"
          size="sm"
          aria-label={steps.deleteQuestion(number)}
          onClick={() => {
            const next = siblings[position + 1] ?? siblings[position - 1];
            update(deleteQuestion(questionnaire, question.id), announcements.questionDeleted(number), next ? `question-${next.id}-title` : `add-${question.section}`);
          }}
        >
          {steps.delete}
        </Button>
      </div>
      <LearnMore label={steps.edit(number)}>
        <TextField id={`${id}-text`} label={steps.wording} hint={steps.wordingHint} multiline rows={2} value={question.text} onChange={(event) => update(updateQuestion(questionnaire, question.id, { text: event.target.value }))} />
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <SelectField
            id={`${id}-type`}
            label={steps.type}
            options={QUESTIONNAIRE_ITEM_TYPES.map((type) => ({ value: type, label: QUESTION_TYPE_INFO[type].label }))}
            value={question.type}
            onChange={(event) => {
              const type = event.target.value as QuestionnaireItemType;
              update(changeType(questionnaire, question.id, type), announcements.typeChanged(number, QUESTION_TYPE_INFO[type].label));
            }}
          />
          <SelectField
            id={`${id}-section`}
            label={steps.section}
            options={questionnaire.sections.map((candidate) => ({ value: candidate.id, label: candidate.title }))}
            value={question.section}
            onChange={(event) => {
              const next = changeSection(questionnaire, question.id, event.target.value);
              const title = questionnaire.sections.find((candidate) => candidate.id === event.target.value)!.title;
              update(next, announcements.questionSection(questionNumbers(next).get(question.id)!, title), `${id}-section`);
            }}
          />
          <SelectField
            id={`${id}-variable`}
            label={steps.variable}
            emptyOption={steps.noVariable}
            options={variables.map((candidate) => ({ value: candidate.id, label: candidate.name }))}
            value={variable ? variable.id : ""}
            onChange={(event) => update(linkQuestion(questionnaire, question.id, event.target.value || null, null))}
          />
          {variable && variable.possibleIndicators.length > 0 && (
            <SelectField
              id={`${id}-indicator`}
              label={steps.indicator}
              emptyOption={steps.noIndicator}
              options={variable.possibleIndicators.map((indicator) => ({ value: indicator.id, label: indicator.name }))}
              value={variable.possibleIndicators.some((indicator) => indicator.id === question.indicatorId) ? question.indicatorId! : ""}
              onChange={(event) => update(linkQuestion(questionnaire, question.id, variable.id, event.target.value || null))}
            />
          )}
        </div>
        <RadioGroup
          name={`${id}-required`}
          legend={steps.requiredLegend}
          variant="inline"
          options={[
            { value: "required", label: steps.required },
            { value: "optional", label: steps.optional },
          ]}
          value={question.required ? "required" : "optional"}
          onChange={(value) => update(updateQuestion(questionnaire, question.id, { required: value === "required" }))}
        />
        {info.usesOptions && (
          <TextField id={`${id}-options`} label={steps.options} hint={steps.optionsHint} multiline rows={4} value={question.options.join("\n")} onChange={(event) => update(updateQuestion(questionnaire, question.id, { options: event.target.value.split("\n") }))} />
        )}
        {info.usesRows && (
          <TextField id={`${id}-rows`} label={steps.rows} hint={steps.rowsHint} multiline rows={4} value={question.rows.join("\n")} onChange={(event) => update(updateQuestion(questionnaire, question.id, { rows: event.target.value.split("\n") }))} />
        )}
        {question.scale && <ScaleEditor id={`${id}-scale`} scale={question.scale} onChange={(scale) => update(setQuestionScale(questionnaire, question.id, scale))} />}
        <TextField id={`${id}-help`} label={steps.help} multiline rows={2} value={question.helpText} onChange={(event) => update(updateQuestion(questionnaire, question.id, { helpText: event.target.value }))} />
        <TextField id={`${id}-notes`} label={steps.notes} hint={steps.notesHint} multiline rows={2} value={question.notes} onChange={(event) => update(updateQuestion(questionnaire, question.id, { notes: event.target.value }))} />
      </LearnMore>
      <LearnMore label={steps.why(number)}>
        <Origin question={question} questionnaire={questionnaire} project={project} />
      </LearnMore>
    </li>
  );
}
