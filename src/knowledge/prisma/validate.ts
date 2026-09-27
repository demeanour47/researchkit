/**
 * Checks on the numbers, in five kinds:
 * - values: counts are whole numbers, never negative;
 * - missing values: what the diagram needs but hasn't been given;
 * - arithmetic: entered stages equal what the stages before them imply;
 * - flow integrity: no box removes more than reached it;
 * - sequence: each stage is no larger than the one before.
 * Each message names the numbers involved and says how to fix them.
 */

import { computeFlow, countText, usesOtherMethods, type FlowNumbers } from "./flow";
import { getKind, type CountedSource, type ExclusionReason, type PrismaInput } from "./types";

export type CheckKind = "value" | "missing" | "arithmetic" | "integrity" | "sequence";

export interface PrismaIssue {
  severity: "problem" | "warning";
  kind: CheckKind;
  /** The input the issue is about, such as “duplicates” or “reasons.r2”, for linking to the field. */
  field: string;
  message: string;
}

export const CHECK_KIND_LABELS: Readonly<Record<CheckKind, string>> = {
  value: "Invalid number",
  missing: "Missing value",
  arithmetic: "Doesn't add up",
  integrity: "Flow integrity",
  sequence: "Sequence",
};

/** The names of the numbers, as messages use them. */
export const FIELD_NAMES: Readonly<Record<string, string>> = {
  duplicates: "Duplicate records removed",
  automation: "Records marked ineligible by automation tools",
  removedOther: "Records removed for other reasons",
  screened: "Records screened",
  screenedExcluded: "Records excluded",
  sought: "Reports sought for retrieval",
  notRetrieved: "Reports not retrieved",
  assessed: "Reports assessed for eligibility",
  otherSought: "Reports sought from other methods",
  otherNotRetrieved: "Reports not retrieved from other methods",
  otherAssessed: "Reports from other methods assessed",
  reportsIncluded: "Reports of included studies",
  studiesIncluded: "Studies included",
};

const n = (value: number) => countText(value).slice(4);

export function prismaIssues(input: PrismaInput, flow: FlowNumbers = computeFlow(input)): PrismaIssue[] {
  const issues: PrismaIssue[] = [];
  const add = (severity: PrismaIssue["severity"], kind: CheckKind, field: string, message: string) => issues.push({ severity, kind, field, message });
  const info = getKind(input.kind);

  // Values: whole numbers, never negative.
  const check = (field: string, name: string, value: number | null) => {
    if (value === null) return;
    if (!Number.isFinite(value)) add("problem", "value", field, `${name} must be a whole number, such as 120.`);
    else if (!Number.isInteger(value)) add("problem", "value", field, `${name} must be a whole number; it is ${value}.`);
    else if (value < 0) add("problem", "value", field, `${name} can't be negative; it is ${value}.`);
  };
  for (const key of ["duplicates", "automation", "removedOther", "screened", "screenedExcluded", "sought", "notRetrieved", "assessed", "reportsIncluded", "studiesIncluded"] as const) check(key, FIELD_NAMES[key], input[key]);
  if (usesOtherMethods(input)) for (const key of ["otherSought", "otherNotRetrieved", "otherAssessed"] as const) check(key, FIELD_NAMES[key], input[key]);
  const lists: [string, string, readonly CountedSource[]][] = [
    ["databases", "database", input.databases],
    ["registers", "register", input.registers],
    ...(usesOtherMethods(input) ? [["otherSources", "other source", input.otherSources] as [string, string, readonly CountedSource[]]] : []),
  ];
  for (const [list, noun, sources] of lists) {
    for (const source of sources) {
      check(`${list}.${source.id}`, source.name.trim() || `A ${noun}`, source.count);
      if (source.count !== null && !source.name.trim()) add("warning", "missing", `${list}.${source.id}`, `A ${noun} with ${n(source.count)} records has no name.`);
    }
    const names = sources.map((source) => source.name.trim().toLowerCase()).filter(Boolean);
    const repeated = names.find((name, index) => names.indexOf(name) !== index);
    if (repeated) add("warning", "value", list, `“${repeated}” is listed twice; combine its counts into one entry.`);
  }
  const reasonLists: [string, readonly ExclusionReason[], number | null][] = [["reasons", input.reasons, flow.assessed.value], ...(usesOtherMethods(input) ? [["otherReasons", input.otherReasons, flow.otherAssessed.value] as [string, readonly ExclusionReason[], number | null]] : [])];
  for (const [list, reasons] of reasonLists) {
    for (const reason of reasons) {
      check(`${list}.${reason.id}`, reason.label.trim() || "An exclusion reason", reason.count);
      if (!reason.label.trim() && reason.count !== null) add("problem", "missing", `${list}.${reason.id}`, `An exclusion reason with ${n(reason.count)} reports has no wording.`);
      if (reason.label.trim() && reason.count === null) add("warning", "missing", `${list}.${reason.id}`, `Give the number of reports excluded for “${reason.label.trim()}”, or remove the reason.`);
    }
    const labels = reasons.map((reason) => reason.label.trim().toLowerCase()).filter(Boolean);
    const repeated = labels.find((label, index) => labels.indexOf(label) !== index);
    if (repeated) add("warning", "value", list, `The reason “${repeated}” is listed twice; combine them.`);
  }
  if (issues.some((issue) => issue.kind === "value" && issue.severity === "problem")) return issues;

  // Missing values.
  if (flow.identified === null) add("problem", "missing", "databases", "Enter the records identified from databases or registers; every other number follows from them.");
  if (info.exclusions) {
    if (input.duplicates === null) add("warning", "missing", "duplicates", "Enter the duplicate records removed, or 0 if there were none.");
    if (input.screenedExcluded === null) add("warning", "missing", "screenedExcluded", "Enter the records excluded at screening, or 0 if none were.");
    if (input.notRetrieved === null) add("warning", "missing", "notRetrieved", "Enter the reports not retrieved, or 0 if all were.");
    if (input.reasons.length === 0) add("warning", "missing", "reasons", "PRISMA 2020 asks for the reasons full-text reports were excluded, with the number for each.");
  }
  if (input.studiesIncluded === null) add("warning", "missing", "studiesIncluded", "Enter the number of studies included; several reports can describe one study.");
  if (usesOtherMethods(input) && flow.otherIdentified === null) add("warning", "missing", "otherSources", "Enter the records found by other methods, or turn the other methods column off.");

  // Arithmetic: entered stages against what the stages before them imply.
  const compare = (field: keyof typeof FIELD_NAMES, entered: number | null, expected: number | null, because: string, severity: PrismaIssue["severity"] = "problem") => {
    if (entered !== null && expected !== null && entered !== expected) add(severity, "arithmetic", field, `${FIELD_NAMES[field]} is ${n(entered)}, but ${because} gives ${n(expected)}. Check both numbers, or clear this one to calculate it.`);
  };
  compare("screened", input.screened, flow.screened.expected, `records identified (${n(flow.identified ?? 0)}) less records removed (${n(flow.removed)})`);
  compare("sought", input.sought, flow.sought.expected, `records screened (${n(flow.screened.value ?? 0)}) less records excluded (${n(input.screenedExcluded ?? 0)})`);
  compare("assessed", input.assessed, flow.assessed.expected, `reports sought (${n(flow.sought.value ?? 0)}) less reports not retrieved (${n(input.notRetrieved ?? 0)})`);
  if (usesOtherMethods(input)) {
    compare("otherSought", input.otherSought, flow.otherSought.expected, `the records found by other methods (${n(flow.otherIdentified ?? 0)})`, "warning");
    compare("otherAssessed", input.otherAssessed, flow.otherAssessed.expected, `reports sought (${n(flow.otherSought.value ?? 0)}) less reports not retrieved (${n(input.otherNotRetrieved ?? 0)})`);
  }
  compare("reportsIncluded", input.reportsIncluded, flow.reportsIncluded.expected, "reports assessed less reports excluded");

  // Flow integrity: no box takes away more than reached it.
  const integrity = (field: string, taken: number | null, from: number | null, takenName: string, fromName: string) => {
    if (taken !== null && from !== null && taken > from) add("problem", "integrity", field, `${takenName} (${n(taken)}) is more than ${fromName} (${n(from)}).`);
  };
  integrity("duplicates", flow.removed, flow.identified, "Records removed before screening", "records identified");
  integrity("screenedExcluded", input.screenedExcluded, flow.screened.value, "Records excluded", "records screened");
  integrity("notRetrieved", input.notRetrieved, flow.sought.value, "Reports not retrieved", "reports sought");
  integrity("reasons", flow.reportsExcluded, flow.assessed.value, "Reports excluded", "reports assessed");
  if (usesOtherMethods(input)) {
    integrity("otherNotRetrieved", flow.otherNotRetrieved, flow.otherSought.value, "Reports not retrieved from other methods", "reports sought");
    integrity("otherReasons", flow.otherExcluded, flow.otherAssessed.value, "Reports excluded from other methods", "reports assessed");
  }
  if (flow.studiesIncluded !== null && flow.reportsIncluded.value !== null && flow.studiesIncluded > flow.reportsIncluded.value)
    add("problem", "integrity", "studiesIncluded", `Studies included (${n(flow.studiesIncluded)}) is more than the reports of included studies (${n(flow.reportsIncluded.value)}); each study is described by at least one report.`);

  // Sequence: each stage no larger than the one before.
  const sequence = (field: string, later: number | null, earlier: number | null, laterName: string, earlierName: string) => {
    if (later !== null && earlier !== null && later > earlier) add("problem", "sequence", field, `${laterName} (${n(later)}) can't be more than ${earlierName} (${n(earlier)}).`);
  };
  sequence("screened", flow.screened.value, flow.identified, "Records screened", "records identified");
  sequence("sought", flow.sought.value, flow.screened.value, "Reports sought", "records screened");
  sequence("assessed", flow.assessed.value, flow.sought.value, "Reports assessed", "reports sought");
  const assessedTotal = (flow.assessed.value ?? 0) + (flow.otherAssessed.value ?? 0);
  if (flow.assessed.value !== null) sequence("reportsIncluded", flow.reportsIncluded.value, assessedTotal, "Reports of included studies", "reports assessed");
  for (const [field, stage] of [
    ["screened", flow.screened],
    ["sought", flow.sought],
    ["assessed", flow.assessed],
    ["reportsIncluded", flow.reportsIncluded],
  ] as const)
    if (stage.value !== null && stage.value < 0) add("problem", "integrity", field, `${FIELD_NAMES[field]} works out as ${stage.value}; the numbers before it remove more than there are.`);

  if (flow.studiesIncluded === 0) add("warning", "sequence", "studiesIncluded", "No studies are included. An empty review can be published, but say so clearly and explain why.");
  // One problem can be found by several checks; keep the first message for each field and kind.
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.field}|${issue.kind}|${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const canDraw = (issues: readonly PrismaIssue[]) => !issues.some((issue) => issue.severity === "problem" && issue.kind === "value");
