"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, Tag, TextField, VisuallyHidden } from "@/ui";
import { LearnMore } from "@/features/research";
import {
  DIRECTIONS,
  DIRECTION_LABELS,
  HYPOTHESIS_FORMS,
  addRelationship,
  addVariable,
  applyFramework,
  applyHypotheses,
  autoLayout,
  changeVariableType,
  createProjectDraft,
  deleteRelationship,
  deleteVariable,
  describeFramework,
  describeProject,
  describeRelationship,
  frameworkFromProject,
  generateHypotheses,
  layoutFramework,
  moveVariable,
  nudgeVariable,
  parseList,
  renameVariable,
  resetLayout,
  setRelationshipLabel,
  setRelationshipType,
  toPdf,
  toProjectHypotheses,
  toSvg,
  traceRelationship,
  validateFramework,
  type ConceptualFramework,
  type Direction,
  type HypothesisForm,
  type NewRelationship,
  type Point,
} from "@/knowledge/research";
import { announcements, warningsAnnouncement } from "./announcements";
import { steps } from "./copy";
import { DiagramEditor } from "./diagram-editor";
import { exampleProject } from "./example";
import { copyFigure, download, svgToPng } from "./export-files";
import { RelationshipPanel } from "./relationship-panel";
import { VariablePanel } from "./variable-panel";

const HISTORY_LIMIT = 50;

type Inputs = Record<
  | "researchQuestion"
  | "researchObjectives"
  | "independentVariables"
  | "dependentVariables"
  | "mediatorVariables"
  | "moderatorVariables"
  | "controlVariables"
  | "population"
  | "location"
  | "timeContext",
  string
>;
const emptyInputs: Inputs = {
  researchQuestion: "",
  researchObjectives: "",
  independentVariables: "",
  dependentVariables: "",
  mediatorVariables: "",
  moderatorVariables: "",
  controlVariables: "",
  population: "",
  location: "",
  timeContext: "",
};

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

/**
 * The builder: project details, hypotheses, the editable figure, warnings, export and
 * the updated project draft. Every rule, layout and export comes from the knowledge
 * layer; this component holds what the researcher typed and their edits.
 */
export function FrameworkBuilderForm() {
  const [inputs, setInputs] = useState<Inputs>(emptyInputs);
  const [form, setForm] = useState<HypothesisForm>("prediction");
  const [direction, setDirection] = useState<Direction>("non-directional");
  const [edited, setEdited] = useState<ConceptualFramework | null>(null);
  const [history, setHistory] = useState<ConceptualFramework[]>([]);
  const [confirmRebuild, setConfirmRebuild] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [monochrome, setMonochrome] = useState(false);
  const [showTypes, setShowTypes] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const dragging = useRef(false);

  const project = useMemo(() => {
    const base = createProjectDraft({
      researchQuestion: inputs.researchQuestion,
      researchObjectives: parseList(inputs.researchObjectives),
      independentVariables: parseList(inputs.independentVariables),
      dependentVariables: parseList(inputs.dependentVariables),
      mediatorVariables: parseList(inputs.mediatorVariables),
      moderatorVariables: parseList(inputs.moderatorVariables),
      controlVariables: parseList(inputs.controlVariables),
      population: inputs.population,
      location: inputs.location,
      timeContext: inputs.timeContext,
    });
    const canDraft = (base.independentVariables?.length ?? 0) > 0 && (base.dependentVariables?.length ?? 0) > 0;
    return canDraft ? applyHypotheses(base, toProjectHypotheses(generateHypotheses(base, { form, direction }), {})) : base;
  }, [inputs, form, direction]);

  const framework = useMemo(() => edited ?? frameworkFromProject(project), [edited, project]);
  const layout = useMemo(() => layoutFramework(framework, { showTypes }), [framework, showTypes]);
  const description = useMemo(() => describeFramework(framework), [framework]);
  const svg = useMemo(() => toSvg(layout, { monochrome, title: steps.figureTitle, description }), [layout, monochrome, description]);
  const warnings = useMemo(() => validateFramework(framework, project, layout), [framework, project, layout]);
  const updated = useMemo(() => applyFramework(project, framework), [project, framework]);
  const trace = selected && framework.relationships.some((relationship) => relationship.id === selected) ? traceRelationship(framework, selected, project) : null;

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const commit = (next: ConceptualFramework, message?: string) => {
    setHistory((past) => [...past, framework].slice(-HISTORY_LIMIT));
    setEdited(next);
    if (message) announce(`${message} ${warningsAnnouncement(validateFramework(next, project, layoutFramework(next, { showTypes })).length)}`);
  };
  const nameOf = (id: string) => framework.variables.find((variable) => variable.id === id)?.name ?? "";

  const move = (id: string, to: Point, done: boolean) => {
    if (!dragging.current) {
      setHistory((past) => [...past, framework].slice(-HISTORY_LIMIT));
      dragging.current = true;
    }
    const next = moveVariable(framework, id, to);
    setEdited(next);
    if (done) {
      dragging.current = false;
      const position = next.positions[id];
      announce(announcements.moved(nameOf(id), position.x, position.y));
    }
  };
  const nudge = (id: string, from: Point, dx: number, dy: number, large: boolean) => {
    const next = nudgeVariable(framework, id, from, dx, dy, large);
    commit(next);
    const position = next.positions[id];
    announce(announcements.moved(nameOf(id), position.x, position.y));
  };
  const select = (id: string) => {
    setSelected(id);
    const relationship = framework.relationships.find((candidate) => candidate.id === id);
    if (relationship) announce(announcements.selected(describeRelationship(framework, relationship)));
  };
  const addNewRelationship = (relationship: NewRelationship): string | null => {
    try {
      const next = addRelationship(framework, relationship);
      commit(next, announcements.added("relationship", describeRelationship(next, next.relationships[next.relationships.length - 1])));
      return null;
    } catch (error) {
      return error instanceof RangeError ? (error.message.startsWith("Unknown variable") ? "Choose a variable to connect from and one to connect to." : error.message) : String(error);
    }
  };
  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory(history.slice(0, -1));
    setEdited(previous);
    announce(announcements.undone);
  };
  const rebuild = () => {
    setEdited(null);
    setHistory([]);
    setConfirmRebuild(false);
    announce(announcements.rebuilt);
  };

  const exportAs = async (format: "SVG" | "PNG" | "PDF") => {
    try {
      if (format === "SVG") download(new Blob([svg], { type: "image/svg+xml" }), "conceptual-framework.svg");
      if (format === "PDF") download(new Blob([toPdf(layout, { monochrome, title: steps.figureTitle })], { type: "application/pdf" }), "conceptual-framework.pdf");
      if (format === "PNG") download(await svgToPng(svg, layout), "conceptual-framework.png");
      announce(announcements.exported(format));
    } catch {
      announce(announcements.exportFailed(format));
    }
  };

  const input = (field: keyof Inputs, label: string, hint?: string, single = false) =>
    single ? (
      <TextField
        id={`framework-${field}`}
        label={label}
        hint={hint}
        autoComplete="off"
        value={inputs[field]}
        onChange={(event) => setInputs((current) => ({ ...current, [field]: event.target.value }))}
      />
    ) : (
      <TextField
        id={`framework-${field}`}
        label={label}
        hint={hint}
        multiline
        rows={field === "researchQuestion" ? 2 : 3}
        value={inputs[field]}
        onChange={(event) => setInputs((current) => ({ ...current, [field]: event.target.value }))}
      />
    );

  return (
    <div className="grid gap-10">
      <Step id="project" heading={steps.project}>
        <p className="text-text-muted">{steps.projectIntro}</p>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setInputs({ ...exampleProject });
              announce(steps.exampleLoaded);
            }}
          >
            {steps.example}
          </Button>
        </div>
        {input("researchQuestion", steps.question)}
        {input("researchObjectives", steps.objectives, steps.objectivesHint)}
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {input("independentVariables", steps.independent, steps.perLine)}
          {input("dependentVariables", steps.dependent, steps.perLine)}
          {input("mediatorVariables", steps.mediator, steps.perLine)}
          {input("moderatorVariables", steps.moderator, steps.perLine)}
          {input("controlVariables", steps.control, steps.perLine)}
        </div>
        <div className="grid items-start gap-6 sm:grid-cols-3">
          {input("population", steps.population, steps.populationHint, true)}
          {input("location", steps.location, undefined, true)}
          {input("timeContext", steps.timeContext, undefined, true)}
        </div>
      </Step>

      <Step id="hypotheses" heading={steps.hypotheses}>
        <p className="text-text-muted">{steps.hypothesesIntro}</p>
        <RadioGroup name="framework-form" legend={steps.formLegend} options={HYPOTHESIS_FORMS.map((value) => ({ value, label: steps.forms[value] }))} value={form} onChange={setForm} />
        <RadioGroup name="framework-direction" legend={steps.directionLegend} options={DIRECTIONS.map((value) => ({ value, label: DIRECTION_LABELS[value] }))} value={direction} onChange={setDirection} variant="inline" />
        <p>{project.hypotheses ? steps.hypothesesCount(project.hypotheses.length) : steps.noHypotheses}</p>
      </Step>

      <Step id="figure" heading={steps.figure}>
        <p className="text-text-muted">{steps.figureHint}</p>
        {edited && (
          <div className="grid gap-3 rounded-panel border border-dashed border-foreground/60 p-4">
            <p>{steps.edited}</p>
            {confirmRebuild ? (
              <>
                <p className="font-medium">{steps.rebuildConfirm}</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" onClick={rebuild}>
                    {steps.rebuildYes}
                  </Button>
                  <Button variant="subtle" size="sm" onClick={() => setConfirmRebuild(false)}>
                    {steps.rebuildNo}
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <Button variant="subtle" size="sm" onClick={() => setConfirmRebuild(true)}>
                  {steps.rebuild}
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={() => (commit(autoLayout(framework)), announce(announcements.autoLayout))}>
            {steps.autoLayout}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => (commit(resetLayout(framework)), announce(announcements.resetLayout))}>
            {steps.resetLayout}
          </Button>
          <Button variant="subtle" size="sm" onClick={undo} disabled={history.length === 0}>
            {steps.undo}
          </Button>
        </div>
        <DiagramEditor framework={framework} layout={layout} svg={svg} selected={selected} onMove={move} onNudge={nudge} onSelect={select} />
        <LearnMore label={steps.textDescription}>
          <p>{description}</p>
        </LearnMore>

        <div className="grid gap-4 sm:grid-cols-2">
          <RadioGroup name="framework-colour" legend={steps.colourLegend} variant="inline" options={[{ value: "colour", label: steps.colour }, { value: "mono", label: steps.monochrome }]} value={monochrome ? "mono" : "colour"} onChange={(value) => setMonochrome(value === "mono")} />
          <RadioGroup name="framework-types" legend={steps.typesLegend} variant="inline" options={[{ value: "show", label: steps.showTypes }, { value: "hide", label: steps.hideTypes }]} value={showTypes ? "show" : "hide"} onChange={(value) => setShowTypes(value === "show")} />
        </div>

        <section aria-labelledby="details-title" className="grid gap-3 rounded-panel border border-border bg-surface p-4 sm:p-6">
          <h3 id="details-title" className="text-subheading font-semibold">
            {steps.details}
          </h3>
          {trace ? (
            <>
              <p className="font-medium">{describeRelationship(framework, trace.relationship)}</p>
              {trace.moderated && (
                <p>
                  {steps.moderates}: {describeRelationship(framework, trace.moderated)}
                </p>
              )}
              <h4 className="font-semibold">{steps.createdBy}</h4>
              {trace.hypotheses.length > 0 ? (
                <ul className="grid list-disc gap-1 ps-6">
                  {trace.hypotheses.map((hypothesis) => (
                    <li key={hypothesis.id}>
                      {hypothesis.role === "null" ? "H₀" : "H₁"}: {hypothesis.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted">{steps.addedByYou}</p>
              )}
              <h4 className="font-semibold">{steps.supportedBy}</h4>
              {trace.objectives.length > 0 ? (
                <ul className="grid list-disc gap-1 ps-6">
                  {trace.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted">{steps.noObjective}</p>
              )}
            </>
          ) : (
            <p className="text-text-muted">{steps.noSelection}</p>
          )}
        </section>
      </Step>

      <Step id="variables" heading={steps.variables}>
        <VariablePanel
          variables={framework.variables}
          onRename={(id, name) => commit(renameVariable(framework, id, name))}
          onRetype={(id, type) => commit(changeVariableType(framework, id, type), `${nameOf(id)} changed.`)}
          onDelete={(id) => commit(deleteVariable(framework, id), announcements.deleted(nameOf(id)))}
          onAdd={(name, type) => {
            const next = addVariable(framework, { name, type });
            commit(next, announcements.added("variable", next.variables[next.variables.length - 1].name));
          }}
        />
      </Step>

      <Step id="relationships" heading={steps.relationships}>
        <RelationshipPanel
          framework={framework}
          onRetype={(id, type) => commit(setRelationshipType(framework, id, type))}
          onRelabel={(id, label) => commit(setRelationshipLabel(framework, id, label))}
          onDelete={(id) => {
            const relationship = framework.relationships.find((candidate) => candidate.id === id)!;
            commit(deleteRelationship(framework, id), announcements.deleted(describeRelationship(framework, relationship).replace(/\.$/, "")));
          }}
          onSelect={select}
          onAdd={addNewRelationship}
        />
      </Step>

      <Step id="warnings" heading={steps.warnings}>
        {warnings.length === 0 ? (
          <p className="text-text-muted">{steps.noWarnings}</p>
        ) : (
          <ul className="grid gap-3">
            {warnings.map((warning, index) => (
              <li key={`${warning.code}-${index}`} className="grid gap-1 border-s-2 border-border ps-4">
                <p className="flex flex-wrap items-center gap-2">
                  <Tag tone="caution">{steps.warningTag}</Tag> <span className="font-medium">{warning.message}</span>
                </p>
                <p className="text-small text-text-muted">
                  <span className="font-medium text-foreground">{steps.why}</span> {warning.why}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Step>

      <Step id="export" heading={steps.export}>
        <p className="text-text-muted">{steps.exportIntro}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={async () => announce((await copyFigure(svg, layout)) ? announcements.copied : announcements.copyFailed)}
          >
            {steps.copyFigure}
          </Button>
          <CopyButton text={svg} subject={steps.copySvgSubject} onResult={(result) => announce(result === "copied" ? "SVG code copied." : announcements.copyFailed)} />
          <Button variant="secondary" onClick={() => exportAs("SVG")}>
            {steps.downloadSvg}
          </Button>
          <Button variant="secondary" onClick={() => exportAs("PNG")}>
            {steps.downloadPng}
          </Button>
          <Button variant="secondary" onClick={() => exportAs("PDF")}>
            {steps.downloadPdf}
          </Button>
        </div>
      </Step>

      <Step id="draft" heading={steps.projectDraft}>
        <p className="text-text-muted">{steps.projectDraftIntro}</p>
        <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
          {describeProject(updated).map((row) => (
            <div key={row.field} className="contents">
              <dt className="font-medium">{row.label}</dt>
              <dd className="break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
