import type { CheckerIssueCategory, ReferenceCheckIssue } from "./types";

/** An issue, with evidence only when there is some. */
export const issue = (
  category: CheckerIssueCategory,
  severity: ReferenceCheckIssue["severity"],
  message: string,
  explanation: string,
  action: string,
  evidence?: string,
): ReferenceCheckIssue => ({ category, severity, message, explanation, action, ...(evidence ? { evidence } : {}) });
