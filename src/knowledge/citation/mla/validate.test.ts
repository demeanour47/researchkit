import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SOURCE_TYPES, parseSourceType, type Source } from "../source";
import { formatMla } from "./citation";
import { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";

const issues = (source: Source) => issuesFor(formatMla({ source, provenance: "user-entered" }).notes);
const find = (source: Source, code: string) => issues(source).find((issue) => issue.code === code);

const article: Source = {
  type: "journal-article",
  authors: [{ kind: "person", family: "Smith", given: "Jane" }],
  date: { year: 2020 },
  title: "A Study",
  journal: "Journal of Examples",
  volume: "1",
  pages: "1-10",
};

describe("MLA validation", () => {
  it("gives every issue a message, an explanation and an action", () => {
    const all = [
      ...issues({ ...article, title: "", journal: "", authors: [{ kind: "person", family: "", given: "Ann" }], doi: "bad", url: "bad", date: { year: 2020, month: 2, day: 31 } }),
      ...issues({ type: "webpage", authors: [], date: {}, title: "T", url: "" }),
      ...issues({ type: "book", authors: [{ kind: "person", family: "Smith & Jones" }], date: {}, title: "T", edition: "Revised", publisher: "Oxford University Press" }),
    ];
    assert.ok(all.length >= 10);
    for (const issue of all) {
      assert.ok(issue.message && issue.explanation && issue.action, issue.code);
    }
  });

  it("treats a missing title or journal as an error", () => {
    assert.equal(find({ ...article, title: "" }, "missing")?.severity, "error");
    const journal = find({ ...article, journal: "" }, "missing");
    assert.equal(journal?.severity, "error");
    assert.equal(journal?.message, "The journal title is missing.");
    assert.equal(journal?.explanation, "MLA treats the journal as the container for a journal article. Without it, readers cannot find the article.");
    assert.equal(journal?.action, "Enter the journal title.");
  });

  it("treats a missing author as a warning to check, not an error", () => {
    assert.equal(find({ ...article, authors: [] }, "no-author")?.severity, "warning");
    assert.equal(find({ ...article, authors: [{ kind: "person", family: "", given: "Ann" }] }, "author-incomplete")?.severity, "warning");
  });

  it("treats an invalid DOI or URL as an error", () => {
    assert.equal(find({ ...article, doi: "12345" }, "invalid-doi")?.severity, "error");
    assert.equal(find({ ...article, url: "www.example.org" }, "invalid-url")?.severity, "error");
  });

  it("warns about missing publication information, with a lighter touch for web pages", () => {
    assert.equal(find({ ...article, date: {} }, "no-date")?.severity, "warning");
    assert.equal(find({ ...article, volume: "", pages: "" }, "no-journal-numbers")?.severity, "warning");
    const web = find({ type: "webpage", authors: [], date: {}, title: "T", siteName: "S", url: "https://example.org" }, "no-date");
    assert.equal(web?.severity, "information");
    assert.match(web?.action ?? "", /accessed/);
  });

  it("flags ambiguous author metadata", () => {
    assert.equal(find({ ...article, authors: [{ kind: "person", family: "Smith; Jones" }] }, "ambiguous-author")?.severity, "warning");
  });

  it("reports an unsupported source type from untrusted input", () => {
    assert.equal(parseSourceType("podcast"), null);
    assert.equal(parseSourceType("book"), "book");
    const issue = unsupportedSourceType("podcast", SOURCE_TYPES);
    assert.equal(issue?.severity, "error");
    assert.equal(issue?.code, "unsupported-source-type");
    assert.equal(unsupportedSourceType("webpage", SOURCE_TYPES), null);
  });

  it("states the provenance of the metadata", () => {
    assert.equal(provenanceIssue({ source: article, provenance: "user-entered" }).severity, "information");
    assert.equal(provenanceIssue({ source: article, provenance: "verified" }).code, "verified");
  });
});
