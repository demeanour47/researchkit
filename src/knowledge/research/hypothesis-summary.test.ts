import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateHypotheses } from "./hypothesis-builder";
import {
  HYPOTHESIS_BUILDER_LIMITATIONS,
  HYPOTHESIS_REVIEW_ITEMS,
  applyHypotheses,
  evaluateHypotheses,
  hypothesesText,
  pairLabel,
  relationshipRows,
  textsFor,
  toProjectHypotheses,
} from "./hypothesis-summary";
import { PROJECT_FIELDS, createProjectDraft } from "./research-project";

const project = createProjectDraft({
  researchArea: "Health",
  topic: "sleep",
  researchAim: "To examine sleep",
  researchQuestion: "What is the relationship between screen time and sleep quality among students?",
  researchObjectives: ["To measure screen time and sleep quality"],
  population: "students",
  location: "Nepal",
  timeContext: "2025",
  independentVariables: ["screen time"],
  dependentVariables: ["sleep quality"],
  moderatorVariables: ["gender"],
  mediatorVariables: ["bedtime"],
  controlVariables: ["age"],
  methodology: "quantitative",
  researchOnionSelection: { philosophy: "positivism" },
  notes: "Keep",
});
const set = generateHypotheses(project, { form: "relationship", direction: "negative" });

describe("applyHypotheses", () => {
  it("updates only the hypotheses section of the project draft", () => {
    const updated = applyHypotheses(project, toProjectHypotheses(set, {}));
    for (const field of PROJECT_FIELDS) {
      if (field !== "hypotheses") assert.deepEqual(updated[field], project[field], field);
    }
    assert.equal(updated.hypotheses?.length, 6);
    assert.equal(project.hypotheses, undefined, "the original draft is unchanged");
  });

  it("stores the researcher's edited wording with the structured relationship", () => {
    const edits = { "main-1-1-alternative": "Screen time is negatively related to sleep quality among students in Nepal in 2025." };
    const [, alternative] = applyHypotheses(project, toProjectHypotheses(set, edits)).hypotheses!;
    assert.equal(alternative.text, edits["main-1-1-alternative"]);
    assert.equal(alternative.role, "alternative");
    assert.deepEqual(alternative.relationship.independentVariables, ["screen time"]);
  });

  it("drops hypotheses whose wording has been cleared, and clears the section when none remain", () => {
    const edits = Object.fromEntries(set.pairs.flatMap((pair) => [[pair.null.id, ""], [pair.alternative.id, " "]]));
    assert.equal(applyHypotheses(project, toProjectHypotheses(set, edits)).hypotheses, undefined);
  });

  it("replaces earlier hypotheses rather than adding to them", () => {
    const first = applyHypotheses(project, toProjectHypotheses(set, {}));
    const second = applyHypotheses(first, toProjectHypotheses(generateHypotheses(project, { form: "prediction", direction: "non-directional" }), {}));
    assert.equal(second.hypotheses?.length, 6);
    assert.equal(second.hypotheses?.[0].relationship.form, "prediction");
  });

  it("rejects invalid hypotheses", () => {
    const [hypothesis] = toProjectHypotheses(set, {});
    assert.throws(() => applyHypotheses(project, [{ ...hypothesis, role: "maybe" as never }]), RangeError);
    assert.throws(() => applyHypotheses(project, [hypothesis, hypothesis]), { message: "Missing or repeated hypothesis id: main-1-1-null" });
    assert.throws(() => applyHypotheses(project, [{ ...hypothesis, relationship: { ...hypothesis.relationship, form: "causal" as never } }]), RangeError);
  });
});

describe("evaluateHypotheses", () => {
  it("evaluates every pair with alignment and wording checks, and gives methodology guidance", () => {
    const evaluation = evaluateHypotheses(set, {}, project);
    assert.deepEqual(evaluation.pairs.map((pair) => pair.pairId), ["main-1-1", "moderation-1-1-1", "mediation-1-1-1"]);
    assert.deepEqual(evaluation.pairs[0].checks.map((check) => check.check), [
      "researchQuestion",
      "objectives",
      "variables",
      "population",
      "context",
      "testability",
      "measurability",
      "wording",
      "nullAlternative",
      "direction",
    ]);
    assert.deepEqual(evaluation.methodology.map((note) => note.choice), ["Quantitative", "Positivism"]);
  });

  it("evaluates the researcher's edits, not the original drafts", () => {
    const evaluation = evaluateHypotheses(set, { "main-1-1-alternative": "Is screen time related to sleep quality?" }, project);
    assert.equal(evaluation.pairs[0].checks.find((check) => check.check === "testability")?.status, "clarify");
  });

  it("handles an empty project", () => {
    const evaluation = evaluateHypotheses(generateHypotheses({}, { form: "difference", direction: "non-directional" }), {}, {});
    assert.equal(evaluation.pairs.length, 1);
    assert.ok(evaluation.pairs[0].checks.some((check) => check.status === "missing"));
  });
});

describe("text and structure for display and later tools", () => {
  it("uses edits where they exist", () => {
    assert.deepEqual(textsFor(set.pairs[0], { "main-1-1-null": "Edited." }), { null: "Edited.", alternative: set.pairs[0].alternative.text });
  });

  it("writes every hypothesis as numbered plain text", () => {
    const text = hypothesesText(set, {});
    assert.ok(text.startsWith(`H₀1: ${set.pairs[0].null.text}\nH₁1: ${set.pairs[0].alternative.text}\n\nH₀2: `));
    assert.equal(text.split("\n").filter(Boolean).length, 6);
  });

  it("labels each pair by its relationship", () => {
    assert.deepEqual(set.pairs.map((pair) => pairLabel(pair.relationship)), [
      "screen time → sleep quality",
      "screen time → sleep quality, moderated by gender",
      "screen time → sleep quality, through bedtime",
    ]);
  });

  it("lists a relationship's parts, leaving out empty ones", () => {
    assert.deepEqual(relationshipRows(set.pairs[1].relationship), [
      { label: "Independent variable", values: ["screen time"] },
      { label: "Dependent variable", values: ["sleep quality"] },
      { label: "Moderator", values: ["gender"] },
      { label: "Control variables", values: ["age"] },
      { label: "Population", values: ["students"] },
      { label: "Context", values: ["in Nepal in 2025"] },
    ]);
  });

  it("documents limitations and the items awaiting academic review", () => {
    assert.ok(HYPOTHESIS_BUILDER_LIMITATIONS.length >= 4);
    assert.ok(HYPOTHESIS_REVIEW_ITEMS.some((item) => item.startsWith("Academic references")));
  });
});
