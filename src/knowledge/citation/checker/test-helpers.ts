import assert from "node:assert/strict";
import { checkReferences, type CheckRequest } from "./report";
import type { CheckerIssueCategory, ReferenceCheckIssue, ReferenceCheckReport } from "./types";

export const check = (style: CheckRequest["style"], references: string, citations?: string) => checkReferences({ style, references, ...(citations === undefined ? {} : { citations }) });

/** Errors and warnings only: what a writer must look at. */
export const problems = (issues: readonly ReferenceCheckIssue[]) => issues.filter((item) => item.severity !== "information");

/** Asserts an issue with this category, severity and message is present. */
export function hasIssue(issues: readonly ReferenceCheckIssue[], category: CheckerIssueCategory, severity: ReferenceCheckIssue["severity"], message: RegExp | string): ReferenceCheckIssue {
  const found = issues.find((item) => item.category === category && item.severity === severity && (typeof message === "string" ? item.message === message : message.test(item.message)));
  assert.ok(found, `expected ${severity} ${category} “${message}” in: ${issues.map((item) => `${item.severity} ${item.category}: ${item.message}`).join(" | ")}`);
  return found;
}

export const entryIssues = (report: ReferenceCheckReport, index: number) => report.references[index - 1].issues;
export const citationIssues = (report: ReferenceCheckReport) => report.citations.findings.flatMap((finding) => finding.issues);
