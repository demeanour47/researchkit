/**
 * Word (.docx) and PDF export of the questionnaire document, written byte by byte so
 * no dependency or server is needed. Both draw from the same blocks as every other
 * format.
 *
 * DOCX is an Office Open XML package (ECMA-376): a ZIP archive of XML parts. The
 * archive here is stored without compression, which every ZIP reader accepts. PDF is
 * PDF 1.4 with the standard Helvetica fonts, laid out on A4 pages. The printed preview
 * uses the same page layout, so its page breaks match the PDF exactly.
 */

import { crc32, pdfString } from "./conceptual-export";
import { measureText, wrapText } from "./conceptual-layout";
import { questionLine, type Answer, type DocumentBlock } from "./questionnaire-summary";

// Bytes.

/** UTF-8 bytes of a string, written out so the module needs no platform API. */
export function utf8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (const character of text) {
    const code = character.codePointAt(0)!;
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
  }
  return Uint8Array.from(bytes);
}

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/**
 * A ZIP archive with every entry stored uncompressed (PKWARE APPNOTE 6.3, method 0).
 * Timestamps are fixed at 1 January 1980, the earliest ZIP date, so the same input
 * always gives the same bytes.
 */
export function zip(entries: readonly ZipEntry[]): Uint8Array<ArrayBuffer> {
  const DOS_DATE = (0 << 9) | (1 << 5) | 1;
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = utf8(entry.name);
    const crc = crc32(entry.data);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true); // version needed: 2.0
    view.setUint16(6, 0x0800, true); // flags: names are UTF-8
    view.setUint16(8, 0, true); // method: stored
    view.setUint16(10, 0, true); // time
    view.setUint16(12, DOS_DATE, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, entry.data.length, true);
    view.setUint32(22, entry.data.length, true);
    view.setUint16(26, name.length, true);
    view.setUint16(28, 0, true);
    local.set(name, 30);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true); // made by
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, DOS_DATE, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, entry.data.length, true);
    centralView.setUint32(24, entry.data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    central.set(name, 46);

    locals.push(local, entry.data);
    centrals.push(central);
    offset += local.length + entry.data.length;
  }
  const directorySize = centrals.reduce((total, part) => total + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, directorySize, true);
  endView.setUint32(16, offset, true);
  const parts = [...locals, ...centrals, end];
  const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

// Word.

/** Text safe inside XML: markup characters escaped, and characters XML 1.0 forbids removed. */
export function xmlText(text: string): string {
  const allowed = [...text].filter((character) => {
    const code = character.codePointAt(0)!;
    return code === 0x9 || code === 0xa || code === 0xd || (code >= 0x20 && code !== 0xfffe && code !== 0xffff);
  });
  return allowed
    .join("")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
/** A4 in twentieths of a point, with 2 cm margins. */
const PAGE_TWIPS = { width: 11906, height: 16838, margin: 1134 };
const CONTENT_TWIPS = PAGE_TWIPS.width - 2 * PAGE_TWIPS.margin;
const INDENT_TWIPS = 425;

interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  size?: number;
}

const run = (text: string, style: RunStyle = {}) => {
  const properties = `${style.bold ? "<w:b/>" : ""}${style.italic ? "<w:i/>" : ""}${style.size ? `<w:sz w:val="${style.size}"/>` : ""}`;
  const pieces = text.split("\n").map((piece) => `<w:t xml:space="preserve">${xmlText(piece)}</w:t>`);
  return `<w:r>${properties ? `<w:rPr>${properties}</w:rPr>` : ""}${pieces.join("<w:br/>")}</w:r>`;
};

interface ParagraphStyle {
  style?: string;
  indent?: number;
  hanging?: number;
  keepNext?: boolean;
  after?: number;
  align?: "center";
}

const paragraph = (runs: string, options: ParagraphStyle = {}) => {
  const properties = [
    options.style ? `<w:pStyle w:val="${options.style}"/>` : "",
    options.keepNext ? "<w:keepNext/>" : "",
    options.after !== undefined ? `<w:spacing w:after="${options.after}"/>` : "",
    options.indent !== undefined ? `<w:ind w:left="${options.indent}"${options.hanging ? ` w:hanging="${options.hanging}"` : ""}/>` : "",
    options.align ? `<w:jc w:val="${options.align}"/>` : "",
  ].join("");
  return `<w:p>${properties ? `<w:pPr>${properties}</w:pPr>` : ""}${runs}</w:p>`;
};

const BORDERS = ["top", "left", "bottom", "right", "insideH", "insideV"].map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="808080"/>`).join("");

/** A bordered table. The first row repeats at the top of each page it continues onto. */
function table(rows: readonly (readonly string[])[], widths: readonly number[]): string {
  const grid = widths.map((width) => `<w:gridCol w:w="${Math.round(width)}"/>`).join("");
  const body = rows
    .map(
      (cells, rowIndex) =>
        `<w:tr>${rowIndex === 0 ? "<w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>" : "<w:trPr><w:cantSplit/></w:trPr>"}${cells
          .map(
            (content, index) =>
              `<w:tc><w:tcPr><w:tcW w:w="${Math.round(widths[index])}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${paragraph(run(content, { size: 18, bold: rowIndex === 0 }), { after: 0, align: index === 0 && content.length > 3 && rowIndex > 0 ? undefined : "center" })}</w:tc>`,
          )
          .join("")}</w:tr>`,
    )
    .join("");
  const width = widths.reduce((total, value) => total + value, 0);
  return `<w:tbl><w:tblPr><w:tblW w:w="${Math.round(width)}" w:type="dxa"/><w:tblInd w:w="${INDENT_TWIPS}" w:type="dxa"/><w:tblBorders>${BORDERS}</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>${paragraph("", { after: 120 })}`;
}

const BOX = "☐";
const CIRCLE = "○";
const RULE = "_______________________________________________";

function wordAnswer(answer: Answer): string {
  const line = (text: string, style: RunStyle = {}) => paragraph(run(text, style), { indent: INDENT_TWIPS, after: 60 });
  const available = CONTENT_TWIPS - INDENT_TWIPS;
  switch (answer.kind) {
    case "lines":
      return Array.from({ length: answer.count }, () => line(RULE)).join("");
    case "choices":
      return answer.options.map((option) => line(`${answer.multiple ? BOX : CIRCLE}  ${option.text}`, { italic: option.placeholder })).join("");
    case "ranking":
      return answer.options.map((option) => line(`____  ${option.text}`, { italic: option.placeholder })).join("");
    case "scale": {
      if (!answer.rows) return table([answer.labels, answer.labels.map(() => BOX)], answer.labels.map(() => available / answer.labels.length));
      const first = available * 0.4;
      const rest = (available - first) / answer.labels.length;
      return table([["Statement", ...answer.labels], ...answer.rows.map((row) => [`${row.number}. ${row.text.text}`, ...answer.labels.map(() => BOX)])], [first, ...answer.labels.map(() => rest)]);
    }
    case "differential": {
      const end = available * 0.22;
      const point = (available - 2 * end) / answer.points.length;
      return table([["", ...answer.points, ""], [answer.left, ...answer.points.map(() => BOX), answer.right]], [end, ...answer.points.map(() => point), end]);
    }
    case "number":
      return line("Answer: __________");
    case "date":
      return line("Day: ____   Month: ____   Year: ______");
    case "time":
      return line("Hours: ____   Minutes: ____");
    case "file":
      return line("[File upload: online versions only]", { italic: true });
  }
}

function wordBody(blocks: readonly DocumentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.kind === "title") return paragraph(run(block.text, { italic: block.placeholder }), { style: "Title" });
      if (block.kind === "heading") return paragraph(run(block.text), { style: "Heading1" });
      if (block.kind === "paragraph") return paragraph(run(block.text, { italic: block.placeholder }));
      if (block.kind === "page-break") return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      const question = paragraph(`${run(`${block.number}.\t`, { bold: true })}${run(questionLine(block).slice(block.number.length + 2), { bold: true, italic: block.placeholder })}`, {
        indent: INDENT_TWIPS,
        hanging: INDENT_TWIPS,
        keepNext: true,
        after: 40,
      });
      const instruction = paragraph(run(block.instruction, { italic: true, size: 18 }), { indent: INDENT_TWIPS, keepNext: true, after: 40 });
      const help = block.helpText ? paragraph(run(block.helpText, { size: 18 }), { indent: INDENT_TWIPS, keepNext: true, after: 40 }) : "";
      return `${question}${instruction}${help}${wordAnswer(block.answer)}${paragraph("", { after: 120 })}`;
    })
    .join("");
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-GB"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:sz w:val="18"/></w:rPr></w:style></w:styles>`;

const field = (instruction: string) => `<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> ${instruction} </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>`;
const FOOTER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr ${W}><w:p><w:pPr><w:pStyle w:val="Footer"/></w:pPr>${run("Page ")}${field("PAGE")}${run(" of ")}${field("NUMPAGES")}</w:p></w:ftr>`;

/** The questionnaire as a Word document: A4, headings as Word headings, scales as tables, and page numbers in the footer. */
export function questionnaireDocx(blocks: readonly DocumentBlock[], title: string): Uint8Array<ArrayBuffer> {
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${W}><w:body>${wordBody(blocks)}<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="${PAGE_TWIPS.width}" w:h="${PAGE_TWIPS.height}"/><w:pgMar w:top="${PAGE_TWIPS.margin}" w:right="${PAGE_TWIPS.margin}" w:bottom="${PAGE_TWIPS.margin}" w:left="${PAGE_TWIPS.margin}" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const files: [string, string][] = [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
    ],
    [
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
    ],
    [
      "docProps/core.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${xmlText(title)}</dc:title></cp:coreProperties>`,
    ],
    ["word/document.xml", document],
    [
      "word/_rels/document.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`,
    ],
    ["word/styles.xml", STYLES],
    ["word/footer1.xml", FOOTER],
  ];
  return zip(files.map(([name, text]) => ({ name, data: utf8(text) })));
}

// PDF layout.

/** A4 in points, with 2 cm margins. */
export const PDF_PAGE = { width: 595.28, height: 841.89, margin: 56.69 } as const;
const CONTENT_WIDTH = PDF_PAGE.width - 2 * PDF_PAGE.margin;
const BOTTOM = PDF_PAGE.height - PDF_PAGE.margin;
const INDENT = 24;
const SIZES = { title: 18, heading: 13, body: 10.5, small: 9, table: 8.5 } as const;
const LEADING = 1.35;
/** Bold Helvetica is wider than regular, whose widths are measured; text is wrapped to a narrower width to allow for it. */
const BOLD_ALLOWANCE = 1.08;

export type PdfItem =
  | { type: "text"; x: number; y: number; size: number; font: "regular" | "bold" | "italic"; text: string }
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; x: number; y: number; radius: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number; width: number };

/** A piece of a block that is never split across pages. Items are placed relative to its top. */
interface Chunk {
  height: number;
  items: PdfItem[];
}

export interface PdfPage {
  items: PdfItem[];
  /** Indexes of the blocks that appear on this page, in order. */
  blocks: number[];
}

const offset = (items: readonly PdfItem[], dy: number): PdfItem[] =>
  items.map((item) => (item.type === "line" ? { ...item, y1: item.y1 + dy, y2: item.y2 + dy } : { ...item, y: item.y + dy }));

function textChunks(text: string, x: number, width: number, size: number, font: "regular" | "bold" | "italic"): Chunk[] {
  const lineHeight = size * LEADING;
  const maxWidth = font === "bold" ? width / BOLD_ALLOWANCE : width;
  return text.split("\n").flatMap((part) => wrapText(part, maxWidth, size).map((line) => ({ height: lineHeight, items: [{ type: "text" as const, x, y: size, size, font, text: line }] })));
}

const merge = (chunks: readonly Chunk[], after = 0): Chunk => {
  const items: PdfItem[] = [];
  let y = 0;
  for (const chunk of chunks) {
    items.push(...offset(chunk.items, y));
    y += chunk.height;
  }
  return { height: y + after, items };
};

/** A row of equal-width cells with centred, wrapped text: used for scale labels. */
function labelRow(labels: readonly string[], x: number, widths: readonly number[], size: number, bold: boolean): Chunk {
  const items: PdfItem[] = [];
  let left = x;
  let height = 0;
  labels.forEach((label, index) => {
    const lines = wrapText(label, widths[index] - 4, size);
    lines.forEach((line, lineIndex) => {
      const width = measureText(line, size) * (bold ? BOLD_ALLOWANCE : 1);
      items.push({ type: "text", x: left + (widths[index] - width) / 2, y: 4 + size + lineIndex * size * 1.2, size, font: bold ? "bold" : "regular", text: line });
    });
    height = Math.max(height, 8 + lines.length * size * 1.2);
    left += widths[index];
  });
  return { height, items };
}

const BOX_SIZE = 9;
const boxAt = (centreX: number, top: number): PdfItem => ({ type: "rect", x: centreX - BOX_SIZE / 2, y: top, width: BOX_SIZE, height: BOX_SIZE });
const rule = (x: number, y: number, width: number): PdfItem => ({ type: "line", x1: x, y1: y, x2: x + width, y2: y, width: 0.5 });

function answerChunks(answer: Answer): Chunk[] {
  const x = PDF_PAGE.margin + INDENT;
  const width = CONTENT_WIDTH - INDENT;
  const size = SIZES.body;
  switch (answer.kind) {
    case "lines":
      return Array.from({ length: answer.count }, () => ({ height: 22, items: [rule(x, 18, width)] }));
    case "choices":
    case "ranking":
      return answer.options.map((option) => {
        const lines = textChunks(option.text, x + 18, width - 18, size, option.placeholder ? "italic" : "regular");
        const marker: PdfItem =
          answer.kind === "ranking" ? rule(x, size + 1, 14) : answer.multiple ? { type: "rect", x, y: 2, width: BOX_SIZE, height: BOX_SIZE } : { type: "circle", x: x + BOX_SIZE / 2, y: 2 + BOX_SIZE / 2, radius: BOX_SIZE / 2 };
        const chunk = merge(lines, 3);
        return { height: chunk.height, items: [marker, ...chunk.items] };
      });
    case "scale": {
      const statementWidth = answer.rows ? width * 0.4 : 0;
      const columnWidth = (width - statementWidth) / answer.labels.length;
      const columns = answer.labels.map(() => columnWidth);
      const header = labelRow(answer.labels, x + statementWidth, columns, SIZES.table, false);
      const headerChunk: Chunk = { height: header.height, items: [...header.items, rule(x, header.height, width)] };
      const boxes = (top: number) => columns.map((_, index) => boxAt(x + statementWidth + columnWidth * (index + 0.5), top));
      if (!answer.rows) return [{ height: headerChunk.height + 22, items: [...headerChunk.items, ...boxes(headerChunk.height + 6), rule(x, headerChunk.height + 20, width)] }];
      const rows = answer.rows.map((row) => {
        const lines = wrapText(`${row.number}. ${row.text.text}`, statementWidth - 6, SIZES.small);
        const height = Math.max(20, 8 + lines.length * SIZES.small * 1.25);
        const items: PdfItem[] = lines.map((line, index) => ({ type: "text", x, y: 4 + SIZES.small + index * SIZES.small * 1.25, size: SIZES.small, font: row.text.placeholder ? "italic" : "regular", text: line }));
        return { height, items: [...items, ...boxes((height - BOX_SIZE) / 2), rule(x, height, width)] };
      });
      // The header stays with the first statement.
      return [merge([headerChunk, rows[0]]), ...rows.slice(1)];
    }
    case "differential": {
      const end = width * 0.22;
      const columnWidth = (width - 2 * end) / answer.points.length;
      const header = labelRow(answer.points, x + end, answer.points.map(() => columnWidth), SIZES.table, false);
      const left = wrapText(answer.left, end - 6, SIZES.small);
      const right = wrapText(answer.right, end - 6, SIZES.small);
      const height = Math.max(20, 8 + Math.max(left.length, right.length) * SIZES.small * 1.25);
      const top = header.height;
      const items: PdfItem[] = [
        ...header.items,
        ...left.map((line, index): PdfItem => ({ type: "text", x, y: top + 4 + SIZES.small + index * SIZES.small * 1.25, size: SIZES.small, font: "regular", text: line })),
        ...right.map((line, index): PdfItem => ({ type: "text", x: x + width - end + 6, y: top + 4 + SIZES.small + index * SIZES.small * 1.25, size: SIZES.small, font: "regular", text: line })),
        ...answer.points.map((_, index) => boxAt(x + end + columnWidth * (index + 0.5), top + (height - BOX_SIZE) / 2)),
      ];
      return [{ height: top + height + 4, items }];
    }
    case "number":
    case "date":
    case "time":
    case "file": {
      const text = { number: "Answer: __________", date: "Day: ____   Month: ____   Year: ______", time: "Hours: ____   Minutes: ____", file: "[File upload: online versions only]" }[answer.kind];
      return [merge(textChunks(text, x, width, size, answer.kind === "file" ? "italic" : "regular"), 4)];
    }
  }
}

/** The pieces of a block, and whether they must stay on one page when they can. */
function blockChunks(block: DocumentBlock): { chunks: Chunk[]; together: boolean; before: number } {
  const x = PDF_PAGE.margin;
  switch (block.kind) {
    case "title":
      return { chunks: [merge(textChunks(block.text, x, CONTENT_WIDTH, SIZES.title, block.placeholder ? "italic" : "bold"), 10)], together: true, before: 0 };
    case "heading":
      return { chunks: [merge(textChunks(block.text, x, CONTENT_WIDTH, SIZES.heading, "bold"), 4)], together: true, before: 14 };
    case "paragraph": {
      const lines = textChunks(block.text, x, CONTENT_WIDTH, SIZES.body, block.placeholder ? "italic" : "regular");
      lines[lines.length - 1] = { ...lines[lines.length - 1], height: lines[lines.length - 1].height + 6 };
      return { chunks: lines, together: false, before: 0 };
    }
    case "page-break":
      return { chunks: [], together: false, before: 0 };
    case "question": {
      const number: PdfItem = { type: "text", x, y: SIZES.body, size: SIZES.body, font: "bold", text: `${block.number}.` };
      const wording = textChunks(questionLine(block).slice(block.number.length + 2), x + INDENT, CONTENT_WIDTH - INDENT, SIZES.body, block.placeholder ? "italic" : "bold");
      const guidance = [
        ...textChunks(block.instruction, x + INDENT, CONTENT_WIDTH - INDENT, SIZES.small, "italic"),
        ...(block.helpText ? textChunks(block.helpText, x + INDENT, CONTENT_WIDTH - INDENT, SIZES.small, "regular") : []),
      ];
      const head = merge([...wording, ...guidance], 4);
      const answers = answerChunks(block.answer);
      // The question stays with the first part of its answer.
      const first = merge([{ height: head.height, items: [number, ...head.items] }, answers[0] ?? { height: 0, items: [] }]);
      const rest = answers.slice(1);
      if (rest.length > 0) rest[rest.length - 1] = { ...rest[rest.length - 1], height: rest[rest.length - 1].height + 10 };
      else first.height += 10;
      return { chunks: [first, ...rest], together: true, before: 0 };
    }
  }
}

/**
 * Lays the blocks out on A4 pages. A question moves to a new page rather than split,
 * unless it is taller than a page; a heading moves with the start of what follows it.
 */
export function layoutPdf(blocks: readonly DocumentBlock[]): PdfPage[] {
  const pages: PdfPage[] = [{ items: [], blocks: [] }];
  let y = PDF_PAGE.margin;
  const page = () => pages[pages.length - 1];
  const newPage = () => {
    pages.push({ items: [], blocks: [] });
    y = PDF_PAGE.margin;
  };
  const room = () => BOTTOM - y;
  const laid = blocks.map(blockChunks);
  // What must fit for a block to start on this page: all of it if it stays together, otherwise its first piece.
  const lead = (layout: ReturnType<typeof blockChunks> | undefined) => {
    if (!layout) return 0;
    const total = layout.chunks.reduce((sum, chunk) => sum + chunk.height, 0);
    return layout.together && total <= BOTTOM - PDF_PAGE.margin ? total : (layout.chunks[0]?.height ?? 0);
  };

  laid.forEach((layout, index) => {
    const block = blocks[index];
    if (block.kind === "page-break") {
      if (page().items.length > 0) newPage();
      return;
    }
    const empty = page().items.length === 0;
    const before = empty ? 0 : layout.before;
    let needed = lead(layout);
    if (block.kind === "heading") needed += lead(laid[index + 1]);
    if (!empty && before + needed > room()) newPage();
    else y += before;
    for (const chunk of layout.chunks) {
      if (chunk.height > room() && page().items.length > 0) newPage();
      page().items.push(...offset(chunk.items, y));
      if (!page().blocks.includes(index)) page().blocks.push(index);
      y += chunk.height;
    }
  });
  return pages;
}

// PDF writing.

const n = (value: number) => String(Math.round(value * 100) / 100);
const FONTS = { regular: "F1", bold: "F2", italic: "F3" } as const;

function pageContent(items: readonly PdfItem[], footer: string): string {
  const Y = (y: number) => n(PDF_PAGE.height - y);
  const K = 0.5523;
  const ops = ["0 g 0 G"];
  for (const item of items) {
    if (item.type === "text") ops.push(`BT /${FONTS[item.font]} ${n(item.size)} Tf ${n(item.x)} ${Y(item.y)} Td ${pdfString(item.text)} Tj ET`);
    else if (item.type === "rect") ops.push(`0.75 w ${n(item.x)} ${Y(item.y + item.height)} ${n(item.width)} ${n(item.height)} re S`);
    else if (item.type === "line") ops.push(`${n(item.width)} w ${n(item.x1)} ${Y(item.y1)} m ${n(item.x2)} ${Y(item.y2)} l S`);
    else {
      const { x, y, radius: r } = item;
      const c = r * K;
      ops.push(
        `0.75 w ${n(x + r)} ${Y(y)} m ${n(x + r)} ${Y(y - c)} ${n(x + c)} ${Y(y - r)} ${n(x)} ${Y(y - r)} c ${n(x - c)} ${Y(y - r)} ${n(x - r)} ${Y(y - c)} ${n(x - r)} ${Y(y)} c ${n(x - r)} ${Y(y + c)} ${n(x - c)} ${Y(y + r)} ${n(x)} ${Y(y + r)} c ${n(x + c)} ${Y(y + r)} ${n(x + r)} ${Y(y + c)} ${n(x + r)} ${Y(y)} c S`,
      );
    }
  }
  const width = measureText(footer, SIZES.small);
  ops.push(`BT /F1 ${SIZES.small} Tf ${n((PDF_PAGE.width - width) / 2)} ${n(PDF_PAGE.margin / 2)} Td ${pdfString(footer)} Tj ET`);
  return ops.join("\n");
}

/** The page label printed in each footer, also used by the printed preview. */
export const pageLabel = (page: number, total: number) => `Page ${page} of ${total}`;

/** The questionnaire as an A4 PDF with numbered pages. Returned as bytes. */
export function questionnairePdf(blocks: readonly DocumentBlock[], title: string): Uint8Array<ArrayBuffer> {
  const pages = layoutPdf(blocks);
  const fixed = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "", // The page tree, written once the page objects are numbered.
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>",
    `<< /Title ${pdfString(title)} /Producer (ResearchKit) >>`,
  ];
  const objects = [...fixed];
  const kids: number[] = [];
  pages.forEach((page, index) => {
    const content = pageContent(page.items, pageLabel(index + 1, pages.length));
    const pageNumber = objects.length + 1;
    kids.push(pageNumber);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(PDF_PAGE.width)} ${n(PDF_PAGE.height)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${pageNumber + 1} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    );
  });
  objects[1] = `<< /Type /Pages /Kids [${kids.map((kid) => `${kid} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  // Every character written is a single byte, so string length equals byte offset.
  let body = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const position of offsets) body += `${String(position).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(body.length);
  for (let index = 0; index < body.length; index++) bytes[index] = body.charCodeAt(index);
  return bytes;
}
