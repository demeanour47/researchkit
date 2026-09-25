import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findQuestion } from "./questionnaire";
import { SECTION_FOR_KIND, addMissingQuestions, buildQuestionnaire, questionOrigin, questionnaireVariables, sectionGuidance, suggestedType, unmeasured } from "./questionnaire-builder";
import { changeType, deleteQuestion, updateQuestion } from "./questionnaire-items";
import { removeSection } from "./questionnaire-sections";
import { sleepProject, sleepVariables } from "./questionnaire-test-helpers";
import { createProjectDraft } from "./research-project";
import { addIndicator, addVariable, updateVariable } from "./variable-builder";
import { applyVariables } from "./variable-summary";
import { VARIABLE_KINDS } from "./variable-types";

const summary = (questionnaire: ReturnType<typeof buildQuestionnaire>) => questionnaire.questions.map((question) => [question.id, question.section, question.type, question.variableId, question.indicatorId, question.text].join(" | "));

describe("buildQuestionnaire", () => {
  it("builds the standard sections and one question per indicator, placed by variable kind", () => {
    const questionnaire = buildQuestionnaire(sleepProject());
    assert.equal(questionnaire.title, "Screen time and sleep quality");
    assert.equal(questionnaire.sections.length, 11);
    assert.deepEqual(summary(questionnaire), [
      "q-1 | consent | yes-no |  |  | ",
      "q-2 | demographics | multiple-choice | var-year-of-study |  | ",
      "q-3 | section-a | numeric | var-screen-time | var-screen-time-ind-1 | ",
      "q-4 | section-a | likert | var-screen-time | var-screen-time-ind-2 | ",
      "q-5 | section-c | numeric | var-sleep-quality | var-sleep-quality-ind-1 | ",
      "q-6 | section-c | likert | var-sleep-quality | var-sleep-quality-ind-2 | ",
    ]);
    assert.equal(findQuestion(questionnaire, "q-1").required, true, "consent must be answered");
  });

  it("never writes wording: every generated question starts empty", () => {
    assert.ok(buildQuestionnaire(sleepProject()).questions.every((question) => question.text === ""));
  });

  it("is deterministic", () => {
    assert.deepEqual(buildQuestionnaire(sleepProject()), buildQuestionnaire(sleepProject()));
  });

  it("places every kind of variable in a standard section", () => {
    for (const kind of VARIABLE_KINDS) assert.ok(["demographics", "section-a", "section-b", "section-c"].includes(SECTION_FOR_KIND[kind]), kind);
    let variables = addVariable([], "stress", "mediator");
    variables = addVariable(variables, "gender", "moderator");
    variables = addVariable(variables, "caffeine", "confounding");
    const questionnaire = buildQuestionnaire(applyVariables({}, variables));
    assert.deepEqual(questionnaire.questions.map((question) => `${question.variableId}@${question.section}`), ["null@consent", "var-caffeine@demographics", "var-stress@section-b", "var-gender@section-b"]);
  });

  it("uses variables named in the project's lists when there are no Variables Builder variables", () => {
    const project = createProjectDraft({ independentVariables: ["exercise"], dependentVariables: ["mood"] });
    assert.deepEqual(questionnaireVariables(project).map((variable) => variable.id), ["var-exercise", "var-mood"]);
    assert.deepEqual(buildQuestionnaire(project).questions.map((question) => `${question.variableId}/${question.indicatorId}/${question.type}`), ["null/null/yes-no", "var-exercise/null/short-answer", "var-mood/null/short-answer"]);
    assert.equal(buildQuestionnaire(project).title, "", "no topic, no title");
  });

  it("gives an empty project only the structure and the consent question", () => {
    const questionnaire = buildQuestionnaire({});
    assert.deepEqual(questionnaire.questions.map((question) => question.section), ["consent"]);
  });
});

describe("the researcher's own draft items", () => {
  const withItems = (indicators: string[], items: string[]) => {
    let variables = addVariable([], "sleep quality", "dependent");
    for (const name of indicators) variables = addIndicator(variables, "var-sleep-quality", { name, level: "likert" });
    variables = updateVariable(variables, "var-sleep-quality", { questionnaireItems: items });
    return buildQuestionnaire(applyVariables({}, variables)).questions.slice(1);
  };

  it("become questions linked item by item when the counts match", () => {
    assert.deepEqual(
      withItems(["Rested", "Latency"], ["I wake up rested.", "I fall asleep quickly."]).map((question) => [question.text, question.indicatorId]),
      [
        ["I wake up rested.", "var-sleep-quality-ind-1"],
        ["I fall asleep quickly.", "var-sleep-quality-ind-2"],
      ],
    );
  });

  it("all link to a single indicator", () => {
    assert.deepEqual(
      withItems(["Rested"], ["I wake up rested.", "I feel refreshed."]).map((question) => question.indicatorId),
      ["var-sleep-quality-ind-1", "var-sleep-quality-ind-1"],
    );
  });

  it("stay unlinked when the match is unclear, and every indicator still gets a placeholder", () => {
    assert.deepEqual(
      withItems(["Rested", "Latency", "Waking"], ["I wake up rested.", "I fall asleep quickly."]).map((question) => [question.text, question.indicatorId]),
      [
        ["I wake up rested.", null],
        ["I fall asleep quickly.", null],
        ["", "var-sleep-quality-ind-1"],
        ["", "var-sleep-quality-ind-2"],
        ["", "var-sleep-quality-ind-3"],
      ],
    );
  });

  it("measure a variable without indicators", () => {
    assert.deepEqual(withItems([], ["I sleep well."]).map((question) => [question.text, question.variableId, question.indicatorId]), [["I sleep well.", "var-sleep-quality", null]]);
  });
});

describe("suggestedType", () => {
  it("prefers the indicator's level to the variable's, and falls back to a short answer", () => {
    const [screen, sleep, year] = sleepVariables();
    assert.equal(suggestedType(screen, screen.possibleIndicators[0]), "numeric");
    assert.equal(suggestedType(sleep, sleep.possibleIndicators[1]), "likert");
    assert.equal(suggestedType(year, null), "multiple-choice");
    assert.equal(suggestedType({ ...year, measurementLevel: null }, null), "short-answer");
  });
});

describe("unmeasured and addMissingQuestions", () => {
  it("finds nothing unmeasured in a freshly built questionnaire", () => {
    const project = sleepProject();
    assert.deepEqual(unmeasured(buildQuestionnaire(project), project), []);
  });

  it("finds deleted questions' indicators and restores them in their sections", () => {
    const project = sleepProject();
    const trimmed = deleteQuestion(deleteQuestion(buildQuestionnaire(project), "q-4"), "q-2");
    assert.deepEqual(unmeasured(trimmed, project).map(({ variable, indicator }) => `${variable.name}/${indicator?.name ?? "-"}`), ["screen time/Screen use before bed", "year of study/-"]);
    const restored = addMissingQuestions(trimmed, project);
    assert.deepEqual(restored.questions.map((question) => `${question.id}@${question.section}`), ["q-1@consent", "q-8@demographics", "q-3@section-a", "q-7@section-a", "q-5@section-c", "q-6@section-c"]);
    assert.deepEqual(unmeasured(restored, project), []);
  });

  it("uses the last question section when the usual one was removed, and does nothing with nowhere to go", () => {
    const project = sleepProject();
    const noA = removeSection(buildQuestionnaire(project), "section-a");
    assert.deepEqual(addMissingQuestions(noA, project).questions.filter((question) => question.variableId === "var-screen-time").map((question) => question.section), ["section-c", "section-c"]);
    const bare = { title: "", sections: [{ id: "consent", kind: "consent" as const, title: "Consent", content: "" }], questions: [] };
    assert.deepEqual(addMissingQuestions(bare, project), bare);
  });
});

describe("questionOrigin", () => {
  const project = sleepProject();
  const questionnaire = buildQuestionnaire(project);

  it("traces a question from variable to indicator to operational definition to wording", () => {
    const origin = questionOrigin(findQuestion(questionnaire, "q-5"), project, questionnaire);
    assert.deepEqual(origin.chain, [
      { label: "Variable", value: "sleep quality (dependent variable)", missing: false },
      { label: "Indicator", value: "Time taken to fall asleep", missing: false },
      { label: "Operational definition", value: "Self-reported sleep over the past week", missing: false },
      { label: "Question", value: "[questionnaire item]", missing: true },
    ]);
  });

  it("names the research question, objectives, hypotheses, framework and population behind it", () => {
    const origin = questionOrigin(findQuestion(questionnaire, "q-3"), project, questionnaire);
    assert.equal(origin.researchQuestion, project.researchQuestion);
    assert.deepEqual(origin.objectives, ["To examine the relationship between screen time and sleep quality"]);
    assert.ok(origin.hypotheses.length > 0);
    assert.ok(origin.hypotheses.every((hypothesis) => hypothesis.text.includes("screen time")));
    assert.deepEqual([...new Set(origin.hypotheses.map((hypothesis) => hypothesis.label))].sort(), ["H₀", "H₁"]);
    assert.deepEqual(origin.framework, ["screen time → sleep quality"]);
    assert.equal(origin.population, "First-year students at one university");
  });

  it("explains why it exists and why it has its type, in sentences", () => {
    assert.deepEqual(questionOrigin(findQuestion(questionnaire, "q-3"), project, questionnaire).explanation, [
      "Question 3 measures “Weekday screen time”, an indicator of screen time (independent variable).",
      "Its wording is still to be written: the builder never writes questions for you.",
      "It is a numeric question because the indicator is measured at the ratio level.",
    ]);
    const changed = updateQuestion(changeType(questionnaire, "q-3", "likert"), "q-3", { text: "How much do you use screens?" });
    assert.deepEqual(questionOrigin(findQuestion(changed, "q-3"), project).explanation, [
      "This question measures “Weekday screen time”, an indicator of screen time (independent variable).",
      "Its wording is yours.",
      "The indicator is measured at the ratio level, which usually suggests a numeric question; this one is a likert scale question.",
      "The indicator's scale is recorded as “Hours per day”; check the question's scale matches it.",
    ]);
  });

  it("says when no indicator or measurement level is set", () => {
    const origin = questionOrigin(findQuestion(questionnaire, "q-2"), project, questionnaire);
    assert.equal(origin.explanation[0], "Question 2 measures year of study (control variable), but no indicator is chosen, so what it measures isn't yet specific.");
    assert.equal(origin.chain[1].missing, true);
    assert.equal(origin.chain[2].value, "[operational definition]");
    assert.equal(origin.researchQuestion, null, "the question doesn't name year of study");
    assert.deepEqual(origin.objectives, []);
  });

  it("explains the consent question and questions linked to nothing", () => {
    assert.deepEqual(questionOrigin(findQuestion(questionnaire, "q-1"), project).explanation, ["This is the consent question. It records the participant's agreement and doesn't measure a variable."]);
    const orphan = questionOrigin({ ...findQuestion(questionnaire, "q-3"), variableId: null, indicatorId: null }, project);
    assert.match(orphan.explanation[0], /isn't linked to a variable/);
    assert.deepEqual(orphan.chain.map((step) => step.missing), [true, true, true, true]);
  });
});

describe("sectionGuidance", () => {
  const project = sleepProject();
  const section = (id: string) => buildQuestionnaire(project).sections.find((candidate) => candidate.id === id)!;

  it("offers project information that helps write each section", () => {
    assert.deepEqual(sectionGuidance(section("cover"), project), ["Your topic: Screen time and sleep quality"]);
    assert.deepEqual(sectionGuidance(section("introduction"), project), [
      "Your research aim: To understand how screen use relates to students' sleep",
      "Your research question: What is the relationship between screen time and sleep quality among first-year students?",
      "Who will answer: First-year students at one university",
    ]);
    assert.deepEqual(sectionGuidance(section("demographics"), project), ["Variables measured here: year of study"]);
    assert.deepEqual(sectionGuidance(section("section-c"), project), ["Variables measured here by default: sleep quality"]);
    assert.deepEqual(sectionGuidance(section("thank-you"), project), []);
    assert.deepEqual(sectionGuidance(section("demographics"), {}), ["No control variables yet. Add only the characteristics your analysis needs."]);
  });
});
