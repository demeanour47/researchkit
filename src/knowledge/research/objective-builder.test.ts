import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDraftGeneralObjective, suggestSpecificObjectiveOutlines } from "./objective-builder";
import { OBJECTIVE_VERB_CATEGORY_IDS, getVerbCategory } from "./objective-verbs";
import { createProjectDraft } from "./research-project";

const project = createProjectDraft({
  topic: "sleep and academic performance",
  population: "first-year university students",
  location: "Nepal",
  timeContext: "2025",
  independentVariables: ["screen time"],
  dependentVariables: ["sleep quality"],
});

describe("buildDraftGeneralObjective", () => {
  const expected: Record<string, string> = {
    descriptive: "To describe sleep quality among first-year university students in Nepal in 2025.",
    comparative: "To compare sleep quality by screen time among first-year university students in Nepal in 2025.",
    relational: "To examine the relationship between screen time and sleep quality among first-year university students in Nepal in 2025.",
    correlational: "To examine the association between screen time and sleep quality among first-year university students in Nepal in 2025.",
    explanatory: "To examine how screen time influences sleep quality among first-year university students in Nepal in 2025.",
    predictive: "To examine whether screen time predicts sleep quality among first-year university students in Nepal in 2025.",
    exploratory: "To explore how first-year university students experience sleep and academic performance in Nepal in 2025.",
  };
  const verbFor: Record<string, string> = {
    descriptive: "describe",
    comparative: "compare",
    relational: "examine",
    correlational: "examine",
    explanatory: "examine",
    predictive: "examine",
    exploratory: "explore",
  };

  for (const category of OBJECTIVE_VERB_CATEGORY_IDS) {
    it(`drafts a ${category} objective from the project's own words`, () => {
      const draft = buildDraftGeneralObjective(category, verbFor[category], project, getVerbCategory(category).name);
      assert.equal(draft.text, expected[category]);
      assert.deepEqual(draft.placeholders, []);
    });
  }

  it("shows placeholders instead of inventing missing information", () => {
    const draft = buildDraftGeneralObjective("relational", "examine", {}, "Relational");
    assert.equal(draft.text, "To examine the relationship between [independent variable] and [dependent variable] among [population].");
    assert.deepEqual(draft.placeholders, ["independentVariable", "dependentVariable", "population"]);
    assert.match(draft.explanation, /The parts in square brackets are missing from your project details\./);
  });

  it("does not list a placeholder that isn't used by this category's sentence", () => {
    const draft = buildDraftGeneralObjective("descriptive", "describe", createProjectDraft({ dependentVariables: ["stress"] }), "Descriptive");
    assert.equal(draft.text, "To describe stress among [population].");
    assert.deepEqual(draft.placeholders, ["population"]);
  });

  it("defaults to “examine” when no verb is given", () => {
    assert.match(buildDraftGeneralObjective("relational", "", {}, "Relational").text, /^To examine /);
  });

  it("lower-cases and trims the verb", () => {
    assert.match(buildDraftGeneralObjective("descriptive", "  Describe  ", {}, "Descriptive").text, /^To describe /);
  });

  it("uses the topic for a descriptive objective without an outcome", () => {
    assert.equal(
      buildDraftGeneralObjective("descriptive", "describe", createProjectDraft({ topic: "volunteering", population: "retired teachers" }), "Descriptive").text,
      "To describe the characteristics of volunteering among retired teachers.",
    );
  });

  it("removes end punctuation from entered details", () => {
    assert.equal(
      buildDraftGeneralObjective("exploratory", "explore", createProjectDraft({ topic: "night shifts.", population: "nurses?" }), "Exploratory").text,
      "To explore how nurses experience night shifts.",
    );
  });

  it("joins several variables and adjusts the verb", () => {
    const several = createProjectDraft({ ...project, independentVariables: ["screen time", "caffeine", "stress"] });
    assert.equal(
      buildDraftGeneralObjective("explanatory", "examine", several, "Explanatory").text,
      "To examine how screen time, caffeine and stress influence sleep quality among first-year university students in Nepal in 2025.",
    );
  });

  it("always explains that the draft is only a starting point", () => {
    for (const category of OBJECTIVE_VERB_CATEGORY_IDS) {
      assert.match(buildDraftGeneralObjective(category, verbFor[category], project, getVerbCategory(category).name).explanation, /It is a starting point: rewrite it in your own words\./);
    }
  });
});

describe("suggestSpecificObjectiveOutlines", () => {
  it("suggests outlines that name the independent and dependent variables for a relational objective", () => {
    const outlines = suggestSpecificObjectiveOutlines("relational", "examine", project, "Relational");
    assert.deepEqual(
      outlines.map((outline) => outline.text),
      [
        "To identify the level of screen time among first-year university students in Nepal in 2025.",
        "To identify the level of sleep quality among first-year university students in Nepal in 2025.",
        "To examine the relationship between screen time and sleep quality among first-year university students in Nepal in 2025.",
      ],
    );
  });

  it("suggests outlines without variables for an exploratory objective", () => {
    const outlines = suggestSpecificObjectiveOutlines("exploratory", "explore", project, "Exploratory");
    assert.deepEqual(
      outlines.map((outline) => outline.text),
      [
        "To identify how first-year university students describe sleep and academic performance in Nepal in 2025.",
        "To explore the factors that shape sleep and academic performance among first-year university students in Nepal in 2025.",
      ],
    );
  });

  it("suggests outlines for a descriptive objective", () => {
    const outlines = suggestSpecificObjectiveOutlines("descriptive", "describe", project, "Descriptive");
    assert.deepEqual(
      outlines.map((outline) => outline.text),
      [
        "To identify the characteristics of first-year university students in Nepal in 2025.",
        "To describe sleep quality among first-year university students in Nepal in 2025.",
      ],
    );
  });

  it("every outline explains it is a starting point", () => {
    for (const outline of suggestSpecificObjectiveOutlines("comparative", "compare", project, "Comparative")) {
      assert.match(outline.explanation, /It is a starting point: rewrite it in your own words\./);
    }
  });
});
