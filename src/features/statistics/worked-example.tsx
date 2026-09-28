import { Badge, Card } from "@/ui";
import { getAnalysisMethod } from "@/knowledge/research/data-analysis-types";
import { MEASUREMENT_LEVEL_INFO } from "@/knowledge/research/variable-types";
import { STRUCTURE_DIAGRAMS, assumptionsFor, type WorkedExample } from "@/knowledge/research/test-finder";
import { statisticsCopy } from "./copy";
import { DataTable } from "./data-table";
import { StructureDiagramView } from "./figures";

const copy = statisticsCopy.example;

function Part({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="grid content-start gap-1.5">
      <p className="text-small font-semibold">{heading}</p>
      {children}
    </div>
  );
}

/**
 * A worked example from research question to candidate test: the variables and their
 * measurement, the groups and their structure, the test and why, the assumptions to
 * check, a small dataset with the arithmetic shown, and what a result would mean.
 */
export function WorkedExampleView({ example, level = 3 }: { example: WorkedExample; level?: 3 | 4 }) {
  const Heading = `h${level}` as const;
  return (
    <Card as="article" id={`example-${example.id}`} aria-labelledby={`example-${example.id}-title`} className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Heading id={`example-${example.id}-title`} className="grid gap-1">
          <span className="text-caption font-semibold tracking-wide text-text-muted uppercase">{copy.question}</span>
          <span className="text-heading-sm font-semibold">{example.question}</span>
        </Heading>
        <Badge tone="outline">{example.field}</Badge>
      </div>

      <Part heading={copy.variables}>
        <ul className="grid gap-1.5 text-small">
          {example.variables.map((variable) => (
            <li key={variable.name}>
              <span className="font-medium">{variable.name}</span>: {variable.role}, {copy.level(MEASUREMENT_LEVEL_INFO[variable.level].label.toLowerCase())}. <span className="text-text-muted">{variable.detail}</span>
            </li>
          ))}
        </ul>
      </Part>

      <div className="grid gap-4 sm:grid-cols-2">
        <Part heading={copy.groups}>
          <p className="text-small">{example.groups}</p>
        </Part>
        <Part heading={copy.structure}>
          <p className="text-small">{example.structure}</p>
        </Part>
      </div>

      <StructureDiagramView diagram={STRUCTURE_DIAGRAMS[example.diagram]} />

      <Part heading={copy.candidate}>
        <p>
          <span className="font-semibold">{getAnalysisMethod(example.method).name}.</span> {example.why}
        </p>
      </Part>

      <Part heading={copy.assumptions}>
        <ul className="grid list-disc gap-0.5 ps-5 text-small">
          {assumptionsFor(example.method).map((assumption) => (
            <li key={assumption.name}>{assumption.name}</li>
          ))}
        </ul>
      </Part>

      <DataTable id={`example-${example.id}-data`} caption={example.dataset.caption} columns={example.dataset.columns} numeric={example.dataset.numeric} rows={example.dataset.rows} />

      <Part heading={copy.working}>
        <ul className="grid gap-1 text-small">
          {example.summaries.map((summary) => (
            <li key={summary}>{summary}</li>
          ))}
        </ul>
      </Part>

      <Part heading={copy.interpretation}>
        <p className="text-small">{example.interpretation}</p>
      </Part>
    </Card>
  );
}
