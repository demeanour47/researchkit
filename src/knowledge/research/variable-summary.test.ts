import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectOfShape } from "./conceptual-test-helpers";
import { PROJECT_FIELDS, describeProject } from "./research-project";
import { addIndicator, addVariable, updateIndicator, updateVariable } from "./variable-builder";
import { TABLE_HEADINGS, VARIABLE_LIMITATIONS, VARIABLE_REVIEW_ITEMS, applyVariables, draftItems, operationalisation, variableRows, variablesTable } from "./variable-summary";
import { importVariables } from "./variables";
import type { ProjectVariable } from "./variable-types";

const blank = addVariable([], "Job satisfaction", "dependent");
function filled(): ProjectVariable[] {
  let variables = updateVariable(blank, "var-job-satisfaction", {
    conceptualDefinition: "How content employees are with their jobs.",
    operationalDefinition: "The mean of pay satisfaction and workload satisfaction ratings.",
    measurementLevel: "likert",
    measurementScale: "1 = very dissatisfied to 5 = very satisfied",
    questionnaireItems: ["How satisfied are you with your pay?"],
  });
  variables = addIndicator(variables, "var-job-satisfaction", { name: "pay satisfaction", measurement: "Rating", level: "likert" });
  variables = addIndicator(variables, "var-job-satisfaction", { name: "workload satisfaction", level: "likert", scale: "1 to 7" });
  return variables;
}

describe("operationalisation", () => {
  it("shows placeholders for every unknown step, never invented content", () => {
    assert.deepEqual(
      operationalisation(blank[0]).map((step) => [step.label, step.values, step.missing]),
      [
        ["Conceptual definition", ["[conceptual definition]"], true],
        ["Operational definition", ["[operational definition]"], true],
        ["Indicators", ["[indicator]"], true],
        ["Measurement", ["[measurement]"], true],
        ["Scale", ["[scale]"], true],
        ["Possible questionnaire items", ["[questionnaire item]"], true],
      ],
    );
  });

  it("shows the chain from concept to item in the researcher's own words", () => {
    assert.deepEqual(
      operationalisation(filled()[0]).map((step) => step.values),
      [
        ["How content employees are with their jobs."],
        ["The mean of pay satisfaction and workload satisfaction ratings."],
        ["pay satisfaction", "workload satisfaction"],
        ["Likert level", "pay satisfaction: Rating"],
        ["1 = very dissatisfied to 5 = very satisfied", "workload satisfaction: 1 to 7"],
        ["How satisfied are you with your pay?"],
      ],
    );
  });
});

describe("draftItems", () => {
  it("drafts one item structure per indicator, naming only the indicator and answer format", () => {
    assert.deepEqual(draftItems(filled()[0]), [
      "[question about pay satisfaction] — answer: a rating on 1 = very dissatisfied to 5 = very satisfied",
      "[question about workload satisfaction] — answer: a rating on 1 to 7",
    ]);
  });

  it("uses placeholders for the answer format when the level is unknown", () => {
    const variables = addIndicator(blank, "var-job-satisfaction", { name: "pay" });
    assert.deepEqual(draftItems(variables[0]), ["[question about pay] — answer: [measurement]"]);
  });

  it("uses the indicator's own level before the variable's", () => {
    let variables = updateVariable(addIndicator(blank, "var-job-satisfaction", { name: "tenure" }), "var-job-satisfaction", { measurementLevel: "likert" });
    variables = updateIndicator(variables, "var-job-satisfaction", "var-job-satisfaction-ind-1", { level: "ratio" });
    assert.deepEqual(draftItems(variables[0]), ["[question about tenure] — answer: a number in [unit]"]);
  });

  it("drafts nothing without indicators", () => {
    assert.deepEqual(draftItems(blank[0]), []);
  });
});

describe("tables", () => {
  it("lists every variable with placeholders for unknown columns", () => {
    assert.deepEqual(variableRows(blank), [
      {
        id: "var-job-satisfaction",
        name: "Job satisfaction",
        kind: "Dependent variable",
        level: "[measurement]",
        indicators: "[indicator]",
        conceptual: "[conceptual definition]",
        operational: "[operational definition]",
        scale: "[scale]",
      },
    ]);
  });

  it("writes tab-separated text with a heading row, keeping each row on one line", () => {
    const withTab = updateVariable(filled(), "var-job-satisfaction", { notes: "x", conceptualDefinition: "Line one\nline\ttwo" });
    const lines = variablesTable(withTab).split("\n");
    assert.equal(lines.length, 2);
    assert.equal(lines[0], TABLE_HEADINGS.join("\t"));
    assert.equal(lines[1].split("\t").length, TABLE_HEADINGS.length);
    assert.ok(lines[1].includes("Line one line two"));
  });
});

describe("applyVariables", () => {
  const project = projectOfShape({ independent: 2, dependent: 1, mediators: 1, moderators: 1, controls: 1 });

  it("updates only the variables section of the project draft", () => {
    const updated = applyVariables(project, importVariables(project));
    for (const field of PROJECT_FIELDS) if (field !== "variables") assert.deepEqual(updated[field], project[field], field);
    assert.equal(updated.variables?.length, 6);
    assert.equal(project.variables, undefined);
  });

  it("keeps indicators and measurement, and describes the section", () => {
    const updated = applyVariables({}, filled());
    assert.equal(updated.variables?.[0].possibleIndicators.length, 2);
    assert.equal(updated.variables?.[0].measurementLevel, "likert");
    assert.deepEqual(describeProject(updated), [{ field: "variables", label: "Variables", value: "1 variable: Job satisfaction" }]);
  });

  it("clears the section when there are no variables", () => {
    assert.equal(applyVariables(project, []).variables, undefined);
  });

  it("rejects invalid variables and repeated ids", () => {
    const [variable] = filled();
    assert.throws(() => applyVariables({}, [{ ...variable, variableType: "latent" as never }]), { message: "Unknown variable type: latent" });
    assert.throws(() => applyVariables({}, [variable, variable]), { message: "Missing or repeated variable id: var-job-satisfaction" });
    assert.throws(() => applyVariables({}, [{ ...variable, measurementLevel: "x" as never }]), { message: "Unknown measurement level: x" });
    const repeatedIndicator = { ...variable, possibleIndicators: [variable.possibleIndicators[0], variable.possibleIndicators[0]] };
    assert.throws(() => applyVariables({}, [repeatedIndicator]), { message: "Missing or repeated indicator id: var-job-satisfaction-ind-1" });
  });

  it("drops indicators without names when storing", () => {
    const [variable] = filled();
    const stored = applyVariables({}, [{ ...variable, possibleIndicators: [{ ...variable.possibleIndicators[0], name: "  " }] }]);
    assert.deepEqual(stored.variables?.[0].possibleIndicators, []);
  });
});

describe("limitations and review items", () => {
  it("documents limitations, including that nothing is invented or saved", () => {
    const text = VARIABLE_LIMITATIONS.join(" ");
    for (const topic of ["can't write definitions", "reliability or validity", "matching variable names", "Nothing is saved"]) assert.ok(text.includes(topic), topic);
  });

  it("leaves placeholders for academic, measurement, indicator and operational definition review", () => {
    assert.deepEqual(VARIABLE_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Academic review", "Measurement review", "Indicator review", "Operational definition review"]);
  });
});
