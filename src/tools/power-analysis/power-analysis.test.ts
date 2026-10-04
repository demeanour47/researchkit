import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { powerAnalysisGuide as guide } from "../../../content/guides/power-analysis";
import { POWER_REFERENCES, getReference, referenceMarkdown, referenceRuns, referenceText } from "../../knowledge/research/references";
import type { Design, Mode, Tails } from "../../knowledge/statistics/power";
import { calculatePower, type PowerCalculation, type PowerRequest } from "../../knowledge/statistics/power-request";
import { announcements, formatDetectable, formatPower, how, limits, meaning, page, reportingSentence, results } from "./copy";

const run = (design: Design, values: PowerRequest["values"], mode: Mode = "sample-size", tails: Tails = "two-sided") => {
  const calculation = calculatePower({ design, mode, tails, values });
  assert.ok(calculation.ok, JSON.stringify(calculation));
  return calculation as Extract<PowerCalculation, { ok: true }>;
};
const defaults = { alpha: "0.05", power: "0.80" };
const sampleSize = (calculation: Extract<PowerCalculation, { ok: true }>) => {
  assert.equal(calculation.result.kind, "sample-size");
  return calculation.result as Extract<typeof calculation.result, { kind: "sample-size" }>;
};

describe("results wording", () => {
  it("never overstates power, and rounds a detectable effect up", () => {
    assert.equal(formatPower(0.8999), "0.899 (89.9%)");
    assert.equal(formatPower(0.955144), "0.955 (95.5%)");
    assert.equal(formatDetectable(0.56591), "0.566");
    assert.equal(formatDetectable(0.5), "0.500");
  });

  it("describes a required sample as an approximate minimum, with the total and each group", () => {
    const calculation = run("two-means", { ...defaults, effect: "0.5" });
    assert.equal(
      meaning(calculation),
      "Under the assumptions you entered, a minimum of about 128 participants (64 per group) is needed for 80% power to detect an effect of d = 0.5 at α = 0.05 with a two-sided independent-samples t test.",
    );
    assert.equal(announcements.calculated(calculation), "Required sample size: 128, 64 per group.");
  });

  it("fills in the reporting sentence for an a priori analysis only", () => {
    assert.equal(
      reportingSentence(run("two-means", { ...defaults, effect: "0.5" })),
      "An a priori power analysis for a two-sided independent-samples t test indicated that a minimum of 128 participants (64 per group) was required to detect an effect of d = 0.5 with 80% power at α = .05.",
    );
    assert.equal(
      reportingSentence(run("anova", { ...defaults, effect: "0.25", groups: "3" })),
      "An a priori power analysis for a one-way between-groups ANOVA (F test) with 3 groups of equal size indicated that a minimum of 159 participants (53 per group) was required to detect an effect of f = 0.25 with 80% power at α = .05.",
    );
    assert.match(reportingSentence(run("paired-means", { ...defaults, effect: "0.5" })) ?? "", /a minimum of 34 pairs was required/);
    assert.match(reportingSentence(run("anova", { ...defaults, effect: "0.1", groups: "12" })) ?? "", /a minimum of 1,692 participants \(141 per group\) was required/);
    assert.equal(reportingSentence(run("two-means", { alpha: "0.05", effect: "0.5", n: "30" }, "power")), null);
  });

  it("labels power for a sample as planned power, not observed power", () => {
    const calculation = run("two-means", { alpha: "0.05", effect: "0.5", n: "30" }, "power");
    assert.ok(calculation.warnings.includes("observed-power"));
    assert.match(meaning(calculation), /would have a probability of about 47\.7% of detecting an effect of d = 0\.5 .* if that effect exists\.$/);
    assert.match(results.observedPower, /isn't the power of a completed study/);
  });

  it("describes the smallest detectable effect", () => {
    const calculation = run("two-means", { ...defaults, n: "50" }, "effect");
    assert.match(meaning(calculation), /can detect an effect of d = 0\.566 or larger with 80% power/);
    assert.equal(announcements.calculated(calculation), "Smallest detectable effect: d = 0.566.");
  });

  it("states that calculations stay in the browser and never promise an exact requirement", () => {
    assert.match(page.privacy, /entirely in your browser/);
    const text = [page.intro, page.summary, page.privacy, ...how, ...limits].join(" ");
    assert.doesNotMatch(text, /guarantee/i);
  });
});

describe("Power Analysis guide", () => {
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
      "what-power-means", "type-i-error", "type-ii-error", "power-and-beta", "alpha", "effect-size", "sample-size", "a-priori", "common-tests",
      "one-sample-means", "two-means", "paired-means", "proportions", "correlation", "anova", "one-or-two-sided", "allocation",
      "minimum-detectable-effect", "why-effect-size-matters", "larger-samples", "smaller-effects", "assumptions", "practical-significance",
      "observed-power", "reporting", "common-mistakes", "using-the-tool",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "power-analysis");
    assert.ok(guide.relatedToolIds.includes("power-analysis"));
  });

  it("gives the sample sizes the tool gives for the common tests", () => {
    const expected: Record<string, () => Extract<PowerCalculation, { ok: true }>> = {
      "One-sample mean": () => run("one-sample-mean", { ...defaults, effect: "0.5" }),
      "Two independent means": () => run("two-means", { ...defaults, effect: "0.5" }),
      "Paired means": () => run("paired-means", { ...defaults, effect: "0.5" }),
      "One-sample proportion": () => run("one-proportion", { ...defaults, p0: "0.50", p1: "0.65" }),
      "Two independent proportions": () => run("two-proportions", { ...defaults, p1: "0.50", p2: "0.65" }),
      Correlation: () => run("correlation", { ...defaults, r: "0.30", r0: "0" }),
      "One-way ANOVA, 3 groups": () => run("anova", { ...defaults, effect: "0.25", groups: "3" }),
    };
    const rows = table("Required sample size for 80% power").rows;
    assert.equal(rows.length, Object.keys(expected).length);
    for (const [design, , required] of rows) {
      const result = sampleSize(expected[design]());
      const unit = design === "Paired means" ? "pairs" : "participants";
      assert.equal(required, `${result.total} ${unit}${result.perGroup !== null ? ` (${result.perGroup} per group)` : ""}`, design);
    }
  });

  it("gives the sensitivity table the tool gives", () => {
    const result = sampleSize(run("two-means", { ...defaults, effect: "0.5" }));
    assert.deepEqual(
      table("Two independent means, d = 0.5").rows,
      result.sensitivity.map((row) => [row.power.toFixed(2), String(row.n), String(row.total)]),
    );
  });

  it("matches the tool in every worked example in the text", () => {
    const oneSided = sampleSize(run("two-means", { ...defaults, effect: "0.5" }, "sample-size", "one-sided"));
    assert.ok(text.includes(`${oneSided.total} instead of 128`));
    for (const d of ["0.8", "0.5", "0.2"]) assert.ok(text.includes(`d = ${d} needs ${sampleSize(run("two-means", { ...defaults, effect: d })).total}`), d);
    const gPowerOneSample = sampleSize(run("one-sample-mean", { alpha: "0.05", power: "0.95", effect: "0.625" }, "sample-size", "one-sided"));
    assert.equal(gPowerOneSample.n, 30);
    assert.ok(text.includes(`N = 30`) && text.includes(formatPower(gPowerOneSample.achievedPower).slice(0, 5)));
    const gPowerAnova = sampleSize(run("anova", { alpha: "0.05", power: "0.95", effect: "0.25", groups: "10" }));
    assert.ok(text.includes(`need ${gPowerAnova.total} participants, ${gPowerAnova.perGroup} per group`));
    const detectable = run("two-means", { ...defaults, n: "50" }, "effect").result;
    assert.ok(detectable.kind === "effect" && text.includes(`d = ${formatDetectable(detectable.effect)} or larger`));
  });

  it("treats Cohen's benchmarks as conventions and critiques observed power", () => {
    assert.match(text, /last resort/);
    assert.match(text, /Observed, or post hoc, power .* adds no information/);
    assert.doesNotMatch(text, /proves? (?:that )?(?:the|a) study/i);
  });

  it("cites every source in the text, each a well-formed APA reference", () => {
    const cited = blocks.flatMap((block) => (block.type === "references" ? block.ids : []));
    assert.deepEqual([...cited].sort(), ["cohen-1988", ...POWER_REFERENCES.map((reference) => reference.id)].sort());
    const paragraphs = blocks.filter((block) => block.type === "paragraph").map((block) => block.text).join(" ");
    for (const id of cited) {
      const reference = getReference(id);
      assert.ok(reference, id);
      assert.ok(paragraphs.includes(reference.cite), `${id} is cited in the text`);
      assert.ok(reference.apa.includes(`(${reference.year}).`), id);
      assert.ok(reference.apa.endsWith("."), id);
    }
    for (const reference of POWER_REFERENCES) {
      assert.equal(referenceRuns(reference).filter((run) => run.italic).length, 1, reference.id);
      assert.ok(!/\d-\d/.test(reference.apa), `${reference.id} uses en dashes in page ranges`);
    }
  });

  it("keeps the asterisk in G*Power as text, not an italic mark", () => {
    const reference = getReference("faul-2007");
    assert.deepEqual(referenceRuns(reference).map((run) => [run.text, run.italic]), [
      ["Faul, F., Erdfelder, E., Lang, A.-G., & Buchner, A. (2007). G*Power 3: A flexible statistical power analysis program for the social, behavioral, and biomedical sciences. ", false],
      ["Behavior Research Methods, 39", true],
      ["(2), 175–191.", false],
    ]);
    assert.match(referenceText(reference), /^Faul.* G\*Power 3: .*Behavior Research Methods, 39\(2\), 175–191\. https:\/\/doi\.org\/10\.3758\/BF03193146$/);
    assert.ok(referenceMarkdown(getReference("faul-2009")).includes("G\\*Power 3.1"));
  });
});
