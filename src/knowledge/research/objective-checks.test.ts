import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  OBJECTIVES_GENERATOR_LIMITATIONS,
  checkGeneralObjective,
  checkSpecificObjective,
  checkSpecificObjectivesOverall,
  evaluateObjectives,
} from "./objective-checks";
import { createProjectDraft } from "./research-project";

const project = createProjectDraft({
  researchQuestion: "What is the relationship between screen time and sleep quality among first-year university students?",
  population: "first-year university students",
  independentVariables: ["screen time"],
  dependentVariables: ["sleep quality"],
});

const statusOf = (checks: readonly { check: string; status: string }[], id: string) => checks.find((check) => check.check === id)?.status;

describe("checkGeneralObjective", () => {
  it("reports only presence when the objective is empty", () => {
    const checks = checkGeneralObjective("", project);
    assert.deepEqual(checks.map((check) => check.check), ["generalPresence"]);
    assert.equal(checks[0].status, "missing");
  });

  it("reports only presence for blank text", () => {
    assert.equal(checkGeneralObjective("   ", project)[0].status, "missing");
  });

  it("recognises the action verb, the shared question wording and the mentioned details as aligned", () => {
    const text = "To examine the relationship between screen time and sleep quality among first-year university students.";
    const checks = checkGeneralObjective(text, project);
    assert.deepEqual(checks.map((check) => check.check), ["generalVerb", "questionAlignment", "specificity"]);
    assert.equal(statusOf(checks, "generalVerb"), "aligned");
    assert.match(checks[0].explanation, /“examine”/);
    assert.equal(statusOf(checks, "questionAlignment"), "aligned");
    assert.equal(statusOf(checks, "specificity"), "aligned");
  });

  it("flags a missing action verb", () => {
    const checks = checkGeneralObjective("To achieve better outcomes for first-year university students.", project);
    assert.equal(statusOf(checks, "generalVerb"), "clarify");
  });

  it("asks to add a research question when there is none", () => {
    const checks = checkGeneralObjective("To examine screen time and sleep quality.", createProjectDraft({}));
    assert.equal(statusOf(checks, "questionAlignment"), "review");
  });

  it("flags a general objective that shares no wording with the research question", () => {
    const checks = checkGeneralObjective("To explore how newly qualified teachers experience their first term.", project);
    assert.equal(statusOf(checks, "questionAlignment"), "worth-checking");
  });

  it("flags the worked example of a vague objective that names who but not what", () => {
    const vague = createProjectDraft({ population: "employees", dependentVariables: ["job satisfaction"] });
    const checks = checkGeneralObjective("To understand employees.", vague);
    assert.equal(statusOf(checks, "specificity"), "worth-checking");
    assert.match(checks.find((check) => check.check === "specificity")!.explanation, /names who is studied but not what/);
  });

  it("flags a general objective that doesn't mention a known population", () => {
    const checks = checkGeneralObjective("To examine the relationship between two variables.", project);
    assert.equal(statusOf(checks, "specificity"), "worth-checking");
  });

  it("reports specificity as needing review when nothing is known to check against", () => {
    const checks = checkGeneralObjective("To examine the situation.", createProjectDraft({}));
    assert.equal(statusOf(checks, "specificity"), "review");
  });

  it("gives a deterministic result for the same input", () => {
    const text = "To examine the relationship between screen time and sleep quality among first-year university students.";
    assert.deepEqual(checkGeneralObjective(text, project), checkGeneralObjective(text, project));
  });

  it("checks an objective written in Devanagari without crashing, though it can't recognise a non-English verb", () => {
    const nepaliProject = createProjectDraft({ population: "विद्यार्थीहरू", dependentVariables: ["सिकाइ उपलब्धि"] });
    const checks = checkGeneralObjective("विद्यार्थीहरू को सिकाइ उपलब्धि जाँच्नु।", nepaliProject);
    assert.equal(statusOf(checks, "generalVerb"), "clarify");
    assert.equal(statusOf(checks, "specificity"), "aligned");
    assert.equal(statusOf(checks, "questionAlignment"), "review");
  });
});

describe("checkSpecificObjective", () => {
  const general = "To examine the relationship between screen time and sleep quality among first-year university students.";

  it("recognises a focused, aligned objective", () => {
    const checks = checkSpecificObjective("To identify the level of screen time among first-year university students.", general);
    assert.equal(statusOf(checks, "objectiveVerb"), "aligned");
    assert.equal(statusOf(checks, "overloaded"), "aligned");
    assert.equal(statusOf(checks, "possibleOutcome"), "aligned");
    assert.equal(statusOf(checks, "objectiveAlignment"), "aligned");
  });

  it("flags the worked example of an overloaded objective with several actions", () => {
    const checks = checkSpecificObjective("To identify, analyse, compare, evaluate and determine various factors affecting performance.", general);
    assert.equal(statusOf(checks, "overloaded"), "worth-checking");
    assert.match(checks.find((check) => check.check === "overloaded")!.explanation, /identify, analyse, compare, evaluate, determine/);
  });

  it("flags the worked example of an objective that reads as an outcome, not a research action", () => {
    const checks = checkSpecificObjective("To provide recommendations to the manager on how to improve employee performance.", general);
    assert.equal(statusOf(checks, "possibleOutcome"), "worth-checking");
    assert.match(checks.find((check) => check.check === "possibleOutcome")!.explanation, /provide recommendations/);
  });

  it("flags a missing action verb", () => {
    assert.equal(statusOf(checkSpecificObjective("Something about the project.", general), "objectiveVerb"), "clarify");
  });

  it("asks to write the general objective first when there is none", () => {
    assert.equal(statusOf(checkSpecificObjective("To identify the level of screen time.", ""), "objectiveAlignment"), "review");
  });

  it("flags a specific objective unrelated to the general objective", () => {
    assert.equal(statusOf(checkSpecificObjective("To provide recommendations to the manager.", general), "objectiveAlignment"), "worth-checking");
  });

  it("gives a deterministic result for the same input", () => {
    const text = "To identify the level of screen time among first-year university students.";
    assert.deepEqual(checkSpecificObjective(text, general), checkSpecificObjective(text, general));
  });
});

describe("checkSpecificObjectivesOverall", () => {
  const general = "To examine the relationship between screen time and sleep quality among first-year university students.";

  it("reports only presence for an empty list", () => {
    const checks = checkSpecificObjectivesOverall([], general);
    assert.deepEqual(checks.map((check) => check.check), ["specificPresence"]);
    assert.equal(checks[0].status, "missing");
  });

  it("finds no duplicates among distinct objectives, and reports how many cover the general objective", () => {
    const objectives = [
      "To identify the level of screen time among first-year university students.",
      "To identify the level of sleep quality among first-year university students.",
    ];
    const checks = checkSpecificObjectivesOverall(objectives, general);
    assert.equal(statusOf(checks, "duplicates"), "aligned");
    assert.equal(statusOf(checks, "breakdownCoverage"), "aligned");
    assert.match(checks.find((check) => check.check === "breakdownCoverage")!.explanation, /^2 of 2 specific objectives share/);
  });

  it("flags two objectives that are the same once tidied", () => {
    const objectives = ["To identify the level of screen time among students.", "  to identify the level of screen time among students  "];
    const checks = checkSpecificObjectivesOverall(objectives, general);
    assert.equal(statusOf(checks, "duplicates"), "worth-checking");
    assert.match(checks.find((check) => check.check === "duplicates")!.explanation, /Objectives 1 and 2/);
  });

  it("asks to write the general objective before checking coverage", () => {
    const checks = checkSpecificObjectivesOverall(["To identify screen time."], "");
    assert.equal(statusOf(checks, "breakdownCoverage"), "review");
  });

  it("flags specific objectives that share nothing with the general objective", () => {
    const checks = checkSpecificObjectivesOverall(["To provide recommendations to the manager."], general);
    assert.equal(statusOf(checks, "breakdownCoverage"), "worth-checking");
  });
});

describe("evaluateObjectives", () => {
  it("evaluates the general objective, the set of specific objectives, and each one on its own", () => {
    const general = "To examine the relationship between screen time and sleep quality among first-year university students.";
    const specific = [
      "To identify the level of screen time among first-year university students.",
      "To identify the level of sleep quality among first-year university students.",
    ];
    const evaluation = evaluateObjectives(general, specific, project);
    assert.equal(evaluation.specific.length, 2);
    assert.deepEqual(evaluation.specific.map((entry) => entry.text), specific);
    assert.equal(statusOf(evaluation.general, "generalVerb"), "aligned");
    assert.equal(statusOf(evaluation.specificOverall, "duplicates"), "aligned");
    assert.equal(statusOf(evaluation.specific[0].checks, "objectiveAlignment"), "aligned");
  });

  it("gives a deterministic result for the same input", () => {
    const general = "To examine the relationship between screen time and sleep quality among first-year university students.";
    const specific = ["To identify the level of screen time among first-year university students."];
    assert.deepEqual(evaluateObjectives(general, specific, project), evaluateObjectives(general, specific, project));
  });

  it("handles an empty general objective and an empty specific objectives list together", () => {
    const evaluation = evaluateObjectives("", [], createProjectDraft({}));
    assert.deepEqual(evaluation.general.map((check) => check.check), ["generalPresence"]);
    assert.deepEqual(evaluation.specificOverall.map((check) => check.check), ["specificPresence"]);
    assert.deepEqual(evaluation.specific, []);
  });
});

describe("OBJECTIVES_GENERATOR_LIMITATIONS", () => {
  it("states at least a few things the tool can't do", () => {
    assert.ok(OBJECTIVES_GENERATOR_LIMITATIONS.length >= 3);
    for (const limitation of OBJECTIVES_GENERATOR_LIMITATIONS) assert.ok(limitation.length > 0);
  });
});
