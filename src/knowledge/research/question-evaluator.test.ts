import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUESTION_BUILDER_LIMITATIONS, checkConsistency, evaluateQuestion } from "./question-evaluator";
import { createProjectDraft, type ResearchProjectDraft } from "./research-project";

const project = createProjectDraft({
  topic: "screen time and sleep",
  researchAim: "To examine how screen time affects sleep quality among students",
  population: "first-year university students",
  location: "Nepal",
  timeContext: "2025",
  independentVariables: ["screen time"],
  dependentVariables: ["sleep quality"],
});
const good = "What is the relationship between screen time and sleep quality among first-year university students in Nepal in 2025?";
const texts = (items: { text: string }[]) => items.map((item) => item.text);

describe("evaluateQuestion", () => {
  it("finds strengths and nothing to fix in a well-formed question", () => {
    const evaluation = evaluateQuestion(good, project, "relational");
    assert.deepEqual(texts(evaluation.strengths), [
      "It is an open question.",
      "Its length (18 words) is manageable.",
      "The wording signals the type of question (relational).",
      "It names the independent variable: “screen time”.",
      "It names the dependent variable: “sleep quality”.",
      "It names the population: “first-year university students”.",
    ]);
    assert.deepEqual(evaluation.weaknesses, []);
    assert.deepEqual(evaluation.missing, []);
    assert.deepEqual(evaluation.improvements, []);
  });

  it("explains every strength, weakness, gap and improvement", () => {
    const evaluation = evaluateQuestion("social media is good for teenagers", {}, "explanatory");
    for (const item of [...evaluation.strengths, ...evaluation.weaknesses, ...evaluation.missing, ...evaluation.improvements]) {
      assert.ok(item.why.length > 20, item.text);
    }
  });

  it("identifies common weaknesses, each with a matching improvement", () => {
    const evaluation = evaluateQuestion("Should schools ban phones?", {}, null);
    assert.deepEqual(texts(evaluation.weaknesses), [
      "It can be answered with yes or no.",
      "It asks what “should” happen.",
      "It is short (4 words) and may be too broad.",
    ]);
    assert.deepEqual(texts(evaluation.improvements), [
      "Consider starting with “To what extent”, “How” or “What”.",
      "Ask what the evidence shows, for example about effects, experiences or outcomes.",
      "Add the population, setting or time frame you will study.",
      "Add the population to the question.",
    ]);
  });

  it("notices a statement, vague words and more than one question", () => {
    const evaluation = evaluateQuestion(
      "Effective teaching improves outcomes for various pupils and why teachers matter in modern schools today",
      {},
      null,
    );
    const weaknesses = texts(evaluation.weaknesses);
    assert.ok(weaknesses.includes("It is written as a statement, not a question."));
    assert.ok(weaknesses.includes("It may contain more than one question."));
    assert.ok(weaknesses.includes("It uses words that need defining: “effective”, “various”, “modern”."));
  });

  it("treats two linked parts as a strength in a mixed methods question", () => {
    const evaluation = evaluateQuestion(
      "To what extent does screen time affect sleep quality among first-year university students, and how do they explain the effect?",
      project,
      "mixed-methods",
    );
    assert.ok(texts(evaluation.strengths).includes("It links a measured part and an interpretive part."));
    assert.ok(!texts(evaluation.weaknesses).includes("It may contain more than one question."));
  });

  it("points out when the wording doesn't match the chosen type", () => {
    const evaluation = evaluateQuestion("How do students experience sleep loss?", project, "predictive");
    assert.ok(texts(evaluation.weaknesses).includes("The wording doesn't clearly signal the predictive type you chose."));
    assert.ok(texts(evaluation.improvements).includes("If you mean to ask a predictive question, consider an opening such as “To what extent does … predict…”."));
  });

  it("lists missing information with reasons, including project details not in the question", () => {
    const evaluation = evaluateQuestion("What is the level of sleep quality?", project, "descriptive");
    assert.deepEqual(texts(evaluation.missing), [
      "Population (in your details, not in the question)",
      "Context (in your details, not in the question)",
      "Time (in your details, not in the question)",
    ]);
    const bare = evaluateQuestion("What is the level of stress?", {}, "descriptive");
    assert.deepEqual(texts(bare.missing), ["Population", "Research aim", "Topic"]);
  });

  it("records the question in an updated project draft without losing anything", () => {
    const evaluation = evaluateQuestion(`  ${good}  `, project, "relational");
    assert.deepEqual(evaluation.project, { ...project, researchQuestion: good });
    assert.equal(project.researchQuestion, undefined, "the original draft is unchanged");
    assert.equal(evaluateQuestion("   ", { ...project, researchQuestion: "old" }).project.researchQuestion, undefined);
  });

  it("includes academic notes with genuine references for each type", () => {
    const evaluation = evaluateQuestion(good, project, "relational");
    assert.deepEqual(
      evaluation.academicNotes.map((note) => note.references.map((reference) => reference.cite)),
      [["White, 2009"], ["Creswell & Creswell, 2018", "White, 2009"], ["Hulley et al., 2013"]],
    );
  });

  it("handles an empty question without errors", () => {
    const evaluation = evaluateQuestion("", {}, null);
    assert.equal(evaluation.question, "");
    assert.deepEqual(evaluation.strengths, []);
    assert.deepEqual(evaluation.detectedTypes, []);
    assert.deepEqual(evaluation.consistency, []);
    assert.equal(evaluation.finer.length, 5);
  });

  it("states what the tool can't determine", () => {
    const text = QUESTION_BUILDER_LIMITATIONS.join(" ");
    for (const limit of ["quality", "original", "publishable", "supervisor"]) assert.ok(text.includes(limit), limit);
  });
});

describe("research onion integration", () => {
  const withOnion = (selection: ResearchProjectDraft["researchOnionSelection"], methodology?: ResearchProjectDraft["methodology"]) =>
    createProjectDraft({ ...project, researchOnionSelection: selection, methodology });
  const statuses = (question: string, draft: ResearchProjectDraft) =>
    checkConsistency(question, draft).map((note) => `${note.choice}:${note.status}`);

  const measurable = "How many hours of sleep do first-year university students get?";
  const interpretive = "How do first-year university students experience sleep loss?";

  it("says nothing without a philosophy, approach or methodology", () => {
    assert.deepEqual(checkConsistency(good, project), []);
  });

  it("finds measurable wording consistent with Positivism, and interpretive wording worth checking", () => {
    assert.deepEqual(statuses(measurable, withOnion({ philosophy: "positivism" })), ["Positivism:consistent"]);
    assert.deepEqual(statuses(interpretive, withOnion({ philosophy: "positivism" })), ["Positivism:worth-checking"]);
  });

  it("finds interpretive wording consistent with Interpretivism, and measurable wording worth checking", () => {
    assert.deepEqual(statuses(interpretive, withOnion({ philosophy: "interpretivism" })), ["Interpretivism:consistent"]);
    assert.deepEqual(statuses(measurable, withOnion({ philosophy: "interpretivism" })), ["Interpretivism:worth-checking"]);
  });

  it("explains each note using the onion's own description of the choice", () => {
    const [note] = checkConsistency(interpretive, withOnion({ philosophy: "positivism" }));
    assert.equal(note.why, "Positivism usually begins from objective measurement.");
    assert.match(note.text, /If you keep a positivist position, consider how these will be measured\./);
  });

  it("never tells the researcher they must change", () => {
    for (const philosophy of ["positivism", "interpretivism", "pragmatism", "realism"]) {
      for (const approach of ["deductive", "inductive", "abductive"]) {
        for (const question of [measurable, interpretive, good]) {
          for (const note of checkConsistency(question, withOnion({ philosophy, approach }, "mixed-methods"))) {
            assert.ok(!/\b(must|wrong|incorrect|invalid|not allowed)\b/i.test(note.text), note.text);
          }
        }
      }
    }
  });

  it("checks the approach against the question's structure", () => {
    assert.deepEqual(statuses(good, withOnion({ approach: "deductive" })), ["Deductive:consistent"]);
    assert.deepEqual(statuses(interpretive, withOnion({ approach: "deductive" })), ["Deductive:worth-checking"]);
    assert.deepEqual(statuses(interpretive, withOnion({ approach: "inductive" })), ["Inductive:consistent"]);
    assert.deepEqual(statuses("To what extent does screen time predict sleep quality?", withOnion({ approach: "inductive" })), ["Inductive:worth-checking"]);
    assert.deepEqual(statuses("Why do students lose sleep?", withOnion({ approach: "abductive" })), ["Abductive:consistent"]);
  });

  it("checks realism and pragmatism", () => {
    assert.deepEqual(statuses("Why do students lose sleep?", withOnion({ philosophy: "realism" })), ["Realism:consistent"]);
    assert.deepEqual(statuses(measurable, withOnion({ philosophy: "realism" })), ["Realism:worth-checking"]);
    assert.deepEqual(statuses(measurable, withOnion({ philosophy: "pragmatism" })), ["Pragmatism:consistent"]);
  });

  it("checks the methodology, and notices when it differs from the onion's choice", () => {
    assert.deepEqual(statuses(measurable, withOnion(undefined, "quantitative")), ["Quantitative:consistent"]);
    assert.deepEqual(statuses(measurable, withOnion(undefined, "qualitative")), ["Qualitative:worth-checking"]);
    assert.deepEqual(statuses(measurable, withOnion({ choice: "quantitative" })), ["Quantitative:consistent"]);
    assert.deepEqual(statuses(measurable, withOnion({ choice: "quantitative" }, "qualitative")), [
      "Qualitative:worth-checking",
      "Qualitative:worth-checking",
    ]);
  });

  it("adds a realist academic note when the philosophy is realism", () => {
    const evaluation = evaluateQuestion("Why do students lose sleep?", withOnion({ philosophy: "realism" }), null);
    assert.ok(evaluation.academicNotes.some((note) => note.references.some((reference) => reference.cite === "Pawson & Tilley, 1997")));
  });
});
