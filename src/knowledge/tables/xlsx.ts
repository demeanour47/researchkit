/**
 * Excel workbooks (.xlsx, Office Open XML SpreadsheetML), written with the same package
 * writer as the Word documents, so no dependency is needed. Each sheet has a bold header
 * row that stays in view when scrolling, a filter on the header, set column widths, and
 * wrapped text. Text is stored as inline strings, which Excel never runs as formulas.
 */

import { utf8, xmlText, zip } from "../research/questionnaire-export";

export type SheetCell = string | number | null;

export interface Sheet {
  /** Up to 31 characters; characters Excel forbids in names are removed. */
  name: string;
  header: readonly string[];
  rows: readonly (readonly SheetCell[])[];
  /** Column widths in characters; long text wraps within them. */
  widths?: readonly number[];
}

/** A column's letters: 0 is A, 25 is Z, 26 is AA. */
export function columnLetters(index: number): string {
  let letters = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
  return letters;
}

/** A sheet name Excel accepts: no []:*?/\ characters, at most 31 characters, never empty. */
export const sheetName = (name: string) => name.replace(/[[\]:*?/\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 31) || "Sheet1";

function cellXml(value: SheetCell, reference: string, style: number): string {
  if (value === null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) return `<c r="${reference}" s="${style}"><v>${value}</v></c>`;
  return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xmlText(String(value))}</t></is></c>`;
}

function sheetXml(sheet: Sheet): string {
  const columns = sheet.header.length;
  const widths = sheet.header.map((_, index) => Math.max(6, Math.min(80, sheet.widths?.[index] ?? 16)));
  const header = `<row r="1">${sheet.header.map((name, index) => cellXml(name, `${columnLetters(index)}1`, 1)).join("")}</row>`;
  const rows = sheet.rows.map((values, rowIndex) => `<row r="${rowIndex + 2}">${values.slice(0, columns).map((value, index) => cellXml(value, `${columnLetters(index)}${rowIndex + 2}`, 2)).join("")}</row>`).join("");
  const last = columnLetters(Math.max(0, columns - 1));
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("")}</cols><sheetData>${header}${rows}</sheetData>${columns > 0 ? `<autoFilter ref="A1:${last}${sheet.rows.length + 1}"/>` : ""}</worksheet>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>`;

/** A workbook of one or more sheets, as the bytes of an .xlsx file. */
export function workbookXlsx(sheets: readonly Sheet[], title: string): Uint8Array<ArrayBuffer> {
  const names = sheets.map((sheet, index) => {
    const base = sheetName(sheet.name);
    return sheets.slice(0, index).some((other) => sheetName(other.name) === base) ? `${base.slice(0, 28)} ${index + 1}` : base;
  });
  // Each sheet's filter range, which Excel records as a hidden defined name.
  const filters = names
    .map((name, index) => (sheets[index].header.length > 0 ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${index}" hidden="1">'${xmlText(name.replace(/'/g, "''"))}'!$A$1:$${columnLetters(sheets[index].header.length - 1)}$${sheets[index].rows.length + 1}</definedName>` : ""))
    .join("");
  const files: [string, string][] = [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
    ],
    [
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
    ],
    [
      "docProps/core.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${xmlText(title)}</dc:title></cp:coreProperties>`,
    ],
    [
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((name, index) => `<sheet name="${xmlText(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets>${filters ? `<definedNames>${filters}</definedNames>` : ""}</workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ],
    ["xl/styles.xml", STYLES],
    ...sheets.map((sheet, index): [string, string] => [`xl/worksheets/sheet${index + 1}.xml`, sheetXml(sheet)]),
  ];
  return zip(files.map(([name, text]) => ({ name, data: utf8(text) })));
}
