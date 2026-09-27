import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { columnLetters, sheetName, workbookXlsx } from "../tables/xlsx";
import { EXPORT_FORMATS, exportMatrix, matrixTable, matrixTableOptions, ORGANISATION_HEADERS } from "./export";
import { importStudies } from "./import";
import { setFavourite, setPriority, setStatus, setTag } from "./matrix";
import { SAMPLE_MATRIX, study } from "./test-helpers";
import { COLUMN_PRESETS, MATRIX_FIELDS } from "./types";

const text = (data: Uint8Array | string) => (typeof data === "string" ? data : new TextDecoder().decode(data));
const fields = [...COLUMN_PRESETS.essentials];

describe("matrixTable", () => {
  const table = matrixTable(SAMPLE_MATRIX, fields);
  it("has one column per chosen field and one row per study", () => {
    assert.deepEqual(table.header[0].map((cell) => cell.text), ["Author(s)", "Year", "Title", "Country", "Research design", "Sample size", "Major findings", "Research gap"]);
    assert.equal(table.rows.length, 6);
    assert.equal(table.type, "reference-coding");
    assert.equal(table.rowHeaders, true);
  });
  it("adds the organisation columns when asked", () => {
    const organised = matrixTable(SAMPLE_MATRIX, fields, { withOrganisation: true });
    assert.deepEqual(organised.header[0].slice(-4).map((cell) => cell.text), [...ORGANISATION_HEADERS]);
    assert.equal(organised.columns, fields.length + 4);
  });
  it("names studies without authors by their label", () => {
    assert.equal(matrixTable([study("x", { title: "Untitled paper", year: "2020" })], ["authors"]).rows[0].cells[0].text, "Untitled paper (2020)");
  });
  it("counts the studies in the note", () => {
    assert.deepEqual(table.notes.general, ["6 studies."]);
    assert.deepEqual(matrixTable([SAMPLE_MATRIX[0]], fields).notes.general, ["1 study."]);
  });
  it("prints wide matrices landscape, gridded and smaller", () => {
    assert.deepEqual([matrixTableOptions(4).fontSize, matrixTableOptions(8).fontSize, matrixTableOptions(12).fontSize, matrixTableOptions(30).fontSize], [10, 9, 8, 7]);
    assert.equal(matrixTableOptions(4).orientation, "landscape");
    assert.equal(matrixTableOptions(4).borders, "grid");
  });
});

describe("exportMatrix", () => {
  for (const format of EXPORT_FORMATS)
    it(`writes ${format} with the study details`, () => {
      const file = exportMatrix(format, SAMPLE_MATRIX, fields);
      assert.ok(file.extension && file.type);
      if (format === "PDF") assert.ok(text(file.data).startsWith("%PDF-1.4"));
      else if (format === "DOCX" || format === "XLSX") assert.deepEqual([...(file.data as Uint8Array).slice(0, 2)], [0x50, 0x4b]);
      else assert.match(text(file.data), /Screen time and sleep in first-year students/);
    });
  it("puts the chosen title on the table", () => {
    assert.match(text(exportMatrix("HTML", SAMPLE_MATRIX, fields, "Review of Screens").data), /<title>Review of Screens<\/title>/);
  });
  it("includes organisation columns in CSV but not in Markdown", () => {
    assert.match(text(exportMatrix("CSV", SAMPLE_MATRIX, fields).data), /Status,Priority,Tag,Favourite/);
    assert.doesNotMatch(text(exportMatrix("Markdown", SAMPLE_MATRIX, fields).data), /Favourite/);
  });
  it("round-trips through CSV, keeping every column and the organisation", () => {
    let organised = setTag(SAMPLE_MATRIX, "s1", "purple");
    organised = setFavourite(organised, "s1", true);
    organised = setStatus(organised, "s2", "reviewed");
    organised = setPriority(organised, "s3", "low");
    const csv = text(exportMatrix("CSV", organised, [...MATRIX_FIELDS]).data);
    const back = importStudies([], "csv", csv).matrix;
    assert.equal(back.length, 6);
    back.forEach((restored, index) => assert.deepEqual(restored.fields, organised[index].fields, `study ${index + 1}`));
    assert.deepEqual([back[0].tag, back[0].favourite, back[1].status, back[2].priority], ["purple", true, "reviewed", "low"]);
  });
  it("stores years as numbers in Excel", () => {
    const xml = text(exportMatrix("XLSX", SAMPLE_MATRIX, fields).data);
    assert.match(xml, /<c r="B2" s="2"><v>2016<\/v><\/c>/);
  });
});

describe("workbookXlsx", () => {
  const bytes = workbookXlsx([{ name: "Matrix: 2024/25", header: ["Name", "Score"], rows: [["A & B", 3], ["=SUM(A1)", null]], widths: [20, 10] }], "My workbook");
  const xml = text(bytes);
  it("is a ZIP package with the workbook parts", () => {
    for (const part of ["[Content_Types].xml", "xl/workbook.xml", "xl/styles.xml", "xl/worksheets/sheet1.xml", "xl/_rels/workbook.xml.rels", "docProps/core.xml"]) assert.ok(xml.includes(part), part);
  });
  it("writes a bold header row that stays in view, with a filter", () => {
    assert.match(xml, /<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"\/>/);
    assert.match(xml, /<c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">Name<\/t><\/is><\/c>/);
    assert.match(xml, /<autoFilter ref="A1:B3"\/>/);
    assert.match(xml, /_xlnm\._FilterDatabase/);
  });
  it("writes numbers as numbers and escapes text", () => {
    assert.match(xml, /<c r="B2" s="2"><v>3<\/v><\/c>/);
    assert.match(xml, /A &amp; B/);
  });
  it("stores formula-like text as text, never as a formula", () => {
    assert.match(xml, /<t xml:space="preserve">=SUM\(A1\)<\/t>/);
    assert.doesNotMatch(xml, /<f>/);
  });
  it("leaves empty cells out", () => {
    assert.doesNotMatch(xml, /r="B3"/);
  });
  it("sets column widths", () => {
    assert.match(xml, /<col min="1" max="1" width="20" customWidth="1"\/>/);
  });
  it("cleans sheet names", () => {
    assert.equal(sheetName("Matrix: 2024/25"), "Matrix 2024 25");
    assert.equal(sheetName(""), "Sheet1");
    assert.equal(sheetName("x".repeat(40)).length, 31);
  });
  it("names columns with letters", () => {
    assert.deepEqual([0, 25, 26, 27, 51, 52, 701, 702].map(columnLetters), ["A", "Z", "AA", "AB", "AZ", "BA", "ZZ", "AAA"]);
  });
  it("keeps sheet names unique", () => {
    const two = text(workbookXlsx([{ name: "Data", header: ["A"], rows: [] }, { name: "Data", header: ["A"], rows: [] }], "T"));
    assert.match(two, /<sheet name="Data" sheetId="1"/);
    assert.match(two, /<sheet name="Data 2" sheetId="2"/);
  });
});
