/**
 * The questionnaire as a document: one sequence of blocks (title, headings, text,
 * numbered questions, page breaks) that every preview and export draws from, so
 * numbering, sections, tables and scales are identical in all of them. Also the
 * Markdown and plain-text exports, a count of what the questionnaire contains, and
 * the update to the project draft.
 */

import { answerOptions, matrixRows, orderedQuestions, questionNumbers, questionWording, rowLetter, type Wording } from "./questionnaire";
import { questionnaireVariables } from "./questionnaire-builder";
import { displayLabels } from "./questionnaire-scales";
import { sectionText } from "./questionnaire-sections";
import { MEASURING_SECTIONS, QUESTIONNAIRE_PLACEHOLDERS, QUESTION_TYPES, QUESTION_TYPE_INFO, type Question, type Questionnaire, type QuestionType } from "./questionnaire-types";
import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";

export type Answer =
  | { kind: "lines"; count: number }
  | { kind: "choices"; options: Wording[]; multiple: boolean }
  | { kind: "ranking"; options: Wording[] }
  /** A Likert item (rows null) or a matrix table (one row per statement), on one scale. */
  | { kind: "scale"; labels: string[]; rows: { number: string; text: Wording }[] | null }
  | { kind: "differential"; left: string; right: string; points: string[] }
  | { kind: "number" }
  | { kind: "date" }
  | { kind: "time" }
  | { kind: "file" };

export type DocumentBlock =
  | { kind: "title"; text: string; placeholder: boolean }
  | { kind: "heading"; text: string; sectionId: string }
  | { kind: "paragraph"; text: string; placeholder: boolean }
  | { kind: "question"; id: string; number: string; text: string; placeholder: boolean; required: boolean; helpText: string; instruction: string; answer: Answer }
  | { kind: "page-break" };

export const REQUIRED_NOTE = "Questions marked (required) must be answered.";
export const EMPTY_SECTION_NOTE = "[No questions in this section yet]";

function answerFor(question: Question, number: string): Answer {
  const info = QUESTION_TYPE_INFO[question.type];
  switch (info.form) {
    case "text":
      return { kind: "lines", count: info.lines };
    case "choice":
      return { kind: "choices", options: answerOptions(question), multiple: question.type === "checkbox" };
    case "ranking":
      return { kind: "ranking", options: answerOptions(question) };
    case "scale":
      return { kind: "scale", labels: displayLabels(question.scale!), rows: null };
    case "matrix":
      return { kind: "scale", labels: displayLabels(question.scale!), rows: matrixRows(question).map((text, index) => ({ number: `${number}${rowLetter(index)}`, text })) };
    case "differential": {
      const scale = question.scale!;
      const [left, right] = scale.anchors ?? [scale.labels[0], scale.labels[scale.labels.length - 1]];
      return { kind: "differential", left, right, points: [...scale.labels] };
    }
    default:
      return { kind: info.form };
  }
}

/**
 * The questionnaire as blocks, in reading order. The cover page holds the title and
 * its text and ends with a page break. Placeholders stand wherever wording is still
 * to be written, so nothing is invented and nothing is silently left out.
 */
export function questionnaireDocument(questionnaire: Questionnaire, project: ResearchProjectDraft): DocumentBlock[] {
  const variables = questionnaireVariables(project);
  const numbers = questionNumbers(questionnaire);
  const title = questionnaire.title.trim();
  const blocks: DocumentBlock[] = [{ kind: "title", text: title || QUESTIONNAIRE_PLACEHOLDERS.title, placeholder: !title }];
  if (questionnaire.questions.some((question) => question.required)) blocks.push({ kind: "paragraph", text: REQUIRED_NOTE, placeholder: false });

  questionnaire.sections.forEach((section, index) => {
    const text = sectionText(section);
    if (section.kind === "cover") {
      if (text) blocks.push({ kind: "paragraph", ...text });
    } else {
      blocks.push({ kind: "heading", text: section.title, sectionId: section.id });
      if (text) blocks.push({ kind: "paragraph", ...text });
    }
    const questions = questionnaire.questions.filter((question) => question.section === section.id);
    for (const question of questions) {
      const number = numbers.get(question.id)!;
      const wording = questionWording(question, variables, section.kind);
      blocks.push({
        kind: "question",
        id: question.id,
        number,
        text: wording.text,
        placeholder: wording.placeholder,
        required: question.required,
        helpText: question.helpText.trim(),
        instruction: QUESTION_TYPE_INFO[question.type].instruction,
        answer: answerFor(question, number),
      });
    }
    if (questions.length === 0 && (MEASURING_SECTIONS.has(section.kind) || section.kind === "open-ended")) blocks.push({ kind: "paragraph", text: EMPTY_SECTION_NOTE, placeholder: true });
    if (section.kind === "cover" && index < questionnaire.sections.length - 1) blocks.push({ kind: "page-break" });
  });
  return blocks;
}

/** The question line as printed: number, wording, and whether an answer is required. */
export const questionLine = (block: Extract<DocumentBlock, { kind: "question" }>) => `${block.number}. ${block.text}${block.required ? " (required)" : ""}`;

// Markdown.

const escapeMarkdown = (text: string) => text.replace(/([\\`*_|])/g, "\\$1").replace(/^([#>+-]|\d+\.)(\s)/gm, "\\$1$2");
const cell = (text: string) => escapeMarkdown(text).replace(/\n/g, " ");
const BOX = "☐";
const CIRCLE = "○";
const RULE = "______________________________";

function markdownAnswer(answer: Answer): string[] {
  switch (answer.kind) {
    case "lines":
      return Array.from({ length: answer.count }, () => RULE);
    case "choices":
      return answer.options.map((option) => `- ${answer.multiple ? BOX : CIRCLE} ${escapeMarkdown(option.text)}`);
    case "ranking":
      return answer.options.map((option) => `- ____ ${escapeMarkdown(option.text)}`);
    case "scale": {
      if (!answer.rows) return [`| ${answer.labels.map(cell).join(" | ")} |`, `|${answer.labels.map(() => ":---:").join("|")}|`, `| ${answer.labels.map(() => BOX).join(" | ")} |`];
      return [
        `| Statement | ${answer.labels.map(cell).join(" | ")} |`,
        `|---|${answer.labels.map(() => ":---:").join("|")}|`,
        ...answer.rows.map((row) => `| ${row.number}. ${cell(row.text.text)} | ${answer.labels.map(() => BOX).join(" | ")} |`),
      ];
    }
    case "differential":
      return [`| ${cell(answer.left)} | ${answer.points.map(cell).join(" | ")} | ${cell(answer.right)} |`, `|---|${answer.points.map(() => ":---:").join("|")}|---|`, `| | ${answer.points.map(() => BOX).join(" | ")} | |`];
    case "number":
      return ["Answer: __________"];
    case "date":
      return ["Day: ____  Month: ____  Year: ______"];
    case "time":
      return ["Hours: ____  Minutes: ____"];
    case "file":
      return ["[File upload: online versions only]"];
  }
}

/** The questionnaire as Markdown, with tables for scales and a rule for each page break. */
export function questionnaireMarkdown(blocks: readonly DocumentBlock[]): string {
  const out: string[] = [];
  for (const block of blocks) {
    if (block.kind === "title") out.push(`# ${escapeMarkdown(block.text)}`);
    else if (block.kind === "heading") out.push(`## ${escapeMarkdown(block.text)}`);
    else if (block.kind === "paragraph") out.push(...block.text.split("\n").map(escapeMarkdown));
    else if (block.kind === "page-break") out.push("---");
    else {
      const lines = [`**${block.number}.** ${escapeMarkdown(block.text)}${block.required ? " _(required)_" : ""}`, "", `_${block.instruction}_`];
      if (block.helpText) lines.push("", escapeMarkdown(block.helpText));
      lines.push("", ...markdownAnswer(block.answer));
      out.push(lines.join("\n"));
    }
  }
  return `${out.join("\n\n")}\n`;
}

// Plain text.

function textAnswer(answer: Answer): string[] {
  switch (answer.kind) {
    case "lines":
      return Array.from({ length: answer.count }, () => RULE);
    case "choices":
      return answer.options.map((option) => `${answer.multiple ? "[ ]" : "( )"} ${option.text}`);
    case "ranking":
      return answer.options.map((option) => `____ ${option.text}`);
    case "scale": {
      const key = answer.labels.map((label, index) => `${index + 1} = ${label}`).join(", ");
      const choices = answer.labels.map((_, index) => `(${index + 1})`).join(" ");
      if (!answer.rows) return answer.labels.map((label) => `( ) ${label}`);
      return [`Scale: ${key}`, ...answer.rows.map((row) => `${row.number}. ${row.text.text}   ${choices}`)];
    }
    case "differential":
      return [`${answer.left}   ${answer.points.map((point) => `(${point})`).join(" ")}   ${answer.right}`];
    case "number":
      return ["Answer: __________"];
    case "date":
      return ["Day: ____  Month: ____  Year: ______"];
    case "time":
      return ["Hours: ____  Minutes: ____"];
    case "file":
      return ["[File upload: online versions only]"];
  }
}

const underline = (text: string, character: string) => `${text}\n${character.repeat(Math.min(72, Math.max(3, text.length)))}`;
export const PAGE_BREAK_TEXT = "- - - - - - - - - - page break - - - - - - - - - -";

/** The questionnaire as plain text, for pasting anywhere. Answers are indented under their question. */
export function questionnaireText(blocks: readonly DocumentBlock[]): string {
  const out: string[] = [];
  for (const block of blocks) {
    if (block.kind === "title") out.push(underline(block.text, "="));
    else if (block.kind === "heading") out.push(underline(block.text, "-"));
    else if (block.kind === "paragraph") out.push(block.text);
    else if (block.kind === "page-break") out.push(PAGE_BREAK_TEXT);
    else {
      const indent = " ".repeat(block.number.length + 2);
      const lines = [questionLine(block), `${indent}${block.instruction}`];
      if (block.helpText) lines.push(`${indent}${block.helpText}`);
      lines.push(...textAnswer(block.answer).map((line) => `${indent}${line}`));
      out.push(lines.join("\n"));
    }
  }
  return `${out.join("\n\n")}\n`;
}

// What the questionnaire contains.

export interface QuestionnaireCounts {
  sections: number;
  questions: number;
  required: number;
  /** Questions whose wording is still a placeholder. */
  unwritten: number;
  byType: { type: QuestionType; label: string; count: number }[];
  byVariable: { id: string; name: string; count: number }[];
}

/** Counts of what the questionnaire contains. Counts describe it; they never grade it. */
export function questionnaireCounts(questionnaire: Questionnaire, project: ResearchProjectDraft): QuestionnaireCounts {
  const questions = orderedQuestions(questionnaire);
  return {
    sections: questionnaire.sections.length,
    questions: questions.length,
    required: questions.filter((question) => question.required).length,
    unwritten: questions.filter((question) => !question.text.trim()).length,
    byType: QUESTION_TYPES.map((type) => ({ type, label: QUESTION_TYPE_INFO[type].label, count: questions.filter((question) => question.type === type).length })).filter((entry) => entry.count > 0),
    byVariable: questionnaireVariables(project).map((variable) => ({ id: variable.id, name: variable.name, count: questions.filter((question) => question.variableId === variable.id).length })),
  };
}

/** The project draft with its questionnaire replaced. No other field changes. */
export function applyQuestionnaire(project: ResearchProjectDraft, questionnaire: Questionnaire): ResearchProjectDraft {
  return updateProjectDraft(project, { questionnaire });
}

/** Everything the Questionnaire Builder can't do, stated on the page. */
export const QUESTIONNAIRE_LIMITATIONS: readonly string[] = [
  "The builder never writes question wording. It uses your own draft items where you have them and otherwise leaves a placeholder naming what the question should measure.",
  "Suggested question types come from each indicator's measurement level. They are starting points: check that each suits what you are measuring.",
  "Scale labels are conventional wordings; their sources are awaiting academic review. Validated instruments must keep their published wording and scales.",
  "Checks look at structure and links, not wording quality. They can't tell whether a question is clear, neutral or valid; that needs piloting and review.",
  "Word and PDF files are built without Microsoft Word. Word lays out pages itself, so its page breaks may differ from the printed preview, which matches the PDF.",
  "PDF export uses the standard Helvetica font, which can't show some characters, such as non-Latin scripts; they appear as question marks. Use the Word file for those.",
  "File upload questions are placeholders: they can't be answered on paper, and online forms need a survey platform.",
  "Nothing is saved. Export or copy your questionnaire before leaving the page.",
];

/** Reviews still to come before the tool's guidance is final. */
export const QUESTIONNAIRE_REVIEW_ITEMS: readonly string[] = [
  "Instrument review: the section structure and question types, by a survey methodologist.",
  "Measurement review: the links from indicators to question types and scales.",
  "Question wording review: the placeholder wording, instructions and scale labels.",
  "References: sources for the scales and section structure, after academic review.",
  "Translation review: guidance for questionnaires used in more than one language.",
];
