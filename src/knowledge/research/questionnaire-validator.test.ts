import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildQuestionnaire } from "./questionnaire-builder";
import { addQuestion, changeType, deleteQuestion, linkQuestion, setQuestionScale, updateQuestion } from "./questionnaire-items";
import { createScale, setReverseScored } from "./questionnaire-scales";
import { moveSection, removeSection, setSectionContent } from "./questionnaire-sections";
import { sleepProject, sleepVariables } from "./questionnaire-test-helpers";
import { checkQuestionnaire } from "./questionnaire-validator";
import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { addIndicator } from "./variable-builder";
import { applyVariables } from "./variable-summary";

/** The sleep project with an indicator for year of study, so every variable has one. */
function project(): ResearchProjectDraft {
  return applyVariables(sleepProject(), addIndicator(sleepVariables(), "var-year-of-study", { name: "Year enrolled in", level: "ordinal" }));
}
const statuses = (questionnaire: ReturnType<typeof buildQuestionnaire>, draft = project()) => Object.fromEntries(checkQuestionnaire(questionnaire, draft).map((check) => [check.check, check.status]));
const check = (questionnaire: ReturnType<typeof buildQuestionnaire>, id: string, draft = project()) => checkQuestionnaire(questionnaire, draft).find((candidate) => candidate.check === id);

/** A questionnaire with every placeholder filled in, so only real problems remain. */
function complete() {
  const draft = project();
  let questionnaire = buildQuestionnaire(draft);
  questionnaire = setSectionContent(questionnaire, "consent", "I understand the study and agree to take part.");
  const wording: Record<string, string> = { "q-1": "Do you agree to take part?", "q-2": "Which year are you in?", "q-3": "How many hours a weekday?", "q-4": "I use screens in bed.", "q-5": "How long to fall asleep?", "q-6": "I wake up rested." };
  for (const [id, text] of Object.entries(wording)) questionnaire = updateQuestion(questionnaire, id, { text });
  questionnaire = updateQuestion(questionnaire, "q-2", { options: ["First", "Second", "Third"] });
  return removeSection(questionnaire, "section-b");
}

describe("checkQuestionnaire", () => {
  it("finds a complete questionnaire aligned throughout, never scoring it", () => {
    assert.deepEqual(statuses(complete()), {
      duplicates: "aligned",
      variables: "aligned",
      indicators: "aligned",
      orphans: "aligned",
      scales: "aligned",
      consent: "aligned",
      demographics: "aligned",
      "dependent-coverage": "aligned",
      "independent-coverage": "aligned",
      hypotheses: "aligned",
      objectives: "review",
    });
    for (const result of checkQuestionnaire(complete(), project())) assert.ok(!/\b(score|rank|grade|percent)/i.test(result.explanation), result.check);
  });

  it("says which objectives don't name a variable, for checking by hand", () => {
    assert.equal(check(complete(), "objectives")?.explanation, "These objectives don't name a variable, so check by hand which questions serve them: “To describe how students spend their evenings”.");
    const one = updateProjectDraft(project(), { researchObjectives: ["To examine the relationship between screen time and sleep quality"] });
    assert.equal(statuses(complete(), one).objectives, "aligned");
  });

  it("finds duplicate wording, ignoring case and punctuation", () => {
    const questionnaire = updateQuestion(complete(), "q-5", { text: "how many HOURS a weekday" });
    const duplicates = check(questionnaire, "duplicates")!;
    assert.equal(duplicates.status, "worth-checking");
    assert.deepEqual(duplicates.questions, ["Question 3", "Question 5"]);
  });

  it("reports a project without variables as missing", () => {
    const questionnaire = buildQuestionnaire({});
    assert.equal(statuses(questionnaire, {}).variables, "missing");
    assert.equal(statuses(questionnaire, {})["dependent-coverage"], "review");
  });

  it("names variables with no question", () => {
    const questionnaire = deleteQuestion(complete(), "q-2");
    assert.equal(check(questionnaire, "variables")?.explanation, "year of study has no question yet. Measure it, or record why not.");
  });

  it("reports variables without indicators, then questions not linked to one", () => {
    assert.equal(check(buildQuestionnaire(sleepProject()), "indicators", sleepProject())?.status, "missing");
    const unlinked = linkQuestion(complete(), "q-3", "var-screen-time", null);
    const indicators = check(unlinked, "indicators")!;
    assert.equal(indicators.status, "clarify");
    assert.deepEqual(indicators.questions, ["Question 3"]);
  });

  it("asks for clarification of questions linked to nothing, but only reviews open-ended ones", () => {
    let questionnaire = linkQuestion(complete(), "q-4", null);
    questionnaire = addQuestion(questionnaire, "open-ended", { type: "long-answer", text: "Anything else?" }).questionnaire;
    assert.equal(check(questionnaire, "orphans")?.status, "clarify");
    assert.deepEqual(check(questionnaire, "orphans")?.questions, ["Question 4"]);
    assert.equal(check(questionnaire, "open-ended")?.status, "review");
    assert.equal(check(linkQuestion(complete(), "q-4", "var-deleted"), "orphans")?.status, "clarify", "a variable that no longer exists");
  });

  it("checks scales: broken, mixed within a variable, placeholders, and reverse scoring", () => {
    const broken = setQuestionScale(complete(), "q-4", { ...createScale("agreement-5"), values: [1, 3, 2, 4, 5] });
    assert.equal(check(broken, "scales")?.status, "clarify");
    const mixed = setQuestionScale(changeType(complete(), "q-3", "likert"), "q-3", createScale("frequency-5"));
    assert.equal(check(mixed, "scales")?.status, "worth-checking");
    assert.match(check(mixed, "scales")!.explanation, /^Questions measuring screen time use different scales/);
    const placeholders = setQuestionScale(complete(), "q-4", createScale("rating-10"));
    assert.equal(check(placeholders, "scales")?.status, "clarify");
    const reversed = setQuestionScale(complete(), "q-6", setReverseScored(createScale("agreement-5"), true));
    assert.equal(check(reversed, "reverse")?.status, "review");
    assert.equal(check(complete(), "reverse"), undefined);
  });

  it("checks consent: missing, incomplete, late or in place", () => {
    assert.equal(statuses(removeSection(complete(), "consent")).consent, "missing");
    assert.equal(statuses(deleteQuestion(setSectionContent(complete(), "consent", ""), "q-1")).consent, "missing");
    assert.equal(check(buildQuestionnaire(project()), "consent")?.explanation, "Add the consent statement approved by your ethics committee.");
    assert.equal(check(deleteQuestion(complete(), "q-1"), "consent")?.explanation, "Add a question recording the participant's agreement.");
    assert.equal(statuses(moveSection(complete(), "consent", 8)).consent, "worth-checking");
  });

  it("checks for demographic questions", () => {
    assert.equal(statuses(removeSection(complete(), "demographics")).demographics, "worth-checking");
    assert.equal(check(deleteQuestion(complete(), "q-2"), "demographics")?.explanation, "The demographic section has no questions. Add the participant characteristics your analysis needs, such as your control variables.");
  });

  it("reports dependent and independent variables no question measures as missing", () => {
    const noOutcome = deleteQuestion(deleteQuestion(complete(), "q-5"), "q-6");
    assert.equal(statuses(noOutcome)["dependent-coverage"], "missing");
    assert.equal(check(noOutcome, "dependent-coverage")?.explanation, "No question measures sleep quality.");
    assert.equal(statuses(removeSection(complete(), "section-a"))["independent-coverage"], "missing");
  });

  it("checks every hypothesis's variables have questions", () => {
    const noScreen = removeSection(complete(), "section-a");
    assert.equal(statuses(noScreen).hypotheses, "worth-checking");
    assert.match(check(noScreen, "hypotheses")!.explanation, /needs screen time/);
    assert.equal(statuses(complete(), updateProjectDraft(project(), { hypotheses: null })).hypotheses, "review");
  });

  it("checks objectives name only measured variables", () => {
    assert.equal(statuses(removeSection(complete(), "section-c")).objectives, "worth-checking");
    assert.equal(statuses(complete(), updateProjectDraft(project(), { researchObjectives: null })).objectives, "review");
  });

  it("lists wording still to write, missing options and empty sections for review", () => {
    const fresh = buildQuestionnaire(project());
    assert.equal(check(fresh, "wording")?.explanation, "6 questions are still a placeholder: Question 1, Question 2, Question 3, Question 4, Question 5 and Question 6. The builder never writes questions for you.");
    assert.equal(check(fresh, "options")?.status, "clarify");
    assert.deepEqual(check(fresh, "options")?.questions, ["Question 2"]);
    assert.equal(check(fresh, "empty-sections")?.explanation, "Section B has no questions. Add some, or remove it.");
    assert.equal(check(complete(), "wording"), undefined);
  });

  it("uses only the shared statuses", () => {
    const allowed = new Set(["aligned", "worth-checking", "missing", "clarify", "review"]);
    for (const questionnaire of [buildQuestionnaire({}), buildQuestionnaire(project()), complete()]) {
      for (const result of checkQuestionnaire(questionnaire, project())) assert.ok(allowed.has(result.status), result.check);
    }
  });
});
