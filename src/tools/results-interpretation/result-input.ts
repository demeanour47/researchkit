/**
 * The result form's text turned into a result the knowledge layer can interpret. Pure,
 * so it is tested. Numbers are read as software prints them, including “−.34” with a
 * Unicode minus, “1,200” and “< .001”.
 */

import { getFields, parseNumber, type ResultInput, type ResultKind, type SignificanceLevel } from "../../knowledge/research";

export interface ResultEntries {
  kind: ResultKind;
  /** Text typed for each field, by key. Fields of other kinds are ignored. */
  texts: Readonly<Record<string, string>>;
  variables: readonly string[];
  hypothesisId: string;
  alpha: SignificanceLevel;
}

/** A value just below .001, so “< .001” is interpreted and reported as p < .001. */
export const BELOW_ONE_THOUSANDTH = 0.0009;

/** A typed number, or null when empty. Throws a RangeError with a message for text that isn't a number. */
export function readValue(text: string): number | null {
  const cleaned = text.replace(/[−–]/g, "-").trim();
  if (/^<\s*0?\.001$/.test(cleaned)) return BELOW_ONE_THOUSANDTH;
  return parseNumber(cleaned);
}

/** The result to interpret, and any text that couldn't be read as a number, by field. */
export function resultFromEntries(entries: ResultEntries): { input: ResultInput; unreadable: { field: string; message: string }[] } {
  const values: Record<string, number> = {};
  const unreadable: { field: string; message: string }[] = [];
  for (const field of getFields(entries.kind)) {
    const text = entries.texts[field.key] ?? "";
    try {
      const value = readValue(text);
      if (value !== null) values[field.key] = value;
    } catch {
      unreadable.push({ field: field.key, message: `Enter the ${field.label.toLowerCase()} as a number, such as ${field.symbol === "p" ? "0.032" : "0.45"}.` });
    }
  }
  return {
    input: { kind: entries.kind, values, variables: entries.variables.filter(Boolean), hypothesisId: entries.hypothesisId || null, alpha: entries.alpha },
    unreadable,
  };
}
