import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DECISION_QUESTIONS, consistentDesigns, narrowDesigns, validateAnswers, type DecisionQuestionId } from "./design-decision";
import { DESIGN_IDS, RESEARCH_DESIGNS } from "./design-types";

describe("DECISION_QUESTIONS", () => {
  it("asks the six structured questions", () => {
    assert.deepEqual(DECISION_QUESTIONS.map((question) => question.id), ["causality", "manipulation", "timing", "emphasis", "cases", "setting"]);
    for (const question of DECISION_QUESTIONS) {
      assert.ok(question.question.endsWith("?"));
      assert.ok(question.options.length >= 2);
    }
  });
});

describe("validateAnswers", () => {
  it("accepts valid, unsure and missing answers", () => {
    assert.doesNotThrow(() => validateAnswers({}));
    assert.doesNotThrow(() => validateAnswers({ causality: "yes", timing: "unsure", setting: undefined }));
  });

  it("rejects unknown questions and answers", () => {
    assert.throws(() => validateAnswers({ budget: "high" } as never), { message: "Unknown decision question: budget" });
    assert.throws(() => validateAnswers({ timing: "sometimes" }), { message: "Unknown answer to timing: sometimes" });
  });
});

describe("narrowDesigns", () => {
  it("explains every design without judging when nothing is answered", () => {
    const narrowing = narrowDesigns({});
    assert.deepEqual(narrowing.map((entry) => entry.design), [...DESIGN_IDS]);
    for (const entry of narrowing) assert.deepEqual([entry.fits, entry.differs], [[], []]);
  });

  it("ignores “unsure” answers", () => {
    assert.deepEqual(narrowDesigns({ causality: "unsure", timing: "unsure" }), narrowDesigns({}));
  });

  for (const design of RESEARCH_DESIGNS) {
    it(`judges the ${design.id} design against every answer by its traits`, () => {
      for (const question of DECISION_QUESTIONS) {
        for (const option of question.options) {
          const entry = narrowDesigns({ [question.id]: option.value }).find((candidate) => candidate.design === design.id)!;
          const trait = design.traits[question.id as DecisionQuestionId];
          const expected =
            question.id === "causality"
              ? option.value === "no" || ["strong", "moderate", "either"].includes(trait)
              : trait === "either" || trait === option.value;
          assert.equal(entry.fits.length === 1, expected, `${design.id} ${question.id}=${option.value}`);
          assert.equal(entry.fits.length + entry.differs.length, 1);
          const [judgement] = [...entry.fits, ...entry.differs];
          assert.ok(judgement.explanation.startsWith(`${design.name} designs`), judgement.explanation);
        }
      }
    });
  }

  it("explains why a design differs from an answer", () => {
    const survey = narrowDesigns({ timing: "repeated", emphasis: "qualitative" }).find((entry) => entry.design === "survey")!;
    assert.deepEqual(survey.fits.map((entry) => entry.explanation), ["Survey designs can collect data once or several times."]);
    assert.deepEqual(survey.differs.map((entry) => entry.explanation), ["Survey designs usually use quantitative data."]);
  });

  it("explains how strongly each experimental design supports causal claims", () => {
    const explanation = (id: string) => narrowDesigns({ causality: "yes" }).find((entry) => entry.design === id)!;
    assert.equal(explanation("pre-experimental").differs[0].explanation, "Pre-experimental designs can suggest, but rarely establish, cause and effect.");
    assert.equal(explanation("quasi-experimental").fits[0].explanation, "Quasi-experimental designs can estimate cause and effect, though less securely than a randomised experiment.");
  });
});

describe("consistentDesigns", () => {
  it("lists every design when nothing is answered, never choosing one", () => {
    assert.deepEqual(consistentDesigns({}), [...DESIGN_IDS]);
  });

  it("narrows to designs that differ from no answer, in catalogue order", () => {
    assert.deepEqual(consistentDesigns({ causality: "yes", setting: "natural" }), ["quasi-experimental", "explanatory", "sequential-mixed", "concurrent-mixed", "embedded-mixed"]);
    assert.deepEqual(consistentDesigns({ emphasis: "qualitative", cases: "single", timing: "repeated" }), [
      "case-study",
      "ethnography",
      "action-research",
      "historical",
      "descriptive",
      "explanatory",
      "exploratory",
    ]);
  });

  it("leaves only designs flexible on every point when answers pull in different directions", () => {
    assert.deepEqual(consistentDesigns({ manipulation: "yes", emphasis: "qualitative", setting: "controlled", cases: "single" }), ["explanatory"]);
  });
});
