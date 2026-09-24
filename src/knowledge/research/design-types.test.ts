import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DESIGN_FAMILY_LABELS, DESIGN_IDS, RESEARCH_DESIGNS, getDesign, isDesignId } from "./design-types";
import { findOption } from "./research-onion";
import type { LayerId } from "./types";

describe("RESEARCH_DESIGNS", () => {
  it("supports the 21 required designs, in order", () => {
    assert.deepEqual(RESEARCH_DESIGNS.map((design) => design.id), [...DESIGN_IDS]);
    assert.deepEqual(RESEARCH_DESIGNS.map((design) => design.name), [
      "Experimental",
      "True experimental",
      "Quasi-experimental",
      "Pre-experimental",
      "Survey",
      "Case study",
      "Phenomenology",
      "Grounded theory",
      "Ethnography",
      "Narrative inquiry",
      "Action research",
      "Historical",
      "Correlational",
      "Cross-sectional",
      "Longitudinal",
      "Descriptive",
      "Explanatory",
      "Exploratory",
      "Sequential mixed methods",
      "Concurrent mixed methods",
      "Embedded mixed methods",
    ]);
  });

  for (const design of RESEARCH_DESIGNS) {
    it(`describes the ${design.id} design completely`, () => {
      assert.ok(design.definition.length > 50 && design.definition.endsWith("."));
      assert.ok(design.purpose.endsWith("."));
      assert.ok(design.whenUsed.endsWith("."));
      for (const list of [design.strengths, design.limitations]) assert.ok(list.length >= 2);
      for (const list of [design.typicalData, design.analysisMethods, design.examples, design.assumptions]) assert.ok(list.length >= 1);
      for (const text of [design.typicalSample, design.timeRequirement, design.resourceRequirement, design.commonUse]) assert.ok(text.length > 3);
      assert.ok(Object.keys(DESIGN_FAMILY_LABELS).includes(design.family));
      assert.deepEqual(design.references, [], "references stay empty until academic review");
    });

    it(`links the ${design.id} design only to research onion choices that exist, in the right layer`, () => {
      for (const [layer, fit] of Object.entries(design.onion) as [LayerId, { typical: readonly string[]; possible?: readonly string[] }][]) {
        for (const id of [...fit.typical, ...(fit.possible ?? [])]) assert.equal(findOption(id)?.layer, layer, `${design.id}: ${id}`);
        assert.ok(!(fit.possible ?? []).some((id) => fit.typical.includes(id)), `${design.id}: a choice listed twice`);
      }
    });
  }

  it("groups designs into families, including timing and purpose dimensions", () => {
    const families = Object.fromEntries(Object.keys(DESIGN_FAMILY_LABELS).map((family) => [family, RESEARCH_DESIGNS.filter((design) => design.family === family).map((design) => design.id)]));
    assert.deepEqual(families.timing, ["cross-sectional", "longitudinal"]);
    assert.deepEqual(families.purpose, ["descriptive", "explanatory", "exploratory"]);
    assert.deepEqual(families.mixed, ["sequential-mixed", "concurrent-mixed", "embedded-mixed"]);
  });

  it("distinguishes experimental designs by how well they support causal claims", () => {
    assert.deepEqual(
      ["true-experimental", "quasi-experimental", "pre-experimental", "correlational"].map((id) => getDesign(id as never).traits.causality),
      ["strong", "moderate", "weak", "none"],
    );
  });

  it("looks designs up and rejects unknown ones", () => {
    assert.equal(getDesign("survey").name, "Survey");
    assert.throws(() => getDesign("delphi" as never), { name: "RangeError", message: "Unknown research design: delphi" });
    assert.equal(isDesignId("survey"), true);
    assert.equal(isDesignId("delphi"), false);
  });
});
