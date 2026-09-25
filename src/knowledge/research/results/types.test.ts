import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ANALYSIS_METHOD_IDS } from "../data-analysis-types";
import { VALID } from "./test-helpers";
import { RESULT_FIELDS, RESULT_KINDS, SIGNIFICANCE_LEVELS, getFields, type ResultKind } from "./types";

describe("RESULT_KINDS", () => {
  it("supports the 22 results the assistant interprets, all analysis methods the recommender knows", () => {
    assert.equal(RESULT_KINDS.length, 22);
    for (const kind of RESULT_KINDS) assert.ok(ANALYSIS_METHOD_IDS.includes(kind), kind);
  });

  it("offers the three usual significance levels, 5% first", () => {
    assert.deepEqual([...SIGNIFICANCE_LEVELS], [0.05, 0.01, 0.1]);
  });

  it("rejects an unknown kind", () => {
    assert.throws(() => getFields("anova" as ResultKind), { name: "RangeError", message: "Unknown result kind: anova" });
  });
});

describe("RESULT_FIELDS", () => {
  for (const kind of RESULT_KINDS) {
    it(`describes every number to enter for ${kind}`, () => {
      const fields = RESULT_FIELDS[kind];
      assert.ok(fields.some((field) => field.required), "at least one required number");
      assert.equal(new Set(fields.map((field) => field.key)).size, fields.length, "keys are unique");
      for (const field of fields) {
        assert.ok(field.label && field.symbol && field.hint.endsWith("."), field.key);
        if (field.min !== undefined && field.max !== undefined) assert.ok(field.min < field.max, field.key);
      }
      assert.deepEqual(Object.keys(VALID[kind]).sort(), fields.filter((field) => field.required).map((field) => field.key).sort(), "the test fixture gives exactly the required numbers");
    });
  }

  it("keeps every p-value between 0 and 1", () => {
    for (const kind of RESULT_KINDS) {
      for (const field of RESULT_FIELDS[kind].filter((candidate) => candidate.symbol === "p")) assert.deepEqual([field.min, field.max], [0, 1], `${kind}.${field.key}`);
    }
  });

  it("keeps coefficients bounded where they must be", () => {
    const bounds = (kind: ResultKind, key: string) => {
      const field = RESULT_FIELDS[kind].find((candidate) => candidate.key === key)!;
      return [field.min, field.max];
    };
    assert.deepEqual(bounds("pearson", "r"), [-1, 1]);
    assert.deepEqual(bounds("cronbach-alpha", "alpha"), [undefined, 1], "alpha can be negative");
    assert.deepEqual(bounds("multiple-regression", "r2"), [0, 1]);
    assert.deepEqual(bounds("percentage", "percentage"), [0, 100]);
    assert.equal(RESULT_FIELDS["logistic-regression"].find((field) => field.key === "oddsRatio")?.minExclusive, true, "an odds ratio must be above 0");
  });
});
