import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sentenceStructureAndCounting as guide } from "../../../content/guides/sentence-structure-and-counting";
import { analyseSentences, segmentSentences } from "../../knowledge/text/sentences";
import { announcement, guidance, page, resultLines, resultsText, rules } from "./copy";

describe("results wording", () => {
  const analysis = analyseSentences("Dr. Smith ran it. The result was 3.14 overall. Yes!");

  it("shows the counts in the order readers scan them", () => {
    assert.deepEqual(resultLines(analysis), [
      ["Sentences", "3"],
      ["Words", "10"],
      ["Average words per sentence", "3.3 words"],
      ["Shortest sentence", "1 word, sentence 3"],
      ["Longest sentence", "5 words, sentence 2"],
    ]);
  });

  it("shows a dash, not a misleading zero, for empty text", () => {
    assert.deepEqual(resultLines(analyseSentences("   ")), [["Sentences", "0"], ["Words", "0"], ["Average words per sentence", "—"], ["Shortest sentence", "—"], ["Longest sentence", "—"]]);
    assert.equal(announcement(analyseSentences("")), "Sentences: 0. Words: 0. Average words per sentence: None.");
  });

  it("copies every result and each sentence's words as plain text", () => {
    assert.equal(resultsText(analysis), "Sentences: 3\nWords: 10\nAverage words per sentence: 3.3 words\nShortest sentence: 1 word, sentence 3\nLongest sentence: 5 words, sentence 2\nSentence 1: 4 words\nSentence 2: 5 words\nSentence 3: 1 word");
  });

  it("lists the abbreviations the counter uses, as readers write them", () => {
    assert.match(rules.join(" "), /Dr\., Mr\., Mrs\., Ms\., Prof\., St\., e\.g\., i\.e\., cf\., vs\./);
  });

  it("never sets a sentence length as a rule", () => {
    const text = [page.intro, ...rules, ...guidance].join(" ");
    assert.match(text, /isn't a quality score/);
    assert.doesNotMatch(text, /\b\d+\s*[–-]\s*\d+ words\b|\b(?:under|fewer than|no more than) \d+ words\b/);
  });
});

describe("Sentence Structure and Counting guide", () => {
  const blocks = guide.sections.flatMap((section) => section.blocks);
  const text = blocks.map((block) => JSON.stringify(block)).join(" ");

  it("covers the whole curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-is-a-sentence", "sentence-boundaries", "sentence-structure", "clauses", "academic-sentences", "simple-sentences", "compound-sentences",
      "complex-sentences", "compound-complex-sentences", "sentence-length", "sentence-variety", "overly-long-sentences", "fragments", "run-on-sentences",
      "abbreviations", "numbers-and-decimals", "quotations", "punctuation-issues", "how-the-counter-works", "what-it-cannot-determine", "count-is-not-quality",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "sentence-structure-and-counting");
    assert.deepEqual(guide.relatedToolIds, ["sentence-counter", "paragraph-counter", "word-counter", "text-statistics"]);
  });

  it("teaches no universal sentence length", () => {
    assert.match(text, /There is no correct length for an academic sentence/);
    assert.doesNotMatch(text, /\b\d+\s*[–-]\s*\d+ words\b/);
  });

  it("shows exactly how the counter reads each example", () => {
    const table = blocks.find((block) => block.type === "table" && block.caption === "How the counter reads text");
    assert.ok(table && table.type === "table");
    for (const [example, expected] of table.rows) assert.equal(String(segmentSentences(example).length), expected, example);
  });

  it("describes punctuation problems as the counter reads them", () => {
    assert.equal(segmentSentences("The sample was small.The effect was large.").length, 1);
    assert.equal(segmentSentences("The sample was small, the effect was large.").length, 1);
    assert.equal(segmentSentences("Was it significant?.").length, 1);
  });
});
