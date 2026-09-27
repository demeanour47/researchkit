import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { captionAlign, captionLines, footnotes, italicSymbols, noteLetter, noteParagraphs, probabilityRuns, runsText, tableLabel } from "./caption";
import { MINUS, formatCount, formatNumber, formatPValue, formatPercent, plainMinus, roman, starLevel, stars } from "./format";
import { FONT_FAMILIES, TABLE_STYLE_LABELS, TABLE_STYLE_SPECS, applyTableStyle, styleSpec } from "./styles";
import { DEFAULT_TABLE_OPTIONS, TABLE_FONTS, TABLE_STYLES, type ResearchTable, type TableOptions } from "./types";

const options = (changes: Partial<TableOptions> = {}): TableOptions => ({ ...DEFAULT_TABLE_OPTIONS, ...changes });
const table = (changes: Partial<ResearchTable> = {}): ResearchTable => ({ type: "custom", title: "Descriptive Statistics", header: [[{ text: "A" }]], rows: [], columns: 1, rowHeaders: true, notes: { general: [], specific: [], probability: [] }, ...changes });

describe("formatNumber", () => {
  const cases: [number, number, boolean, boolean, string][] = [
    [2.456, 2, false, false, "2.46"],
    [-0.52, 2, false, false, `${MINUS}0.52`],
    [0.48, 2, true, true, ".48"],
    [-0.48, 2, true, true, `${MINUS}.48`],
    [0.48, 2, true, false, "0.48"],
    [0.48, 2, false, true, "0.48"],
    [3, 0, false, false, "3"],
    [1.5, 3, false, false, "1.500"],
    [-0.001, 2, false, false, "0.00"],
  ];
  for (const [value, decimals, bounded, drop, expected] of cases)
    it(`formats ${value} to ${decimals} decimals${bounded ? ", bounded" : ""}${drop ? ", dropping the zero" : ""} as ${expected}`, () => {
      assert.equal(formatNumber(value, decimals, { bounded, dropLeadingZero: drop }), expected);
    });
  it("leaves non-numbers blank", () => {
    assert.equal(formatNumber(Number.NaN, 2), "");
    assert.equal(formatNumber(Infinity, 2), "");
  });
  it("keeps decimals between 0 and 6", () => {
    assert.equal(formatNumber(1.23456789, 10), "1.234568");
  });
});

describe("counts, percentages and p-values", () => {
  it("groups thousands", () => {
    assert.equal(formatCount(1204), "1,204");
    assert.equal(formatCount(1234567), "1,234,567");
    assert.equal(formatCount(12), "12");
  });
  it("formats percentages with one decimal", () => {
    assert.equal(formatPercent(66.666), "66.7");
    assert.equal(formatPercent(100), "100.0");
  });
  const pCases: [number, boolean, string][] = [
    [0.0325, true, ".033"],
    [0.0004, true, "< .001"],
    [0.9995, true, "> .999"],
    [0.0325, false, "0.033"],
    [0.0004, false, "< 0.001"],
    [0.05, true, ".050"],
  ];
  for (const [p, drop, expected] of pCases)
    it(`formats p = ${p} as ${expected}`, () => {
      assert.equal(formatPValue(p, drop), expected);
    });
  it("leaves a missing p blank", () => {
    assert.equal(formatPValue(Number.NaN, true), "");
  });
});

describe("stars", () => {
  const cases: [number, string][] = [
    [0.0004, "***"],
    [0.001, "**"],
    [0.009, "**"],
    [0.01, "*"],
    [0.049, "*"],
    [0.05, ""],
    [0.3, ""],
  ];
  for (const [p, expected] of cases)
    it(`marks p = ${p} with “${expected}”`, () => {
      assert.equal(stars(p), expected);
    });
  it("maps marks back to levels", () => {
    assert.deepEqual(["*", "**", "***", ""].map(starLevel), [0.05, 0.01, 0.001, null]);
  });
});

describe("roman numerals and minus signs", () => {
  const cases: [number, string][] = [
    [1, "I"],
    [4, "IV"],
    [9, "IX"],
    [14, "XIV"],
    [40, "XL"],
    [90, "XC"],
    [2024, "MMXXIV"],
  ];
  for (const [value, expected] of cases)
    it(`writes ${value} as ${expected}`, () => {
      assert.equal(roman(value), expected);
    });
  it("leaves numbers it can't write as they are", () => {
    assert.equal(roman(0), "0");
    assert.equal(roman(2.5), "2.5");
  });
  it("turns minus signs into hyphens for spreadsheets", () => {
    assert.equal(plainMinus(`${MINUS}0.52 and ${MINUS}3`), "-0.52 and -3");
  });
});

describe("style presets", () => {
  it("labels every style", () => {
    for (const style of TABLE_STYLES) assert.ok(TABLE_STYLE_LABELS[style]);
    for (const font of TABLE_FONTS) assert.ok(FONT_FAMILIES[font].css && FONT_FAMILIES[font].word);
  });
  it("drops the leading zero only in APA", () => {
    assert.deepEqual(
      (["apa", "ieee", "harvard", "chicago", "mla"] as const).map((style) => TABLE_STYLE_SPECS[style].dropLeadingZero),
      [true, false, false, false, false],
    );
  });
  it("numbers IEEE tables in Roman numerals, centred", () => {
    assert.equal(TABLE_STYLE_SPECS.ieee.numerals, "roman");
    assert.equal(TABLE_STYLE_SPECS.ieee.align, "center");
  });
  it("puts Chicago and MLA source notes first", () => {
    assert.equal(TABLE_STYLE_SPECS.chicago.sourceFirst, true);
    assert.equal(TABLE_STYLE_SPECS.mla.sourceFirst, true);
    assert.equal(TABLE_STYLE_SPECS.apa.sourceLabel, null);
  });
  it("applies a style's font, size and borders", () => {
    const next = applyTableStyle(options(), "ieee");
    assert.deepEqual([next.style, next.font, next.fontSize, next.borders], ["ieee", "times", 8, "horizontal"]);
  });
  it("keeps other options when applying a style", () => {
    assert.equal(applyTableStyle(options({ title: "Kept", decimals: 3 }), "harvard").decimals, 3);
  });
  it("builds the custom style from its settings", () => {
    const spec = styleSpec(options({ style: "custom", custom: { label: "Jadual", separator: ":", position: "below", labelBold: false, titleItalic: true } }));
    assert.deepEqual([spec.labelWord, spec.separator, spec.position, spec.labelBold, spec.titleItalic], ["Jadual", ":", "below", false, true]);
  });
  it("falls back to “Table” for an empty custom label", () => {
    assert.equal(styleSpec(options({ style: "custom", custom: { ...DEFAULT_TABLE_OPTIONS.custom, label: " " } })).labelWord, "Table");
  });
  it("refuses unknown styles", () => {
    assert.throws(() => styleSpec({ style: "vancouver" as never, custom: DEFAULT_TABLE_OPTIONS.custom }), /Unknown table style: vancouver/);
  });
});

describe("tableLabel", () => {
  it("numbers in each style's form", () => {
    assert.equal(tableLabel(options({ number: 3 })), "Table 3");
    assert.equal(tableLabel(options({ style: "ieee", number: 3 })), "TABLE III");
  });
  it("adds the appendix letter", () => {
    assert.equal(tableLabel(options({ number: 2, appendix: "b" }), true), "Table B2");
    assert.equal(tableLabel(options({ style: "ieee", number: 2, appendix: "C" }), true), "TABLE C2");
  });
  it("falls back to A and to 1", () => {
    assert.equal(tableLabel(options({ number: 0, appendix: "1" }), true), "Table A1");
  });
});

describe("captionLines", () => {
  it("puts APA's bold number and italic title on separate lines", () => {
    assert.deepEqual(captionLines(table(), options({ number: 2 })), [[{ text: "Table 2", bold: true }], [{ text: "Descriptive Statistics", italic: true, smallCaps: false }]]);
  });
  it("puts IEEE's title in small capitals", () => {
    const lines = captionLines(table(), options({ style: "ieee" }));
    assert.equal(runsText(lines[0]), "TABLE I");
    assert.equal(runsText(lines[1]), "DESCRIPTIVE STATISTICS");
  });
  it("joins label and title with the style's punctuation", () => {
    assert.equal(runsText(captionLines(table(), options({ style: "harvard" }))[0]), "Table 1: Descriptive Statistics");
    assert.equal(runsText(captionLines(table(), options({ style: "chicago" }))[0]), "Table 1. Descriptive Statistics");
  });
  it("marks a continued part", () => {
    assert.equal(runsText(captionLines(table(), options(), { continued: true })[0]), "Table 1 (continued)");
  });
  it("gives front matter a heading without a number", () => {
    assert.deepEqual(captionLines(table({ type: "table-of-contents", title: "Contents" }), options()), [[{ text: "Contents", bold: true }]]);
    assert.equal(captionAlign(table({ type: "list-of-tables" }), options()), "center");
  });
  it("aligns captions by the style", () => {
    assert.equal(captionAlign(table(), options()), "left");
    assert.equal(captionAlign(table(), options({ style: "ieee" })), "center");
  });
});

describe("notes", () => {
  it("italicises statistical symbols", () => {
    assert.deepEqual(italicSymbols("N = 200 and p < .05."), [{ text: "N", italic: true }, { text: " = 200 and " }, { text: "p", italic: true }, { text: " < .05." }]);
  });
  it("leaves words alone", () => {
    assert.deepEqual(italicSymbols("Values are percentages."), [{ text: "Values are percentages." }]);
  });
  it("writes probability notes from the levels used", () => {
    assert.equal(runsText(probabilityRuns([0.01, 0.05], true)), "*p < .05. **p < .01.");
    assert.equal(runsText(probabilityRuns([0.001], false)), "***p < 0.001.");
  });
  it("letters footnotes after the table's own notes", () => {
    assert.deepEqual(footnotes("a: First\n\nSecond", 1), [
      { mark: "b", text: "First" },
      { mark: "c", text: "Second" },
    ]);
  });
  it("letters beyond z", () => {
    assert.deepEqual([noteLetter(0), noteLetter(25), noteLetter(26), noteLetter(27)], ["a", "z", "aa", "ab"]);
  });
  const withNotes = table({ notes: { general: ["N = 40."], specific: [{ mark: "a", text: "Reverse-scored." }], probability: [0.05] } });
  it("orders APA notes: general, specific, probability, with the source in the general note", () => {
    const paragraphs = noteParagraphs(withNotes, options({ note: "Data from 2024.", source: "Adapted from Study A" })).map(runsText);
    assert.deepEqual(paragraphs, ["Note. N = 40. Data from 2024. Adapted from Study A.", "a Reverse-scored.", "*p < .05."]);
  });
  it("puts Chicago's source first", () => {
    const paragraphs = noteParagraphs(withNotes, options({ style: "chicago", source: "Study A" })).map(runsText);
    assert.equal(paragraphs[0], "Source: Study A");
    assert.equal(paragraphs[1], "Note: N = 40.");
  });
  it("puts the source last in Harvard", () => {
    const paragraphs = noteParagraphs(withNotes, options({ style: "harvard", source: "Study A" })).map(runsText);
    assert.equal(paragraphs[paragraphs.length - 1], "Source: Study A");
  });
  it("gives no notes when there are none", () => {
    assert.deepEqual(noteParagraphs(table(), options()), []);
  });
  it("adds footnotes typed in the options", () => {
    assert.deepEqual(noteParagraphs(table(), options({ footnotes: "Excludes outliers." })).map(runsText), ["a Excludes outliers."]);
  });
});
