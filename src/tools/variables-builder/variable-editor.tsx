"use client";

import { useState, type ReactNode } from "react";
import { Button, SelectField, Tag, TextField } from "@/ui";
import {
  CHECK_STATUS_LABELS,
  FRAMEWORK_KIND,
  MEASUREMENT_LEVELS,
  MEASUREMENT_LEVEL_INFO,
  VARIABLE_KINDS,
  VARIABLE_KIND_INFO,
  connectionsFor,
  draftItems,
  operationalisation,
  originOf,
  parseList,
  validateVariable,
  type CheckStatus,
  type IndicatorDetails,
  type MeasurementLevel,
  type ProjectVariable,
  type ResearchProjectDraft,
  type VariableDetails,
  type VariableKind,
} from "@/knowledge/research";
import { stepPosition } from "./announcements";
import { steps } from "./copy";

const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = { aligned: "info", review: "neutral", "worth-checking": "caution", missing: "caution", clarify: "caution" };
const kindOptions = VARIABLE_KINDS.map((kind) => ({ value: kind, label: VARIABLE_KIND_INFO[kind].label }));
const levelOptions = MEASUREMENT_LEVELS.map((level) => ({ value: level, label: MEASUREMENT_LEVEL_INFO[level].label }));

function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="grid gap-3">
      <h4 className="font-semibold">{heading}</h4>
      {children}
    </div>
  );
}

/** A text field that only reports a change once it isn't empty, for names that can't be blank. */
function RequiredText({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <TextField
      id={id}
      label={label}
      value={text}
      autoComplete="off"
      error={text.trim() ? undefined : "Enter a name. The last name you entered is kept until you do."}
      onChange={(event) => {
        setText(event.target.value);
        if (event.target.value.trim()) onChange(event.target.value);
      }}
    />
  );
}

export interface VariableEditorProps {
  variable: ProjectVariable;
  variables: readonly ProjectVariable[];
  project: ResearchProjectDraft;
  onRename: (name: string) => void;
  onKind: (kind: VariableKind) => void;
  onDetails: (details: VariableDetails) => void;
  onAddIndicator: (name: string) => void;
  onIndicator: (indicatorId: string, details: IndicatorDetails) => void;
  onMoveIndicator: (indicatorId: string, to: number) => void;
  onDeleteIndicator: (indicatorId: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/** Everything about one variable: where it came from, its connections, its definition and measurement, and its checks. */
export function VariableEditor(props: VariableEditorProps) {
  const { variable, variables, project } = props;
  const [newIndicator, setNewIndicator] = useState("");
  const connections = connectionsFor(variable, project);
  const checks = validateVariable(variable, variables, project);
  const items = draftItems(variable);
  const field = (key: keyof VariableDetails & string, label: string, hint?: string, multiline = false) => {
    const value = (variable[key as keyof ProjectVariable] as string) ?? "";
    const common = { id: `variable-${key}`, label, hint, value, onChange: (event: { target: { value: string } }) => props.onDetails({ [key]: event.target.value }) };
    return multiline ? <TextField {...common} multiline rows={3} /> : <TextField {...common} autoComplete="off" />;
  };

  return (
    <section aria-labelledby="editor-variable-title" className="grid gap-8 rounded-panel border border-border bg-surface p-4 sm:p-6">
      <div className="grid gap-2">
        <h3 id="editor-variable-title" className="text-subheading font-semibold">
          {variable.name}
        </h3>
        <p className="text-small text-text-muted">{VARIABLE_KIND_INFO[variable.variableType].label}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={props.onDuplicate}>
            {steps.duplicate(variable.name)}
          </Button>
          <Button variant="subtle" size="sm" onClick={props.onDelete}>
            {steps.deleteVariable(variable.name)}
          </Button>
        </div>
      </div>

      <Block heading={steps.origin}>
        <ul className="grid list-disc gap-1 ps-6">
          {originOf(variable, variables).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Block>

      <Block heading={steps.connections}>
        <ul className="grid list-disc gap-1 ps-6">
          <li>{connections.question ? steps.inQuestion : steps.notInQuestion}</li>
          <li>
            {steps.objectivesCount(connections.objectives.length)}
            {connections.objectives.length > 0 && (
              <ul className="mt-1 grid list-disc gap-1 ps-6">
                {connections.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            )}
          </li>
          <li>{steps.hypothesesCount(connections.hypotheses.length)}</li>
          <li>
            {connections.framework
              ? steps.frameworkBox(VARIABLE_KIND_INFO[FRAMEWORK_KIND[connections.framework.type]].label, connections.frameworkRelationships.length)
              : steps.noFramework}
          </li>
        </ul>
      </Block>

      <Block heading={steps.details}>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <RequiredText key={`name-${variable.id}`} id="variable-name" label={steps.name} value={variable.name} onChange={props.onRename} />
          {field("shortName", steps.shortName, steps.shortNameHint)}
          <SelectField id="variable-kind" label={steps.kind} options={kindOptions} value={variable.variableType} onChange={(event) => props.onKind(event.target.value as VariableKind)} />
          <SelectField
            id="variable-level"
            label={steps.level}
            emptyOption={steps.notChosen}
            options={levelOptions}
            value={variable.measurementLevel ?? ""}
            onChange={(event) => props.onDetails({ measurementLevel: (event.target.value || null) as MeasurementLevel | null })}
          />
        </div>
        {field("description", steps.description, undefined, true)}
        {field("conceptualDefinition", steps.conceptual, steps.conceptualHint, true)}
        {field("operationalDefinition", steps.operational, steps.operationalHint, true)}
        {field("measurementScale", steps.scale, steps.scaleHint)}
        <TextField
          id="variable-items"
          label={steps.items}
          hint={steps.itemsHint}
          multiline
          rows={3}
          value={variable.questionnaireItems.join("\n")}
          onChange={(event) => props.onDetails({ questionnaireItems: parseList(event.target.value) })}
        />
        {field("notes", steps.notes, undefined, true)}
      </Block>

      <Block heading={steps.indicators}>
        <p className="text-small text-text-muted">{steps.indicatorsIntro}</p>
        <ol className="grid gap-3">
          {variable.possibleIndicators.map((indicator, index) => {
            const position = index + 1;
            const total = variable.possibleIndicators.length;
            const up = stepPosition(index, total, -1);
            const down = stepPosition(index, total, 1);
            return (
              <li key={indicator.id}>
                <fieldset className="grid gap-3 rounded-panel border border-border p-4">
                  <legend className="px-1 font-medium">{steps.indicatorLegend(position, indicator.name)}</legend>
                  <div className="grid items-start gap-3 sm:grid-cols-2">
                    <RequiredText key={`ind-${indicator.id}`} id={`indicator-name-${indicator.id}`} label={steps.indicatorName(position)} value={indicator.name} onChange={(name) => props.onIndicator(indicator.id, { name })} />
                    <SelectField
                      id={`indicator-level-${indicator.id}`}
                      label={steps.indicatorLevel(position)}
                      emptyOption={steps.notChosen}
                      options={levelOptions}
                      value={indicator.level ?? ""}
                      onChange={(event) => props.onIndicator(indicator.id, { level: (event.target.value || null) as MeasurementLevel | null })}
                    />
                    <TextField id={`indicator-measurement-${indicator.id}`} label={steps.indicatorMeasurement(position)} value={indicator.measurement} autoComplete="off" onChange={(event) => props.onIndicator(indicator.id, { measurement: event.target.value })} />
                    <TextField id={`indicator-scale-${indicator.id}`} label={steps.indicatorScale(position)} value={indicator.scale} autoComplete="off" onChange={(event) => props.onIndicator(indicator.id, { scale: event.target.value })} />
                  </div>
                  <TextField id={`indicator-description-${indicator.id}`} label={steps.indicatorDescription(position)} value={indicator.description} autoComplete="off" onChange={(event) => props.onIndicator(indicator.id, { description: event.target.value })} />
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" size="sm" disabled={up === null} onClick={() => up !== null && props.onMoveIndicator(indicator.id, up)}>
                      {steps.moveUp(indicator.name)}
                    </Button>
                    <Button variant="secondary" size="sm" disabled={down === null} onClick={() => down !== null && props.onMoveIndicator(indicator.id, down)}>
                      {steps.moveDown(indicator.name)}
                    </Button>
                    <Button variant="subtle" size="sm" onClick={() => props.onDeleteIndicator(indicator.id)}>
                      {steps.deleteIndicator(indicator.name)}
                    </Button>
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ol>
        <form
          className="grid items-end gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!newIndicator.trim()) return;
            props.onAddIndicator(newIndicator);
            setNewIndicator("");
          }}
        >
          <TextField id="new-indicator" label={steps.newIndicator} value={newIndicator} autoComplete="off" onChange={(event) => setNewIndicator(event.target.value)} />
          <Button type="submit" variant="secondary">
            {steps.addIndicator}
          </Button>
        </form>
      </Block>

      <Block heading={steps.chain}>
        <p className="text-small text-text-muted">{steps.chainIntro}</p>
        <ol className="grid gap-3">
          {operationalisation(variable).map((step) => (
            <li key={step.id} className="grid gap-1 border-s-2 border-border ps-4">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{step.label}</span> {step.missing && <Tag tone="caution">{steps.missingTag}</Tag>}
              </p>
              <ul className="grid gap-1">
                {step.values.map((value) => (
                  <li key={value} className={step.missing ? "text-text-muted" : undefined}>
                    {value}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        {items.length > 0 && (
          <div className="grid gap-2">
            <h5 className="font-semibold">{steps.draftItems}</h5>
            <p className="text-small text-text-muted">{steps.draftItemsIntro}</p>
            <ul className="grid list-disc gap-1 ps-6">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </Block>

      <Block heading={steps.checks}>
        <ul className="grid gap-3">
          {checks.map((check) => (
            <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
              </p>
              <p className="text-small text-text-muted">{check.explanation}</p>
            </li>
          ))}
        </ul>
      </Block>
    </section>
  );
}
