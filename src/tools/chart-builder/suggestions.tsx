"use client";

import { useMemo, useState } from "react";
import { Button, SelectField, Tag } from "@/ui";
import { LearnMore, ProjectFields } from "@/features/research";
import { CHART_PURPOSES, CHART_PURPOSE_INFO, CHART_TYPE_INFO, chartsForPurpose, recommendationsForProject, type ChartPurpose, type ChartSuggestion, type ProjectChartGroup } from "@/knowledge/charts";
import { EMPTY_TYPED_PROJECT, STRENGTH_LABELS, projectFromTyped, type MeasurementLevel, type RecommendationStrength, type TypedProject } from "@/knowledge/research";
import { steps } from "./copy";
import { exampleLevels, exampleProject } from "./example";

const tones: Record<RecommendationStrength, "info" | "neutral" | "caution"> = { strong: "info", possible: "neutral", justify: "caution" };

function Suggestion({ suggestion, onUse }: { suggestion: ChartSuggestion; onUse: (suggestion: ChartSuggestion) => void }) {
  const label = CHART_TYPE_INFO[suggestion.type].label;
  const titles = steps.suggestedTitles(suggestion.title, suggestion.xTitle, suggestion.yTitle);
  return (
    <li className="grid gap-2 border-s-2 border-border ps-4">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{label}</span> <Tag tone={tones[suggestion.strength]}>{STRENGTH_LABELS[suggestion.strength]}</Tag>
      </p>
      <p className="text-small">{suggestion.reason}</p>
      {titles && (
        <p className="text-small text-text-muted">
          {steps.titlesNote} {titles}.
        </p>
      )}
      <div>
        <Button variant="secondary" size="sm" onClick={() => onUse(suggestion)}>
          {steps.useChart(label)}
        </Button>
      </div>
    </li>
  );
}

function Group({ group, onUse }: { group: ProjectChartGroup; onUse: (suggestion: ChartSuggestion) => void }) {
  return (
    <li className="grid gap-3">
      <p className="font-medium">{group.heading}</p>
      <p className="text-small text-text-muted">
        {steps.basedOn}: {group.basedOn.join("; ")}
      </p>
      {group.suggestions.length > 0 ? (
        <ul className="grid gap-4">
          {group.suggestions.map((suggestion) => (
            <Suggestion key={suggestion.type} suggestion={suggestion} onUse={onUse} />
          ))}
        </ul>
      ) : (
        <p className="text-small">{group.empty}</p>
      )}
    </li>
  );
}

/** Chart suggestions from a purpose, or from the project's variables, objectives and planned analyses. */
export function Suggestions({ onUse, onAnnounce }: { onUse: (suggestion: ChartSuggestion) => void; onAnnounce: (message: string) => void }) {
  const [purpose, setPurpose] = useState<ChartPurpose | "">("");
  const [project, setProject] = useState<TypedProject>(EMPTY_TYPED_PROJECT);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const plan = useMemo(() => recommendationsForProject(projectFromTyped(project, levels)), [project, levels]);
  const sections: [string, ProjectChartGroup[]][] = [
    [steps.projectVariables, plan.variables],
    [steps.projectPairs, plan.pairs],
    [steps.projectAnalyses, plan.analyses],
    [steps.projectObjectives, plan.objectives],
  ];
  const any = sections.some(([, groups]) => groups.length > 0);

  return (
    <div className="grid gap-6">
      <h3 className="text-subheading font-semibold">{steps.suggestHeading}</h3>
      <SelectField
        label={steps.purposeLabel}
        emptyOption={steps.purposeEmpty}
        options={CHART_PURPOSES.map((value) => ({ value, label: `${CHART_PURPOSE_INFO[value].label}: ${CHART_PURPOSE_INFO[value].question}` }))}
        value={purpose}
        onChange={(event) => setPurpose(event.target.value as ChartPurpose | "")}
      />
      {purpose && (
        <ul className="grid gap-4" aria-label={CHART_PURPOSE_INFO[purpose].label}>
          {chartsForPurpose(purpose).map((suggestion) => (
            <Suggestion key={suggestion.type} suggestion={suggestion} onUse={onUse} />
          ))}
        </ul>
      )}

      <LearnMore label={steps.projectToggle}>
        <p className="text-text-muted">{steps.projectIntro}</p>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setProject({ ...exampleProject });
              setLevels({ ...exampleLevels });
              onAnnounce(steps.exampleProjectLoaded);
            }}
          >
            {steps.exampleProject}
          </Button>
        </div>
        <ProjectFields
          prefix="cb"
          value={project}
          levels={levels}
          onType={(field, text) => setProject((current) => ({ ...current, [field]: text }))}
          onChoose={(next, nextLevels) => {
            setProject(next);
            setLevels(nextLevels);
          }}
        />
        <div className="grid gap-6" aria-live="off">
          {!any && <p>{steps.projectNothing}</p>}
          {sections.map(([heading, groups]) =>
            groups.length === 0 ? null : (
              <section key={heading} aria-label={heading} className="grid gap-4">
                <h4 className="font-semibold">{heading}</h4>
                <ul className="grid gap-6">
                  {groups.map((group) => (
                    <Group key={group.heading} group={group} onUse={onUse} />
                  ))}
                </ul>
              </section>
            ),
          )}
          {plan.notes.length > 0 && (
            <ul className="grid list-disc gap-1 ps-6 text-small text-text-muted">
              {plan.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      </LearnMore>
    </div>
  );
}
