import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ANY_SOURCE_TYPES, type AnySource } from "../source";
import { formatIeee } from "./citation";
import { formatMultipleCitation } from "./in-text";
import type { IeeeLocator } from "./request";
import { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";

const issues = (source: AnySource, number = "1", locator?: IeeeLocator) => issuesFor(formatIeee({ source, provenance: "user-entered", number, locator }).notes);
const find = (source: AnySource, code: string, number = "1", locator?: IeeeLocator) => issues(source, number, locator).find((issue) => issue.code === code);

const article: AnySource = { type: "journal-article", authors: [{ kind: "person", family: "Chiampi", given: "M. M." }], date: { year: 2011 }, title: "Induction", journal: "IEEE Trans. Biomed. Eng.", volume: "58", issue: "10", pages: "2787-2793" };
const paper: AnySource = { type: "conference-paper", authors: [{ kind: "person", family: "Sarkar", given: "D." }], date: { year: 2013 }, title: "SRR-loaded antenna", proceedings: "Proc. Int. Symp. Electromagn. Theory" };
const webpage: AnySource = { type: "webpage", authors: [], date: {}, title: "A Page", url: "https://example.org" };

describe("IEEE validation", () => {
  it("gives every issue a message, an explanation and an action", () => {
    const all = [
      ...issues({ ...article, title: "", journal: "", volume: "", issue: "", pages: "", authors: [{ kind: "person", family: "", given: "A" }, { kind: "person", family: "Smith; Jones" }, { kind: "person", family: "Brake", given: "J. S., Ed." }], doi: "bad", url: "bad", date: { year: 2011, month: 2, day: 30 } }, "0", { kind: "paragraph", value: "2" }),
      ...issues({ ...paper, proceedings: "" }, "1", { kind: "page-range", value: "4" }),
      ...issues(paper, "1", { kind: "page", value: "" }),
      ...issues({ ...webpage, url: "", accessed: { year: 2022, day: 3 } }),
      ...issues({ type: "book", authors: [], date: {}, title: "T", edition: "Revised" }),
      ...issues({ ...webpage, siteName: "Site", date: { year: 2020 }, accessed: { year: 2022, month: 1, day: 2 } }),
      ...issuesFor(formatMultipleCitation("3, 1", "en-dash", { kind: "page", value: "4" }).notes),
    ];
    const codes = new Set(all.map((issue) => issue.code));
    assert.ok(codes.size >= 30, `${codes.size} kinds of issue covered`);
    for (const issue of all) assert.ok(issue.message && issue.explanation && issue.action, issue.code);
  });

  it("errors: missing title, journal or proceedings, invalid DOI, URL or number, unsupported type", () => {
    assert.equal(find({ ...article, title: "" }, "missing-title")?.severity, "error");
    assert.equal(find({ ...article, journal: "" }, "missing-journal")?.severity, "error");
    assert.equal(find({ ...paper, proceedings: "" }, "missing-proceedings")?.severity, "error");
    assert.equal(find({ ...article, doi: "12345" }, "invalid-doi")?.severity, "error");
    assert.equal(find({ ...article, url: "www.example.org" }, "invalid-url")?.severity, "error");
    assert.equal(find(article, "invalid-reference-number", "0")?.message, "“0” is not a valid reference number: numbers start at 1.");
    assert.equal(find(article, "invalid-reference-number", "abc")?.message, "“abc” is not a reference number.");
    assert.equal(find(article, "invalid-reference-number", "1, 2")?.message, "Enter one reference number here.");
    assert.equal(issuesFor(formatMultipleCitation("1, 1", "written-out").notes)[0].message, "Reference 1 appears more than once.");
    assert.equal(unsupportedSourceType("podcast", ANY_SOURCE_TYPES)?.severity, "error");
    assert.equal(unsupportedSourceType("conference-paper", ANY_SOURCE_TYPES), null);
  });

  it("warnings: missing metadata, ambiguous authors, locators and ordering", () => {
    assert.equal(find({ ...article, authors: [] }, "no-author")?.severity, "warning");
    assert.equal(find({ ...article, date: {} }, "missing-year")?.severity, "warning");
    assert.equal(find({ ...article, issue: "" }, "incomplete-journal")?.severity, "warning");
    assert.equal(find(paper, "incomplete-conference")?.severity, "warning");
    assert.equal(find({ type: "book", authors: [], date: { year: 2020 }, title: "T", publisher: "P" }, "missing-place")?.severity, "warning");
    assert.equal(find(webpage, "missing-site-name")?.severity, "warning");
    assert.equal(find(webpage, "missing-access-date")?.severity, "warning");
    assert.equal(find({ ...article, authors: [{ kind: "person", family: "Smith & Jones" }] }, "ambiguous-author")?.severity, "warning");
    assert.equal(find(article, "missing-locator-value", "1", { kind: "chapter", value: " " })?.severity, "warning");
    assert.equal(issuesFor(formatMultipleCitation("3, 1", "written-out").notes)[0].severity, "warning");
  });

  it("information: abbreviations not applied, the citation-order limitation and the en-dash variant", () => {
    assert.equal(find(article, "abbreviation-not-applied")?.severity, "information");
    assert.equal(find(paper, "abbreviation-not-applied")?.message, "The conference name is used as you entered it.");
    assert.equal(find(article, "citation-order")?.severity, "information");
    assert.equal(issuesFor(formatMultipleCitation("1-4", "en-dash").notes).find((issue) => issue.code === "en-dash-ranges-variant")?.severity, "information");
  });

  it("states the provenance of the metadata", () => {
    assert.equal(provenanceIssue("user-entered").code, "user-entered");
  });
});
