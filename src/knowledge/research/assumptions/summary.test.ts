import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAnalysisMethod } from "../data-analysis-types";
import { build } from "../data-analysis-test-helpers";
import { ASSUMPTIONS } from "./catalogue";
import { assumptionChecklist } from "./checklist";
import { ASSUMPTION_METHODS, METHOD_GUIDES } from "./methods";
import { ASSUMPTION_LIMITATIONS, ASSUMPTION_REVIEW_ITEMS, checklistText, methodGuideText } from "./summary";

describe("checklistText", () => {
  const project = build({ variables: [["screen time", "independent", "ratio"], ["sleep quality", "dependent", "ratio"]], hypotheses: [{ form: "relationship", ivs: ["screen time"], dvs: ["sleep quality"] }], design: "correlational", sampling: "cluster", margin: 20 });
  const text = checklistText(assumptionChecklist(project));

  it("lists each method with its verdict and questions, then each assumption's status and note", () => {
    assert.ok(text.startsWith("Assumptions to check before analysis\n\nDescriptive statistics (Strong recommendation; for Describe the participants and each variable)\n"));
    assert.ok(text.includes("Pearson correlation (Possible recommendation; for Hypothesis 1)\n- Interval or ratio measurement: Looks aligned. Screen time and sleep quality are recorded as numeric."));
    assert.ok(text.includes("- Independence of observations: Worth checking. Cluster sampling groups participants"));
    assert.ok(text.includes("- Normality: Worth checking. With a planned sample of 25"));
    assert.ok(text.endsWith("report the checks and any corrections in your method or results section.\n"));
  });

  it("says when there is nothing to check", () => {
    assert.equal(checklistText({ methods: [], notes: [] }), "Assumptions to check before analysis\n\nNo analyses to check yet.\n");
  });
});

describe("methodGuideText", () => {
  for (const method of ASSUMPTION_METHODS) {
    it(`sets out every assumption, alternative, reporting example and mistake for ${method}`, () => {
      const text = methodGuideText(method);
      const guide = METHOD_GUIDES[method];
      assert.ok(text.startsWith(`${getAnalysisMethod(method).name}\n`));
      for (const id of guide.assumptions) {
        const assumption = ASSUMPTIONS[id];
        for (const part of [assumption.name, assumption.statement, `Why it matters: ${assumption.why}`, `If violated: ${assumption.ifViolated}`, ...assumption.thresholds]) assert.ok(text.includes(part), `${method}: ${part}`);
      }
      assert.ok(text.includes(`Reporting\n${guide.reporting}`));
      for (const mistake of guide.mistakes) assert.ok(text.includes(`- ${mistake}`));
      assert.equal(text.includes("Non-parametric alternatives"), guide.nonParametric.length > 0);
    });
  }
});

describe("limitations and review items", () => {
  it("state that the checker doesn't test assumptions, and that thresholds are conventions", () => {
    assert.match(ASSUMPTION_LIMITATIONS[0], /doesn't test assumptions or look at data/);
    assert.ok(ASSUMPTION_LIMITATIONS.some((item) => item.includes("conventions")));
    assert.deepEqual(ASSUMPTION_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Statistical review", "Threshold review", "References", "Reporting style review"]);
  });
});
