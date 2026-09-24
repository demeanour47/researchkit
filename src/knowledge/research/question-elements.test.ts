import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { identifyElements, QUESTION_ELEMENT_IDS, type ElementFinding } from "./question-elements";
import { createProjectDraft } from "./research-project";

const summary = (findings: ElementFinding[]) =>
  Object.fromEntries(findings.map((finding) => [finding.element, `${finding.status}:${finding.value ?? "-"}:${finding.source ?? "-"}`]));

describe("identifyElements from the question's wording", () => {
  it("finds every element in a complete relational question", () => {
    const findings = identifyElements(
      "What is the relationship between screen time and sleep quality among first-year university students in Nepal in 2025?",
      {},
      ["relational"],
    );
    assert.deepEqual(summary(findings), {
      independentVariable: "found:screen time:question",
      dependentVariable: "found:sleep quality:question",
      population: "found:first-year university students:question",
      context: "found:Nepal:question",
      time: "found:in 2025:question",
    });
  });

  it("reads “effect of … on …” and a named setting and period", () => {
    const findings = identifyElements(
      "What is the effect of mindfulness training on anxiety among children at Leeds Primary School over the past year?",
      {},
      ["explanatory"],
    );
    assert.deepEqual(summary(findings), {
      independentVariable: "found:mindfulness training:question",
      dependentVariable: "found:anxiety:question",
      population: "found:children:question",
      context: "found:Leeds Primary School:question",
      time: "found:the past year:question",
    });
  });

  it("reads “does … differ by …” with the outcome first", () => {
    const findings = identifyElements("How does sleep quality differ by year of study among students?", {}, ["comparative"]);
    assert.equal(summary(findings).independentVariable, "found:year of study:question");
    assert.equal(summary(findings).dependentVariable, "found:sleep quality:question");
  });

  it("finds the population of an experience question without “among”", () => {
    const findings = identifyElements("How do nurses experience night shifts in rural hospitals in Kenya during the pandemic?", {}, ["exploratory"]);
    assert.deepEqual(summary(findings), {
      independentVariable: "notNeeded:-:-",
      dependentVariable: "notNeeded:-:-",
      population: "found:nurses:question",
      context: "found:Kenya:question",
      time: "found:during the pandemic:question",
    });
  });

  it("explains why variables aren't expected in an exploratory question", () => {
    const [independent] = identifyElements("How do nurses experience night shifts?", {}, ["exploratory"]);
    assert.equal(independent.expected, false);
    assert.match(independent.explanation, /focus on a phenomenon or a single outcome/);
  });

  it("reports what is missing, and why it matters, without guessing", () => {
    const findings = identifyElements("What is the level of stress?", {}, ["descriptive"]);
    const population = findings.find((finding) => finding.element === "population")!;
    assert.equal(population.status, "missing");
    assert.equal(population.value, null);
    assert.equal(
      population.explanation,
      "No population was found in the question or your project details. The population says who or what you will study. It shapes your sampling, your access and how far your findings apply.",
    );
    const outcome = findings.find((finding) => finding.element === "dependentVariable")!;
    assert.equal(outcome.value, "stress");
    assert.equal(outcome.explanation, "The wording “level of …” suggests “stress” is the dependent variable. This was read from the wording, so check that it is what you mean.");
    assert.equal(findings.find((finding) => finding.element === "independentVariable")!.status, "notNeeded");
  });

  it("reports a missing outcome when the wording names none", () => {
    const outcome = identifyElements("Why do students struggle?", {}, ["explanatory"]).find((finding) => finding.element === "dependentVariable")!;
    assert.equal(outcome.status, "missing");
    assert.match(outcome.explanation, /^No dependent variable was found in the question or your project details\./);
  });

  it("marks context and time as optional", () => {
    const findings = identifyElements("What is the level of stress among nurses?", {}, ["descriptive"]);
    for (const element of ["context", "time"]) {
      const finding = findings.find((candidate) => candidate.element === element)!;
      assert.equal(finding.status, "missing");
      assert.equal(finding.expected, false);
      assert.match(finding.explanation, /optional/);
    }
  });

  it("only ever reports words that appear in the question or the project", () => {
    const questions = [
      "What is the relationship between screen time and sleep quality among first-year university students in Nepal in 2025?",
      "Does social media affect teenagers?",
      "How do nurses experience night shifts in rural hospitals in Kenya during the pandemic?",
      "To what extent are working hours associated with burnout among junior doctors between 2019 and 2023?",
      "Why?",
      "",
    ];
    for (const question of questions) {
      for (const finding of identifyElements(question, {}, ["relational"])) {
        if (finding.value !== null) assert.ok(question.toLowerCase().includes(finding.value.toLowerCase()), `${finding.value} not in ${question}`);
      }
    }
  });

  it("always returns the five elements in order, even for empty input", () => {
    assert.deepEqual(identifyElements("", {}, []).map((finding) => finding.element), [...QUESTION_ELEMENT_IDS]);
  });
});

describe("identifyElements with project details", () => {
  const project = createProjectDraft({
    population: "first-year university students",
    location: "Nepal",
    timeContext: "2025",
    independentVariables: ["screen time", "caffeine"],
    dependentVariables: ["sleep quality"],
  });

  it("recognises details from the project that appear in the question", () => {
    const findings = identifyElements(
      "What is the relationship between screen time and sleep quality among first-year university students in Nepal in 2025?",
      project,
      ["relational"],
    );
    assert.deepEqual(summary(findings), {
      independentVariable: "found:screen time:project",
      dependentVariable: "found:sleep quality:project",
      population: "found:first-year university students:project",
      context: "found:Nepal:project",
      time: "found:2025:project",
    });
    assert.match(findings[0].explanation, /You also listed “caffeine”, which the question doesn't mention\./);
  });

  it("points out project details the question leaves out", () => {
    const findings = identifyElements("What is the level of sleep quality?", project, ["descriptive"]);
    const population = findings.find((finding) => finding.element === "population")!;
    assert.equal(population.status, "notInQuestion");
    assert.equal(population.value, "first-year university students");
    assert.match(population.explanation, /^You entered “first-year university students” as the population, but the question doesn't mention it\./);
  });

  it("notes when the wording names a different variable from the one entered", () => {
    const findings = identifyElements("What is the effect of noise on sleep quality among first-year university students?", project, ["explanatory"]);
    const independent = findings[0];
    assert.equal(independent.status, "found");
    assert.equal(independent.value, "noise");
    assert.match(independent.explanation, /It differs from what you entered \(“screen time” and “caffeine”\); check which you mean\./);
  });
});
