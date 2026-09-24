import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DESIGN_IDS } from "./design-types";
import { findOption } from "./research-onion";
import { SAMPLING_CATEGORY_LABELS, SAMPLING_TECHNIQUES, SAMPLING_TECHNIQUE_IDS, getTechnique, isTechniqueId } from "./sampling-types";
import type { LayerId } from "./types";

describe("SAMPLING_TECHNIQUES", () => {
  it("supports the five probability and eight non-probability techniques", () => {
    assert.deepEqual(SAMPLING_TECHNIQUES.map((technique) => technique.id), [...SAMPLING_TECHNIQUE_IDS]);
    const byCategory = (category: string) => SAMPLING_TECHNIQUES.filter((technique) => technique.category === category).map((technique) => technique.name);
    assert.deepEqual(byCategory("probability"), ["Simple random", "Systematic", "Stratified", "Cluster", "Multistage"]);
    assert.deepEqual(byCategory("non-probability"), ["Convenience", "Purposive", "Judgmental", "Quota", "Snowball", "Volunteer", "Consecutive", "Theoretical"]);
    assert.deepEqual(Object.values(SAMPLING_CATEGORY_LABELS), ["Probability sampling", "Non-probability sampling"]);
  });

  for (const technique of SAMPLING_TECHNIQUES) {
    it(`describes the ${technique.id} technique completely, with no invented references`, () => {
      assert.ok(technique.definition.length > 50 && technique.definition.endsWith("."));
      assert.ok(technique.whenUsed.endsWith("."));
      for (const list of [technique.strengths, technique.limitations]) assert.ok(list.length >= 2);
      for (const list of [technique.assumptions, technique.examples]) assert.ok(list.length >= 1);
      for (const text of [technique.commonSampleSizes, technique.representativeness, technique.biasRisk, technique.resources, technique.time]) assert.ok(text.length > 3);
      assert.deepEqual(technique.references, []);
    });

    it(`links the ${technique.id} technique only to existing designs and onion choices`, () => {
      assert.ok(technique.typicalDesigns.length > 0);
      for (const id of technique.typicalDesigns) assert.ok(DESIGN_IDS.includes(id), id);
      for (const [layer, fit] of Object.entries(technique.onion) as [LayerId, { typical: readonly string[]; possible?: readonly string[] }][]) {
        for (const id of [...fit.typical, ...(fit.possible ?? [])]) assert.equal(findOption(id)?.layer, layer, `${technique.id}: ${id}`);
      }
    });
  }

  it("gives probability techniques the traits of random selection, and non-probability techniques none of them", () => {
    for (const technique of SAMPLING_TECHNIQUES) {
      const probability = technique.category === "probability";
      assert.equal(technique.traits.frame !== "none", probability, `${technique.id} frame`);
      assert.equal(technique.traits.representativeness === "high", probability, `${technique.id} representativeness`);
      if (probability) assert.equal(technique.traits.referral, "no", `${technique.id} referral`);
    }
  });

  it("marks the techniques that divide the population into groups", () => {
    assert.deepEqual(SAMPLING_TECHNIQUES.filter((technique) => technique.traits.needsGroups).map((technique) => technique.id), ["stratified", "quota"]);
  });

  it("looks techniques up and rejects unknown ones", () => {
    assert.equal(getTechnique("snowball").name, "Snowball");
    assert.throws(() => getTechnique("random-walk" as never), { name: "RangeError", message: "Unknown sampling technique: random-walk" });
    assert.equal(isTechniqueId("quota"), true);
    assert.equal(isTechniqueId("random-walk"), false);
  });
});
