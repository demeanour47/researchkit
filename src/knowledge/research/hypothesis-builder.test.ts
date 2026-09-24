import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HYPOTHESIS_PLACEHOLDERS, generateHypotheses } from "./hypothesis-builder";
import { DIRECTIONS, HYPOTHESIS_FORMS } from "./hypothesis-types";
import { readDirection } from "./hypothesis-direction";
import { statesAbsence } from "./hypothesis-null";
import { createProjectDraft } from "./research-project";

const project = createProjectDraft({
  population: "first-year university students",
  location: "Nepal",
  timeContext: "2025",
  independentVariables: ["screen time"],
  dependentVariables: ["sleep quality"],
});
const scope = " among first-year university students in Nepal in 2025";

describe("generateHypotheses", () => {
  const expected: Record<string, [string, string]> = {
    "difference/non-directional": [
      `There is no difference in sleep quality between groups defined by screen time${scope}.`,
      `There is a difference in sleep quality between groups defined by screen time${scope}.`,
    ],
    "difference/positive": [
      `There is no difference in sleep quality between groups defined by screen time${scope}.`,
      `Sleep quality is higher in [group of interest] than in [comparison group], with groups defined by screen time${scope}.`,
    ],
    "difference/negative": [
      `There is no difference in sleep quality between groups defined by screen time${scope}.`,
      `Sleep quality is lower in [group of interest] than in [comparison group], with groups defined by screen time${scope}.`,
    ],
    "relationship/non-directional": [
      `There is no relationship between screen time and sleep quality${scope}.`,
      `There is a relationship between screen time and sleep quality${scope}.`,
    ],
    "relationship/positive": [
      `There is no relationship between screen time and sleep quality${scope}.`,
      `Screen time is positively related to sleep quality${scope}.`,
    ],
    "relationship/negative": [
      `There is no relationship between screen time and sleep quality${scope}.`,
      `Screen time is negatively related to sleep quality${scope}.`,
    ],
    "prediction/non-directional": [`Screen time does not predict sleep quality${scope}.`, `Screen time predicts sleep quality${scope}.`],
    "prediction/positive": [`Screen time does not predict sleep quality${scope}.`, `Higher screen time predicts higher sleep quality${scope}.`],
    "prediction/negative": [`Screen time does not predict sleep quality${scope}.`, `Higher screen time predicts lower sleep quality${scope}.`],
  };

  for (const form of HYPOTHESIS_FORMS) {
    for (const direction of DIRECTIONS) {
      it(`drafts a ${direction} ${form} null and alternative hypothesis`, () => {
        const [pair] = generateHypotheses(project, { form, direction }).pairs;
        assert.deepEqual([pair.null.text, pair.alternative.text], expected[`${form}/${direction}`]);
      });

      it(`writes a ${direction} ${form} alternative whose wording states that direction`, () => {
        const [pair] = generateHypotheses(project, { form, direction }).pairs;
        assert.equal(readDirection(pair.alternative.text), direction);
        assert.ok(statesAbsence(pair.null.text));
        assert.ok(!statesAbsence(pair.alternative.text));
      });
    }
  }

  it("exposes each relationship as structured data", () => {
    const [pair] = generateHypotheses(createProjectDraft({ ...project, controlVariables: ["age"] }), { form: "prediction", direction: "negative" }).pairs;
    assert.deepEqual(pair.relationship, {
      kind: "main",
      form: "prediction",
      direction: "negative",
      independentVariables: ["screen time"],
      dependentVariables: ["sleep quality"],
      moderators: [],
      mediators: [],
      controls: ["age"],
      population: "first-year university students",
      context: "in Nepal in 2025",
    });
    assert.deepEqual([pair.id, pair.null.id, pair.alternative.id], ["main-1-1", "main-1-1-null", "main-1-1-alternative"]);
  });

  it("makes a separate, explicit pair for every independent and dependent variable combination", () => {
    const set = generateHypotheses(createProjectDraft({ ...project, independentVariables: ["screen time", "caffeine"], dependentVariables: ["sleep quality", "mood"] }), {
      form: "relationship",
      direction: "non-directional",
    });
    assert.deepEqual(
      set.pairs.map((pair) => [pair.id, pair.relationship.independentVariables[0], pair.relationship.dependentVariables[0]]),
      [
        ["main-1-1", "screen time", "sleep quality"],
        ["main-1-2", "screen time", "mood"],
        ["main-2-1", "caffeine", "sleep quality"],
        ["main-2-2", "caffeine", "mood"],
      ],
    );
  });

  it("adds moderation and mediation pairs only for the moderators and mediators listed", () => {
    const set = generateHypotheses(createProjectDraft({ ...project, moderatorVariables: ["gender"], mediatorVariables: ["bedtime"] }), {
      form: "relationship",
      direction: "positive",
    });
    assert.deepEqual(set.pairs.map((pair) => pair.id), ["main-1-1", "moderation-1-1-1", "mediation-1-1-1"]);
    const [, moderation, mediation] = set.pairs;
    assert.equal(moderation.alternative.text, `Gender moderates the relationship between screen time and sleep quality${scope}.`);
    assert.equal(moderation.null.text, `Gender does not moderate the relationship between screen time and sleep quality${scope}.`);
    assert.deepEqual(moderation.relationship.moderators, ["gender"]);
    assert.equal(moderation.relationship.direction, "non-directional", "moderation is never given a direction the researcher didn't state");
    assert.equal(mediation.alternative.text, `The relationship between screen time and sleep quality is mediated by bedtime${scope}.`);
    assert.deepEqual(mediation.relationship.mediators, ["bedtime"]);
    assert.match(set.explanation, /Moderator and mediator hypotheses are non-directional/);
  });

  it("states control variables in every hypothesis", () => {
    const set = generateHypotheses(createProjectDraft({ ...project, controlVariables: ["age", "income"] }), { form: "relationship", direction: "non-directional" });
    assert.ok(set.pairs[0].alternative.text.endsWith(", after controlling for age and income."));
  });

  it("keeps unknown information as placeholders, and never invents it", () => {
    const set = generateHypotheses({}, { form: "relationship", direction: "non-directional" });
    assert.equal(set.pairs.length, 1);
    assert.equal(set.pairs[0].alternative.text, "There is a relationship between [independent variable] and [dependent variable] among [population] [context].");
    assert.deepEqual(set.placeholders, ["independentVariable", "dependentVariable", "population", "context"]);
    assert.deepEqual(set.pairs[0].relationship.independentVariables, [], "placeholders are never stored as variables");
    assert.equal(set.pairs[0].relationship.population, null);
  });

  it("works with a partial project", () => {
    const set = generateHypotheses(createProjectDraft({ dependentVariables: ["burnout"], population: "nurses" }), { form: "prediction", direction: "non-directional" });
    assert.equal(set.pairs[0].alternative.text, "[independent variable] predicts burnout among nurses [context].");
    assert.deepEqual(set.placeholders, ["independentVariable", "context"]);
  });

  it("marks placeholders only in the hypotheses that contain them", () => {
    const [pair] = generateHypotheses(createProjectDraft({ ...project }), { form: "difference", direction: "positive" }).pairs;
    assert.deepEqual(pair.null.placeholders, []);
    assert.deepEqual(pair.alternative.placeholders, ["groupOfInterest", "comparisonGroup"]);
  });

  it("uses only words from the project, its fixed structure and placeholders", () => {
    const set = generateHypotheses(project, { form: "relationship", direction: "non-directional" });
    const structure = new Set("there is a no relationship between and among in".split(" "));
    const allowed = new Set([...structure, ..."screen time sleep quality first-year university students nepal 2025".split(" ")]);
    for (const text of [set.pairs[0].null.text, set.pairs[0].alternative.text]) {
      for (const word of text.toLowerCase().replace(/[.,]/g, "").split(" ")) assert.ok(allowed.has(word), word);
    }
  });

  it("rejects invalid options", () => {
    assert.throws(() => generateHypotheses(project, { form: "causal" as never, direction: "positive" }), { name: "RangeError", message: "Unknown hypothesis form: causal" });
    assert.throws(() => generateHypotheses(project, { form: "difference", direction: "up" as never }), { name: "RangeError", message: "Unknown direction: up" });
  });

  it("uses the shared placeholder wording", () => {
    assert.equal(HYPOTHESIS_PLACEHOLDERS.independentVariable, "[independent variable]");
    assert.equal(HYPOTHESIS_PLACEHOLDERS.context, "[context]");
  });
});
