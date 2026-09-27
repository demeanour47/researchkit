/**
 * The drawing model every export draws from. A chart becomes a scene of simple
 * primitives: rectangles, lines, paths of straight and cubic Bézier segments, and text.
 * Circles, arcs and rounded ends are converted to Bézier curves here, and hatching to
 * clipped lines, so SVG and PDF draw exactly the same shapes with nothing format-specific.
 */

import { measureText } from "../research/conceptual-layout";
import type { MarkerShape, Pattern } from "./palette";

export type PathCommand = ["M", number, number] | ["L", number, number] | ["C", number, number, number, number, number, number] | ["Z"];

export type SceneItem =
  | { type: "rect"; x: number; y: number; width: number; height: number; fill: string | null; stroke: string | null; strokeWidth: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number; dash: number[] | null }
  | { type: "path"; commands: PathCommand[]; fill: string | null; stroke: string | null; strokeWidth: number; dash: number[] | null }
  | { type: "text"; x: number; y: number; text: string; size: number; weight: "normal" | "bold"; italic: boolean; anchor: "start" | "middle" | "end"; fill: string; rotate: number };

export interface Scene {
  width: number;
  height: number;
  /** The chart's name, embedded for screen readers and file metadata. */
  title: string;
  /** A text alternative, embedded in the SVG. */
  description: string;
  fontFamily: string;
  pdfFonts: { regular: string; bold: string; italic: string };
  /** Scales measured Helvetica widths to the font used, so anchored text lines up in every format. */
  widthFactor: number;
  items: SceneItem[];
  /** Adjustments made while drawing, such as rotating crowded labels. */
  notes: string[];
}

/** Text width in pixels at a size in pixels, measured in Helvetica and scaled for other fonts. */
export const textWidth = (text: string, size: number, factor = 1) => measureText(text, size) * factor;

/** Four Bézier quarter-circles; the control distance 0.5523 × r keeps the error below 0.03%. */
export function circlePath(cx: number, cy: number, r: number): PathCommand[] {
  const k = 0.5523 * r;
  return [
    ["M", cx + r, cy],
    ["C", cx + r, cy + k, cx + k, cy + r, cx, cy + r],
    ["C", cx - k, cy + r, cx - r, cy + k, cx - r, cy],
    ["C", cx - r, cy - k, cx - k, cy - r, cx, cy - r],
    ["C", cx + k, cy - r, cx + r, cy - k, cx + r, cy],
    ["Z"],
  ];
}

/** A point on a circle; angles are in radians clockwise from twelve o'clock, as charts read. */
export const polar = (cx: number, cy: number, r: number, angle: number): [number, number] => [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];

/**
 * An arc as Bézier segments of at most 90°, each with control distance 4/3 · tan(θ/4) · r,
 * the standard approximation. Starts with a line to the arc's start unless moveTo is set.
 */
export function arcCommands(cx: number, cy: number, r: number, start: number, end: number, moveTo: boolean): PathCommand[] {
  const commands: PathCommand[] = [];
  const [sx, sy] = polar(cx, cy, r, start);
  commands.push(moveTo ? ["M", sx, sy] : ["L", sx, sy]);
  const sweep = end - start;
  const segments = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-9));
  const step = sweep / segments;
  for (let index = 0; index < segments; index++) {
    const a = start + step * index;
    const b = a + step;
    const k = (4 / 3) * Math.tan(step / 4) * r;
    const [ax, ay] = polar(cx, cy, r, a);
    const [bx, by] = polar(cx, cy, r, b);
    // Tangents at a and b, in the direction of travel.
    commands.push(["C", ax + k * Math.cos(a), ay + k * Math.sin(a), bx - k * Math.cos(b), by - k * Math.sin(b), bx, by]);
  }
  return commands;
}

/** A pie slice, or a doughnut segment when inner is above zero. */
export function slicePath(cx: number, cy: number, outer: number, inner: number, start: number, end: number): PathCommand[] {
  if (inner <= 0) return [["M", cx, cy], ...arcCommands(cx, cy, outer, start, end, false), ["Z"]];
  return [...arcCommands(cx, cy, outer, start, end, true), ...arcCommands(cx, cy, inner, end, start, false), ["Z"]];
}

/**
 * A bar with its data end rounded and its baseline end square. The radius shrinks for
 * bars too short or thin to hold it.
 */
export function barPath(x: number, y: number, width: number, height: number, radius: number, end: "top" | "bottom" | "left" | "right"): PathCommand[] {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const k = 0.5523 * r;
  const right = x + width;
  const bottom = y + height;
  if (r === 0) return [["M", x, y], ["L", right, y], ["L", right, bottom], ["L", x, bottom], ["Z"]];
  switch (end) {
    case "top":
      return [["M", x, bottom], ["L", x, y + r], ["C", x, y + r - k, x + r - k, y, x + r, y], ["L", right - r, y], ["C", right - r + k, y, right, y + r - k, right, y + r], ["L", right, bottom], ["Z"]];
    case "bottom":
      return [["M", x, y], ["L", right, y], ["L", right, bottom - r], ["C", right, bottom - r + k, right - r + k, bottom, right - r, bottom], ["L", x + r, bottom], ["C", x + r - k, bottom, x, bottom - r + k, x, bottom - r], ["Z"]];
    case "right":
      return [["M", x, y], ["L", right - r, y], ["C", right - r + k, y, right, y + r - k, right, y + r], ["L", right, bottom - r], ["C", right, bottom - r + k, right - r + k, bottom, right - r, bottom], ["L", x, bottom], ["Z"]];
    case "left":
      return [["M", right, y], ["L", x + r, y], ["C", x + r - k, y, x, y + r - k, x, y + r], ["L", x, bottom - r], ["C", x, bottom - r + k, x + r - k, bottom, x + r, bottom], ["L", right, bottom], ["Z"]];
  }
}

/** A marker shape centred on a point. Open shapes are drawn as outlines. */
export function markerPath(shape: MarkerShape, cx: number, cy: number, r: number): { commands: PathCommand[]; open: boolean } {
  const open = shape.endsWith("-open");
  const base = shape.replace("-open", "");
  switch (base) {
    case "square":
      return { commands: [["M", cx - r * 0.9, cy - r * 0.9], ["L", cx + r * 0.9, cy - r * 0.9], ["L", cx + r * 0.9, cy + r * 0.9], ["L", cx - r * 0.9, cy + r * 0.9], ["Z"]], open };
    case "triangle":
      return { commands: [["M", cx, cy - r * 1.15], ["L", cx + r * 1.05, cy + r * 0.75], ["L", cx - r * 1.05, cy + r * 0.75], ["Z"]], open };
    case "triangle-down":
      return { commands: [["M", cx, cy + r * 1.15], ["L", cx + r * 1.05, cy - r * 0.75], ["L", cx - r * 1.05, cy - r * 0.75], ["Z"]], open };
    case "diamond":
      return { commands: [["M", cx, cy - r * 1.25], ["L", cx + r * 1.25, cy], ["L", cx, cy + r * 1.25], ["L", cx - r * 1.25, cy], ["Z"]], open };
    default:
      return { commands: circlePath(cx, cy, r), open };
  }
}

/** Hatching lines inside a rectangle, clipped to it exactly, for grayscale fills. */
export function hatchLines(x: number, y: number, width: number, height: number, pattern: Pattern, spacing = 5, stroke = "#1a1a1a"): SceneItem[] {
  // Callers pass a stroke that contrasts with the fill, so hatching shows on dark grays too.
  if (width <= 0 || height <= 0) return [];
  const lines: SceneItem[] = [];
  const add = (x1: number, y1: number, x2: number, y2: number) => lines.push({ type: "line", x1, y1, x2, y2, stroke, strokeWidth: 0.6, dash: null });
  const right = x + width;
  const bottom = y + height;
  if (pattern === "horizontal") for (let line = y + spacing / 2; line < bottom; line += spacing) add(x, line, right, line);
  if (pattern === "vertical") for (let line = x + spacing / 2; line < right; line += spacing) add(line, y, line, bottom);
  const diagonal = (direction: 1 | -1) => {
    // Lines x + y = c (rising to the right on screen) or y − x = c (falling), spaced along their normal.
    const step = spacing * Math.SQRT2;
    const [low, high] = direction === 1 ? [x + y, right + bottom] : [y - right, bottom - x];
    for (let c = low + step / 2; c < high; c += step) {
      const x1 = direction === 1 ? Math.max(x, c - bottom) : Math.max(x, y - c);
      const x2 = direction === 1 ? Math.min(right, c - y) : Math.min(right, bottom - c);
      if (x2 - x1 < 0.01) continue;
      add(x1, direction === 1 ? c - x1 : x1 + c, x2, direction === 1 ? c - x2 : x2 + c);
    }
  };
  if (pattern === "diagonal" || pattern === "crosshatch") diagonal(1);
  if (pattern === "back-diagonal" || pattern === "crosshatch") diagonal(-1);
  return lines;
}

/** Rounds coordinates in a scene to two decimals, so exports are compact and stable. */
export const r2 = (value: number) => Math.round(value * 100) / 100;
