import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BLUE_RAMP, CATEGORICAL, GRAYS, INK, divergingStyles, labelOn, luminance, rampStep, seriesStyles, tint } from "./palette";
import { STYLES, applyStyle, figureCaption, paletteLabel } from "./style";
import { DEFAULT_OPTIONS, PALETTES, STYLE_PRESETS } from "./types";

const HEX = /^#[0-9a-f]{6}$/;

describe("palettes", () => {
  it("has eight valid categorical colours, all different", () => {
    assert.equal(CATEGORICAL.length, 8);
    assert.ok(CATEGORICAL.every((colour) => HEX.test(colour)));
    assert.equal(new Set(CATEGORICAL).size, 8);
  });
  it("has eight grays and eight blues", () => {
    assert.equal(GRAYS.length, 8);
    assert.equal(BLUE_RAMP.length, 8);
    assert.equal(new Set(GRAYS).size, 8);
  });
  it("orders the blue ramp from light to dark", () => {
    BLUE_RAMP.slice(1).forEach((colour, index) => assert.ok(luminance(colour) < luminance(BLUE_RAMP[index]), colour));
  });
  it("uses only valid ink colours", () => {
    assert.ok(Object.values(INK).every((colour) => HEX.test(colour)));
  });
});

describe("seriesStyles", () => {
  it("assigns categorical colours in fixed order", () => {
    assert.deepEqual(seriesStyles(3, "standard").map((style) => style.fill), CATEGORICAL.slice(0, 3));
  });
  it("keeps a series' colour when others are added", () => {
    assert.equal(seriesStyles(2, "standard")[1].fill, seriesStyles(6, "standard")[1].fill);
  });
  it("refuses more than eight series rather than cycling colours", () => {
    assert.throws(() => seriesStyles(9, "standard"), /At most 8 series/);
  });
  it("gives every series a different marker shape", () => {
    assert.equal(new Set(seriesStyles(8, "standard").map((style) => style.marker)).size, 8);
  });
  it("keeps colour lines solid", () => {
    assert.ok(seriesStyles(4, "standard").every((style) => style.dash === null && style.pattern === null));
  });
  it("adds patterns and dashes in grayscale so colour is never needed", () => {
    const styles = seriesStyles(4, "grayscale");
    assert.deepEqual(styles.map((style) => style.fill), GRAYS.slice(0, 4));
    assert.deepEqual(styles.map((style) => style.pattern), [null, "diagonal", "horizontal", "back-diagonal"]);
    assert.equal(styles[0].dash, null);
    assert.ok(styles.slice(1).every((style) => style.dash !== null));
    assert.ok(styles.every((style) => style.stroke === "#1a1a1a"));
  });
  it("makes every grayscale series distinct by fill and pattern together", () => {
    const keys = seriesStyles(8, "grayscale").map((style) => `${style.fill}/${style.pattern}/${style.dash}`);
    assert.equal(new Set(keys).size, 8);
  });
  it("spans the blue ramp for ordered categories", () => {
    const fills = seriesStyles(3, "blues").map((style) => style.fill);
    assert.deepEqual(fills, [BLUE_RAMP[0], BLUE_RAMP[4], BLUE_RAMP[7]]);
  });
  it("returns nothing for no series", () => {
    assert.deepEqual(seriesStyles(0, "standard"), []);
  });
});

describe("rampStep", () => {
  it("takes the middle step for a single category", () => {
    assert.equal(rampStep(BLUE_RAMP, 0, 1), BLUE_RAMP[4]);
  });
  it("takes the ends for two categories", () => {
    assert.deepEqual([rampStep(BLUE_RAMP, 0, 2), rampStep(BLUE_RAMP, 1, 2)], [BLUE_RAMP[0], BLUE_RAMP[7]]);
  });
});

describe("divergingStyles", () => {
  it("gives a neutral gray middle for an odd number of levels", () => {
    const styles = divergingStyles(5, "standard");
    assert.equal(styles[2].fill, INK.neutral);
  });
  it("makes the ends the strongest", () => {
    const styles = divergingStyles(5, "standard");
    assert.ok(luminance(styles[0].fill) < luminance(styles[1].fill));
    assert.ok(luminance(styles[4].fill) < luminance(styles[3].fill));
  });
  it("uses warm colours for disagreement and blues for agreement", () => {
    const [negative, , , positive] = divergingStyles(4, "standard");
    const channels = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
    const [nr, , nb] = channels(negative.fill);
    const [pr, , pb] = channels(positive.fill);
    assert.ok(nr > nb, "negative is red");
    assert.ok(pb > pr, "positive is blue");
  });
  it("has no neutral level for an even number of levels", () => {
    assert.ok(divergingStyles(4, "standard").every((style) => style.fill !== INK.neutral));
  });
  it("hatches only the negative arm in grayscale", () => {
    const styles = divergingStyles(5, "grayscale");
    assert.deepEqual(styles.map((style) => style.pattern), ["back-diagonal", "back-diagonal", null, null, null]);
  });
  it("gives every level a distinct look in grayscale", () => {
    const styles = divergingStyles(7, "grayscale");
    assert.equal(new Set(styles.map((style) => `${style.fill}/${style.pattern}`)).size, 7);
  });
  it("handles nine levels", () => {
    assert.equal(divergingStyles(9, "standard").length, 9);
  });
});

describe("colour helpers", () => {
  it("tints towards white", () => {
    assert.equal(tint("#000000", 0.5), "#808080");
    assert.equal(tint("#2a78d6", 1), "#2a78d6");
    assert.equal(tint("#2a78d6", 0), "#ffffff");
  });
  it("computes WCAG luminance", () => {
    assert.equal(luminance("#ffffff"), 1);
    assert.equal(luminance("#000000"), 0);
  });
  it("puts dark text on light fills and white text on dark fills", () => {
    assert.equal(labelOn("#e0e0e0"), INK.primary);
    assert.equal(labelOn("#2b2b2b"), "#ffffff");
    assert.equal(labelOn("#184f95"), "#ffffff");
  });
});

describe("style presets", () => {
  it("has a style and palette label for every option", () => {
    for (const preset of STYLE_PRESETS) assert.equal(STYLES[preset].preset, preset);
    for (const palette of PALETTES) assert.ok(paletteLabel[palette]);
  });
  it("keeps titles out of the image for APA and IEEE, where captions go in the document", () => {
    assert.deepEqual(STYLE_PRESETS.map((preset) => STYLES[preset].titleInFigure), [true, false, false]);
  });
  it("uses serif fonts for IEEE, with matching PDF fonts", () => {
    assert.match(STYLES.ieee.fontFamily, /Times/);
    assert.equal(STYLES.ieee.pdfFonts.regular, "Times-Roman");
    assert.ok(STYLES.ieee.widthFactor < 1);
  });
  it("uses sans-serif fonts for APA", () => {
    assert.match(STYLES.apa.fontFamily, /sans-serif/);
  });
  it("applies a preset's defaults", () => {
    const options = applyStyle(DEFAULT_OPTIONS, "ieee");
    assert.deepEqual([options.style, options.palette, options.gridlines, options.fontSize], ["ieee", "grayscale", true, 9]);
  });
  it("turns gridlines off for APA", () => {
    assert.equal(applyStyle({ ...DEFAULT_OPTIONS, gridlines: true }, "apa").gridlines, false);
  });
  it("keeps the other options when applying a preset", () => {
    const options = applyStyle({ ...DEFAULT_OPTIONS, title: "Kept", dataLabels: false }, "apa");
    assert.deepEqual([options.title, options.dataLabels], ["Kept", false]);
  });
  it("refuses unknown presets", () => {
    assert.throws(() => applyStyle(DEFAULT_OPTIONS, "mla" as never), /Unknown style: mla/);
  });
});

describe("figureCaption", () => {
  it("puts the number and title on separate lines for APA", () => {
    assert.equal(figureCaption({ title: "Enrolment by faculty", subtitle: "", style: "apa" }), "Figure 1\nEnrolment by faculty");
  });
  it("uses “Fig. 1.” and a closing full stop for IEEE", () => {
    assert.equal(figureCaption({ title: "Enrolment by faculty", subtitle: "", style: "ieee" }, 3), "Fig. 3. Enrolment by faculty.");
  });
  it("doesn't double an IEEE full stop", () => {
    assert.equal(figureCaption({ title: "Done.", subtitle: "", style: "ieee" }), "Fig. 1. Done.");
  });
  it("uses “Figure 1.” for the standard style", () => {
    assert.equal(figureCaption({ title: "Sleep", subtitle: "", style: "standard" }, 2), "Figure 2. Sleep");
  });
  it("uses a placeholder when there is no title", () => {
    assert.equal(figureCaption({ title: "  ", subtitle: "", style: "standard" }), "Figure 1. [Figure title]");
  });
});
