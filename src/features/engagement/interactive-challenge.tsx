"use client";

import { useState } from "react";
import { CHALLENGES, getChallenge, isCorrect, nextChallenge } from "@/knowledge/challenges/challenges";
import { getAnalysisMethod, type AnalysisMethodId } from "@/knowledge/research/data-analysis-types";
import { Button, ButtonLink, Callout, Card, RadioGroup } from "@/ui";
import { record } from "./progress-store";

/**
 * A short question about choosing a test. Nothing is scored or stored beyond the
 * session; the explanation is the point, so a wrong answer can be retried and
 * every option's reasoning is shown after an answer.
 */
export function InteractiveChallenge() {
  const [id, setId] = useState(CHALLENGES[0].id);
  const [choice, setChoice] = useState<AnalysisMethodId>();
  const [answered, setAnswered] = useState<AnalysisMethodId>();
  const challenge = getChallenge(id) ?? CHALLENGES[0];
  const picked = answered ? challenge.options.find((option) => option.method === answered) : undefined;
  const correct = answered !== undefined && isCorrect(challenge, answered);

  const check = () => {
    if (!choice) return;
    setAnswered(choice);
    record("challenges", challenge.id);
  };
  const retry = () => {
    setChoice(undefined);
    setAnswered(undefined);
  };
  const another = () => {
    setId(nextChallenge(challenge.id)?.id ?? challenge.id);
    retry();
  };

  return (
    <Card className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 [&_fieldset]:min-w-0">
      <RadioGroup
        key={challenge.id + (answered ? "-answered" : "")}
        name={`challenge-${challenge.id}`}
        legend={challenge.prompt}
        options={challenge.options.map((option) => ({ value: option.method, label: getAnalysisMethod(option.method).name }))}
        value={choice}
        onChange={(value) => {
          if (!answered) setChoice(value);
        }}
      />
      <div aria-live="polite" className="grid gap-4">
        {picked && (
          <Callout tone={correct ? "success" : "caution"} title={correct ? "That’s a good choice" : "Not quite — have another look"} className="animate-rise-in">
            <p>
              <span className="font-semibold">{getAnalysisMethod(picked.method).name}. </span>
              {picked.explanation}
            </p>
            {correct && (
              <p className="mt-2">
                Other options: {challenge.options.filter((option) => option.method !== challenge.correct).map((option) => `${getAnalysisMethod(option.method).name} — ${option.explanation}`).join(" ")}
              </p>
            )}
          </Callout>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {!answered && (
          <Button onClick={check} disabled={!choice}>
            Check my answer
          </Button>
        )}
        {answered && !correct && <Button onClick={retry}>Try again</Button>}
        {answered && (
          <Button variant="outline" onClick={another}>
            Try another question
          </Button>
        )}
        {correct && (
          <ButtonLink href={`/tools/${challenge.toolId}`} variant="ghost" trailingIcon="arrow-right">
            Open the full finder
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
