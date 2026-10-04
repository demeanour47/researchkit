import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { confidenceIntervalsGuide as guide } from "../../../content/guides/confidence-intervals";
import { CONFIDENCE_INTERVAL_REFERENCES, getReference, referenceRuns } from "../../knowledge/research/references";
import { CI_METHODS, tCritical, zCritical, type CiMethod } from "../../knowledge/statistics/confidence-interval";
import { calculateConfidenceInterval, type CiCalculation, type CiRequest } from "../../knowledge/statistics/confidence-interval-request";
import { announcements, display, fixed, fixedWithin, how, interpretation, limits, methods, page, reportingSentence, results, working, zeroNote } from "./copy";

const run = (method: CiMethod, values: CiRequest["values"], confidence = "0.95") => {
  const calculation = calculateConfidenceInterval({ method, values: { confidence, ...values } });
  assert.ok(calculation.ok, JSON.stringify(calculation));
  return calculation as Extract<CiCalculation, { ok: true }>;
};
const oneMean = (n = "20", confidence = "0.95") => run("one-mean", { mean: "72.4", sd: "9.75", n }, confidence);
const twoMeans = () => run("two-means", { mean1: "24.1", sd1: "6.2", n1: "30", mean2: "22.9", sd2: "8.5", n2: "25" });
const paired = () => run("paired-mean", { meanDifference: "2.4", sdDifference: "1.51", pairs: "10" });
const proportion = (successes = "64", n = "100") => run("one-proportion", { successes, n });
const twoProportions = () => run("two-proportions", { successes1: "45", n1: "60", successes2: "30", n2: "75" });
const correlation = () => run("correlation", { r: "0.45", n: "50" });
const rows = (calculation: Extract<CiCalculation, { ok: true }>) => Object.fromEntries(display(calculation).rows);

describe("rounding", () => {
  it("never shows a negative zero", () => {
    assert.equal(fixed(-0.0001, 2), "0.00");
    assert.equal(fixed(-0.006, 2), "-0.01");
  });

  it("never shows a bound strictly inside [0, 1] as 0 or 1", () => {
    assert.equal(fixedWithin(0.99999982, 3, 0, 1), "0.9999998");
    assert.equal(fixedWithin(0.0000004, 3, 0, 1), "0.0000004");
    assert.equal(fixedWithin(1, 3, 0, 1), "1.000");
  });

  it("shows the entered precision for means, at least 2 decimals", () => {
    assert.deepEqual(rows(oneMean()), {
      Estimate: "72.40",
      "Standard error": "2.18",
      "Critical value": "t(0.975, 19) = 2.093",
      "Margin of error": "4.56",
      "Confidence interval": "[67.84, 76.96]",
    });
    assert.equal(display(run("one-mean", { mean: "9.261460", sd: "0.022789", n: "195" })).interval, "[9.258241, 9.264679]");
  });

  it("keeps small standard errors visible instead of rounding them to 0", () => {
    const shown = rows(run("one-mean", { mean: "5", sd: "0.002", n: "10000" }));
    assert.equal(shown["Standard error"], "0.000020");
    assert.notEqual(display(run("one-mean", { mean: "5", sd: "0.002", n: "10000" })).lower, display(run("one-mean", { mean: "5", sd: "0.002", n: "10000" })).upper);
  });

  it("shows proportions with percentages, and extreme ones with enough decimals", () => {
    assert.equal(display(proportion()).interval, "[0.542 (54.2%), 0.727 (72.7%)]");
    const extreme = display(proportion("9999998", "10000000"));
    assert.equal(extreme.interval, "[0.99999927 (99.999927%), 0.99999995 (99.999995%)]");
  });

  it("always shows lower < upper, both bracketing the estimate, for every method and level", () => {
    const requests: [CiMethod, CiRequest["values"]][] = [
      ["one-mean", { mean: "72.4", sd: "9.75", n: "20" }],
      ["two-means", { mean1: "24.1", sd1: "6.2", n1: "30", mean2: "22.9", sd2: "8.5", n2: "25" }],
      ["paired-mean", { meanDifference: "-0.004", sdDifference: "0.001", pairs: "3" }],
      ["one-proportion", { successes: "0", n: "1" }],
      ["one-proportion", { successes: "1", n: "1" }],
      ["two-proportions", { successes1: "0", n1: "10", successes2: "0", n2: "20" }],
      ["correlation", { r: "0.99999999", n: "10000000" }],
      ["correlation", { r: "-0.999", n: "4" }],
    ];
    for (const confidence of ["0.90", "0.95", "0.99"]) {
      for (const [method, values] of requests) {
        const shown = display(run(method, values, confidence));
        const [lower, estimate, upper] = [shown.lower, shown.estimate, shown.upper].map((text) => Number.parseFloat(text));
        assert.ok(lower < upper && lower <= estimate && estimate <= upper, `${method} ${confidence}: ${shown.interval} ${shown.estimate}`);
        assert.doesNotMatch(JSON.stringify(shown), /NaN|Infinity|undefined/);
      }
    }
  });
});

describe("results wording", () => {
  it("names the interval and its level", () => {
    assert.equal(results.intervalHeading(oneMean()), "95% confidence interval for the population mean (μ)");
    assert.equal(results.intervalHeading(twoProportions()), "95% confidence interval for the difference between the population proportions (p₁ − p₂)");
  });

  it("interprets the interval without presenting the level as a probability for this interval", () => {
    const [first, second] = interpretation(oneMean());
    assert.equal(first, "Using the t interval, the estimated population mean is 72.40, and the 95% confidence interval extends from 67.84 to 76.96.");
    assert.match(second, /^If this sampling procedure were repeated many times, intervals constructed in this way would contain the true value in about 95% of samples\./);
    for (const method of CI_METHODS) {
      const text = [page.intro, page.summary, ...how, ...limits, methods[method].method, ...methods[method].assumptions].join(" ");
      assert.doesNotMatch(text, /\d+% (?:probability|chance|likely)/i, method);
    }
  });

  it("explains an interval that includes 0 without concluding there is no effect", () => {
    assert.equal(zeroNote(twoMeans()), "The interval includes 0, so the data are compatible with both a negative and a positive difference under this interval estimate. That isn't evidence that there is no difference: the interval shows how imprecise the estimate is.");
    assert.match(zeroNote(run("correlation", { r: "0.1", n: "20" })) ?? "", /negative correlation, no correlation and a positive correlation/);
    assert.equal(zeroNote(oneMean()), null);
    assert.equal(zeroNote(paired()), null);
  });

  it("gives an APA reporting sentence for every method", () => {
    assert.equal(reportingSentence(oneMean()), "The mean was 72.40 (95% CI [67.84, 76.96]).");
    assert.equal(reportingSentence(paired()), "The mean difference was 2.40 (95% CI [1.32, 3.48]).");
    assert.equal(reportingSentence(twoMeans()), "The difference between the means (group 1 − group 2) was 1.20 (95% CI [-2.92, 5.32]; Welch's method).");
    assert.equal(reportingSentence(proportion()), "The estimated proportion was 64.0% (95% CI [54.2%, 72.7%]; Wilson score interval).");
    assert.equal(reportingSentence(twoProportions()), "The difference in proportions (group 1 − group 2) was 35.0 percentage points (95% CI [18.3, 48.9]; Newcombe's hybrid score interval).");
    assert.equal(reportingSentence(correlation()), "The correlation was r = .45 (95% CI [.20, .65]; Fisher's z transformation).");
    assert.equal(reportingSentence(oneMean("20", "0.99")), "The mean was 72.40 (99% CI [66.16, 78.64]).");
  });

  it("shows every step of the working, from estimate to bounds", () => {
    assert.deepEqual(working(oneMean()).map((step) => [step.label, step.working]), [
      ["Estimate", "sample mean = 72.40"],
      ["Standard error", "s ÷ √n = 2.18"],
      ["Degrees of freedom", "n − 1 = 19"],
      ["Critical value", "t(0.975, 19) = 2.093"],
      ["Margin of error", "2.093 × 2.18 = 4.56"],
      ["Lower bound", "72.40 − 4.56 = 67.84"],
      ["Upper bound", "72.40 + 4.56 = 76.96"],
    ]);
    assert.match(working(twoMeans()).find((step) => step.label === "Degrees of freedom")?.working ?? "", /^Welch–Satterthwaite: .* = 43\.00$/);
    assert.deepEqual(working(proportion("0", "20")).map((step) => step.label), ["Estimate", "Critical value", "Centre", "Half-width", "Lower bound", "Upper bound"]);
    assert.equal(working(proportion("0", "20")).at(-2)?.working, "0, exactly: with no successes the lower limit is 0");
    assert.equal(working(correlation()).at(-1)?.working, "[tanh(0.1988), tanh(0.7706)] = [0.196, 0.647]");
    const extreme = working(run("two-proportions", { successes1: "9999998", n1: "10000000", successes2: "4999999", n2: "9999999" }));
    assert.doesNotMatch(extreme.map((step) => step.working).join(" "), /\b1\.0+\b/, "no proportion below 1 shown as 1");
  });

  it("announces the interval for screen readers", () => {
    assert.equal(announcements.calculated(oneMean()), "95% confidence interval: 67.84 to 76.96. Estimate: 72.40.");
  });

  it("states that calculations stay in the browser", () => {
    assert.match(page.privacy, /entirely in your browser/);
  });
});

describe("Confidence Intervals guide", () => {
  const blocks = guide.sections.flatMap((section) => section.blocks);
  const text = blocks.map((block) => JSON.stringify(block)).join(" ");
  const table = (caption: string) => {
    const found = blocks.find((block) => block.type === "table" && block.caption.startsWith(caption));
    assert.ok(found && found.type === "table", caption);
    return found;
  };

  it("covers the whole curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-a-ci-is", "point-estimate", "sampling-variability", "confidence-level", "alpha", "standard-error", "margin-of-error", "critical-values",
      "one-mean", "t-intervals", "two-means", "welch", "paired", "proportion", "two-proportions", "correlation", "fisher-z", "interpreting",
      "what-it-does-not-mean", "statistical-significance", "practical-significance", "precision-and-sample-size", "common-mistakes", "assumptions",
      "reporting", "using-the-calculator",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "confidence-intervals");
    assert.ok(guide.relatedToolIds.includes("confidence-interval-calculator"));
  });

  it("gives the calculator's intervals at three confidence levels", () => {
    for (const [level, critical, margin, interval] of table("A sample mean of 72.4").rows) {
      const calculation = oneMean("20", (Number(level.replace("%", "")) / 100).toFixed(2));
      const shown = rows(calculation);
      assert.equal(`t = ${shown["Critical value"].split(" = ")[1]}`, critical, level);
      assert.equal(shown["Margin of error"], margin, level);
      assert.equal(shown["Confidence interval"], interval, level);
    }
  });

  it("gives the calculator's critical values", () => {
    for (const [level, z, t] of table("Two-sided critical values").rows) {
      const confidence = Number(level.replace("%", "")) / 100;
      assert.equal(zCritical(confidence).toFixed(3), z, level);
      assert.equal(tCritical(confidence, 19).toFixed(3), t, level);
    }
  });

  it("gives the calculator's intervals at three sample sizes", () => {
    for (const [n, standardError, margin, interval] of table("A mean of 72.4 with SD 9.75").rows) {
      const shown = rows(oneMean(n));
      assert.deepEqual([shown["Standard error"], shown["Margin of error"], shown["Confidence interval"]], [standardError, margin, interval], n);
    }
  });

  it("matches the calculator in every worked example in the text", () => {
    const mean = rows(oneMean());
    assert.ok(text.includes(`the standard error is 9.75 ÷ √20 = ${mean["Standard error"]}, the critical value is t = 2.093, and the margin of error is 2.093 × ${mean["Standard error"]} = ${mean["Margin of error"]}. The 95% confidence interval is ${mean["Confidence interval"]}`));
    const difference = rows(twoMeans());
    assert.ok(text.includes(`The difference is ${difference.Estimate}, the standard error is ${difference["Standard error"]}, and the 95% confidence interval is ${difference["Confidence interval"]}`));
    const welch = twoMeans().interval.critical;
    assert.ok(welch.distribution === "t" && text.includes(`usually not a whole number: ${fixed(welch.df, 2)} in the example above`));
    assert.ok(text.includes(`the 95% confidence interval is ${display(paired()).interval}`));
    assert.ok(text.includes("For 64 successes in 100, the estimate is 64.0% and the 95% Wilson interval is [54.2%, 72.7%]"));
    assert.match(reportingSentence(proportion()), /\[54\.2%, 72\.7%\]/);
    assert.match(reportingSentence(proportion("0", "20")), /\[0\.0%, 16\.1%\]/);
    assert.ok(text.includes("For 0 successes in 20, the Wilson interval is [0.0%, 16.1%]"));
    // The Wald interval isn't calculated by the tool; check the guide's figures from its formula.
    const se = Math.sqrt((0.64 * 0.36) / 100);
    assert.ok(text.includes(`the Wald interval would be [${((0.64 - zCritical(0.95) * se) * 100).toFixed(1)}%, ${((0.64 + zCritical(0.95) * se) * 100).toFixed(1)}%]`));
    assert.match(reportingSentence(twoProportions()), /35\.0 percentage points \(95% CI \[18\.3, 48\.9\]/);
    assert.ok(text.includes("the difference is 35.0 percentage points, with a 95% confidence interval of [18.3, 48.9] percentage points"));
    assert.ok(text.includes("For r = .45 from 50 pairs, the 95% confidence interval is [.20, .65]"));
    const fisher = correlation().interval;
    assert.ok(fisher.kind === "fisher" && text.includes(`z = ${fisher.z.toFixed(4)} and the standard error is 1 ÷ √47 = ${fisher.standardError.toFixed(4)}`));
  });

  it("gives reporting examples the calculator produces", () => {
    const examples = blocks.find((block) => block.type === "list" && block.items.some((item) => item.startsWith("The mean was")));
    assert.ok(examples && examples.type === "list");
    assert.deepEqual(examples.items, [reportingSentence(oneMean()), reportingSentence(twoMeans()), reportingSentence(proportion()), reportingSentence(correlation())]);
  });

  it("states the correct interpretation and the incorrect one as incorrect", () => {
    assert.match(text, /It doesn't mean there is a 95% probability that the population value lies in this particular interval/);
    assert.match(text, /An interval that includes 0 doesn't show that there is no effect/);
    for (const match of text.matchAll(/95% probability/g)) {
      const before = text.slice(Math.max(0, (match.index ?? 0) - 60), match.index);
      assert.match(before, /doesn't mean there is a|Saying there is a/, before);
    }
  });

  it("cites every source in the text, each a well-formed APA reference", () => {
    const cited = blocks.flatMap((block) => (block.type === "references" ? block.ids : []));
    assert.deepEqual([...cited].sort(), ["apa-2020", ...CONFIDENCE_INTERVAL_REFERENCES.map((reference) => reference.id)].sort());
    const paragraphs = blocks.filter((block) => block.type === "paragraph").map((block) => block.text).join(" ");
    for (const id of cited) {
      const reference = getReference(id);
      assert.ok(paragraphs.includes(`(${reference.cite})`) || paragraphs.includes(reference.cite), `${id} is cited in the text`);
    }
    for (const reference of CONFIDENCE_INTERVAL_REFERENCES) {
      const suffix = /\d{4}([a-z])$/u.exec(reference.cite)?.[1] ?? "";
      assert.ok(reference.apa.includes(`(${reference.year}${suffix}).`), `${reference.id} has its year, with any suffix, after the authors`);
      assert.ok(reference.cite.endsWith(`${reference.year}${suffix}`), reference.id);
      assert.ok(reference.apa.endsWith("."), reference.id);
      assert.equal(referenceRuns(reference).filter((run) => run.italic).length, 1, `${reference.id} has one italic part`);
      assert.ok(!/\d-\d/.test(reference.apa), `${reference.id} uses en dashes`);
      assert.ok(!reference.apa.includes("doi.org"), `${reference.id} stores its DOI separately`);
      if (reference.doi) assert.match(reference.doi, /^10\.\d{4,9}\/\S+$/u, reference.id);
    }
    assert.equal(new Set(CONFIDENCE_INTERVAL_REFERENCES.map((reference) => reference.id)).size, CONFIDENCE_INTERVAL_REFERENCES.length);
  });
});
