import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAnalysisMethod } from "./data-analysis-types";
import { getSpssProcedure, SPSS_PROCEDURES, SPSS_PROCEDURE_METHODS } from "./spss-procedures";

describe("SPSS_PROCEDURES", () => {
  it("maps every supported method to the existing analysis catalogue", () => {
    const required = ["one-sample-t-test", "independent-t-test", "paired-t-test", "chi-square", "chi-square-goodness-of-fit", "pearson", "simple-regression", "multiple-regression", "one-way-anova", "two-way-anova", "ancova"];
    assert.deepEqual(new Set(SPSS_PROCEDURE_METHODS), new Set(required));
    assert.deepEqual(new Set(Object.keys(SPSS_PROCEDURES)), new Set(required));
    for (const method of SPSS_PROCEDURE_METHODS) assert.equal(getAnalysisMethod(method).id, method);
    assert.ok(SPSS_PROCEDURES["chi-square"].procedure.includes("Independence"));
    assert.ok(SPSS_PROCEDURES["chi-square-goodness-of-fit"].procedure.includes("Goodness of Fit"));
  });

  it("gives each procedure an IBM 32 source, menu path, variable roles, outputs, and reporting guidance", () => {
    for (const method of SPSS_PROCEDURE_METHODS) {
      const entry = getSpssProcedure(method);
      assert.equal(entry.method, method);
      assert.match(entry.source, /^https:\/\/www\.ibm\.com\/docs\/en\/spss-statistics\/32\.0\.0\?/);
      assert.ok(entry.menu.length >= 2, method);
      assert.ok(entry.variables.length >= 1, method);
      assert.ok(entry.output.length >= 1, method);
      assert.ok(entry.effectSize.length > 10, method);
      assert.ok(entry.interpretation.includes("Results Interpretation Assistant"), method);
      assert.ok(entry.report.length > 20, method);
      assert.match(entry.editionNote, /version, operating system and licensed edition/);
    }
  });

  it("rejects unknown method IDs instead of guessing a procedure", () => {
    assert.throws(() => getSpssProcedure("unlisted-method" as never), {
      name: "RangeError",
      message: "No SPSS procedure is mapped for analysis method: unlisted-method",
    });
  });
});