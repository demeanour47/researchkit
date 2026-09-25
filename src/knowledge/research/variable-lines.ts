/**
 * Variables typed one per line, with indicators after a colon: the shared way research
 * tools read variables until the tools share a saved project.
 */

import { addIndicator, addVariable, updateVariable } from "./variable-builder";
import type { MeasurementLevel, ProjectVariable, VariableKind } from "./variable-types";

export interface VariableLine {
  name: string;
  indicators: string[];
}

/**
 * One variable per line, with its indicators after a colon, separated by semicolons:
 * “sleep quality: time to fall asleep; feeling rested”. Repeated names are merged.
 */
export function parseVariableLines(text: string): VariableLine[] {
  const lines: VariableLine[] = [];
  for (const raw of text.split("\n")) {
    const colon = raw.indexOf(":");
    const name = (colon === -1 ? raw : raw.slice(0, colon)).replace(/\s+/g, " ").trim();
    if (!name) continue;
    const indicators = colon === -1 ? [] : raw.slice(colon + 1).split(";").map((indicator) => indicator.replace(/\s+/g, " ").trim()).filter(Boolean);
    const existing = lines.find((line) => line.name.toLowerCase() === name.toLowerCase());
    if (existing) existing.indicators.push(...indicators.filter((indicator) => !existing.indicators.some((known) => known.toLowerCase() === indicator.toLowerCase())));
    else lines.push({ name, indicators: [...new Set(indicators)] });
  }
  return lines;
}

/**
 * Variables from typed lists, each list with its kind, with indicators and any
 * measurement level chosen for each variable (by id). A name in more than one list
 * keeps its first kind.
 */
export function variablesFromLines(lists: readonly (readonly [string, VariableKind])[], levels: Readonly<Record<string, MeasurementLevel | "">> = {}): ProjectVariable[] {
  let variables: ProjectVariable[] = [];
  for (const [text, kind] of lists) {
    for (const line of parseVariableLines(text)) {
      if (variables.some((variable) => variable.name.toLowerCase() === line.name.toLowerCase())) continue;
      variables = addVariable(variables, line.name, kind);
      const id = variables[variables.length - 1].id;
      for (const indicator of line.indicators) variables = addIndicator(variables, id, { name: indicator });
      const level = levels[id];
      if (level) variables = updateVariable(variables, id, { measurementLevel: level });
    }
  }
  return variables;
}
