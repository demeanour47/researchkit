import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createProjectDraft } from "./research-project";
import { EMPTY_SAMPLING_PLAN, answerSamplingQuestion, chooseTechnique, setPlanText, setResponseRate, shortlistTechnique, updatePopulation, type SamplingPlan } from "./sampling";
import { applySampling } from "./sampling-summary";
import { SHORT_REASON_WORDS, validateSamplingPlan } from "./sampling-validator";

const byCheck = (plan: SamplingPlan, project = applySampling({}, plan)) => Object.fromEntries(validateSamplingPlan(plan, project).map((check) => [check.check, check]));
const reason = (name: string) => `${name} sampling suits this study because the question concerns the whole population of registered nurses, the register lists every nurse, and random selection allows the results to be generalised with a known margin of error.`;

describe("validateSamplingPlan", () => {
  it("asks for the population, unit and criteria before anything else", () => {
    const checks = byCheck(EMPTY_SAMPLING_PLAN);
    assert.deepEqual(Object.keys(checks), ["population", "unit", "criteria", "choice"]);
    assert.match(checks.population.explanation, /target population/);
    assert.match(checks.choice.explanation, /haven't chosen or shortlisted/);
  });

  it("distinguishes the target and accessible populations", () => {
    assert.match(byCheck(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Nurses" })).population.explanation, /accessible population/);
    assert.equal(byCheck(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Nurses", accessiblePopulation: "Nurses in two trusts" })).population.status, "aligned");
  });

  it("counts criteria in words, singular and plural", () => {
    const plan = updatePopulation(EMPTY_SAMPLING_PLAN, { inclusionCriteria: ["Registered", "Works nights"], exclusionCriteria: ["Agency staff"] });
    assert.equal(byCheck(plan).criteria.explanation, "You have listed 2 inclusion criteria and 1 exclusion criterion.");
  });

  it("leaves the choice to the researcher", () => {
    assert.match(byCheck(shortlistTechnique(EMPTY_SAMPLING_PLAN, "quota")).choice.explanation, /That is your decision/);
  });

  it("asks a probability technique for its sampling frame and random procedure", () => {
    let plan = setPlanText(chooseTechnique(EMPTY_SAMPLING_PLAN, "simple-random"), "selectionProcedure", "Pick names from the list.");
    assert.equal(byCheck(plan).frame.status, "clarify");
    assert.equal(byCheck(plan).procedure.status, "worth-checking");
    plan = setPlanText(updatePopulation(plan, { samplingFrame: "Nursing register" }), "selectionProcedure", "Select 400 names using a random number generator.");
    assert.equal(byCheck(plan).frame.status, "aligned");
    assert.equal(byCheck(plan).procedure.status, "aligned");
    assert.equal(byCheck(chooseTechnique(EMPTY_SAMPLING_PLAN, "snowball")).frame, undefined, "no frame check for techniques without one");
  });

  it("asks for a reason long enough to explain, that names the technique", () => {
    const plan = chooseTechnique(EMPTY_SAMPLING_PLAN, "simple-random");
    assert.match(byCheck(setPlanText(plan, "reason", "It fits.")).reason.explanation, /^Your reason is 2 words\./);
    assert.match(byCheck(setPlanText(plan, "reason", reason("Random"))).reason.explanation, /doesn't name the technique/);
    assert.equal(byCheck(setPlanText(plan, "reason", reason("Simple random"))).reason.status, "aligned");
    assert.ok(SHORT_REASON_WORDS >= 20);
  });

  it("works out how many people to invite from the response rate", () => {
    const plan = setResponseRate(chooseTechnique(EMPTY_SAMPLING_PLAN, "convenience"), 50);
    assert.match(byCheck(plan).response.explanation, /^At 50%, you would need to invite about 200 people for every 100 participants\./);
    assert.equal(byCheck(plan).response.status, "worth-checking", "non-response bias isn't yet considered");
    assert.match(byCheck(setResponseRate(plan, 0)).response.explanation, /nobody you invite would take part/);
    assert.equal(byCheck(setPlanText(plan, "potentialBiases", "Non-responders may be busier.")).response.status, "review");
  });

  it("asks for mitigation once biases are described", () => {
    let plan = setPlanText(chooseTechnique(EMPTY_SAMPLING_PLAN, "volunteer"), "potentialBiases", "Volunteers may be more motivated.");
    assert.equal(byCheck(plan).bias.status, "worth-checking");
    plan = setPlanText(plan, "mitigation", "Compare volunteers' characteristics with the population's.");
    assert.equal(byCheck(plan).bias.status, "aligned");
  });

  it("reports compatibility problems and differences from the answers", () => {
    const project = createProjectDraft({ researchOnionSelection: { philosophy: "positivism", choice: "quantitative" } });
    const plan = answerSamplingQuestion(chooseTechnique(EMPTY_SAMPLING_PLAN, "snowball"), "inference", "yes");
    const checks = byCheck(plan, applySampling(project, plan));
    assert.equal(checks.compatibility.status, "clarify");
    assert.equal(checks.answers.explanation, "Snowball sampling doesn't support statistical inference, because selection isn't random.");
  });

  it("never uses the Missing status", () => {
    for (const plan of [EMPTY_SAMPLING_PLAN, chooseTechnique(EMPTY_SAMPLING_PLAN, "cluster")]) {
      for (const check of validateSamplingPlan(plan, {})) assert.notEqual(check.status, "missing");
    }
  });
});
