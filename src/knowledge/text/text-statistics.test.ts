import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  READING_WORDS_PER_MINUTE,
  SPEAKING_WORDS_PER_MINUTE,
  analyseText,
  countCharacters,
  countParagraphs,
  countSentences,
  countWords,
  estimateDuration,
} from "./text-statistics";

describe("countWords", () => {
  const cases: Array<[string, string, number]> = [
    ["empty text", "", 0],
    ["only spaces", "     ", 0],
    ["only tabs and newlines", "\t\n\t\r\n  \n", 0],
    ["a simple sentence", "The quick brown fox.", 4],
    ["repeated spaces between words", "one    two     three", 3],
    ["leading and trailing space", "   padded   ", 1],
    ["tabs between words", "one\ttwo\t\tthree", 3],
    ["newlines between words", "one\ntwo\r\nthree\rfour", 4],
    ["non-breaking spaces between words", "one two three", 3],
    ["hyphenated compounds count once", "a state-of-the-art method", 3],
    ["contractions count once", "don't won't it's", 3],
    ["numbers are words", "In 2020, 3.5 per cent rose", 6],
    ["punctuation attached to words", "Hello, world! (Yes.) “Quoted”", 4],
    ["a lone dash is not a word", "before — after", 2],
    ["punctuation-only tokens are not words", "... !!! --- ***", 0],
    ["accented Latin letters", "naïve café résumé", 3],
    ["Greek and Cyrillic", "Ωmega привет мир", 3],
    ["Arabic", "مرحبا بالعالم", 2],
    ["Devanagari", "नमस्ते दुनिया", 2],
    ["emoji alone are not words", "🎉 👍🏽 👨‍👩‍👧", 0],
    ["emoji next to words", "Great work 🎉", 2],
    ["emoji attached to a word", "done✅", 1],
    ["unspaced scripts count per run (known limit)", "你好世界", 1],
  ];
  for (const [name, text, expected] of cases) {
    it(name, () => assert.equal(countWords(text), expected));
  }
});

describe("countCharacters", () => {
  it("counts nothing in empty text", () => {
    assert.deepEqual(countCharacters(""), { withSpaces: 0, withoutSpaces: 0 });
  });

  it("counts spaces only in the with-spaces total", () => {
    assert.deepEqual(countCharacters("a b c"), { withSpaces: 5, withoutSpaces: 3 });
    assert.deepEqual(countCharacters("     "), { withSpaces: 5, withoutSpaces: 0 });
  });

  it("counts tabs as spaces", () => {
    assert.deepEqual(countCharacters("a\tb"), { withSpaces: 3, withoutSpaces: 2 });
  });

  it("does not count line breaks of any kind", () => {
    assert.deepEqual(countCharacters("a\nb\r\nc\rd"), { withSpaces: 4, withoutSpaces: 4 });
    assert.deepEqual(countCharacters("\n\n\n"), { withSpaces: 0, withoutSpaces: 0 });
  });

  it("counts punctuation as characters", () => {
    assert.deepEqual(countCharacters("Hi, you!"), { withSpaces: 8, withoutSpaces: 7 });
  });

  it("counts accented letters once, whether precomposed or combined", () => {
    assert.equal(countCharacters("café").withSpaces, 4);
    assert.equal(countCharacters("café").withSpaces, 4);
  });

  it("counts each emoji as one character, including modifiers and sequences", () => {
    assert.equal(countCharacters("👍").withSpaces, 1);
    assert.equal(countCharacters("👍🏽").withSpaces, 1);
    assert.equal(countCharacters("👨‍👩‍👧").withSpaces, 1);
    assert.equal(countCharacters("🇳🇵").withSpaces, 1);
  });

  it("counts characters in other scripts", () => {
    assert.equal(countCharacters("你好").withSpaces, 2);
    assert.equal(countCharacters("नमस्ते").withoutSpaces, 3);
  });

  it("treats non-breaking spaces as spaces", () => {
    assert.deepEqual(countCharacters("a b"), { withSpaces: 3, withoutSpaces: 2 });
  });
});

describe("countCharacters agrees with full grapheme segmentation", () => {
  // An independent reference: segment everything, then classify each character.
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  function reference(text: string) {
    let withSpaces = 0;
    let withoutSpaces = 0;
    for (const { segment } of segmenter.segment(text)) {
      if (/^(?:\r\n|[\n\r\u0085\u2028\u2029])$/u.test(segment)) continue;
      withSpaces += 1;
      if (!/^\s+$/u.test(segment)) withoutSpaces += 1;
    }
    return { withSpaces, withoutSpaces };
  }

  // Pieces that stress the boundary between ASCII and other characters.
  const pieces = [
    "a", "Z", "7", " ", "\t", "\n", "\r", "\r\n", ".", "#", "-",
    "\u0301", "\u0308", "\u200d", "\ufe0f", "\u20e3", "\u00a0", "\u2009", "\u2029", "\u0085",
    "é", "ß", "ж", "你", "न", "्", "ा", "👍", "🏽", "👨", "👩", "🇳", "🇵", "—", "“", "…",
  ];

  // A small deterministic generator, so any failure is reproducible.
  let seed = 20260924;
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

  it("for 3,000 random mixed strings", () => {
    for (let run = 0; run < 3000; run += 1) {
      const length = 1 + Math.floor(next() * 24);
      const text = Array.from({ length }, () => pieces[Math.floor(next() * pieces.length)]).join("");
      assert.deepEqual(countCharacters(text), reference(text), JSON.stringify(text));
    }
  });

  it("for a keycap, a family and a flag after ASCII text", () => {
    for (const text of ["#\ufe0f\u20e3", "hi 👨\u200d👩\u200d👧!", "Nepal 🇳🇵.", "cafe\u0301 au lait"]) {
      assert.deepEqual(countCharacters(text), reference(text), JSON.stringify(text));
    }
  });
});

describe("countParagraphs", () => {
  const cases: Array<[string, string, number]> = [
    ["empty text", "", 0],
    ["only spaces", "   ", 0],
    ["a single line", "One paragraph.", 1],
    ["single line breaks separate paragraphs", "First.\nSecond.\nThird.", 3],
    ["multiple blank lines are ignored", "First.\n\n\n\nSecond.", 2],
    ["blank lines containing spaces are ignored", "First.\n   \n\t\nSecond.", 2],
    ["Windows and old Mac line breaks", "First.\r\nSecond.\rThird.", 3],
    ["leading and trailing blank lines", "\n\nOnly one.\n\n", 1],
    ["decorative separator lines are not paragraphs", "Part one.\n***\nPart two.", 2],
    ["unicode paragraph separator", "First.\u2029Second.", 2],
  ];
  for (const [name, text, expected] of cases) {
    it(name, () => assert.equal(countParagraphs(text), expected));
  }
});

describe("countSentences", () => {
  const cases: Array<[string, string, number]> = [
    ["empty text", "", 0],
    ["only spaces", "   \n  ", 0],
    ["one sentence", "This is one sentence.", 1],
    ["three sentence endings", "One. Two! Three?", 3],
    ["text without end punctuation still counts", "No full stop here", 1],
    ["a final sentence without punctuation", "First. Second without one", 2],
    ["repeated punctuation counts once", "Really?! Yes... Fine.", 3],
    ["an ellipsis character ends a sentence", "Wait… Then go.", 2],
    ["closing quotes after the full stop", "She said “yes.” He left.", 2],
    ["closing brackets after the full stop", "(This is aside.) Next one.", 2],
    ["decimals are not sentence endings", "Pi is 3.14 roughly.", 1],
    ["web addresses are not sentence endings", "See example.com for more.", 1],
    ["punctuation-only runs are not sentences", "... !!! ?", 0],
    ["each paragraph ends a sentence", "A heading\n\nBody text here.", 2],
    ["sentences across paragraphs", "One. Two.\nThree.", 3],
    ["abbreviations are counted as endings (known limit)", "Use e.g. this one.", 2],
    ["emoji do not make a sentence on their own", "🎉🎉", 0],
    ["sentences in other scripts", "Привет. Как дела?", 2],
  ];
  for (const [name, text, expected] of cases) {
    it(name, () => assert.equal(countSentences(text), expected));
  }
});

describe("estimateDuration", () => {
  it("uses the stated reading and speaking paces", () => {
    assert.equal(READING_WORDS_PER_MINUTE, 200);
    assert.equal(SPEAKING_WORDS_PER_MINUTE, 130);
  });

  it("reports nothing for no words", () => {
    assert.deepEqual(estimateDuration(0, 200), { kind: "none" });
  });

  it("reports under a minute below one minute's worth of words", () => {
    assert.deepEqual(estimateDuration(1, 200), { kind: "under-a-minute" });
    assert.deepEqual(estimateDuration(199, 200), { kind: "under-a-minute" });
    assert.deepEqual(estimateDuration(129, 130), { kind: "under-a-minute" });
  });

  it("rounds to the nearest minute from one minute upward", () => {
    assert.deepEqual(estimateDuration(200, 200), { kind: "minutes", minutes: 1 });
    assert.deepEqual(estimateDuration(299, 200), { kind: "minutes", minutes: 1 });
    assert.deepEqual(estimateDuration(300, 200), { kind: "minutes", minutes: 2 });
    assert.deepEqual(estimateDuration(1000, 200), { kind: "minutes", minutes: 5 });
    assert.deepEqual(estimateDuration(1000, 130), { kind: "minutes", minutes: 8 });
  });

  it("rejects impossible inputs", () => {
    assert.throws(() => estimateDuration(10, 0), RangeError);
    assert.throws(() => estimateDuration(10, -5), RangeError);
    assert.throws(() => estimateDuration(10, Number.NaN), RangeError);
    assert.throws(() => estimateDuration(-1, 200), RangeError);
    assert.throws(() => estimateDuration(1.5, 200), RangeError);
  });
});

describe("analyseText", () => {
  it("returns zeros for empty text", () => {
    assert.deepEqual(analyseText(""), {
      words: 0,
      charactersWithSpaces: 0,
      charactersWithoutSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: { kind: "none" },
      speakingTime: { kind: "none" },
    });
  });

  it("combines every count for a short passage", () => {
    const text = "Citation matters. It shows your sources!\n\nUse one style consistently.";
    assert.deepEqual(analyseText(text), {
      words: 10,
      charactersWithSpaces: 67,
      charactersWithoutSpaces: 59,
      sentences: 3,
      paragraphs: 2,
      readingTime: { kind: "under-a-minute" },
      speakingTime: { kind: "under-a-minute" },
    });
  });

  it("handles very long text exactly", () => {
    // 200 paragraphs of 100 six-word sentences. Expected values were computed independently.
    const paragraph = Array.from({ length: 100 }, () => "This sentence has exactly six words.").join(" ");
    const text = Array.from({ length: 200 }, () => paragraph).join("\n\n");
    assert.deepEqual(analyseText(text), {
      words: 120_000,
      charactersWithSpaces: 739_800,
      charactersWithoutSpaces: 620_000,
      sentences: 20_000,
      paragraphs: 200,
      readingTime: { kind: "minutes", minutes: 600 },
      speakingTime: { kind: "minutes", minutes: 923 },
    });
  });
});
