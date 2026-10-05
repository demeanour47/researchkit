import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { whatAPValueTellsYou as guide } from "../../../content/guides/what-a-p-value-tells-you";
import { blocksOf, citationProblems, proseOf, tableOf } from "../../domains/publishing/guide-checks";
import { dMagnitude, formatP, formatStat } from "../research/results";
import { REFERENCES, STATISTICS_REFERENCES } from "../research/references";
import { welchInterval } from "./confidence-interval";
import { studentTUpper } from "./distributions";
import { powerFor } from "./power";

const twoSidedP = (t: number, df: number) => 2 * studentTUpper(Math.abs(t), df);

describe("What a p-value tells you guide", () => {
  const rows = tableOf(guide, "Three hypothetical results").rows;

  it("reports p-values calculated from the test statistics", () => {
    assert.ok(rows[0][0].startsWith(`t(58) = 2.45, ${formatP(twoSidedP(2.45, 58))}`), rows[0][0]);
    assert.ok(rows[1][0].startsWith(`t(58) = 1.12, ${formatP(twoSidedP(1.12, 58))}`), rows[1][0]);
  });

  it("describes the effect sizes by the conventions the tools use", () => {
    assert.equal(dMagnitude(0.63).label, "medium");
    assert.match(rows[0][2], /a medium difference by Cohen's conventions/);
  });

  it("states the power the Power Analysis gives for the non-significant example", () => {
    const power = powerFor({ design: "two-means", alpha: 0.05, tails: "two-sided", effect: 0.29, groups: 2 }, 30);
    assert.match(rows[1][2], new RegExp(`only about ${Math.round(power * 10) * 10}% power to detect an effect of d = 0.29`));
  });

  it("gives the Welch example's statistic, p-value and interval as the calculator does", () => {
    const interval = welchInterval({ mean: 24.1, sd: 6.2, n: 30 }, { mean: 22.9, sd: 8.5, n: 25 }, 0.95);
    assert.equal(interval.critical.distribution, "t");
    if (interval.critical.distribution !== "t") return;
    const t = interval.estimate / interval.standardError;
    const expected = `A difference of ${formatStat(interval.estimate)}, t(${formatStat(interval.critical.df)}) = ${formatStat(t)}, ${formatP(twoSidedP(t, interval.critical.df))}, 95% CI [${formatStat(interval.lower)}, ${formatStat(interval.upper)}]`;
    assert.equal(rows[2][0], expected);
  });

  it("shows a trivial effect becoming significant in a very large sample", () => {
    const n = 10_000;
    const t = 0.05 * Math.sqrt(n / 2);
    assert.match(proseOf(guide), new RegExp(`gives t\\(${2 * n - 2}\\) = ${formatStat(t).replace(".", "\\.")}, ${formatP(twoSidedP(t, 2 * n - 2)).replace(/[<.]/g, (c) => `\\${c}`)}`));
  });

  it("quotes the ASA's six principles in order", () => {
    const list = blocksOf(guide).find((block) => block.type === "list" && block.ordered);
    assert.ok(list && list.type === "list");
    assert.equal(list.items.length, 6);
    assert.equal(list.items[1], "P-values do not measure the probability that the studied hypothesis is true, or the probability that the data were produced by random chance alone.");
  });

  it("cites every source it lists", () => {
    assert.deepEqual(citationProblems(guide, [...REFERENCES, ...STATISTICS_REFERENCES].map((reference) => reference.id)), []);
  });
});
