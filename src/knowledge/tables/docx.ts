/**
 * The table as a Word document (Office Open XML), written with the same package writer as
 * the questionnaire. It is a real Word table: header rows repeat on every page when the
 * table continues, rows don't split across pages, numbers align on a decimal tab, and
 * borders, shading and fonts are Word's own, so they stay when the table is resized.
 */

import { docxPackage, WORD_NAMESPACES, xmlText } from "../research/questionnaire-export";
import { measureText } from "../research/conceptual-layout";
import { captionAlign, captionLines, noteParagraphs } from "./caption";
import { decimalColumns, numericColumns } from "./html";
import { styleSpec, FONT_FAMILIES, PADDING_POINTS } from "./styles";
import type { ResearchTable, TableCell, TableOptions, TextRun } from "./types";

/** A4 in twentieths of a point, with 2 cm margins. */
export const A4_TWIPS = { short: 11906, long: 16838, margin: 1134 } as const;

/** The width available for the table, in twips. */
export const contentTwips = (orientation: TableOptions["orientation"]) => (orientation === "landscape" ? A4_TWIPS.long : A4_TWIPS.short) - 2 * A4_TWIPS.margin;

const RULE = 'w:val="single" w:sz="8" w:space="0" w:color="000000"';

function runXml(run: TextRun, fontSize: number): string {
  const properties = [
    run.bold ? "<w:b/>" : "",
    run.italic ? "<w:i/>" : "",
    run.smallCaps ? "<w:smallCaps/>" : "",
    run.superscript ? '<w:vertAlign w:val="superscript"/>' : "",
    `<w:sz w:val="${fontSize * 2}"/><w:szCs w:val="${fontSize * 2}"/>`,
  ].join("");
  return `<w:r><w:rPr>${properties}</w:rPr><w:t xml:space="preserve">${xmlText(run.text)}</w:t></w:r>`;
}

const paragraphXml = (runs: readonly TextRun[], fontSize: number, { align = "left", keepNext = false, after = 0 }: { align?: string; keepNext?: boolean; after?: number } = {}) =>
  `<w:p><w:pPr>${keepNext ? "<w:keepNext/>" : ""}<w:spacing w:before="0" w:after="${after}"/><w:jc w:val="${align}"/></w:pPr>${runs.map((run) => runXml(run, fontSize)).join("")}</w:p>`;

/** Column widths in twips, shared out by each column's longest text so the table fills the page width. */
export function columnWidths(table: ResearchTable, total: number): number[] {
  const longest = Array.from({ length: table.columns }, () => 1);
  for (const cells of [...table.header, ...table.rows.filter((candidate) => candidate.kind !== "group").map((candidate) => candidate.cells)]) {
    let column = 0;
    for (const cell of cells) {
      const span = cell.span ?? 1;
      // Long text wraps, so its natural width counts only up to a sentence's worth.
      if (span === 1) longest[column] = Math.max(longest[column], Math.min(measureText(cell.text, 10) + (cell.indent ?? 0) * 12 + 14, 260));
      column += span;
    }
  }
  const sum = longest.reduce((a, b) => a + b, 0);
  return longest.map((width) => Math.round((width / sum) * total));
}

/** The table's XML, borders and all. */
function tableXml(table: ResearchTable, options: TableOptions): string {
  const widths = columnWidths(table, contentTwips(options.orientation));
  const numeric = numericColumns(table);
  const decimals = decimalColumns(table);
  const pad = PADDING_POINTS[options.padding];
  // Each decimal column's tab sits where its widest fraction (with any asterisks) still fits, in twips.
  const fractions = Array.from({ length: table.columns }, () => 0);
  for (const candidate of table.rows) {
    let column = 0;
    for (const cell of candidate.cells) {
      if (decimals[column]) {
        const point = cell.text.indexOf(".");
        fractions[column] = Math.max(fractions[column], measureText(point < 0 ? "" : cell.text.slice(point), options.fontSize) * 20 + (cell.notes?.length ?? 0) * options.fontSize * 12);
      }
      column += cell.span ?? 1;
    }
  }
  const size = options.fontSize;
  const border = options.borders;
  const tableBorders =
    border === "grid"
      ? ["top", "left", "bottom", "right", "insideH", "insideV"].map((side) => `<w:${side} ${RULE}/>`).join("")
      : border === "outer"
        ? ["top", "left", "bottom", "right"].map((side) => `<w:${side} ${RULE}/>`).join("")
        : border === "horizontal"
          ? `<w:top ${RULE}/><w:bottom ${RULE}/>`
          : "";
  const cellBorders = (sides: { top?: boolean; bottom?: boolean }) => {
    if (border === "none" || border === "grid") return "";
    const xml = `${sides.top ? `<w:top ${RULE}/>` : ""}${sides.bottom ? `<w:bottom ${RULE}/>` : ""}`;
    return xml ? `<w:tcBorders>${xml}</w:tcBorders>` : "";
  };
  const alignFor = (column: number, cell: TableCell, header: boolean) => {
    if (column === 0) return "left";
    if (header) return "center";
    if (numeric[column] || cell.numeric) return options.numberAlign === "center" ? "center" : "right";
    return options.textAlign;
  };
  const cellXml = (cell: TableCell, column: number, header: boolean, extra: { top?: boolean; bottom?: boolean; shade?: boolean }) => {
    const span = cell.span ?? 1;
    const width = widths.slice(column, column + span).reduce((a, b) => a + b, 0);
    const decimal = !header && decimals[column] && options.numberAlign === "decimal" && span === 1 && cell.text !== "";
    const runs: TextRun[] = [{ text: cell.text, bold: header ? options.boldHeaders : cell.bold, italic: cell.italic }, ...(cell.notes ?? []).map((mark) => ({ text: mark, superscript: true }))];
    // A decimal tab in the middle of the cell lines numbers up on their decimal points.
    const tabs = decimal ? `<w:tabs><w:tab w:val="decimal" w:pos="${Math.max(0, Math.round(width - pad.horizontal * 40 - fractions[column] - 20))}"/></w:tabs>` : "";
    const indent = cell.indent ? `<w:ind w:left="${cell.indent * 240}"/>` : "";
    const paragraph = `<w:p><w:pPr>${tabs}<w:spacing w:before="0" w:after="0"/>${indent}<w:jc w:val="${decimal ? "left" : alignFor(column, cell, header)}"/></w:pPr>${decimal ? "<w:r><w:tab/></w:r>" : ""}${runs.filter((run) => run.text).map((run) => runXml(run, size)).join("")}</w:p>`;
    return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ""}${cellBorders(extra)}${extra.shade ? '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>' : ""}<w:vAlign w:val="${header ? "bottom" : "top"}"/></w:tcPr>${paragraph}</w:tc>`;
  };
  const lastHeader = table.header.length - 1;
  const headerRows = table.header
    .map((cells, rowIndex) => {
      let column = 0;
      const xml = cells
        .map((cell) => {
          const start = column;
          column += cell.span ?? 1;
          return cellXml(cell, start, true, { bottom: rowIndex === lastHeader || ((cell.span ?? 1) > 1 && cell.text.trim() !== "") });
        })
        .join("");
      return `<w:tr><w:trPr>${options.repeatHeader ? "<w:tblHeader/>" : ""}<w:cantSplit/></w:trPr>${xml}</w:tr>`;
    })
    .join("");
  let bodyIndex = 0;
  const bodyRows = table.rows
    .map((candidate) => {
      const shade = candidate.kind !== "group" && options.alternatingRows && bodyIndex++ % 2 === 1;
      let column = 0;
      const xml = candidate.cells
        .map((cell) => {
          const start = column;
          column += cell.span ?? 1;
          return cellXml(cell, start, false, { top: candidate.kind === "total", shade });
        })
        .join("");
      return `<w:tr><w:trPr><w:cantSplit/></w:trPr>${xml}</w:tr>`;
    })
    .join("");
  const grid = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join("");
  const margins = `<w:tblCellMar><w:top w:w="${pad.vertical * 20}" w:type="dxa"/><w:left w:w="${pad.horizontal * 20}" w:type="dxa"/><w:bottom w:w="${pad.vertical * 20}" w:type="dxa"/><w:right w:w="${pad.horizontal * 20}" w:type="dxa"/></w:tblCellMar>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="${widths.reduce((a, b) => a + b, 0)}" w:type="dxa"/>${tableBorders ? `<w:tblBorders>${tableBorders}</w:tblBorders>` : ""}<w:tblLayout w:type="fixed"/>${margins}<w:tblLook w:val="0000" w:firstRow="${options.repeatHeader ? 1 : 0}" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${headerRows}${bodyRows}</w:tbl>`;
}

/** The document body: caption, table and notes, in the style's order. */
export function tableDocumentXml(table: ResearchTable, options: TableOptions): string {
  const spec = styleSpec(options);
  const size = options.fontSize;
  const align = captionAlign(table, options);
  const caption = captionLines(table, options)
    .map((line, index, lines) => paragraphXml(line, size, { align, keepNext: spec.position === "above", after: index === lines.length - 1 ? 120 : 0 }))
    .join("");
  const notes = noteParagraphs(table, options)
    .map((paragraph) => paragraphXml(paragraph, size, { after: 40 }))
    .join("");
  const [width, height] = options.orientation === "landscape" ? [A4_TWIPS.long, A4_TWIPS.short] : [A4_TWIPS.short, A4_TWIPS.long];
  const section = `<w:sectPr><w:pgSz w:w="${width}" w:h="${height}"${options.orientation === "landscape" ? ' w:orient="landscape"' : ""}/><w:pgMar w:top="${A4_TWIPS.margin}" w:right="${A4_TWIPS.margin}" w:bottom="${A4_TWIPS.margin}" w:left="${A4_TWIPS.margin}" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr>`;
  const spacer = "<w:p><w:pPr><w:spacing w:before=\"0\" w:after=\"0\"/></w:pPr></w:p>";
  const body = spec.position === "above" ? `${caption}${tableXml(table, options)}${notes || spacer}` : `${tableXml(table, options)}${caption}${notes}`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${WORD_NAMESPACES}><w:body>${body}${section}</w:body></w:document>`;
}

/** Word styles: the chosen font and size as the document default, single-spaced. */
export function tableStylesXml(options: TableOptions): string {
  const font = FONT_FAMILIES[options.font].word;
  const size = options.fontSize * 2;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${WORD_NAMESPACES}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${xmlText(font)}" w:hAnsi="${xmlText(font)}" w:eastAsia="${xmlText(font)}" w:cs="${xmlText(font)}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/><w:lang w:val="en-GB"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
}

export function tableDocx(table: ResearchTable, options: TableOptions): Uint8Array<ArrayBuffer> {
  return docxPackage({ document: tableDocumentXml(table, options), styles: tableStylesXml(options), title: table.title });
}
