import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countSyllables } from "./syllables";

// Expected counts are the standard dictionary syllabification of each word.
const expect = (cases: readonly [string, number][]) => {
  for (const [word, syllables] of cases) assert.equal(countSyllables(word), syllables, word);
};

describe("syllable counting", () => {
  it("counts common academic words", () => {
    expect([
      ["research", 2], ["methodology", 5], ["statistical", 4], ["analysis", 4], ["university", 5], ["information", 4],
      ["significant", 4], ["development", 4], ["study", 2], ["results", 2], ["data", 2], ["evidence", 3], ["participants", 4],
      ["hypothesis", 4], ["variable", 4], ["individual", 5], ["biology", 4], ["medium", 3], ["continuous", 4], ["video", 3],
      ["theory", 3], ["experiment", 4], ["conclusion", 3], ["interpretation", 5], ["literature", 4], ["qualitative", 4],
    ]);
  });

  it("keeps vowel pairs together where they make one sound", () => {
    expect([["social", 2], ["initial", 3], ["nation", 2], ["region", 2], ["vision", 2], ["quality", 3], ["people", 2], ["special", 2]]);
  });

  it("handles silent and sounded endings", () => {
    expect([
      ["since", 1], ["while", 1], ["table", 2], ["simple", 2], ["makes", 1], ["uses", 2], ["cases", 2], ["changes", 2], ["places", 2],
      ["studies", 2], ["used", 1], ["jumped", 1], ["wanted", 2], ["needed", 2], ["lately", 2], ["statement", 2], ["useful", 2],
      ["management", 3], ["completely", 3],
    ]);
  });

  it("treats a leading y as a consonant", () => {
    expect([["year", 1], ["young", 1], ["yesterday", 3]]);
  });

  it("counts a vowel before -ing as its own syllable", () => {
    expect([["being", 2], ["going", 2], ["studying", 3], ["making", 2], ["writing", 2]]);
  });

  it("counts very short words as one syllable", () => {
    expect([["a", 1], ["I", 1], ["the", 1], ["be", 1], ["we", 1], ["of", 1], ["by", 1], ["my", 1]]);
  });

  it("ignores punctuation, case and accents", () => {
    expect([["Results,", 2], ["(analysis)", 4], ["“study”", 2], ["don't", 1], ["café", 1], ["naïve", 2]]);
  });

  it("counts each part of a hyphenated word", () => {
    expect([["well-being", 3], ["state-of-the-art", 4], ["long-term", 2], ["self-report", 3]]);
  });

  it("counts numbers, symbols and letter abbreviations as one syllable", () => {
    expect([["2020", 1], ["3.14", 1], ["%", 1], ["e.g.", 1], ["U.S.", 1]]);
  });

  it("counts a web or email address as one syllable rather than reading its letters", () => {
    expect([["https://example.org/averyverylongpathsegment", 1], ["(https://doi.org/10.1037/h0057532).", 1], ["www.example.com", 1], ["user@example.com", 1]]);
  });

  it("documents words the heuristic gets wrong", () => {
    // "create" is cre-ate (2) and "area" is ar-e-a (3); "ea" is usually one sound, so both are undercounted.
    assert.equal(countSyllables("create"), 1);
    assert.equal(countSyllables("area"), 2);
  });
});
