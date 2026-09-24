/**
 * Creating and editing variables. Every operation returns a new list and leaves the
 * one it was given unchanged. Names are required; everything else may stay unknown.
 */

import { defaultShortLabel } from "./conceptual-framework";
import { normalise } from "./question-text";
import {
  MEASUREMENT_LEVELS,
  VARIABLE_KINDS,
  type MeasurementLevel,
  type ProjectVariable,
  type VariableIndicator,
  type VariableKind,
  type VariableSource,
} from "./variable-types";

const slug = (text: string) =>
  normalise(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "variable";

function uniqueId(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function checkName(name: string, what = "A variable"): string {
  const clean = normalise(name);
  if (!clean) throw new RangeError(`${what} needs a name.`);
  return clean;
}

function checkKind(kind: VariableKind) {
  if (!VARIABLE_KINDS.includes(kind)) throw new RangeError(`Unknown variable type: ${kind}`);
}

function checkLevel(level: MeasurementLevel | null | undefined) {
  if (level && !MEASUREMENT_LEVELS.includes(level)) throw new RangeError(`Unknown measurement level: ${level}`);
}

/** A new variable with only a name, a type and where it came from. Everything else starts unknown. */
export function createVariable(name: string, kind: VariableKind, takenIds: ReadonlySet<string>, source?: VariableSource): ProjectVariable {
  const clean = checkName(name);
  checkKind(kind);
  return {
    id: uniqueId(`var-${slug(clean)}`, takenIds),
    name: clean,
    shortName: defaultShortLabel(clean),
    description: "",
    variableType: kind,
    measurementLevel: null,
    measurementScale: "",
    conceptualDefinition: "",
    operationalDefinition: "",
    possibleIndicators: [],
    questionnaireItems: [],
    notes: "",
    sources: [source ?? { kind: "user", asKind: kind, references: [] }],
  };
}

const ids = (variables: readonly ProjectVariable[]) => new Set(variables.map((variable) => variable.id));

function find(variables: readonly ProjectVariable[], id: string): ProjectVariable {
  const variable = variables.find((candidate) => candidate.id === id);
  if (!variable) throw new RangeError(`Unknown variable: ${id}`);
  return variable;
}

const replace = (variables: readonly ProjectVariable[], id: string, change: (variable: ProjectVariable) => ProjectVariable) => {
  find(variables, id);
  return variables.map((variable) => (variable.id === id ? change(variable) : variable));
};

export function addVariable(variables: readonly ProjectVariable[], name: string, kind: VariableKind): ProjectVariable[] {
  return [...variables, createVariable(name, kind, ids(variables))];
}

/** Renames a variable, keeping its id. A short name that was still the default follows the new name. */
export function renameVariable(variables: readonly ProjectVariable[], id: string, name: string): ProjectVariable[] {
  const clean = checkName(name);
  return replace(variables, id, (variable) => ({
    ...variable,
    name: clean,
    shortName: variable.shortName === defaultShortLabel(variable.name) ? defaultShortLabel(clean) : variable.shortName,
  }));
}

export function changeVariableKind(variables: readonly ProjectVariable[], id: string, kind: VariableKind): ProjectVariable[] {
  checkKind(kind);
  return replace(variables, id, (variable) => ({ ...variable, variableType: kind }));
}

/** The text fields a researcher fills in, plus the measurement level and questionnaire items. */
export interface VariableDetails {
  shortName?: string;
  description?: string;
  conceptualDefinition?: string;
  operationalDefinition?: string;
  measurementScale?: string;
  notes?: string;
  measurementLevel?: MeasurementLevel | null;
  questionnaireItems?: readonly string[];
}

/** Updates a variable's details. Text is kept as typed; an empty short name returns to the default. */
export function updateVariable(variables: readonly ProjectVariable[], id: string, details: VariableDetails): ProjectVariable[] {
  checkLevel(details.measurementLevel);
  return replace(variables, id, (variable) => {
    const next = { ...variable, ...details };
    if ("shortName" in details && !normalise(details.shortName ?? "")) next.shortName = defaultShortLabel(variable.name);
    if (details.questionnaireItems) next.questionnaireItems = [...details.questionnaireItems];
    return next;
  });
}

export function deleteVariable(variables: readonly ProjectVariable[], id: string): ProjectVariable[] {
  find(variables, id);
  return variables.filter((variable) => variable.id !== id);
}

/**
 * Copies a variable, with its details and indicators, as a new variable placed after
 * it. The copy gets new ids and a name marked as a copy, and is recorded as added by you.
 */
export function duplicateVariable(variables: readonly ProjectVariable[], id: string): ProjectVariable[] {
  const original = find(variables, id);
  const names = new Set(variables.map((variable) => variable.name.toLowerCase()));
  let name = `${original.name} (copy)`;
  for (let n = 2; names.has(name.toLowerCase()); n++) name = `${original.name} (copy ${n})`;
  const copy = createVariable(name, original.variableType, ids(variables), { kind: "user", asKind: original.variableType, references: [original.id] });
  const withDetails: ProjectVariable = {
    ...original,
    id: copy.id,
    name,
    shortName: defaultShortLabel(name),
    possibleIndicators: original.possibleIndicators.map((indicator, index) => ({ ...indicator, id: `${copy.id}-ind-${index + 1}` })),
    sources: copy.sources,
  };
  const at = variables.indexOf(original) + 1;
  return [...variables.slice(0, at), withDetails, ...variables.slice(at)];
}

// Indicators.

export interface IndicatorDetails {
  name?: string;
  description?: string;
  measurement?: string;
  scale?: string;
  level?: MeasurementLevel | null;
}

/** Ids are the variable's id and an increasing number, never reused within the variable. */
function nextIndicatorId(variable: ProjectVariable): string {
  const numbers = variable.possibleIndicators.map((indicator) => Number(/-ind-(\d+)$/.exec(indicator.id)?.[1] ?? 0));
  return `${variable.id}-ind-${Math.max(0, ...numbers) + 1}`;
}

export function addIndicator(variables: readonly ProjectVariable[], variableId: string, details: IndicatorDetails & { name: string }): ProjectVariable[] {
  const name = checkName(details.name, "An indicator");
  checkLevel(details.level);
  return replace(variables, variableId, (variable) => ({
    ...variable,
    possibleIndicators: [
      ...variable.possibleIndicators,
      { id: nextIndicatorId(variable), name, description: details.description ?? "", measurement: details.measurement ?? "", scale: details.scale ?? "", level: details.level ?? null },
    ],
  }));
}

function findIndicator(variable: ProjectVariable, indicatorId: string): VariableIndicator {
  const indicator = variable.possibleIndicators.find((candidate) => candidate.id === indicatorId);
  if (!indicator) throw new RangeError(`Unknown indicator: ${indicatorId}`);
  return indicator;
}

/** Updates an indicator's details. A name can't be emptied. */
export function updateIndicator(variables: readonly ProjectVariable[], variableId: string, indicatorId: string, details: IndicatorDetails): ProjectVariable[] {
  checkLevel(details.level);
  if ("name" in details) checkName(details.name ?? "", "An indicator");
  return replace(variables, variableId, (variable) => {
    findIndicator(variable, indicatorId);
    return {
      ...variable,
      possibleIndicators: variable.possibleIndicators.map((indicator) =>
        indicator.id === indicatorId ? { ...indicator, ...details, name: details.name !== undefined ? normalise(details.name) : indicator.name } : indicator,
      ),
    };
  });
}

export function deleteIndicator(variables: readonly ProjectVariable[], variableId: string, indicatorId: string): ProjectVariable[] {
  return replace(variables, variableId, (variable) => {
    findIndicator(variable, indicatorId);
    return { ...variable, possibleIndicators: variable.possibleIndicators.filter((indicator) => indicator.id !== indicatorId) };
  });
}

/** Moves an indicator to a new position in its variable's list, clamped to the list. */
export function moveIndicator(variables: readonly ProjectVariable[], variableId: string, indicatorId: string, toIndex: number): ProjectVariable[] {
  return replace(variables, variableId, (variable) => {
    const indicator = findIndicator(variable, indicatorId);
    const rest = variable.possibleIndicators.filter((candidate) => candidate.id !== indicatorId);
    const at = Math.max(0, Math.min(rest.length, Math.round(toIndex)));
    return { ...variable, possibleIndicators: [...rest.slice(0, at), indicator, ...rest.slice(at)] };
  });
}
