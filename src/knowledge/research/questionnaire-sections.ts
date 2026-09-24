/**
 * The questionnaire's sections: the standard structure, and adding, renaming,
 * reordering and removing sections. Section text starts empty; placeholders say what
 * belongs there until the researcher writes it.
 */

import { findSection } from "./questionnaire";
import { SECTION_KIND_INFO, type Questionnaire, type QuestionnaireSection, type SectionKind } from "./questionnaire-types";

/** The standard structure, in order. Sections A to C hold the questions measuring variables. */
export const DEFAULT_SECTIONS: readonly QuestionnaireSection[] = [
  { id: "cover", kind: "cover", title: "Cover page", content: "" },
  { id: "introduction", kind: "introduction", title: "Introduction", content: "" },
  { id: "participant-information", kind: "participant-information", title: "Participant information", content: "" },
  { id: "consent", kind: "consent", title: "Consent", content: "" },
  { id: "demographics", kind: "demographics", title: "About you", content: "" },
  { id: "section-a", kind: "items", title: "Section A", content: "" },
  { id: "section-b", kind: "items", title: "Section B", content: "" },
  { id: "section-c", kind: "items", title: "Section C", content: "" },
  { id: "open-ended", kind: "open-ended", title: "Your views in your own words", content: "" },
  { id: "closing", kind: "closing", title: "Closing note", content: "" },
  { id: "thank-you", kind: "thank-you", title: "Thank you", content: "" },
];

/** The section's text, or its placeholder when the kind expects text and none is written. Null when there's nothing to show. */
export function sectionText(section: QuestionnaireSection): { text: string; placeholder: boolean } | null {
  if (section.content.trim()) return { text: section.content.trim(), placeholder: false };
  const placeholder = SECTION_KIND_INFO[section.kind].placeholder;
  return placeholder ? { text: placeholder, placeholder: true } : null;
}

const cleanTitle = (title: string) => {
  const cleaned = title.replace(/\s+/g, " ").trim();
  if (!cleaned) throw new RangeError("A section needs a title.");
  return cleaned;
};

const nextSectionId = (questionnaire: Questionnaire) => {
  const numbers = questionnaire.sections.map((section) => Number(/^section-(\d+)$/.exec(section.id)?.[1] ?? 0));
  return `section-${Math.max(0, ...numbers) + 1}`;
};

/**
 * Adds a section before the closing note and thank-you, or at the end if there are
 * neither. Returns the questionnaire and the new section's id.
 */
export function addSection(questionnaire: Questionnaire, title: string, kind: SectionKind = "custom"): { questionnaire: Questionnaire; id: string } {
  const id = nextSectionId(questionnaire);
  const section: QuestionnaireSection = { id, kind, title: cleanTitle(title), content: "" };
  const endings = questionnaire.sections.findIndex((candidate) => candidate.kind === "closing" || candidate.kind === "thank-you");
  const at = endings === -1 ? questionnaire.sections.length : endings;
  return { questionnaire: { ...questionnaire, sections: [...questionnaire.sections.slice(0, at), section, ...questionnaire.sections.slice(at)] }, id };
}

const replaceSection = (questionnaire: Questionnaire, id: string, change: (section: QuestionnaireSection) => QuestionnaireSection): Questionnaire => {
  findSection(questionnaire, id);
  return { ...questionnaire, sections: questionnaire.sections.map((section) => (section.id === id ? change(section) : section)) };
};

export const renameSection = (questionnaire: Questionnaire, id: string, title: string): Questionnaire => replaceSection(questionnaire, id, (section) => ({ ...section, title: cleanTitle(title) }));

/** Sets the section's text, kept as typed. */
export const setSectionContent = (questionnaire: Questionnaire, id: string, content: string): Questionnaire => replaceSection(questionnaire, id, (section) => ({ ...section, content }));

/** Moves a section to a new position, clamped to the list. Its questions move with it. */
export function moveSection(questionnaire: Questionnaire, id: string, toIndex: number): Questionnaire {
  const section = findSection(questionnaire, id);
  const rest = questionnaire.sections.filter((candidate) => candidate.id !== id);
  const at = Math.max(0, Math.min(rest.length, Math.round(toIndex)));
  return { ...questionnaire, sections: [...rest.slice(0, at), section, ...rest.slice(at)] };
}

/** Removes a section and its questions. */
export function removeSection(questionnaire: Questionnaire, id: string): Questionnaire {
  findSection(questionnaire, id);
  return {
    ...questionnaire,
    sections: questionnaire.sections.filter((section) => section.id !== id),
    questions: questionnaire.questions.filter((question) => question.section !== id),
  };
}

export const setQuestionnaireTitle = (questionnaire: Questionnaire, title: string): Questionnaire => ({ ...questionnaire, title });
