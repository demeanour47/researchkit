import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SOURCE_TYPES, type Source } from "../../source";
import { formatChicagoAuthorDate } from "./citation";
import { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";

const issues = (source: Source, locator?: { kind: "page" | "page-range" | "paragraph" | "section"; value: string }) => issuesFor(formatChicagoAuthorDate({ source, provenance: "user-entered" }, locator).notes);
const find = (source: Source, code: string) => issues(source).find((issue) => issue.code === code);

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
const webpage: Source = { type: "webpage", authors: [], date: {}, title: "A Page", siteName: "Site", url: "https://example.org" };

describe("Chicago author-date validation", () => {
  it("gives every issue a message, an explanation and an action", () => {
    const all = [
      ...issues({ ...article, title: "", journal: "", volume: "", pages: "", authors: [{ kind: "person", family: "", given: "A" }, { kind: "person", family: "Smith; Jones" }, { kind: "person", family: "Marks", given: "P., ed." }], doi: "bad", url: "bad", date: { year: 2022, month: 2, day: 30 } }, { kind: "paragraph", value: "4" }),
      ...issues({ ...webpage, url: "", publisher: "Owner", accessed: { year: 2022, day: 3 } }, { kind: "page-range", value: "4" }),
      ...issues({ type: "book", authors: [{ kind: "organization", name: "WHO" }], date: { year: 2020 }, title: "T", edition: "Revised", publisher: "WHO" }),
      ...issues({ ...webpage, date: { year: 2020, month: 3, day: 2 }, accessed: { year: 2022 } }),
      ...issues({ ...article, articleNumber: "e1" }),
    ];
    const codes = new Set(all.map((issue) => issue.code));
    assert.ok(codes.size >= 25, `${codes.size} kinds of issue covered`);
    for (const issue of all) assert.ok(issue.message && issue.explanation && issue.action, issue.code);
  });

  it("errors: missing title or journal, invalid DOI or URL, unsupported type", () => {
    assert.equal(find({ ...article, title: "" }, "missing-title")?.severity, "error");
    assert.equal(find({ ...article, journal: "" }, "missing-journal")?.severity, "error");
    assert.equal(find({ ...article, doi: "12345" }, "invalid-doi")?.severity, "error");
    assert.equal(find({ ...article, url: "www.example.org" }, "invalid-url")?.severity, "error");
    const unsupported = unsupportedSourceType("podcast", SOURCE_TYPES);
    assert.equal(unsupported?.severity, "error");
    assert.equal(unsupported?.message, "“podcast” is not a supported source type.");
    assert.equal(unsupportedSourceType("book", SOURCE_TYPES), null);
  });

  it("warnings: missing author, year, publisher, journal details, ambiguous authors and roles, locators", () => {
    assert.equal(find({ ...article, authors: [] }, "no-author")?.severity, "warning");
    assert.equal(find({ ...article, date: {} }, "missing-year")?.severity, "warning");
    assert.equal(find({ type: "book", authors: [], date: { year: 2020 }, title: "T" }, "missing-publisher")?.severity, "warning");
    assert.equal(find({ ...article, pages: "" }, "incomplete-journal")?.severity, "warning");
    assert.equal(find({ ...article, authors: [{ kind: "person", family: "Smith & Jones" }] }, "ambiguous-author")?.severity, "warning");
    assert.equal(find({ ...article, authors: [{ kind: "person", family: "Tiang", given: "Jeremy, trans." }] }, "unsupported-contributor-role")?.severity, "warning");
    assert.equal(issues(article, { kind: "section", value: "2" }).find((issue) => issue.code === "unsupported-locator")?.severity, "warning");
    assert.equal(issues(article, { kind: "page-range", value: "12" }).find((issue) => issue.code === "incomplete-locator")?.severity, "warning");
    assert.equal(find(webpage, "missing-access-date")?.severity, "warning");
  });

  it("information: omitted optional fields, limitations and variants", () => {
    assert.equal(find(webpage, "missing-year")?.severity, "information");
    assert.equal(find({ ...webpage, date: { year: 2020 }, accessed: { year: 2022 } }, "access-date-not-needed")?.severity, "information");
    assert.equal(find(article, "journal-issue-variant")?.severity, "information");
    assert.equal(find(article, "same-year-suffix")?.severity, "information");
    assert.equal(find(article, "check-headline-style")?.severity, "information");
    assert.equal(find({ ...webpage, date: { year: 2020, month: 1, day: 2 } }, "web-date-label")?.severity, "information");
  });

  it("states the provenance of the metadata", () => {
    assert.equal(provenanceIssue({ source: article, provenance: "user-entered" }).code, "user-entered");
    assert.equal(provenanceIssue({ source: article, provenance: "verified" }).severity, "information");
  });
});
