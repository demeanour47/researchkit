import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apa7CitationsAndReferences } from "../../../content/guides/apa-7-citations-and-references";

const text = apa7CitationsAndReferences.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");

describe("APA 7 citation guide", () => {
  it("has unique anchors and the required curriculum", () => {
    const ids = apa7CitationsAndReferences.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const phrase of ["citation-and-reference", "parenthetical-and-narrative", "authors-and-dates", "multiple-sources", "quotations-and-locators", "source-types", "doi-and-url", "missing-metadata", "reference-list", "workflow"]) assert.ok(ids.includes(phrase), phrase);
  });

  it("contains teaching examples without claiming synthetic metadata is verified", () => {
    for (const phrase of ["Smith (2024)", "World Health Organization", "p. 12", "doi.org", "synthetic examples", "not externally verified"]) assert.ok(text.includes(phrase), phrase);
    assert.deepEqual(apa7CitationsAndReferences.relatedToolIds, ["apa-citation-generator", "reference-checker"]);
  });
});
