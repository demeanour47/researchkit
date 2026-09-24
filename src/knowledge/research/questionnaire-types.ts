/**
 * The Questionnaire Builder's vocabulary: question types, section kinds, and the
 * shapes of a questionnaire, its sections and its questions, as stored in the project
 * draft. Wording is never generated here: empty question text means “not written yet”.
 */

import type { MeasurementLevel } from "./variable-types";
import type { QuestionScale } from "./questionnaire-scales";

export const QUESTION_TYPES = [
  "short-answer",
  "long-answer",
  "paragraph",
  "multiple-choice",
  "checkbox",
  "dropdown",
  "likert",
  "semantic-differential",
  "matrix",
  "ranking",
  "numeric",
  "date",
  "time",
  "yes-no",
  "true-false",
  "file-upload",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

/** How a question is answered, which decides how every format draws it. */
export type AnswerForm = "text" | "choice" | "scale" | "differential" | "matrix" | "ranking" | "number" | "date" | "time" | "file";

export interface QuestionTypeInfo {
  label: string;
  description: string;
  form: AnswerForm;
  /** The researcher writes the answer options, such as categories. */
  usesOptions: boolean;
  /** The answer is a rating on a scale. */
  usesScale: boolean;
  /** Several statements share one scale. */
  usesRows: boolean;
  /** Options that come with the type itself. */
  fixedOptions: readonly string[];
  /** Ruled lines for a written answer on paper. */
  lines: number;
  /** What respondents are told to do. */
  instruction: string;
  /** Measurement levels this type usually produces. */
  levels: readonly MeasurementLevel[];
}

export const QUESTION_TYPE_INFO: Readonly<Record<QuestionType, QuestionTypeInfo>> = {
  "short-answer": {
    label: "Short answer",
    description: "A word or a short phrase.",
    form: "text",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 1,
    instruction: "Write your answer.",
    levels: ["open-ended", "nominal"],
  },
  "long-answer": {
    label: "Long answer",
    description: "A few sentences.",
    form: "text",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 3,
    instruction: "Write your answer.",
    levels: ["open-ended"],
  },
  paragraph: {
    label: "Paragraph",
    description: "An extended written answer.",
    form: "text",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 6,
    instruction: "Write your answer in as much detail as you wish.",
    levels: ["open-ended"],
  },
  "multiple-choice": {
    label: "Multiple choice",
    description: "Choose one of several options.",
    form: "choice",
    usesOptions: true,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Choose one.",
    levels: ["nominal", "categorical", "ordinal"],
  },
  checkbox: {
    label: "Checkbox",
    description: "Choose any number of options.",
    form: "choice",
    usesOptions: true,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Choose all that apply.",
    levels: ["multiple-response"],
  },
  dropdown: {
    label: "Dropdown",
    description: "Choose one option from a list; on paper, shown as a list.",
    form: "choice",
    usesOptions: true,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Choose one.",
    levels: ["nominal", "categorical"],
  },
  likert: {
    label: "Likert scale",
    description: "A rating of one statement on an ordered scale, such as agreement.",
    form: "scale",
    usesOptions: false,
    usesScale: true,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Choose one.",
    levels: ["likert"],
  },
  "semantic-differential": {
    label: "Semantic differential",
    description: "A rating between two opposite words.",
    form: "differential",
    usesOptions: false,
    usesScale: true,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Choose one point between the two words.",
    levels: ["ordinal", "interval"],
  },
  matrix: {
    label: "Matrix table",
    description: "Several statements rated on the same scale.",
    form: "matrix",
    usesOptions: false,
    usesScale: true,
    usesRows: true,
    fixedOptions: [],
    lines: 0,
    instruction: "Choose one answer in each row.",
    levels: ["likert", "ordinal"],
  },
  ranking: {
    label: "Ranking",
    description: "Put options in order.",
    form: "ranking",
    usesOptions: true,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Number the options in order, starting from 1.",
    levels: ["ordinal"],
  },
  numeric: {
    label: "Numeric",
    description: "A number, such as hours or age in years.",
    form: "number",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Write a number.",
    levels: ["ratio", "interval", "continuous"],
  },
  date: {
    label: "Date",
    description: "A calendar date.",
    form: "date",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Write the date.",
    levels: ["interval"],
  },
  time: {
    label: "Time",
    description: "A time of day.",
    form: "time",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Write the time.",
    levels: ["interval"],
  },
  "yes-no": {
    label: "Yes/No",
    description: "Yes or no.",
    form: "choice",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: ["Yes", "No"],
    lines: 0,
    instruction: "Choose one.",
    levels: ["binary"],
  },
  "true-false": {
    label: "True/False",
    description: "True or false.",
    form: "choice",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: ["True", "False"],
    lines: 0,
    instruction: "Choose one.",
    levels: ["binary"],
  },
  "file-upload": {
    label: "File upload (placeholder)",
    description: "A file attached in an online version. It can't be answered on paper.",
    form: "file",
    usesOptions: false,
    usesScale: false,
    usesRows: false,
    fixedOptions: [],
    lines: 0,
    instruction: "Attach a file. Online versions only.",
    levels: [],
  },
};

/** The question type a measurement level usually suggests. A starting point for the researcher to change. */
export const TYPE_FOR_LEVEL: Readonly<Record<MeasurementLevel, QuestionType>> = {
  nominal: "multiple-choice",
  categorical: "multiple-choice",
  binary: "yes-no",
  ordinal: "multiple-choice",
  likert: "likert",
  interval: "numeric",
  ratio: "numeric",
  continuous: "numeric",
  "multiple-response": "checkbox",
  "open-ended": "long-answer",
};

export const SECTION_KINDS = [
  "cover",
  "introduction",
  "participant-information",
  "consent",
  "demographics",
  "items",
  "open-ended",
  "closing",
  "thank-you",
  "custom",
] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];

export interface SectionKindInfo {
  label: string;
  /** What belongs in the section. */
  purpose: string;
  /** Shown in place of the section's text until the researcher writes it; null when text is optional. */
  placeholder: string | null;
}

export const SECTION_KIND_INFO: Readonly<Record<SectionKind, SectionKindInfo>> = {
  cover: {
    label: "Cover page",
    purpose: "The study title, the researcher and institution, and contact details.",
    placeholder: "[Researcher name, institution and contact details]",
  },
  introduction: {
    label: "Introduction",
    purpose: "What the study is about and why the participant's answers matter, in plain language.",
    placeholder: "[Introduce the study in plain language]",
  },
  "participant-information": {
    label: "Participant information",
    purpose: "What taking part involves, how long it takes, how answers are kept confidential, and how to withdraw.",
    placeholder: "[What taking part involves, how long it takes, how answers are kept confidential, and how to withdraw]",
  },
  consent: {
    label: "Consent statement",
    purpose: "The consent wording approved by your ethics committee, and the participant's agreement.",
    placeholder: "[Consent statement approved by your ethics committee]",
  },
  demographics: {
    label: "Demographic information",
    purpose: "Participant characteristics your analysis needs, such as those you control for.",
    placeholder: null,
  },
  items: {
    label: "Question section",
    purpose: "Questions measuring your variables through their indicators.",
    placeholder: null,
  },
  "open-ended": {
    label: "Open-ended questions",
    purpose: "Questions answered in the participant's own words.",
    placeholder: null,
  },
  closing: {
    label: "Closing note",
    purpose: "What happens next, such as how to return the questionnaire.",
    placeholder: "[What participants should do when they finish, such as how to return the questionnaire]",
  },
  "thank-you": {
    label: "Thank you",
    purpose: "Thanks, and who to contact with questions or concerns.",
    placeholder: "[Thank participants and give contact details for questions or concerns]",
  },
  custom: {
    label: "Custom section",
    purpose: "Anything else your questionnaire needs.",
    placeholder: null,
  },
};

/** Section kinds that hold questions measuring variables, where every question should trace to one. */
export const MEASURING_SECTIONS: ReadonlySet<SectionKind> = new Set(["demographics", "items", "custom"]);

export interface QuestionnaireSection {
  id: string;
  kind: SectionKind;
  title: string;
  /** Text shown before the section's questions. Empty means not written yet. */
  content: string;
}

export interface Question {
  id: string;
  /** The id of the section it belongs to. */
  section: string;
  /** The wording, in the researcher's words. Empty means not written yet. */
  text: string;
  type: QuestionType;
  variableId: string | null;
  indicatorId: string | null;
  required: boolean;
  /** Guidance shown to respondents under the question. */
  helpText: string;
  /** The researcher's own notes. Never shown to respondents. */
  notes: string;
  /** Answer options, for types that use them. */
  options: readonly string[];
  /** Statements, for matrix tables. */
  rows: readonly string[];
  /** The rating scale, for types that use one. */
  scale: QuestionScale | null;
}

export interface Questionnaire {
  title: string;
  sections: readonly QuestionnaireSection[];
  /** Every question, in order. A section's questions are those naming it, in this order. */
  questions: readonly Question[];
}

/** Shown wherever the researcher hasn't written something yet. Never replaced with invented wording. */
export const QUESTIONNAIRE_PLACEHOLDERS = {
  title: "[Questionnaire title]",
  question: (subject: string) => `[question about ${subject}]`,
  consentQuestion: "[consent question, such as agreement to take part]",
  option: (number: number) => `[option ${number}]`,
  row: (number: number) => `[statement ${number}]`,
  unlinked: "[question]",
} as const;
