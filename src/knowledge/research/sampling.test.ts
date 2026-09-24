import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_POPULATION,
  EMPTY_SAMPLING_PLAN,
  POPULATION_LABELS,
  answerSamplingQuestion,
  chooseTechnique,
  cleanSamplingPlan,
  parseResponseRate,
  removeTechnique,
  setPlanText,
  setResponseRate,
  shortlistTechnique,
  updatePopulation,
} from "./sampling";

describe("population builder", () => {
  it("defines every part of the population", () => {
    assert.deepEqual(Object.values(POPULATION_LABELS), [
      "Target population",
      "Accessible population",
      "Sampling frame",
      "Unit of analysis",
      "Unit of observation",
      "Geographical coverage",
      "Inclusion criteria",
      "Exclusion criteria",
      "Sampling location",
    ]);
    assert.deepEqual(Object.keys(EMPTY_POPULATION), Object.keys(POPULATION_LABELS));
  });

  it("updates fields and replaces criteria lists, leaving the rest unchanged", () => {
    const plan = updatePopulation(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "Nurses in England", inclusionCriteria: ["Registered"] }), { inclusionCriteria: ["Registered", "Works nights"] });
    assert.deepEqual(plan.population, { ...EMPTY_POPULATION, targetPopulation: "Nurses in England", inclusionCriteria: ["Registered", "Works nights"] });
    assert.deepEqual(EMPTY_SAMPLING_PLAN.population, EMPTY_POPULATION, "the original is unchanged");
  });
});

describe("choosing techniques", () => {
  it("shortlists once each and never chooses on its own", () => {
    const plan = shortlistTechnique(shortlistTechnique(shortlistTechnique(EMPTY_SAMPLING_PLAN, "stratified"), "quota"), "stratified");
    assert.deepEqual([plan.shortlist, plan.chosen], [["stratified", "quota"], null]);
  });

  it("records the researcher's choice, and clears it when the technique is removed", () => {
    const plan = chooseTechnique(shortlistTechnique(EMPTY_SAMPLING_PLAN, "quota"), "purposive");
    assert.deepEqual([plan.chosen, plan.shortlist], ["purposive", ["quota", "purposive"]]);
    assert.equal(removeTechnique(plan, "purposive").chosen, null);
    assert.equal(removeTechnique(plan, "quota").chosen, "purposive");
    assert.equal(chooseTechnique(plan, null).chosen, null);
  });

  it("rejects unknown techniques", () => {
    assert.throws(() => shortlistTechnique(EMPTY_SAMPLING_PLAN, "random-walk" as never), RangeError);
    assert.throws(() => chooseTechnique(EMPTY_SAMPLING_PLAN, "random-walk" as never), RangeError);
  });
});

describe("plan details", () => {
  it("records the reason, procedure, biases, mitigation and notes", () => {
    let plan = EMPTY_SAMPLING_PLAN;
    for (const field of ["reason", "selectionProcedure", "potentialBiases", "mitigation", "notes"] as const) plan = setPlanText(plan, field, `${field} text`);
    assert.deepEqual([plan.reason, plan.selectionProcedure, plan.potentialBiases, plan.mitigation, plan.notes], ["reason text", "selectionProcedure text", "potentialBiases text", "mitigation text", "notes text"]);
  });

  it("parses response rates typed with or without a percent sign", () => {
    assert.equal(parseResponseRate("70"), 70);
    assert.equal(parseResponseRate(" 62.5 % "), 62.5);
    assert.equal(parseResponseRate("0"), 0);
    assert.equal(parseResponseRate("100%"), 100);
    assert.equal(parseResponseRate("  "), null);
  });

  it("rejects response rates that aren't percentages", () => {
    for (const text of ["-5", "101", "seventy", "70%%"]) assert.throws(() => parseResponseRate(text), { message: "Enter a percentage between 0 and 100." }, text);
    assert.throws(() => setResponseRate(EMPTY_SAMPLING_PLAN, 120), RangeError);
    assert.equal(setResponseRate(EMPTY_SAMPLING_PLAN, null).expectedResponseRate, null);
  });

  it("records and clears decision answers", () => {
    const plan = answerSamplingQuestion(answerSamplingQuestion(EMPTY_SAMPLING_PLAN, "inference", "yes"), "referral", "no");
    assert.deepEqual(plan.answers, { inference: "yes", referral: "no" });
    assert.deepEqual(answerSamplingQuestion(plan, "inference", undefined).answers, { referral: "no" });
    assert.throws(() => answerSamplingQuestion(plan, "inference", "maybe" as never), RangeError);
  });
});

describe("cleanSamplingPlan", () => {
  it("treats an empty plan as nothing to store", () => {
    assert.equal(cleanSamplingPlan(EMPTY_SAMPLING_PLAN), undefined);
    assert.equal(cleanSamplingPlan(updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "  ", inclusionCriteria: [" "] })), undefined);
  });

  it("trims text, removes empty and repeated criteria, and shortlists the chosen technique", () => {
    let plan = updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "  Nurses  in England ", inclusionCriteria: ["Registered", "Registered", " "] });
    plan = { ...plan, chosen: "purposive" };
    const cleaned = cleanSamplingPlan(plan)!;
    assert.equal(cleaned.population.targetPopulation, "Nurses in England");
    assert.deepEqual(cleaned.population.inclusionCriteria, ["Registered"]);
    assert.deepEqual(cleaned.shortlist, ["purposive"]);
  });

  it("keeps a response rate of zero", () => {
    assert.equal(cleanSamplingPlan(setResponseRate(EMPTY_SAMPLING_PLAN, 0))?.expectedResponseRate, 0);
  });

  it("rejects an invalid technique, answer or rate", () => {
    assert.throws(() => cleanSamplingPlan({ ...EMPTY_SAMPLING_PLAN, shortlist: ["x" as never] }), RangeError);
    assert.throws(() => cleanSamplingPlan({ ...EMPTY_SAMPLING_PLAN, expectedResponseRate: 150 }), RangeError);
    assert.throws(() => cleanSamplingPlan({ ...EMPTY_SAMPLING_PLAN, answers: { inference: "maybe" as never } }), RangeError);
  });
});
