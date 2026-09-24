import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PLACEHOLDERS, buildDraftQuestion, contextPhrase, suggestQuestionTypes } from "./question-builder";
import { QUESTION_TYPE_IDS, detectQuestionTypes } from "./question-types";
import { createProjectDraft } from "./research-project";

const project = createProjectDraft({
  topic: "sleep and academic performance",
  population: "first-year university students",
  location: "Nepal",
  timeContext: "2025",
  independentVariables: ["screen time"],
  dependentVariables: ["sleep quality"],
});

describe("buildDraftQuestion", () => {
  const expected: Record<string, string> = {
    descriptive: "What is the level of sleep quality among first-year university students in Nepal in 2025?",
    comparative: "How does sleep quality differ by screen time among first-year university students in Nepal in 2025?",
    relational: "What is the relationship between screen time and sleep quality among first-year university students in Nepal in 2025?",
    correlational: "To what extent is screen time associated with sleep quality among first-year university students in Nepal in 2025?",
    explanatory: "How and why does screen time influence sleep quality among first-year university students in Nepal in 2025?",
    exploratory: "How do first-year university students experience sleep and academic performance in Nepal in 2025?",
    predictive: "To what extent does screen time predict sleep quality among first-year university students in Nepal in 2025?",
    qualitative: "How do first-year university students describe their experiences of sleep and academic performance in Nepal in 2025?",
    quantitative: "How much does sleep quality vary with screen time among first-year university students in Nepal in 2025?",
    "mixed-methods":
      "To what extent is screen time associated with sleep quality among first-year university students in Nepal in 2025, and how do they experience sleep and academic performance?",
  };

  for (const type of QUESTION_TYPE_IDS) {
    it(`drafts a ${type} question from the project's own words`, () => {
      const draft = buildDraftQuestion(type, project);
      assert.equal(draft.text, expected[type]);
      assert.deepEqual(draft.placeholders, []);
    });

    it(`drafts a ${type} question whose wording is recognised as that type`, () => {
      const types = detectQuestionTypes(buildDraftQuestion(type, project).text).map((detection) => detection.type);
      assert.ok(types.includes(type), `${type}: ${types.join(", ")}`);
    });
  }

  it("shows placeholders instead of inventing missing information", () => {
    const draft = buildDraftQuestion("relational", {});
    assert.equal(draft.text, "What is the relationship between [independent variable] and [dependent variable] among [population]?");
    assert.deepEqual(draft.placeholders, ["independentVariable", "dependentVariable", "population"]);
    assert.match(draft.explanation, /The parts in square brackets are missing from your project details\./);
  });

  it("uses no words except the project's own and the type's fixed structure", () => {
    const draft = buildDraftQuestion("exploratory", createProjectDraft({ population: "carers" }));
    assert.equal(draft.text, `How do carers experience ${PLACEHOLDERS.topic}?`);
  });

  it("joins several variables and adjusts the verb", () => {
    const several = createProjectDraft({ ...project, independentVariables: ["screen time", "caffeine", "stress"] });
    assert.equal(
      buildDraftQuestion("correlational", several).text,
      "To what extent are screen time, caffeine and stress associated with sleep quality among first-year university students in Nepal in 2025?",
    );
    assert.equal(
      buildDraftQuestion("predictive", several).text,
      "To what extent do screen time, caffeine and stress predict sleep quality among first-year university students in Nepal in 2025?",
    );
  });

  it("uses the topic for a descriptive question without an outcome", () => {
    assert.equal(
      buildDraftQuestion("descriptive", createProjectDraft({ topic: "volunteering", population: "retired teachers" })).text,
      "What characterises volunteering among retired teachers?",
    );
  });

  it("removes end punctuation from entered details", () => {
    assert.equal(
      buildDraftQuestion("exploratory", createProjectDraft({ topic: "night shifts.", population: "nurses?" })).text,
      "How do nurses experience night shifts?",
    );
  });

  it("always explains that the draft is only a starting point", () => {
    for (const type of QUESTION_TYPE_IDS) {
      assert.match(buildDraftQuestion(type, project).explanation, /It is a starting point: rewrite it in your own words/);
    }
  });
});

describe("contextPhrase", () => {
  it("adds “in” unless the phrase already starts with a preposition", () => {
    assert.equal(contextPhrase("Nepal"), " in Nepal");
    assert.equal(contextPhrase("during the 2025 academic year"), " during the 2025 academic year");
    assert.equal(contextPhrase("at three London hospitals."), " at three London hospitals");
    assert.equal(contextPhrase(""), "");
    assert.equal(contextPhrase(undefined), "");
  });
});

describe("suggestQuestionTypes", () => {
  it("suggests types from the aim's wording, explaining which word suggested them", () => {
    const suggestions = suggestQuestionTypes(createProjectDraft({ researchAim: "To compare stress levels between two wards" }));
    assert.deepEqual(suggestions, [
      { type: "descriptive", reason: "Your aim uses the word “levels”, which suggests a question that sets out to describe or measure something." },
      { type: "comparative", reason: "Your aim uses the word “compare”, which suggests a question that sets out to compare groups, places or times." },
    ]);
  });

  it("suggests relational and explanatory types when both variables are named", () => {
    assert.deepEqual(suggestQuestionTypes(project).map((suggestion) => suggestion.type), ["relational", "explanatory"]);
  });

  it("suggests a descriptive type when only an outcome is named", () => {
    assert.deepEqual(suggestQuestionTypes(createProjectDraft({ dependentVariables: ["stress"] })).map((suggestion) => suggestion.type), ["descriptive"]);
  });

  it("adapts to the research onion and methodology", () => {
    assert.deepEqual(
      suggestQuestionTypes(createProjectDraft({ researchOnionSelection: { philosophy: "interpretivism" } })).map((suggestion) => suggestion.type),
      ["exploratory", "qualitative"],
    );
    assert.deepEqual(suggestQuestionTypes(createProjectDraft({ researchOnionSelection: { philosophy: "positivism" } })).map((suggestion) => suggestion.type), ["quantitative"]);
    assert.deepEqual(suggestQuestionTypes(createProjectDraft({ methodology: "mixed-methods" })).map((suggestion) => suggestion.type), ["mixed-methods"]);
  });

  it("suggests nothing when there is nothing to go on", () => {
    assert.deepEqual(suggestQuestionTypes({}), []);
  });
});
