/**
 * The arithmetic of the flow. Each stage follows from the one before: records screened
 * are those identified less those removed; reports sought are records screened less
 * those excluded; reports assessed are those sought less those not retrieved; included
 * reports are those assessed less those excluded. A stage the researcher enters is used
 * as entered; otherwise it is calculated. Either way the expected value is kept, so
 * validation can show where entered numbers don't add up.
 */

import type { CountedSource, ExclusionReason, PrismaInput } from "./types";

export interface Stage {
  /** The number shown: as entered, or calculated. */
  value: number | null;
  /** What the stages before it imply, when they are known. */
  expected: number | null;
  /** Whether the value was calculated rather than entered. */
  calculated: boolean;
}

export interface FlowNumbers {
  databases: number | null;
  registers: number | null;
  identified: number | null;
  duplicates: number | null;
  automation: number | null;
  removedOther: number | null;
  removed: number;
  screened: Stage;
  screenedExcluded: number | null;
  sought: Stage;
  notRetrieved: number | null;
  assessed: Stage;
  reportsExcluded: number | null;
  /** Reports included through databases and registers. */
  mainIncluded: number | null;
  otherIdentified: number | null;
  otherSought: Stage;
  otherNotRetrieved: number | null;
  otherAssessed: Stage;
  otherExcluded: number | null;
  otherIncluded: number | null;
  reportsIncluded: Stage;
  studiesIncluded: number | null;
}

/** The total of the counts given, or null when none is. */
export function sumCounts(items: readonly (CountedSource | ExclusionReason)[]): number | null {
  const counts = items.map((item) => item.count).filter((count): count is number => count !== null);
  return counts.length === 0 ? null : counts.reduce((a, b) => a + b, 0);
}

const add = (...values: (number | null)[]) => (values.every((value) => value === null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0));
const minus = (a: number | null, b: number | null) => (a === null ? null : a - (b ?? 0));

function stage(entered: number | null, expected: number | null): Stage {
  return entered !== null ? { value: entered, expected, calculated: false } : { value: expected, expected, calculated: expected !== null };
}

/** Whether the other methods column is in use: asked for, and the diagram has one. */
export const usesOtherMethods = (input: Pick<PrismaInput, "otherMethods" | "kind">) => input.otherMethods && input.kind !== "narrative";

export function computeFlow(input: PrismaInput): FlowNumbers {
  const databases = sumCounts(input.databases);
  const registers = sumCounts(input.registers);
  const identified = add(databases, registers);
  const removed = (input.duplicates ?? 0) + (input.automation ?? 0) + (input.removedOther ?? 0);
  const screened = stage(input.screened, minus(identified, removed));
  const sought = stage(input.sought, minus(screened.value, input.screenedExcluded));
  const assessed = stage(input.assessed, minus(sought.value, input.notRetrieved));
  const reportsExcluded = sumCounts(input.reasons);
  const mainIncluded = minus(assessed.value, reportsExcluded);

  // A narrative review workflow has no column for other methods, so it counts none.
  const other = usesOtherMethods(input);
  const otherIdentified = other ? sumCounts(input.otherSources) : null;
  const otherSought = stage(other ? input.otherSought : null, otherIdentified);
  const otherAssessed = stage(other ? input.otherAssessed : null, minus(otherSought.value, other ? input.otherNotRetrieved : null));
  const otherExcluded = other ? sumCounts(input.otherReasons) : null;
  const otherIncluded = other ? minus(otherAssessed.value, otherExcluded) : null;
  const reportsIncluded = stage(input.reportsIncluded, mainIncluded === null && otherIncluded === null ? null : add(mainIncluded, otherIncluded));

  return {
    databases,
    registers,
    identified,
    duplicates: input.duplicates,
    automation: input.automation,
    removedOther: input.removedOther,
    removed,
    screened,
    screenedExcluded: input.screenedExcluded,
    sought,
    notRetrieved: input.notRetrieved,
    assessed,
    reportsExcluded,
    mainIncluded,
    otherIdentified,
    otherSought,
    otherNotRetrieved: other ? input.otherNotRetrieved : null,
    otherAssessed,
    otherExcluded,
    otherIncluded,
    reportsIncluded,
    studiesIncluded: input.studiesIncluded ?? reportsIncluded.value,
  };
}

/** A count as PRISMA writes it: “n = 1,204”, or “n = ” left blank for the researcher to fill. */
export const countText = (value: number | null) => `n = ${value === null ? "" : Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
