/**
 * The comparison matrix: the core tests side by side, one row each. Every cell is read
 * from the test profiles, the analysis catalogue and the assumption guides, so the table
 * can't drift from what the rest of ResearchKit says about each test. It summarises
 * common practice; it isn't a rule that settles every study.
 */

import { getAnalysisMethod, type AnalysisMethodId } from "../data-analysis-types";
import { alternativesFor, assumptionsFor } from "./finder";
import { PROFILED_TESTS, TEST_PROFILES } from "./profiles";

export interface MatrixRow {
  method: AnalysisMethodId;
  test: string;
  purpose: string;
  outcome: string;
  variables: string;
  structure: string;
  assumptions: string[];
  alternative: string;
}

/** Column headings, in the order the row fields are shown: test, purpose, outcome, variables, structure, assumptions, alternative. */
export const MATRIX_COLUMNS = ["Common candidate test", "Research purpose", "Outcome", "Groups or variables", "Structure", "Key assumptions", "Alternative or related method"] as const;

export const COMPARISON_MATRIX: readonly MatrixRow[] = PROFILED_TESTS.map((method) => {
  const profile = TEST_PROFILES[method];
  return {
    method,
    test: getAnalysisMethod(method).name,
    purpose: profile.answers,
    outcome: profile.structure.outcome,
    variables: `${profile.structure.predictor} Groups: ${profile.structure.groups}`,
    structure: profile.structure.pairing,
    assumptions: assumptionsFor(method).map((assumption) => assumption.name),
    alternative: alternativesFor(method)[0]?.name ?? getAnalysisMethod(profile.whyNot[0].method).name,
  };
});
