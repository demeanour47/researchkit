import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { spssFromDataPreparationToReporting } from "../../../content/guides/spss-from-data-preparation-to-reporting";
import { getReference } from "./references";
import { SPSS_PROCEDURE_METHODS } from "./spss-procedures";
import { TOOL_ID as LAB_ID, TOOL_PATH as LAB_PATH } from "../../tools/spss-research-lab/path";
import { TOOL_ID as EFFECT_ID, TOOL_PATH as EFFECT_PATH } from "../../tools/effect-size-calculator/path";
import { TOOL_ID as FINDER_ID, TOOL_PATH as FINDER_PATH } from "../../tools/statistical-test-finder/path";
import { TOOL_ID as CHECKER_ID, TOOL_PATH as CHECKER_PATH } from "../../tools/statistical-assumption-checker/path";
import { TOOL_ID as INTERPRETER_ID, TOOL_PATH as INTERPRETER_PATH } from "../../tools/results-interpretation/path";

describe("SPSS Research Lab Learn guide", () => {
  const sections = new Map(spssFromDataPreparationToReporting.sections.map((section) => [section.id, section]));
  const blocks = spssFromDataPreparationToReporting.sections.flatMap((section) => section.blocks);

  it("covers the analysis lifecycle and has no duplicate section anchors", () => {
    assert.equal(sections.size, spssFromDataPreparationToReporting.sections.length);
    for (const id of ["what-spss-does", "interface-and-files", "design-before-software", "prepare-data", "describe-data", "choose-test", "spss-procedures", "assumptions", "effect-size-and-significance", "read-output-and-report", "worked-examples-and-practice", "syntax-and-reproducibility", "mistakes-and-limits", "references"]) {
      assert.ok(sections.has(id), `missing section ${id}`);
    }
  });

  it("uses the full existing method-to-SPSS procedure map instead of a second test list", () => {
    const mapped = blocks.filter((block) => block.type === "spss-procedures").flatMap((block) => block.methods);
    assert.deepEqual(new Set(mapped), new Set(SPSS_PROCEDURE_METHODS));
  });

  it("resolves each cited reference and includes reciprocal tool relationships", () => {
    const referenceIds = blocks.filter((block) => block.type === "references").flatMap((block) => block.ids);
    for (const id of referenceIds) assert.equal(getReference(id).id, id);
    for (const id of [LAB_ID, EFFECT_ID, FINDER_ID, CHECKER_ID, INTERPRETER_ID]) {
      assert.ok(spssFromDataPreparationToReporting.relatedToolIds.includes(id), `missing related tool ${id}`);
    }
    const links = blocks.filter((block) => block.type === "links").flatMap((block) => block.items.map((link) => link.href));
    for (const path of [LAB_PATH, EFFECT_PATH, FINDER_PATH, CHECKER_PATH, INTERPRETER_PATH]) assert.ok(links.includes(path), `missing internal route ${path}`);
  });
});