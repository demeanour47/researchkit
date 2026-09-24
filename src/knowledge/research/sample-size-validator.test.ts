import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectOfShape } from "./conceptual-test-helpers";
import { applyDesign } from "./design-summary";
import { EMPTY_DESIGN, chooseDesign } from "./research-design";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { DEFAULT_SAMPLE_SIZE_PLAN, chooseMethod, updateInputs, type SampleSizePlan } from "./sample-size";
import { checkInputs, checkSampleSizeCompatibility, inputProblems } from "./sample-size-validator";
import { EMPTY_SAMPLING_PLAN, chooseTechnique, updatePopulation } from "./sampling";
import { applySampling } from "./sampling-summary";
import { addVariable, updateVariable } from "./variable-builder";
import { applyVariables } from "./variable-summary";

const plan = (inputs: Partial<SampleSizePlan["inputs"]> = {}, method: SampleSizePlan["method"] = "cochran") => chooseMethod(updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, inputs), method);
const byCheck = (checks: { check: string; status: string; explanation: string }[]) => Object.fromEntries(checks.map((check) => [check.check, check]));

describe("inputProblems", () => {
  it("finds nothing wrong with the defaults", () => {
    assert.deepEqual(inputProblems(DEFAULT_SAMPLE_SIZE_PLAN), []);
  });

  it("names the input to fix and how", () => {
    assert.deepEqual(inputProblems(plan({ populationType: "finite", populationSize: null })), [{ input: "populationSize", message: "Enter the population size, or choose an unknown population." }]);
    assert.deepEqual(inputProblems(plan({}, "krejcie-morgan")).map((problem) => problem.message), ["Krejcie and Morgan needs a known population size. Enter one, or choose another method."]);
    assert.deepEqual(
      inputProblems(plan({ margin: -1, proportion: 100, responseRate: 0, designEffect: Number.NaN })).map((problem) => problem.input),
      ["margin", "proportion", "responseRate", "designEffect"],
    );
    assert.match(inputProblems(plan({ proportion: 0 }))[0].message, /no variation to estimate/);
  });
});

describe("checkInputs", () => {
  it("reports nothing extra for a plain, complete plan", () => {
    assert.deepEqual(checkInputs(plan({ responseRate: 60 })), []);
  });

  it("gives no checks while the inputs have problems", () => {
    assert.deepEqual(checkInputs(plan({ margin: 0 })), []);
  });

  it("explains that Yamane's formula ignores the confidence and proportion entered", () => {
    const [fixed] = checkInputs(plan({ populationType: "finite", populationSize: 1000, confidence: 99, responseRate: 60 }, "yamane"));
    assert.equal(fixed.status, "clarify");
    assert.match(fixed.explanation, /the 99% confidence and 50% proportion you entered aren't used/);
  });

  it("notes when the Krejcie and Morgan result won't match the published table", () => {
    assert.equal(byCheck(checkInputs(plan({ populationType: "finite", populationSize: 1000, margin: 3, responseRate: 60 }, "krejcie-morgan"))).table.status, "review");
  });

  it("points out the finite population correction when a known population is used with Cochran's formula", () => {
    const fpc = byCheck(checkInputs(plan({ populationType: "finite", populationSize: 1000, responseRate: 60 }))).fpc;
    assert.equal(fpc.explanation, "Your population is known (1000). The finite population correction would reduce the sample to 278.");
  });

  it("flags a wide margin, an unusual design effect, a missing response rate and a sample larger than the population", () => {
    const checks = byCheck(checkInputs(plan({ margin: 15, designEffect: 0.8, populationType: "finite", populationSize: 50 }, "finite-population-correction")));
    assert.equal(checks.margin.status, "worth-checking");
    assert.equal(checks["design-effect"].status, "worth-checking");
    assert.equal(checks.response.status, "review");
    const big = byCheck(checkInputs(plan({ populationType: "finite", populationSize: 100, responseRate: 40 }, "finite-population-correction")));
    assert.equal(big.exceeds.status, "clarify");
    assert.match(big.exceeds.explanation, /Consider inviting everyone \(a census\)/);
  });

  it("explains that power analysis isn't available here", () => {
    assert.match(checkInputs(plan({}, "power-analysis"))[0].explanation, /isn't available in this calculator yet/);
  });
});

describe("checkSampleSizeCompatibility", () => {
  const statuses = (project: ResearchProjectDraft, candidate: SampleSizePlan = plan()) => Object.fromEntries(checkSampleSizeCompatibility(candidate, project).map((check) => [check.check, check.status]));

  it("leaves everything for review in an empty project, except that no hypotheses suits a precision formula", () => {
    assert.deepEqual(statuses({}), { design: "review", technique: "review", population: "review", objectives: "review", variables: "review", hypotheses: "aligned" });
  });

  it("finds a survey estimating a proportion from a random sample aligned", () => {
    let project = createProjectDraft({ researchObjectives: ["To estimate the prevalence of poor sleep among students"] });
    project = applyDesign(project, chooseDesign(EMPTY_DESIGN, "survey"));
    project = applySampling(project, chooseTechnique(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Students", samplingFrame: "Enrolment list" }), "simple-random"));
    project = applyVariables(project, updateVariable(addVariable([], "poor sleep", "dependent"), "var-poor-sleep", { measurementLevel: "binary" }));
    const candidate = plan({ populationType: "finite", populationSize: 4000 }, "finite-population-correction");
    assert.deepEqual(statuses(project, candidate), { design: "aligned", technique: "aligned", population: "aligned", objectives: "aligned", variables: "aligned", hypotheses: "aligned" });
    const population = checkSampleSizeCompatibility(candidate, project).find((check) => check.check === "population")!;
    assert.deepEqual(population.supports, ["Target population: Students", "Sampling frame: Enrolment list"]);
  });

  it("asks for clarification of a qualitative design or a non-random technique", () => {
    const qualitative = applyDesign({}, chooseDesign(EMPTY_DESIGN, "phenomenology"));
    assert.equal(statuses(qualitative).design, "clarify");
    const purposive = applySampling({}, chooseTechnique(EMPTY_SAMPLING_PLAN, "purposive"));
    assert.equal(statuses(purposive).technique, "clarify");
  });

  it("asks cluster sampling for a design effect above 1", () => {
    const cluster = applySampling({}, chooseTechnique(EMPTY_SAMPLING_PLAN, "cluster"));
    assert.equal(statuses(cluster).technique, "worth-checking");
    assert.equal(statuses(cluster, plan({ designEffect: 1.8 })).technique, "aligned");
  });

  it("points hypothesis-testing projects towards power analysis", () => {
    let project = updateProjectDraft(projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 }), { researchObjectives: ["To test the effect of predictor 1 on outcome 1"] });
    project = applyDesign(project, chooseDesign(EMPTY_DESIGN, "true-experimental"));
    const precision = statuses(project);
    assert.deepEqual([precision.design, precision.objectives, precision.hypotheses], ["worth-checking", "worth-checking", "worth-checking"]);
    const power = statuses(project, plan({}, "power-analysis"));
    assert.deepEqual([power.design, power.objectives, power.hypotheses], ["aligned", "aligned", "aligned"]);
  });

  it("notes that numeric outcomes need a standard deviation", () => {
    const project = applyVariables({}, updateVariable(addVariable([], "hours slept", "dependent"), "var-hours-slept", { measurementLevel: "ratio" }));
    const variables = checkSampleSizeCompatibility(plan(), project).find((check) => check.check === "variables")!;
    assert.equal(variables.status, "worth-checking");
    assert.match(variables.explanation, /needs its standard deviation/);
  });

  it("checks the population count against the sampling frame", () => {
    const withFrame = applySampling({}, updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Staff", samplingFrame: "HR list" }));
    assert.equal(statuses(withFrame).population, "worth-checking", "unknown population despite a frame");
    const noFrame = applySampling({}, updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Staff" }));
    assert.equal(statuses(noFrame, plan({ populationType: "finite", populationSize: 300 })).population, "worth-checking");
  });

  it("never scores or uses the Missing status", () => {
    for (const check of checkSampleSizeCompatibility(plan(), projectOfShape({ independent: 2, dependent: 1, mediators: 0, moderators: 0 }))) {
      assert.notEqual(check.status, "missing");
      assert.ok(!/\bscore|rank/i.test(check.explanation));
    }
  });
});
