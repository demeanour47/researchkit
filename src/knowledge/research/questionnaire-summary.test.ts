import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildQuestionnaire } from "./questionnaire-builder";
import { addQuestion, changeType, setQuestionScale, updateQuestion } from "./questionnaire-items";
import { createScale, setScaleAnchors } from "./questionnaire-scales";
import { moveSection, setSectionContent } from "./questionnaire-sections";
import {
  EMPTY_SECTION_NOTE,
  PAGE_BREAK_TEXT,
  QUESTIONNAIRE_LIMITATIONS,
  QUESTIONNAIRE_REVIEW_ITEMS,
  REQUIRED_NOTE,
  applyQuestionnaire,
  questionLine,
  questionnaireCounts,
  questionnaireDocument,
  questionnaireMarkdown,
  questionnaireText,
  type DocumentBlock,
} from "./questionnaire-summary";
import { sleepProject } from "./questionnaire-test-helpers";
import { QUESTION_TYPES, type Questionnaire, type QuestionType } from "./questionnaire-types";
import { PROJECT_FIELDS, describeProject } from "./research-project";

const project = sleepProject();
const built = () => buildQuestionnaire(project);
const questionBlocks = (blocks: DocumentBlock[]) => blocks.filter((block): block is Extract<DocumentBlock, { kind: "question" }> => block.kind === "question");

/** One question of every type, in its own section, each with wording. */
function everyType(): Questionnaire {
  let questionnaire: Questionnaire = { title: "Every type", sections: [{ id: "all", kind: "custom", title: "All types", content: "" }], questions: [] };
  for (const type of QUESTION_TYPES) {
    const added = addQuestion(questionnaire, "all", { type, text: `A ${type} question` });
    questionnaire = added.questionnaire;
  }
  return questionnaire;
}

describe("questionnaireDocument", () => {
  it("lays out the title, the cover page, a page break, then each section with its questions", () => {
    const blocks = questionnaireDocument(built(), project);
    assert.deepEqual(
      blocks.slice(0, 8).map((block) => (block.kind === "question" ? `question ${block.number}` : block.kind === "page-break" ? "page-break" : `${block.kind}: ${block.text}`)),
      [
        "title: Screen time and sleep quality",
        `paragraph: ${REQUIRED_NOTE}`,
        "paragraph: [Researcher name, institution and contact details]",
        "page-break",
        "heading: Introduction",
        "paragraph: [Introduce the study in plain language]",
        "heading: Participant information",
        "paragraph: [What taking part involves, how long it takes, how answers are kept confidential, and how to withdraw]",
      ],
    );
  });

  it("numbers questions straight through and marks placeholders", () => {
    const questions = questionBlocks(questionnaireDocument(built(), project));
    assert.deepEqual(
      questions.map((block) => [block.number, block.text, block.placeholder, block.required]),
      [
        ["1", "[consent question, such as agreement to take part]", true, true],
        ["2", "[question about year of study]", true, false],
        ["3", "[question about Weekday screen time]", true, false],
        ["4", "[question about Screen use before bed]", true, false],
        ["5", "[question about Time taken to fall asleep]", true, false],
        ["6", "[question about Feeling rested on waking]", true, false],
      ],
    );
    assert.equal(questionLine(questions[0]), "1. [consent question, such as agreement to take part] (required)");
  });

  it("notes empty question sections instead of leaving them blank", () => {
    const blocks = questionnaireDocument(built(), project);
    const sectionB = blocks.findIndex((block) => block.kind === "heading" && block.text === "Section B");
    assert.deepEqual(blocks[sectionB + 1], { kind: "paragraph", text: EMPTY_SECTION_NOTE, placeholder: true });
  });

  it("uses written text instead of placeholders, and leaves out the required note when nothing is required", () => {
    let questionnaire = setSectionContent(built(), "introduction", "This study is about sleep.");
    questionnaire = updateQuestion(questionnaire, "q-1", { required: false, text: "Do you agree?", helpText: "You can stop at any time." });
    const blocks = questionnaireDocument(questionnaire, project);
    assert.ok(!blocks.some((block) => block.kind === "paragraph" && block.text === REQUIRED_NOTE));
    assert.ok(blocks.some((block) => block.kind === "paragraph" && block.text === "This study is about sleep." && !block.placeholder));
    const [consent] = questionBlocks(blocks);
    assert.deepEqual([consent.text, consent.placeholder, consent.helpText], ["Do you agree?", false, "You can stop at any time."]);
  });

  it("puts no page break after a cover page that ends the questionnaire, or after one that isn't first", () => {
    const onlyCover: Questionnaire = { title: "T", sections: [{ id: "cover", kind: "cover", title: "Cover", content: "" }], questions: [] };
    assert.ok(!questionnaireDocument(onlyCover, project).some((block) => block.kind === "page-break"));
    const moved = questionnaireDocument(moveSection(built(), "cover", 3), project);
    assert.equal(moved.filter((block) => block.kind === "page-break").length, 1, "the break follows the cover wherever it is");
  });

  it("describes the answer for every question type", () => {
    const answers = questionBlocks(questionnaireDocument(everyType(), project)).map((block) => block.answer);
    const byType = Object.fromEntries(QUESTION_TYPES.map((type, index) => [type, answers[index]])) as Record<QuestionType, (typeof answers)[number]>;
    assert.deepEqual(byType["short-answer"], { kind: "lines", count: 1 });
    assert.deepEqual(byType["long-answer"], { kind: "lines", count: 3 });
    assert.deepEqual(byType.paragraph, { kind: "lines", count: 6 });
    assert.deepEqual(byType["multiple-choice"], { kind: "choices", multiple: false, options: [{ text: "[option 1]", placeholder: true }, { text: "[option 2]", placeholder: true }] });
    assert.equal(byType.checkbox.kind === "choices" && byType.checkbox.multiple, true);
    assert.equal(byType.dropdown.kind === "choices" && byType.dropdown.multiple, false);
    assert.deepEqual(byType.likert, { kind: "scale", labels: createScale("agreement-5").labels, rows: null });
    assert.deepEqual(byType["semantic-differential"], { kind: "differential", left: "[word at one end]", right: "[opposite word]", points: ["1", "2", "3", "4", "5", "6", "7"] });
    assert.deepEqual(byType.matrix.kind === "scale" && byType.matrix.rows?.map((row) => row.number), ["9a", "9b"]);
    assert.equal(byType.ranking.kind, "ranking");
    for (const type of ["numeric", "date", "time"] as const) assert.deepEqual(byType[type], { kind: type === "numeric" ? "number" : type });
    assert.deepEqual(byType["yes-no"], { kind: "choices", multiple: false, options: [{ text: "Yes", placeholder: false }, { text: "No", placeholder: false }] });
    assert.deepEqual(byType["true-false"].kind === "choices" && byType["true-false"].options.map((option) => option.text), ["True", "False"]);
    assert.deepEqual(byType["file-upload"], { kind: "file" });
  });

  it("shows a numbered scale's end words on its first and last labels", () => {
    const questionnaire = setQuestionScale(built(), "q-4", setScaleAnchors(createScale("rating-10"), ["Never", "Every night"]));
    const answer = questionBlocks(questionnaireDocument(questionnaire, project))[3].answer;
    assert.equal(answer.kind === "scale" && answer.labels[0], "1 Never");
    assert.equal(answer.kind === "scale" && answer.labels[9], "10 Every night");
  });
});

describe("questionnaireMarkdown", () => {
  const markdown = questionnaireMarkdown(questionnaireDocument(updateQuestion(changeType(built(), "q-5", "matrix"), "q-5", { rows: ["I fall asleep | quickly", "I stay asleep"] }), project));

  it("keeps headings, numbering, instructions and page breaks", () => {
    assert.ok(markdown.startsWith("# Screen time and sleep quality\n\nQuestions marked (required) must be answered.\n\n[Researcher name, institution and contact details]\n\n---\n\n## Introduction\n"));
    assert.ok(markdown.includes("**1.** [consent question, such as agreement to take part] _(required)_\n\n_Choose one._\n\n- ○ Yes\n- ○ No"));
    assert.ok(markdown.endsWith("## Thank you\n\n[Thank participants and give contact details for questions or concerns]\n"));
  });

  it("draws Likert items and matrices as tables, escaping cell text", () => {
    assert.ok(markdown.includes("| Strongly disagree | Disagree | Neither agree nor disagree | Agree | Strongly agree |\n|:---:|:---:|:---:|:---:|:---:|\n| ☐ | ☐ | ☐ | ☐ | ☐ |"));
    assert.ok(markdown.includes("| Statement | Strongly disagree |"));
    assert.ok(markdown.includes("| 5a. I fall asleep \\| quickly | ☐ |"));
    assert.ok(markdown.includes("| 5b. I stay asleep | ☐ |"));
  });

  it("escapes Markdown in the researcher's own text", () => {
    const text = questionnaireMarkdown(questionnaireDocument(updateQuestion(built(), "q-3", { text: "How many *hours* on_screen?" }), project));
    assert.ok(text.includes("**3.** How many \\*hours\\* on\\_screen?"));
    const heading = questionnaireMarkdown([{ kind: "paragraph", text: "# not a heading\n- not a list", placeholder: false }]);
    assert.equal(heading, "\\# not a heading\n\n\\- not a list\n");
  });

  it("draws every answer type", () => {
    const text = questionnaireMarkdown(questionnaireDocument(everyType(), project));
    for (const expected of ["______________________________", "- ☐ [option 1]", "- ____ [option 1]", "| [word at one end] | 1 | 2 |", "Answer: __________", "Day: ____  Month: ____  Year: ______", "Hours: ____  Minutes: ____", "[File upload: online versions only]", "- ○ True"]) {
      assert.ok(text.includes(expected), expected);
    }
  });
});

describe("questionnaireText", () => {
  const text = questionnaireText(questionnaireDocument(everyType(), project));

  it("underlines headings and indents answers under their question", () => {
    assert.ok(text.startsWith("Every type\n==========\n\nAll types\n---------\n\n1. A short-answer question\n   Write your answer.\n   ______________________________"));
    assert.ok(text.includes("4. A multiple-choice question\n   Choose one.\n   ( ) [option 1]\n   ( ) [option 2]"));
    assert.ok(text.includes("5. A checkbox question\n   Choose all that apply.\n   [ ] [option 1]"));
    assert.ok(text.includes("7. A likert question\n   Choose one.\n   ( ) Strongly disagree"));
    assert.ok(text.includes("9. A matrix question\n   Choose one answer in each row.\n   Scale: 1 = Strongly disagree, 2 = Disagree, 3 = Neither agree nor disagree, 4 = Agree, 5 = Strongly agree\n   9a. [statement 1]   (1) (2) (3) (4) (5)"));
    assert.ok(text.includes("10. A ranking question\n    Number the options in order, starting from 1.\n    ____ [option 1]"), "two-digit numbers indent one more space");
  });

  it("marks page breaks in words", () => {
    assert.ok(questionnaireText(questionnaireDocument(built(), project)).includes(`\n\n${PAGE_BREAK_TEXT}\n\n`));
  });
});

describe("questionnaireCounts", () => {
  it("counts sections, questions, required and unwritten questions, by type and by variable", () => {
    const counts = questionnaireCounts(updateQuestion(built(), "q-3", { text: "Hours?" }), project);
    assert.deepEqual([counts.sections, counts.questions, counts.required, counts.unwritten], [11, 6, 1, 5]);
    assert.deepEqual(counts.byType.map((entry) => `${entry.label}: ${entry.count}`), ["Multiple choice: 1", "Likert scale: 2", "Numeric: 2", "Yes/No: 1"]);
    assert.deepEqual(counts.byVariable.map((entry) => `${entry.name}: ${entry.count}`), ["screen time: 2", "sleep quality: 2", "year of study: 1"]);
  });
});

describe("applyQuestionnaire", () => {
  it("updates only the questionnaire in the project draft", () => {
    const updated = applyQuestionnaire(project, built());
    for (const field of PROJECT_FIELDS) if (field !== "questionnaire") assert.deepEqual(updated[field], project[field], field);
    assert.equal(updated.questionnaire?.questions.length, 6);
    assert.equal(project.questionnaire, undefined, "the original draft is unchanged");
  });

  it("stores a cleaned questionnaire and describes it", () => {
    const updated = applyQuestionnaire({}, updateQuestion(built(), "q-3", { text: "  Hours?  " }));
    assert.equal(updated.questionnaire?.questions[2].text, "Hours?");
    assert.deepEqual(describeProject(updated), [{ field: "questionnaire", label: "Questionnaire", value: "Screen time and sleep quality: 11 sections, 6 questions." }]);
    assert.deepEqual(describeProject(applyQuestionnaire({}, { title: "", sections: [{ id: "a", kind: "items", title: "A", content: "" }], questions: [] })), [
      { field: "questionnaire", label: "Questionnaire", value: "Untitled questionnaire: 1 section, 0 questions." },
    ]);
  });
});

describe("limitations and review items", () => {
  it("states that wording is never written for the researcher, and what the checks can't judge", () => {
    assert.match(QUESTIONNAIRE_LIMITATIONS[0], /never writes question wording/);
    assert.ok(QUESTIONNAIRE_LIMITATIONS.some((item) => item.includes("can't tell whether a question is clear")));
  });

  it("leaves placeholders for instrument, measurement, wording, references and translation review", () => {
    assert.deepEqual(QUESTIONNAIRE_REVIEW_ITEMS.map((item) => item.split(":")[0]), ["Instrument review", "Measurement review", "Question wording review", "References", "Translation review"]);
  });
});
