"use client";

import { useState } from "react";
import { getAnalysisMethod } from "@/knowledge/research/data-analysis-types";
import { DEMO_ASSUMPTIONS, DEMO_COMPARISONS, DEMO_OUTCOMES, demoSuggestion, type DemoComparison, type DemoOutcome } from "@/knowledge/journey/test-demo";
import { ButtonLink, Callout, Card, RadioGroup } from "@/ui";

const FINDER_PATH = "/tools/statistical-test-finder";

/** Two questions, one suggestion from the Statistical Test Finder's own logic. */
export function TestDemo() {
  const [comparison, setComparison] = useState<DemoComparison>();
  const [outcome, setOutcome] = useState<DemoOutcome>();
  const suggestion = comparison && outcome ? demoSuggestion(comparison, outcome) : undefined;

  return (
    <Card className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 [&_fieldset]:min-w-0">
      <RadioGroup name="demo-comparison" legend="What are you comparing?" options={DEMO_COMPARISONS} value={comparison} onChange={setComparison} variant="inline" />
      <RadioGroup name="demo-outcome" legend="What are you measuring?" options={DEMO_OUTCOMES} value={outcome} onChange={setOutcome} variant="inline" />
      <div aria-live="polite" className="grid gap-4">
        {!suggestion && <p className="text-small text-text-muted">Answer both questions to see a test to consider.</p>}
        {suggestion?.status === "suggestion" && (
          <Callout tone="success" title={`Consider: ${suggestion.methods.map((method) => getAnalysisMethod(method).name).join(" or ")}`} className="animate-rise-in">
            <p>{DEMO_ASSUMPTIONS}</p>
          </Callout>
        )}
        {suggestion?.status === "open-finder" && (
          <Callout tone="info" title="This needs the full finder" className="animate-rise-in">
            <p>Your answers lead to choices this short demo can’t settle. The Statistical Test Finder asks the follow-up questions.</p>
          </Callout>
        )}
      </div>
      <div>
        <ButtonLink href={FINDER_PATH} variant="outline" trailingIcon="arrow-right">
          Open the full finder
        </ButtonLink>
      </div>
    </Card>
  );
}
