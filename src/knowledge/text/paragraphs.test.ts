import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyseParagraphs } from "./paragraphs";
import { countParagraphs, countWords } from "./text-statistics";

const count = (text: string) => analyseParagraphs(text).count;

describe("counting paragraphs between blank lines", () => {
  it("finds none in empty or blank text", () => {
    for (const text of ["", "   ", "\n\n\n", " \t \r\n  \n"]) {
      const result = analyseParagraphs(text);
      assert.equal(result.count, 0, JSON.stringify(text));
      assert.equal(result.words, 0);
      assert.equal(result.averageWords, null);
      assert.equal(result.shortest, null);
      assert.equal(result.longest, null);
      assert.equal(result.ignored, 0);
    }
  });

  it("counts a single paragraph", () => {
    assert.equal(count("Hello world."), 1);
  });

  it("counts paragraphs separated by one or several blank lines", () => {
    assert.equal(count("First paragraph.\n\nSecond paragraph."), 2);
    assert.equal(count("First.\n\n\nSecond."), 2);
    assert.equal(count("First.\n\n\n\n\nSecond.\n\nThird."), 3);
  });

  it("keeps lines with single line breaks in one paragraph", () => {
    const result = analyseParagraphs("First line\nsecond line\nthird line.");
    assert.equal(result.count, 1);
    assert.equal(result.paragraphs[0].lines, 3);
    assert.equal(result.paragraphs[0].words, 6);
  });

  it("reads CRLF, LF, CR and Unicode separators the same way", () => {
    const expected = analyseParagraphs("One two.\nThree.\n\nFour five six.");
    for (const text of ["One two.\r\nThree.\r\n\r\nFour five six.", "One two.\rThree.\r\rFour five six.", "One two. Three.  Four five six.", "One two.\r\nThree.\n\r\nFour five six."]) {
      assert.deepEqual(analyseParagraphs(text), expected, JSON.stringify(text));
    }
  });

  it("treats whitespace-only lines as blank, and ignores leading and trailing whitespace", () => {
    assert.equal(count("  \n\n   First.\n \t \nSecond.   \n\n\n  "), 2);
    assert.equal(count("\n\n\nOnly one.\n\n\n"), 1);
  });

  it("doesn't count blocks without letters or numbers, and reports them", () => {
    const result = analyseParagraphs("Before the break.\n\n***\n\nAfter the break.\n\n— —");
    assert.equal(result.count, 2);
    assert.equal(result.ignored, 2);
    assert.deepEqual(result.paragraphs.map((paragraph) => paragraph.position), [1, 2]);
  });

  it("notices text with line breaks but no blank lines", () => {
    assert.equal(analyseParagraphs("Paragraph one.\nParagraph two.\nParagraph three.").lineBreaksWithoutBlankLines, true);
    assert.equal(analyseParagraphs("One paragraph.").lineBreaksWithoutBlankLines, false);
    assert.equal(analyseParagraphs("One\ntwo.\n\nThree.").lineBreaksWithoutBlankLines, false);
    assert.equal(analyseParagraphs("Paragraph one.\nParagraph two.", "line").lineBreaksWithoutBlankLines, false);
  });
});

describe("counting every line as a paragraph", () => {
  it("matches the Word Counter's paragraph rule", () => {
    for (const text of ["Paragraph one.\nParagraph two.\n\nParagraph three.", "One.\r\n***\r\nTwo.", "", "  \n "]) {
      assert.equal(analyseParagraphs(text, "line").count, countParagraphs(text), JSON.stringify(text));
    }
  });

  it("counts lines without letters as ignored", () => {
    const result = analyseParagraphs("One.\n***\nTwo.\n\n", "line");
    assert.equal(result.count, 2);
    assert.equal(result.ignored, 1);
  });
});

describe("paragraph statistics", () => {
  const text = "One two three.\n\nOne two three four five six seven.\n\nOne two.\n\nOne two three four five six seven eight nine ten.";
  const result = analyseParagraphs(text);

  it("gives each paragraph's words, which add up to the Word Counter's total", () => {
    assert.deepEqual(result.paragraphs.map((paragraph) => paragraph.words), [3, 7, 2, 10]);
    assert.equal(result.words, 22);
    assert.equal(result.words, countWords(text));
  });

  it("averages words per paragraph to one decimal place", () => {
    assert.equal(result.averageWords, 5.5);
    assert.equal(analyseParagraphs("One two.\n\nOne two three.\n\nOne two three.").averageWords, 2.7);
  });

  it("finds the shortest and longest paragraphs, the first when they tie", () => {
    assert.deepEqual(result.shortest && [result.shortest.position, result.shortest.words], [3, 2]);
    assert.deepEqual(result.longest && [result.longest.position, result.longest.words], [4, 10]);
    const tied = analyseParagraphs("Two words.\n\nTwo more.\n\nThree words here.\n\nAgain three here.");
    assert.equal(tied.shortest?.position, 1);
    assert.equal(tied.longest?.position, 3);
  });

  it("identifies each paragraph by its first words", () => {
    const long = analyseParagraphs("The first eight words of this paragraph identify it in the list.\n\nShort one.");
    assert.equal(long.paragraphs[0].opening, "The first eight words of this paragraph identify…");
    assert.equal(long.paragraphs[1].opening, "Short one.");
  });

  it("uses the Word Counter's word rule inside paragraphs", () => {
    const words = analyseParagraphs("State-of-the-art — don't count 2020 as two.\n\n— —\n\n😀 alone");
    assert.deepEqual(words.paragraphs.map((paragraph) => paragraph.words), [6, 1]);
  });

  it("is deterministic and fast on long text", () => {
    const paragraph = "Academic writing develops one idea in each paragraph and supports it with evidence. ".repeat(12).trim();
    const long = Array.from({ length: 2000 }, (_, index) => `${index + 1}. ${paragraph}`).join("\n\n");
    const started = performance.now();
    const first = analyseParagraphs(long);
    const elapsed = performance.now() - started;
    assert.equal(first.count, 2000);
    assert.equal(first.words, countWords(long));
    assert.deepEqual(analyseParagraphs(long), first);
    assert.ok(elapsed < 2000, `${elapsed} ms`);
  });
});
