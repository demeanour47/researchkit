import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addVariable as addBox, applyFramework, frameworkFromProject } from "./conceptual-framework";
import { projectOfShape } from "./conceptual-test-helpers";
import { EMPTY_FRAMEWORK } from "./conceptual-types";
import type { CheckStatus } from "./hypothesis-checks";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { addIndicator, addVariable, changeVariableKind, updateIndicator, updateVariable } from "./variable-builder";
import { VARIABLE_CHECK_IDS, validateSet, validateVariable } from "./variable-validator";
import { importVariables } from "./variables";
import type { ProjectVariable } from "./variable-types";

const statusOf = (variables: ProjectVariable[], id: string, project: ResearchProjectDraft = {}) =>
  Object.fromEntries(validateVariable(variables.find((variable) => variable.id === id)!, variables, project).map((check) => [check.check, check])) as Record<
    string,
    { status: CheckStatus; explanation: string }
  >;

function complete(): ProjectVariable[] {
  let variables = addVariable(addVariable([], "Screen time", "independent"), "Sleep quality", "dependent");
  variables = updateVariable(variables, "var-screen-time", {
    conceptualDefinition: "Time spent using screen devices.",
    operationalDefinition: "Hours of weekday use and weekend use in a seven-day diary.",
    measurementLevel: "ratio",
    measurementScale: "Hours per day, 0 to 24",
  });
  variables = addIndicator(variables, "var-screen-time", { name: "weekday use", measurement: "Diary", level: "ratio" });
  variables = addIndicator(variables, "var-screen-time", { name: "weekend use", measurement: "Diary", level: "continuous" });
  return variables;
}

describe("validateVariable", () => {
  it("runs every check in a fixed order, each with an explanation", () => {
    const checks = validateVariable(complete()[0], complete(), {});
    assert.deepEqual(checks.map((check) => check.check), [...VARIABLE_CHECK_IDS]);
    for (const check of checks) assert.ok(check.explanation.length > 20, check.check);
  });

  it("finds a fully operationalised variable consistent", () => {
    const checks = statusOf(complete(), "var-screen-time");
    for (const id of ["duplicate", "indicators", "measurement", "operational"]) assert.equal(checks[id].status, "aligned", id);
    assert.equal(checks.conceptual.status, "review", "a definition is always left for the researcher to check against the literature");
  });

  it("reports everything missing from a new variable", () => {
    const checks = statusOf(complete(), "var-sleep-quality");
    for (const id of ["indicators", "measurement", "conceptual", "operational"]) assert.equal(checks[id].status, "missing", id);
  });

  it("finds duplicate names and short names", () => {
    const named = addVariable(complete(), "screen time", "control");
    assert.equal(statusOf(named, "var-screen-time").duplicate.status, "worth-checking");
    const short = updateVariable(complete(), "var-sleep-quality", { shortName: "Screen time" });
    assert.match(statusOf(short, "var-sleep-quality").duplicate.explanation, /same short name/);
  });

  it("finds duplicate indicators, within a variable and shared with another", () => {
    const repeated = addIndicator(complete(), "var-screen-time", { name: "Weekday use" });
    assert.match(statusOf(repeated, "var-screen-time").indicators.explanation, /“weekday use” is listed more than once/);
    const shared = addIndicator(complete(), "var-sleep-quality", { name: "weekend use" });
    assert.match(statusOf(shared, "var-sleep-quality").indicators.explanation, /also measures another variable/);
  });

  it("asks for clarification when an indicator's level can't combine with the variable's", () => {
    const clashing = updateIndicator(complete(), "var-screen-time", "var-screen-time-ind-2", { level: "nominal" });
    const measurement = statusOf(clashing, "var-screen-time").measurement;
    assert.equal(measurement.status, "clarify");
    assert.match(measurement.explanation, /“weekend use” is measured at a level that doesn't combine/);
  });

  it("leaves rated items combined into a numerical variable for review", () => {
    const rated = updateIndicator(complete(), "var-screen-time", "var-screen-time-ind-2", { level: "likert" });
    assert.equal(statusOf(rated, "var-screen-time").measurement.status, "review");
  });

  it("asks for each indicator's measurement and for the scale", () => {
    const unmeasured = updateIndicator(complete(), "var-screen-time", "var-screen-time-ind-1", { measurement: "" });
    assert.match(statusOf(unmeasured, "var-screen-time").measurement.explanation, /Say how “weekday use” will be measured/);
    const noScale = updateVariable(complete(), "var-screen-time", { measurementScale: "" });
    assert.equal(statusOf(noScale, "var-screen-time").measurement.status, "missing");
  });

  it("asks for the points of a rating scale", () => {
    let rated = updateVariable(complete(), "var-screen-time", { measurementLevel: "likert", measurementScale: "agreement" });
    rated = updateIndicator(updateIndicator(rated, "var-screen-time", "var-screen-time-ind-1", { level: "likert" }), "var-screen-time", "var-screen-time-ind-2", { level: "likert" });
    assert.match(statusOf(rated, "var-screen-time").measurement.explanation, /how many points/);
    assert.equal(statusOf(updateVariable(rated, "var-screen-time", { measurementScale: "1 to 5 agreement" }), "var-screen-time").measurement.status, "aligned");
  });

  it("flags open-ended main variables in a quantitative design", () => {
    const open = updateVariable(complete(), "var-screen-time", { measurementLevel: "open-ended" });
    const openIndicators = updateIndicator(updateIndicator(open, "var-screen-time", "var-screen-time-ind-1", { level: null }), "var-screen-time", "var-screen-time-ind-2", { level: null });
    assert.equal(statusOf(openIndicators, "var-screen-time", createProjectDraft({ methodology: "quantitative" })).measurement.status, "worth-checking");
    assert.equal(statusOf(openIndicators, "var-screen-time", createProjectDraft({ methodology: "qualitative" })).measurement.status, "aligned");
  });

  it("checks that the operational definition follows the conceptual one and its indicators", () => {
    const noConcept = updateVariable(complete(), "var-screen-time", { conceptualDefinition: "" });
    assert.equal(statusOf(noConcept, "var-screen-time").operational.status, "clarify");
    const unrelated = updateVariable(complete(), "var-screen-time", { operationalDefinition: "Measured by a phone app." });
    assert.equal(statusOf(unrelated, "var-screen-time").operational.status, "worth-checking");
  });

  describe("alignment with the project", () => {
    const project = updateProjectDraft(projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 1, controls: 1 }), {
      researchQuestion: "How does predictor 1 affect outcome 1?",
      researchObjectives: ["To examine whether predictor 1 predicts outcome 1"],
    });
    const withFramework = applyFramework(project, frameworkFromProject(project));
    const variables = importVariables(withFramework);

    it("finds imported variables aligned with the question, objectives, hypotheses and framework", () => {
      const checks = statusOf(variables, "var-predictor-1", withFramework);
      for (const id of ["question", "objectives", "hypotheses", "framework"]) assert.equal(checks[id].status, "aligned", id);
    });

    it("leaves background variables for review when the question and objectives don't name them", () => {
      const checks = statusOf(variables, "var-control-1", withFramework);
      assert.equal(checks.question.status, "review");
      assert.equal(checks.objectives.status, "review");
      assert.equal(checks.hypotheses.status, "aligned", "hypotheses list it as a control");
    });

    it("asks for clarification when the type disagrees with the hypotheses and framework", () => {
      const changed = changeVariableKind(variables, "var-predictor-1", "moderator");
      const checks = statusOf(changed, "var-predictor-1", withFramework);
      assert.equal(checks.hypotheses.status, "clarify");
      assert.equal(checks.framework.status, "clarify");
      assert.match(checks.hypotheses.explanation, /treat it as independent variable, but here it is moderator variable/);
    });

    it("treats a confounding variable shown as extraneous in the framework as aligned", () => {
      const framework = addBox(EMPTY_FRAMEWORK, { name: "stress", type: "extraneous" });
      const confounder = addVariable([], "stress", "confounding");
      assert.equal(statusOf(confounder, "var-stress", applyFramework({}, framework)).framework.status, "aligned");
    });

    it("notices a main variable missing from the question, objectives, hypotheses and framework", () => {
      const extra = addVariable(variables, "noise", "independent");
      const checks = statusOf(extra, "var-noise", withFramework);
      for (const id of ["question", "objectives", "hypotheses", "framework"]) assert.equal(checks[id].status, "worth-checking", id);
    });

    it("reports what the project is missing, and leaves hypotheses and framework for review when there are none", () => {
      const checks = statusOf(complete(), "var-screen-time", {});
      assert.equal(checks.question.status, "missing");
      assert.equal(checks.objectives.status, "missing");
      assert.equal(checks.hypotheses.status, "review");
      assert.equal(checks.framework.status, "review");
    });
  });

  it("never scores or ranks", () => {
    const text = JSON.stringify(validateVariable(complete()[0], complete(), {}));
    assert.ok(!/\b\d+\s*(%|\/\s*\d|out of)/.test(text));
  });
});

describe("validateSet", () => {
  it("finds a set with an independent and a dependent variable aligned", () => {
    assert.deepEqual(validateSet(complete()).map((check) => check.status), ["aligned", "aligned", "aligned"]);
  });

  it("reports a missing independent or dependent variable", () => {
    assert.deepEqual(validateSet([]).map((check) => check.status), ["missing", "missing", "aligned"]);
    assert.deepEqual(validateSet(addVariable([], "x", "dependent")).map((check) => check.check + ":" + check.status), ["independent:missing", "dependent:aligned", "duplicates:aligned"]);
  });

  it("names duplicate variables once each", () => {
    const repeated = addVariable(addVariable(complete(), "screen time", "control"), "SCREEN TIME", "control");
    const duplicates = validateSet(repeated)[2];
    assert.equal(duplicates.status, "worth-checking");
    assert.equal(duplicates.explanation, "“screen time” and “SCREEN TIME” appear more than once. Combine or rename them.");
  });
});

describe("large projects", () => {
  it("validates 300 variables with 5 indicators each in under half a second", () => {
    let variables: ProjectVariable[] = [];
    for (let index = 0; index < 300; index++) {
      variables = addVariable(variables, `variable ${index}`, index % 2 === 0 ? "independent" : "dependent");
    }
    variables = variables.map((variable) => ({
      ...variable,
      possibleIndicators: Array.from({ length: 5 }, (_, index) => ({ id: `${variable.id}-ind-${index + 1}`, name: `${variable.name} indicator ${index}`, description: "", measurement: "", scale: "", level: null })),
    }));
    const project = createProjectDraft({ researchObjectives: ["To examine variable 1"] });
    // The best of three runs, as in the other performance tests, so machine load doesn't decide the result.
    const times = [0, 1, 2].map(() => {
      const start = performance.now();
      for (const variable of variables) validateVariable(variable, variables, project);
      validateSet(variables);
      return performance.now() - start;
    });
    assert.ok(Math.min(...times) < 500, `${Math.min(...times).toFixed(0)} ms`);
  });
});
