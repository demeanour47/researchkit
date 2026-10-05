import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToReportStatisticsInApa as guide } from "../../../../content/guides/how-to-report-statistics-in-apa";
import { blocksOf, citationProblems, proseOf, tableOf } from "../../../domains/publishing/guide-checks";
import { reportingSentence } from "../../../tools/confidence-interval-calculator/copy";
import { calculateConfidenceInterval, type CiCalculation } from "../../statistics/confidence-interval-request";
import { GROUP_REFERENCES, REFERENCES, STATISTICS_REFERENCES } from "../references";
import { formatBounded, formatP, formatStat } from "./format";
import { interpretNumbers } from "./interpret";
import type { ResultKind } from "./types";

const sentence = (kind: ResultKind, values: Record<string, number>, variables: string[]) => interpretNumbers({ kind, values, variables, hypothesisId: null, alpha: 0.05 }).academic;

describe("How to report statistics in APA Style guide", () => {
  it("gives exactly the sentences the Results Interpretation tool writes", () => {
    assert.deepEqual(tableOf(guide, "APA-style sentences for common results").rows.map(([, text]) => text), [
      sentence("descriptive-statistics", { mean: 72.4, sd: 9.75, n: 20 }, ["exam score"]),
      sentence("independent-t-test", { t: 2.45, df: 58, p: 0.017, d: 0.63 }, ["teaching method", "exam score"]),
      sentence("independent-t-test", { t: 1.12, df: 58, p: 0.267, d: 0.29 }, ["teaching method", "exam score"]),
      sentence("pearson", { r: 0.34, n: 120, p: 0.0001 }, ["study hours", "GPA"]),
      sentence("one-way-anova", { f: 4.21, df1: 2, df2: 87, p: 0.018, etaSquared: 0.09 }, ["faculty", "satisfaction"]),
      sentence("chi-square", { chi2: 6.12, df: 1, p: 0.013, cramersV: 0.25, smallerSide: 1, minExpected: 8.4 }, ["gender", "internet use"]),
    ]);
  });

  it("gives the confidence interval sentences the Confidence Interval Calculator writes", () => {
    const ok = (calculation: CiCalculation) => {
      assert.ok(calculation.ok);
      return calculation as Extract<CiCalculation, { ok: true }>;
    };
    const mean = ok(calculateConfidenceInterval({ method: "one-mean", values: { confidence: "0.95", mean: "72.4", sd: "9.75", n: "20" } }));
    const difference = ok(calculateConfidenceInterval({ method: "two-means", values: { confidence: "0.95", mean1: "24.1", sd1: "6.2", n1: "30", mean2: "22.9", sd2: "8.5", n2: "25" } }));
    const list = blocksOf(guide).find((block) => block.type === "list" && block.items.some((item) => item.startsWith("The mean was")));
    assert.ok(list && list.type === "list");
    assert.deepEqual(list.items, [reportingSentence(mean), reportingSentence(difference)]);
  });

  it("shows formatting examples the formatting rules produce", () => {
    const rules = Object.fromEntries(tableOf(guide, "APA formatting rules").rows);
    assert.equal(rules["p-values exact, to three decimal places"], `${formatP(0.017)}; ${formatP(0.267)}`);
    assert.ok(rules["Very small p-values as less than .001"].startsWith(formatP(0.0004)));
    assert.equal(rules["No leading zero for values that can't exceed 1"], `${formatP(0.017)}; r = ${formatBounded(0.34)}; η² = ${formatBounded(0.09)}; V = ${formatBounded(0.25)}`);
    assert.equal(rules["A leading zero for values that can exceed 1"], `d = ${formatStat(0.63)}; M = ${formatStat(0.85)}`);
  });

  it("labels its examples as hypothetical", () => {
    assert.match(proseOf(guide), /These sentences are hypothetical: the numbers are invented to show the format/);
  });

  it("cites the APA manual it follows", () => {
    assert.deepEqual(citationProblems(guide, [...REFERENCES, ...STATISTICS_REFERENCES, ...GROUP_REFERENCES].map((reference) => reference.id)), []);
  });
});
