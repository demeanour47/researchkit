"use client";

import { CopyButton, Tag } from "@/ui";
import { LearnMore } from "@/features/research";
import { GAP_KIND_LABELS, FIELD_INFO, itemStudyLabels, studyLabel, synthesisText, type Matrix, type PatternReport, type PotentialGap, type StatedGap, type SynthesisSection } from "@/knowledge/literature";
import { announcements } from "./announcements";
import { steps } from "./copy";

const percent = (share: number) => `${Math.round(share * 100)}%`;

export interface InsightsProps {
  matrix: Matrix;
  patterns: PatternReport;
  stated: readonly StatedGap[];
  potential: readonly PotentialGap[];
  synthesis: readonly SynthesisSection[];
  onAnnounce: (message: string) => void;
}

/** Repeated patterns with their explanations, the gaps studies name, potential gaps, and the synthesis. */
export function InsightsPanel({ matrix, patterns, stated, potential, synthesis, onAnnounce }: InsightsProps) {
  const label = (id: string) => {
    const study = matrix.find((candidate) => candidate.id === id);
    return study ? studyLabel(study) : id;
  };
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.insightsIntro}</p>
      <div className="grid gap-6 md:grid-cols-2">
        {patterns.groups.map((group) => (
          <section key={group.id} aria-labelledby={`pattern-${group.id}`} className="grid content-start gap-3 rounded-panel border border-border bg-surface p-4">
            <h3 id={`pattern-${group.id}`} className="font-semibold">
              {group.title}
            </h3>
            <p className="text-small">{group.summary}</p>
            {group.repeated.length > 0 ? (
              <ul className="grid gap-3" aria-label={`${group.title}: ${steps.repeated}`}>
                {group.repeated.map((item) => (
                  <li key={item.key} className="grid gap-1 border-s-2 border-border ps-3">
                    <p>
                      <span className="font-medium">{item.label}</span> <span className="text-text-muted">{`${item.count} studies · ${percent(item.share)}`}</span>
                    </p>
                    <p className="text-small">{item.explanation}</p>
                    <p className="text-small text-text-muted">{`${steps.seenIn}: ${itemStudyLabels(item, matrix).join("; ")}`}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-small text-text-muted">{steps.nothingRepeated}</p>
            )}
          </section>
        ))}
      </div>

      <section aria-labelledby="stated-gaps" className="grid gap-3">
        <h3 id="stated-gaps" className="text-subheading font-semibold">
          {steps.statedGaps}
        </h3>
        <p className="text-text-muted">{steps.statedIntro}</p>
        {stated.length === 0 ? (
          <p>{steps.noStated}</p>
        ) : (
          <ul className="grid gap-4">
            {stated.map((gap, index) => (
              <li key={index} className="grid gap-2 border-s-2 border-border ps-4">
                <p className="font-medium">{`${gap.words.join(", ")} · ${gap.studies.length} studies`}</p>
                <p className="text-small">{gap.explanation}</p>
                <ul className="grid list-disc gap-1 ps-6 text-small">
                  {gap.statements.map((statement, position) => (
                    <li key={position}>{`${label(statement.studyId)}, ${FIELD_INFO[statement.field].label.toLowerCase()}: “${statement.text}”`}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="potential-gaps" className="grid gap-3">
        <h3 id="potential-gaps" className="text-subheading font-semibold">
          {steps.potentialGaps}
        </h3>
        <p className="text-text-muted">{steps.potentialIntro}</p>
        {potential.length === 0 ? (
          <p>{steps.noPotential}</p>
        ) : (
          <ul className="grid gap-4">
            {potential.map((gap) => (
              <li key={gap.title} className="grid gap-2 border-s-2 border-border ps-4">
                <p className="flex flex-wrap items-center gap-2">
                  <Tag tone="info">{GAP_KIND_LABELS[gap.kind]}</Tag> <span className="font-medium">{gap.title}</span>
                </p>
                <p className="text-small">
                  <span className="font-medium">{steps.evidence}:</span> {gap.evidence}
                </p>
                <p className="text-small">
                  <span className="font-medium">{steps.why}:</span> {gap.explanation}
                </p>
                {gap.studies.length > 0 && <p className="text-small text-text-muted">{`${steps.seenIn}: ${gap.studies.map(label).join("; ")}`}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="synthesis" className="grid gap-3">
        <h3 id="synthesis" className="text-subheading font-semibold">
          {steps.synthesis}
        </h3>
        <p className="text-text-muted">{steps.synthesisIntro}</p>
        <LearnMore label={steps.synthesis}>
          <div id="synthesis-text" className="grid gap-4">
            {synthesis.map((section) => (
              <div key={section.heading} className="grid gap-1">
                <h4 className="font-semibold">{section.heading}</h4>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
        </LearnMore>
        <div>
          <CopyButton text={synthesisText(synthesis)} subject="" selectOnFailure="synthesis-text" copyLabel={steps.copySynthesis} copiedLabel={steps.copiedSynthesis} onResult={(result) => onAnnounce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
        </div>
      </section>
    </div>
  );
}
