import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judge } from "./compatibility";
import { ALTERNATIVE_VIEWS, EVIDENCE, GENERAL_VIEW, INTERPRETIVE, alternativeViewFor, evidenceFor } from "./evidence";
import { getReference } from "./references";
import { COMPARED_LAYERS, OPTIONS, optionsFor } from "./research-onion";
import type { Judgement } from "./types";

const allJudgements = (): Judgement[] =>
  OPTIONS.flatMap((later) =>
    COMPARED_LAYERS[later.layer].flatMap((layer) => optionsFor(layer).map((earlier) => judge(earlier.id, later.id)!)),
  );

function assertComparedPair(key: string) {
  const [earlier, later] = key.split("/");
  const judgement = judge(earlier, later);
  assert.ok(judgement, `${key} is not a compared pair`);
  assert.equal(judgement.earlier, earlier, `${key} should be written earlier/later`);
}

describe("EVIDENCE", () => {
  it("only describes compared pairs, written earlier/later", () => {
    for (const key of Object.keys(EVIDENCE)) assertComparedPair(key);
  });

  it("backs textbook agreement with at least two sources, and guidance with at least one", () => {
    for (const [key, evidence] of Object.entries(EVIDENCE)) {
      assert.ok(evidence.level !== "interpretive", `${key} needs no entry to be interpretive`);
      assert.ok(evidence.sources.length >= (evidence.level === "textbook" ? 2 : 1), key);
      for (const id of evidence.sources) assert.doesNotThrow(() => getReference(id), `${key}: ${id}`);
      assert.equal(new Set(evidence.sources).size, evidence.sources.length, `${key} repeats a source`);
    }
  });

  it("uses all three evidence levels", () => {
    const levels = new Set(allJudgements().map((judgement) => judgement.evidence.level));
    assert.deepEqual([...levels].sort(), ["guidance", "interpretive", "textbook"]);
  });
});

describe("every compatibility judgement", () => {
  const judgements = allJudgements();

  it("covers every compared pair", () => {
    assert.equal(judgements.length, 3 * 4 + 4 * (4 + 3) + 9 * (4 + 3 + 4) + 2 * 9 + 6 * (4 + 9));
  });

  it("has an evidence level, and sources unless it is interpretive", () => {
    for (const judgement of judgements) {
      const { level, sources } = judgement.evidence;
      assert.ok(["textbook", "guidance", "interpretive"].includes(level), `${judgement.earlier}/${judgement.later}`);
      assert.equal(sources.length === 0, level === "interpretive", `${judgement.earlier}/${judgement.later}`);
    }
  });

  it("offers an alternative view for every combination that needs careful justification", () => {
    for (const judgement of judgements) {
      if (judgement.fit === "careful") assert.ok(judgement.alternativeView, `${judgement.earlier}/${judgement.later}`);
    }
  });

  it("presents alternative views without taking a side, and with sources", () => {
    for (const judgement of judgements) {
      const view = judgement.alternativeView;
      if (!view) continue;
      assert.match(view.text, /Some researchers|described in different ways/, `${judgement.earlier}/${judgement.later}`);
      assert.match(view.text, /Others|Both|while/, `${judgement.earlier}/${judgement.later} gives only one side`);
      assert.ok(view.sources.length > 0);
      for (const id of view.sources) assert.doesNotThrow(() => getReference(id));
      for (const word of ["wrong", "correct", "impossible", "must", "invalid"]) {
        assert.ok(!view.text.toLowerCase().includes(word), `${judgement.earlier}/${judgement.later}: ${word}`);
      }
    }
  });
});

describe("ALTERNATIVE_VIEWS", () => {
  it("only describes compared pairs, written earlier/later", () => {
    for (const key of Object.keys(ALTERNATIVE_VIEWS)) assertComparedPair(key);
  });

  it("shows the debate on Positivism with a qualitative design alongside its rating", () => {
    const judgement = judge("positivism", "qualitative")!;
    assert.equal(judgement.fit, "careful");
    assert.deepEqual(judgement.evidence, { level: "textbook", sources: ["bryman-2016", "creswell-creswell-2018"] });
    assert.ok(judgement.alternativeView?.text.startsWith("Some researchers argue that qualitative data can be collected"));
  });

  it("explains the grounded theory debate for Positivism with Grounded Theory", () => {
    const judgement = judge("grounded-theory", "positivism")!;
    assert.equal(
      judgement.reason,
      "Grounded Theory usually develops theory inductively, while Positivism generally begins from objective measurement.",
    );
    assert.deepEqual(judgement.evidence, INTERPRETIVE);
    assert.deepEqual(judgement.alternativeView?.sources, ["glaser-strauss-1967", "charmaz-2014"]);
  });

  it("notes the debate even for a strong fit where one exists", () => {
    const judgement = judge("interpretivism", "case-study")!;
    assert.equal(judgement.fit, "strong");
    assert.deepEqual(judgement.alternativeView?.sources, ["stake-1995", "yin-2018"]);
  });
});

describe("evidenceFor and alternativeViewFor", () => {
  it("returns the declared evidence, or an interpretive judgement without sources", () => {
    assert.deepEqual(evidenceFor("positivism", "deductive"), { level: "textbook", sources: ["saunders-2019", "bryman-2016"] });
    assert.deepEqual(evidenceFor("realism", "deductive"), { level: "interpretive", sources: [] });
  });

  it("falls back to the general debate only for careful combinations", () => {
    assert.equal(alternativeViewFor("positivism", "phenomenology", true), GENERAL_VIEW);
    assert.equal(alternativeViewFor("realism", "deductive", false), null);
    assert.equal(alternativeViewFor("positivism", "qualitative", true), ALTERNATIVE_VIEWS["positivism/qualitative"]);
  });

  it("cites both sides of the general debate", () => {
    assert.deepEqual(GENERAL_VIEW.sources, ["guba-lincoln-1994", "howe-1988"]);
  });
});
