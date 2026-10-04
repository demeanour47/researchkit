import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check, citationIssues, entryIssues, hasIssue, problems } from "../test-helpers";

// Valid entries are the Harvard generator's own output (ADR-0008 profile).
const valid = [
  "Cool Antarctica (no date) Antarctica and global warming. Available at: https://coolantarctica.com/ (Accessed: 23 July 2020).",
  "Cottrell, S. (2019) The study skills handbook. 5th edn. Red Globe Press.",
  "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574",
].join("\n\n");

describe("Harvard checks (ResearchKit profile)", () => {
  it("accepts entries in the profile", () => {
    const report = check("harvard", valid);
    assert.deepEqual(report.references.map((reference) => problems(reference.issues).length), [0, 0, 0]);
    assert.deepEqual(report.references.map((reference) => reference.sourceType), ["webpage", "book", "journal-article"]);
  });

  it("always states that it follows the ResearchKit profile", () => {
    hasIssue(check("harvard", valid).notices, "manual-review", "information", "Harvard validation follows the ResearchKit Harvard profile and may differ from institutional Harvard requirements.");
  });

  it("explains departures from the profile", () => {
    const issues = entryIssues(check("harvard", "Cottrell, Stella & Smith, John (2019). The study skills handbook. 5th ed. London: Red Globe Press."), 1);
    hasIssue(issues, "date-format", "warning", "The year in brackets is followed by a full stop.");
    hasIssue(issues, "author-format", "warning", "Authors are joined with “&”.");
    hasIssue(issues, "author-format", "warning", "Given names appear to be written in full.");
    hasIssue(issues, "publisher-structure", "information", "The edition is abbreviated “ed.”.");
  });

  it("treats institutional variants as information, not errors", () => {
    const issues = entryIssues(check("harvard", "Speight, J. G. (2019) Global climate change demystified. 2nd edn. London: Wiley."), 1);
    hasIssue(issues, "author-format", "information", "Initials are separated by spaces.");
    hasIssue(issues, "publisher-structure", "information", "A place of publication is given.");
    assert.equal(problems(issues).length, 0);
  });

  it("requires an access date with a URL, and none with a DOI", () => {
    hasIssue(entryIssues(check("harvard", "Sneed, A. (2019) The reason Antarctica is melting. Available at: https://www.scientificamerican.com/"), 1), "date-format", "warning", "The URL has no access date.");
    hasIssue(entryIssues(check("harvard", "Chen, Y. (2023) ‘Title’, Journal, 38(4), pp. 1–2. Available at: https://doi.org/10.1109/TPWRS.2022.3200697 (Accessed: 1 May 2024)."), 1), "date-format", "information", "An access date is given with a DOI.");
  });

  it("checks journal pages", () => {
    hasIssue(entryIssues(check("harvard", "Chen, Y. (2023) ‘Title’, Journal, 38(4), 3911–3923."), 1), "journal-structure", "warning", "The page range has no “pp.”.");
  });

  it("matches author–date citations with locators and explains the comma variant", () => {
    const report = check("harvard", valid, "Study skills matter (Cottrell, 2019, p. 23). Thaker, Smith and Leiserowitz (2020, p. 2485) found risk perception varies (Cool Antarctica, no date). Some guides write (Cottrell 2019).");
    assert.equal(report.citations.unmatched, 0);
    assert.equal(report.citations.uncited, 0);
    hasIssue(citationIssues(report), "citation-format", "information", "There is no comma between the author and the year.");
  });

  it("explains n.d., &, missing p. and four or more authors in citations", () => {
    const issues = citationIssues(check("harvard", valid, "(Cool Antarctica, n.d.) (Cottrell & Smith, 2019) (Cottrell, 2019, 23) (Ahmed, Brown, Clark and Diaz, 2020)"));
    hasIssue(issues, "citation-format", "warning", "A missing date is written n.d.");
    hasIssue(issues, "citation-format", "warning", "Authors are joined with “&”.");
    hasIssue(issues, "locator", "warning", "The page number needs “p.” or “pp.”.");
    hasIssue(issues, "citation-format", "warning", "Four or more authors are all named in the citation.");
  });

  it("asks for year letters when the same author has two works in one year", () => {
    const report = check("harvard", "Ahmed, R. (2024) Coastal erosion. Example Press.\n\nAhmed, R. (2024) Flood risk. Example Press.");
    hasIssue(entryIssues(report, 1), "manual-review", "warning", "Multiple works by the same author appear in the same year.");
    const lettered = check("harvard", "Ahmed, R. (2024a) Coastal erosion. Example Press.\n\nAhmed, R. (2024b) Flood risk. Example Press.", "(Ahmed, 2024a) (Ahmed, 2024b)");
    assert.equal(problems(lettered.references.flatMap((reference) => reference.issues)).length, 0);
    assert.equal(lettered.citations.unmatched, 0);
  });

  it("checks alphabetical order, then year", () => {
    const report = check("harvard", "Smith, A. (2020) B. P.\n\nAdams, B. (2019) A. P.\n\nAdams, B. (2018) C. P.");
    hasIssue(entryIssues(report, 2), "ordering", "warning", "Entry appears out of alphabetical order.");
    hasIssue(entryIssues(report, 3), "ordering", "warning", "Works by the same author appear out of date order.");
  });
});
