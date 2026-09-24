import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HYPOTHESIS_TYPES, HYPOTHESIS_TYPE_IDS, getHypothesisType, typesOf } from "./hypothesis-types";

describe("HYPOTHESIS_TYPES", () => {
  it("covers the seven supported types, in order", () => {
    assert.deepEqual(HYPOTHESIS_TYPES.map((type) => type.id), [...HYPOTHESIS_TYPE_IDS]);
    assert.deepEqual(HYPOTHESIS_TYPES.map((type) => type.name), [
      "Null hypothesis",
      "Alternative hypothesis",
      "Directional hypothesis",
      "Non-directional hypothesis",
      "Difference hypothesis",
      "Relationship hypothesis",
      "Prediction hypothesis",
    ]);
  });

  for (const type of HYPOTHESIS_TYPES) {
    it(`gives the ${type.id} type a definition, when to use it, strengths, limitations and examples`, () => {
      assert.ok(type.definition.length > 30);
      assert.ok(type.whenAppropriate.length > 20);
      assert.ok(type.strengths.length >= 2);
      assert.ok(type.limitations.length >= 2);
      assert.ok(type.examples.length >= 2);
      for (const example of type.examples) assert.ok(example.endsWith(".") && !example.endsWith("?."), example);
    });
  }

  it("leaves references empty until academic review, rather than inventing any", () => {
    for (const type of HYPOTHESIS_TYPES) assert.deepEqual(type.references, [], type.id);
  });

  it("uses the conventional symbols only for the null and alternative hypotheses", () => {
    assert.deepEqual(HYPOTHESIS_TYPES.map((type) => type.symbol), ["H₀", "H₁", null, null, null, null, null]);
  });

  it("rejects unknown types", () => {
    assert.throws(() => getHypothesisType("research" as never), { name: "RangeError", message: "Unknown hypothesis type: research" });
  });
});

describe("typesOf", () => {
  it("names the types a hypothesis belongs to", () => {
    assert.deepEqual(typesOf("null", "difference", "non-directional"), ["null", "difference"]);
    assert.deepEqual(typesOf("alternative", "relationship", "non-directional"), ["alternative", "relationship", "non-directional"]);
    assert.deepEqual(typesOf("alternative", "prediction", "negative"), ["alternative", "prediction", "directional"]);
  });

  it("never describes a null hypothesis as directional", () => {
    assert.ok(!typesOf("null", "prediction", "positive").includes("directional"));
  });
});
