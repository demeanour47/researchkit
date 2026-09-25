import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SCALE_PRESETS,
  SCALE_PRESET_IDS,
  createScale,
  displayLabels,
  scaleCoding,
  scaleProblems,
  scaleSignature,
  scoreFor,
  setReverseScored,
  setScaleAnchors,
  setScaleDirection,
  setScaleLabels,
  setScaleStart,
  type ScalePresetId,
} from "./questionnaire-scales";

describe("scale presets", () => {
  const points: Record<ScalePresetId, number> = {
    "agreement-3": 3,
    "agreement-5": 5,
    "agreement-7": 7,
    "rating-10": 10,
    "frequency-5": 5,
    "importance-5": 5,
    "satisfaction-5": 5,
    "confidence-5": 5,
    "probability-5": 5,
    "semantic-differential-7": 7,
    custom: 3,
  };

  for (const id of SCALE_PRESET_IDS) {
    it(`builds the ${id} scale, numbered from 1 upwards, with no references until review`, () => {
      const scale = createScale(id);
      assert.equal(scale.labels.length, points[id]);
      assert.deepEqual(scale.values, Array.from({ length: points[id] }, (_, index) => index + 1));
      assert.equal(scale.direction, "ascending");
      assert.equal(scale.reverseScored, false);
      assert.deepEqual(scale.references, []);
      assert.equal(new Set(scale.labels).size, scale.labels.length, "labels are distinct");
      assert.equal(SCALE_PRESETS[id].id, id);
    });
  }

  it("uses the conventional wordings for the named families", () => {
    assert.deepEqual(createScale("agreement-5").labels, ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]);
    assert.deepEqual(createScale("frequency-5").labels, ["Never", "Rarely", "Sometimes", "Often", "Always"]);
    assert.equal(createScale("agreement-7").labels[3], "Neither agree nor disagree", "a neutral middle point");
  });

  it("gives numbered scales placeholder words for their ends, and word scales none", () => {
    assert.deepEqual(createScale("rating-10").anchors, ["[lowest point]", "[highest point]"]);
    assert.deepEqual(createScale("semantic-differential-7").anchors, ["[word at one end]", "[opposite word]"]);
    assert.equal(createScale("satisfaction-5").anchors, null);
  });

  it("rejects an unknown preset", () => {
    assert.throws(() => createScale("colour-4" as ScalePresetId), { message: "Unknown scale: colour-4" });
  });
});

describe("editing a scale", () => {
  it("makes a scale custom when its labels change, renumbering from the same start", () => {
    const scale = setScaleLabels(setScaleStart(createScale("agreement-5"), 0), [" Low ", "", "Medium", "High"]);
    assert.equal(scale.preset, "custom");
    assert.deepEqual(scale.labels, ["Low", "Medium", "High"]);
    assert.deepEqual(scale.values, [0, 1, 2]);
    assert.throws(() => setScaleLabels(scale, ["Only one"]), { message: "A scale needs at least two labels." });
  });

  it("starts at any whole number and runs either way", () => {
    assert.deepEqual(setScaleStart(createScale("agreement-5"), 0).values, [0, 1, 2, 3, 4]);
    assert.deepEqual(setScaleDirection(createScale("agreement-5"), "descending").values, [5, 4, 3, 2, 1]);
    assert.deepEqual(setScaleDirection(setScaleStart(createScale("agreement-3"), 0), "descending").values, [2, 1, 0]);
    assert.throws(() => setScaleStart(createScale("agreement-3"), 0.5), RangeError);
  });

  it("reverses scores for reverse-scored items, whatever the start", () => {
    const scale = createScale("agreement-5");
    assert.deepEqual([0, 1, 2, 3, 4].map((index) => scoreFor(scale, index)), [1, 2, 3, 4, 5]);
    const reversed = setReverseScored(scale, true);
    assert.deepEqual([0, 1, 2, 3, 4].map((index) => scoreFor(reversed, index)), [5, 4, 3, 2, 1]);
    const fromZero = setReverseScored(setScaleStart(createScale("agreement-7"), 0), true);
    assert.deepEqual([0, 3, 6].map((index) => scoreFor(fromZero, index)), [6, 3, 0]);
    assert.throws(() => scoreFor(scale, 5), { message: "No point 6 on this scale." });
  });

  it("shows end words beside the first and last points", () => {
    const scale = setScaleAnchors(createScale("rating-10"), [" Not at all ", "Completely"]);
    const labels = displayLabels(scale);
    assert.equal(labels[0], "1 Not at all");
    assert.equal(labels[9], "10 Completely");
    assert.equal(labels[4], "5");
    assert.deepEqual(displayLabels(createScale("agreement-3")), ["Disagree", "Neither agree nor disagree", "Agree"]);
  });

  it("writes the coding for a codebook, noting reverse scoring", () => {
    assert.equal(scaleCoding(createScale("agreement-3")), "Disagree = 1; Neither agree nor disagree = 2; Agree = 3");
    assert.equal(scaleCoding(setReverseScored(createScale("agreement-3"), true)), "Disagree = 1; Neither agree nor disagree = 2; Agree = 3 (reverse-scored)");
  });
});

describe("scaleProblems", () => {
  it("finds nothing wrong with a word preset", () => {
    for (const id of ["agreement-3", "agreement-5", "agreement-7", "frequency-5", "importance-5", "satisfaction-5", "confidence-5", "probability-5"] as const) {
      assert.deepEqual(scaleProblems(createScale(id)), [], id);
    }
  });

  it("flags placeholders still standing in for labels or end words", () => {
    assert.deepEqual(scaleProblems(createScale("rating-10")), ["Some labels are still placeholders."]);
    assert.deepEqual(scaleProblems(createScale("custom")), ["Some labels are still placeholders."]);
    assert.deepEqual(scaleProblems(setScaleAnchors(createScale("semantic-differential-7"), ["Boring", "Interesting"])), []);
  });

  it("explains each structural problem", () => {
    const base = createScale("agreement-3");
    assert.deepEqual(scaleProblems({ ...base, labels: ["Agree", "agree", "Disagree"] }), ["Two points have the same label."]);
    assert.deepEqual(scaleProblems({ ...base, labels: ["Agree", " ", "Disagree"] }), ["Every point needs a label."]);
    assert.deepEqual(scaleProblems({ ...base, values: [1, 2] }), ["Every label needs exactly one number."]);
    assert.deepEqual(scaleProblems({ ...base, values: [1, 3, 2] }), ["The numbers should rise or fall steadily from one end to the other."]);
    assert.deepEqual(scaleProblems({ ...base, values: [3, 2, 1] }), ["The numbers run the opposite way to the scale's stated direction."]);
    assert.deepEqual(scaleProblems({ ...base, labels: ["Agree"], values: [1] }), ["The scale needs at least two labels."]);
    assert.deepEqual(scaleProblems(setScaleAnchors(createScale("rating-10"), ["Low", " "])), ["Both ends need words."]);
  });
});

describe("scaleSignature", () => {
  it("is the same for scales that look the same to respondents, ignoring case and numbering", () => {
    assert.equal(scaleSignature(createScale("agreement-5")), scaleSignature(setScaleStart(createScale("agreement-5"), 0)));
    assert.notEqual(scaleSignature(createScale("agreement-5")), scaleSignature(createScale("agreement-7")));
    assert.equal(scaleSignature({ ...createScale("agreement-3"), labels: ["DISAGREE", "Neither agree nor disagree", "agree"] }), scaleSignature(createScale("agreement-3")));
  });
});
