import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crc32 } from "../research/conceptual-export";
import { EMPTY_TYPED_PROJECT, projectFromTyped } from "../research/typed-project";
import { buildTable } from "./build";
import { columnWidths, contentTwips, tableDocumentXml, tableDocx, tableStylesXml } from "./docx";
import { decimalColumns, escapeHtml, isPlainNumber, numericColumns, tableHtml, tableHtmlDocument } from "./html";
import { PdfText, SYMBOL_CODES, pdfPageCount, tablePdf, wrapRuns } from "./pdf";
import { BOM, guardFormula, tableCsv, tableGrid, tableMarkdown, tablePlainText, tableTsv } from "./text";
import { DEFAULT_TABLE_OPTIONS, TABLE_TYPES, TABLE_TYPE_INFO, type ResearchTable, type TableOptions, type TableType } from "./types";

const project = projectFromTyped(
  { ...EMPTY_TYPED_PROJECT, independent: "screen time", dependent: "sleep quality", design: "correlational", technique: "stratified", margin: "5", hypotheses: "relationship" },
  { "var-screen-time": "ratio", "var-sleep-quality": "interval" },
);
const options = (changes: Partial<TableOptions> = {}): TableOptions => ({ ...DEFAULT_TABLE_OPTIONS, ...changes });
const make = (type: TableType, changes: Partial<TableOptions> = {}, text = TABLE_TYPE_INFO[type].example): ResearchTable => {
  const result = buildTable({ type, text, project, options: options(changes) });
  assert.ok(result.table, JSON.stringify(result.issues));
  return result.table;
};
const pdfText = (bytes: Uint8Array) => Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
const unzipText = (bytes: Uint8Array, name: string) => {
  // Entries are stored uncompressed, so each part's text follows its local header.
  const text = new TextDecoder().decode(bytes);
  const start = text.indexOf(`${name}<?xml`);
  return start < 0 ? "" : text.slice(start + name.length, text.indexOf("PK\u0003\u0004", start));
};

const crosstab = make("cross-tabulation");
const coefficients = make("coefficients");

describe("HTML for the page", () => {
  const html = tableHtml(make("cross-tabulation", { title: "Faculty & <apps>" }), options(), { mode: "document", idPrefix: "t1" });
  it("puts the label and title in a caption", () => {
    assert.match(html, /<caption[^>]*><span style="display:block"><b>Table 1<\/b><\/span><span style="display:block"><i>Faculty &amp; &lt;apps&gt;<\/i><\/span><\/caption>/);
  });
  it("marks column headers with scope and ids, spanning headings with colgroup", () => {
    assert.match(html, /<th id="t1-h0-1" scope="colgroup" colspan="2"/);
    assert.match(html, /<th id="t1-h1-0" scope="col"/);
  });
  it("marks row headers with scope", () => {
    assert.match(html, /<th id="t1-r1" scope="row"/);
  });
  it("associates each data cell with its row and column headers", () => {
    assert.match(html, /<td headers="t1-r1 t1-h0-1 t1-h1-1"/);
  });
  it("links the notes to the table", () => {
    assert.match(html, /aria-describedby="t1-notes"/);
    assert.match(html, /<div id="t1-notes"/);
  });
  it("repeats the header when printed", () => {
    assert.match(html, /<thead style="display:table-header-group">/);
  });
  it("draws APA's horizontal rules only", () => {
    assert.match(html, /border-top:1pt solid #000000/);
    assert.doesNotMatch(html, /border:1pt solid/);
    assert.doesNotMatch(html, /border-left/);
  });
  it("draws a full grid when asked", () => {
    assert.match(tableHtml(crosstab, options({ borders: "grid" }), { mode: "document" }), /border:1pt solid #000000/);
  });
  it("draws an outer box when asked", () => {
    assert.match(tableHtml(crosstab, options({ borders: "outer" }), { mode: "document" }), /border-left:1pt solid/);
  });
  it("draws no rules when asked", () => {
    assert.doesNotMatch(tableHtml(crosstab, options({ borders: "none" }), { mode: "document" }), /solid/);
  });
  it("uses the chosen font, size and padding", () => {
    const styled = tableHtml(crosstab, options({ font: "arial", fontSize: 10, padding: "relaxed" }), { mode: "document" });
    assert.match(styled, /font-family:Arial, Helvetica, sans-serif;font-size:10pt/);
    assert.match(styled, /padding:6pt 8pt/);
  });
  it("bolds headers and shades alternate rows when asked", () => {
    const styled = tableHtml(crosstab, options({ boldHeaders: true, alternatingRows: true }), { mode: "document" });
    assert.match(styled, /<th[^>]*font-weight:bold/);
    assert.match(styled, /background-color:#f2f2f2/);
  });
  it("groups rows into separate bodies with a row group header", () => {
    const profile = tableHtml(make("demographic-profile"), options(), { mode: "document", idPrefix: "d" });
    assert.match(profile, /<tbody><tr><th id="d-g0" scope="rowgroup" colspan="3"/);
    assert.match(profile, /<\/tbody><tbody><tr><th id="d-g1" scope="rowgroup"/);
    assert.match(profile, /<th id="d-r1" scope="row" headers="d-g0"/);
  });
  it("gives timeline marks a text alternative", () => {
    assert.match(tableHtml(make("research-timeline"), options(), { mode: "document" }), /<span aria-hidden="true">■<\/span><span style="position:absolute[^"]*">Yes<\/span>/);
  });
  it("shows note marks as superscripts", () => {
    assert.match(tableHtml(make("custom", {}, "A,B\nx^a,1"), options({ footnotes: "Note." }), { mode: "document" }), /x<sup>a<\/sup>/);
  });
  it("spans the page width", () => {
    assert.match(html, /<table style="width:100%;border-collapse:collapse/);
  });
  it("escapes every kind of markup", () => {
    assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("HTML for Word", () => {
  const html = tableHtml(crosstab, options(), { mode: "word" });
  it("puts the caption and notes in paragraphs outside the table", () => {
    assert.match(html, /^<p style="margin:0 0 6pt 0;text-align:left;[^"]*"><b>Table 1<\/b><br><i>Cross-Tabulation<\/i><\/p><table/);
    assert.match(html, /<\/table><div style="margin-top:4pt"><p/);
  });
  it("keeps formatting inline and leaves out ids", () => {
    assert.doesNotMatch(html, /id="/);
    assert.match(html, /<td style="[^"]*padding:3pt 6pt/);
  });
  it("puts a caption below when the style says so", () => {
    const below = tableHtml(crosstab, options({ style: "custom", custom: { ...DEFAULT_TABLE_OPTIONS.custom, position: "below" } }), { mode: "word" });
    assert.match(below, /<\/table><p/);
  });
  it("makes a standalone document with the page orientation", () => {
    const document = tableHtmlDocument(crosstab, options({ orientation: "landscape" }));
    assert.match(document, /^<!doctype html>\n<html lang="en">/);
    assert.match(document, /@page \{ size: A4 landscape;/);
    assert.match(document, /<title>Cross-Tabulation<\/title>/);
  });
});

describe("column kinds", () => {
  it("recognises plain numbers for decimal alignment", () => {
    for (const text of ["1.25", "−0.52", "< .001", ".48**", "1,204", "12"]) assert.ok(isPlainNumber(text), text);
    for (const text of ["4 (66.7)", "—", "abc", ""]) assert.ok(!isPlainNumber(text), text);
  });
  it("aligns plain-number columns on the decimal point, but not n (%) columns", () => {
    assert.deepEqual(decimalColumns(coefficients).slice(0, 3), [false, true, true]);
    assert.ok(numericColumns(crosstab)[1]);
    assert.ok(!decimalColumns(crosstab)[1]);
  });
});

describe("text formats", () => {
  it("writes CSV with a byte order mark, CRLF lines and quoting", () => {
    const csv = tableCsv(make("reference-coding"));
    assert.ok(csv.startsWith(BOM));
    assert.match(csv, /\r\n/);
    assert.match(csv, /"Study A \(2021\)"|Study A \(2021\)/);
  });
  it("writes hyphens for minus signs in spreadsheets", () => {
    const tsv = tableTsv(coefficients);
    assert.match(tsv, /\t-0\.52\t/);
    assert.doesNotMatch(tsv, /−/);
  });
  it("keeps spanned headings in their first column", () => {
    assert.deepEqual(tableGrid(coefficients)[0].slice(6), ["95% CI", "", "VIF"]);
    assert.deepEqual(tableGrid(coefficients)[1].slice(6, 8), ["LL", "UL"]);
  });
  it("quotes TSV cells containing tabs or quotes", () => {
    const tsv = tableTsv(make("custom", {}, 'Name,Text\nA,"say ""hi"""'));
    assert.match(tsv, /"say ""hi"""/);
  });
  it("guards text that would run as a formula", () => {
    assert.equal(guardFormula("=SUM(A1)"), "'=SUM(A1)");
    assert.equal(guardFormula("@cmd"), "'@cmd");
    assert.equal(guardFormula("-0.52"), "-0.52");
    assert.equal(guardFormula("+12"), "+12");
    assert.equal(guardFormula("- note"), "'- note");
  });
  it("writes a Markdown table with caption, alignment and notes", () => {
    const markdown = tableMarkdown(coefficients, options());
    assert.match(markdown, /^\*\*Table 1\*\*  \n\*Regression Coefficients\*\n\n\| Predictor \| B \| SE \| β \| t \| p \| 95% CI LL \| 95% CI UL \| VIF \|\n\| :--- \| ---: \|/);
    assert.match(markdown, /\*Note\.\* CI = confidence interval/);
  });
  it("escapes pipes and marks groups in Markdown", () => {
    const markdown = tableMarkdown(make("custom", {}, "Name,Value\nGroup,\nA|B,1"), options());
    assert.match(markdown, /\| \*\*Group\*\* \|/);
    assert.match(markdown, /A\\\|B/);
  });
  it("writes plain text with the caption, tab-separated rows and notes", () => {
    const text = tablePlainText(crosstab, options());
    assert.match(text, /^Table 1\nCross-Tabulation\n\tUses a sleep app\t\t\nFaculty\tNo\tYes\tTotal\n/);
    assert.match(text, /Note\. Values are n \(%\)/);
  });
});

describe("Word document", () => {
  const bytes = tableDocx(coefficients, options());
  it("is a ZIP package with the Word parts", () => {
    assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
    const text = new TextDecoder().decode(bytes);
    for (const part of ["[Content_Types].xml", "_rels/.rels", "word/document.xml", "word/styles.xml", "docProps/core.xml"]) assert.ok(text.includes(part), part);
    assert.ok(!text.includes("word/footer1.xml"));
  });
  it("records each part's checksum", () => {
    const document = new TextEncoder().encode(tableDocumentXml(coefficients, options()));
    const checksum = crc32(document);
    const view = new DataView(bytes.buffer);
    let found = false;
    for (let offset = 0; offset < bytes.length - 4; offset++) if (view.getUint32(offset, true) === checksum) found = true;
    assert.ok(found);
  });
  const xml = tableDocumentXml(coefficients, options());
  it("repeats header rows and keeps rows whole", () => {
    assert.match(xml, /<w:trPr><w:tblHeader\/><w:cantSplit\/><\/w:trPr>/);
    assert.doesNotMatch(tableDocumentXml(coefficients, options({ repeatHeader: false })), /tblHeader/);
  });
  it("spans the confidence interval heading and rules it", () => {
    assert.match(xml, /<w:gridSpan w:val="2"\/><w:tcBorders><w:bottom w:val="single"/);
  });
  it("aligns numbers on decimal tabs", () => {
    assert.match(xml, /<w:tab w:val="decimal" w:pos="\d+"\/>/);
    assert.doesNotMatch(tableDocumentXml(coefficients, options({ numberAlign: "right" })), /w:val="decimal"/);
  });
  it("sets bold, italic and superscript runs", () => {
    assert.match(xml, /<w:b\/>/);
    assert.match(xml, /<w:i\/>/);
    assert.match(tableDocumentXml(make("custom", {}, "A,B\nx^a,1"), options()), /<w:vertAlign w:val="superscript"\/>/);
  });
  it("turns the page for landscape", () => {
    assert.match(tableDocumentXml(coefficients, options({ orientation: "landscape" })), /<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"\/>/);
  });
  it("shades alternate rows and draws a grid when asked", () => {
    assert.match(tableDocumentXml(coefficients, options({ alternatingRows: true })), /w:fill="F2F2F2"/);
    assert.match(tableDocumentXml(coefficients, options({ borders: "grid" })), /<w:insideV w:val="single"/);
  });
  it("uses small capitals for IEEE titles", () => {
    assert.match(tableDocumentXml(coefficients, options({ style: "ieee" })), /<w:smallCaps\/>/);
  });
  it("sets the font and size as the document default", () => {
    assert.match(tableStylesXml(options({ font: "calibri", fontSize: 11 })), /w:ascii="Calibri".*<w:sz w:val="22"\/>/);
  });
  it("fills the page width with its columns", () => {
    const widths = columnWidths(coefficients, contentTwips("portrait"));
    assert.ok(Math.abs(widths.reduce((a, b) => a + b, 0) - contentTwips("portrait")) <= widths.length);
    assert.equal(contentTwips("landscape"), 16838 - 2 * 1134);
  });
  it("escapes text in the XML", () => {
    assert.match(tableDocumentXml(make("custom", {}, "Name,Note\nA & B,<x>"), options()), /A &amp; B.*&lt;x&gt;/);
  });
  it("finds its parts after unzipping", () => {
    assert.match(unzipText(bytes, "docProps/core.xml"), /<dc:title>Regression Coefficients<\/dc:title>/);
  });
});

describe("PDF", () => {
  it("measures Times and Helvetica text", () => {
    const serif = new PdfText(true, 10);
    const sans = new PdfText(false, 10);
    assert.equal(serif.width("0"), 5);
    assert.ok(sans.width("abc") > serif.width("abc"));
  });
  it("takes Greek letters and the minus sign from the Symbol font", () => {
    const pieces = new PdfText(true, 10).pieces("χ² −0.5", {});
    assert.deepEqual(
      pieces.map((piece) => piece.font),
      ["F5", "F1", "F5", "F1"],
    );
    assert.equal(pieces[0].literal, "(c)");
    assert.ok(SYMBOL_CODES["β"] && SYMBOL_CODES["η"] && SYMBOL_CODES["α"]);
  });
  it("chooses bold and italic fonts", () => {
    const text = new PdfText(false, 10);
    assert.equal(text.pieces("A", { bold: true })[0].font, "F2");
    assert.equal(text.pieces("A", { italic: true })[0].font, "F3");
    assert.equal(text.pieces("A", { bold: true, italic: true })[0].font, "F4");
    assert.equal(text.pieces("■", {})[0].font, "F6");
  });
  it("wraps text at spaces", () => {
    const lines = wrapRuns([{ text: "one two three four five six seven" }], 60, new PdfText(false, 10));
    assert.ok(lines.length > 1);
    assert.equal(lines.map((line) => line.map((word) => word.text).join("")).join(" "), "one two three four five six seven");
  });
  const bytes = tablePdf(coefficients, options());
  const text = pdfText(bytes);
  it("is a one-page PDF with standard fonts", () => {
    assert.ok(text.startsWith("%PDF-1.4\n"));
    assert.ok(text.endsWith("%%EOF\n"));
    assert.equal(pdfPageCount(bytes), 1);
    assert.match(text, /\/BaseFont \/Times-Roman \/Encoding \/WinAnsiEncoding/);
    assert.match(text, /\/BaseFont \/Symbol/);
  });
  it("uses Helvetica for sans-serif fonts", () => {
    assert.match(pdfText(tablePdf(coefficients, options({ font: "arial" }))), /\/BaseFont \/Helvetica-Bold/);
  });
  it("has a cross-reference table pointing at each object", () => {
    const start = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    const offsets = [...text.slice(start).matchAll(/(\d{10}) 00000 n/g)].map((match) => Number(match[1]));
    offsets.forEach((offset, index) => assert.ok(text.slice(offset).startsWith(`${index + 1} 0 obj`), `object ${index + 1}`));
  });
  it("gives each content stream its true length", () => {
    for (const match of text.matchAll(/<< \/Length (\d+) >>\nstream\n/g)) {
      const start = match.index! + match[0].length;
      assert.equal(text.slice(start + Number(match[1]), start + Number(match[1]) + 10), "\nendstream");
    }
  });
  it("draws each line as one text object", () => {
    assert.match(text, /BT [\d.]+ [\d.]+ Td \/F2 12 Tf 0 Ts \(Table 1\) Tj ET/);
  });
  it("runs long tables over pages, repeating the header under a continued caption", () => {
    const long = make("custom", {}, ["Item,Value", ...Array.from({ length: 80 }, (_, index) => `Item ${index + 1},${index}.5`)].join("\n"));
    const pages = tablePdf(long, options());
    assert.ok(pdfPageCount(pages) >= 2);
    assert.match(pdfText(pages), /\(Table 1\) Tj \/F1 12 Tf 0 Ts \( \\\(continued\\\)\) Tj/);
    assert.doesNotMatch(pdfText(tablePdf(long, options({ repeatHeader: false }))), /continued/);
  });
  it("turns the page for landscape", () => {
    assert.match(pdfText(tablePdf(coefficients, options({ orientation: "landscape" }))), /\/MediaBox \[0 0 841.89 595.28\]/);
  });
  it("shades alternate rows and draws grids when asked", () => {
    assert.match(pdfText(tablePdf(coefficients, options({ alternatingRows: true }))), /0\.949 g/);
    assert.ok(pdfText(tablePdf(coefficients, options({ borders: "grid" }))).split(" l S").length > text.split(" l S").length);
  });
  for (const type of TABLE_TYPES)
    it(`writes the ${TABLE_TYPE_INFO[type].label.toLowerCase()} as a valid single-byte PDF`, () => {
      const output = tablePdf(make(type), options());
      assert.ok(output.every((byte) => byte < 256));
      assert.doesNotMatch(pdfText(output), /NaN|undefined|Infinity/);
      assert.ok(pdfPageCount(output) >= 1);
    });
  for (const type of TABLE_TYPES)
    it(`writes the ${TABLE_TYPE_INFO[type].label.toLowerCase()} as a Word document without gaps`, () => {
      const xml = tableDocumentXml(make(type), options());
      assert.doesNotMatch(xml, /NaN|undefined|Infinity/);
      assert.equal((xml.match(/<w:tr>/g) ?? []).length, (xml.match(/<\/w:tr>/g) ?? []).length);
    });
});
