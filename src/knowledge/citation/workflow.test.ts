import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCitationRequest, duplicateReason, orderRecords, sourceIdentity, validateSource, type SourceRecord } from "./workflow";
import type { Source } from "./apa/reference";
import { plainText } from "./apa/runs";

const article = (title: string, doi = "10.1234/example") : Source => ({
  type: "journal-article",
  authors: [{ kind: "person", family: "Smith", given: "Jane" }],
  date: { year: 2024 },
  title,
  journal: "Journal of Examples",
  volume: "10",
  issue: "2",
  pages: "10-20",
  doi,
});
const record = (source: Source): SourceRecord => ({ source, provenance: "user-entered" });

describe("citation workflow", () => {
  it("adds a page locator to a direct quotation without changing the formatter", () => {
    const result = formatCitationRequest({ record: record(article("A study")), mode: "direct-quotation", locator: { kind: "page", value: "12" } });
    assert.equal(plainText(result.citation.parenthetical), "(Smith, 2024, p. 12)");
    assert.equal(plainText(result.citation.narrative), "Smith (2024, p. 12)");
    assert.ok(!result.issues.some((issue) => issue.code === "missing-locator"));
  });

  it("warns when a direct quotation has no locator", () => {
    const result = formatCitationRequest({ record: record(article("A study")), mode: "direct-quotation" });
    assert.ok(result.issues.some((issue) => issue.code === "missing-locator" && issue.severity === "warning"));
  });

  it("reports metadata errors and unverified provenance", () => {
    const result = validateSource(record({ type: "book", authors: [], date: { year: 2024 }, title: "", publisher: "" }));
    assert.ok(result.some((issue) => issue.code === "missing" && issue.severity === "error"));
    assert.ok(result.some((issue) => issue.code === "user-entered" && issue.severity === "information"));
  });

  it("uses DOI identity before title and year", () => {
    assert.equal(sourceIdentity(record(article("One", "10.1234/SAME"))), "https://doi.org/10.1234/same");
    assert.equal(duplicateReason(record(article("Changed title", "10.1234/SAME")), [record(article("Original", "10.1234/SAME"))]), "matching DOI");
    assert.equal(duplicateReason(record(article("Same title", "")), [record(article("Same title", ""))]), "matching normalized title and year");
  });

  it("orders references from formatted author/title output, not insertion order", () => {
    const ordered = orderRecords([record(article("Zeta")), record(article("Alpha"))]);
    assert.equal(ordered[0].source.title, "Alpha");
  });
});
