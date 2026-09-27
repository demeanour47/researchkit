import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { latexToText, parseBibtex, splitAuthors, studyFromBibtex, surnameFirst } from "./bibtex";
import { lookupDoi, parseDoi, studyFromCsl, type DoiMetadataSource } from "./doi";
import { columnFor, importStudies, MAX_IMPORT, readCsv } from "./import";
import { parseRis, studyFromRis } from "./ris";
import { SAMPLE_MATRIX } from "./test-helpers";

const BIB = `% A comment line
@string{jsr = "Journal of Sleep Research"}
@comment{ignored {braces}}
@article{adams2016,
  author = {Adams, John and Brown, Kate},
  title = {Screen {Time} and Sleep in First-Year Students},
  journal = jsr,
  year = 2016,
  volume = {25},
  doi = {10.1000/rk.2016.001},
  abstract = {We surveyed 212 students.},
  keywords = {screen time, sleep}
}
@book{mueller2019,
  author = "M{\\"u}ller, Hans and Ludwig van Beethoven and {World Health Organization}",
  title = "Sleep \\& Health --- a Review",
  publisher = {Oxford University Press},
  date = {2019-03-01}
}`;

describe("parseBibtex", () => {
  const { entries, notes } = parseBibtex(BIB);
  it("reads entries, skipping comments and abbreviations", () => {
    assert.deepEqual(entries.map((entry) => [entry.type, entry.key]), [["article", "adams2016"], ["book", "mueller2019"]]);
    assert.deepEqual(notes, []);
  });
  it("reads braced, quoted, numeric and abbreviated values", () => {
    assert.equal(entries[0].fields.title, "Screen {Time} and Sleep in First-Year Students");
    assert.equal(entries[0].fields.journal, "Journal of Sleep Research");
    assert.equal(entries[0].fields.year, "2016");
  });
  it("joins values with #", () => {
    assert.equal(parseBibtex('@string{a = "Sleep"}@misc{k, title = a # " and " # {Health}}').entries[0].fields.title, "Sleep and Health");
  });
  it("expands month abbreviations", () => {
    assert.equal(parseBibtex("@misc{k, month = jan}").entries[0].fields.month, "January");
  });
  it("accepts round brackets around an entry", () => {
    assert.equal(parseBibtex("@article(k, title = {T})").entries[0].fields.title, "T");
  });
  it("reports an unclosed entry", () => {
    const outcome = parseBibtex("@article{k, title = {T}\n@book{j, title={U}}");
    assert.equal(outcome.entries.length, 0);
    assert.match(outcome.notes[0], /@article entry isn't closed/);
  });
  it("reports a field without =", () => {
    const outcome = parseBibtex("@article{k, title {T}}");
    assert.equal(outcome.entries.length, 0);
    assert.match(outcome.notes[0], /“k” has a field “title” without “=”/);
  });
  it("reads nothing from text without entries", () => {
    assert.deepEqual(parseBibtex("just some text"), { entries: [], notes: [] });
  });
});

describe("LaTeX and names", () => {
  const cases: [string, string][] = [
    ['M{\\"u}ller', "Müller"],
    ["\\'{e}cole", "école"],
    ["Fran\\c{c}ois", "François"],
    ["{\\o}stergaard", "østergaard"],
    ["Stra\\ss e", "Straße"],
    ["Sleep \\& Health", "Sleep & Health"],
    ["pages 10--20", "pages 10–20"],
    ["a --- b", "a — b"],
    ["\\emph{Italic} text", "Italic text"],
    ["{Keep} {Case}", "Keep Case"],
    ["non~breaking", "non breaking"],
  ];
  for (const [input, expected] of cases)
    it(`reads ${input} as ${expected}`, () => {
      assert.equal(latexToText(input), expected);
    });
  it("splits authors at “and”, keeping braced group names whole", () => {
    assert.deepEqual(splitAuthors("Adams, John and Brown, Kate AND {Barnes and Noble}"), ["Adams, John", "Brown, Kate", "{Barnes and Noble}"]);
  });
  const names: [string, string][] = [
    ["Adams, John", "Adams, John"],
    ["John Adams", "Adams, John"],
    ["Ludwig van Beethoven", "van Beethoven, Ludwig"],
    ["{World Health Organization}", "World Health Organization"],
    ["Plato", "Plato"],
  ];
  for (const [input, expected] of names)
    it(`writes ${input} as ${expected}`, () => {
      assert.equal(surnameFirst(input), expected);
    });
});

describe("studyFromBibtex", () => {
  const [article, book] = parseBibtex(BIB).entries.map(studyFromBibtex);
  it("fills the source columns", () => {
    assert.deepEqual([article.authors, article.year, article.title, article.journal, article.doi], ["Adams, John; Brown, Kate", "2016", "Screen Time and Sleep in First-Year Students", "Journal of Sleep Research", "10.1000/rk.2016.001"]);
  });
  it("keeps the abstract and keywords in the notes", () => {
    assert.equal(article.notes, "Abstract: We surveyed 212 students.\nKeywords: screen time, sleep");
  });
  it("reads accented names, particles and group authors", () => {
    assert.equal(book.authors, "Müller, Hans; van Beethoven, Ludwig; World Health Organization");
  });
  it("takes the year from a date and the publisher", () => {
    assert.deepEqual([book.year, book.publisher, book.title], ["2019", "Oxford University Press", "Sleep & Health — a Review"]);
  });
  it("finds a DOI in a doi.org address", () => {
    assert.equal(studyFromBibtex(parseBibtex("@misc{k, url = {https://doi.org/10.1000/xyz}}").entries[0]).doi, "10.1000/xyz");
  });
  it("leaves columns the entry doesn't give empty", () => {
    assert.equal(article.publisher, "");
  });
});

const RIS = `TY  - JOUR
AU  - Chen, Li
AU  - Diaz, Maria
TI  - Bedtime phone use and wellbeing
JO  - Journal of Adolescence
PY  - 2018///
DO  - 10.1000/rk.2018.002
AB  - We studied phone use
      before bed.
KW  - wellbeing
KW  - phones
ER  -
TY  - BOOK
A1  - Evans, Rob
T1  - Sleep
PB  - Routledge
Y1  - 2020
UR  - https://doi.org/10.1000/rk.2020.9
ER  - `;

describe("RIS", () => {
  const { entries, notes } = parseRis(RIS);
  it("reads each record from TY to ER", () => {
    assert.deepEqual(entries.map((record) => record.type), ["JOUR", "BOOK"]);
    assert.deepEqual(notes, []);
  });
  it("keeps repeated tags in order and joins continued lines", () => {
    assert.deepEqual(entries[0].tags.AU, ["Chen, Li", "Diaz, Maria"]);
    assert.deepEqual(entries[0].tags.AB, ["We studied phone use before bed."]);
  });
  it("fills the source columns", () => {
    const fields = studyFromRis(entries[0]);
    assert.deepEqual([fields.authors, fields.year, fields.title, fields.journal, fields.doi], ["Chen, Li; Diaz, Maria", "2018", "Bedtime phone use and wellbeing", "Journal of Adolescence", "10.1000/rk.2018.002"]);
    assert.equal(fields.notes, "Abstract: We studied phone use before bed.\nKeywords: wellbeing; phones");
  });
  it("reads alternative tags and a DOI from a web address", () => {
    const fields = studyFromRis(entries[1]);
    assert.deepEqual([fields.authors, fields.title, fields.publisher, fields.year, fields.doi], ["Evans, Rob", "Sleep", "Routledge", "2020", "10.1000/rk.2020.9"]);
  });
  it("keeps a last record without ER, with a note", () => {
    const outcome = parseRis("TY  - JOUR\nTI  - Open");
    assert.equal(outcome.entries.length, 1);
    assert.match(outcome.notes[0], /had no “ER” line/);
  });
  it("reads Windows line endings and a byte order mark", () => {
    assert.equal(parseRis("﻿TY  - JOUR\r\nTI  - Windows\r\nER  - \r\n").entries[0].tags.TI[0], "Windows");
  });
});

describe("CSV columns", () => {
  const cases: [string, string | null][] = [
    ["Author(s)", "authors"],
    ["Authors", "authors"],
    ["Publication Year", "year"],
    ["Major findings", "findings"],
    ["Key findings", "findings"],
    ["IV", "independent"],
    ["Dependent variables", "dependent"],
    ["Researcher's critical reflection", "reflection"],
    ["Sample size", "sampleSize"],
    ["sampleSize", "sampleSize"],
    ["Theoretical framework", "theory"],
    ["Impact factor", null],
  ];
  for (const [name, field] of cases)
    it(`reads the column “${name}” as ${field ?? "unknown"}`, () => {
      assert.equal(columnFor(name), field);
    });
});

describe("readCsv", () => {
  it("reads studies with their organisation", () => {
    const { rows, notes } = readCsv('Author(s),Year,Status,Priority,Tag,Favourite\n"Smith, J.",2020,Reviewed,High,Green,Yes');
    assert.deepEqual(rows[0].fields, { authors: "Smith, J.", year: "2020" });
    assert.deepEqual(rows[0].organisation, { status: "reviewed", priority: "high", tag: "green", favourite: true });
    assert.deepEqual(notes, []);
  });
  it("keeps unknown columns in the notes", () => {
    const { rows, notes } = readCsv("Title,Impact factor\nA study,3.2");
    assert.equal(rows[0].fields.notes, "Impact factor: 3.2");
    assert.match(notes[0], /“Impact factor”/);
  });
  it("reads tab-separated spreadsheet pastes", () => {
    assert.equal(readCsv("Title\tYear\nA study\t2021").rows[0].fields.year, "2021");
  });
  it("explains when no column matches", () => {
    assert.match(readCsv("Foo,Bar\n1,2").notes[0], /No column name matched/);
  });
  it("asks for a header row and data", () => {
    assert.match(readCsv("Title").notes[0], /column names in the first row/);
  });
});

describe("importStudies", () => {
  it("adds BibTeX studies with new ids", () => {
    const result = importStudies([], "bibtex", BIB);
    assert.equal(result.added, 2);
    assert.deepEqual(result.matrix.map((study) => study.id), ["s1", "s2"]);
    assert.equal(result.matrix[0].status, "to-read");
  });
  it("adds RIS studies", () => {
    assert.equal(importStudies([], "ris", RIS).added, 2);
  });
  it("skips studies already in the matrix, by DOI", () => {
    const result = importStudies(SAMPLE_MATRIX, "bibtex", BIB);
    assert.equal(result.added, 1);
    assert.deepEqual(result.duplicates, ["Screen Time and Sleep in First-Year Students"]);
    assert.equal(result.matrix.length, 7);
  });
  it("skips duplicates within one import", () => {
    const twice = `${BIB}\n${BIB.split("@book")[0]}`;
    assert.equal(importStudies([], "bibtex", twice).added, 2);
  });
  it("skips rows with nothing in them", () => {
    assert.equal(importStudies([], "csv", "Title,Year\n,\nA study,2020").added, 1);
  });
  it("explains when nothing is found", () => {
    assert.match(importStudies([], "ris", "nothing here").notes[0], /No RIS entries were found/);
  });
  it("caps very large imports", () => {
    const csv = ["Title,Year", ...Array.from({ length: MAX_IMPORT + 5 }, (_, index) => `Study number ${index},2020`)].join("\n");
    const result = importStudies([], "csv", csv);
    assert.equal(result.added, MAX_IMPORT);
    assert.match(result.notes.join(" "), /Only the first 2000/);
  });
  it("keeps the matrix it was given unchanged", () => {
    importStudies(SAMPLE_MATRIX, "ris", RIS);
    assert.equal(SAMPLE_MATRIX.length, 6);
  });
});

describe("DOI metadata", () => {
  it("parses DOIs in any usual form", () => {
    assert.deepEqual(parseDoi("doi:10.1000/ABC"), { doi: "10.1000/ABC", url: "https://doi.org/10.1000/ABC" });
    assert.deepEqual(parseDoi("https://dx.doi.org/10.1000/abc")?.doi, "10.1000/abc");
    assert.equal(parseDoi("not a doi"), null);
  });
  it("explains that lookup isn't connected yet", async () => {
    const result = await lookupDoi("10.1000/abc", null);
    assert.equal(result.status, "unavailable");
    assert.match(result.status === "unavailable" ? result.message : "", /isn't available yet/);
  });
  it("rejects text that isn't a DOI", async () => {
    assert.equal((await lookupDoi("abc", null)).status, "invalid");
  });
  it("fills a study from a connected source", async () => {
    const source: DoiMetadataSource = { lookup: async () => ({ author: [{ family: "Adams", given: "John" }, { literal: "WHO" }], issued: { "date-parts": [[2016, 5]] }, title: ["Screens"], "container-title": "Sleep", publisher: "SAGE", DOI: "10.1000/abc", abstract: "<p>We <i>surveyed</i> students.</p>" }) };
    const result = await lookupDoi("10.1000/abc", source);
    assert.equal(result.status, "found");
    assert.deepEqual(result.status === "found" ? result.fields : null, { authors: "Adams, John; WHO", year: "2016", title: "Screens", journal: "Sleep", publisher: "SAGE", doi: "10.1000/abc", notes: "Abstract: We surveyed students." });
  });
  it("falls back when the source fails or finds nothing", async () => {
    assert.equal((await lookupDoi("10.1000/abc", { lookup: async () => null })).status, "unavailable");
    assert.equal((await lookupDoi("10.1000/abc", { lookup: () => Promise.reject(new Error("offline")) })).status, "unavailable");
  });
  it("leaves out a year that isn't one", () => {
    assert.equal(studyFromCsl({ issued: { "date-parts": [["spring"]] } }).year, "");
  });
});
