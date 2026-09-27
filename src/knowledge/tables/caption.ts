/**
 * Captions and notes. The caption is the table's label, number and title, placed and
 * formatted by the style. Notes follow the order the style gives: general notes, notes
 * on specific cells (lettered a, b, c), then significance notes; Chicago and MLA put the
 * source first. Statistical symbols in notes, such as N, M and p, are set in italics.
 */

import { roman } from "./format";
import { styleSpec } from "./styles";
import { UNNUMBERED_TYPES, type ResearchTable, type StarLevel, type TableOptions, type TextRun } from "./types";

/** The label and number, such as “Table 3”, “TABLE III” or “Table A2”. */
export function tableLabel(options: Pick<TableOptions, "style" | "custom" | "number" | "appendix">, appendix = false): string {
  const spec = styleSpec(options);
  const number = Math.max(1, Math.floor(options.number) || 1);
  const numeral = spec.numerals === "roman" && !appendix ? roman(number) : String(number);
  const letter = appendix ? options.appendix.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || "A" : "";
  return `${spec.labelWord} ${letter}${numeral}`;
}

/** Italicises statistical symbols followed by =, <, > or a bracket, such as the N in “N = 200”. */
export function italicSymbols(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const pattern = /(^|[\s(,;])(N|n|M|SD|SE|p|t|F|r|R²|df|B)(?=\s*[=<>(])/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    const start = match.index + match[1].length;
    if (start > last) runs.push({ text: text.slice(last, start) });
    runs.push({ text: match[2], italic: true });
    last = start + match[2].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs;
}

/** The caption as lines of runs: one line when the style separates label and title with punctuation, two otherwise. */
export function captionLines(table: Pick<ResearchTable, "title" | "type">, options: TableOptions, { continued = false }: { continued?: boolean } = {}): TextRun[][] {
  const spec = styleSpec(options);
  // Contents pages and lists have a heading, not a table number.
  if (UNNUMBERED_TYPES.has(table.type)) return [[{ text: table.title, bold: true }]];
  const label: TextRun = { text: tableLabel(options, table.type === "appendix"), bold: spec.labelBold };
  const title: TextRun = { text: table.title, italic: spec.titleItalic, smallCaps: spec.titleSmallCaps };
  const more: TextRun[] = continued ? [{ text: " (continued)" }] : [];
  if (spec.separator) return [[{ ...label, text: `${label.text}${spec.separator}` }, { text: " " }, title, ...more]];
  return [[label, ...more], [title]];
}

/** Where the caption sits across the page: the style's alignment, or centred for front-matter headings. */
export const captionAlign = (table: Pick<ResearchTable, "type">, options: Pick<TableOptions, "style" | "custom">): "left" | "center" => (UNNUMBERED_TYPES.has(table.type) || styleSpec(options).align === "center" ? "center" : "left");

/** The text a probability note gives for each level: “*p < .05.”, with the leading zero when the style keeps it. */
export function probabilityRuns(levels: readonly StarLevel[], dropLeadingZero: boolean): TextRun[] {
  const marks: Record<StarLevel, string> = { 0.05: "*", 0.01: "**", 0.001: "***" };
  const value = (level: StarLevel) => (dropLeadingZero ? String(level).replace(/^0/, "") : String(level));
  return [...new Set(levels)]
    .sort((a, b) => b - a)
    .flatMap((level, index) => [{ text: `${index > 0 ? " " : ""}${marks[level]}` }, { text: "p", italic: true }, { text: ` < ${value(level)}.` }]);
}

/** Specific notes from the options: one per line, lettered after those the table already uses. An optional leading “a:” or “a.” is dropped. */
export function footnotes(text: string, used: number): { mark: string; text: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim().replace(/^[a-z][.:)]\s+/, ""))
    .filter(Boolean)
    .map((line, index) => ({ mark: noteLetter(used + index), text: line }));
}

/** a, b, … z, then aa, ab, … */
export function noteLetter(index: number): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return index < 26 ? letters[index] : `${letters[Math.floor(index / 26) - 1]}${letters[index % 26]}`;
}

/** The notes below the table as paragraphs of runs, in the style's order. Empty when there are none. */
export function noteParagraphs(table: Pick<ResearchTable, "notes">, options: TableOptions): TextRun[][] {
  const spec = styleSpec(options);
  const paragraphs: TextRun[][] = [];
  const source = options.source.trim();
  const general = [...table.notes.general, options.note.trim()].filter(Boolean);
  if (spec.sourceLabel === null && source) general.push(/[.!?]$/.test(source) ? source : `${source}.`);
  const sourceParagraph: TextRun[] | null = spec.sourceLabel !== null && source ? [{ text: spec.sourceLabel, italic: spec.noteItalic }, { text: " " }, ...italicSymbols(source)] : null;

  if (sourceParagraph && spec.sourceFirst) paragraphs.push(sourceParagraph);
  if (general.length > 0) {
    const label: TextRun[] = spec.noteLabel ? [{ text: spec.noteLabel, italic: spec.noteItalic }, { text: " " }] : [];
    paragraphs.push([...label, ...italicSymbols(general.join(" "))]);
  }
  const specific = [...table.notes.specific, ...footnotes(options.footnotes, table.notes.specific.length)];
  for (const note of specific) paragraphs.push([{ text: note.mark, superscript: true }, { text: " " }, ...italicSymbols(note.text)]);
  if (table.notes.probability.length > 0) paragraphs.push(probabilityRuns(table.notes.probability, spec.dropLeadingZero));
  if (sourceParagraph && !spec.sourceFirst) paragraphs.push(sourceParagraph);
  return paragraphs;
}

/** Runs as plain text, for text exports. Small capitals become capitals; superscript marks stay as letters. */
export const runsText = (runs: readonly TextRun[]) => runs.map((run) => (run.smallCaps ? run.text.toUpperCase() : run.text)).join("");
