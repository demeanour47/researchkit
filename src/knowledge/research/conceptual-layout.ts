/**
 * Lays out a conceptual framework as boxes and straight connectors, deterministically.
 *
 * Independent variables sit in a column on the left and dependent variables on the
 * right. Moderators sit in a band above, with arrows down to the connector they
 * moderate; mediators sit in a band below, between the two columns; control and
 * extraneous variables sit in labelled groups at the bottom. Connectors leave and meet
 * boxes at the sides that keep them clear of other boxes, and any connector that
 * still passes behind a box is reported. Units are CSS pixels at 96 per inch.
 */

import {
  RELATIONSHIP_TYPE_INFO,
  VARIABLE_TYPE_LABELS,
  type ConceptualFramework,
  type FrameworkRelationship,
  type FrameworkVariable,
  type Point,
  type VariableType,
} from "./conceptual-types";

export const LAYOUT = {
  margin: 24,
  boxWidth: 184,
  paddingX: 12,
  paddingY: 12,
  minBoxHeight: 56,
  fontSize: 14,
  lineHeight: 18,
  captionSize: 11,
  captionHeight: 16,
  columnGap: 150,
  rowGap: 24,
  bandGap: 72,
  slotGap: 32,
  labelSize: 12,
  labelPaddingX: 6,
  labelHeight: 18,
  arrowLength: 10,
  arrowHalfWidth: 5,
  parallelOffset: 10,
  moderationSpacing: 36,
  groupPadding: 12,
  groupLabelHeight: 22,
  cornerRadius: 8,
} as const;

/**
 * Advance widths of Helvetica (and the metrically identical Arial) for printable
 * ASCII, in thousandths of the font size, from the standard Adobe font metrics.
 * Characters outside this range are measured as 556, the width of a digit.
 */
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278,
  584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
  667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500,
  278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const DEFAULT_WIDTH = 556;

/** The width of text in Helvetica at a given size. */
export function measureText(text: string, size: number): number {
  let units = 0;
  for (const character of text) {
    const code = character.codePointAt(0)!;
    units += code >= 32 && code <= 126 ? HELVETICA_WIDTHS[code - 32] : DEFAULT_WIDTH;
  }
  return (units * size) / 1000;
}

/** Wraps text to a width, breaking between words, and inside a word only when it can't fit on a line. */
export function wrapText(text: string, maxWidth: number, size: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measureText(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    // A single word wider than the box is broken into pieces that fit.
    let piece = "";
    for (const character of word) {
      if (measureText(piece + character, size) > maxWidth && piece) {
        lines.push(piece);
        piece = "";
      }
      piece += character;
    }
    line = piece;
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

export interface NodeBox {
  id: string;
  type: VariableType;
  x: number;
  y: number;
  width: number;
  height: number;
  /** The box label, wrapped. */
  lines: string[];
  /** The variable type, shown in small text when type captions are on. */
  caption: string | null;
  /** Whether the researcher has moved this box. */
  moved: boolean;
}

export interface EdgeLabel {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgePath {
  id: string;
  from: Point;
  to: Point;
  /** The end of the visible line, short of any arrowhead. */
  lineFrom: Point;
  lineTo: Point;
  /** Arrowhead triangles, each as three points. */
  arrowheads: [Point, Point, Point][];
  dash: readonly number[] | null;
  label: EdgeLabel | null;
}

export interface GroupBox {
  type: "control" | "extraneous";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Crossing {
  edge: string;
  /** The box the connector passes behind. */
  node: string;
}

/** Two connectors drawn on top of each other along part of their length. */
export interface Overlap {
  edges: [string, string];
}

export interface FrameworkLayout {
  width: number;
  height: number;
  nodes: NodeBox[];
  edges: EdgePath[];
  groups: GroupBox[];
  /** Connectors that pass behind a box they don't connect to. */
  crossings: Crossing[];
  /** Connectors that lie on top of each other. */
  overlaps: Overlap[];
}

export interface LayoutOptions {
  /** Show each variable's type in small text inside its box. */
  showTypes?: boolean;
}

const BAND_TYPES: readonly VariableType[] = ["mediator", "moderator", "control", "extraneous"];
const GROUP_LABELS = { control: "Control variables", extraneous: "Extraneous variables" } as const;

function sizeBox(variable: FrameworkVariable, showTypes: boolean): Omit<NodeBox, "x" | "y" | "moved"> {
  const lines = wrapText(variable.shortLabel || variable.name, LAYOUT.boxWidth - 2 * LAYOUT.paddingX, LAYOUT.fontSize);
  const height = Math.max(
    LAYOUT.minBoxHeight,
    2 * LAYOUT.paddingY + (showTypes ? LAYOUT.captionHeight : 0) + lines.length * LAYOUT.lineHeight,
  );
  return {
    id: variable.id,
    type: variable.type,
    width: LAYOUT.boxWidth,
    height,
    lines,
    caption: showTypes ? VARIABLE_TYPE_LABELS[variable.type] : null,
  };
}

const columnHeight = (boxes: readonly { height: number }[]) =>
  boxes.reduce((sum, box) => sum + box.height, 0) + Math.max(0, boxes.length - 1) * LAYOUT.rowGap;

/** Lays out the framework. Moved boxes keep their positions; everything else is placed automatically. */
export function layoutFramework(framework: ConceptualFramework, options: LayoutOptions = {}): FrameworkLayout {
  const showTypes = options.showTypes ?? false;
  const sized = framework.variables.map((variable) => sizeBox(variable, showTypes));
  const of = (type: VariableType) => sized.filter((box) => box.type === type);
  const [ivs, dvs, mediators, moderators] = [of("independent"), of("dependent"), of("mediator"), of("moderator")];
  const { margin, boxWidth, columnGap, rowGap, bandGap, slotGap } = LAYOUT;

  const slots = Math.max(mediators.length, moderators.length, 1);
  const middleWidth = slots * boxWidth + (slots - 1) * slotGap;
  const xLeft = margin;
  const xMiddle = xLeft + boxWidth + columnGap;
  const xRight = xMiddle + middleWidth + columnGap;
  const autoWidth = xRight + boxWidth + margin;

  const placed = new Map<string, { x: number; y: number }>();
  let cursor = margin;

  // Moderators: a band across the middle, bottoms aligned so their arrows start level.
  if (moderators.length > 0) {
    const bandHeight = Math.max(...moderators.map((box) => box.height));
    const start = xMiddle + (middleWidth - (moderators.length * boxWidth + (moderators.length - 1) * slotGap)) / 2;
    moderators.forEach((box, index) => placed.set(box.id, { x: start + index * (boxWidth + slotGap), y: cursor + bandHeight - box.height }));
    cursor += bandHeight + bandGap;
  }

  // Independent and dependent columns, each centred on the main band.
  const mainHeight = Math.max(columnHeight(ivs), columnHeight(dvs));
  for (const [column, x] of [
    [ivs, xLeft],
    [dvs, xRight],
  ] as const) {
    let y = cursor + (mainHeight - columnHeight(column)) / 2;
    for (const box of column) {
      placed.set(box.id, { x, y });
      y += box.height + rowGap;
    }
  }
  if (mainHeight > 0) cursor += mainHeight + bandGap;

  // Mediators: a band below the main band, between the columns, tops aligned.
  if (mediators.length > 0) {
    const bandHeight = Math.max(...mediators.map((box) => box.height));
    const start = xMiddle + (middleWidth - (mediators.length * boxWidth + (mediators.length - 1) * slotGap)) / 2;
    mediators.forEach((box, index) => placed.set(box.id, { x: start + index * (boxWidth + slotGap), y: cursor }));
    cursor += bandHeight + bandGap;
  }

  // Control and extraneous variables: labelled groups across the bottom, wrapping into rows.
  const { groupPadding, groupLabelHeight } = LAYOUT;
  const innerWidth = autoWidth - 2 * margin - 2 * groupPadding;
  const perRow = Math.max(1, Math.floor((innerWidth + slotGap) / (boxWidth + slotGap)));
  for (const type of ["control", "extraneous"] as const) {
    const members = of(type);
    if (members.length === 0) continue;
    let y = cursor + groupPadding + groupLabelHeight;
    for (let row = 0; row < members.length; row += perRow) {
      const rowBoxes = members.slice(row, row + perRow);
      const rowHeight = Math.max(...rowBoxes.map((box) => box.height));
      rowBoxes.forEach((box, index) => placed.set(box.id, { x: margin + groupPadding + index * (boxWidth + slotGap), y }));
      y += rowHeight + rowGap;
    }
    cursor = y - rowGap + groupPadding + bandGap / 2;
  }

  const nodes: NodeBox[] = sized.map((box) => {
    const moved = framework.positions[box.id];
    const position = moved ?? placed.get(box.id)!;
    return { ...box, x: position.x, y: position.y, moved: Boolean(moved) };
  });

  const groups: GroupBox[] = (["control", "extraneous"] as const).flatMap((type) => {
    const members = nodes.filter((node) => node.type === type);
    if (members.length === 0) return [];
    const left = Math.min(...members.map((node) => node.x)) - groupPadding;
    const top = Math.min(...members.map((node) => node.y)) - groupPadding - groupLabelHeight;
    const right = Math.max(...members.map((node) => node.x + node.width)) + groupPadding;
    const bottom = Math.max(...members.map((node) => node.y + node.height)) + groupPadding;
    return [{ type, label: GROUP_LABELS[type], x: left, y: top, width: right - left, height: bottom - top }];
  });

  const edges = layoutEdges(framework.relationships, nodes);
  const extent = [...nodes, ...groups];
  const width = Math.ceil(Math.max(autoWidth, ...extent.map((box) => box.x + box.width + margin)));
  const height = Math.ceil(Math.max(margin * 2, ...extent.map((box) => box.y + box.height + margin)));

  return { width, height, nodes, edges, groups, crossings: findCrossings(framework.relationships, edges, nodes), overlaps: findOverlaps(edges) };
}

// Connectors.

const centre = (box: NodeBox): Point => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
const isBand = (box: NodeBox) => BAND_TYPES.includes(box.type);
const below = (a: NodeBox, b: NodeBox) => a.y >= b.y + b.height;
const rightOf = (a: NodeBox, b: NodeBox) => a.x >= b.x + b.width;

const sides = {
  top: (box: NodeBox): Point => ({ x: box.x + box.width / 2, y: box.y }),
  bottom: (box: NodeBox): Point => ({ x: box.x + box.width / 2, y: box.y + box.height }),
  left: (box: NodeBox): Point => ({ x: box.x, y: box.y + box.height / 2 }),
  right: (box: NodeBox): Point => ({ x: box.x + box.width, y: box.y + box.height / 2 }),
};

/**
 * Where a connector leaves its source. Boxes in a band leave upwards or downwards,
 * so the line clears the other boxes in their band; boxes in a column leave sideways.
 */
function startPoint(source: NodeBox, target: NodeBox): Point {
  if (isBand(source) && below(source, target)) return sides.top(source);
  if (isBand(source) && below(target, source)) return sides.bottom(source);
  if (rightOf(target, source)) return sides.right(source);
  if (rightOf(source, target)) return sides.left(source);
  return below(target, source) ? sides.bottom(source) : sides.top(source);
}

/** Where a connector meets its target, by the same rules. */
function endPoint(source: NodeBox, target: NodeBox): Point {
  if (isBand(target) && below(target, source)) return sides.top(target);
  if (isBand(target) && below(source, target)) return sides.bottom(target);
  if (rightOf(target, source)) return sides.left(target);
  if (rightOf(source, target)) return sides.right(target);
  return below(target, source) ? sides.top(target) : sides.bottom(target);
}

/** The point on a connector a moderator's arrow meets: level with the moderator where possible. */
function pointOnConnector(from: Point, to: Point, preferredX: number): Point {
  const low = Math.min(from.x, to.x);
  const high = Math.max(from.x, to.x);
  const span = high - low;
  if (span < 1) return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const x = Math.min(Math.max(preferredX, low + span * 0.2), high - span * 0.2);
  const t = (x - from.x) / (to.x - from.x);
  return { x, y: from.y + t * (to.y - from.y) };
}

function arrowhead(tip: Point, from: Point): [Point, Point, Point] {
  const length = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  const ux = (tip.x - from.x) / length;
  const uy = (tip.y - from.y) / length;
  const base = { x: tip.x - ux * LAYOUT.arrowLength, y: tip.y - uy * LAYOUT.arrowLength };
  return [
    round(tip),
    round({ x: base.x - uy * LAYOUT.arrowHalfWidth, y: base.y + ux * LAYOUT.arrowHalfWidth }),
    round({ x: base.x + uy * LAYOUT.arrowHalfWidth, y: base.y - ux * LAYOUT.arrowHalfWidth }),
  ];
}

const round = (point: Point): Point => ({ x: Math.round(point.x * 100) / 100, y: Math.round(point.y * 100) / 100 });

/** Where along a connector its label sits: the middle, or nearer the source when a moderation arrow meets the middle. */
export const LABEL_POSITION = { plain: 0.5, moderated: 0.28 } as const;

function withArrows(id: string, from: Point, to: Point, relationship: FrameworkRelationship, labelAt: number = LABEL_POSITION.plain): EdgePath {
  const { style } = RELATIONSHIP_TYPE_INFO[relationship.type];
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const ux = (to.x - from.x) / length;
  const uy = (to.y - from.y) / length;
  const shorten = Math.min(LAYOUT.arrowLength, length / 3);
  const headAtEnd = style.arrows !== "none";
  const headAtStart = style.arrows === "two-way";
  const lineFrom = headAtStart ? { x: from.x + ux * shorten, y: from.y + uy * shorten } : from;
  const lineTo = headAtEnd ? { x: to.x - ux * shorten, y: to.y - uy * shorten } : to;
  const arrowheads: [Point, Point, Point][] = [];
  if (headAtEnd) arrowheads.push(arrowhead(to, from));
  if (headAtStart) arrowheads.push(arrowhead(from, to));
  const text = relationship.label;
  const label = text
    ? (() => {
        const width = Math.ceil(ofWidth(text));
        const x = from.x + (to.x - from.x) * labelAt;
        const y = from.y + (to.y - from.y) * labelAt;
        return { text, x: x - width / 2, y: y - LAYOUT.labelHeight / 2, width, height: LAYOUT.labelHeight };
      })()
    : null;
  return { id, from: round(from), to: round(to), lineFrom: round(lineFrom), lineTo: round(lineTo), arrowheads, dash: style.dash, label: label && { ...label, ...round(label) } };
}

const ofWidth = (text: string) => measureText(text, LAYOUT.labelSize) + 2 * LAYOUT.labelPaddingX;

function layoutEdges(relationships: readonly FrameworkRelationship[], nodes: readonly NodeBox[]): EdgePath[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const drawable = relationships.filter((relationship) => byId.has(relationship.source) && byId.has(relationship.target) && relationship.source !== relationship.target);

  // Connectors joining the same two boxes are drawn side by side instead of on top of each other.
  const pairKey = (relationship: FrameworkRelationship) => [relationship.source, relationship.target].sort().join("|");
  const siblings = new Map<string, FrameworkRelationship[]>();
  for (const relationship of drawable) {
    if (relationship.type === "moderation" && relationship.moderates) continue;
    siblings.set(pairKey(relationship), [...(siblings.get(pairKey(relationship)) ?? []), relationship]);
  }

  const moderated = new Set(drawable.filter((relationship) => relationship.type === "moderation" && relationship.moderates).map((relationship) => relationship.moderates!));
  const paths = new Map<string, EdgePath>();
  for (const relationship of drawable) {
    if (relationship.type === "moderation" && relationship.moderates) continue;
    const source = byId.get(relationship.source)!;
    const target = byId.get(relationship.target)!;
    let from = startPoint(source, target);
    let to = endPoint(source, target);
    const group = siblings.get(pairKey(relationship))!;
    if (group.length > 1) {
      // Offset perpendicular to a shared direction, so A→B and B→A separate consistently.
      const [first] = [relationship.source, relationship.target].sort();
      const sign = relationship.source === first ? 1 : -1;
      const dx = (to.x - from.x) * sign;
      const dy = (to.y - from.y) * sign;
      const length = Math.hypot(dx, dy) || 1;
      const offset = (group.indexOf(relationship) - (group.length - 1) / 2) * LAYOUT.parallelOffset;
      from = { x: from.x - (dy / length) * offset, y: from.y + (dx / length) * offset };
      to = { x: to.x - (dy / length) * offset, y: to.y + (dx / length) * offset };
    }
    const labelAt = moderated.has(relationship.id) ? LABEL_POSITION.moderated : LABEL_POSITION.plain;
    paths.set(relationship.id, withArrows(relationship.id, from, to, relationship, labelAt));
  }

  // Moderations point at the connector they moderate. A moderator of several
  // connectors sends its arrows from points spread across its box, so they never overlap.
  const moderations = drawable.filter((relationship) => relationship.type === "moderation" && relationship.moderates);
  for (const relationship of moderations) {
    const moderator = byId.get(relationship.source)!;
    const target = paths.get(relationship.moderates!);
    if (!target) {
      const box = byId.get(relationship.target)!;
      paths.set(relationship.id, withArrows(relationship.id, startPoint(moderator, box), endPoint(moderator, box), relationship));
      continue;
    }
    const own = moderations.filter((candidate) => candidate.source === relationship.source && paths.has(candidate.moderates!));
    const spacing = Math.min(LAYOUT.moderationSpacing, moderator.width / (own.length + 1));
    const offset = (own.indexOf(relationship) - (own.length - 1) / 2) * spacing;
    const to = pointOnConnector(target.from, target.to, centre(moderator).x + offset);
    const edge = to.y >= moderator.y + moderator.height ? sides.bottom(moderator) : sides.top(moderator);
    paths.set(relationship.id, withArrows(relationship.id, { x: to.x, y: edge.y }, to, relationship));
  }
  return drawable.map((relationship) => paths.get(relationship.id)!).filter(Boolean);
}

// Crossings.

/** Whether a segment passes through the inside of a rectangle (touching its edge doesn't count). */
export function segmentCrossesBox(a: Point, b: Point, box: { x: number; y: number; width: number; height: number }): boolean {
  const inset = 1;
  const left = box.x + inset;
  const right = box.x + box.width - inset;
  const top = box.y + inset;
  const bottom = box.y + box.height - inset;
  // Liang–Barsky clipping: the segment crosses the box if a part of it lies inside.
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  for (const [p, q] of [
    [-dx, a.x - left],
    [dx, right - a.x],
    [-dy, a.y - top],
    [dy, bottom - a.y],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  return t1 - t0 > 1e-9;
}

function findCrossings(relationships: readonly FrameworkRelationship[], edges: readonly EdgePath[], nodes: readonly NodeBox[]): Crossing[] {
  const ends = new Map(relationships.map((relationship) => [relationship.id, new Set([relationship.source, relationship.target])]));
  const crossings: Crossing[] = [];
  for (const edge of edges) {
    for (const node of nodes) {
      if (ends.get(edge.id)?.has(node.id)) continue;
      if (segmentCrossesBox(edge.from, edge.to, node)) crossings.push({ edge: edge.id, node: node.id });
    }
  }
  return crossings;
}

/** Whether two segments lie along the same line and share more than a point. */
export function segmentsOverlap(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
  const dx = a2.x - a1.x;
  const dy = a2.y - a1.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-9) return false;
  const distance = (p: Point) => Math.abs((p.x - a1.x) * dy - (p.y - a1.y) * dx) / length;
  if (distance(b1) > 0.5 || distance(b2) > 0.5) return false;
  const along = (p: Point) => ((p.x - a1.x) * dx + (p.y - a1.y) * dy) / length;
  const [low, high] = [Math.min(along(b1), along(b2)), Math.max(along(b1), along(b2))];
  return Math.min(high, length) - Math.max(low, 0) > 1;
}

function findOverlaps(edges: readonly EdgePath[]): Overlap[] {
  const overlaps: Overlap[] = [];
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      if (segmentsOverlap(edges[i].from, edges[i].to, edges[j].from, edges[j].to)) overlaps.push({ edges: [edges[i].id, edges[j].id] });
    }
  }
  return overlaps;
}
