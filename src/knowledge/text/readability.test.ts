import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyseParagraphs } from "./paragraphs";
import {
  MEASURES,
  analyseReadability,
  automatedReadabilityIndex,
  fleschDescription,
  fleschKincaidGrade,
  fleschReadingEase,
  gunningFog,
  smogGrade,
} from "./readability";
import { analyseSentences } from "./sentences";
import { analyseText, countCharacters, countWords } from "./text-statistics";

const close = (actual: number | null, expected: number) => assert.ok(actual !== null && Math.abs(actual - expected) < 1e-9, `${actual} ≈ ${expected}`);

describe("the formulas, from counts", () => {
  // 100 words, 5 sentences, 150 syllables, 10 complex words, 470 characters; values worked by hand from each formula.
  it("Flesch Reading Ease: 206.835 − 1.015 × 20 − 84.6 × 1.5", () => close(fleschReadingEase(100, 5, 150), 59.635));
  it("Flesch-Kincaid Grade: 0.39 × 20 + 11.8 × 1.5 − 15.59", () => close(fleschKincaidGrade(100, 5, 150), 9.91));
  it("Gunning Fog: 0.4 × (20 + 10)", () => close(gunningFog(100, 5, 10), 12));
  it("SMOG: 1.0430 × √30 + 3.1291 for 30 polysyllables in 30 sentences", () => close(smogGrade(30, 30), 1.043 * Math.sqrt(30) + 3.1291));
  it("SMOG scales polysyllables to 30 sentences", () => close(smogGrade(60, 30), 1.043 * Math.sqrt(15) + 3.1291));
  it("ARI: 4.71 × 4.7 + 0.5 × 20 − 21.43", () => close(automatedReadabilityIndex(470, 100, 5), 10.707));

  it("Flesch's Reading Ease of 100 matches his anchor: fourth-grade text scores about 100", () => {
    // One-syllable words in eight-word sentences: 206.835 − 8.12 − 84.6 = 114.1, above Flesch's 0–100 range, as he noted can happen.
    close(fleschReadingEase(80, 10, 80), 206.835 - 8.12 - 84.6);
  });

  it("gives no score, never NaN or Infinity, without words or sentences", () => {
    for (const value of [fleschReadingEase(0, 0, 0), fleschReadingEase(10, 0, 12), fleschKincaidGrade(0, 1, 0), gunningFog(5, 0, 1), smogGrade(0, 0), automatedReadabilityIndex(10, 0, 0)]) {
      assert.equal(value, null);
    }
  });

  it("describes Reading Ease with Flesch's own ranges", () => {
    assert.deepEqual([0, 29.9, 30, 49.9, 50, 60, 70, 80, 90, 120].map(fleschDescription), ["very difficult", "very difficult", "difficult", "difficult", "fairly difficult", "standard", "fairly easy", "easy", "very easy", "very easy"]);
  });
});

describe("analysing text", () => {
  it("has nothing to report for empty or blank text", () => {
    for (const text of ["", "   ", "\n\n\t"]) {
      const result = analyseReadability(text);
      assert.equal(result.words, 0);
      assert.equal(result.sentences, 0);
      assert.equal(result.averageSentenceLength, null);
      assert.equal(result.averageSyllablesPerWord, null);
      assert.equal(result.shortText, false);
      for (const id of MEASURES) assert.deepEqual(result.measures[id], { id, value: null, status: "no-text" });
    }
  });

  it("calculates a one-sentence text but flags it as too short to interpret", () => {
    const result = analyseReadability("The study examined statistical methodology.");
    assert.equal(result.words, 5);
    assert.equal(result.sentences, 1);
    assert.equal(result.syllables, 1 + 2 + 3 + 4 + 5);
    assert.equal(result.polysyllables, 3);
    assert.equal(result.shortText, true);
    assert.equal(result.measures["flesch-reading-ease"].status, "short-text");
    assert.equal(result.measures["flesch-reading-ease"].value, Math.round((206.835 - 1.015 * 5 - 84.6 * 3) * 10) / 10);
    assert.deepEqual(result.measures.smog, { id: "smog", value: null, status: "too-few-sentences" });
  });

  it("handles one-word sentences", () => {
    const result = analyseReadability("Yes. No. Maybe.");
    assert.equal(result.sentences, 3);
    assert.equal(result.averageSentenceLength, 1);
    assert.ok(result.measures["flesch-kincaid-grade"].value !== null);
  });

  it("treats a long text as reliable and gives SMOG from 30 sentences", () => {
    const sentence = "Researchers analysed the statistical significance of their results carefully.";
    const text = Array.from({ length: 30 }, () => sentence).join(" ");
    const result = analyseReadability(text);
    assert.equal(result.sentences, 30);
    assert.equal(result.words, 270);
    assert.equal(result.shortText, false);
    for (const id of MEASURES) assert.equal(result.measures[id].status, "reliable", id);
    const expected = 1.043 * Math.sqrt(result.polysyllables) + 3.1291;
    assert.equal(result.measures.smog.value, Math.round(expected * 10) / 10);
  });

  it("rounds scores to one decimal place, and syllables per word to two", () => {
    const result = analyseReadability("Understanding methodology requires patience. Interpretation varies considerably across disciplines.");
    for (const id of MEASURES) {
      const value = result.measures[id].value;
      if (value !== null) assert.equal(value, Math.round(value * 10) / 10, id);
    }
    assert.equal(result.averageSyllablesPerWord, Math.round(result.averageSyllablesPerWord! * 100) / 100);
  });

  it("counts characters for ARI as the Character Counter does without spaces", () => {
    const text = "Dr. Smith's 3.14 result, e.g. this one, held.";
    assert.equal(analyseReadability(text).characters, countCharacters(text).withoutSpaces);
  });

  it("reads abbreviations, decimals, URLs, quotations and ellipses with the Sentence Counter's rules", () => {
    const text = 'Dr. Smith measured 3.14 units at https://example.com/data. "The result was significant." The pattern was unclear... however, it held.';
    assert.equal(analyseReadability(text).sentences, 3);
    assert.equal(analyseReadability(text).sentences, analyseSentences(text).count);
  });

  it("counts hyphenated words once, with each part's syllables", () => {
    const result = analyseReadability("State-of-the-art methods help.");
    assert.equal(result.words, 3);
    assert.equal(result.syllables, 4 + 2 + 1);
  });

  it("reports the longest sentence from the Sentence Counter", () => {
    const result = analyseReadability("Short. This sentence is noticeably longer than the first.");
    assert.equal(result.longestSentence?.position, 2);
    assert.equal(result.longestSentence?.words, 8);
  });

  it("produces finite numbers for long text, quickly", () => {
    const text = Array.from({ length: 500 }, (_, index) => `Paragraph ${index + 1} interprets the statistical evidence. Dr. Smith's 2.5% estimate held, e.g. in the U.K. sample.`).join("\n\n");
    const started = performance.now();
    const result = analyseReadability(text);
    assert.ok(performance.now() - started < 3000);
    for (const id of MEASURES) assert.ok(Number.isFinite(result.measures[id].value), id);
    assert.deepEqual(analyseReadability(text), result);
  });
});

describe("consistency with the other text tools", () => {
  const text = "Dr. Smith's study, e.g. the 2020 one, found 3.14 effects.\nIt continues here. Second paragraph?\n\nYes! The end.";

  it("counts the same words as the Word Counter, Paragraph Counter and Sentence Counter", () => {
    const words = analyseReadability(text).words;
    assert.equal(words, countWords(text));
    assert.equal(words, analyseText(text).words);
    assert.equal(words, analyseParagraphs(text).words);
    assert.equal(words, analyseSentences(text).words);
  });

  it("counts the same sentences as the Sentence Counter, for either paragraph rule", () => {
    assert.equal(analyseReadability(text).sentences, analyseSentences(text).count);
    assert.equal(analyseReadability(text, "line").sentences, analyseSentences(text, "line").count);
  });
});
