/**
 * Axis rules: tick values at nice steps (1, 2 or 5 times a power of ten), a zero
 * baseline for bars, and numbers formatted the way reports print them, with thousands
 * separators and a true minus sign.
 */

import { niceStep } from "./data";

export interface Scale {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}

/**
 * A scale covering min to max with about the target number of ticks. Bars must start at
 * zero, so includeZero extends the scale to it; a single value is padded so it isn't on an edge.
 */
export function niceScale(min: number, max: number, { includeZero = false, target = 5 }: { includeZero?: boolean; target?: number } = {}): Scale {
  let low = includeZero ? Math.min(0, min) : min;
  let high = includeZero ? Math.max(0, max) : max;
  if (!Number.isFinite(low) || !Number.isFinite(high)) [low, high] = [0, 1];
  if (low === high) {
    const pad = Math.abs(low) > 0 ? Math.abs(low) * 0.1 : 1;
    [low, high] = includeZero && low >= 0 ? [0, high + pad] : includeZero && high <= 0 ? [low - pad, 0] : [low - pad, high + pad];
  }
  const step = niceStep((high - low) / target);
  const start = Math.floor(low / step + 1e-9) * step;
  const end = Math.ceil(high / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Math.round(value / step) * step);
  const clean = (value: number) => (Object.is(value, -0) ? 0 : value);
  return { min: clean(start), max: clean(end), step, ticks: ticks.map(clean) };
}

/** The decimal places ticks at this step need to be distinct. */
export function tickDecimals(step: number): number {
  if (!(step > 0)) return 0;
  return Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
}

/** A number with thousands separators, a set number of decimals, and a true minus sign; optionally with a percent sign. */
export function formatValue(value: number, decimals: number, percent = false): string {
  const fixed = Math.abs(value).toFixed(Math.max(0, Math.min(10, decimals)));
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const negative = value < 0 && Number(fixed) !== 0;
  return `${negative ? "−" : ""}${grouped}${fraction ? `.${fraction}` : ""}${percent ? "%" : ""}`;
}

/** The decimal places the values actually use, up to a maximum, so labels neither round away detail nor add false precision. */
export function decimalsIn(values: readonly (number | null)[], maximum = 2): number {
  let needed = 0;
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    while (needed < maximum && Math.abs(Math.round(value * 10 ** needed) / 10 ** needed - value) > 1e-9) needed++;
  }
  return needed;
}

/** Maps a value on a scale to a position between two pixel ends. */
export const project = (value: number, scale: Pick<Scale, "min" | "max">, from: number, to: number) => (scale.max === scale.min ? from : from + ((value - scale.min) / (scale.max - scale.min)) * (to - from));
