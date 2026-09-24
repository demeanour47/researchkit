"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, RadioGroup, VisuallyHidden } from "@/ui";
import {
  EVIDENCE_LABELS,
  FIT_LABELS,
  LAYERS,
  findOption,
  judgementsFor,
  optionsFor,
  summarise,
  type OnionSelection,
} from "@/knowledge/research";
import { announcements, explorer } from "./copy";
import { OnionDiagram } from "./onion-diagram";
import { OnionProgress } from "./onion-progress";
import { OnionSummaryView } from "./onion-summary";
import { OptionDetails } from "./option-details";

/** The step index that shows the summary, after the last layer. */
const SUMMARY_STEP = LAYERS.length;

/**
 * The explorer: one layer at a time, then a summary. It only presents the knowledge
 * layer's explanations and judgements; it never chooses anything for the researcher.
 */
export function OnionExplorer() {
  const [selection, setSelection] = useState<OnionSelection>({});
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  /** Whether the step changed through the controls, so focus should move to its heading. */
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus();
    moved.current = false;
  }, [step]);

  const goTo = (index: number) => {
    moved.current = true;
    setStep(index);
    setReached((furthest) => Math.max(furthest, index));
  };

  const summary = useMemo(() => (step === SUMMARY_STEP ? summarise(selection) : null), [step, selection]);

  const choose = (layerIndex: number, id: string) => {
    const layer = LAYERS[layerIndex];
    const next = { ...selection, [layer.id]: id };
    setSelection(next);
    const fits = judgementsFor(next, layer.id)
      .map((judgement) =>
        announcements.fitWith(
          FIT_LABELS[judgement.fit],
          findOption(judgement.earlier)?.name ?? "",
          EVIDENCE_LABELS[judgement.evidence.level],
        ),
      )
      .join(" ");
    setAnnouncement(announcements.chosen(findOption(id)?.name ?? "", fits));
  };

  const startAgain = () => {
    setSelection({});
    setReached(0);
    goTo(0);
    setAnnouncement(announcements.cleared);
  };

  const layer = step < SUMMARY_STEP ? LAYERS[step] : null;
  const chosen = layer ? findOption(selection[layer.id] ?? "") : undefined;

  return (
    <div className="grid gap-8">
      <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
        <OnionDiagram selection={selection} current={step} />
        <OnionProgress selection={selection} current={step} reached={reached} onJump={goTo} />
      </div>

      {layer && (
        <section aria-labelledby="onion-step-title" className="grid gap-6">
          <div className="grid gap-2">
            <h2 id="onion-step-title" ref={heading} tabIndex={-1} className="text-heading font-semibold focus-ring">
              <span className="block text-small font-normal text-text-muted">
                {explorer.layerNumber(layer.number, LAYERS.length)}
              </span>{" "}
              {layer.name}
            </h2>
            <p className="text-text-muted">{layer.description}</p>
          </div>

          <RadioGroup
            name={`onion-${layer.id}`}
            legend={layer.question}
            options={optionsFor(layer.id).map((option) => ({ value: option.id, label: option.name }))}
            value={selection[layer.id]}
            onChange={(id) => choose(step, id)}
          />

          {chosen ? (
            <OptionDetails option={chosen} judgements={judgementsFor(selection, layer.id)} />
          ) : (
            <p className="text-text-muted">{explorer.chooseFirst}</p>
          )}

          <div className="flex flex-wrap gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={() => goTo(step - 1)}>
                {explorer.back}
              </Button>
            )}
            <Button onClick={() => goTo(step + 1)}>
              {step + 1 < SUMMARY_STEP ? explorer.next(LAYERS[step + 1].name) : explorer.seeSummary}
            </Button>
          </div>
        </section>
      )}

      {summary && (
        <OnionSummaryView
          summary={summary}
          headingRef={heading}
          onEdit={() => goTo(SUMMARY_STEP - 1)}
          onStartAgain={startAgain}
          onExported={(label) => setAnnouncement(announcements.downloaded(label))}
        />
      )}

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
