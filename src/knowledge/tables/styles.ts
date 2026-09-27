/**
 * Table formatting presets. Each follows the general guidance its manual gives for
 * tables: APA 7 (a bold number above an italic title, horizontal rules only, notes
 * starting “Note.”, no leading zero for values that can't exceed 1); IEEE (a centred
 * “TABLE I” above a title in small capitals, compact text, lettered footnotes); Chicago
 * (“Table 1.” and the title on one line, source notes first, then other notes); MLA (the
 * label and title on separate lines above, source and notes below). Harvard is a family
 * of institutional guides rather than one manual, so its preset follows the most common
 * pattern, “Table 1: Title” with a source line below. Universities' and journals' own
 * rules take precedence; the custom style sets the caption to match them.
 */

import type { BorderStyle, CaptionPosition, TableFont, TableOptions, TableStyleId } from "./types";

export interface TableStyleSpec {
  id: TableStyleId;
  label: string;
  advice: string;
  /** The label word, such as “Table” or “TABLE”. */
  labelWord: string;
  numerals: "arabic" | "roman";
  /** What follows the number. Empty puts the title on its own line. */
  separator: string;
  position: CaptionPosition;
  align: "left" | "center";
  labelBold: boolean;
  titleItalic: boolean;
  titleSmallCaps: boolean;
  /** How the general note begins, such as “Note.”; italic when noteItalic is set. */
  noteLabel: string;
  noteItalic: boolean;
  /** How the source line begins, or null when the source goes in the general note. */
  sourceLabel: string | null;
  /** Source notes come before other notes (Chicago), or after them. */
  sourceFirst: boolean;
  /** No leading zero for values that can't exceed 1 (APA). */
  dropLeadingZero: boolean;
  /** Settings applied when the style is chosen. */
  defaults: { font: TableFont; fontSize: number; borders: BorderStyle };
}

export const TABLE_STYLE_SPECS: Readonly<Record<Exclude<TableStyleId, "custom">, TableStyleSpec>> = {
  apa: {
    id: "apa",
    label: "APA 7",
    advice: "The table number in bold, the title in italic title case on the next line, both above the table. Horizontal rules only, no vertical lines. Notes start with “Note.” in italics.",
    labelWord: "Table",
    numerals: "arabic",
    separator: "",
    position: "above",
    align: "left",
    labelBold: true,
    titleItalic: true,
    titleSmallCaps: false,
    noteLabel: "Note.",
    noteItalic: true,
    sourceLabel: null,
    sourceFirst: false,
    dropLeadingZero: true,
    defaults: { font: "times", fontSize: 12, borders: "horizontal" },
  },
  ieee: {
    id: "ieee",
    label: "IEEE",
    advice: "“TABLE I” in Roman numerals, centred above the title in small capitals. Compact 8-point text, horizontal rules, and lettered footnotes below.",
    labelWord: "TABLE",
    numerals: "roman",
    separator: "",
    position: "above",
    align: "center",
    labelBold: false,
    titleItalic: false,
    titleSmallCaps: true,
    noteLabel: "",
    noteItalic: false,
    sourceLabel: "Source:",
    sourceFirst: false,
    dropLeadingZero: false,
    defaults: { font: "times", fontSize: 8, borders: "horizontal" },
  },
  harvard: {
    id: "harvard",
    label: "Harvard",
    advice: "Harvard guides differ between institutions. This follows the most common pattern: “Table 1: Title” above the table and a source line below. Check your university's guide.",
    labelWord: "Table",
    numerals: "arabic",
    separator: ":",
    position: "above",
    align: "left",
    labelBold: true,
    titleItalic: false,
    titleSmallCaps: false,
    noteLabel: "Note:",
    noteItalic: false,
    sourceLabel: "Source:",
    sourceFirst: false,
    dropLeadingZero: false,
    defaults: { font: "arial", fontSize: 11, borders: "horizontal" },
  },
  chicago: {
    id: "chicago",
    label: "Chicago",
    advice: "“Table 1.” and the title on one line above the table. Below it, source notes come first, then other notes, then notes on specific cells and significance.",
    labelWord: "Table",
    numerals: "arabic",
    separator: ".",
    position: "above",
    align: "left",
    labelBold: false,
    titleItalic: false,
    titleSmallCaps: false,
    noteLabel: "Note:",
    noteItalic: true,
    sourceLabel: "Source:",
    sourceFirst: true,
    dropLeadingZero: false,
    defaults: { font: "times", fontSize: 11, borders: "horizontal" },
  },
  mla: {
    id: "mla",
    label: "MLA",
    advice: "The label and number, then the title on the next line, both flush left above the table. The source and any notes go directly below it.",
    labelWord: "Table",
    numerals: "arabic",
    separator: "",
    position: "above",
    align: "left",
    labelBold: false,
    titleItalic: false,
    titleSmallCaps: false,
    noteLabel: "Note:",
    noteItalic: false,
    sourceLabel: "Source:",
    sourceFirst: true,
    dropLeadingZero: false,
    defaults: { font: "times", fontSize: 12, borders: "horizontal" },
  },
};

export const TABLE_STYLE_LABELS: Readonly<Record<TableStyleId, string>> = {
  apa: "APA 7",
  ieee: "IEEE",
  harvard: "Harvard",
  chicago: "Chicago",
  mla: "MLA",
  custom: "Custom university style",
};

/** The style in force: a preset, or the custom caption settings. */
export function styleSpec(options: Pick<TableOptions, "style" | "custom">): TableStyleSpec {
  if (options.style !== "custom") {
    const spec = TABLE_STYLE_SPECS[options.style];
    if (!spec) throw new RangeError(`Unknown table style: ${options.style}`);
    return spec;
  }
  const custom = options.custom;
  return {
    id: "custom",
    label: TABLE_STYLE_LABELS.custom,
    advice: "Set the caption to match your university's or journal's guide. Everything else follows the options you choose.",
    labelWord: custom.label.trim() || "Table",
    numerals: "arabic",
    separator: custom.separator,
    position: custom.position,
    align: "left",
    labelBold: custom.labelBold,
    titleItalic: custom.titleItalic,
    titleSmallCaps: false,
    noteLabel: "Note.",
    noteItalic: false,
    sourceLabel: "Source:",
    sourceFirst: false,
    dropLeadingZero: false,
    defaults: { font: "times", fontSize: 12, borders: "horizontal" },
  };
}

/** The options with a style's defaults applied, as when the researcher chooses it. */
export function applyTableStyle(options: TableOptions, style: TableStyleId): TableOptions {
  const next = { ...options, style };
  return { ...next, ...styleSpec(next).defaults };
}

export const FONT_FAMILIES: Readonly<Record<TableFont, { label: string; css: string; word: string; pdf: "Times" | "Helvetica" }>> = {
  times: { label: "Times New Roman", css: "'Times New Roman', Times, serif", word: "Times New Roman", pdf: "Times" },
  arial: { label: "Arial", css: "Arial, Helvetica, sans-serif", word: "Arial", pdf: "Helvetica" },
  calibri: { label: "Calibri", css: "Calibri, Carlito, 'Segoe UI', sans-serif", word: "Calibri", pdf: "Helvetica" },
  georgia: { label: "Georgia", css: "Georgia, 'Times New Roman', serif", word: "Georgia", pdf: "Times" },
  helvetica: { label: "Helvetica", css: "Helvetica, Arial, sans-serif", word: "Helvetica", pdf: "Helvetica" },
};

/** Cell padding in points: vertical and horizontal. */
export const PADDING_POINTS: Readonly<Record<TableOptions["padding"], { vertical: number; horizontal: number }>> = {
  compact: { vertical: 1, horizontal: 4 },
  normal: { vertical: 3, horizontal: 6 },
  relaxed: { vertical: 6, horizontal: 8 },
};

export const FONT_SIZES = [8, 9, 10, 11, 12] as const;
