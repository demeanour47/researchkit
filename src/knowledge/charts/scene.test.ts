import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { arcCommands, barPath, circlePath, hatchLines, markerPath, polar, r2, slicePath, textWidth, type PathCommand, type SceneItem } from "./scene";

const ends = (commands: PathCommand[]) => commands.filter((command) => command[0] !== "Z").map((command) => command.slice(-2) as number[]);
const near = (a: number, b: number, tolerance = 1e-6) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≠ ${b}`);

describe("polar", () => {
  it("measures angles clockwise from twelve o'clock", () => {
    const [x0, y0] = polar(0, 0, 10, 0);
    near(x0, 0);
    near(y0, -10);
    const [x1, y1] = polar(0, 0, 10, Math.PI / 2);
    near(x1, 10);
    near(y1, 0);
  });
});

describe("circlePath", () => {
  it("draws four quarter curves ending back at the start", () => {
    const commands = circlePath(50, 50, 10);
    assert.equal(commands.filter((command) => command[0] === "C").length, 4);
    assert.deepEqual(commands[0], ["M", 60, 50]);
    assert.deepEqual(commands[commands.length - 1], ["Z"]);
  });
  it("passes through the four compass points", () => {
    const points = ends(circlePath(0, 0, 5));
    assert.deepEqual(points, [[5, 0], [0, 5], [-5, 0], [0, -5], [5, 0]]);
  });
});

describe("arcCommands", () => {
  it("splits arcs into segments of at most 90 degrees", () => {
    const count = (sweep: number) => arcCommands(0, 0, 10, 0, sweep, true).filter((command) => command[0] === "C").length;
    assert.deepEqual([count(Math.PI / 4), count(Math.PI / 2), count(Math.PI), count(Math.PI * 1.5 + 0.1), count(Math.PI * 2)], [1, 1, 2, 4, 4]);
  });
  it("ends every segment on the circle", () => {
    for (const [x, y] of ends(arcCommands(0, 0, 10, 0.3, 2.9, true))) near(Math.hypot(x, y), 10);
  });
  it("keeps the middle of a quarter arc within 0.03% of the radius", () => {
    const [, c] = arcCommands(0, 0, 100, 0, Math.PI / 2, true) as [PathCommand, ["C", number, number, number, number, number, number]];
    // A cubic Bézier's midpoint is (p0 + 3c1 + 3c2 + p3) / 8.
    const mx = (0 + 3 * c[1] + 3 * c[3] + c[5]) / 8;
    const my = (-100 + 3 * c[2] + 3 * c[4] + c[6]) / 8;
    assert.ok(Math.abs(Math.hypot(mx, my) - 100) < 0.03);
  });
  it("starts with a line unless asked to move", () => {
    assert.equal(arcCommands(0, 0, 1, 0, 1, false)[0][0], "L");
    assert.equal(arcCommands(0, 0, 1, 0, 1, true)[0][0], "M");
  });
});

describe("slicePath", () => {
  it("draws a pie slice from the centre", () => {
    const commands = slicePath(50, 50, 20, 0, 0, Math.PI / 2);
    assert.deepEqual(commands[0], ["M", 50, 50]);
    assert.deepEqual(commands[commands.length - 1], ["Z"]);
  });
  it("draws a doughnut segment along both radii", () => {
    const points = ends(slicePath(0, 0, 20, 10, 0, Math.PI / 2));
    const radii = points.map(([x, y]) => Math.round(Math.hypot(x, y)));
    assert.ok(radii.includes(20) && radii.includes(10));
    assert.ok(!radii.includes(0));
  });
});

describe("barPath", () => {
  it("is a plain rectangle with no radius", () => {
    assert.deepEqual(barPath(0, 0, 10, 20, 0, "top"), [["M", 0, 0], ["L", 10, 0], ["L", 10, 20], ["L", 0, 20], ["Z"]]);
  });
  it("rounds only the data end", () => {
    const commands = barPath(0, 0, 10, 20, 4, "top");
    assert.equal(commands.filter((command) => command[0] === "C").length, 2);
    // The baseline corners stay square.
    assert.deepEqual(commands[0], ["M", 0, 20]);
    assert.ok(commands.some((command) => command[0] === "L" && command[1] === 10 && command[2] === 20));
  });
  it("shrinks the radius for thin or short bars", () => {
    const points = ends(barPath(0, 0, 2, 20, 4, "top")).flat();
    assert.ok(points.every((value) => Number.isFinite(value)));
    assert.ok(Math.min(...ends(barPath(0, 0, 2, 20, 4, "top")).map(([, y]) => y)) >= 0);
  });
  for (const end of ["top", "bottom", "left", "right"] as const)
    it(`stays inside its box when rounded at the ${end}`, () => {
      for (const [x, y] of ends(barPath(5, 5, 30, 40, 4, end))) {
        assert.ok(x >= 5 - 1e-9 && x <= 35 + 1e-9 && y >= 5 - 1e-9 && y <= 45 + 1e-9);
      }
    });
});

describe("markerPath", () => {
  for (const shape of ["circle", "square", "triangle", "diamond", "triangle-down"] as const)
    it(`draws a filled ${shape}`, () => {
      const marker = markerPath(shape, 0, 0, 4);
      assert.equal(marker.open, false);
      assert.ok(marker.commands.length >= 4);
    });
  it("marks open shapes as outlines", () => {
    const marker = markerPath("square-open", 0, 0, 4);
    assert.equal(marker.open, true);
    assert.equal(marker.commands.length, 5);
  });
});

describe("hatchLines", () => {
  const inside = (lines: SceneItem[], x: number, y: number, w: number, h: number) =>
    lines.every((line) => line.type === "line" && [line.x1, line.x2].every((value) => value >= x - 1e-9 && value <= x + w + 1e-9) && [line.y1, line.y2].every((value) => value >= y - 1e-9 && value <= y + h + 1e-9));
  for (const pattern of ["diagonal", "back-diagonal", "horizontal", "vertical", "crosshatch"] as const)
    it(`clips ${pattern} hatching to the box`, () => {
      const lines = hatchLines(10, 20, 30, 50, pattern);
      assert.ok(lines.length > 0);
      assert.ok(inside(lines, 10, 20, 30, 50));
    });
  it("draws crosshatching as both diagonals", () => {
    assert.equal(hatchLines(0, 0, 40, 40, "crosshatch").length, hatchLines(0, 0, 40, 40, "diagonal").length + hatchLines(0, 0, 40, 40, "back-diagonal").length);
  });
  it("draws nothing in an empty box", () => {
    assert.deepEqual(hatchLines(0, 0, 0, 10, "diagonal"), []);
  });
  it("uses the stroke it is given", () => {
    const [line] = hatchLines(0, 0, 20, 20, "horizontal", 5, "#ffffff");
    assert.equal(line.type === "line" && line.stroke, "#ffffff");
  });
  it("spaces horizontal lines evenly", () => {
    const ys = hatchLines(0, 0, 10, 20, "horizontal", 5).map((line) => (line.type === "line" ? line.y1 : 0));
    assert.deepEqual(ys, [2.5, 7.5, 12.5, 17.5]);
  });
});

describe("text and rounding", () => {
  it("measures wider text as wider", () => {
    assert.ok(textWidth("Engineering", 12) > textWidth("Law", 12));
  });
  it("scales widths for narrower fonts", () => {
    near(textWidth("Figure", 12, 0.92), textWidth("Figure", 12) * 0.92);
  });
  it("rounds to two decimals", () => {
    assert.equal(r2(1.23456), 1.23);
    assert.equal(r2(-0.005), -0);
  });
});
