import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addRelationship, addVariable, moveVariable } from "./conceptual-framework";
import { LABEL_POSITION, LAYOUT, layoutFramework, measureText, segmentCrossesBox, segmentsOverlap, wrapText, type FrameworkLayout } from "./conceptual-layout";
import { frameworkOfShape } from "./conceptual-test-helpers";
import { EMPTY_FRAMEWORK, type ConceptualFramework } from "./conceptual-types";

const overlapping = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

const distanceToSegment = (p: { x: number; y: number }, a: typeof p, b: typeof p) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

describe("measureText and wrapText", () => {
  it("measures with Helvetica widths", () => {
    assert.equal(measureText("", 14), 0);
    assert.equal(measureText("a", 1000), 556);
    assert.equal(measureText("Wi", 1000), 944 + 222);
    assert.equal(measureText("é", 1000), 556, "characters outside ASCII use the digit width");
  });

  it("wraps between words to fit the width", () => {
    assert.deepEqual(wrapText("screen time and sleep quality", 100, 14), ["screen time and", "sleep quality"]);
    for (const line of wrapText("perceived organisational support among early career nurses", 160, 14)) assert.ok(measureText(line, 14) <= 160, line);
  });

  it("breaks a word only when it can't fit on a line", () => {
    const lines = wrapText("Donaudampfschifffahrtsgesellschaftskapitän", 100, 14);
    assert.ok(lines.length > 1);
    assert.equal(lines.join(""), "Donaudampfschifffahrtsgesellschaftskapitän");
    for (const line of lines) assert.ok(measureText(line, 14) <= 100);
  });

  it("returns one empty line for empty text", () => {
    assert.deepEqual(wrapText("   ", 100, 14), [""]);
  });
});

describe("layoutFramework invariants", () => {
  for (let independent = 0; independent <= 4; independent++) {
    for (let dependent = 0; dependent <= 4; dependent++) {
      for (let mediators = 0; mediators <= 2; mediators++) {
        for (let moderators = 0; moderators <= 2; moderators++) {
          const shape = { independent, dependent, mediators, moderators, controls: (independent + dependent) % 3 };
          it(`lays out ${independent} IV, ${dependent} DV, ${mediators} mediator(s), ${moderators} moderator(s) cleanly`, () => {
            const framework = frameworkOfShape(shape);
            const layout = layoutFramework(framework, { showTypes: (independent + mediators) % 2 === 0 });
            checkInvariants(framework, layout);
          });
        }
      }
    }
  }
});

function checkInvariants(framework: ConceptualFramework, layout: FrameworkLayout) {
  const { nodes, edges } = layout;
  const of = (type: string) => nodes.filter((node) => node.type === type);
  // Every variable has one box, every drawable relationship one connector.
  assert.equal(nodes.length, framework.variables.length);
  assert.equal(edges.length, framework.relationships.length);
  // No two boxes overlap, and everything fits inside the figure.
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) assert.ok(!overlapping(nodes[i], nodes[j]), `${nodes[i].id} overlaps ${nodes[j].id}`);
    assert.ok(nodes[i].x >= 0 && nodes[i].y >= 0 && nodes[i].x + nodes[i].width <= layout.width && nodes[i].y + nodes[i].height <= layout.height);
  }
  // Independent variables on the left, dependent on the right, mediators and moderators between them.
  const right = (list: typeof nodes) => Math.max(...list.map((node) => node.x + node.width));
  const left = (list: typeof nodes) => Math.min(...list.map((node) => node.x));
  const [ivs, dvs, mediators, moderators, controls] = ["independent", "dependent", "mediator", "moderator", "control"].map(of);
  for (const middle of [mediators, moderators]) {
    if (middle.length === 0) continue;
    if (ivs.length > 0) assert.ok(right(ivs) < left(middle), "independent variables sit left of the middle");
    if (dvs.length > 0) assert.ok(right(middle) < left(dvs), "dependent variables sit right of the middle");
  }
  if (ivs.length > 0 && dvs.length > 0) assert.ok(right(ivs) < left(dvs));
  // Moderators above the main band, mediators below it, controls at the bottom.
  const main = [...ivs, ...dvs];
  const top = (list: typeof nodes) => Math.min(...list.map((node) => node.y));
  const bottom = (list: typeof nodes) => Math.max(...list.map((node) => node.y + node.height));
  if (main.length > 0 && moderators.length > 0) assert.ok(bottom(moderators) < top(main));
  if (main.length > 0 && mediators.length > 0) assert.ok(top(mediators) > bottom(main));
  if (controls.length > 0) assert.ok(top(controls) > bottom(nodes.filter((node) => node.type !== "control")) || nodes.length === controls.length);
  // No connector passes behind a box, and no two connectors overlap.
  assert.deepEqual(layout.crossings, []);
  assert.deepEqual(layout.overlaps, []);
  // Every label is centred on its connector, or placed along it when a moderation meets the middle.
  for (const edge of edges) {
    if (!edge.label) continue;
    const middle = { x: edge.label.x + edge.label.width / 2, y: edge.label.y + edge.label.height / 2 };
    assert.ok(distanceToSegment(middle, edge.from, edge.to) < 0.5, `${edge.id} label is off its connector`);
  }
  // Deterministic.
  assert.deepEqual(layoutFramework(framework), layoutFramework(framework));
}

describe("layoutFramework details", () => {
  const framework = frameworkOfShape({ independent: 1, dependent: 1, mediators: 1, moderators: 1 });
  const layout = layoutFramework(framework);
  const edge = (source: string, target: string) => {
    const relationship = framework.relationships.find((candidate) => candidate.source === source && candidate.target === target)!;
    return layout.edges.find((candidate) => candidate.id === relationship.id)!;
  };
  const node = (id: string) => layout.nodes.find((candidate) => candidate.id === id)!;

  it("joins independent to dependent variables side to side", () => {
    const main = edge("v-predictor-1", "v-outcome-1");
    assert.equal(main.from.x, node("v-predictor-1").x + LAYOUT.boxWidth);
    assert.equal(main.to.x, node("v-outcome-1").x);
  });

  it("meets a mediator at its top and leaves it from its top", () => {
    const mediator = node("v-mediator-1");
    assert.deepEqual(edge("v-predictor-1", "v-mediator-1").to, { x: mediator.x + mediator.width / 2, y: mediator.y });
    assert.deepEqual(edge("v-mediator-1", "v-outcome-1").from, { x: mediator.x + mediator.width / 2, y: mediator.y });
  });

  it("points a moderation arrow straight down at the connector it moderates", () => {
    const moderation = layout.edges.find((candidate) => framework.relationships.find((r) => r.id === candidate.id)?.type === "moderation")!;
    const main = edge("v-predictor-1", "v-outcome-1");
    assert.equal(moderation.from.x, moderation.to.x);
    assert.ok(distanceToSegment(moderation.to, main.from, main.to) < 0.01);
    assert.equal(moderation.from.y, node("v-moderator-1").y + node("v-moderator-1").height);
  });

  it("moves the label of a moderated connector towards its source", () => {
    const main = edge("v-predictor-1", "v-outcome-1");
    const centreX = main.label!.x + main.label!.width / 2;
    assert.ok(Math.abs(centreX - (main.from.x + (main.to.x - main.from.x) * LABEL_POSITION.moderated)) < 0.01);
  });

  it("draws arrowheads for one-way connectors, both ends for correlations, and none for associations", () => {
    let custom = addVariable(addVariable(EMPTY_FRAMEWORK, { name: "a", type: "independent" }), { name: "b", type: "dependent" });
    for (const type of ["direct", "correlation", "association"] as const) custom = addRelationship(custom, { source: "v-a", target: "v-b", type });
    const heads = layoutFramework(custom).edges.map((candidate) => candidate.arrowheads.length);
    assert.deepEqual(heads, [1, 2, 0]);
  });

  it("draws connectors between the same boxes side by side, never on top of each other", () => {
    let pair = addVariable(addVariable(EMPTY_FRAMEWORK, { name: "a", type: "independent" }), { name: "b", type: "dependent" });
    pair = addRelationship(pair, { source: "v-a", target: "v-b", type: "direct" });
    pair = addRelationship(pair, { source: "v-b", target: "v-a", type: "direct" });
    const [first, second] = layoutFramework(pair).edges;
    assert.equal(Math.abs(first.from.y - second.from.y), LAYOUT.parallelOffset);
    assert.deepEqual(layoutFramework(pair).overlaps, []);
  });

  it("stops the visible line short of the arrowhead", () => {
    const main = edge("v-predictor-1", "v-outcome-1");
    assert.ok(Math.abs(main.to.x - main.lineTo.x - LAYOUT.arrowLength) < 0.01);
    assert.deepEqual(main.arrowheads[0][0], main.to);
  });

  it("sizes boxes to their wrapped labels, and adds room for a type caption", () => {
    const long = addVariable(EMPTY_FRAMEWORK, { name: "perceived organisational support among early career nurses", type: "independent" });
    const [plain] = layoutFramework(long).nodes;
    const [captioned] = layoutFramework(long, { showTypes: true }).nodes;
    assert.ok(plain.lines.length >= 2);
    assert.equal(plain.height, Math.max(LAYOUT.minBoxHeight, 2 * LAYOUT.paddingY + plain.lines.length * LAYOUT.lineHeight));
    assert.equal(captioned.height, plain.height + LAYOUT.captionHeight);
    assert.equal(captioned.caption, "Independent variable");
    assert.equal(plain.caption, null);
  });

  it("groups control and extraneous variables at the bottom, with labels", () => {
    let withGroups = frameworkOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0, controls: 2 });
    withGroups = addVariable(withGroups, { name: "weather", type: "extraneous" });
    const result = layoutFramework(withGroups);
    assert.deepEqual(result.groups.map((group) => group.label), ["Control variables", "Extraneous variables"]);
    for (const group of result.groups) {
      for (const member of result.nodes.filter((candidate) => candidate.type === group.type)) {
        assert.ok(member.x > group.x && member.x + member.width < group.x + group.width && member.y > group.y && member.y + member.height < group.y + group.height);
      }
    }
    assert.ok(result.groups[1].y > result.groups[0].y + result.groups[0].height);
  });

  it("keeps moved boxes where they were put, and grows the figure to fit them", () => {
    const moved = moveVariable(framework, "v-predictor-1", { x: 1500, y: 900 });
    const result = layoutFramework(moved);
    const box = result.nodes.find((candidate) => candidate.id === "v-predictor-1")!;
    assert.deepEqual([box.x, box.y, box.moved], [1500, 900, true]);
    assert.equal(result.width, 1500 + LAYOUT.boxWidth + LAYOUT.margin);
    assert.equal(result.height, 900 + box.height + LAYOUT.margin);
  });

  it("reports a connector that passes behind a moved box", () => {
    const main = edge("v-predictor-1", "v-outcome-1");
    const blocking = moveVariable(framework, "v-mediator-1", { x: (main.from.x + main.to.x) / 2 - 92, y: main.from.y - 20 });
    const result = layoutFramework(blocking);
    assert.ok(result.crossings.some((crossing) => crossing.node === "v-mediator-1"));
  });

  it("lays out an empty framework as a blank figure", () => {
    const empty = layoutFramework(EMPTY_FRAMEWORK);
    assert.deepEqual([empty.nodes, empty.edges, empty.groups, empty.crossings, empty.overlaps], [[], [], [], [], []]);
    assert.ok(empty.width > 0 && empty.height > 0);
  });

  it("lays out 100 variables and 200 relationships in under 100 milliseconds", () => {
    let big: ConceptualFramework = EMPTY_FRAMEWORK;
    for (let index = 0; index < 100; index++) big = addVariable(big, { name: `variable ${index}`, type: index % 2 === 0 ? "independent" : "dependent" });
    for (let index = 0; index < 200; index++) {
      const source = big.variables[(index * 2) % 100].id;
      const target = big.variables[(index * 2 + 1 + (index % 7) * 2) % 100].id;
      big = addRelationship(big, { source, target, type: "direct", label: `H${index}` });
    }
    layoutFramework(big); // Warm up.
    const times = [0, 1, 2].map(() => {
      const start = performance.now();
      layoutFramework(big);
      return performance.now() - start;
    });
    assert.ok(Math.min(...times) < 100, `took ${Math.min(...times).toFixed(1)} ms`);
  });
});

describe("segmentCrossesBox and segmentsOverlap", () => {
  const box = { x: 10, y: 10, width: 20, height: 20 };
  it("detects a segment through a box, and ignores one that only touches it", () => {
    assert.ok(segmentCrossesBox({ x: 0, y: 20 }, { x: 40, y: 20 }, box));
    assert.ok(!segmentCrossesBox({ x: 0, y: 10 }, { x: 40, y: 10 }, box), "along the edge");
    assert.ok(!segmentCrossesBox({ x: 0, y: 0 }, { x: 5, y: 40 }, box));
    assert.ok(!segmentCrossesBox({ x: 0, y: 20 }, { x: 10, y: 20 }, box), "ending at the edge");
    assert.ok(segmentCrossesBox({ x: 15, y: 15 }, { x: 16, y: 16 }, box), "entirely inside");
  });

  it("detects collinear overlap only", () => {
    assert.ok(segmentsOverlap({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 0 }, { x: 20, y: 0 }));
    assert.ok(!segmentsOverlap({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }), "meeting at a point");
    assert.ok(!segmentsOverlap({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 5 }, { x: 10, y: 5 }), "parallel but apart");
    assert.ok(!segmentsOverlap({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }), "crossing");
  });
});
