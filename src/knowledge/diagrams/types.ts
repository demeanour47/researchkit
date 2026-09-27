/**
 * Flow diagrams as data: boxes placed on a grid of rows and columns, arrows between them,
 * and labelled bands grouping rows into phases. Reporting diagrams share this shape:
 * PRISMA's identification, screening and inclusion; CONSORT's enrolment, allocation,
 * follow-up and analysis; STROBE's participant flow. A builder describes its diagram
 * here, and the layout, rendering and export engines draw any diagram of this shape.
 */

/** A paragraph inside a box. */
export interface DiagramText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** Indent in steps, for items listed under a heading such as exclusion reasons. */
  indent?: number;
}

/** How a box is filled: an ordinary box, a section heading, or a quieter heading. */
export type NodeTone = "default" | "header" | "muted";

export interface DiagramNode {
  id: string;
  /** Grid position, counted from 0 at the top left. */
  column: number;
  row: number;
  /** Columns the box spans. */
  span?: number;
  paragraphs: DiagramText[];
  tone?: NodeTone;
  align?: "left" | "center";
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  /** Text beside the arrow, such as “excluded”. */
  label?: string;
  /** Arrows can be hidden without removing them from the diagram. */
  hidden?: boolean;
}

/** A band beside the rows it groups, such as PRISMA's “Screening”. */
export interface DiagramBand {
  id: string;
  label: string;
  fromRow: number;
  toRow: number;
}

export interface FlowDiagram {
  title: string;
  /** A text alternative, embedded in the exported image. */
  description: string;
  columns: number;
  rows: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  bands: DiagramBand[];
  /** Relative column widths; equal when left out. */
  columnWeights?: number[];
}

export const ORIENTATIONS = ["portrait", "landscape"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const THEMES = ["colour", "grayscale", "high-contrast"] as const;
export type Theme = (typeof THEMES)[number];

export const TYPEFACES = ["sans", "serif"] as const;
export type Typeface = (typeof TYPEFACES)[number];

export interface LayoutOptions {
  orientation: Orientation;
  theme: Theme;
  typeface: Typeface;
  /** Text size in points. */
  fontSize: number;
}

export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = { orientation: "portrait", theme: "colour", typeface: "sans", fontSize: 9 };

export const THEME_LABELS: Readonly<Record<Theme, string>> = { colour: "Colour", grayscale: "Grayscale", "high-contrast": "High contrast (black and white)" };
export const TYPEFACE_LABELS: Readonly<Record<Typeface, string>> = { sans: "Arial or Helvetica", serif: "Times New Roman" };
export const ORIENTATION_LABELS: Readonly<Record<Orientation, string>> = { portrait: "Portrait", landscape: "Landscape" };
