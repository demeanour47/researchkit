import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COMPARED_LAYERS, LAYERS, OPTIONS, findOption, getLayer, optionsFor } from "./research-onion";
import { getReference } from "./references";
import { LAYER_ORDER, type LayerId } from "./types";

describe("LAYERS", () => {
  it("lists the six layers from the outside in, numbered 1 to 6", () => {
    assert.deepEqual(
      LAYERS.map((layer) => layer.id),
      [...LAYER_ORDER],
    );
    assert.deepEqual(
      LAYERS.map((layer) => layer.number),
      [1, 2, 3, 4, 5, 6],
    );
  });

  it("gives every layer a name, a question and a description", () => {
    for (const layer of LAYERS) {
      assert.ok(layer.name.length > 0, layer.id);
      assert.ok(layer.question.endsWith("?"), `${layer.id} question should be a question`);
      assert.ok(layer.description.length > 0, layer.id);
    }
  });

  it("looks layers up by id and rejects unknown ids", () => {
    assert.equal(getLayer("strategy").name, "Research strategy");
    assert.throws(() => getLayer("colour" as LayerId), RangeError);
  });
});

describe("OPTIONS", () => {
  const expected: Record<LayerId, string[]> = {
    philosophy: ["Positivism", "Interpretivism", "Pragmatism", "Realism"],
    approach: ["Deductive", "Inductive", "Abductive"],
    choice: ["Quantitative", "Qualitative", "Mixed methods", "Multi-method"],
    strategy: [
      "Experiment",
      "Survey",
      "Case study",
      "Ethnography",
      "Grounded Theory",
      "Action research",
      "Narrative inquiry",
      "Phenomenology",
      "Archival research",
    ],
    timeHorizon: ["Cross-sectional", "Longitudinal"],
    technique: ["Questionnaire", "Interview", "Observation", "Focus group", "Document analysis", "Secondary data"],
  };

  for (const layer of LAYER_ORDER) {
    it(`offers the expected choices for the ${layer} layer`, () => {
      assert.deepEqual(
        optionsFor(layer).map((option) => option.name),
        expected[layer],
      );
    });
  }

  it("has 28 options with unique ids", () => {
    assert.equal(OPTIONS.length, 28);
    assert.equal(new Set(OPTIONS.map((option) => option.id)).size, OPTIONS.length);
  });

  it("gives every option all the teaching content the tool displays", () => {
    for (const option of OPTIONS) {
      assert.ok(option.definition.length > 0, `${option.id} definition`);
      assert.ok(option.whyUsed.length > 0, `${option.id} whyUsed`);
      assert.ok(option.strengths.length >= 2, `${option.id} strengths`);
      assert.ok(option.limitations.length >= 2, `${option.id} limitations`);
      assert.ok(option.examples.length >= 2, `${option.id} examples`);
      assert.ok(option.mistakes.length >= 2, `${option.id} mistakes`);
      assert.ok(option.references.length >= 1, `${option.id} references`);
      assert.equal(new Set(option.references).size, option.references.length, `${option.id} repeats a reference`);
      for (const id of option.references) assert.doesNotThrow(() => getReference(id), `${option.id}: ${id}`);
    }
  });

  it("writes subjects and essences that read correctly inside a sentence", () => {
    for (const option of OPTIONS) {
      assert.ok(!option.essence.endsWith("."), `${option.id} essence should not end with a full stop`);
      assert.equal(option.essence, option.essence.trim(), option.id);
      assert.equal(option.essence.charAt(0), option.essence.charAt(0).toLowerCase(), `${option.id} essence starts lower case`);
      assert.ok(option.subject.length > 0, option.id);
    }
  });

  it("finds options by id and returns undefined for unknown ids", () => {
    assert.equal(findOption("grounded-theory")?.name, "Grounded Theory");
    assert.equal(findOption("astrology"), undefined);
    assert.equal(findOption(""), undefined);
  });
});

describe("fit rules", () => {
  it("only declare fits for the layers each option is compared with", () => {
    for (const option of OPTIONS) {
      for (const layer of Object.keys(option.fits) as LayerId[]) {
        assert.ok(COMPARED_LAYERS[option.layer].includes(layer), `${option.id} declares a fit for ${layer}`);
      }
    }
  });

  it("declare a rule for every compared layer, so no option relies on the default by omission", () => {
    for (const option of OPTIONS) {
      for (const layer of COMPARED_LAYERS[option.layer]) {
        assert.ok(option.fits[layer], `${option.id} has no rule for ${layer}`);
      }
    }
  });

  it("refer only to existing options in the right layer", () => {
    for (const option of OPTIONS) {
      for (const [layer, rule] of Object.entries(option.fits)) {
        for (const id of [...(rule?.strong ?? []), ...(rule?.possible ?? [])]) {
          assert.equal(findOption(id)?.layer, layer, `${option.id} refers to ${id} under ${layer}`);
        }
      }
    }
  });

  it("never list an option as both a strong and a possible fit", () => {
    for (const option of OPTIONS) {
      for (const rule of Object.values(option.fits)) {
        const strong = new Set(rule?.strong ?? []);
        for (const id of rule?.possible ?? []) assert.ok(!strong.has(id), `${option.id}: ${id} is listed twice`);
      }
    }
  });

  it("only compare a layer with layers further out", () => {
    for (const layer of LAYER_ORDER) {
      for (const earlier of COMPARED_LAYERS[layer]) {
        assert.ok(LAYER_ORDER.indexOf(earlier) < LAYER_ORDER.indexOf(layer), `${layer} compares with ${earlier}`);
      }
    }
  });
});

describe("wording", () => {
  it("never describes any choice as impossible, forbidden, wrong or invalid", () => {
    const text = JSON.stringify({ LAYERS, OPTIONS });
    for (const word of ["impossible", "forbidden", "not allowed", "invalid", "wrong", "never use", "must not"]) {
      assert.ok(!text.toLowerCase().includes(word), `found "${word}"`);
    }
  });
});
