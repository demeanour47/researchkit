import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DIAGRAM_SIZE, onionRings } from "./diagram";

describe("onionRings", () => {
  it("draws six concentric rings of equal width, the outer layer largest", () => {
    const rings = onionRings({}, 0);
    assert.deepEqual(
      rings.map((ring) => [ring.layer, ring.radius, ring.labelY]),
      [
        ["philosophy", 120, 10],
        ["approach", 100, 30],
        ["choice", 80, 50],
        ["strategy", 60, 70],
        ["timeHorizon", 40, 90],
        ["technique", 20, 110],
      ],
    );
    assert.equal(rings[0].radius * 2, DIAGRAM_SIZE);
  });

  it("highlights the current layer and shades layers with a choice", () => {
    const rings = onionRings({ philosophy: "realism", approach: "deductive", strategy: "survey" }, 1);
    assert.deepEqual(
      rings.map((ring) => [ring.state, ring.chosen]),
      [
        ["chosen", "Realism"],
        ["current", "Deductive"],
        ["open", null],
        ["chosen", "Survey"],
        ["open", null],
        ["open", null],
      ],
    );
  });

  it("highlights no ring when no layer is on screen", () => {
    const rings = onionRings({ technique: "interview" }, 6);
    assert.ok(rings.every((ring) => ring.state !== "current"));
    assert.equal(rings[5].state, "chosen");
  });
});
