import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paragraphStructureAndCounting as guide } from "../../../content/guides/paragraph-structure-and-counting";
import { analyseParagraphs } from "../../knowledge/text/paragraphs";
import { announcement, describeRecord, guidance, page, resultLines, results, resultsText, rules } from "./copy";

const sample = "Small samples limit power.\nThis line wraps by hand.\n\nA second, longer paragraph develops the point with evidence and analysis.\n\n\n***\n\nShort close.";

describe("results wording", () => {
  const analysis = analyseParagraphs(sample);

  it("shows the counts in the order readers scan them", () => {
    assert.deepEqual(resultLines(analysis), [
      ["Paragraphs", "3"],
      ["Words", "22"],
      ["Average words per paragraph", "7.3 words"],
      ["Shortest paragraph", "2 words, paragraph 3"],
      ["Longest paragraph", "11 words, paragraph 2"],
    ]);
  });

  it("shows “None”, not a misleading zero, where there is nothing to measure", () => {
    assert.deepEqual(resultLines(analyseParagraphs("   ")).slice(2), [["Average words per paragraph", "None"], ["Shortest paragraph", "None"], ["Longest paragraph", "None"]]);
  });

  it("copies every result and each paragraph's words as plain text", () => {
    assert.equal(resultsText(analysis), "Paragraphs: 3\nWords: 22\nAverage words per paragraph: 7.3 words\nShortest paragraph: 2 words, paragraph 3\nLongest paragraph: 11 words, paragraph 2\nParagraph 1: 9 words\nParagraph 2: 11 words\nParagraph 3: 2 words");
  });

  it("announces the main counts", () => {
    assert.equal(announcement(analysis), "Paragraphs: 3. Words: 22. Average words per paragraph: 7.3 words.");
    assert.equal(describeRecord({ position: 1, words: 1, opening: "One", lines: 1 }), "1 word, paragraph 1");
  });

  it("reports ignored blocks in words", () => {
    assert.equal(results.ignored(analysis.ignored), "1 block has no letters or numbers, such as *** or ---, and isn't counted.");
  });
});

describe("wording", () => {
  it("never sets a paragraph length as a rule", () => {
    const text = [page.intro, ...rules, ...guidance].join(" ");
    assert.match(text, /not a quality score/);
    assert.doesNotMatch(text, /\b(?:must|should) (?:contain|have) \d+/);
    assert.doesNotMatch(text, /\b\d+\s*[–-]\s*\d+ words\b/);
  });
});

describe("Paragraph Structure and Counting guide", () => {
  const text = guide.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");

  it("covers the whole curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-is-a-paragraph", "academic-structure", "topic-sentence", "supporting-evidence", "analysis", "closing-and-transition", "how-paragraphs-are-counted",
      "why-blank-lines-matter", "paragraph-length", "very-short-paragraphs", "very-long-paragraphs", "coherence", "unity", "transitions", "common-problems",
      "using-the-counter", "what-the-tool-cannot-determine", "count-is-not-quality",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "paragraph-structure-and-counting");
    assert.deepEqual(guide.relatedToolIds, ["paragraph-counter", "word-counter", "text-statistics"]);
  });

  it("teaches no universal paragraph length", () => {
    assert.match(text, /There is no correct length for an academic paragraph/);
    assert.doesNotMatch(text, /\b\d+\s*[–-]\s*\d+ words\b|\b\d+ words (?:long|per paragraph)\b/);
  });

  it("shows exactly how the counter reads each example", () => {
    const table = guide.sections.flatMap((section) => section.blocks).find((block) => block.type === "table" && block.caption.startsWith("How the counter reads text"));
    assert.ok(table && table.type === "table");
    const examples = ["First paragraph.\n\nSecond paragraph.", "First.\n\n\n\nSecond.", "A first line\ncontinues on a second line.", "Before the break.\n\n***\n\nAfter the break.", "   \n\n  \n"];
    assert.deepEqual(table.rows.map((row) => row[1]), examples.map((example) => String(analyseParagraphs(example).count)));
  });
});
