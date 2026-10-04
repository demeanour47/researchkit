import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Source } from "../source";
import { formatHarvard } from "./citation";
import type { Note } from "./notes";
import { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";

const every: Note[] = [
  { code: "missing-title" }, { code: "missing-journal" }, { code: "missing-url" }, { code: "unsupported-source-type", value: "thesis" }, { code: "invalid-doi" },
  { code: "invalid-url" }, { code: "invalid-year-letter" }, { code: "no-author" }, { code: "author-incomplete", position: 2 }, { code: "ambiguous-author", position: 1 },
  { code: "unsupported-contributor-role", position: 3 }, { code: "missing-year", sourceType: "book" }, { code: "missing-year", sourceType: "webpage" },
  { code: "missing-access-date" }, { code: "incomplete-access-date" }, { code: "invalid-date", date: "publication" }, { code: "invalid-date", date: "access" },
  { code: "day-without-month", date: "access" }, { code: "missing-publisher" }, { code: "incomplete-journal", missing: "numbers" }, { code: "incomplete-journal", missing: "volume" },
  { code: "incomplete-journal", missing: "pages" }, { code: "unsupported-locator", kind: "paragraph" }, { code: "unsupported-locator", kind: "section" },
  { code: "incomplete-locator" }, { code: "year-letter-without-year" }, { code: "access-date-not-needed" }, { code: "article-number-not-shown" },
  { code: "site-not-shown" }, { code: "check-capitals" }, { code: "check-edition" }, { code: "et-al-variant" }, { code: "text-title-variant" },
  { code: "same-year-letter" }, { code: "profile" },
];

describe("Harvard validation", () => {
  it("explains every note, with a different message for each, and says what to do", () => {
    const issues = issuesFor(every);
    assert.equal(new Set(issues.map((issue) => issue.message)).size, issues.length);
    for (const issue of issues) {
      assert.ok(issue.explanation && issue.explanation.length > 20, issue.code);
      assert.ok(issue.action && issue.action.length > 5, issue.code);
    }
  });

  it("makes unidentifiable sources and dropped links errors", () => {
    const severity = (note: Note) => issuesFor([note])[0].severity;
    for (const code of ["missing-title", "missing-journal", "missing-url", "invalid-doi", "invalid-url", "invalid-year-letter"] as const) assert.equal(severity({ code }), "error", code);
    assert.equal(severity({ code: "unsupported-source-type", value: "thesis" }), "error");
  });

  it("asks for checks with warnings, and explains variations with information", () => {
    const severity = (note: Note) => issuesFor([note])[0].severity;
    for (const code of ["no-author", "missing-access-date", "missing-publisher", "incomplete-locator", "year-letter-without-year"] as const) assert.equal(severity({ code }), "warning", code);
    assert.equal(severity({ code: "ambiguous-author", position: 1 }), "warning");
    assert.equal(severity({ code: "missing-year", sourceType: "journal-article" }), "warning");
    assert.equal(severity({ code: "missing-year", sourceType: "webpage" }), "information");
    for (const code of ["profile", "et-al-variant", "text-title-variant", "same-year-letter", "site-not-shown", "access-date-not-needed"] as const) assert.equal(severity({ code }), "information", code);
  });

  it("states the profile and points to the university's requirements", () => {
    const [profile] = issuesFor([{ code: "profile" }]);
    assert.match(profile.message, /defined Harvard author-date profile, based on Cite Them Right, 13th edition/);
    assert.match(profile.action ?? "", /university's referencing requirements/);
  });

  it("gives a complete reference no errors or warnings", () => {
    const source: Source = { type: "book", authors: [{ kind: "person", family: "Cottrell", given: "Stella" }], date: { year: 2019 }, title: "The study skills handbook", edition: "5", publisher: "Red Globe Press" };
    const issues = issuesFor(formatHarvard({ record: { source, provenance: "user-entered" } }).notes);
    assert.deepEqual(issues.filter((issue) => issue.severity !== "information").map((issue) => issue.code), []);
  });

  it("collects every problem with an incomplete web page", () => {
    const source: Source = { type: "webpage", authors: [], date: {}, title: "", url: "example" };
    const codes = formatHarvard({ record: { source, provenance: "user-entered" } }).notes.map((note) => note.code);
    for (const code of ["profile", "no-author", "missing-year", "missing-title", "invalid-url", "text-title-variant"]) assert.ok(codes.includes(code as Note["code"]), code);
  });

  it("reports unsupported source types from untrusted input", () => {
    assert.equal(unsupportedSourceType("book", ["book", "journal-article", "webpage"]), null);
    const issue = unsupportedSourceType("thesis", ["book", "journal-article", "webpage"]);
    assert.equal(issue?.severity, "error");
    assert.match(issue?.message ?? "", /“thesis” is not a supported source type/);
  });

  it("states the metadata's provenance", () => {
    assert.equal(provenanceIssue({ source: { type: "book", authors: [], date: {}, title: "T" }, provenance: "user-entered" }).code, "user-entered");
    assert.equal(provenanceIssue({ source: { type: "book", authors: [], date: {}, title: "T" }, provenance: "verified" }).code, "verified");
  });
});
