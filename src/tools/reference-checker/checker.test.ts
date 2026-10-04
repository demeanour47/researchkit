import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { referenceCheckerGuide as guide } from "../../../content/guides/reference-checker";
import { CHECKER_STYLES, STYLE_CHECKERS, checkReferences, type CheckerStyleId, type ReferenceCheckReport } from "../../knowledge/citation/checker";
import { announcements, categoryLabels, page, styleChecks, styleNames } from "./copy";
import { examples } from "./examples";

const run = (style: CheckerStyleId) => checkReferences({ style, ...examples[style] });
const all = (report: ReferenceCheckReport) => [...report.references.flatMap((reference) => reference.issues), ...report.notices, ...report.citations.findings.flatMap((finding) => finding.issues)];
const problemMessages = (report: ReferenceCheckReport) => all(report).filter((item) => item.severity !== "information").map((item) => item.message).sort();

describe("examples", () => {
  it("show exactly the deliberate problems for each style", () => {
    const expected: Record<CheckerStyleId, string[]> = {
      apa: ["Citation appears without a matching reference list entry.", "DOI syntax appears invalid.", "Reference may be uncited."].sort(),
      mla: ["Citation appears without a matching Works Cited list entry.", "The second author's name appears inverted."].sort(),
      "chicago-author-date": ["Citation appears without a matching reference list entry.", "Journal numbers appear in APA's arrangement."].sort(),
      "chicago-notes-bibliography": ["Citation appears without a matching bibliography entry.", "This looks like a note, not a bibliography entry."].sort(),
      ieee: ["Citation [5] has no matching numbered reference.", "Reference number [2] is used more than once."].sort(),
      harvard: ["Citation appears without a matching reference list entry.", "The year in brackets is followed by a full stop."].sort(),
    };
    for (const style of CHECKER_STYLES) assert.deepEqual(problemMessages(run(style)), expected[style], style);
  });

  it("are written so every intended citation matches", () => {
    for (const style of CHECKER_STYLES) assert.equal(run(style).citations.unmatched, 1, style);
  });
});

describe("wording", () => {
  it("names every style, lists what each checks, and labels every category", () => {
    for (const style of CHECKER_STYLES) {
      assert.ok(styleNames[style], style);
      assert.ok(styleChecks[style].length >= 4, style);
    }
    assert.match(styleNames.harvard, /ResearchKit profile/);
    assert.equal(new Set(Object.values(categoryLabels)).size, Object.values(categoryLabels).length);
  });

  it("claims only what each style's checker can check", () => {
    for (const style of CHECKER_STYLES) {
      const text = styleChecks[style].join(" ");
      const capabilities = STYLE_CHECKERS[style].capabilities;
      assert.equal(/numbers? in square brackets/i.test(text), capabilities.ordering === "numeric", style);
      assert.equal(/notes/i.test(text), capabilities.citations === "notes", style);
      assert.equal(/same-author, same-year/i.test(text), capabilities.yearLetters, style);
    }
  });

  it("no longer describes the checker as APA-only", () => {
    for (const text of [page.summary, page.metaDescription, page.intro]) assert.doesNotMatch(text, /^APA|APA 7 reference lists? only/);
    for (const style of ["APA 7", "MLA 9", "Chicago", "IEEE", "Harvard"]) assert.ok(page.summary.includes(style), style);
  });

  it("announces results with counts in words", () => {
    assert.equal(announcements.checked(3, "IEEE", { error: 1, warning: 0, information: 2 }), "Checked 3 references in IEEE: 1 error, 0 warnings, 2 information.");
  });
});

describe("Reference Checker guide", () => {
  const text = guide.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");

  it("covers the whole curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ["what-it-does", "what-it-does-not-do", "why-style-matters", "apa", "mla", "chicago-author-date", "chicago-notes-bibliography", "ieee", "harvard", "citation-consistency", "duplicates", "ordering", "style-mismatch", "heuristic-limitations", "manual-verification", "severity", "fixing-issues", "common-mistakes"]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "reference-checker");
    assert.deepEqual(guide.relatedToolIds, ["reference-checker", "citation-style-finder"]);
  });

  it("states its limits plainly", () => {
    assert.ok(text.includes("ResearchKit checks structured patterns and does not guarantee that every citation conforms to every institutional requirement."));
    assert.ok(text.includes("Harvard validation follows the ResearchKit Harvard profile and may differ from institutional Harvard requirements."));
    assert.match(text, /Matching is heuristic/);
  });

  it("quotes only messages the checker actually produces", () => {
    const produced = new Set<string>();
    const inputs: [CheckerStyleId, string, string?][] = [
      ...CHECKER_STYLES.map((style): [CheckerStyleId, string, string] => [style, examples[style].references, examples[style].citations]),
      ["apa", "Smith, J. (2024). A. P.\n\nAdams, K. (2023). B. P.\n\nAdams, K. (2023). B. P.", "(Smith, 2023) (Lee, Ltd. Report Series, 2020 issue)"],
      ["chicago-author-date", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.\n\nAdams, Kim. 2020. Beloved. Knopf."],
      ["chicago-author-date", "Yu, C. (2020). Interior Chinatown. Pantheon Books."],
      ["harvard", "Sneed, A. (2019) The reason Antarctica is melting. Available at: https://www.scientificamerican.com/"],
      ["ieee", "[1] A. Author, Book. P, 2020.\n\n[1] B. Author, Book. P, 2021."],
    ];
    for (const [style, references, citations] of inputs) for (const item of all(checkReferences({ style, references, ...(citations ? { citations } : {}) }))) produced.add(item.message);
    const quoted = [
      "Citation appears without a matching reference list entry.", "No entry by Smith from 2024 was found.", "Reference may be uncited.", "Could not confidently identify citation.",
      "Possible duplicate reference.", "Reference may be formatted using a different citation style.", "DOI syntax appears invalid.", "Entry appears out of alphabetical order.",
      "Citation matching is heuristic.", "Reference number [1] is used more than once.", "The URL has no access date.",
    ];
    for (const message of quoted) {
      assert.ok(text.includes(message), `the guide quotes ${message}`);
      const general = message.replace("Smith from 2024", "Smith from 2023");
      assert.ok(produced.has(message) || produced.has(general), `the checker produces ${message}`);
    }
  });
});
