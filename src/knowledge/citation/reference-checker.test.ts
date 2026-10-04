import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkReferenceList, splitReferenceEntries } from "./reference-checker";

describe("reference checker parsing", () => {
  it("keeps blank-line-separated multiline references together", () => {
    assert.deepEqual(splitReferenceEntries("Smith, J. (2024). Title.\nJournal, 10, 1–2.\n\nJones, K. (2023). Book. Publisher."), ["Smith, J. (2024). Title.\nJournal, 10, 1–2.", "Jones, K. (2023). Book. Publisher."]);
  });

  it("checks a journal article without rewriting the original text", () => {
    const original = "Smith, J. (2024). Title. Journal of Examples, 10(2), 1–2. https://doi.org/10.1234/example";
    const report = checkReferenceList(original);
    assert.equal(report.total, 1);
    assert.equal(report.references[0].originalText, original);
    assert.equal(report.references[0].sourceType, "journal-article");
    assert.equal(report.references[0].confidence, "high");
    assert.ok(!report.references[0].issues.some((issue) => issue.category === "journal-structure"));
  });

  it("reports missing book metadata and invalid DOI without inventing values", () => {
    const report = checkReferenceList("Kahneman, D. (2011). Thinking, fast and slow. doi:not-a-doi");
    const issues = report.references[0].issues;
    assert.ok(issues.some((issue) => issue.category === "publisher-structure"));
    assert.ok(issues.some((issue) => issue.category === "doi"));
    assert.equal(report.references[0].source?.type, "book");
  });

  it("recognizes an organization-authored web page", () => {
    const report = checkReferenceList("World Health Organization. (2024). Example facts. World Health Organization. https://www.who.int/example");
    assert.equal(report.references[0].sourceType, "webpage");
    assert.equal(report.references[0].confidence, "high");
  });

  it("detects duplicate DOI, ordering and same-author/year review items", () => {
    const report = checkReferenceList([
      "Smith, J. (2024). Zeta. Journal, 10, 1–2. https://doi.org/10.1234/zeta",
      "Smith, J. (2024). Alpha. Journal, 10, 3–4. https://doi.org/10.1234/alpha",
      "Smith, J. (2024). Zeta. Journal, 10, 1–2. https://doi.org/10.1234/zeta",
    ].join("\n\n"));
    assert.ok(report.potentialDuplicates > 0);
    assert.ok(report.orderingIssues > 0);
    assert.ok(report.manualReviewItems > 0);
  });

  it("does not claim an unknown structure is valid", () => {
    const report = checkReferenceList("This is not a reference list.");
    assert.equal(report.references[0].sourceType, "unknown");
    assert.ok(report.references[0].issues.some((issue) => issue.category === "parse-warning"));
  });
});
