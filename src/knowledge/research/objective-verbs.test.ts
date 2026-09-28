import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OBJECTIVE_VERB_CATEGORIES, OBJECTIVE_VERB_CATEGORY_IDS, RESEARCH_ACTION_VERBS, getVerbCategory, suggestVerbCategories } from "./objective-verbs";

describe("OBJECTIVE_VERB_CATEGORIES", () => {
  it("has one entry, with at least one verb, for every category id", () => {
    for (const id of OBJECTIVE_VERB_CATEGORY_IDS) {
      const category = getVerbCategory(id);
      assert.equal(category.id, id);
      assert.ok(category.verbs.length > 0, id);
      assert.ok(category.guidance.length > 0, id);
    }
  });

  it("throws for an unknown category", () => {
    assert.throws(() => getVerbCategory("unknown" as never), RangeError);
  });
});

describe("RESEARCH_ACTION_VERBS", () => {
  it("lists every verb from every category, without repeats", () => {
    const fromCategories = new Set(OBJECTIVE_VERB_CATEGORIES.flatMap((category) => category.verbs));
    assert.deepEqual(new Set(RESEARCH_ACTION_VERBS), fromCategories);
    assert.equal(RESEARCH_ACTION_VERBS.length, new Set(RESEARCH_ACTION_VERBS).size);
  });
});

describe("suggestVerbCategories", () => {
  it("suggests categories from the question's wording, explaining which words suggested them", () => {
    const suggestions = suggestVerbCategories("What is the relationship between screen time and sleep quality among teenagers?");
    assert.deepEqual(suggestions, [{ category: "relational", reason: 'The wording “relationship between” is typical of a relational question.' }]);
  });

  it("suggests nothing for an empty question", () => {
    assert.deepEqual(suggestVerbCategories(""), []);
    assert.deepEqual(suggestVerbCategories(undefined), []);
  });

  it("suggests more than one category when the wording matches more than one", () => {
    const suggestions = suggestVerbCategories("How does peer mentoring influence retention among first-year students, and how do they differ by faculty?");
    assert.deepEqual(
      suggestions.map((suggestion) => suggestion.category),
      ["comparative", "explanatory"],
    );
  });

  it("only suggests categories that have a matching objective verb category", () => {
    // A predictive question has no equivalent in the exploratory/qualitative "approach" dimension,
    // so this simply checks predictive itself is reachable through suggestVerbCategories.
    const suggestions = suggestVerbCategories("To what extent do first-year grades predict final degree classification?");
    assert.deepEqual(suggestions, [{ category: "predictive", reason: 'The wording “predict” is typical of a predictive question.' }]);
  });
});
