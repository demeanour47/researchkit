import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyseSentences, segmentSentences } from "./sentences";
import { countWords } from "./text-statistics";

const count = (text: string) => segmentSentences(text).length;
const texts = (text: string) => segmentSentences(text).map((sentence) => sentence.text);

describe("sentence boundaries", () => {
  const cases: [string, string, number][] = [
    ["one sentence", "Hello world.", 1],
    ["two sentences", "Hello world. This is another sentence.", 2],
    ["a question", "Is this correct?", 1],
    ["an exclamation", "Stop!", 1],
    ["combined marks", "Really?!", 1],
    ["three short sentences", "One. Two. Three.", 3],
    ["exclamation then question", "This is a sentence! Is this another?", 2],
    ["a title abbreviation", "Dr. Smith conducted the study.", 1],
    ["another title", "Prof. Jones presented the paper.", 1],
    ["et al. before a comma", "According to Smith et al., the result was significant.", 1],
    ["an initial", "According to J. Smith, the result was significant.", 1],
    ["several initials", "J. R. R. Tolkien wrote it.", 1],
    ["e.g. and i.e.", "Some methods, e.g. Bayesian ones, i.e. those with priors, differ.", 1],
    ["e.g. before a capital", "Use a style, e.g. APA, consistently.", 1],
    ["figure and table labels", "See Fig. 3 and Table 2. No. 4 is missing.", 2],
    ["a number label without a number is a word", "Yes. No. Maybe.", 3],
    ["a page range after pp.", "See pp. 12–14. Then stop.", 2],
    ["page abbreviations", "This is covered on pp. 12–14 of the report.", 1],
    ["vs.", "The model vs. Baseline comparison was close.", 1],
    ["initialisms", "Studies in the U.S. and the U.K. agreed.", 1],
    ["a decimal", "The result was 3.14.", 1],
    ["a percentage", "Accuracy increased by 2.5%.", 1],
    ["a version-like number", "Release 2026.01 shipped. It worked.", 2],
    ["a URL mid-sentence", "See https://example.com/path for details.", 1],
    ["a URL at the end", "See https://example.com. Then continue.", 2],
    ["a bare web address", "Visit www.example.com today.", 1],
    ["an email address", "Write to user@example.com for data. Responses vary.", 2],
    ["an ellipsis that continues", "The result was unclear... however, the pattern remained.", 1],
    ["an ellipsis character that continues", "The result was unclear… however, the pattern remained.", 1],
    ["an ellipsis before a new sentence", "The result was unclear... However, the pattern remained.", 2],
    ["a quotation ending the sentence", 'Smith stated, "The result was significant."', 1],
    ["a quotation, then another sentence", 'Smith stated, "The result was significant." Jones agreed.', 2],
    ["single quotes", "Smith stated, 'The result was significant.' Jones agreed.", 2],
    ["curly quotes", "Smith stated, “The result was significant.” Jones agreed.", 2],
    ["a quoted question inside a sentence", '"Why?" she asked.', 1],
    ["punctuation after the quotation", 'Smith called it "significant". Jones agreed.', 2],
    ["a closing bracket", "The effect held (p < .05.) Replication followed.", 2],
    ["no final punctuation", "First. Second without one", 2],
    ["a numbered list item", "1. Introduction to the study.", 1],
    ["a number ending a sentence", "The sample was 42. The next phase began.", 2],
  ];
  for (const [name, text, expected] of cases) it(name, () => assert.equal(count(text), expected, JSON.stringify(texts(text))));

  it("keeps each sentence as written", () => {
    assert.deepEqual(texts("Dr. Smith ran it. Results varied?! Yes."), ["Dr. Smith ran it.", "Results varied?!", "Yes."]);
  });
});

describe("paragraphs and line breaks", () => {
  it("keeps a sentence whole across a single line break", () => {
    assert.deepEqual(texts("First sentence\ncontinues here. Second sentence."), ["First sentence continues here.", "Second sentence."]);
  });

  it("ends every sentence at a paragraph break", () => {
    assert.deepEqual(texts("A heading\n\nBody text here. More."), ["A heading", "Body text here.", "More."]);
  });

  it("can end paragraphs, and so sentences, at every line break", () => {
    assert.equal(segmentSentences("Introduction\nThe study began.", "line").length, 2);
    assert.equal(segmentSentences("Introduction\nThe study began.").length, 1);
  });

  it("notices a line without end punctuation joined to the next, as a heading would be", () => {
    assert.equal(analyseSentences("Introduction\nThe study began.").joinedUnpunctuatedLine, true);
    assert.equal(analyseSentences("First sentence ends.\nSecond one.").joinedUnpunctuatedLine, false);
    assert.equal(analyseSentences("Introduction\nThe study began.", "line").joinedUnpunctuatedLine, false);
    assert.equal(analyseSentences("Introduction\n\nThe study began.").joinedUnpunctuatedLine, false);
  });

  it("numbers paragraphs and reads CRLF like LF", () => {
    const lf = segmentSentences("One. Two.\n\nThree.");
    assert.deepEqual(lf.map((sentence) => sentence.paragraph), [1, 1, 2]);
    assert.deepEqual(segmentSentences("One. Two.\r\n\r\nThree."), lf);
  });

  it("finds nothing in empty, blank or punctuation-only text", () => {
    for (const text of ["", "   ", "\n\n", "... !!! ?", "***"]) {
      const result = analyseSentences(text);
      assert.equal(result.count, 0, JSON.stringify(text));
      assert.equal(result.words, 0);
      assert.equal(result.averageWords, null);
      assert.equal(result.shortest, null);
      assert.equal(result.longest, null);
    }
  });
});

describe("sentence statistics", () => {
  const text = "Short one. This sentence has exactly six words. Tiny.\n\nThe final sentence of this example text has ten words.";
  const result = analyseSentences(text);

  it("counts each sentence's words with the Word Counter's rule, adding up to its total", () => {
    assert.deepEqual(result.sentences.map((sentence) => sentence.words), [2, 6, 1, 10]);
    assert.equal(result.words, countWords(text));
    assert.equal(result.words, 19);
  });

  it("gives the count, average, shortest and longest", () => {
    assert.equal(result.count, 4);
    assert.equal(result.averageWords, 4.8);
    assert.deepEqual(result.shortest && [result.shortest.position, result.shortest.words], [3, 1]);
    assert.deepEqual(result.longest && [result.longest.position, result.longest.words], [4, 10]);
    assert.equal(result.paragraphs, 2);
  });

  it("reports the first sentence when lengths tie", () => {
    const tied = analyseSentences("One two. Three four. Five six seven. Eight nine ten.");
    assert.equal(tied.shortest?.position, 1);
    assert.equal(tied.longest?.position, 3);
  });

  it("is deterministic and fast on long text", () => {
    const paragraph = "Dr. Smith measured 3.14 units, e.g. in the U.K. sample. The result was unclear... however, it held! Was it significant? Yes.";
    const long = Array.from({ length: 1500 }, () => paragraph).join("\n\n");
    const started = performance.now();
    const first = analyseSentences(long);
    const elapsed = performance.now() - started;
    assert.equal(first.count, 6000);
    assert.equal(first.words, countWords(long));
    assert.deepEqual(analyseSentences(long), first);
    assert.ok(elapsed < 2000, `${elapsed} ms`);
  });
});
