import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allJudgements, areCompared, judge, judgementsFor, validateSelection } from "./compatibility";
import { ALTERNATIVE_VIEWS } from "./evidence";
import { COMPARED_LAYERS, OPTIONS, optionsFor } from "./research-onion";
import { LAYER_ORDER, type Fit, type OnionSelection } from "./types";

describe("judge", () => {
  it("explains why Positivism with Grounded Theory needs careful justification", () => {
    assert.deepEqual(judge("positivism", "grounded-theory"), {
      earlier: "positivism",
      later: "grounded-theory",
      fit: "careful",
      reason: "Grounded Theory usually develops theory inductively, while Positivism generally begins from objective measurement.",
      justify:
        "Explain why Grounded Theory is appropriate alongside Positivism, and how you will address the tension between them.",
      evidence: { level: "interpretive", sources: [] },
      alternativeView: ALTERNATIVE_VIEWS["positivism/grounded-theory"],
    });
  });

  it("explains a strong fit and asks for no extra justification", () => {
    assert.deepEqual(judge("positivism", "deductive"), {
      earlier: "positivism",
      later: "deductive",
      fit: "strong",
      reason:
        "A deductive approach usually tests an existing theory against data. This fits well with Positivism, which generally begins from objective measurement.",
      justify: null,
      evidence: { level: "textbook", sources: ["saunders-2019", "bryman-2016"] },
      alternativeView: null,
    });
  });

  it("explains a possible fit and asks how the two connect", () => {
    assert.deepEqual(judge("quantitative", "interview"), {
      earlier: "quantitative",
      later: "interview",
      fit: "possible",
      reason:
        "An interview usually explores views in depth through conversation. It can also work with a quantitative design, which generally collects numerical data for statistical analysis, if your design shows how the two connect.",
      justify: "Explain how an interview will work alongside a quantitative design in your study.",
      evidence: { level: "interpretive", sources: [] },
      alternativeView: null,
    });
  });

  it("gives the same judgement whichever order the options are passed in", () => {
    for (const a of OPTIONS) {
      for (const b of OPTIONS) {
        assert.deepEqual(judge(a.id, b.id), judge(b.id, a.id), `${a.id} and ${b.id}`);
      }
    }
  });

  it("does not compare options in the same layer", () => {
    assert.equal(judge("positivism", "interpretivism"), null);
    assert.equal(judge("survey", "survey"), null);
  });

  it("does not compare layers that don't directly constrain each other", () => {
    assert.equal(judge("positivism", "questionnaire"), null);
    assert.equal(judge("deductive", "longitudinal"), null);
    assert.equal(judge("quantitative", "cross-sectional"), null);
  });

  it("rejects unknown option ids", () => {
    assert.throws(() => judge("astrology", "positivism"), { name: "RangeError", message: "Unknown option: astrology" });
    assert.throws(() => judge("positivism", ""), { name: "RangeError", message: "Unknown option: " });
  });
});

describe("every compatibility rule", () => {
  for (const later of OPTIONS) {
    for (const layer of COMPARED_LAYERS[later.layer]) {
      it(`judges ${later.id} against every ${layer} choice as its rule declares`, () => {
        const rule = later.fits[layer] ?? {};
        for (const earlier of optionsFor(layer)) {
          const expected: Fit = rule.strong?.includes(earlier.id)
            ? "strong"
            : rule.possible?.includes(earlier.id)
              ? "possible"
              : "careful";
          const judgement = judge(earlier.id, later.id);
          assert.equal(judgement?.fit, expected, `${earlier.id} with ${later.id}`);
        }
      });
    }
  }

  it("uses every one of the three fit levels somewhere", () => {
    const fits = new Set(allPairs().map((judgement) => judgement.fit));
    assert.deepEqual([...fits].sort(), ["careful", "possible", "strong"]);
  });

  it("explains every judgement using both options' own descriptions", () => {
    for (const judgement of allPairs()) {
      const earlier = OPTIONS.find((option) => option.id === judgement.earlier)!;
      const later = OPTIONS.find((option) => option.id === judgement.later)!;
      assert.ok(judgement.reason.includes(earlier.essence), `${judgement.earlier}/${judgement.later}`);
      assert.ok(judgement.reason.includes(later.essence), `${judgement.earlier}/${judgement.later}`);
      assert.ok(judgement.reason.includes(earlier.subject), `${judgement.earlier}/${judgement.later}`);
      assert.ok(judgement.reason.endsWith("."), `${judgement.earlier}/${judgement.later}`);
      assert.match(judgement.reason, /^[A-Z]/, `${judgement.earlier}/${judgement.later} starts with a capital`);
    }
  });

  it("asks for justification exactly when the fit is not strong", () => {
    for (const judgement of allPairs()) {
      assert.equal(judgement.justify === null, judgement.fit === "strong", `${judgement.earlier}/${judgement.later}`);
    }
  });

  it("never calls a combination impossible or forbidden", () => {
    for (const judgement of allPairs()) {
      const text = `${judgement.reason} ${judgement.justify ?? ""}`.toLowerCase();
      for (const word of ["impossible", "forbidden", "invalid", "not allowed", "cannot"]) {
        assert.ok(!text.includes(word), `${judgement.earlier}/${judgement.later}: ${word}`);
      }
    }
  });
});

describe("areCompared", () => {
  it("is symmetric and matches the layer comparison table", () => {
    const pairs = new Set<string>();
    for (const layer of LAYER_ORDER) for (const earlier of COMPARED_LAYERS[layer]) pairs.add(`${earlier}/${layer}`);
    for (const a of LAYER_ORDER) {
      for (const b of LAYER_ORDER) {
        const expected = pairs.has(`${a}/${b}`) || pairs.has(`${b}/${a}`);
        assert.equal(areCompared(a, b), expected, `${a} and ${b}`);
      }
    }
  });

  it("compares nine pairs of layers", () => {
    let count = 0;
    for (const layer of LAYER_ORDER) count += COMPARED_LAYERS[layer].length;
    assert.equal(count, 9);
  });
});

describe("validateSelection", () => {
  it("accepts an empty selection and a valid partial one", () => {
    assert.doesNotThrow(() => validateSelection({}));
    assert.doesNotThrow(() => validateSelection({ philosophy: "realism", strategy: "survey" }));
    assert.doesNotThrow(() => validateSelection({ philosophy: undefined }));
  });

  it("rejects an option chosen for the wrong layer", () => {
    assert.throws(() => validateSelection({ philosophy: "survey" }), {
      name: "RangeError",
      message: "Survey belongs to the strategy layer, not philosophy.",
    });
  });

  it("rejects unknown options and unknown layers", () => {
    assert.throws(() => validateSelection({ approach: "astrology" }), { message: "Unknown option: astrology" });
    assert.throws(() => validateSelection({ approach: "" }), { message: "Unknown option: " });
    assert.throws(() => validateSelection({ colour: "survey" } as OnionSelection), { message: "Unknown layer: colour" });
  });
});

describe("judgementsFor", () => {
  const selection: OnionSelection = {
    philosophy: "positivism",
    approach: "deductive",
    choice: "quantitative",
    strategy: "grounded-theory",
  };

  it("judges a choice against each earlier layer it is compared with, outermost first", () => {
    const judgements = judgementsFor(selection, "strategy");
    assert.deepEqual(
      judgements.map((judgement) => [judgement.earlier, judgement.fit]),
      [
        ["positivism", "careful"],
        ["deductive", "careful"],
        ["quantitative", "careful"],
      ],
    );
  });

  it("skips earlier layers that haven't been chosen yet", () => {
    const judgements = judgementsFor({ philosophy: "interpretivism", strategy: "ethnography" }, "strategy");
    assert.deepEqual(
      judgements.map((judgement) => [judgement.earlier, judgement.fit]),
      [["interpretivism", "strong"]],
    );
  });

  it("returns nothing for the outermost layer or an unchosen layer", () => {
    assert.deepEqual(judgementsFor(selection, "philosophy"), []);
    assert.deepEqual(judgementsFor(selection, "technique"), []);
  });

  it("judges later choices even when a layer in between is missing", () => {
    const judgements = judgementsFor({ choice: "qualitative", technique: "interview" }, "technique");
    assert.deepEqual(
      judgements.map((judgement) => [judgement.earlier, judgement.fit]),
      [["qualitative", "strong"]],
    );
  });

  it("rejects an invalid selection", () => {
    assert.throws(() => judgementsFor({ approach: "survey" }, "approach"), RangeError);
  });
});

describe("allJudgements", () => {
  it("makes nine judgements for a complete selection, in layer order", () => {
    const judgements = allJudgements({
      philosophy: "pragmatism",
      approach: "abductive",
      choice: "mixed-methods",
      strategy: "action-research",
      timeHorizon: "longitudinal",
      technique: "focus-group",
    });
    assert.deepEqual(
      judgements.map((judgement) => `${judgement.later}/${judgement.earlier}:${judgement.fit}`),
      [
        "abductive/pragmatism:strong",
        "mixed-methods/pragmatism:strong",
        "mixed-methods/abductive:strong",
        "action-research/pragmatism:strong",
        "action-research/abductive:strong",
        "action-research/mixed-methods:strong",
        "longitudinal/action-research:strong",
        "focus-group/mixed-methods:possible",
        "focus-group/action-research:strong",
      ],
    );
  });

  it("makes no judgements for an empty selection", () => {
    assert.deepEqual(allJudgements({}), []);
  });
});

function allPairs() {
  return OPTIONS.flatMap((later) =>
    COMPARED_LAYERS[later.layer].flatMap((layer) => optionsFor(layer).map((earlier) => judge(earlier.id, later.id)!)),
  );
}
