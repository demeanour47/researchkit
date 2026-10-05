import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { qualitativeOrQuantitativeResearch as guide } from "../../../content/guides/qualitative-or-quantitative-research";
import { citationProblems, proseOf, tableOf } from "../../domains/publishing/guide-checks";
import { REFERENCES } from "./references";
import { OPTIONS } from "./research-onion";

const choices = OPTIONS.filter((option) => option.layer === "choice");

describe("Qualitative or quantitative research guide", () => {
  it("defines the methodological choices exactly as the Research Onion does", () => {
    assert.deepEqual(tableOf(guide, "Methodological choices").rows, choices.map((option) => [option.name, option.definition, option.whyUsed]));
  });

  it("warns about the mistakes the Research Onion warns about", () => {
    const prose = proseOf(guide);
    for (const id of ["quantitative", "qualitative"]) {
      for (const mistake of choices.find((option) => option.id === id)!.mistakes) assert.ok(prose.includes(mistake), mistake);
    }
  });

  it("labels its worked example as hypothetical", () => {
    assert.match(proseOf(guide), /A hypothetical example: a student is interested in online learning/);
  });

  it("cites every source it lists", () => {
    assert.deepEqual(citationProblems(guide, REFERENCES.map((reference) => reference.id)), []);
  });
});
