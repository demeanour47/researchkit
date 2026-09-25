import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findQuestion } from "../../knowledge/research";
import { announcements } from "./announcements";
import { exampleInputs, exampleLevels } from "./example";
import { fileName } from "./file-name";
import { EMPTY_PROJECT_INPUTS, parseVariableLines, projectFromInputs, variablesFromInputs } from "./project-input";
import { buildQuestionnaire } from "../../knowledge/research";

describe("announcements", () => {
  it("says what changed, with question numbers, and never counts as a score", () => {
    assert.equal(announcements.built(6), "Questionnaire built from your project: 6 questions, each still to be worded by you.");
    assert.equal(announcements.built(1), "Questionnaire built from your project: 1 question, each still to be worded by you.");
    assert.equal(announcements.missingAdded(0), "Every variable and indicator already has a question.");
    assert.equal(announcements.missingAdded(2), "2 placeholder questions added for what wasn't measured.");
    assert.equal(announcements.questionAdded("7", "Section A"), "Question 7 added to Section A.");
    assert.equal(announcements.questionDuplicated("4", "5"), "Question 4 duplicated as question 5.");
    assert.equal(announcements.questionDeleted("3"), "Question 3 deleted. Later questions have been renumbered.");
    assert.equal(announcements.questionMoved("4", "3"), "Question 4 is now question 3.");
    assert.equal(announcements.questionMoved("4", "4"), "Question 4 is already there.");
    assert.equal(announcements.questionSection("6", "Section C"), "Question moved to Section C. It is now question 6.");
    assert.equal(announcements.typeChanged("2", "Likert scale"), "Question 2 is now a likert scale question.");
    assert.equal(announcements.sectionAdded("Your studies"), "Section “Your studies” added before the closing note.");
    assert.equal(announcements.sectionRemoved("Section B", 0), "Section “Section B” removed.");
    assert.equal(announcements.sectionRemoved("Section A", 2), "Section “Section A” removed, with 2 questions.");
    assert.equal(announcements.sectionMoved("Consent", 2, 11), "Section “Consent” is now 2 of 11.");
    assert.equal(announcements.preview("Microsoft Word preview"), "Microsoft Word preview shown.");
    assert.equal(announcements.downloaded("Word"), "Word file downloaded.");
  });
});

describe("fileName", () => {
  it("makes a safe file name from the title", () => {
    assert.equal(fileName("Screen time & sleep: a survey", "docx"), "screen-time-sleep-a-survey.docx");
    assert.equal(fileName("Café étude", "pdf"), "cafe-etude.pdf");
    assert.equal(fileName("  ", "md"), "questionnaire.md");
    assert.equal(fileName("日本語", "txt"), "questionnaire.txt");
    assert.equal(fileName("a".repeat(80), "md").length, 63);
  });
});

describe("parseVariableLines", () => {
  it("reads a variable per line with indicators after a colon", () => {
    assert.deepEqual(parseVariableLines("sleep quality: time to fall asleep; feeling rested\n\n  screen   time \nmood:"), [
      { name: "sleep quality", indicators: ["time to fall asleep", "feeling rested"] },
      { name: "screen time", indicators: [] },
      { name: "mood", indicators: [] },
    ]);
  });

  it("merges repeated variables and indicators, ignoring case", () => {
    assert.deepEqual(parseVariableLines("Sleep: rested; latency\nsleep: Rested; waking; ;"), [{ name: "Sleep", indicators: ["rested", "latency", "waking"] }]);
    assert.deepEqual(parseVariableLines(": orphan indicator"), []);
  });
});

describe("variablesFromInputs and projectFromInputs", () => {
  it("builds variables with indicators and levels, keeping a name's first kind", () => {
    const variables = variablesFromInputs({ ...EMPTY_PROJECT_INPUTS, independent: "screen time: weekday; bedtime", dependent: "sleep: rested\nscreen time", control: "age" }, { "var-sleep": "likert", "var-age": "" });
    assert.deepEqual(
      variables.map((variable) => [variable.id, variable.variableType, variable.measurementLevel, variable.possibleIndicators.map((indicator) => indicator.name)]),
      [
        ["var-screen-time", "independent", null, ["weekday", "bedtime"]],
        ["var-sleep", "dependent", "likert", ["rested"]],
        ["var-age", "control", null, []],
      ],
    );
  });

  it("turns the example into a full project, and nothing into an empty one", () => {
    const project = projectFromInputs(exampleInputs, exampleLevels, true);
    assert.equal(project.researchQuestion, exampleInputs.researchQuestion);
    assert.deepEqual(project.researchObjectives?.length, 2);
    assert.ok((project.hypotheses?.length ?? 0) > 0);
    assert.deepEqual(project.conceptualFramework?.relationships.length, 1);
    assert.equal(project.samplingPlan?.population.targetPopulation, exampleInputs.targetPopulation);
    assert.deepEqual(project.variables?.map((variable) => variable.measurementLevel), ["ratio", "likert", "ordinal"]);
    assert.equal(projectFromInputs(exampleInputs, exampleLevels, false).hypotheses, undefined);
    assert.deepEqual(projectFromInputs(EMPTY_PROJECT_INPUTS, {}, true), {});
  });

  it("gives the example a questionnaire with a question per indicator and no wording", () => {
    const questionnaire = buildQuestionnaire(projectFromInputs(exampleInputs, exampleLevels, true));
    assert.equal(questionnaire.questions.length, 6);
    assert.deepEqual(
      questionnaire.questions.map((question) => question.type),
      ["yes-no", "multiple-choice", "numeric", "numeric", "likert", "likert"],
    );
    assert.equal(findQuestion(questionnaire, "q-3").text, "");
  });
});
