/**
 * The table as a PDF on A4 pages, written byte by byte like the builder's other PDFs.
 * Text uses the standard Times or Helvetica fonts, with Greek letters and mathematical
 * signs (β, χ², η², ≤, the minus sign) taken from the standard Symbol font and timeline
 * marks from ZapfDingbats, so no font is embedded. Long tables continue onto further
 * pages under a “(continued)” caption, with the header rows repeated. Each line is one
 * text object, so the viewer spaces it by the font's own metrics; the widths used to
 * align and wrap come from the standard Times and Helvetica metrics.
 */

import { winAnsiCode } from "../research/conceptual-export";
import { measureText } from "../research/conceptual-layout";
import { captionAlign, captionLines, noteParagraphs } from "./caption";
import { decimalColumns, numericColumns } from "./html";
import { styleSpec, FONT_FAMILIES, PADDING_POINTS } from "./styles";
import type { ResearchTable, TableCell, TableOptions, TextRun } from "./types";

/** A4 in points, with 2 cm margins. */
export const PDF_A4 = { short: 595.28, long: 841.89, margin: 56.69 } as const;

/** Symbol font codes for characters the text fonts lack, with their widths in thousandths of the font size (Adobe Symbol metrics). */
export const SYMBOL_CODES: Readonly<Record<string, [number, number]>> = {
  α: [0x61, 631], β: [0x62, 549], χ: [0x63, 549], δ: [0x64, 494], ε: [0x65, 439], φ: [0x66, 521], γ: [0x67, 411], η: [0x68, 603], ι: [0x69, 329], κ: [0x6b, 549],
  λ: [0x6c, 549], μ: [0x6d, 576], ν: [0x6e, 521], π: [0x70, 549], θ: [0x71, 521], ρ: [0x72, 549], σ: [0x73, 603], τ: [0x74, 439], ω: [0x77, 686], ψ: [0x79, 686],
  ζ: [0x7a, 494], Δ: [0x44, 612], Σ: [0x53, 592], Ω: [0x57, 768], Φ: [0x46, 763], "−": [0x2d, 549], "≤": [0xa3, 549], "≥": [0xb3, 549], "≠": [0xb9, 549], "√": [0xd6, 549],
  "≈": [0xbb, 549], "∞": [0xa5, 713],
};
/** ZapfDingbats codes: the filled square for timeline marks. */
const DINGBAT_CODES: Readonly<Record<string, [number, number]>> = { "■": [0x6e, 761] };

/** Times-Roman advance widths for printable ASCII, in thousandths of the font size (Adobe font metrics). */
const TIMES_WIDTHS = [
  250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 278, 278, 564, 564, 564, 444,
  921, 722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611, 889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333, 278, 333, 469, 500,
  333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 480, 200, 480, 541,
];
/** Widths of common characters beyond ASCII, for both families. */
const EXTRA_WIDTHS: Readonly<Record<string, [number, number]>> = { "–": [500, 556], "—": [1000, 1000], "“": [444, 333], "”": [444, 333], "‘": [333, 222], "’": [333, 222], "±": [564, 584], "×": [564, 584], "²": [300, 333], "·": [250, 278], "…": [1000, 1000], "•": [350, 350], "é": [444, 556], "°": [400, 400] };

/** A character's width in a text font at a size. */
function characterWidth(character: string, serif: boolean, size: number): number {
  const code = character.codePointAt(0)!;
  const extra = EXTRA_WIDTHS[character];
  if (extra) return ((serif ? extra[0] : extra[1]) / 1000) * size;
  if (serif) return ((code >= 32 && code <= 126 ? TIMES_WIDTHS[code - 32] : 500) / 1000) * size;
  return measureText(character, size);
}

type FontKey = "F1" | "F2" | "F3" | "F4" | "F5" | "F6";

interface Piece {
  font: FontKey;
  /** The PDF string literal, with its brackets. */
  literal: string;
  width: number;
}

const n = (value: number) => String(Math.round(value * 100) / 100);
const literal = (codes: number[]) =>
  `(${codes
    .map((code) => (code === 0x28 || code === 0x29 || code === 0x5c ? `\\${String.fromCharCode(code)}` : code > 126 || code < 32 ? `\\${code.toString(8).padStart(3, "0")}` : String.fromCharCode(code)))
    .join("")})`;

interface Style {
  bold?: boolean;
  italic?: boolean;
}

export class PdfText {
  constructor(
    private readonly serif: boolean,
    readonly size: number,
  ) {}

  private base({ bold, italic }: Style): FontKey {
    return bold && italic ? "F4" : bold ? "F2" : italic ? "F3" : "F1";
  }

  /** Text split into runs of one font each, with their widths at a size. */
  pieces(text: string, style: Style, size = this.size): Piece[] {
    const out: Piece[] = [];
    let font: FontKey | null = null;
    let codes: number[] = [];
    let width = 0;
    const flush = () => {
      if (font && codes.length > 0) out.push({ font, literal: literal(codes), width });
      codes = [];
      width = 0;
    };
    // Bold faces run a little wider than the regular widths measured here.
    const factor = style.bold ? 1.05 : 1;
    for (const character of text) {
      const symbol = SYMBOL_CODES[character];
      const dingbat = DINGBAT_CODES[character];
      const next: FontKey = symbol ? "F5" : dingbat ? "F6" : this.base(style);
      if (next !== font) {
        flush();
        font = next;
      }
      if (symbol) {
        codes.push(symbol[0]);
        width += (symbol[1] / 1000) * size;
      } else if (dingbat) {
        codes.push(dingbat[0]);
        width += (dingbat[1] / 1000) * size;
      } else {
        codes.push(winAnsiCode(character) ?? 0x3f);
        width += characterWidth(character, this.serif, size) * factor;
      }
    }
    flush();
    return out;
  }

  width(text: string, style: Style = {}, size = this.size): number {
    return this.pieces(text, style, size).reduce((sum, piece) => sum + piece.width, 0);
  }
}

/** A line of styled words, ready to draw. */
type Line = { text: string; style: Style & { superscript?: boolean } }[];

/** Wraps runs into lines no wider than the width, breaking at spaces. */
export function wrapRuns(runs: readonly TextRun[], maxWidth: number, measure: PdfText): Line[] {
  const words: { text: string; style: Line[number]["style"] }[] = [];
  for (const run of runs) {
    const text = run.smallCaps ? run.text.toUpperCase() : run.text;
    for (const part of text.split(/(\s+)/)) if (part) words.push({ text: part, style: { bold: run.bold, italic: run.italic, superscript: run.superscript } });
  }
  const lines: Line[] = [[]];
  let width = 0;
  const wordWidth = (word: (typeof words)[number]) => measure.width(word.text, word.style, word.style.superscript ? measure.size * 0.7 : measure.size);
  for (const word of words) {
    const w = wordWidth(word);
    const space = /^\s+$/.test(word.text);
    if (!space && width + w > maxWidth && lines[lines.length - 1].length > 0) {
      const current = lines[lines.length - 1];
      while (current.length > 0 && /^\s+$/.test(current[current.length - 1].text)) current.pop();
      lines.push([]);
      width = 0;
    }
    if (space && lines[lines.length - 1].length === 0) continue;
    lines[lines.length - 1].push(word);
    width += w;
  }
  return lines;
}

interface Page {
  ops: string[];
}

/** The table as a PDF document. */
export function tablePdf(table: ResearchTable, options: TableOptions): Uint8Array<ArrayBuffer> {
  const spec = styleSpec(options);
  const serif = FONT_FAMILIES[options.font].pdf === "Times";
  const measure = new PdfText(serif, options.fontSize);
  const [pageWidth, pageHeight] = options.orientation === "landscape" ? [PDF_A4.long, PDF_A4.short] : [PDF_A4.short, PDF_A4.long];
  const margin = PDF_A4.margin;
  const contentWidth = pageWidth - 2 * margin;
  const bottomLimit = pageHeight - margin;
  const size = options.fontSize;
  const lineHeight = size * 1.25;
  const pad = PADDING_POINTS[options.padding];
  const numeric = numericColumns(table);
  let page: Page = { ops: [] };
  const pages: Page[] = [page];
  let y = margin;
  const newPage = () => {
    page = { ops: [] };
    pages.push(page);
    y = margin;
  };

  // One text object per line: the viewer advances by the fonts' real widths, so spacing is exact.
  const drawLine = (line: Line, x: number, baseline: number) => {
    const ops = [`BT ${n(x)} ${n(pageHeight - baseline)} Td`];
    // Neighbouring words in the same style are drawn as one string.
    const merged: Line = [];
    for (const word of line) {
      const last = merged[merged.length - 1];
      if (last && last.style.bold === word.style.bold && last.style.italic === word.style.italic && last.style.superscript === word.style.superscript) last.text += word.text;
      else merged.push({ text: word.text, style: word.style });
    }
    for (const word of merged) {
      const wordSize = word.style.superscript ? size * 0.7 : size;
      const rise = word.style.superscript ? size * 0.33 : 0;
      for (const piece of measure.pieces(word.text, word.style, wordSize)) ops.push(`/${piece.font} ${n(wordSize)} Tf ${n(rise)} Ts ${piece.literal} Tj`);
    }
    page.ops.push(`${ops.join(" ")} ET`);
  };
  const lineWidth = (line: Line) => line.reduce((sum, word) => sum + measure.width(word.text, word.style, word.style.superscript ? size * 0.7 : size), 0);
  const rule = (x1: number, x2: number, at: number, width = 0.75) => page.ops.push(`${n(width)} w ${n(x1)} ${n(pageHeight - at)} m ${n(x2)} ${n(pageHeight - at)} l S`);
  const rect = (x: number, top: number, w: number, h: number, fill: boolean) => page.ops.push(`${n(x)} ${n(pageHeight - top - h)} ${n(w)} ${n(h)} re ${fill ? "f" : "S"}`);

  const paragraph = (runs: readonly TextRun[], align: "left" | "center") => {
    for (const line of wrapRuns(runs, contentWidth, measure)) {
      if (y + lineHeight > bottomLimit) newPage();
      const x = align === "center" ? margin + (contentWidth - lineWidth(line)) / 2 : margin;
      drawLine(line, x, y + size);
      y += lineHeight;
    }
  };

  // Column widths: each column's natural width, scaled to fill the page width.
  const natural = Array.from({ length: table.columns }, () => pad.horizontal * 2 + size);
  for (const cells of [...table.header, ...table.rows.filter((candidate) => candidate.kind !== "group").map((candidate) => candidate.cells)]) {
    let column = 0;
    for (const cell of cells) {
      if ((cell.span ?? 1) === 1) natural[column] = Math.max(natural[column], Math.min(measure.width(cell.text, cell) + pad.horizontal * 2 + (cell.indent ?? 0) * size, contentWidth * 0.45));
      column += cell.span ?? 1;
    }
  }
  const total = natural.reduce((a, b) => a + b, 0);
  const widths = natural.map((width) => (width / total) * contentWidth);
  const lefts = widths.map((_, index) => margin + widths.slice(0, index).reduce((a, b) => a + b, 0));

  // Decimal alignment: the widest part before and after the decimal point in each numeric column.
  const split = (text: string) => {
    const point = text.indexOf(".");
    return point < 0 ? [text, ""] : [text.slice(0, point), text.slice(point)];
  };
  const decimals = decimalColumns(table);
  const decimalParts = decimals.map((isDecimal, column) => {
    if (!isDecimal || options.numberAlign !== "decimal") return null;
    let left = 0;
    let right = 0;
    for (const candidate of table.rows) {
      if (candidate.kind === "group") continue;
      let position = 0;
      for (const cell of candidate.cells) {
        if (position === column && (cell.span ?? 1) === 1) {
          const [a, b] = split(cell.text);
          left = Math.max(left, measure.width(a, cell));
          right = Math.max(right, measure.width(b + (cell.notes ?? []).join(""), cell));
        }
        position += cell.span ?? 1;
      }
    }
    return { left, right };
  });

  /** The lines of a cell, wrapped to its column. */
  const cellLines = (cell: TableCell, width: number, header: boolean): Line[] => {
    const runs: TextRun[] = [{ text: cell.text, bold: header ? options.boldHeaders : cell.bold, italic: cell.italic }, ...(cell.notes ?? []).map((mark) => ({ text: mark, superscript: true }))];
    return wrapRuns(runs, Math.max(size, width - pad.horizontal * 2 - (cell.indent ?? 0) * size), measure);
  };

  interface Placed {
    cell: TableCell;
    column: number;
    span: number;
    lines: Line[];
  }
  const placeRow = (cells: readonly TableCell[], header: boolean): { placed: Placed[]; height: number } => {
    let column = 0;
    const placed = cells.map((cell) => {
      const span = cell.span ?? 1;
      const width = widths.slice(column, column + span).reduce((a, b) => a + b, 0);
      const entry = { cell, column, span, lines: cellLines(cell, width, header) };
      column += span;
      return entry;
    });
    return { placed, height: Math.max(1, ...placed.map((entry) => entry.lines.length)) * lineHeight + pad.vertical * 2 };
  };

  const drawRow = (row: { placed: Placed[]; height: number }, header: boolean, group: boolean) => {
    for (const { cell, column, span, lines } of row.placed) {
      const left = lefts[column];
      const width = widths.slice(column, column + span).reduce((a, b) => a + b, 0);
      lines.forEach((line, index) => {
        const baseline = y + pad.vertical + index * lineHeight + size;
        const textWidth = lineWidth(line);
        const indent = (cell.indent ?? 0) * size;
        let x: number;
        const parts = decimalParts[column];
        if (group || column === 0) x = left + pad.horizontal + indent;
        else if (header) x = left + (width - textWidth) / 2;
        else if (parts && span === 1 && lines.length === 1) {
          // The decimal point sits where the widest fraction still fits against the right padding.
          const anchor = left + width - pad.horizontal - parts.right;
          x = anchor - measure.width(split(cell.text)[0], cell);
        } else if (numeric[column] || cell.numeric) x = options.numberAlign === "center" ? left + (width - textWidth) / 2 : left + width - pad.horizontal - textWidth;
        else x = options.textAlign === "center" ? left + (width - textWidth) / 2 : left + pad.horizontal + indent;
        drawLine(line, x, baseline);
      });
    }
  };

  const headerRows = table.header.map((cells) => placeRow(cells, true));
  const headerHeight = headerRows.reduce((sum, candidate) => sum + candidate.height, 0);
  const tableLeft = margin;
  const tableRight = margin + contentWidth;
  const drawHeader = () => {
    const top = y;
    if (options.borders !== "none") rule(tableLeft, tableRight, top);
    headerRows.forEach((candidate, index) => {
      drawRow(candidate, true, false);
      y += candidate.height;
      // A rule under column-spanning headings, and under the whole header.
      for (const { cell, column, span } of candidate.placed) if (span > 1 && cell.text.trim() && index < headerRows.length - 1 && options.borders !== "none") rule(lefts[column] + pad.horizontal / 2, lefts[column] + widths.slice(column, column + span).reduce((a, b) => a + b, 0) - pad.horizontal / 2, y, 0.5);
    });
    if (options.borders !== "none") rule(tableLeft, tableRight, y);
    if (options.borders === "grid") gridLines(top, y);
    return top;
  };
  const gridLines = (top: number, bottom: number) => {
    for (const left of [...lefts, tableRight]) page.ops.push(`0.5 w ${n(left)} ${n(pageHeight - top)} m ${n(left)} ${n(pageHeight - bottom)} l S`);
  };

  const alignCaption = captionAlign(table, options);
  const caption = () => {
    for (const line of captionLines(table, options)) paragraph(line, alignCaption);
    y += size * 0.4;
  };
  if (spec.position === "above") caption();
  if (y + headerHeight + lineHeight * 2 > bottomLimit) newPage();
  let segmentTop = drawHeader();
  let bodyIndex = 0;
  const closeSegment = () => {
    if (options.borders === "horizontal" || options.borders === "outer") rule(tableLeft, tableRight, y);
    if (options.borders === "outer") {
      page.ops.push(`0.75 w ${n(tableLeft)} ${n(pageHeight - segmentTop)} m ${n(tableLeft)} ${n(pageHeight - y)} l S ${n(tableRight)} ${n(pageHeight - segmentTop)} m ${n(tableRight)} ${n(pageHeight - y)} l S`);
    }
  };
  for (const candidate of table.rows) {
    const group = candidate.kind === "group";
    const placed = group ? placeRow([{ ...candidate.cells[0], span: table.columns }], false) : placeRow(candidate.cells, false);
    if (y + placed.height > bottomLimit) {
      closeSegment();
      newPage();
      if (options.repeatHeader) {
        paragraph([...captionLines(table, options, { continued: true })[0]], alignCaption);
        y += size * 0.4;
        segmentTop = drawHeader();
      } else segmentTop = y;
    }
    const top = y;
    if (!group && options.alternatingRows && bodyIndex % 2 === 1) {
      page.ops.push("0.949 g");
      rect(tableLeft, top, contentWidth, placed.height, true);
      page.ops.push("0 g");
    }
    if (!group) bodyIndex++;
    if (candidate.kind === "total" && options.borders !== "none") rule(tableLeft, tableRight, top, 0.5);
    drawRow(placed, false, group);
    y += placed.height;
    if (options.borders === "grid") {
      gridLines(top, y);
      rule(tableLeft, tableRight, y, 0.5);
    }
  }
  closeSegment();
  y += size * 0.5;
  if (spec.position === "below") caption();
  for (const note of noteParagraphs(table, options)) paragraph(note, "left");

  // The file: catalogue, page tree, six standard fonts, then each page and its content.
  const base = serif ? ["Times-Roman", "Times-Bold", "Times-Italic", "Times-BoldItalic"] : ["Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique"];
  const fonts = [...base.map((name) => `<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`), "<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>", "<< /Type /Font /Subtype /Type1 /BaseFont /ZapfDingbats >>"];
  const firstPage = 3 + fonts.length;
  const pageObjects = pages.flatMap((candidate, index) => {
    const content = `0 g 0 G\n${candidate.ops.join("\n")}`;
    return [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(pageWidth)} ${n(pageHeight)}] /Resources << /Font << ${fonts.map((_, font) => `/F${font + 1} ${3 + font} 0 R`).join(" ")} >> >> /Contents ${firstPage + index * 2 + 1} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ];
  });
  const info = `<< /Title ${literal([...table.title].map((character) => winAnsiCode(character) ?? 0x3f))} /Producer (ResearchKit) >>`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${firstPage + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    ...fonts,
    ...pageObjects,
    info,
  ];
  let body = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(body.length);
  for (let index = 0; index < body.length; index++) bytes[index] = body.charCodeAt(index);
  return bytes;
}

/** The number of pages a table's PDF has. */
export const pdfPageCount = (bytes: Uint8Array) => {
  const text = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return Number(/\/Count (\d+)/.exec(text)?.[1] ?? 0);
};
