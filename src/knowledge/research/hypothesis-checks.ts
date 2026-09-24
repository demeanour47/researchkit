/** The shared vocabulary for hypothesis checks. Checks describe; they never score or rank. */

export const CHECK_STATUSES = ["aligned", "worth-checking", "missing", "clarify", "review"] as const;
export type CheckStatus = (typeof CHECK_STATUSES)[number];

export const CHECK_STATUS_LABELS: Readonly<Record<CheckStatus, string>> = {
  aligned: "Looks aligned",
  "worth-checking": "Worth checking",
  missing: "Missing",
  clarify: "Needs clarification",
  review: "For you to review",
};

export const CHECK_IDS = [
  "researchQuestion",
  "objectives",
  "variables",
  "population",
  "context",
  "testability",
  "measurability",
  "wording",
  "nullAlternative",
  "direction",
] as const;
export type CheckId = (typeof CHECK_IDS)[number];

export const CHECK_LABELS: Readonly<Record<CheckId, string>> = {
  researchQuestion: "Research question alignment",
  objectives: "Objective alignment",
  variables: "Variable consistency",
  population: "Population consistency",
  context: "Context consistency",
  testability: "Testability",
  measurability: "Measurability",
  wording: "Logical wording",
  nullAlternative: "Null and alternative consistency",
  direction: "Direction",
};

export interface HypothesisCheck {
  check: CheckId;
  label: string;
  status: CheckStatus;
  explanation: string;
}

export const makeCheck = (check: CheckId, status: CheckStatus, explanation: string): HypothesisCheck => ({
  check,
  label: CHECK_LABELS[check],
  status,
  explanation,
});

/** The null and alternative wording being checked, as the researcher last left it. */
export interface PairTexts {
  null: string;
  alternative: string;
}
