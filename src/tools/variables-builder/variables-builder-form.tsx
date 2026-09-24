"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, CopyButton, RadioGroup, SelectField, Tag, TextField, VisuallyHidden } from "@/ui";
import {
  CHECK_STATUS_LABELS,
  METHODOLOGIES,
  VARIABLE_KINDS,
  VARIABLE_KIND_INFO,
  MEASUREMENT_LEVEL_INFO,
  addIndicator,
  addProjectVariable,
  applyFramework,
  applyHypotheses,
  applyVariables,
  changeVariableKind,
  createProjectDraft,
  deleteIndicator,
  deleteProjectVariable,
  describeProject,
  duplicateVariable,
  findOption,
  frameworkFromProject,
  generateHypotheses,
  importVariables,
  mergeImported,
  moveIndicator,
  originSummary,
  parseList,
  renameProjectVariable,
  toProjectHypotheses,
  updateIndicator,
  updateVariable,
  validateSet,
  variablesTable,
  type CheckStatus,
  type MethodologyId,
  type ProjectVariable,
  type VariableKind,
} from "@/knowledge/research";
import { announcements } from "./announcements";
import { steps } from "./copy";
import { exampleProject } from "./example";
import { VariableEditor } from "./variable-editor";

const HISTORY_LIMIT = 50;
const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = { aligned: "info", review: "neutral", "worth-checking": "caution", missing: "caution", clarify: "caution" };

type Inputs = Record<
  | "researchQuestion"
  | "researchAim"
  | "researchObjectives"
  | "independentVariables"
  | "dependentVariables"
  | "mediatorVariables"
  | "moderatorVariables"
  | "controlVariables"
  | "population"
  | "methodology",
  string
>;
const emptyInputs: Inputs = {
  researchQuestion: "",
  researchAim: "",
  researchObjectives: "",
  independentVariables: "",
  dependentVariables: "",
  mediatorVariables: "",
  moderatorVariables: "",
  controlVariables: "",
  population: "",
  methodology: "",
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
 * The builder: the project it reads, every variable with where it came from, an editor
 * for one variable at a time, checks, and the updated project draft. All rules come
 * from the knowledge layer; this component holds what the researcher typed and edited.
 */
export function VariablesBuilderForm({ guide }: { guide: ReactNode }) {
  const [inputs, setInputs] = useState<Inputs>(emptyInputs);
  const [withHypotheses, setWithHypotheses] = useState(true);
  const [edited, setEdited] = useState<ProjectVariable[] | null>(null);
  const [history, setHistory] = useState<ProjectVariable[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<VariableKind>("independent");
  const [announcement, setAnnouncement] = useState("");

  const project = useMemo(() => {
    let draft = createProjectDraft({
      researchQuestion: inputs.researchQuestion,
      researchAim: inputs.researchAim,
      researchObjectives: parseList(inputs.researchObjectives),
      independentVariables: parseList(inputs.independentVariables),
      dependentVariables: parseList(inputs.dependentVariables),
      mediatorVariables: parseList(inputs.mediatorVariables),
      moderatorVariables: parseList(inputs.moderatorVariables),
      controlVariables: parseList(inputs.controlVariables),
      population: inputs.population,
      methodology: (inputs.methodology || undefined) as MethodologyId | undefined,
    });
    const canDraft = withHypotheses && (draft.independentVariables?.length ?? 0) > 0 && (draft.dependentVariables?.length ?? 0) > 0;
    if (canDraft) {
      draft = applyHypotheses(draft, toProjectHypotheses(generateHypotheses(draft, { form: "prediction", direction: "non-directional" }), {}));
      draft = applyFramework(draft, frameworkFromProject(draft));
    }
    return draft;
  }, [inputs, withHypotheses]);

  const imported = useMemo(() => importVariables(project), [project]);
  const variables = edited ?? imported;
  const newCount = edited ? imported.filter((variable) => !edited.some((candidate) => candidate.name.toLowerCase() === variable.name.toLowerCase())).length : 0;
  const selected = variables.find((variable) => variable.id === selectedId) ?? variables[0] ?? null;
  const setChecks = validateSet(variables);
  const updated = useMemo(() => applyVariables(project, variables), [project, variables]);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const commit = (next: ProjectVariable[], message?: string) => {
    setHistory((past) => [...past, variables].slice(-HISTORY_LIMIT));
    setEdited(next);
    if (message) announce(message);
  };
  const select = (id: string) => {
    setSelectedId(id);
    const variable = variables.find((candidate) => candidate.id === id);
    if (variable) announce(announcements.selected(variable.name));
  };
  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory(history.slice(0, -1));
    setEdited(previous);
    announce(announcements.undone);
  };

  const change = (field: keyof Inputs, value: string) => setInputs((current) => ({ ...current, [field]: value }));
  const input = (field: keyof Inputs, label: string, hint?: string, multiline = true) =>
    multiline ? (
      <TextField
        id={`project-${field}`}
        label={label}
        hint={hint}
        multiline
        rows={field === "researchQuestion" || field === "researchAim" ? 2 : 3}
        value={inputs[field]}
        onChange={(event) => change(field, event.target.value)}
      />
    ) : (
      <TextField id={`project-${field}`} label={label} hint={hint} autoComplete="off" value={inputs[field]} onChange={(event) => change(field, event.target.value)} />
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
        {input("researchAim", steps.aim)}
        {input("researchObjectives", steps.objectives, steps.perLine)}
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {input("independentVariables", steps.independent, steps.perLine)}
          {input("dependentVariables", steps.dependent, steps.perLine)}
          {input("mediatorVariables", steps.mediator, steps.perLine)}
          {input("moderatorVariables", steps.moderator, steps.perLine)}
          {input("controlVariables", steps.control, steps.perLine)}
          <div className="grid gap-6">
            {input("population", steps.population, undefined, false)}
            <SelectField
              id="project-methodology"
              label={steps.methodology}
              emptyOption={steps.notChosen}
              options={METHODOLOGIES.map((id) => ({ value: id, label: findOption(id)?.name ?? id }))}
              value={inputs.methodology}
              onChange={(event) => setInputs((current) => ({ ...current, methodology: event.target.value }))}
            />
          </div>
        </div>
        <RadioGroup
          name="variables-hypotheses"
          legend={steps.hypothesesLegend}
          hint={steps.hypothesesHint}
          options={[
            { value: "yes", label: steps.withHypotheses },
            { value: "no", label: steps.withoutHypotheses },
          ]}
          value={withHypotheses ? "yes" : "no"}
          onChange={(value) => setWithHypotheses(value === "yes")}
        />
      </Step>

      <Step id="variables" heading={steps.variables}>
        <p className="text-text-muted">{steps.variablesIntro}</p>
        {edited && (
          <div className="grid gap-3 rounded-panel border border-dashed border-foreground/60 p-4">
            <p>{steps.edited}</p>
            {newCount > 0 && (
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => commit(mergeImported(edited, imported), announcements.imported(newCount))}
                >
                  {steps.importNew(newCount)}
                </Button>
              </div>
            )}
          </div>
        )}
        {variables.length === 0 ? (
          <p className="text-text-muted">{steps.noVariables}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start text-small">
              <caption className="mb-2 text-start font-medium">{steps.tableCaption}</caption>
              <thead>
                <tr className="border-b border-border-control">
                  {[steps.columns.name, steps.columns.kind, steps.columns.level, steps.columns.indicators, steps.columns.origin, steps.columns.edit].map((heading) => (
                    <th key={heading} scope="col" className="px-2 py-2 text-start font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variables.map((variable) => (
                  <tr key={variable.id} className="border-b border-border align-top" aria-current={selected?.id === variable.id ? "true" : undefined}>
                    <th scope="row" className="px-2 py-2 text-start font-medium">
                      {variable.name}
                    </th>
                    <td className="px-2 py-2">{VARIABLE_KIND_INFO[variable.variableType].label}</td>
                    <td className="px-2 py-2">{variable.measurementLevel ? MEASUREMENT_LEVEL_INFO[variable.measurementLevel].label : steps.notChosen}</td>
                    <td className="px-2 py-2">{variable.possibleIndicators.length}</td>
                    <td className="px-2 py-2">{originSummary(variable)}</td>
                    <td className="px-2 py-2">
                      <Button variant={selected?.id === variable.id ? "primary" : "secondary"} size="sm" onClick={() => select(variable.id)}>
                        {steps.editButton(variable.name)}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div>
          <Button variant="subtle" size="sm" onClick={undo} disabled={history.length === 0}>
            {steps.undo}
          </Button>
        </div>

        <div className="grid gap-3">
          <h3 className="text-subheading font-semibold">{steps.setChecks}</h3>
          <ul className="grid gap-2">
            {setChecks.map((check) => (
              <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
                </p>
                <p className="text-small text-text-muted">{check.explanation}</p>
              </li>
            ))}
          </ul>
        </div>

        <form
          className="grid items-end gap-3 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[1fr_auto_auto]"
          aria-labelledby="add-variable-title"
          onSubmit={(event) => {
            event.preventDefault();
            if (!newName.trim()) return;
            const next = addProjectVariable(variables, newName, newKind);
            const added = next[next.length - 1];
            commit(next, announcements.added(added.name));
            setSelectedId(added.id);
            setNewName("");
          }}
        >
          <h3 id="add-variable-title" className="text-subheading font-semibold sm:col-span-3">
            {steps.addHeading}
          </h3>
          <TextField id="new-variable-name" label={steps.newName} value={newName} autoComplete="off" onChange={(event) => setNewName(event.target.value)} />
          <SelectField
            id="new-variable-kind"
            label={steps.newKind}
            options={VARIABLE_KINDS.map((kind) => ({ value: kind, label: VARIABLE_KIND_INFO[kind].label }))}
            value={newKind}
            onChange={(event) => setNewKind(event.target.value as VariableKind)}
          />
          <Button type="submit" variant="secondary">
            {steps.add}
          </Button>
        </form>
      </Step>

      {selected && (
        <Step id="editor" heading={steps.editor}>
          <SelectField
            id="variable-select"
            label={steps.choose}
            options={variables.map((variable) => ({ value: variable.id, label: variable.name }))}
            value={selected.id}
            onChange={(event) => select(event.target.value)}
          />
          <VariableEditor
            key={selected.id}
            variable={selected}
            variables={variables}
            project={project}
            onRename={(name) => commit(renameProjectVariable(variables, selected.id, name))}
            onKind={(kind) => commit(changeVariableKind(variables, selected.id, kind))}
            onDetails={(details) => commit(updateVariable(variables, selected.id, details))}
            onAddIndicator={(name) => commit(addIndicator(variables, selected.id, { name }), announcements.indicatorAdded(name.trim()))}
            onIndicator={(indicatorId, details) => commit(updateIndicator(variables, selected.id, indicatorId, details))}
            onMoveIndicator={(indicatorId, to) => {
              const next = moveIndicator(variables, selected.id, indicatorId, to);
              const indicator = selected.possibleIndicators.find((candidate) => candidate.id === indicatorId)!;
              commit(next, announcements.indicatorMoved(indicator.name, to + 1, selected.possibleIndicators.length));
            }}
            onDeleteIndicator={(indicatorId) => {
              const indicator = selected.possibleIndicators.find((candidate) => candidate.id === indicatorId)!;
              commit(deleteIndicator(variables, selected.id, indicatorId), announcements.indicatorDeleted(indicator.name));
            }}
            onDuplicate={() => {
              const next = duplicateVariable(variables, selected.id);
              const copy = next[next.indexOf(next.find((variable) => variable.id === selected.id)!) + 1];
              commit(next, announcements.duplicated(copy.name));
              setSelectedId(copy.id);
            }}
            onDelete={() => {
              commit(deleteProjectVariable(variables, selected.id), announcements.deleted(selected.name));
              setSelectedId(null);
            }}
          />
        </Step>
      )}

      <Step id="export" heading={steps.export}>
        <p className="text-text-muted">{steps.exportIntro}</p>
        <div>
          <CopyButton text={variablesTable(variables)} subject={steps.copySubject} onResult={(result) => announce(result === "copied" ? announcements.copied : announcements.copyFailed)} />
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

      <Step id="guide" heading={steps.guide}>
        {guide}
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
