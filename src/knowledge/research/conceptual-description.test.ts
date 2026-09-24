import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addRelationship, addVariable, setDescription } from "./conceptual-framework";
import { describeFramework, describeRelationship, describeVariable } from "./conceptual-description";
import { frameworkOfShape } from "./conceptual-test-helpers";
import { EMPTY_FRAMEWORK, RELATIONSHIP_TYPES } from "./conceptual-types";

describe("describeVariable", () => {
  it("names the variable and its type, then its description", () => {
    const framework = setDescription(addVariable(EMPTY_FRAMEWORK, { name: "Sleep quality", type: "dependent" }), "v-sleep-quality", "Measured with a sleep diary.");
    assert.equal(describeVariable(framework, "v-sleep-quality"), "Sleep quality, dependent variable. Measured with a sleep diary.");
    assert.throws(() => describeVariable(framework, "v-x"), RangeError);
  });
});

describe("describeRelationship", () => {
  let framework = addVariable(addVariable(EMPTY_FRAMEWORK, { name: "screen time", type: "independent" }), { name: "sleep quality", type: "dependent" });
  const expected: Record<string, string> = {
    direct: "Screen time has a direct effect on sleep quality, labelled H1.",
    indirect: "Screen time has an indirect effect on sleep quality, labelled H1.",
    moderation: "Screen time moderates sleep quality, labelled H1.",
    mediation: "Screen time is linked through mediation to sleep quality, labelled H1.",
    association: "Screen time is associated with sleep quality, labelled H1.",
    correlation: "Screen time is correlated with sleep quality, labelled H1.",
    influence: "Screen time influences sleep quality, labelled H1.",
  };
  for (const type of RELATIONSHIP_TYPES) {
    it(`describes a ${type} connector in words`, () => {
      const withRelationship = addRelationship(framework, { source: "v-screen-time", target: "v-sleep-quality", type, label: "H1" });
      assert.equal(describeRelationship(withRelationship, withRelationship.relationships[0]), expected[type]);
    });
  }

  it("describes a moderation by the relationship it moderates", () => {
    const moderated = frameworkOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 1 });
    assert.equal(describeRelationship(moderated, moderated.relationships[1]), "Moderator 1 moderates the relationship between predictor 1 and outcome 1, labelled H2.");
  });

  it("leaves out the label when there is none", () => {
    framework = addRelationship(framework, { source: "v-screen-time", target: "v-sleep-quality", type: "direct" });
    assert.equal(describeRelationship(framework, framework.relationships[0]), "Screen time has a direct effect on sleep quality.");
  });
});

describe("describeFramework", () => {
  it("describes every variable by type and every connector", () => {
    const framework = frameworkOfShape({ independent: 2, dependent: 1, mediators: 1, moderators: 1, controls: 1 });
    const description = describeFramework(framework);
    assert.ok(description.startsWith("Conceptual framework with 6 variables and 7 relationships. Independent variables: predictor 1 and predictor 2. Dependent variables: outcome 1. Mediators: mediator 1. Moderators: moderator 1. Control variables: control 1."));
    for (const relationship of framework.relationships) assert.ok(description.includes(describeRelationship(framework, relationship)));
  });

  it("describes an empty framework, and uses singular words for one of each", () => {
    assert.equal(describeFramework(EMPTY_FRAMEWORK), "An empty conceptual framework with no variables.");
    assert.equal(describeFramework(addVariable(EMPTY_FRAMEWORK, { name: "a", type: "independent" })), "Conceptual framework with 1 variable and 0 relationships. Independent variables: a.");
  });
});
