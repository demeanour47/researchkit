import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToWriteAResearchQuestion as guide } from "../../../content/guides/how-to-write-a-research-question";
import { citationProblems, proseOf, tableOf } from "../../domains/publishing/guide-checks";
import { evaluateFiner } from "./finer";
import { ELEMENT_LABELS, QUESTION_ELEMENT_IDS, identifyElements } from "./question-elements";
import { QUESTION_TYPES } from "./question-types";
import { REFERENCES } from "./references";

const refined = tableOf(guide, "Refining a question in three drafts").rows[2][1];

describe("How to write a research question guide", () => {
  it("lists the question types exactly as the Research Question Builder defines them", () => {
    assert.deepEqual(tableOf(guide, "Types of research question").rows, QUESTION_TYPES.map((type) => [type.name, type.definition, type.example]));
  });

  it("states the FINER criteria as the builder asks them", () => {
    const finer = evaluateFiner(refined, {}, identifyElements(refined, {}, ["relational"]));
    assert.deepEqual(tableOf(guide, "The FINER criteria").rows, finer.map((assessment) => [assessment.name, assessment.meaning]));
  });

  it("names the elements the builder finds in the refined question", () => {
    const rows = tableOf(guide, "The elements of a research question").rows;
    assert.deepEqual(rows.map(([label]) => label), QUESTION_ELEMENT_IDS.map((id) => ELEMENT_LABELS[id]));
    const found = identifyElements(refined, {}, ["relational"]);
    for (const [index, id] of QUESTION_ELEMENT_IDS.entries()) {
      const finding = found.find((entry) => entry.element === id);
      assert.equal(finding?.status, "found", id);
      assert.equal(finding?.value, rows[index][2], id);
    }
  });

  it("labels its worked example as hypothetical", () => {
    assert.match(proseOf(guide), /This is a hypothetical example of how a student might refine a question; it doesn't describe a real study/);
  });

  it("cites every source it lists", () => {
    assert.deepEqual(citationProblems(guide, REFERENCES.map((reference) => reference.id)), []);
  });
});
