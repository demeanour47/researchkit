import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { build } from "../data-analysis-test-helpers";
import { updateProjectDraft, type ResearchProjectDraft } from "../research-project";
import { HYPOTHESIS_STATUS_LABELS, contextLimitations, interpretResult, linkedHypothesis } from "./context";
import { interpretNumbers } from "./interpret";
import { interpretationText, RESULTS_LIMITATIONS, RESULTS_REVIEW_ITEMS } from "./summary";
import { input, VALID } from "./test-helpers";
import { RESULT_KINDS, type ResultInput } from "./types";

const project: ResearchProjectDraft = updateProjectDraft(
  build({
    variables: [
      ["screen time", "independent", "ratio"],
      ["sleep quality", "dependent", "ratio"],
      ["stress", "dependent", "ratio"],
    ],
    hypotheses: [
      { form: "relationship", ivs: ["screen time"], dvs: ["sleep quality"] },
      { form: "relationship", ivs: ["screen time"], dvs: ["stress"] },
    ],
    design: "correlational",
    sampling: "convenience",
    objectives: ["To examine the relationship between screen time and sleep quality", "To describe students' evenings"],
  }),
  { researchQuestion: "What is the relationship between screen time and sleep quality?" },
);

const interpret = (overrides: Partial<ResultInput> = {}, draft = project) => {
  const outcome = interpretResult({ ...input("pearson", { r: -0.34, p: 0.002, n: 120 }), ...overrides }, draft);
  if (!outcome.ok) throw new Error(JSON.stringify(outcome.problems));
  return outcome.interpretation;
};
const directional = (direction: "positive" | "negative") => updateProjectDraft(project, { hypotheses: project.hypotheses!.map((hypothesis) => ({ ...hypothesis, relationship: { ...hypothesis.relationship, direction } })) });

describe("interpretResult", () => {
  it("returns the problems instead of an interpretation for invalid input", () => {
    const outcome = interpretResult(input("pearson", { r: 2 }), project);
    assert.equal(outcome.ok, false);
    assert.deepEqual(!outcome.ok && outcome.problems.map((problem) => problem.field), ["r", "p"]);
  });

  it("interprets every kind in the context of the project", () => {
    for (const kind of RESULT_KINDS) {
      const outcome = interpretResult(input(kind), project);
      assert.ok(outcome.ok, kind);
      if (outcome.ok) {
        assert.ok(outcome.interpretation.objectives.length > 0, kind);
        assert.ok(outcome.interpretation.researchQuestion.length > 0, kind);
        assert.ok(outcome.interpretation.plan.length > 0, kind);
        assert.ok(outcome.interpretation.limitations.length > 0, kind);
        assert.ok(HYPOTHESIS_STATUS_LABELS[outcome.interpretation.hypothesis.status], kind);
      }
    }
  });

  it("works for an empty project", () => {
    const result = interpret({}, {});
    assert.equal(result.hypothesis.status, "unlinked");
    assert.match(result.hypothesis.explanation, /no hypotheses/);
    assert.deepEqual(result.objectives, ["Your project has no objectives recorded, so the result can't be linked to one."]);
    assert.equal(result.plan, "Your project doesn't yet give the analysis plan enough to compare this result with.");
  });
});

describe("connection with the hypothesis", () => {
  it("matches the only hypothesis naming the result's variables", () => {
    const result = interpret();
    assert.deepEqual([result.hypothesis.status, result.hypothesis.label], ["supported", "Hypothesis 1"]);
    assert.match(result.hypothesis.explanation, /^Matched to Hypothesis 1 because it names screen time and sleep quality\. The result supports Hypothesis 1\. Support isn't proof/);
  });

  it("leaves an ambiguous match for the researcher to choose", () => {
    const result = interpret({ variables: ["screen time"] });
    assert.equal(result.hypothesis.status, "unlinked");
    assert.equal(result.hypothesis.explanation, "Choose the hypothesis this result tests to see whether it supports it.");
    assert.equal(linkedHypothesis({ ...input("pearson"), variables: [] }, project), null);
  });

  it("uses the chosen hypothesis, and notes when it names other variables", () => {
    const result = interpret({ hypothesisId: "h2" });
    assert.equal(result.hypothesis.label, "Hypothesis 2");
    assert.match(result.hypothesis.explanation, /Hypothesis 2 doesn't name sleep quality; check it is the right hypothesis\.$/);
    assert.throws(() => interpret({ hypothesisId: "h9" }), { message: "Unknown hypothesis: h9" });
  });

  it("doesn't support a hypothesis when the result isn't significant, without claiming the null is true", () => {
    const result = interpret({ values: { r: 0.1, p: 0.3 } });
    assert.equal(result.hypothesis.status, "not-supported");
    assert.match(result.hypothesis.explanation, /the null hypothesis can't be rejected\. That isn't proof the null hypothesis is true\./);
  });

  it("flags a significant result in the opposite direction to a directional hypothesis", () => {
    const opposite = interpret({}, directional("positive"));
    assert.equal(opposite.hypothesis.status, "opposite");
    assert.match(opposite.hypothesis.explanation, /significant, but negative, while Hypothesis 1 predicted a positive relationship/);
    assert.equal(interpret({}, directional("negative")).hypothesis.status, "supported");
  });

  it("says descriptive and measurement results don't test hypotheses", () => {
    const descriptive = interpretResult(input("mean"), project);
    assert.ok(descriptive.ok && descriptive.interpretation.hypothesis.status === "not-tested");
    const sem = interpretResult(input("sem"), project);
    assert.ok(sem.ok && /path coefficients/.test(sem.interpretation.hypothesis.explanation));
    const factor = interpretResult(input("factor-analysis"), project);
    assert.ok(factor.ok && /checks the measures/.test(factor.interpretation.hypothesis.explanation));
  });
});

describe("connection with objectives and the research question", () => {
  it("names the objectives that mention the result's variables", () => {
    assert.deepEqual(interpret().objectives, ["It addresses the objective “To examine the relationship between screen time and sleep quality”, and gives evidence towards it."]);
    assert.match(interpret({ values: { r: 0.1, p: 0.4 } }).objectives[0], /doesn't give evidence towards it, which is itself a finding to report/);
  });

  it("says when no objective names the variables, or none are chosen", () => {
    assert.deepEqual(interpret({ variables: ["caffeine"] }).objectives, ["No objective names caffeine. Say which objective this result serves, or whether it is additional."]);
    assert.deepEqual(interpret({ variables: [] }).objectives, ["Choose the variables this result concerns to see which objectives it serves."]);
  });

  it("links the result to the research question through its variables", () => {
    assert.equal(interpret().researchQuestion, "It helps answer your research question, “What is the relationship between screen time and sleep quality?”, because it concerns screen time and sleep quality. It gives evidence towards it.");
    assert.match(interpret({ variables: ["stress"] }).researchQuestion, /doesn't name stress, so this result is supporting or additional/);
    assert.match(interpret({}, updateProjectDraft(project, { researchQuestion: null })).researchQuestion, /no research question recorded/);
  });
});

describe("connection with the analysis plan", () => {
  it("says where the analysis sits in the plan made from the same project", () => {
    assert.equal(interpret().plan, "Your analysis plan includes Pearson correlation: Strong recommendation for “Hypothesis 1”; Strong recommendation for “Hypothesis 2”.");
  });

  it("points out analyses the plan doesn't include", () => {
    const chi = interpretResult(input("chi-square"), project);
    assert.ok(chi.ok && chi.interpretation.plan === "Chi-square test of independence isn't in the analysis plan made from your project. Explain why you used it, or check the plan's recommendations.");
  });

  it("recognises families of methods from the plan's overview", () => {
    const correlation = interpretResult(input("correlation"), project);
    assert.ok(correlation.ok && correlation.interpretation.plan === "Your analysis plan draws on Correlation as a family of methods: Strong recommendation.");
  });
});

describe("limitations", () => {
  it("adds the design, sampling and sample size limits to the method's own", () => {
    const limitations = contextLimitations(interpretNumbers(input("pearson", { r: 0.4, p: 0.001, n: 25 })), input("pearson", { r: 0.4, p: 0.001, n: 25 }), project);
    assert.deepEqual(limitations.slice(2), [
      "Your correlational design doesn't manipulate variables, so this result shows association, not cause and effect.",
      "Your sample was drawn by convenience sampling, so the result may not generalise to the wider population.",
      "With 25 participants, the result may not replicate; small samples give imprecise estimates.",
    ]);
  });

  it("doesn't add the causation caveat to non-significant or descriptive results, or to experiments", () => {
    const notSignificant = input("pearson", { r: 0.1, p: 0.4 });
    assert.ok(!contextLimitations(interpretNumbers(notSignificant), notSignificant, project).some((item) => item.includes("association, not cause")));
    const experiment = build({ design: "true-experimental" });
    assert.ok(!contextLimitations(interpretNumbers(input("pearson")), input("pearson"), experiment).some((item) => item.includes("association, not cause")));
    assert.deepEqual(contextLimitations(interpretNumbers(input("mean")), input("mean"), {}), ["Extreme values pull it away from the typical case.", "It can mislead for ordinal answers such as a single rating."]);
  });
});

describe("interpretationText", () => {
  it("sets out every part in order, ready to paste", () => {
    const text = interpretationText(interpret());
    const headings = ["What the statistic means", "The numbers", "Statistical significance", "Size of the effect", "In plain language", "Academic interpretation", "Possible implication", "Connection with the hypothesis", "Connection with the objectives", "Connection with the research question", "In your analysis plan", "Limitations", "Common mistakes to avoid"];
    const positions = headings.map((heading) => text.split("\n").indexOf(heading));
    assert.ok(positions.every((position) => position > 0), String(positions));
    assert.deepEqual([...positions].sort((a, b) => a - b), positions);
    assert.ok(text.startsWith("Pearson correlation\n"));
    assert.ok(text.includes("- r = -.34: A medium negative relationship"));
    assert.ok(text.includes("- p = .002: How surprising"));
    assert.ok(text.includes("Medium (Cohen's conventions for correlations"));
    assert.ok(text.includes("Supports the hypothesis. Matched to Hypothesis 1"));
  });

  it("writes p below .001 without a doubled sign, and includes warnings", () => {
    const text = interpretationText(interpret({ values: { r: 0.95, p: 0.0001, n: 80 } }));
    assert.ok(text.includes("- p < .001: How surprising"));
    assert.ok(text.includes("Check these\n- A correlation this strong"));
  });

  it("leaves out the effect size section when there is none", () => {
    const outcome = interpretResult(input("logistic-regression", VALID["logistic-regression"]), project);
    assert.ok(outcome.ok && !interpretationText(outcome.interpretation).includes("Size of the effect"));
  });
});

describe("limitations and review items", () => {
  it("state that the assistant doesn't calculate, and what needs review", () => {
    assert.match(RESULTS_LIMITATIONS[0], /doesn't calculate statistics/);
    assert.ok(RESULTS_LIMITATIONS.some((item) => item.includes("multiple testing")));
    assert.deepEqual(RESULTS_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Statistical review", "Reporting style review", "References", "Worked examples"]);
  });
});
