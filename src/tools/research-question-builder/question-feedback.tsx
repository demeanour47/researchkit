import type { ReactNode } from "react";
import { Link, Tag } from "@/ui";
import { LearnMore, ReferenceList } from "@/features/research";
import {
  CONSISTENCY_LABELS,
  ELEMENT_STATUS_LABELS,
  FINER_JUDGEMENT_LABELS,
  describeProject,
  getQuestionType,
  type ElementStatus,
  type Feedback,
  type FinerJudgement,
  type QuestionEvaluation,
} from "@/knowledge/research";
import { feedback as copy } from "./copy";

const finerTones: Record<FinerJudgement, "info" | "neutral" | "caution"> = { addressed: "info", yours: "neutral", attention: "caution" };
const elementTones: Record<ElementStatus, "info" | "neutral" | "caution"> = {
  found: "info",
  notNeeded: "neutral",
  notInQuestion: "caution",
  missing: "caution",
};

function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="grid gap-3">
      <h3 className="text-subheading font-semibold">{heading}</h3>
      {children}
    </div>
  );
}

/** Points that each come with a reason. */
function Explained({ items, empty }: { items: readonly Feedback[]; empty?: string }) {
  if (items.length === 0) return empty ? <p className="text-text-muted">{empty}</p> : null;
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item.text} className="grid gap-1 border-s-2 border-border ps-4">
          <span className="font-medium">{item.text}</span>
          <span className="text-small text-text-muted">
            <span className="font-medium text-foreground">{copy.why}</span> {item.why}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** All feedback on the researcher's question. It displays the knowledge layer's evaluation and adds nothing. */
export function QuestionFeedback({ evaluation }: { evaluation: QuestionEvaluation }) {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{copy.intro}</p>

      <Block heading={copy.typeHeading}>
        {evaluation.detectedTypes.length > 0 ? (
          <ul className="grid gap-2">
            {evaluation.detectedTypes.map((detection) => (
              <li key={detection.type}>
                <span className="font-medium">{getQuestionType(detection.type).name}.</span> {detection.reason}
              </li>
            ))}
          </ul>
        ) : (
          <p>{copy.noTypeDetected}</p>
        )}
      </Block>

      <Block heading={copy.strengths}>
        <Explained items={evaluation.strengths} empty={copy.noStrengths} />
      </Block>

      <Block heading={copy.weaknesses}>
        <Explained items={evaluation.weaknesses} empty={copy.noWeaknesses} />
      </Block>

      <Block heading={copy.elements}>
        <ul className="grid gap-3">
          {evaluation.elements.map((finding) => (
            <li key={finding.element} className="grid gap-1 rounded-panel border border-border p-4">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{finding.label}</span>{" "}
                <Tag tone={elementTones[finding.status]}>{ELEMENT_STATUS_LABELS[finding.status]}</Tag>
              </p>
              {finding.value && <p>“{finding.value}”</p>}
              <p className="text-small text-text-muted">{finding.explanation}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block heading={copy.finer}>
        <ul className="grid gap-4">
          {evaluation.finer.map((assessment) => (
            <li key={assessment.criterion} className="grid gap-2 rounded-panel border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold">{assessment.name}</h4>{" "}
                <Tag tone={finerTones[assessment.judgement]}>{FINER_JUDGEMENT_LABELS[assessment.judgement]}</Tag>
              </div>
              <p className="text-small text-text-muted">{assessment.meaning}</p>
              <ul className="grid list-disc gap-1 ps-6">
                {assessment.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <LearnMore label={copy.toConsider}>
                <ul className="grid list-disc gap-1 ps-6">
                  {assessment.toConsider.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </LearnMore>
            </li>
          ))}
        </ul>
      </Block>

      <Block heading={copy.missing}>
        <Explained items={evaluation.missing} empty={copy.noMissing} />
      </Block>

      <Block heading={copy.improvements}>
        <Explained items={evaluation.improvements} empty={copy.noImprovements} />
      </Block>

      <Block heading={copy.consistency}>
        {evaluation.consistency.length > 0 ? (
          <ul className="grid gap-3">
            {evaluation.consistency.map((note) => (
              <li key={`${note.choice}-${note.text}`} className="grid gap-1 rounded-panel border border-border p-4">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{note.choice}</span>{" "}
                  <Tag tone={note.status === "consistent" ? "info" : "caution"}>{CONSISTENCY_LABELS[note.status]}</Tag>
                </p>
                <p>{note.text}</p>
                <p className="text-small text-text-muted">
                  <span className="font-medium text-foreground">{copy.why}</span> {note.why}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">{copy.noConsistency}</p>
        )}
      </Block>

      <Block heading={copy.notes}>
        <ul className="grid gap-4">
          {evaluation.academicNotes.map((note) => (
            <li key={note.text} className="grid gap-2">
              <p>{note.text}</p>
              <div className="text-small">
                <ReferenceList references={note.references} />
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block heading={copy.project}>
        <p className="text-small text-text-muted">{copy.projectHint}</p>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {describeProject(evaluation.project).map((row) => (
            <div key={row.field} className="contents">
              <dt className="font-medium">{row.label}</dt>
              <dd className="break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <p className="rounded-panel border border-dashed border-foreground/60 p-4">
        {copy.limits} <Link href="#limits-title">{copy.limitsLink}</Link>.
      </p>
    </div>
  );
}
