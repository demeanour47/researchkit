import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FIELDS,
  REGIONS,
  REQUIRERS,
  WRITING_TYPES,
  parseAnswers,
  recommendStyle,
  type Answers,
  type Reason,
} from "./style-finder";

const codes = (reasons: readonly Reason[]) => reasons.map((reason) => reason.code);

describe("recommendStyle", () => {
  it("is strong when the field has a standard and the writer chooses freely", () => {
    const result = recommendStyle({ writing: "assignment", field: "psychology-social-sciences", requirer: "nobody" });
    assert.equal(result.primary, "apa");
    assert.equal(result.confidence, "strong");
    assert.equal(result.firstStep, null);
    assert.deepEqual(codes(result.reasons), ["field-standard", "free-choice"]);
  });

  it("never claims certainty when someone else decides the style", () => {
    const result = recommendStyle({ writing: "assignment", field: "engineering-computing", requirer: "instructor" });
    assert.equal(result.primary, "ieee");
    assert.equal(result.confidence, "likely");
    assert.deepEqual(result.firstStep, { code: "check-requirer", requirer: "instructor" });
  });

  it("sends journal authors to the journal's own instructions", () => {
    const result = recommendStyle({ writing: "journal-article", field: "medicine", requirer: "publisher" });
    assert.equal(result.primary, "vancouver");
    assert.deepEqual(result.firstStep, { code: "check-journal" });
    assert.ok(codes(result.reasons).includes("journal-decides"));
    assert.equal(result.confidence, "likely");
  });

  it("asks for a region before recommending a legal style", () => {
    const result = recommendStyle({ writing: "assignment", field: "law", requirer: "nobody" });
    assert.equal(result.primary, null);
    assert.equal(result.confidence, "open");
    assert.deepEqual(codes(result.reasons), ["law-needs-region", "free-choice-consistent"]);
  });

  it("only says a style is what readers expect when one style is recommended", () => {
    for (const writing of WRITING_TYPES)
      for (const field of FIELDS)
        for (const region of [undefined, ...REGIONS]) {
          const result = recommendStyle({ writing, field, requirer: "nobody", region });
          const expected = result.primary ? "free-choice" : "free-choice-consistent";
          assert.ok(codes(result.reasons).includes(expected), JSON.stringify({ writing, field, region }));
        }
  });

  it("recommends each jurisdiction's legal citation guide", () => {
    const expected = { us: "bluebook", canada: "mcgill", "uk-ireland": "oscola", australia: "aglc", "new-zealand": "nzlsg" } as const;
    for (const [region, style] of Object.entries(expected)) {
      const result = recommendStyle({ writing: "assignment", field: "law", requirer: "nobody", region: region as keyof typeof expected });
      assert.equal(result.primary, style, region);
    }
  });

  it("points to a local guide where legal citation varies by country", () => {
    const result = recommendStyle({ writing: "thesis", field: "law", requirer: "university", region: "europe" });
    assert.equal(result.primary, null);
    assert.ok(codes(result.reasons).includes("law-local-guide"));
  });

  it("does not single out one style in the natural sciences", () => {
    const result = recommendStyle({ writing: "assignment", field: "natural-sciences", requirer: "nobody" });
    assert.equal(result.primary, null);
    assert.equal(result.confidence, "open");
    assert.ok(result.alternatives.length > 1);
  });

  it("follows regional practice in business and economics", () => {
    assert.equal(recommendStyle({ writing: "assignment", field: "business-economics", requirer: "nobody", region: "uk-ireland" }).primary, "harvard");
    assert.equal(recommendStyle({ writing: "assignment", field: "business-economics", requirer: "nobody", region: "us" }).primary, "apa");
  });

  it("offers Harvard as an alternative for assignments in Harvard-using regions", () => {
    const result = recommendStyle({ writing: "assignment", field: "psychology-social-sciences", requirer: "nobody", region: "australia" });
    assert.equal(result.primary, "apa");
    assert.ok(result.alternatives.includes("harvard"));
    assert.ok(codes(result.reasons).includes("region-harvard"));
  });

  it("adds Chicago as an option for books and checks the publisher first", () => {
    const result = recommendStyle({ writing: "book", field: "psychology-social-sciences", requirer: "publisher" });
    assert.deepEqual(result.firstStep, { code: "check-publisher" });
    assert.ok(result.alternatives.includes("chicago"));
  });

  it("is never strong for web content", () => {
    const result = recommendStyle({ writing: "web", field: "literature-arts", requirer: "nobody" });
    assert.equal(result.primary, "mla");
    assert.equal(result.confidence, "likely");
  });

  it("tells writers to find out when they don't know who decides", () => {
    const result = recommendStyle({ writing: "assignment", field: "history", requirer: "unknown" });
    assert.deepEqual(result.firstStep, { code: "find-out" });
    assert.equal(result.confidence, "likely");
  });

  it("holds its invariants for every possible combination of answers", () => {
    for (const writing of WRITING_TYPES)
      for (const field of FIELDS)
        for (const requirer of REQUIRERS)
          for (const region of [undefined, ...REGIONS]) {
            const answers: Answers = { writing, field, requirer, region };
            const result = recommendStyle(answers);
            const label = JSON.stringify(answers);
            assert.ok(result.reasons.length > 0, `no reasons: ${label}`);
            assert.ok(!result.alternatives.includes(result.primary as never), `primary repeated: ${label}`);
            assert.equal(new Set(result.alternatives).size, result.alternatives.length, `duplicate alternatives: ${label}`);
            if (result.primary === null) assert.equal(result.confidence, "open", `open without primary: ${label}`);
            if (result.confidence === "strong") assert.equal(result.firstStep, null, `strong despite a first step: ${label}`);
            if (requirer !== "nobody") assert.notEqual(result.confidence, "strong", `strong though someone decides: ${label}`);
          }
  });
});

describe("parseAnswers", () => {
  it("accepts complete, valid answers", () => {
    const parsed = parseAnswers({ writing: "thesis", field: "history", requirer: "university", region: "canada" });
    assert.deepEqual(parsed.answers, { writing: "thesis", field: "history", requirer: "university", region: "canada" });
  });

  it("ignores unknown values and reports what is missing", () => {
    const parsed = parseAnswers({ writing: "poem", field: "history", region: "mars" });
    assert.equal(parsed.answers, null);
    assert.deepEqual(parsed.missing, ["writing", "requirer"]);
    assert.equal(parsed.submitted, true);
  });

  it("treats a first visit as not submitted", () => {
    const parsed = parseAnswers({});
    assert.deepEqual(parsed, { answers: null, missing: [], submitted: false });
  });

  it("uses the first value when a parameter repeats", () => {
    const parsed = parseAnswers({ writing: ["book", "web"], field: "law", requirer: "nobody" });
    assert.equal(parsed.answers?.writing, "book");
  });
});
