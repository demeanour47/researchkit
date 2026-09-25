import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_QUESTIONNAIRE, answerOptions, cleanQuestionnaire, findQuestion, findSection, matrixRows, orderedQuestions, questionNumbers, questionWording, rowLetter } from "./questionnaire";
import { buildQuestionnaire } from "./questionnaire-builder";
import { addQuestion, changeType, createQuestion, updateQuestion } from "./questionnaire-items";
import { createScale } from "./questionnaire-scales";
import { moveSection } from "./questionnaire-sections";
import { sleepProject, sleepVariables } from "./questionnaire-test-helpers";
import type { Question, QuestionType, Questionnaire } from "./questionnaire-types";

const built = () => buildQuestionnaire(sleepProject());

describe("finding sections and questions", () => {
  it("finds by id and rejects unknown ids", () => {
    assert.equal(findSection(built(), "consent").title, "Consent");
    assert.equal(findQuestion(built(), "q-1").type, "yes-no");
    assert.throws(() => findSection(built(), "appendix"), { message: "Unknown section: appendix" });
    assert.throws(() => findQuestion(EMPTY_QUESTIONNAIRE, "q-1"), { message: "Unknown question: q-1" });
  });
});

describe("questionNumbers", () => {
  it("numbers questions straight through, section by section", () => {
    const numbers = questionNumbers(built());
    assert.deepEqual([...numbers.entries()], [
      ["q-1", "1"],
      ["q-2", "2"],
      ["q-3", "3"],
      ["q-4", "4"],
      ["q-5", "5"],
      ["q-6", "6"],
    ]);
  });

  it("follows the section order, not the order questions were added", () => {
    let questionnaire = moveSection(built(), "section-c", 0);
    questionnaire = addQuestion(questionnaire, "consent", { type: "yes-no" }).questionnaire;
    assert.deepEqual(orderedQuestions(questionnaire).map((question) => question.id), ["q-5", "q-6", "q-1", "q-7", "q-2", "q-3", "q-4"]);
    assert.equal(questionNumbers(questionnaire).get("q-7"), "4");
  });

  it("is empty for an empty questionnaire", () => {
    assert.equal(questionNumbers(EMPTY_QUESTIONNAIRE).size, 0);
  });
});

describe("rowLetter", () => {
  it("letters matrix statements a to z, then aa onwards", () => {
    assert.deepEqual([0, 1, 25, 26, 27, 51, 52, 701, 702].map(rowLetter), ["a", "b", "z", "aa", "ab", "az", "ba", "zz", "aaa"]);
  });
});

describe("questionWording", () => {
  const variables = sleepVariables();
  const question = (details: Partial<Question>): Question => ({ ...createQuestion("q-9", "section-a"), ...details });

  it("uses the researcher's wording when there is some", () => {
    assert.deepEqual(questionWording(question({ text: "  How many hours?  " }), variables), { text: "How many hours?", placeholder: false });
  });

  it("names the indicator, the variable, consent or nothing, in that order", () => {
    assert.deepEqual(questionWording(question({ variableId: "var-screen-time", indicatorId: "var-screen-time-ind-2" }), variables), { text: "[question about Screen use before bed]", placeholder: true });
    assert.deepEqual(questionWording(question({ variableId: "var-year-of-study" }), variables), { text: "[question about year of study]", placeholder: true });
    assert.deepEqual(questionWording(question({}), variables, "consent"), { text: "[consent question, such as agreement to take part]", placeholder: true });
    assert.deepEqual(questionWording(question({ variableId: "var-deleted" }), variables), { text: "[question]", placeholder: true });
  });
});

describe("answerOptions and matrixRows", () => {
  const of = (type: QuestionType, details: Partial<Question> = {}) => ({ ...createQuestion("q-1", "a", { type }), ...details });

  it("gives fixed options for yes/no and true/false", () => {
    assert.deepEqual(answerOptions(of("yes-no")).map((option) => option.text), ["Yes", "No"]);
    assert.deepEqual(answerOptions(of("true-false")).map((option) => option.text), ["True", "False"]);
  });

  it("gives the researcher's options, or two placeholders", () => {
    assert.deepEqual(answerOptions(of("checkbox", { options: [" Phone ", "", "Laptop"] })), [
      { text: "Phone", placeholder: false },
      { text: "Laptop", placeholder: false },
    ]);
    assert.deepEqual(answerOptions(of("ranking")), [
      { text: "[option 1]", placeholder: true },
      { text: "[option 2]", placeholder: true },
    ]);
    assert.deepEqual(answerOptions(of("numeric", { options: ["ignored"] })), []);
  });

  it("gives matrix statements, or two placeholders, and none for other types", () => {
    assert.deepEqual(matrixRows(of("matrix", { rows: ["I feel rested"] })), [{ text: "I feel rested", placeholder: false }]);
    assert.deepEqual(matrixRows(of("matrix")).map((row) => row.text), ["[statement 1]", "[statement 2]"]);
    assert.deepEqual(matrixRows(of("likert", { rows: ["ignored"] })), []);
  });
});

describe("cleanQuestionnaire", () => {
  it("trims text, keeps line breaks, and drops what a type doesn't use", () => {
    let questionnaire = built();
    questionnaire = updateQuestion(questionnaire, "q-2", { text: "  Which   year are you in?  ", options: [" First ", " ", "Second"], helpText: " Choose one \n  of these " });
    questionnaire = { ...questionnaire, questions: questionnaire.questions.map((question) => (question.id === "q-3" ? { ...question, options: ["stale"], rows: ["stale"], scale: createScale("agreement-5") } : question)) };
    const cleaned = cleanQuestionnaire(questionnaire);
    const year = findQuestion(cleaned, "q-2");
    assert.equal(year.text, "Which year are you in?");
    assert.deepEqual(year.options, ["First", "Second"]);
    assert.equal(year.helpText, "Choose one\nof these");
    const numeric = findQuestion(cleaned, "q-3");
    assert.deepEqual([numeric.options, numeric.rows, numeric.scale], [[], [], null]);
  });

  it("drops an indicator without a variable", () => {
    const questionnaire = { ...built(), questions: [{ ...createQuestion("q-1", "consent"), indicatorId: "var-x-ind-1" }] };
    assert.equal(cleanQuestionnaire(questionnaire).questions[0].indicatorId, null);
  });

  it("keeps scales as they are, including reverse scoring", () => {
    const questionnaire = changeType(built(), "q-3", "matrix");
    const scale = { ...findQuestion(questionnaire, "q-3").scale!, reverseScored: true };
    const cleaned = cleanQuestionnaire({ ...questionnaire, questions: questionnaire.questions.map((question) => (question.id === "q-3" ? { ...question, scale } : question)) });
    assert.deepEqual(findQuestion(cleaned, "q-3").scale, scale);
  });

  it("rejects what can't be repaired", () => {
    const base = built();
    const withQuestion = (changes: Partial<Question>): Questionnaire => ({ ...base, questions: [{ ...base.questions[0], ...changes }] });
    assert.throws(() => cleanQuestionnaire(withQuestion({ type: "essay" as QuestionType })), { message: "Unknown question type: essay" });
    assert.throws(() => cleanQuestionnaire(withQuestion({ section: "appendix" })), { message: "Question q-1 is in a section that doesn't exist: appendix" });
    assert.throws(() => cleanQuestionnaire(withQuestion({ type: "likert", scale: null })), { message: "Question q-1 needs a scale." });
    assert.throws(() => cleanQuestionnaire({ ...base, questions: [base.questions[0], base.questions[0]] }), { message: "Missing or repeated question id: q-1" });
    assert.throws(() => cleanQuestionnaire({ ...base, sections: [...base.sections, base.sections[0]] }), { message: "Missing or repeated section id: cover" });
    assert.throws(() => cleanQuestionnaire({ ...base, sections: [{ ...base.sections[0], kind: "appendix" as "cover" }] }), { message: "Unknown section kind: appendix" });
    const scale = createScale("agreement-5");
    assert.throws(() => cleanQuestionnaire(withQuestion({ type: "likert", scale: { ...scale, values: [1, 2] } })), { message: "Every scale label needs exactly one number." });
    assert.throws(() => cleanQuestionnaire(withQuestion({ type: "likert", scale: { ...scale, preset: "colour" as "custom" } })), { message: "Unknown scale: colour" });
    assert.throws(() => cleanQuestionnaire(withQuestion({ type: "likert", scale: { ...scale, values: [1, 2, 3, 4, Number.NaN] } })), { message: "Scale values must be numbers." });
  });
});
