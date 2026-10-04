import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check, citationIssues, entryIssues, hasIssue, problems } from "../test-helpers";

// Valid entries reproduce the IEEE Reference Guide's examples, as the IEEE generator formats them.
const valid = [
  "[1] B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986.",
  "[2] M. M. Chiampi and L. L. Zilberti, “Induction of electric field in human bodies moving near MRI: An efficient BEM computational procedure,” IEEE Trans. Biomed. Eng., vol. 58, no. 10, pp. 2787–2793, Oct. 2011, doi: 10.1109/TBME.2011.2158315.",
  "[3] J. Smith. “Obama inaugurated as President.” CNN.com. Accessed: Feb. 1, 2009. [Online]. Available: http://www.cnn.com/POLITICS/01/21/obama_inaugurated/index.html",
].join("\n");

describe("IEEE checks", () => {
  it("accepts a numbered reference list, one entry per line", () => {
    const report = check("ieee", valid);
    assert.equal(report.total, 3);
    assert.deepEqual(report.references.map((reference) => reference.key?.number), [1, 2, 3]);
    assert.deepEqual(report.references.map((reference) => problems(reference.issues).length), [0, 0, 0]);
    hasIssue(report.notices, "numbering", "information", "Citation order wasn't checked.");
  });

  it("reports missing, malformed, duplicate and skipped numbers", () => {
    const report = check("ieee", ["[1] A. Author, Book One. P, 2020.", "B. Author, Book Two. P, 2020.", "[1] C. Author, Book Three. P, 2020.", "[4] D. Author, Book Four. P, 2020.", "[5a] E. Author, Book Five. P, 2020."].join("\n\n"));
    hasIssue(entryIssues(report, 2), "numbering", "error", "The reference number is missing.");
    hasIssue(entryIssues(report, 3), "numbering", "error", "Reference number [1] is used more than once.");
    hasIssue(entryIssues(report, 4), "numbering", "warning", "Reference [2]–[3] appears to be missing.");
    hasIssue(entryIssues(report, 5), "numbering", "error", "The reference number is malformed.");
  });

  it("asks for square brackets around list numbers", () => {
    hasIssue(entryIssues(check("ieee", "1. A. Author, Book. P, 2020."), 1), "numbering", "warning", "The reference number isn't in square brackets.");
  });

  it("checks names and DOI form", () => {
    const issues = entryIssues(check("ieee", "[1] Klaus, B. & P. Horn, Robot Vision. MIT Press, 1986, https://doi.org/10.1000/xyz123."), 1);
    hasIssue(issues, "author-format", "warning", "Author names appear inverted.");
    hasIssue(issues, "author-format", "warning", "Authors are joined with “&”.");
    hasIssue(issues, "doi", "information", "IEEE writes a DOI after “doi:”.");
  });

  it("matches citations, including ranges and locators, and reports unmatched numbers and uncited references", () => {
    const report = check("ieee", valid, "Vision systems [1, p. 24] and MRI safety [2] have been studied [1]–[2], as in [7].");
    hasIssue(citationIssues(report), "citation-consistency", "error", "Citation [7] has no matching numbered reference.");
    hasIssue(entryIssues(report, 3), "citation-consistency", "warning", "Reference may be uncited.");
    assert.deepEqual(report.citations.findings.map((finding) => finding.citation.numbers), [[1, 2], [1], [2], [7]]);
  });

  it("reads written-out citation ranges", () => {
    const report = check("ieee", valid, "See [1-3].");
    assert.equal(report.citations.uncited, 0);
  });

  it("reports malformed citations and numbers first cited out of order", () => {
    const report = check("ieee", valid, "First [2], then [1], then [3x].");
    hasIssue(report.notices, "numbering", "error", "The citation number is malformed.");
    hasIssue(report.notices, "numbering", "warning", "Reference numbers may not follow the order of first citation.");
  });

  it("warns about author–date citations in an IEEE document and author–date entries", () => {
    hasIssue(check("ieee", valid, "(Smith, 2024) argues").notices, "style-mismatch", "warning", "This citation pattern appears author–date rather than IEEE numeric.");
    hasIssue(entryIssues(check("ieee", "[1] Smith, J. (2020). Title. Publisher."), 1), "style-mismatch", "warning", "Reference may be formatted using a different citation style.");
  });
});
