import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readabilityInAcademicWriting as guide } from "../../../content/guides/readability-in-academic-writing";
import { READABILITY_REFERENCES, getReference } from "../../knowledge/research/references";
import { MEASURES, analyseReadability, fleschDescription } from "../../knowledge/text/readability";
import { countSyllables } from "../../knowledge/text/syllables";
import { announcement, characteristicLines, guidance, measureNote, measureValue, measures, page, resultsText } from "./copy";

const sample = "The study surveyed 120 nurses about their workload. Most reported long shifts. Many said that staffing shortages made patient care harder.";

describe("results wording", () => {
  const analysis = analyseReadability(sample);

  it("shows scores to one decimal place, and a dash where there is none", () => {
    assert.equal(measureValue(analysis.measures["flesch-reading-ease"]), "62.8");
    assert.equal(measureValue(analysis.measures.smog), "—");
  });

  it("explains a missing SMOG grade and a short text, and gives Flesch's description otherwise", () => {
    assert.equal(measureNote(analysis.measures.smog, analysis), "Needs at least 30 sentences (this text has 3).");
    assert.equal(measureNote(analysis.measures["flesch-kincaid-grade"], analysis), "Short text: interpret with caution");
    const long = analyseReadability(Array.from({ length: 12 }, () => sample).join(" "));
    assert.equal(measureNote(long.measures["flesch-reading-ease"], long), `Flesch's description: ${fleschDescription(long.measures["flesch-reading-ease"].value!)}`);
  });

  it("lists the counts behind the scores", () => {
    assert.deepEqual(characteristicLines(analysis), [
      ["Words", "21"],
      ["Sentences", "3"],
      ["Average sentence length", "7 words"],
      ["Average syllables per word", "1.62"],
      ["Average characters per word", "5.6"],
      ["Words of 3+ syllables", "2 (9.5%)"],
    ]);
  });

  it("copies every measure and count as plain text", () => {
    const text = resultsText(analysis);
    assert.match(text, /^Flesch Reading Ease: 62\.8 \(short text\)\n/);
    assert.match(text, /SMOG grade: None \(Needs at least 30 sentences \(this text has 3\)\.\)/);
    assert.match(text, /Words: 21\n/);
  });

  it("announces the main counts and scores", () => {
    assert.equal(announcement(analysis), "Words: 21. Sentences: 3. Flesch Reading Ease: 62.8. Flesch-Kincaid Grade Level: 6.2. Short text: interpret with caution.");
  });

  it("never presents a score as good or bad, or as a quality measure", () => {
    const text = [page.intro, ...guidance, ...MEASURES.flatMap((id) => Object.values(measures[id]))].join(" ");
    assert.match(text, /don't measure writing quality/);
    assert.doesNotMatch(text, /\b(?:good|bad|poor|excellent) (?:score|readability)\b/i);
  });
});

describe("Readability in Academic Writing guide", () => {
  const blocks = guide.sections.flatMap((section) => section.blocks);
  const text = blocks.map((block) => JSON.stringify(block)).join(" ");
  const table = (caption: string) => {
    const found = blocks.find((block) => block.type === "table" && block.caption.startsWith(caption));
    assert.ok(found && found.type === "table", caption);
    return found;
  };

  it("covers the whole curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-readability-means", "readability-vs-quality", "why-it-matters", "flesch-reading-ease", "flesch-kincaid", "gunning-fog", "smog", "ari",
      "syllable-counting", "sentence-length", "word-complexity", "short-text", "formula-limitations", "academic-writing", "disciplinary-differences",
      "english-only", "conflicting-scores", "using-the-checker", "misconceptions", "high-score-not-better", "low-score-not-bad",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "readability-in-academic-writing");
  });

  it("states each formula exactly as the checker uses it", () => {
    for (const id of MEASURES) assert.ok(text.includes(measures[id].formula), measures[id].name);
  });

  it("gives Flesch's descriptions with the checker's boundaries", () => {
    const rows = table("Flesch's descriptions").rows;
    for (const [range, description] of rows) {
      const [low, high] = range.split("–").map(Number);
      assert.equal(fleschDescription(low), description.toLowerCase(), range);
      assert.equal(fleschDescription(high - 0.1), description.toLowerCase(), range);
    }
  });

  it("shows the syllable counts the checker gives", () => {
    for (const [word, syllables] of table("How the checker counts syllables").rows) assert.equal(String(countSyllables(word)), syllables, word);
  });

  it("shows the scores the checker gives for its worked examples", () => {
    for (const [example, sentences, ease, grade] of table("Two 21-word texts").rows) {
      const result = analyseReadability(example);
      assert.equal(result.words, 21);
      assert.equal(result.shortText, true);
      assert.equal(String(result.sentences), sentences);
      assert.equal(String(result.measures["flesch-reading-ease"].value).replace("-", "−"), ease);
      assert.equal(String(result.measures["flesch-kincaid-grade"].value), grade);
    }
  });

  it("cites the source of every formula, each a well-formed APA reference", () => {
    const cited = blocks.flatMap((block) => (block.type === "references" ? block.ids : []));
    assert.deepEqual([...cited].sort(), READABILITY_REFERENCES.map((reference) => reference.id).sort());
    for (const reference of READABILITY_REFERENCES) {
      assert.equal(getReference(reference.id), reference);
      assert.ok(reference.apa.includes(`(${reference.year}).`), reference.id);
      assert.equal(reference.apa.split("*").length, 3, reference.id);
      assert.ok(!/\d-\d{2}/.test(reference.apa.replace("8-75", "")), `${reference.id} uses en dashes in page ranges`);
    }
  });

  it("never treats a score as a target", () => {
    assert.match(text, /There is no target|not a quality score/);
    assert.doesNotMatch(text, /should (?:score|aim for) (?:at least|above|below) \d/);
  });
});
