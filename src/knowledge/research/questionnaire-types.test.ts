import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUESTIONNAIRE_PLACEHOLDERS, QUESTION_TYPES, QUESTION_TYPE_INFO, SECTION_KINDS, SECTION_KIND_INFO, TYPE_FOR_LEVEL } from "./questionnaire-types";
import { MEASUREMENT_LEVELS } from "./variable-types";

describe("QUESTION_TYPES", () => {
  it("covers the sixteen question types", () => {
    assert.deepEqual(
      QUESTION_TYPES.map((type) => QUESTION_TYPE_INFO[type].label),
      ["Short answer", "Long answer", "Paragraph", "Multiple choice", "Checkbox", "Dropdown", "Likert scale", "Semantic differential", "Matrix table", "Ranking", "Numeric", "Date", "Time", "Yes/No", "True/False", "File upload (placeholder)"],
    );
  });

  it("describes every type completely and consistently", () => {
    for (const type of QUESTION_TYPES) {
      const info = QUESTION_TYPE_INFO[type];
      assert.ok(info.description.endsWith("."), type);
      assert.ok(info.instruction.endsWith("."), type);
      assert.equal(info.form === "text", info.lines > 0, `${type}: only written answers have lines`);
      assert.equal(info.usesScale, ["scale", "differential", "matrix"].includes(info.form), `${type}: scale types`);
      assert.equal(info.usesRows, info.form === "matrix", `${type}: only matrices have statements`);
      assert.ok(!(info.usesOptions && info.fixedOptions.length > 0), `${type}: options are either written or fixed`);
    }
    assert.deepEqual(QUESTION_TYPE_INFO["yes-no"].fixedOptions, ["Yes", "No"]);
    assert.deepEqual(QUESTION_TYPE_INFO["true-false"].fixedOptions, ["True", "False"]);
  });

  it("suggests a type for every measurement level, one that produces that level", () => {
    for (const level of MEASUREMENT_LEVELS) {
      const type = TYPE_FOR_LEVEL[level];
      assert.ok(QUESTION_TYPE_INFO[type].levels.includes(level), `${level} → ${type}`);
    }
    assert.equal(TYPE_FOR_LEVEL.ordinal, "multiple-choice", "ordered categories, not an agreement scale");
    assert.equal(TYPE_FOR_LEVEL.likert, "likert");
  });
});

describe("SECTION_KINDS", () => {
  it("has a label and purpose for every kind, and placeholders only where text is expected", () => {
    assert.equal(SECTION_KINDS.length, 10);
    for (const kind of SECTION_KINDS) {
      const info = SECTION_KIND_INFO[kind];
      assert.ok(info.label && info.purpose.endsWith("."), kind);
      if (info.placeholder) assert.match(info.placeholder, /^\[.+\]$/, kind);
    }
    assert.deepEqual(
      SECTION_KINDS.filter((kind) => SECTION_KIND_INFO[kind].placeholder === null),
      ["demographics", "items", "open-ended", "custom"],
    );
  });
});

describe("QUESTIONNAIRE_PLACEHOLDERS", () => {
  it("are bracketed, so a placeholder can never be mistaken for real wording", () => {
    for (const text of [QUESTIONNAIRE_PLACEHOLDERS.title, QUESTIONNAIRE_PLACEHOLDERS.question("sleep"), QUESTIONNAIRE_PLACEHOLDERS.consentQuestion, QUESTIONNAIRE_PLACEHOLDERS.option(1), QUESTIONNAIRE_PLACEHOLDERS.row(2), QUESTIONNAIRE_PLACEHOLDERS.unlinked]) {
      assert.match(text, /^\[.+\]$/);
    }
    assert.equal(QUESTIONNAIRE_PLACEHOLDERS.question("Feeling rested"), "[question about Feeling rested]");
  });
});
