/**
 * The rendering engine: turns a laid-out diagram into the same scene of rectangles,
 * lines, paths and text the chart builder exports, so SVG, PDF and PNG come from one
 * set of writers. Themes are chosen for print: colour fills are light enough for black
 * text at well above 7:1; grayscale uses grays only; high contrast is black on white.
 */

import type { PathCommand, Scene, SceneItem } from "../charts/scene";
import { r2 } from "../charts/scene";
import { SPACING, widthFactor, type DiagramLayout } from "./layout";
import type { FlowDiagram, LayoutOptions, NodeTone, Theme } from "./types";

export interface ThemeColours {
  box: string;
  header: string;
  muted: string;
  band: string;
  stroke: string;
  text: string;
  /** Stroke width in pixels. */
  line: number;
}

/** Fills and strokes by theme. Every fill carries black text at 7:1 or more. */
export const THEME_COLOURS: Readonly<Record<Theme, ThemeColours>> = {
  colour: { box: "#ffffff", header: "#fce9a8", muted: "#e4e6ea", band: "#c9ddf2", stroke: "#1f2933", text: "#0b0b0b", line: 1.25 },
  grayscale: { box: "#ffffff", header: "#e6e6e6", muted: "#f2f2f2", band: "#d4d4d4", stroke: "#1a1a1a", text: "#000000", line: 1.25 },
  "high-contrast": { box: "#ffffff", header: "#ffffff", muted: "#ffffff", band: "#ffffff", stroke: "#000000", text: "#000000", line: 1.75 },
};

export const FONTS = {
  sans: { family: "Arial, Helvetica, sans-serif", pdf: { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique" } },
  serif: { family: "'Times New Roman', Times, serif", pdf: { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic" } },
} as const;

const fillFor = (tone: NodeTone | undefined, colours: ThemeColours) => (tone === "header" ? colours.header : tone === "muted" ? colours.muted : colours.box);

/** A filled arrowhead pointing along the last segment of a route. */
export function arrowHead(points: readonly [number, number][], size: number = SPACING.arrowHead): PathCommand[] {
  const [x2, y2] = points[points.length - 1];
  const [x1, y1] = points[points.length - 2];
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const spread = Math.PI / 7;
  const a: [number, number] = [x2 - size * Math.cos(angle - spread), y2 - size * Math.sin(angle - spread)];
  const b: [number, number] = [x2 - size * Math.cos(angle + spread), y2 - size * Math.sin(angle + spread)];
  return [["M", r2(x2), r2(y2)], ["L", r2(a[0]), r2(a[1])], ["L", r2(b[0]), r2(b[1])], ["Z"]];
}

/** The laid-out diagram as a scene, ready for the SVG, PDF and PNG writers. */
export function diagramScene(diagram: FlowDiagram, layout: DiagramLayout, options: LayoutOptions): Scene {
  const colours = THEME_COLOURS[options.theme];
  const font = FONTS[options.typeface];
  const items: SceneItem[] = [];

  for (const band of layout.bands) {
    items.push({ type: "rect", x: r2(band.x), y: r2(band.y), width: r2(band.width), height: r2(band.height), fill: colours.band, stroke: colours.stroke, strokeWidth: colours.line });
    items.push({ type: "text", x: r2(band.x + band.width / 2 + layout.fontSize * 0.35), y: r2(band.y + band.height / 2), text: band.label, size: r2(layout.fontSize), weight: "bold", italic: false, anchor: "middle", fill: colours.text, rotate: -90 });
  }

  // Arrows go under the boxes, so a line never crosses text.
  for (const placed of layout.edges) {
    const trimmed = placed.points.map(([x, y]) => [r2(x), r2(y)] as [number, number]);
    // Stop the line at the arrowhead's base so its end stays sharp.
    const [lx, ly] = trimmed[trimmed.length - 1];
    const [px, py] = trimmed[trimmed.length - 2];
    const length = Math.hypot(lx - px, ly - py) || 1;
    const shortened: [number, number] = [r2(lx - ((lx - px) / length) * SPACING.arrowHead * 0.8), r2(ly - ((ly - py) / length) * SPACING.arrowHead * 0.8)];
    const commands: PathCommand[] = [["M", trimmed[0][0], trimmed[0][1]], ...trimmed.slice(1, -1).map(([x, y]): PathCommand => ["L", x, y]), ["L", shortened[0], shortened[1]]];
    items.push({ type: "path", commands, fill: null, stroke: colours.stroke, strokeWidth: colours.line, dash: null });
    items.push({ type: "path", commands: arrowHead(trimmed), fill: colours.stroke, stroke: null, strokeWidth: 0, dash: null });
    if (placed.edge.label && placed.labelAt) items.push({ type: "text", x: r2(placed.labelAt[0]), y: r2(placed.labelAt[1]), text: placed.edge.label, size: r2(layout.fontSize * 0.9), weight: "normal", italic: true, anchor: "start", fill: colours.text, rotate: 0 });
  }

  for (const placed of layout.nodes) {
    items.push({ type: "rect", x: r2(placed.x), y: r2(placed.y), width: r2(placed.width), height: r2(placed.height), fill: fillFor(placed.node.tone, colours), stroke: colours.stroke, strokeWidth: colours.line });
    for (const line of placed.lines)
      items.push({ type: "text", x: r2(placed.x + line.x), y: r2(placed.y + line.y), text: line.text, size: r2(layout.fontSize), weight: line.bold ? "bold" : "normal", italic: line.italic, anchor: "start", fill: colours.text, rotate: 0 });
  }

  return {
    width: layout.width,
    height: r2(layout.height),
    title: diagram.title,
    description: diagram.description,
    fontFamily: font.family,
    pdfFonts: font.pdf,
    widthFactor: widthFactor(options.typeface),
    items,
    notes: [],
  };
}
