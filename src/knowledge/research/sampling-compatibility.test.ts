import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFramework, frameworkFromProject } from "./conceptual-framework";
import { projectOfShape } from "./conceptual-test-helpers";
import { applyDesign } from "./design-summary";
import { EMPTY_DESIGN, chooseDesign } from "./research-design";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { EMPTY_SAMPLING_PLAN, updatePopulation } from "./sampling";
import { SAMPLING_CHECK_IDS, checkSamplingCompatibility, samplingSupport } from "./sampling-compatibility";
import { applySampling } from "./sampling-summary";
import { SAMPLING_TECHNIQUES, SAMPLING_TECHNIQUE_IDS, type SamplingTechniqueId } from "./sampling-types";
import { addVariable, updateVariable } from "./variable-builder";
import { applyVariables } from "./variable-summary";

const quantitative = (() => {
  let project = projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 });
  project = applyFramework(project, frameworkFromProject(project));
  project = updateProjectDraft(project, {
    researchQuestion: "What is the relationship between predictor 1 and outcome 1 among adults?",
    researchObjectives: ["To estimate the prevalence of outcome 1 in the population"],
    researchOnionSelection: { philosophy: "positivism", approach: "deductive", choice: "quantitative", strategy: "survey", timeHorizon: "cross-sectional" },
  });
  project = applyDesign(project, chooseDesign(EMPTY_DESIGN, "correlational"));
  return applySampling(project, updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Adults in Leeds", samplingFrame: "Electoral register" }));
})();
const qualitative = applySampling(
  applyDesign(
    createProjectDraft({
      researchQuestion: "How do carers experience respite services?",
      researchObjectives: ["To explore carers' experiences of respite"],
      researchOnionSelection: { philosophy: "interpretivism", approach: "inductive", choice: "qualitative", strategy: "phenomenology", timeHorizon: "cross-sectional" },
    }),
    chooseDesign(EMPTY_DESIGN, "phenomenology"),
  ),
  updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Unpaid carers", inclusionCriteria: ["Has used respite in the past year"] }),
);
const statuses = (id: SamplingTechniqueId, project: ResearchProjectDraft) => Object.fromEntries(checkSamplingCompatibility(id, project).map((check) => [check.check, check.status]));

describe("checkSamplingCompatibility", () => {
  for (const technique of SAMPLING_TECHNIQUES) {
    it(`explains the ${technique.id} technique against every part of the project, never missing or scored`, () => {
      for (const project of [{}, quantitative, qualitative]) {
        const checks = checkSamplingCompatibility(technique.id, project);
        assert.deepEqual(checks.map((check) => check.check), [...SAMPLING_CHECK_IDS]);
        for (const check of checks) {
          assert.ok(["aligned", "worth-checking", "clarify", "review"].includes(check.status));
          assert.ok(check.explanation.length > 20);
          if (check.status === "clarify") assert.ok(check.justify, `${technique.id} ${check.check} says what to justify`);
        }
      }
    });

    it(`leaves the ${technique.id} technique for review against an empty project, except where no hypotheses is itself a fit`, () => {
      for (const check of checkSamplingCompatibility(technique.id, {})) {
        if (check.check === "hypotheses") continue;
        assert.equal(check.status, "review", check.check);
      }
    });
  }

  it("finds probability techniques aligned with a quantitative, population-level project", () => {
    for (const id of ["simple-random", "systematic", "cluster", "multistage"] as const) {
      const checks = statuses(id, quantitative);
      for (const check of ["question", "design", "philosophy", "choice", "hypotheses", "framework", "population"]) assert.equal(checks[check], "aligned", `${id} ${check}`);
    }
    assert.ok(samplingSupport("simple-random", quantitative).includes("Research design: Correlational"));
    assert.ok(samplingSupport("simple-random", quantitative).includes("Sampling frame: Electoral register"));
  });

  it("finds purposive sampling aligned with a qualitative project, and probability sampling needing clarification there", () => {
    const purposive = statuses("purposive", qualitative);
    for (const check of ["question", "design", "philosophy", "approach", "choice", "strategy", "objectives", "hypotheses", "population"]) assert.equal(purposive[check], "aligned", check);
    const random = statuses("simple-random", qualitative);
    assert.equal(random.design, "clarify");
    assert.equal(random.population, "clarify", "no sampling frame");
  });

  it("explains a probability technique without a sampling frame", () => {
    const check = checkSamplingCompatibility("systematic", qualitative).find((candidate) => candidate.check === "population")!;
    assert.match(check.explanation, /needs a sampling frame: a list of every member of the population/);
    const cluster = checkSamplingCompatibility("cluster", qualitative).find((candidate) => candidate.check === "population")!;
    assert.match(cluster.explanation, /needs a list of groups/);
  });

  it("asks purposive techniques for inclusion criteria", () => {
    const project = applySampling(qualitative, updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Unpaid carers" }));
    assert.equal(statuses("purposive", project).population, "worth-checking");
  });

  it("uses singular wording for techniques in onion checks", () => {
    const philosophy = checkSamplingCompatibility("snowball", quantitative)[2];
    assert.equal(philosophy.explanation, "Snowball sampling isn't usually combined with Positivism. Positivism usually begins from objective measurement.");
    assert.equal(philosophy.justify, "Explain why snowball sampling suits Positivism, or reconsider one of the two.");
  });

  it("asks stratified and quota sampling for a categorical variable to define groups", () => {
    let variables = addVariable([], "year of study", "control");
    assert.equal(statuses("stratified", applyVariables({}, variables)).variables, "worth-checking");
    variables = updateVariable(variables, "var-year-of-study", { measurementLevel: "ordinal" });
    assert.equal(statuses("stratified", applyVariables({}, variables)).variables, "aligned");
    assert.equal(statuses("quota", applyVariables({}, variables)).variables, "aligned");
  });

  it("flags theoretical sampling outside grounded theory", () => {
    assert.equal(statuses("theoretical", qualitative).design, "clarify");
    assert.equal(statuses("theoretical", applyDesign(qualitative, chooseDesign(EMPTY_DESIGN, "grounded-theory"))).design, "aligned");
  });

  it("notes the limits of testing hypotheses on a non-random sample", () => {
    assert.equal(statuses("convenience", quantitative).hypotheses, "worth-checking");
    assert.equal(statuses("snowball", quantitative).hypotheses, "clarify");
  });

  it("checks every technique for a large project quickly", () => {
    const large = updateProjectDraft(projectOfShape({ independent: 6, dependent: 4, mediators: 2, moderators: 2, controls: 3 }), {
      researchObjectives: Array.from({ length: 30 }, (_, index) => `To estimate outcome ${index} in the population`),
    });
    const times = [0, 1, 2].map(() => {
      const start = performance.now();
      for (const id of SAMPLING_TECHNIQUE_IDS) checkSamplingCompatibility(id, large);
      return performance.now() - start;
    });
    assert.ok(Math.min(...times) < 250, `${Math.min(...times).toFixed(0)} ms`);
  });

  it("rejects an unknown technique", () => {
    assert.throws(() => checkSamplingCompatibility("random-walk" as never, {}), RangeError);
  });
});
