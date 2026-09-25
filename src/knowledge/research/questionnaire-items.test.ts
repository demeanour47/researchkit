import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findQuestion, sectionQuestions } from "./questionnaire";
import { buildQuestionnaire } from "./questionnaire-builder";
import {
  addQuestion,
  changeSection,
  changeType,
  createQuestion,
  defaultScaleFor,
  deleteQuestion,
  duplicateQuestion,
  linkQuestion,
  moveQuestion,
  nextQuestionId,
  setQuestionScale,
  updateQuestion,
} from "./questionnaire-items";
import { createScale, setScaleLabels } from "./questionnaire-scales";
import { sleepProject } from "./questionnaire-test-helpers";
import { QUESTION_TYPES, QUESTION_TYPE_INFO, type QuestionType } from "./questionnaire-types";

const built = () => buildQuestionnaire(sleepProject());
const ids = (questionnaire: ReturnType<typeof built>, section?: string) => (section ? sectionQuestions(questionnaire, section) : questionnaire.questions).map((question) => question.id);

describe("createQuestion", () => {
  it("starts without wording, optional, and with the type's default scale", () => {
    assert.deepEqual(createQuestion("q-1", "section-a"), {
      id: "q-1",
      section: "section-a",
      text: "",
      type: "short-answer",
      variableId: null,
      indicatorId: null,
      required: false,
      helpText: "",
      notes: "",
      options: [],
      rows: [],
      scale: null,
    });
    assert.deepEqual(createQuestion("q-2", "a", { type: "likert" }).scale, createScale("agreement-5"));
    assert.deepEqual(createQuestion("q-2", "a", { type: "semantic-differential" }).scale, createScale("semantic-differential-7"));
    assert.equal(createQuestion("q-2", "a", { indicatorId: "x" }).indicatorId, null, "no indicator without a variable");
    assert.throws(() => createQuestion("q-2", "a", { type: "essay" as QuestionType }), { message: "Unknown question type: essay" });
  });

  it("gives every scale type a scale and no other type one", () => {
    for (const type of QUESTION_TYPES) assert.equal(defaultScaleFor(type) !== null, QUESTION_TYPE_INFO[type].usesScale, type);
  });
});

describe("adding, duplicating and deleting", () => {
  it("adds at the end of a section with the next free id", () => {
    const { questionnaire, id } = addQuestion(built(), "section-a", { type: "numeric", variableId: "var-screen-time", indicatorId: "var-screen-time-ind-1" });
    assert.equal(id, "q-7");
    assert.deepEqual(ids(questionnaire, "section-a"), ["q-3", "q-4", "q-7"]);
    assert.deepEqual(ids(questionnaire), ["q-1", "q-2", "q-3", "q-4", "q-7", "q-5", "q-6"]);
    assert.equal(findQuestion(questionnaire, "q-7").indicatorId, "var-screen-time-ind-1");
    assert.deepEqual(ids(addQuestion(built(), "section-b").questionnaire), ["q-1", "q-2", "q-3", "q-4", "q-7", "q-5", "q-6"], "an empty section's first question is stored in section order");
    assert.throws(() => addQuestion(built(), "appendix"), { message: "Unknown section: appendix" });
  });

  it("never reuses an id, even after deletion", () => {
    const deleted = deleteQuestion(built(), "q-6");
    assert.equal(nextQuestionId(deleted), "q-6");
    const withGap = deleteQuestion(built(), "q-3");
    assert.equal(nextQuestionId(withGap), "q-7");
  });

  it("duplicates straight after the original, keeping its links and copying its lists", () => {
    const edited = updateQuestion(changeType(built(), "q-4", "matrix"), "q-4", { rows: ["I use my phone in bed"], text: "How often?" });
    const { questionnaire, id } = duplicateQuestion(edited, "q-4");
    assert.equal(id, "q-7");
    assert.deepEqual(ids(questionnaire, "section-a"), ["q-3", "q-4", "q-7"]);
    const [original, copy] = [findQuestion(questionnaire, "q-4"), findQuestion(questionnaire, "q-7")];
    assert.deepEqual({ ...copy, id: "q-4" }, original);
    assert.notEqual(copy.rows, original.rows);
    assert.notEqual(copy.scale, original.scale);
  });

  it("deletes one question", () => {
    assert.deepEqual(ids(deleteQuestion(built(), "q-3")), ["q-1", "q-2", "q-4", "q-5", "q-6"]);
    assert.throws(() => deleteQuestion(built(), "q-99"), { message: "Unknown question: q-99" });
  });
});

describe("moving", () => {
  it("moves within its section only, clamped", () => {
    assert.deepEqual(ids(moveQuestion(built(), "q-4", 0)), ["q-1", "q-2", "q-4", "q-3", "q-5", "q-6"]);
    assert.deepEqual(ids(moveQuestion(built(), "q-3", 9)), ["q-1", "q-2", "q-4", "q-3", "q-5", "q-6"]);
    assert.deepEqual(ids(moveQuestion(built(), "q-5", -3)), ids(built()));
    assert.deepEqual(ids(moveQuestion(built(), "q-2", 1)), ids(built()), "the only question in its section stays put");
  });

  it("changes section, joining the end of the new one", () => {
    const moved = changeSection(built(), "q-3", "section-c");
    assert.deepEqual(ids(moved, "section-c"), ["q-5", "q-6", "q-3"]);
    assert.equal(findQuestion(moved, "q-3").section, "section-c");
    const unchanged = built();
    assert.equal(changeSection(unchanged, "q-3", "section-a"), unchanged, "moving to its own section changes nothing");
    assert.deepEqual(ids(changeSection(built(), "q-3", "section-b"), "section-b"), ["q-3"]);
    assert.throws(() => changeSection(built(), "q-3", "appendix"), { message: "Unknown section: appendix" });
  });
});

describe("changeType", () => {
  it("keeps options between option types and drops them for others", () => {
    const withOptions = updateQuestion(built(), "q-2", { options: ["First", "Second"] });
    assert.deepEqual(findQuestion(changeType(withOptions, "q-2", "dropdown"), "q-2").options, ["First", "Second"]);
    assert.deepEqual(findQuestion(changeType(withOptions, "q-2", "numeric"), "q-2").options, []);
  });

  it("keeps a custom scale between Likert and matrix, and gives a semantic differential its own", () => {
    const custom = setScaleLabels(createScale("agreement-5"), ["Never", "Sometimes", "Always"]);
    const likert = setQuestionScale(built(), "q-4", custom);
    assert.deepEqual(findQuestion(changeType(likert, "q-4", "matrix"), "q-4").scale, custom);
    assert.equal(findQuestion(changeType(likert, "q-4", "semantic-differential"), "q-4").scale?.preset, "semantic-differential-7");
    assert.equal(findQuestion(changeType(changeType(likert, "q-4", "semantic-differential"), "q-4", "likert"), "q-4").scale?.preset, "agreement-5");
    assert.equal(findQuestion(changeType(likert, "q-4", "short-answer"), "q-4").scale, null);
  });

  it("gives every type the fields it uses, from any starting type", () => {
    for (const from of QUESTION_TYPES) {
      for (const to of QUESTION_TYPES) {
        const question = findQuestion(changeType(changeType(built(), "q-3", from), "q-3", to), "q-3");
        assert.equal(question.type, to);
        assert.equal(question.scale !== null, QUESTION_TYPE_INFO[to].usesScale, `${from} → ${to}`);
        assert.equal(question.variableId, "var-screen-time", "links survive a type change");
      }
    }
  });

  it("rejects an unknown type", () => {
    assert.throws(() => changeType(built(), "q-3", "essay" as QuestionType), { message: "Unknown question type: essay" });
  });
});

describe("editing details", () => {
  it("sets wording, help, notes and whether an answer is required", () => {
    const edited = updateQuestion(built(), "q-3", { text: "On a weekday, how many hours?", required: true, helpText: "Not counting study.", notes: "From the pilot" });
    const question = findQuestion(edited, "q-3");
    assert.deepEqual([question.text, question.required, question.helpText, question.notes], ["On a weekday, how many hours?", true, "Not counting study.", "From the pilot"]);
  });

  it("refuses options or statements for types without them", () => {
    assert.throws(() => updateQuestion(built(), "q-3", { options: ["A"] }), { message: "Numeric questions don't have options." });
    assert.throws(() => updateQuestion(built(), "q-4", { rows: ["A"] }), { message: "Likert scale questions don't have statements." });
  });

  it("links and unlinks, clearing the indicator with the variable", () => {
    const linked = linkQuestion(built(), "q-3", "var-sleep-quality", "var-sleep-quality-ind-2");
    assert.deepEqual([findQuestion(linked, "q-3").variableId, findQuestion(linked, "q-3").indicatorId], ["var-sleep-quality", "var-sleep-quality-ind-2"]);
    const unlinked = linkQuestion(linked, "q-3", null, "var-sleep-quality-ind-2");
    assert.deepEqual([findQuestion(unlinked, "q-3").variableId, findQuestion(unlinked, "q-3").indicatorId], [null, null]);
  });

  it("sets a scale only on scale types", () => {
    assert.equal(findQuestion(setQuestionScale(built(), "q-4", createScale("frequency-5")), "q-4").scale?.preset, "frequency-5");
    assert.throws(() => setQuestionScale(built(), "q-3", createScale("frequency-5")), { message: "Numeric questions don't use a scale." });
  });
});
