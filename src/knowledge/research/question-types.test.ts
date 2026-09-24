import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getReference } from "./references";
import { QUESTION_TYPES, QUESTION_TYPE_IDS, detectApproach, detectQuestionTypes, getQuestionType } from "./question-types";

const typesOf = (question: string) => detectQuestionTypes(question).map((detection) => detection.type);

describe("QUESTION_TYPES", () => {
  it("covers the ten supported types, seven by purpose and three by approach", () => {
    assert.deepEqual(QUESTION_TYPES.map((type) => type.id), [...QUESTION_TYPE_IDS]);
    assert.equal(QUESTION_TYPES.filter((type) => type.dimension === "purpose").length, 7);
    assert.deepEqual(QUESTION_TYPES.filter((type) => type.dimension === "approach").map((type) => type.id), ["qualitative", "quantitative", "mixed-methods"]);
  });

  it("explains every type, with example, stems, note and genuine sources", () => {
    for (const type of QUESTION_TYPES) {
      assert.ok(type.definition.length > 20, type.id);
      assert.ok(type.example.endsWith("?"), type.id);
      assert.ok(type.stems.length >= 1, type.id);
      assert.ok(type.note.length > 20, type.id);
      assert.ok(type.needs.includes("population"), `${type.id} should need a population`);
      assert.ok(type.sources.length >= 1, type.id);
      for (const id of type.sources) assert.doesNotThrow(() => getReference(id));
    }
  });

  it("recognises its own example as its own type", () => {
    for (const type of QUESTION_TYPES) {
      assert.ok(typesOf(type.example).includes(type.id), `${type.id}: ${type.example} → ${typesOf(type.example).join(", ")}`);
    }
  });

  it("rejects unknown types", () => {
    assert.throws(() => getQuestionType("rhetorical" as never), RangeError);
  });
});

describe("detectQuestionTypes", () => {
  const cases: [string, string[]][] = [
    ["What is the prevalence of anaemia among pregnant women?", ["descriptive", "quantitative"]],
    ["How often do students use the library?", ["descriptive", "quantitative"]],
    ["How does attainment differ between rural and urban schools?", ["comparative"]],
    ["What is the relationship between income and diet quality?", ["relational"]],
    ["Is income correlated with diet quality?", ["correlational", "quantitative"]],
    ["Why do volunteers leave charities?", ["explanatory"]],
    ["What is the impact of remote work on wellbeing?", ["explanatory", "quantitative"]],
    ["How do refugees make sense of resettlement?", ["exploratory", "qualitative"]],
    ["Can early grades predict dropout?", ["predictive", "quantitative"]],
    ["To what extent does pay affect retention, and how do staff describe their reasons?", ["explanatory", "mixed-methods"]],
  ];
  for (const [question, expected] of cases) {
    it(`reads “${question}” as ${expected.join(" and ")}`, () => {
      assert.deepEqual(typesOf(question), expected);
    });
  }

  it("explains each detection with the words that suggested it", () => {
    const [detection] = detectQuestionTypes("What is the relationship between income and diet quality?");
    assert.deepEqual(detection.cues, ["“relationship between”"]);
    assert.equal(detection.reason, "The wording “relationship between” is typical of a relational question.");
  });

  it("recognises nothing in empty or unrelated text", () => {
    assert.deepEqual(detectQuestionTypes(""), []);
    assert.deepEqual(detectQuestionTypes("Sleep."), []);
  });

  it("reports the approach separately", () => {
    assert.equal(detectApproach("How do nurses experience night shifts?"), "qualitative");
    assert.equal(detectApproach("How many nurses work night shifts?"), "quantitative");
    assert.equal(detectApproach("How many nurses work night shifts, and how do they experience them?"), "mixed-methods");
    assert.equal(detectApproach("What is nursing?"), null);
  });
});
