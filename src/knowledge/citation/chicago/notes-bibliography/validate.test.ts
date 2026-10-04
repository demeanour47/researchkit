import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SOURCE_TYPES, type Source } from "../../source";
import { formatChicagoNotesBibliography } from "./citation";
import type { NoteLocator } from "./request";
import { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";

const issues = (source: Source, locator?: NoteLocator, shortTitle?: string) =>
  issuesFor(formatChicagoNotesBibliography({ record: { source, provenance: "user-entered" }, locator, shortTitle }).notes);
const find = (source: Source, code: string, locator?: NoteLocator) => issues(source, locator).find((issue) => issue.code === code);

const article: Source = {
  type: "journal-article",
  authors: [{ kind: "person", family: "Kwon", given: "Hyeyoung" }],
  date: { year: 2022 },
  title: "Inclusion Work",
  journal: "American Journal of Sociology",
  volume: "127",
  issue: "6",
  pages: "1818-1859",
};
const webpage: Source = { type: "webpage", authors: [], date: {}, title: "A Page", url: "https://example.org" };

describe("Chicago notes-and-bibliography validation", () => {
  it("gives every issue a message, an explanation and an action", () => {
    const all = [
      ...issues({ ...article, title: "", journal: "", volume: "", pages: "", authors: [{ kind: "person", family: "", given: "A" }, { kind: "person", family: "Smith; Jones" }, { kind: "person", family: "Tiang", given: "Jeremy, trans." }], doi: "bad", url: "bad", date: { year: 2022, month: 2, day: 30 } }, { kind: "paragraph", value: "4" }),
      ...issues({ ...webpage, url: "", accessed: { year: 2022, day: 3 } }, { kind: "page-range", value: "4" }),
      ...issues({ type: "book", authors: [{ kind: "organization", name: "WHO" }], date: {}, title: "A Very Long Title of Many Words Indeed", edition: "Revised", publisher: "WHO" }, { kind: "page", value: " " }),
      ...issues({ ...webpage, siteName: "Site", publisher: "Owner", authors: [{ kind: "person", family: "Smith", given: "Jane" }], date: { year: 2020, month: 3, day: 2 }, accessed: { year: 2022 } }),
      ...issues({ ...article, articleNumber: "e1" }),
      ...issues({ ...webpage, title: "" }),
    ];
    const codes = new Set(all.map((issue) => issue.code));
    assert.ok(codes.size >= 28, `${codes.size} kinds of issue covered`);
    for (const issue of all) assert.ok(issue.message && issue.explanation && issue.action, issue.code);
  });

  it("errors: missing title or journal, invalid DOI or URL, unsupported type", () => {
    assert.equal(find({ ...article, title: "" }, "missing-title")?.severity, "error");
    assert.equal(find({ ...article, journal: "" }, "missing-journal")?.severity, "error");
    assert.equal(find({ ...article, doi: "12345" }, "invalid-doi")?.severity, "error");
    assert.equal(find({ ...article, url: "www.example.org" }, "invalid-url")?.severity, "error");
    assert.equal(unsupportedSourceType("podcast", SOURCE_TYPES)?.severity, "error");
    assert.equal(unsupportedSourceType("webpage", SOURCE_TYPES), null);
  });

  it("warnings: author, year, publisher, journal, site, access date, locators and short-note context", () => {
    assert.equal(find({ ...article, authors: [] }, "no-author")?.severity, "warning");
    assert.equal(find({ ...article, date: {} }, "missing-year")?.severity, "warning");
    assert.equal(find({ type: "book", authors: [], date: { year: 2020 }, title: "T" }, "missing-publisher")?.severity, "warning");
    assert.equal(find({ ...article, volume: "" }, "incomplete-journal")?.severity, "warning");
    assert.equal(find({ ...article, authors: [{ kind: "person", family: "Smith & Jones" }] }, "ambiguous-author")?.severity, "warning");
    assert.equal(find({ ...article, authors: [{ kind: "person", family: "Marks", given: "P., ed." }] }, "unsupported-contributor-role")?.severity, "warning");
    assert.equal(find(webpage, "missing-site-name")?.severity, "warning");
    assert.equal(find(webpage, "missing-access-date")?.severity, "warning");
    assert.equal(find(article, "missing-locator-value", { kind: "page", value: "" })?.severity, "warning");
    assert.equal(find(article, "incomplete-locator", { kind: "page-range", value: "12" })?.severity, "warning");
    assert.equal(find(article, "unsupported-locator", { kind: "section", value: "2" })?.severity, "warning");
    assert.equal(find({ ...webpage, title: "" }, "short-note-unidentifiable")?.severity, "warning");
  });

  it("information: omitted optional details, limitations and variants", () => {
    assert.equal(find(webpage, "missing-year")?.severity, "information");
    assert.equal(find(article, "article-note-without-page")?.severity, "information");
    assert.equal(find(article, "ibid-not-used")?.severity, "information");
    assert.equal(find({ ...article, title: "A Title Much Longer Than Four Words" }, "shorten-title")?.severity, "information");
    assert.equal(find({ ...webpage, date: { year: 2020, month: 1, day: 2 }, accessed: { year: 2022 } }, "access-date-not-needed")?.severity, "information");
    assert.equal(find({ type: "book", authors: [{ kind: "organization", name: "WHO" }], date: { year: 2020 }, title: "T", publisher: "WHO" }, "organization-also-publisher")?.severity, "information");
  });

  it("states the provenance of the metadata", () => {
    assert.equal(provenanceIssue({ source: article, provenance: "user-entered" }).code, "user-entered");
  });
});
