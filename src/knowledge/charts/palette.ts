/**
 * Colour rules. Categorical colours come from a palette validated for colour-vision
 * deficiency: in fixed order, never cycled, never more than eight. Ordered categories
 * use one hue from light to dark; Likert charts use two opposite hues around a neutral
 * gray. Colour never works alone: grayscale adds hatching, and lines add marker shapes
 * and dash patterns, so every series stays distinguishable in print.
 */

import type { PaletteId } from "./types";

/** The validated categorical palette, in its fixed order. */
export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"] as const;

/** One blue from light to dark, for ordered categories. Steps start dark enough to stand out on white. */
export const BLUE_RAMP = ["#86b6ef", "#5598e7", "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281", "#0d366b"] as const;

/** Grays from dark to light, paired with hatching so neighbours differ in more than shade. */
export const GRAYS = ["#2b2b2b", "#8a8a8a", "#c4c4c4", "#5e5e5e", "#a9a9a9", "#e0e0e0", "#444444", "#767676"] as const;

export const INK = { primary: "#0b0b0b", secondary: "#52514e", axis: "#8a8984", grid: "#e1e0d9", surface: "#ffffff", neutral: "#d9d8d3" } as const;

export type Pattern = "diagonal" | "back-diagonal" | "horizontal" | "vertical" | "crosshatch";
export type MarkerShape = "circle" | "square" | "triangle" | "diamond" | "triangle-down" | "circle-open" | "square-open" | "triangle-open";

export interface SeriesStyle {
  fill: string;
  /** The line and marker colour. */
  stroke: string;
  /** Hatching drawn over the fill, in grayscale only. */
  pattern: Pattern | null;
  marker: MarkerShape;
  /** Dash lengths for lines, or null for solid. */
  dash: number[] | null;
}

const MARKERS: readonly MarkerShape[] = ["circle", "square", "triangle", "diamond", "triangle-down", "circle-open", "square-open", "triangle-open"];
const DASHES: readonly (number[] | null)[] = [null, [6, 3], [2, 2], [8, 3, 2, 3], [10, 4], [4, 2, 1, 2], [1, 3], [12, 3, 3, 3]];
const PATTERNS: readonly (Pattern | null)[] = [null, "diagonal", "horizontal", "back-diagonal", "crosshatch", "vertical", null, "diagonal"];

/** Styles for a number of series. More than eight is refused, because the extras couldn't be told apart. */
export function seriesStyles(count: number, palette: PaletteId): SeriesStyle[] {
  if (count > CATEGORICAL.length) throw new RangeError(`At most ${CATEGORICAL.length} series can be styled; got ${count}.`);
  return Array.from({ length: count }, (_, index) => {
    const colour = palette === "grayscale" ? GRAYS[index] : palette === "blues" ? rampStep(BLUE_RAMP, index, count) : CATEGORICAL[index];
    return {
      fill: colour,
      stroke: palette === "grayscale" ? "#1a1a1a" : colour,
      pattern: palette === "grayscale" ? PATTERNS[index] : null,
      marker: MARKERS[index],
      // In colour, lines stay solid and marker shapes add the second cue; grayscale adds dashes too.
      dash: palette === "grayscale" ? DASHES[index] : null,
    };
  });
}

/** An evenly spaced step of a ramp, so few categories still span light to dark. */
export function rampStep(ramp: readonly string[], index: number, count: number): string {
  if (count <= 1) return ramp[Math.floor(ramp.length / 2)];
  return ramp[Math.round((index / (count - 1)) * (ramp.length - 1))];
}

// Each arm validated as an ordinal ramp on white: one hue, light to dark, and its lightest step clears 2:1.
const RED_ARM = ["#ec8a89", "#dd5a59", "#b73434", "#8f2626"] as const;
const BLUE_ARM = ["#86b6ef", "#4f93e4", "#256abf", "#184f95"] as const;
/** One gray ramp for both arms in grayscale: the negative arm is hatched and the positive arm plain, so the two sides differ without colour. */
const GRAY_ARM = ["#bdbdbd", "#8a8a8a", "#5e5e5e", "#2b2b2b"] as const;

/**
 * Colours for Likert levels, most negative first: red shades, a neutral gray middle for
 * an odd number of levels, then blue shades, stronger towards each end. In grayscale,
 * both arms use one gray ramp; negative levels are hatched and positive levels plain.
 */
export function divergingStyles(levels: number, palette: PaletteId): SeriesStyle[] {
  const arm = Math.floor(levels / 2);
  const neutral = levels % 2 === 1;
  const grayscale = palette === "grayscale";
  const side = (ramp: readonly string[], index: number) => ramp[Math.min(ramp.length - 1, Math.max(0, ramp.length - arm + index))];
  return Array.from({ length: levels }, (_, index): SeriesStyle => {
    if (neutral && index === arm) return { fill: grayscale ? "#e6e6e6" : INK.neutral, stroke: "#1a1a1a", pattern: null, marker: "circle", dash: null };
    const negative = index < arm;
    // Stronger towards each end: the most negative level takes the darkest red, the most positive the darkest blue.
    const strength = negative ? arm - 1 - index : index - (neutral ? arm + 1 : arm);
    const fill = grayscale ? side(GRAY_ARM, strength) : side(negative ? RED_ARM : BLUE_ARM, strength);
    return { fill, stroke: fill, pattern: grayscale && negative ? "back-diagonal" : null, marker: "circle", dash: null };
  });
}

/** A colour mixed with white, for area washes and bubble fills that must stay solid in every export format. */
export function tint(hex: string, amount: number): string {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  const mixed = channels.map((channel) => Math.round(channel * amount + 255 * (1 - amount)));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/** Relative luminance (WCAG 2), to choose white or black text on a fill. */
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Text colour for a label drawn inside a fill: whichever of ink or white contrasts more. */
export function labelOn(fill: string): string {
  const light = luminance(fill);
  return (light + 0.05) / (luminance(INK.primary) + 0.05) >= (1.05) / (light + 0.05) ? INK.primary : "#ffffff";
}
