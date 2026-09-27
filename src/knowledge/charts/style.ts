/**
 * Academic formatting presets. APA style (7th edition) places the figure number and
 * title above the figure in the document rather than inside the image, uses a
 * sans-serif font, and keeps gridlines to a minimum. IEEE places a caption below the
 * figure and is often printed in grayscale, with serif fonts to match the text. These
 * presets follow those conventions; journals' own guidelines take precedence.
 */

import type { ChartOptions, PaletteId, StylePreset } from "./types";

export interface StyleSpec {
  preset: StylePreset;
  label: string;
  fontFamily: string;
  /** The standard PDF fonts that match. */
  pdfFonts: { regular: string; bold: string; italic: string };
  /** Serif text is narrower than the sans-serif widths used to measure it. */
  widthFactor: number;
  /** Whether the title and subtitle are drawn inside the image. */
  titleInFigure: boolean;
  /** Rounded data ends on bars, for screens; publication presets use square ends. */
  roundedBars: boolean;
  /** Defaults the preset applies when chosen. */
  defaults: Partial<Pick<ChartOptions, "gridlines" | "palette" | "fontSize">>;
  /** Advice shown with the preset. */
  advice: string;
}

const SANS = { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique" };

export const STYLES: Readonly<Record<StylePreset, StyleSpec>> = {
  standard: {
    preset: "standard",
    label: "Standard",
    fontFamily: "Helvetica, Arial, sans-serif",
    pdfFonts: SANS,
    widthFactor: 1,
    titleInFigure: true,
    roundedBars: true,
    defaults: {},
    advice: "A clean style for reports and presentations, with the title inside the figure.",
  },
  apa: {
    preset: "apa",
    label: "APA-friendly",
    fontFamily: "Arial, Helvetica, sans-serif",
    pdfFonts: SANS,
    widthFactor: 1,
    titleInFigure: false,
    roundedBars: false,
    defaults: { gridlines: false, fontSize: 11 },
    advice: "APA style puts the figure number in bold and the title in italics above the figure in your document, not inside the image. Use a sans-serif font between 8 and 14 points.",
  },
  ieee: {
    preset: "ieee",
    label: "IEEE-friendly",
    fontFamily: "'Times New Roman', Times, serif",
    pdfFonts: { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic" },
    widthFactor: 0.92,
    titleInFigure: false,
    roundedBars: false,
    defaults: { gridlines: true, palette: "grayscale", fontSize: 9 },
    advice: "IEEE style puts a caption below the figure, such as “Fig. 1.”, and figures are often printed in grayscale. Keep text at least 8 points at the final printed size.",
  },
};

/** The options with a preset's defaults applied, as when the researcher chooses it. */
export function applyStyle(options: ChartOptions, preset: StylePreset): ChartOptions {
  const style = STYLES[preset];
  if (!style) throw new RangeError(`Unknown style: ${preset}`);
  return { ...options, ...style.defaults, style: preset };
}

/** The caption to place in the document, in the preset's convention. The number is for the researcher to set. */
export function figureCaption(options: Pick<ChartOptions, "title" | "subtitle" | "style">, number = 1): string {
  const title = options.title.trim() || "[Figure title]";
  if (options.style === "apa") return `Figure ${number}\n${title}`;
  if (options.style === "ieee") return `Fig. ${number}. ${title}${/[.!?]$/.test(title) ? "" : "."}`;
  return `Figure ${number}. ${title}`;
}

export const paletteLabel: Readonly<Record<PaletteId, string>> = {
  standard: "Standard (colour-blind-safe)",
  blues: "Shades of blue (for ordered categories)",
  grayscale: "Academic grayscale (with patterns)",
};

/** Font sizes offered, in points. */
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16] as const;
