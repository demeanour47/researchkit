/**
 * The title report for export: every title, the working title's evaluation, its
 * alignment and keywords. Built as document blocks, so the same writers that export
 * questionnaires produce Markdown, plain text, Word and PDF.
 */

import { joinList } from "../question-text";
import type { DocumentBlock } from "../questionnaire-summary";
import { getReference } from "../references";
import type { TitleAlignment } from "./alignment";
import { ALIGNMENT_STATUS_LABELS } from "./alignment";
import { CRITERION_STATUS_LABELS, TITLE_CATEGORY_LABELS, TITLE_CATEGORY_MEANINGS, TITLE_LIMITATIONS, type TitleEvaluation } from "./evaluate";
import { KEYWORD_ELEMENTS, KEYWORD_LABELS } from "./keywords";
import type { TitleSet } from "./titles";

export const REPORT_TITLE = "Research title review";

const heading = (text: string, sectionId: string): DocumentBlock => ({ kind: "heading", text, sectionId });
const paragraph = (text: string): DocumentBlock => ({ kind: "paragraph", text, placeholder: false });

/** The report's blocks. `evaluation` and `alignment` describe the working title. */
export function titleReport(set: TitleSet, evaluation: TitleEvaluation | null, alignment: TitleAlignment | null): DocumentBlock[] {
  const blocks: DocumentBlock[] = [{ kind: "title", text: REPORT_TITLE, placeholder: false }];
  const working = set.titles.find((title) => title.id === set.workingId);

  blocks.push(heading("Titles", "titles"));
  if (set.titles.length === 0) blocks.push(paragraph("No titles yet."));
  for (const title of set.titles) {
    const marks = [title.id === set.workingId ? "working title" : null, title.favourite ? "favourite" : null].filter(Boolean);
    blocks.push(paragraph(`${title.text}${marks.length > 0 ? ` (${marks.join(", ")})` : ""}`));
  }

  if (working && evaluation) {
    blocks.push(heading("Evaluation of the working title", "evaluation"));
    blocks.push(paragraph(`${TITLE_CATEGORY_LABELS[evaluation.category]}: ${evaluation.categoryReason}`));
    blocks.push(paragraph(TITLE_CATEGORY_MEANINGS[evaluation.category]));
    if (evaluation.pattern) blocks.push(paragraph(`Pattern: ${evaluation.pattern.pattern.name}. ${evaluation.pattern.pattern.explanation}`));
    for (const criterion of evaluation.criteria) blocks.push(paragraph(`${criterion.label} (${CRITERION_STATUS_LABELS[criterion.status]}): ${criterion.finding} ${criterion.why}`));

    blocks.push(heading("Keywords", "keywords"));
    for (const element of KEYWORD_ELEMENTS) {
      const keywords = evaluation.keywords[element];
      if (keywords.length === 0) continue;
      blocks.push(paragraph(`${KEYWORD_LABELS[element]}: ${joinList(keywords.map((keyword) => `${keyword.text} (${keyword.inTitle ? "in the title" : "not in the title"})`))}`));
    }
  }

  if (working && alignment) {
    blocks.push(heading("Alignment with the project", "alignment"));
    for (const source of alignment.sources) blocks.push(paragraph(`${source.label} (${ALIGNMENT_STATUS_LABELS[source.status]}): ${source.explanation}`));
    for (const issue of alignment.issues) blocks.push(paragraph(`${issue.label}: ${issue.explanation} ${issue.why}`));
  }

  blocks.push(heading("About this review", "about"));
  for (const limitation of TITLE_LIMITATIONS) blocks.push(paragraph(limitation));
  const ids = [...new Set(evaluation?.criteria.flatMap((criterion) => criterion.references) ?? [])];
  if (ids.length > 0) {
    blocks.push(heading("References", "references"));
    for (const reference of ids.map(getReference).sort((a, b) => a.apa.localeCompare(b.apa))) blocks.push(paragraph(reference.apa.replace(/\*/g, "")));
  }
  return blocks;
}
