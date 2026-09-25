import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RESULT_KINDS, getFields, interpretResult, projectFromTyped, type ResultKind } from "../../knowledge/research";
import { announcements, interpretedAnnouncement, problemsAnnouncement } from "./announcements";
import { exampleLevels, exampleProject, exampleResult } from "./example";
import { BELOW_ONE_THOUSANDTH, readValue, resultFromEntries, type ResultEntries } from "./result-input";

const entries = (kind: ResultKind, texts: Record<string, string>, extra: Partial<ResultEntries> = {}): ResultEntries => ({ kind, texts, variables: ["screen time", "sleep quality"], hypothesisId: "", alpha: 0.05, ...extra });
const project = projectFromTyped(exampleProject, exampleLevels);

describe("readValue", () => {
  it("reads numbers as statistics software prints them", () => {
    assert.deepEqual([readValue("-.34"), readValue("−.34"), readValue("0.002"), readValue("1,200"), readValue(" 3.5 "), readValue("")], [-0.34, -0.34, 0.002, 1200, 3.5, null]);
  });

  it("reads “< .001” as just below one in a thousand", () => {
    assert.deepEqual([readValue("< .001"), readValue("<.001"), readValue("<0.001")], [BELOW_ONE_THOUSANDTH, BELOW_ONE_THOUSANDTH, BELOW_ONE_THOUSANDTH]);
  });

  it("rejects text that isn't a number", () => {
    assert.throws(() => readValue("about .3"), RangeError);
    assert.throws(() => readValue("< .05"), RangeError);
  });
});

describe("resultFromEntries", () => {
  it("keeps only the chosen kind's fields and drops empty ones", () => {
    const { input, unreadable } = resultFromEntries(entries("pearson", { r: "-.34", p: "< .001", n: "", chi2: "4" }));
    assert.deepEqual(input.values, { r: -0.34, p: BELOW_ONE_THOUSANDTH });
    assert.deepEqual(unreadable, []);
    assert.equal(input.hypothesisId, null);
  });

  it("names every field that couldn't be read", () => {
    const { unreadable } = resultFromEntries(entries("independent-t-test", { t: "2.1", df: "fifty", p: "p=.04" }));
    assert.deepEqual(unreadable, [
      { field: "df", message: "Enter the degrees of freedom as a number, such as 0.45." },
      { field: "p", message: "Enter the p-value as a number, such as 0.032." },
    ]);
  });

  it("drops unchosen variables and keeps a chosen hypothesis", () => {
    const { input } = resultFromEntries(entries("pearson", {}, { variables: ["screen time", ""], hypothesisId: "h1" }));
    assert.deepEqual([input.variables, input.hypothesisId], [["screen time"], "h1"]);
  });

  it("gives every kind a field per number it reports", () => {
    for (const kind of RESULT_KINDS) {
      const texts = Object.fromEntries(getFields(kind).map((field) => [field.key, "1"]));
      assert.equal(Object.keys(resultFromEntries(entries(kind, texts)).input.values).length, getFields(kind).length, kind);
    }
  });
});

describe("announcements", () => {
  it("summarise the interpretation, or the problems stopping it", () => {
    const { input } = resultFromEntries(entries(exampleResult.kind, { ...exampleResult.values }));
    const outcome = interpretResult(input, project);
    assert.ok(outcome.ok);
    if (outcome.ok) assert.equal(interpretedAnnouncement(outcome.interpretation, 0.05), "Pearson correlation interpreted: statistically significant at the 5% level. Supports the hypothesis: Hypothesis 1.");
    const mean = interpretResult(resultFromEntries(entries("mean", { mean: "3" })).input, project);
    if (mean.ok) assert.equal(interpretedAnnouncement(mean.interpretation, 0.05), "Mean interpreted: descriptive, with no significance test.");
    assert.equal(problemsAnnouncement(["Enter the p-value."]), "1 problem stops the interpretation. Enter the p-value.");
    assert.equal(problemsAnnouncement(["a", "b"]), "2 problems stop the interpretation. a");
    assert.equal(problemsAnnouncement([]), "");
    assert.equal(announcements.copied, "Interpretation copied.");
  });

  it("describe a non-significant result", () => {
    const outcome = interpretResult(resultFromEntries(entries("pearson", { r: "0.1", p: "0.4" })).input, project);
    if (outcome.ok) assert.equal(interpretedAnnouncement(outcome.interpretation, 0.05), "Pearson correlation interpreted: not statistically significant at the 5% level. Doesn't support the hypothesis: Hypothesis 1.");
  });
});
