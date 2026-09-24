import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MEASUREMENT_LEVELS, MEASUREMENT_LEVEL_INFO, VARIABLE_KINDS, VARIABLE_KIND_INFO, VARIABLE_PLACEHOLDERS, levelFit, type MeasurementLevel } from "./variable-types";

describe("VARIABLE_KINDS", () => {
  it("supports the seven variable types", () => {
    assert.deepEqual(
      VARIABLE_KINDS.map((kind) => VARIABLE_KIND_INFO[kind].label),
      ["Independent variable", "Dependent variable", "Mediator variable", "Moderator variable", "Control variable", "Extraneous variable", "Confounding variable"],
    );
  });

  for (const kind of VARIABLE_KINDS) {
    it(`defines the ${kind} type with an example and no invented references`, () => {
      const info = VARIABLE_KIND_INFO[kind];
      assert.ok(info.definition.length > 40 && info.definition.endsWith("."));
      assert.ok(info.example.length > 10);
      assert.deepEqual(info.references, []);
    });
  }
});

describe("MEASUREMENT_LEVELS", () => {
  it("supports the ten measurement levels", () => {
    assert.deepEqual(
      MEASUREMENT_LEVELS.map((level) => MEASUREMENT_LEVEL_INFO[level].label),
      ["Nominal", "Ordinal", "Interval", "Ratio", "Binary", "Likert", "Continuous", "Categorical", "Multiple response", "Open-ended"],
    );
  });

  for (const level of MEASUREMENT_LEVELS) {
    it(`explains the ${level} level with a definition, examples, strengths and limitations`, () => {
      const info = MEASUREMENT_LEVEL_INFO[level];
      assert.ok(info.definition.length > 30);
      assert.ok(info.examples.length >= 2);
      assert.ok(info.strengths.length >= 2);
      assert.ok(info.limitations.length >= 2);
      assert.deepEqual(info.references, [], "references stay empty until academic review");
    });
  }

  it("groups levels into families by the kind of data they produce", () => {
    const families = Object.fromEntries(MEASUREMENT_LEVELS.map((level) => [level, MEASUREMENT_LEVEL_INFO[level].family]));
    assert.deepEqual(families, {
      nominal: "categories",
      ordinal: "ordered",
      interval: "numeric",
      ratio: "numeric",
      binary: "categories",
      likert: "ordered",
      continuous: "numeric",
      categorical: "categories",
      "multiple-response": "categories",
      "open-ended": "text",
    });
  });
});

describe("levelFit", () => {
  const family: Record<MeasurementLevel, string> = {
    nominal: "c",
    binary: "c",
    categorical: "c",
    "multiple-response": "c",
    ordinal: "o",
    likert: "o",
    interval: "n",
    ratio: "n",
    continuous: "n",
    "open-ended": "t",
  };
  for (const variable of MEASUREMENT_LEVELS) {
    it(`judges every indicator level against a ${variable} variable`, () => {
      for (const indicator of MEASUREMENT_LEVELS) {
        const pair = new Set([family[variable], family[indicator]]);
        const expected = family[variable] === family[indicator] ? "consistent" : pair.has("o") && pair.has("n") ? "review" : "inconsistent";
        assert.equal(levelFit(variable, indicator), expected, `${variable} with ${indicator}`);
        assert.equal(levelFit(indicator, variable), expected, "the judgement doesn't depend on order");
      }
    });
  }
});

describe("VARIABLE_PLACEHOLDERS", () => {
  it("marks every unknown step in square brackets", () => {
    assert.deepEqual(Object.values(VARIABLE_PLACEHOLDERS), [
      "[conceptual definition]",
      "[operational definition]",
      "[indicator]",
      "[measurement]",
      "[scale]",
      "[questionnaire item]",
    ]);
  });
});
