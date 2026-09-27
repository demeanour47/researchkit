import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBibtex, studyFromBibtex } from "./bibtex";
import { EXPORT_FORMATS, exportMatrix, matrixTable } from "./export";
import { importStudies, readCsv } from "./import";
import { addStudy, deleteStudy, duplicateStudy, moveStudy } from "./matrix";
import { detectPatterns } from "./patterns";
import { potentialGaps, statedGaps } from "./gaps";
import { searchStudies, sortStudies, viewStudies } from "./query";
import { parseRis } from "./ris";
import { synthesis } from "./summary";
import { SAMPLE_MATRIX, study } from "./test-helpers";
import { COLUMN_PRESETS, MATRIX_FIELDS, type ColumnPreset } from "./types";
import { matrixIssues } from "./validate";

describe("sorting by every column", () => {
  for (const field of MATRIX_FIELDS)
    for (const direction of ["ascending", "descending"] as const)
      it(`keeps every study when sorting by ${field}, ${direction}`, () => {
        const sorted = sortStudies(SAMPLE_MATRIX, field, direction);
        assert.equal(sorted.length, SAMPLE_MATRIX.length);
        assert.deepEqual(new Set(sorted.map((candidate) => candidate.id)), new Set(SAMPLE_MATRIX.map((candidate) => candidate.id)));
      });
});

describe("exporting every column set", () => {
  for (const preset of Object.keys(COLUMN_PRESETS) as ColumnPreset[])
    for (const format of EXPORT_FORMATS)
      it(`writes the ${preset} columns as ${format}`, () => {
        const file = exportMatrix(format, SAMPLE_MATRIX, COLUMN_PRESETS[preset]);
        assert.ok(typeof file.data === "string" ? file.data.length > 0 : file.data.byteLength > 0);
        if (typeof file.data === "string") assert.doesNotMatch(file.data, /undefined|NaN/);
      });
  it("exports an empty matrix without failing", () => {
    for (const format of EXPORT_FORMATS) assert.ok(exportMatrix(format, [], ["authors"]).extension);
    assert.deepEqual(matrixTable([], ["authors"]).notes.general, ["0 studies."]);
  });
});

describe("empty and tiny matrices", () => {
  it("finds no patterns or gaps in an empty matrix", () => {
    assert.ok(detectPatterns([]).groups.every((group) => group.items.length === 0));
    assert.deepEqual(statedGaps([]), []);
    assert.deepEqual(potentialGaps([], null, 2026), []);
    assert.deepEqual(matrixIssues([], 2026), []);
  });
  it("handles one study", () => {
    const one = [SAMPLE_MATRIX[0]];
    assert.ok(detectPatterns(one).groups.every((group) => group.repeated.length === 0));
    assert.equal(synthesis(one, null, 2026)[0].paragraphs[0], "The matrix holds 1 study, published in 2016, from 1 country.");
  });
  it("searches an empty matrix", () => {
    assert.deepEqual(searchStudies([], "sleep"), []);
    assert.deepEqual(viewStudies([], { query: "", filter: {}, sort: { field: "year", direction: "ascending" } }), []);
  });
  it("handles search text with punctuation", () => {
    assert.deepEqual(searchStudies(SAMPLE_MATRIX, "(2016)").map((candidate) => candidate.id), []);
    assert.deepEqual(searchStudies(SAMPLE_MATRIX, "self-determination").map((candidate) => candidate.id), ["s1", "s2"]);
  });
  it("keeps ids unique through many changes", () => {
    let matrix = SAMPLE_MATRIX;
    matrix = duplicateStudy(matrix, "s1");
    matrix = deleteStudy(matrix, "s3");
    matrix = addStudy(matrix);
    matrix = duplicateStudy(matrix, "s7");
    matrix = moveStudy(matrix, "s2", 0);
    const ids = matrix.map((candidate) => candidate.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("unusual imports", () => {
  it("reads CSV cells with commas, quotes and line breaks", () => {
    const { rows } = readCsv('Title,Major findings\n"Screens, sleep","Two lines:\nfirst ""and"" second"');
    assert.deepEqual(rows[0].fields, { title: "Screens, sleep", findings: 'Two lines:\nfirst "and" second' });
  });
  it("reads semicolon-separated files", () => {
    assert.equal(readCsv("Title;Year\nA study;2021").rows[0].fields.year, "2021");
  });
  it("joins two columns that map to the same field", () => {
    assert.equal(readCsv("Findings,Results\nA,B").rows[0].fields.findings, "A; B");
  });
  it("reads status and priority by label, whatever the case", () => {
    const { rows } = readCsv("Title,Reading status,Priority\nA study,TO READ,medium");
    assert.deepEqual(rows[0].organisation, { status: "to-read", priority: "medium" });
  });
  it("ignores unknown statuses and tags", () => {
    const { rows } = readCsv("Title,Status,Tag\nA study,Maybe,Pink");
    assert.equal(rows[0].organisation.tag, null);
    assert.equal(importStudies([], "csv", "Title,Status\nA study,Maybe").matrix[0].status, "to-read");
  });
  it("reads BibTeX types and field names in any case", () => {
    const { entries } = parseBibtex("@ARTICLE{k, TITLE = {Upper}, Year = 2020}");
    assert.deepEqual([entries[0].type, entries[0].fields.title, entries[0].fields.year], ["article", "Upper", "2020"]);
  });
  it("reads deeply nested braces", () => {
    assert.equal(studyFromBibtex(parseBibtex("@misc{k, title = {A {B {C}} D}}").entries[0]).title, "A B C D");
  });
  it("reads an entry without a key", () => {
    assert.equal(parseBibtex("@misc{, title = {No key}}").entries[0].fields.title, "No key");
  });
  it("reads quoted values containing braces and quotation marks", () => {
    assert.equal(parseBibtex('@misc{k, title = "The {"}Best{"} study"}').entries[0].fields.title, 'The {"}Best{"} study');
  });
  it("skips RIS lines before the first record", () => {
    const { entries } = parseRis("Exported from a database\nAU  - Stray\nTY  - JOUR\nTI  - Kept\nER  - ");
    assert.deepEqual(entries.map((record) => record.tags.TI?.[0]), ["Kept"]);
    assert.equal(entries[0].tags.AU, undefined);
  });
  it("imports BibTeX without authors, labelling by title", () => {
    const result = importStudies([], "bibtex", "@misc{k, title = {Anonymous report}, year = 2020}");
    assert.equal(result.matrix[0].fields.authors, "");
    assert.equal(result.matrix[0].fields.title, "Anonymous report");
  });
});

describe("pattern edge cases", () => {
  it("counts a study once even when it names a variable in several columns", () => {
    const matrix = [study("a", { variables: "stress", independent: "Stress", dependent: "stress" }), study("b", { variables: "stress" })];
    assert.deepEqual(detectPatterns(matrix).groups.find((group) => group.id === "variables")!.repeated.map((item) => item.count), [2]);
  });
  it("counts the same technique written differently as one", () => {
    const matrix = [study("a", { sampling: "Convenience sampling" }), study("b", { sampling: "convenience" }), study("c", { sampling: "Opportunity sample" })];
    assert.deepEqual(detectPatterns(matrix).groups.find((group) => group.id === "sampling")!.repeated.map((item) => item.count), [3]);
  });
  it("gives shares of the studies reporting the column, not of all studies", () => {
    const matrix = [study("a", { analysis: "ANOVA" }), study("b", { analysis: "ANOVA" }), study("c"), study("d")];
    assert.equal(detectPatterns(matrix).groups.find((group) => group.id === "analyses")!.repeated[0].share, 1);
  });
});
