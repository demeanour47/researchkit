import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check, citationIssues, entryIssues, hasIssue, problems } from "../test-helpers";

// Valid entries are the MLA generator's own output (src/knowledge/citation/mla tests).
const valid = [
  "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/2016/03/02/biographies-women-history.",
  "Dorris, Michael, and Louise Erdrich. The Crown of Columbus. HarperCollins, 1991.",
  "LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.",
].join("\n\n");

describe("MLA 9 checks", () => {
  it("accepts a valid Works Cited list", () => {
    const report = check("mla", valid);
    assert.deepEqual(report.references.map((reference) => problems(reference.issues).length), [0, 0, 0]);
    assert.deepEqual(report.references.map((reference) => reference.key?.names), [["Burns"], ["Dorris", "Erdrich"], ["LeCun"]]);
  });

  it("checks author formatting", () => {
    hasIssue(entryIssues(check("mla", "Dorris, Michael, and Erdrich, Louise. The Crown of Columbus. HarperCollins, 1991."), 1), "author-format", "warning", "The second author's name appears inverted.");
    hasIssue(entryIssues(check("mla", "LeCun, Yann, Yoshua Bengio, and Geoffrey Hinton. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44."), 1), "author-format", "warning", "Three or more authors are all listed.");
    hasIssue(entryIssues(check("mla", "Dorris, Michael & Louise Erdrich. The Crown of Columbus. HarperCollins, 1991."), 1), "author-format", "warning", "Authors are joined with “&”.");
  });

  it("checks the container: quotation marks, labels and pages", () => {
    const issues = entryIssues(check("mla", "LeCun, Yann, et al. Deep Learning. Nature, 521(7553), 2015, 436–44."), 1);
    hasIssue(issues, "title-format", "warning", "The article title isn't in quotation marks.");
    hasIssue(issues, "journal-structure", "warning", "Journal numbers aren't labelled.");
  });

  it("reads dates in MLA's form", () => {
    hasIssue(entryIssues(check("mla", "Burns, Shauntee. “Finding Wonder Women.” New York Public Library, March 2, 2016, www.nypl.org/blog."), 1), "date-format", "warning", "A date is written month first.");
    hasIssue(entryIssues(check("mla", "Burns, Shauntee. “Finding Wonder Women.” New York Public Library, 2 March 2016, www.nypl.org/blog."), 1), "date-format", "information", "A month is written in full.");
  });

  it("reports malformed and protocol URLs", () => {
    hasIssue(entryIssues(check("mla", "Burns, Shauntee. “Finding Wonder Women.” Library, 2 Mar. 2016, https://localhost."), 1), "url", "error", "URL syntax appears invalid.");
    hasIssue(entryIssues(check("mla", "Burns, Shauntee. “Finding Wonder Women.” Library, 2 Mar. 2016, https://www.nypl.org/blog."), 1), "url", "information", "MLA generally leaves out http:// and https://.");
  });

  it("reads three hyphens as the author above", () => {
    const report = check("mla", "Lodge, David. Changing Places. Penguin Books, 1979.\n\n---. Small World. Penguin Books, 1984.", "(Lodge 12)");
    assert.deepEqual(report.references[1].key?.names, ["Lodge"]);
    assert.equal(problems(entryIssues(report, 2)).length, 0);
  });

  it("matches author–page citations and checks their form", () => {
    const report = check("mla", valid, "Deep learning changed vision (LeCun et al. 437). Archives matter (Burns, 3). See also (Dorris and Erdrich p. 12). Others disagree (Morrison 22).");
    const issues = citationIssues(report);
    hasIssue(issues, "citation-format", "warning", "There is a comma between the author and the page.");
    hasIssue(issues, "locator", "warning", "The page number has “p.” or “pp.”.");
    hasIssue(issues, "citation-consistency", "warning", "Citation appears without a matching Works Cited list entry.");
    assert.equal(report.citations.uncited, 0);
  });

  it("flags author–date citations in an MLA document", () => {
    hasIssue(check("mla", valid, "(LeCun, 2015)").notices, "style-mismatch", "warning", "This citation pattern appears author–date rather than MLA author–page.");
  });

  it("ignores bracketed asides that aren't citations", () => {
    assert.equal(check("mla", valid, "(Figure 2) (Table 3)").citations.findings.length, 0);
  });
});
