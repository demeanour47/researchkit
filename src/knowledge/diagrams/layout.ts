/**
 * The layout engine: places a flow diagram's boxes on its grid and routes its arrows.
 * Column widths fill the page width for the orientation; box heights follow their
 * wrapped text, and every box in a row takes the row's height so rows line up. Arrows
 * run straight down within a column, straight across within a row, and otherwise down
 * then across into the side of the box they point to.
 */

import { measureText } from "../research/conceptual-layout";
import type { DiagramEdge, DiagramNode, DiagramText, FlowDiagram, LayoutOptions } from "./types";

/** Spacing in pixels at 96 per inch. */
export const SPACING = {
  margin: 16,
  band: 30,
  bandGap: 12,
  columnGap: 28,
  rowGap: 26,
  padding: 8,
  indent: 12,
  paragraphGap: 3,
  arrowHead: 7,
} as const;

/** The drawing width for each orientation: close to A4's text width, so pasted diagrams keep their type size. */
export const PAGE_WIDTH = { portrait: 680, landscape: 980 } as const;

/** Times is narrower than the Helvetica widths the text is measured with. */
export const widthFactor = (typeface: LayoutOptions["typeface"]) => (typeface === "serif" ? 0.92 : 1);

export interface PlacedLine {
  text: string;
  bold: boolean;
  italic: boolean;
  /** Offsets from the box's top-left corner to the baseline start. */
  x: number;
  y: number;
}

export interface PlacedNode {
  node: DiagramNode;
  x: number;
  y: number;
  width: number;
  height: number;
  lines: PlacedLine[];
}

export interface PlacedEdge {
  edge: DiagramEdge;
  /** The polyline from the source box to the target box's edge, arrowhead at the end. */
  points: [number, number][];
  labelAt: [number, number] | null;
}

export interface PlacedBand {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramLayout {
  width: number;
  height: number;
  /** Text size in pixels. */
  fontSize: number;
  lineHeight: number;
  nodes: PlacedNode[];
  edges: PlacedEdge[];
  bands: PlacedBand[];
}

/** Text wrapped to a width, measured as the typeface sets it. Bold text is a little wider. */
export function wrapParagraph(paragraph: DiagramText, width: number, size: number, factor: number): string[] {
  const scale = factor * (paragraph.bold ? 1.06 : 1);
  const measure = (text: string) => measureText(text, size) * scale;
  const lines: string[] = [];
  for (const piece of paragraph.text.split("\n")) {
    let line = "";
    for (const word of piece.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) <= width || !line) {
        // A word wider than the box on its own stays whole on its line rather than being split mid-word.
        line = candidate;
        continue;
      }
      lines.push(line);
      line = word;
    }
    lines.push(line);
  }
  return lines;
}

/** Lays out a diagram. Throws on a diagram whose boxes fall outside its grid; validate first. */
export function layoutDiagram(diagram: FlowDiagram, options: LayoutOptions): DiagramLayout {
  const size = (options.fontSize * 4) / 3;
  const lineHeight = size * 1.3;
  const factor = widthFactor(options.typeface);
  const hasBands = diagram.bands.length > 0;
  const left = SPACING.margin + (hasBands ? SPACING.band + SPACING.bandGap : 0);
  const available = PAGE_WIDTH[options.orientation] - left - SPACING.margin - SPACING.columnGap * (diagram.columns - 1);
  const weights = diagram.columnWeights?.length === diagram.columns ? diagram.columnWeights : Array.from({ length: diagram.columns }, () => 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const columnWidths = weights.map((weight) => (available * weight) / totalWeight);
  const columnX = columnWidths.map((_, index) => left + columnWidths.slice(0, index).reduce((a, b) => a + b, 0) + SPACING.columnGap * index);

  // Wrap every box's text and measure its natural height.
  const measured = diagram.nodes.map((node) => {
    const span = Math.max(1, node.span ?? 1);
    if (node.column < 0 || node.row < 0 || node.column + span > diagram.columns || node.row >= diagram.rows) throw new RangeError(`Box ${node.id} lies outside the ${diagram.columns} × ${diagram.rows} grid.`);
    const width = columnWidths.slice(node.column, node.column + span).reduce((a, b) => a + b, 0) + SPACING.columnGap * (span - 1);
    const lines: PlacedLine[] = [];
    let y = SPACING.padding;
    node.paragraphs.forEach((paragraph, index) => {
      if (index > 0) y += SPACING.paragraphGap;
      const indent = (paragraph.indent ?? 0) * SPACING.indent;
      for (const text of wrapParagraph(paragraph, width - SPACING.padding * 2 - indent, size, factor)) {
        y += lineHeight;
        const textWidth = measureText(text, size) * factor * (paragraph.bold ? 1.06 : 1);
        const x = node.align === "center" ? (width - textWidth) / 2 : SPACING.padding + indent;
        lines.push({ text, bold: Boolean(paragraph.bold), italic: Boolean(paragraph.italic), x, y: y - lineHeight * 0.27 });
      }
    });
    return { node, width, lines, height: y + SPACING.padding };
  });

  // Rows take their tallest box; empty rows collapse.
  const rowHeights = Array.from({ length: diagram.rows }, (_, row) => Math.max(0, ...measured.filter((entry) => entry.node.row === row).map((entry) => entry.height)));
  // A band's label runs along it, so a band shorter than its label grows its last row to fit.
  for (const band of diagram.bands) {
    const needed = measureText(band.label, size) * factor * 1.06 + SPACING.padding * 2;
    const rows = rowHeights.slice(band.fromRow, band.toRow + 1).filter((height) => height > 0);
    const current = rowHeights.slice(band.fromRow, band.toRow + 1).reduce((a, b) => a + b, 0) + SPACING.rowGap * Math.max(0, rows.length - 1);
    if (needed > current && rowHeights[band.toRow] > 0) rowHeights[band.toRow] += needed - current;
  }
  const rowY: number[] = [];
  let y = SPACING.margin;
  rowHeights.forEach((height, row) => {
    rowY[row] = y;
    if (height > 0) y += height + SPACING.rowGap;
  });
  const height = y - SPACING.rowGap + SPACING.margin;

  const nodes: PlacedNode[] = measured.map((entry) => {
    const rowHeight = rowHeights[entry.node.row];
    // Centred text sits in the middle of a row taller than it needs.
    const shift = entry.node.align === "center" ? (rowHeight - entry.height) / 2 : 0;
    return { node: entry.node, x: columnX[entry.node.column], y: rowY[entry.node.row], width: entry.width, height: rowHeight, lines: entry.lines.map((line) => ({ ...line, y: line.y + shift })) };
  });
  const byId = new Map(nodes.map((placed) => [placed.node.id, placed]));

  const edges: PlacedEdge[] = diagram.edges
    .filter((edge) => !edge.hidden)
    .map((edge) => {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (!from || !to) throw new RangeError(`Arrow ${edge.id} joins a box that doesn't exist.`);
      return { edge, ...route(from, to) };
    });

  const bands: PlacedBand[] = diagram.bands.map((band) => {
    const top = rowY[band.fromRow];
    const bottom = rowY[band.toRow] + rowHeights[band.toRow];
    return { label: band.label, x: SPACING.margin, y: top, width: SPACING.band, height: Math.max(0, bottom - top) };
  });

  return { width: PAGE_WIDTH[options.orientation], height, fontSize: size, lineHeight, nodes, edges, bands };
}

/** The route between two boxes: down within a column, across within a row, otherwise down then across. */
export function route(from: Pick<PlacedNode, "x" | "y" | "width" | "height">, to: Pick<PlacedNode, "x" | "y" | "width" | "height">): { points: [number, number][]; labelAt: [number, number] | null } {
  const fromCentre = from.x + from.width / 2;
  const toCentre = to.x + to.width / 2;
  const toMiddle = to.y + to.height / 2;
  const sameColumn = Math.abs(fromCentre - toCentre) < 1;
  if (sameColumn && to.y >= from.y + from.height) {
    return { points: [[fromCentre, from.y + from.height], [fromCentre, to.y]], labelAt: [fromCentre + 6, (from.y + from.height + to.y) / 2] };
  }
  if (Math.abs(to.y - from.y) < 1) {
    const rightward = to.x >= from.x + from.width;
    const y = from.y + from.height / 2;
    const start: [number, number] = [rightward ? from.x + from.width : from.x, y];
    const end: [number, number] = [rightward ? to.x : to.x + to.width, y];
    return { points: [start, end], labelAt: [(start[0] + end[0]) / 2, y - 6] };
  }
  // Down from the source, then across into the nearer side of the target.
  const entersFromRight = fromCentre > toCentre;
  const endX = entersFromRight ? to.x + to.width : to.x;
  return { points: [[fromCentre, from.y + from.height], [fromCentre, toMiddle], [endX, toMiddle]], labelAt: [fromCentre + 6, (from.y + from.height + toMiddle) / 2] };
}
