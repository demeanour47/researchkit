import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_QUESTIONNAIRE, sectionQuestions } from "./questionnaire";
import { buildQuestionnaire } from "./questionnaire-builder";
import { DEFAULT_SECTIONS, addSection, moveSection, removeSection, renameSection, sectionText, setQuestionnaireTitle, setSectionContent } from "./questionnaire-sections";
import { sleepProject } from "./questionnaire-test-helpers";

const built = () => buildQuestionnaire(sleepProject());
const titles = (questionnaire: { sections: readonly { title: string }[] }) => questionnaire.sections.map((section) => section.title);

describe("DEFAULT_SECTIONS", () => {
  it("follows the standard questionnaire structure, from cover page to thanks", () => {
    assert.deepEqual(titles({ sections: DEFAULT_SECTIONS }), [
      "Cover page",
      "Introduction",
      "Participant information",
      "Consent",
      "About you",
      "Section A",
      "Section B",
      "Section C",
      "Your views in your own words",
      "Closing note",
      "Thank you",
    ]);
    assert.ok(DEFAULT_SECTIONS.every((section) => section.content === ""), "no section text is written for the researcher");
  });
});

describe("sectionText", () => {
  it("shows the researcher's text, a placeholder where text is expected, or nothing", () => {
    assert.deepEqual(sectionText({ id: "consent", kind: "consent", title: "Consent", content: " I agree. " }), { text: "I agree.", placeholder: false });
    assert.deepEqual(sectionText({ id: "consent", kind: "consent", title: "Consent", content: "" }), { text: "[Consent statement approved by your ethics committee]", placeholder: true });
    assert.equal(sectionText({ id: "section-a", kind: "items", title: "Section A", content: "  " }), null);
  });
});

describe("addSection", () => {
  it("adds before the closing note, with a new id each time", () => {
    const first = addSection(built(), "  Your   studies ");
    assert.equal(first.id, "section-1");
    const second = addSection(first.questionnaire, "Your evenings", "items");
    assert.equal(second.id, "section-2");
    assert.deepEqual(titles(second.questionnaire).slice(-4), ["Your studies", "Your evenings", "Closing note", "Thank you"]);
    assert.equal(second.questionnaire.sections.find((section) => section.id === "section-2")?.kind, "items");
  });

  it("adds at the end when there is no closing note or thank-you", () => {
    const { questionnaire } = addSection(EMPTY_QUESTIONNAIRE, "Only section");
    assert.deepEqual(titles(questionnaire), ["Only section"]);
  });

  it("needs a title", () => {
    assert.throws(() => addSection(built(), "   "), { message: "A section needs a title." });
  });
});

describe("renameSection and setSectionContent", () => {
  it("renames and sets text without touching other sections", () => {
    let questionnaire = renameSection(built(), "section-a", " Your screen use ");
    questionnaire = setSectionContent(questionnaire, "introduction", "This study is about sleep.\n");
    assert.equal(questionnaire.sections[5].title, "Your screen use");
    assert.equal(questionnaire.sections[1].content, "This study is about sleep.\n", "kept as typed until the draft cleans it");
    assert.deepEqual(questionnaire.sections.filter((section) => !["section-a", "introduction"].includes(section.id)), built().sections.filter((section) => !["section-a", "introduction"].includes(section.id)));
    assert.throws(() => renameSection(questionnaire, "section-a", ""), { message: "A section needs a title." });
    assert.throws(() => renameSection(questionnaire, "appendix", "Appendix"), { message: "Unknown section: appendix" });
  });

  it("sets the questionnaire title", () => {
    assert.equal(setQuestionnaireTitle(built(), "Sleep survey").title, "Sleep survey");
  });
});

describe("moveSection", () => {
  it("moves a section with its questions, clamped to the list", () => {
    const moved = moveSection(built(), "section-c", 2);
    assert.deepEqual(moved.sections.map((section) => section.id).slice(0, 4), ["cover", "introduction", "section-c", "participant-information"]);
    assert.deepEqual(sectionQuestions(moved, "section-c").map((question) => question.id), ["q-5", "q-6"]);
    assert.equal(moveSection(built(), "cover", 99).sections.at(-1)?.id, "cover");
    assert.equal(moveSection(built(), "thank-you", -5).sections[0].id, "thank-you");
  });
});

describe("removeSection", () => {
  it("removes the section and its questions only", () => {
    const removed = removeSection(built(), "section-a");
    assert.ok(!removed.sections.some((section) => section.id === "section-a"));
    assert.deepEqual(removed.questions.map((question) => question.id), ["q-1", "q-2", "q-5", "q-6"]);
    assert.throws(() => removeSection(removed, "section-a"), { message: "Unknown section: section-a" });
  });
});
