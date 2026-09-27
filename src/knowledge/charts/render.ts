/**
 * Draws each chart type as a scene. Layout follows publication conventions: bars start
 * at zero, axes and gridlines are thin and quiet, a legend appears for two or more
 * series, labels are never clipped (crowded labels rotate instead), and every series
 * can be told apart without colour.
 */

import { chartData, likertData, paretoData, percentOfRow, percentOfSeries, type CategoryData, type ChartData } from "./data";
import { INK, divergingStyles, labelOn, seriesStyles, tint, type SeriesStyle } from "./palette";
import { decimalsIn, formatValue, niceScale, project, tickDecimals, type Scale } from "./scales";
import { barPath, circlePath, hatchLines, markerPath, polar, r2, slicePath, textWidth, type PathCommand, type Scene, type SceneItem } from "./scene";
import { STYLES, type StyleSpec } from "./style";
import type { DataTable } from "./table";
import { CHART_TYPE_INFO, type ChartOptions } from "./types";
import { canDraw, chartIssues, type ChartIssue } from "./validate";
import { describeChart } from "./describe";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Context {
  options: ChartOptions;
  style: StyleSpec;
  items: SceneItem[];
  notes: string[];
  /** Base text size in pixels (points × 4/3). */
  px: number;
  width: number;
}

interface LegendEntry {
  label: string;
  style: SeriesStyle;
  kind: "box" | "line";
}

const text = (ctx: Context, x: number, y: number, value: string, size: number, extra: Partial<Extract<SceneItem, { type: "text" }>> = {}): void => {
  ctx.items.push({ type: "text", x: r2(x), y: r2(y), text: value, size: r2(size), weight: "normal", italic: false, anchor: "start", fill: INK.primary, rotate: 0, ...extra });
};
const line = (ctx: Context, x1: number, y1: number, x2: number, y2: number, stroke: string = INK.axis, strokeWidth = 1, dash: number[] | null = null) => {
  ctx.items.push({ type: "line", x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), stroke, strokeWidth, dash });
};
const round = (commands: PathCommand[]): PathCommand[] => commands.map((command) => command.map((part, index) => (index === 0 ? part : r2(part as number))) as PathCommand);
const path = (ctx: Context, commands: PathCommand[], fill: string | null, stroke: string | null = null, strokeWidth = 0, dash: number[] | null = null) => {
  ctx.items.push({ type: "path", commands: round(commands), fill, stroke, strokeWidth, dash });
};
const width = (ctx: Context, value: string, size: number) => textWidth(value, size, ctx.style.widthFactor);

/** A filled shape in a series style: colour fill, with hatching and an outline in grayscale so light grays stay visible. */
function fillBar(ctx: Context, box: Box, style: SeriesStyle, end: "top" | "bottom" | "left" | "right", rounded = true) {
  if (box.w <= 0 || box.h <= 0) return;
  const radius = rounded && ctx.style.roundedBars ? 4 : 0;
  const outline = style.pattern !== null || ctx.options.palette === "grayscale";
  path(ctx, barPath(box.x, box.y, box.w, box.h, radius, end), style.fill, outline ? "#1a1a1a" : null, outline ? 0.75 : 0);
  if (style.pattern) ctx.items.push(...hatchLines(r2(box.x), r2(box.y), r2(box.w), r2(box.h), style.pattern, 5, labelOn(style.fill) === "#ffffff" ? "#ffffff" : "#1a1a1a"));
}

/** A label inside a fill. On hatching it gets a white backing so the pattern doesn't cross the text. */
function insideLabel(ctx: Context, x: number, y: number, value: string, style: SeriesStyle) {
  const size = labelSize(ctx);
  if (style.pattern) {
    const w = width(ctx, value, size) + 6;
    ctx.items.push({ type: "rect", x: r2(x - w / 2), y: r2(y - size * 0.95), width: r2(w), height: r2(size * 1.3), fill: INK.surface, stroke: null, strokeWidth: 0 });
    text(ctx, x, y, value, size, { anchor: "middle", fill: INK.primary });
  } else text(ctx, x, y, value, size, { anchor: "middle", fill: labelOn(style.fill) });
}

/** A marker with a 2px white ring, so it stays legible where it crosses lines. */
function marker(ctx: Context, style: SeriesStyle, x: number, y: number, r = 4) {
  const { commands, open } = markerPath(style.marker, x, y, r);
  path(ctx, markerPath(style.marker, x, y, r + 1.5).commands, INK.surface);
  path(ctx, commands, open ? INK.surface : style.stroke, style.stroke, open ? 1.5 : 0);
}

// Header: title, subtitle and legend.

function header(ctx: Context, legend: LegendEntry[]): number {
  const { options, px } = ctx;
  let y = 14;
  if (ctx.style.titleInFigure && options.title.trim()) {
    const size = px * 1.25;
    text(ctx, 16, y + size, options.title.trim(), size, { weight: "bold" });
    y += size * 1.35;
  }
  if (ctx.style.titleInFigure && options.subtitle.trim()) {
    text(ctx, 16, y + px, options.subtitle.trim(), px, { fill: INK.secondary });
    y += px * 1.45;
  }
  const show = options.legend === "show" || (options.legend === "auto" && legend.length >= 2);
  if (show && legend.length > 0) {
    const size = px * 0.9;
    let x = 16;
    let rowTop = y + 4;
    for (const entry of legend) {
      const entryWidth = 22 + width(ctx, entry.label, size) + 18;
      if (x + entryWidth > ctx.width - 16 && x > 16) {
        x = 16;
        rowTop += size * 1.6;
      }
      const middle = rowTop + size * 0.6;
      if (entry.kind === "box") fillBar(ctx, { x, y: middle - 6, w: 12, h: 12 }, entry.style, "top");
      else {
        line(ctx, x - 2, middle, x + 16, middle, entry.style.stroke, 2, entry.style.dash);
        marker(ctx, entry.style, x + 7, middle, 3.5);
      }
      text(ctx, x + 22, middle + size * 0.35, entry.label, size, { fill: INK.secondary });
      x += entryWidth;
    }
    y = rowTop + size * 1.6;
  }
  return y + 6;
}

// Cartesian frames.

type Axis = { kind: "band"; labels: string[] } | { kind: "linear"; scale: Scale; format: (value: number) => string };

interface Frame {
  plot: Box;
  /** Pixel position of a value, or of a band's centre. */
  x: (value: number) => number;
  y: (value: number) => number;
  band: number;
}

const axisFormat = (ctx: Context, scale: Scale, percent = false) => (value: number) => formatValue(value, ctx.options.axisDecimals ?? tickDecimals(scale.step), percent);

/**
 * Plots with a horizontal and a vertical axis. Margins are measured from the labels so
 * nothing is clipped; category labels that don't fit their band rotate to 45°.
 */
function frame(ctx: Context, top: number, xAxis: Axis, yAxis: Axis, titles: { x: string; y: string }): Frame {
  const { px, options } = ctx;
  const tickSize = px * 0.9;
  const yLabels = yAxis.kind === "band" ? yAxis.labels : yAxis.scale.ticks.map(yAxis.format);
  const yLabelWidth = Math.max(0, ...yLabels.map((label) => width(ctx, label, tickSize)));
  const left = 16 + (titles.y ? px * 1.3 + 8 : 0) + yLabelWidth + 8;
  const right = 18 + (xAxis.kind === "linear" ? width(ctx, xAxis.format(xAxis.scale.max), tickSize) / 2 : 0);
  const plotWidth = ctx.width - left - right;

  let rotation: number = options.rotateLabels;
  const xLabels = xAxis.kind === "band" ? xAxis.labels : xAxis.scale.ticks.map(xAxis.format);
  const xLabelWidth = Math.max(0, ...xLabels.map((label) => width(ctx, label, tickSize)));
  if (xAxis.kind === "band" && rotation === 0 && xLabelWidth > plotWidth / Math.max(1, xAxis.labels.length) - 6) {
    rotation = 45;
    ctx.notes.push("Category labels were rotated 45° because they didn't fit side by side.");
  }
  const xLabelHeight = rotation === 0 ? tickSize * 1.2 : rotation === 45 ? xLabelWidth * Math.SQRT1_2 + tickSize : xLabelWidth + 4;
  const bottom = 8 + xLabelHeight + 6 + (titles.x ? px * 1.5 : 0) + 8;
  const plot: Box = { x: left, y: top + 4, w: plotWidth, h: Math.max(40, ctx.options.height - top - 4 - bottom) };

  const band = (count: number, extent: number) => extent / Math.max(1, count);
  const xBand = xAxis.kind === "band" ? band(xAxis.labels.length, plot.w) : 0;
  const yBand = yAxis.kind === "band" ? band(yAxis.labels.length, plot.h) : 0;
  const x = (value: number) => (xAxis.kind === "band" ? plot.x + xBand * (value + 0.5) : project(value, xAxis.scale, plot.x, plot.x + plot.w));
  const y = (value: number) => (yAxis.kind === "band" ? plot.y + yBand * (value + 0.5) : project(value, yAxis.scale, plot.y + plot.h, plot.y));

  // Gridlines and value axes.
  for (const [axis, horizontal] of [
    [yAxis, true],
    [xAxis, false],
  ] as const) {
    if (axis.kind !== "linear") continue;
    for (const tick of axis.scale.ticks) {
      const position = horizontal ? y(tick) : x(tick);
      if (options.gridlines && horizontal) line(ctx, plot.x, position, plot.x + plot.w, position, INK.grid);
      else if (options.gridlines) line(ctx, position, plot.y, position, plot.y + plot.h, INK.grid);
      else if (horizontal) line(ctx, plot.x - 4, position, plot.x, position);
      else line(ctx, position, plot.y + plot.h, position, plot.y + plot.h + 4);
    }
    // Without gridlines, an axis line carries the ticks.
    if (!options.gridlines && horizontal) line(ctx, plot.x, plot.y, plot.x, plot.y + plot.h);
    else if (!options.gridlines) line(ctx, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);
  }

  // Tick labels.
  if (yAxis.kind === "band") yAxis.labels.forEach((label, index) => text(ctx, plot.x - 8, y(index) + tickSize * 0.35, label, tickSize, { anchor: "end", fill: INK.secondary }));
  else yAxis.scale.ticks.forEach((tick) => text(ctx, plot.x - 8, y(tick) + tickSize * 0.35, yAxis.format(tick), tickSize, { anchor: "end", fill: INK.secondary }));
  const labelTop = plot.y + plot.h + 8;
  const xLabel = (label: string, position: number) => {
    if (rotation === 0) text(ctx, position, labelTop + tickSize * 0.9, label, tickSize, { anchor: "middle", fill: INK.secondary });
    else text(ctx, position, labelTop + (rotation === 45 ? tickSize * 0.5 : 0), label, tickSize, { anchor: "end", fill: INK.secondary, rotate: -rotation });
  };
  if (xAxis.kind === "band") xAxis.labels.forEach((label, index) => xLabel(label, x(index)));
  else xAxis.scale.ticks.forEach((tick) => text(ctx, x(tick), labelTop + tickSize * 0.9, xAxis.format(tick), tickSize, { anchor: "middle", fill: INK.secondary }));

  // Axis titles.
  if (titles.x) text(ctx, plot.x + plot.w / 2, plot.y + plot.h + 8 + xLabelHeight + 6 + px, titles.x, px, { anchor: "middle" });
  if (titles.y) text(ctx, 16 + px, plot.y + plot.h / 2, titles.y, px, { anchor: "middle", rotate: -90 });
  return { plot, x, y, band: xAxis.kind === "band" ? xBand : yBand };
}

/** The baseline at zero (or the plot's edge when zero is outside it), drawn after the bars so it sits on top. */
function baseline(ctx: Context, frame: Frame, horizontal: boolean, scale: Scale) {
  const zero = Math.min(Math.max(0, scale.min), scale.max);
  if (horizontal) line(ctx, frame.x(zero), frame.plot.y, frame.x(zero), frame.plot.y + frame.plot.h, INK.axis);
  else line(ctx, frame.plot.x, frame.y(zero), frame.plot.x + frame.plot.w, frame.y(zero), INK.axis);
}

// Value labels.

const labelSize = (ctx: Context) => ctx.px * 0.85;
/** The decimals labels use: the researcher's choice, or as many as the data have (percentages default to whole numbers). */
const decimalsFor = (ctx: Context, values: readonly (number | null)[], percent = false) => ctx.options.labelDecimals ?? (percent ? 0 : decimalsIn(values));
function valueLabel(ctx: Context, value: number | null, percent: number | null, values: readonly (number | null)[] = [value]): string | null {
  if (value === null) return null;
  const { options } = ctx;
  if (options.percentages && percent !== null) return formatValue(percent, decimalsFor(ctx, [], true), true);
  return formatValue(value, decimalsFor(ctx, values));
}

// Chart renderers.

function categoryTitles(ctx: Context, table: DataTable, data: CategoryData) {
  return { x: ctx.options.xTitle.trim() || table.columns[0]?.name || "", y: ctx.options.yTitle.trim() || (data.series.length === 1 ? data.series[0].name : "") };
}

function verticalBars(ctx: Context, table: DataTable, data: CategoryData, mode: "single" | "grouped" | "stacked" | "percent") {
  const shown = mode === "single" ? { ...data, series: data.series.slice(0, 1) } : mode === "percent" ? percentOfRow(data) : data;
  const styles = seriesStyles(shown.series.length, ctx.options.palette);
  const top = header(ctx, mode === "single" ? [] : shown.series.map((series, index) => ({ label: series.name, style: styles[index], kind: "box" as const })));
  const values = shown.series.flatMap((series) => series.values).filter((value): value is number => value !== null);
  const totals = shown.categories.map((_, index) => shown.series.reduce((sum, series) => sum + Math.max(0, series.values[index] ?? 0), 0));
  const [low, high] = mode === "stacked" || mode === "percent" ? [0, Math.max(...totals)] : [Math.min(...values), Math.max(...values)];
  const scale = mode === "percent" ? { min: 0, max: 100, step: 20, ticks: [0, 20, 40, 60, 80, 100] } : niceScale(low, high, { includeZero: true });
  const titles = categoryTitles(ctx, table, shown);
  const f = frame(ctx, top, { kind: "band", labels: shown.categories }, { kind: "linear", scale, format: axisFormat(ctx, scale, mode === "percent") }, { ...titles, y: mode === "percent" ? ctx.options.yTitle.trim() || "Percentage" : titles.y });
  const groupWidth = Math.min(f.band * 0.72, mode === "grouped" ? 32 * shown.series.length : 56);
  const zero = f.y(Math.max(0, scale.min));
  shown.categories.forEach((_, index) => {
    const centre = f.x(index);
    if (mode === "grouped") {
      const barWidth = groupWidth / shown.series.length;
      shown.series.forEach((series, s) => {
        const value = series.values[index];
        if (value === null) return;
        const left = centre - groupWidth / 2 + s * barWidth + 1;
        const end = f.y(value);
        fillBar(ctx, { x: left, y: Math.min(end, zero), w: barWidth - 2, h: Math.abs(zero - end) }, styles[s], value >= 0 ? "top" : "bottom");
        const label = ctx.options.dataLabels ? valueLabel(ctx, value, percentOfSeries(series.values)[index], values) : null;
        if (label) text(ctx, left + (barWidth - 2) / 2, value >= 0 ? end - 4 : end + labelSize(ctx) + 2, label, labelSize(ctx), { anchor: "middle", fill: INK.secondary });
      });
      return;
    }
    if (mode === "single") {
      const value = shown.series[0].values[index];
      if (value === null) return;
      const end = f.y(value);
      fillBar(ctx, { x: centre - groupWidth / 2, y: Math.min(end, zero), w: groupWidth, h: Math.abs(zero - end) }, styles[0], value >= 0 ? "top" : "bottom");
      const label = ctx.options.dataLabels ? valueLabel(ctx, value, percentOfSeries(shown.series[0].values)[index], values) : null;
      if (label) text(ctx, centre, value >= 0 ? end - 4 : end + labelSize(ctx) + 2, label, labelSize(ctx), { anchor: "middle", fill: INK.secondary });
      return;
    }
    // Stacked: segments separated by a 2px gap; only the top segment has a rounded end.
    let running = 0;
    const present = shown.series.map((series, s) => ({ value: Math.max(0, series.values[index] ?? 0), s })).filter((part) => part.value > 0);
    present.forEach(({ value, s }, position) => {
      const from = f.y(running);
      const to = f.y(running + value);
      const isTop = position === present.length - 1;
      const box = { x: centre - groupWidth / 2, y: to + (isTop ? 0 : 1), w: groupWidth, h: from - to - (isTop ? 0 : 1) - (position === 0 ? 0 : 1) };
      // Only the outermost segment has a rounded end; inner segments stay square.
      fillBar(ctx, box, styles[s], "top", isTop);
      const label = ctx.options.dataLabels ? (mode === "percent" ? formatValue(value, decimalsFor(ctx, [], true), true) : valueLabel(ctx, value, (value / Math.max(1e-9, totals[index])) * 100, values)) : null;
      if (label && box.h >= labelSize(ctx) + 4 && width(ctx, label, labelSize(ctx)) <= box.w - 8) insideLabel(ctx, centre, box.y + box.h / 2 + labelSize(ctx) * 0.35, label, styles[s]);
      running += value;
    });
  });
  baseline(ctx, f, false, scale);
}

function horizontalBars(ctx: Context, table: DataTable, data: CategoryData) {
  const series = data.series[0];
  const style = seriesStyles(1, ctx.options.palette)[0];
  const top = header(ctx, []);
  const values = series.values.filter((value): value is number => value !== null);
  const scale = niceScale(Math.min(...values), Math.max(...values), { includeZero: true });
  const titles = { x: ctx.options.yTitle.trim() || series.name, y: ctx.options.xTitle.trim() || table.columns[0]?.name || "" };
  const f = frame(ctx, top, { kind: "linear", scale, format: axisFormat(ctx, scale) }, { kind: "band", labels: data.categories }, titles);
  const thickness = Math.min(f.band * 0.7, 28);
  const zero = f.x(Math.max(0, scale.min));
  const percents = percentOfSeries(series.values);
  data.categories.forEach((_, index) => {
    const value = series.values[index];
    if (value === null) return;
    const end = f.x(value);
    fillBar(ctx, { x: Math.min(zero, end), y: f.y(index) - thickness / 2, w: Math.abs(end - zero), h: thickness }, style, value >= 0 ? "right" : "left");
    const label = ctx.options.dataLabels ? valueLabel(ctx, value, percents[index], values) : null;
    if (label) text(ctx, value >= 0 ? end + 4 : end - 4, f.y(index) + labelSize(ctx) * 0.35, label, labelSize(ctx), { anchor: value >= 0 ? "start" : "end", fill: INK.secondary });
  });
  baseline(ctx, f, true, scale);
}

function pie(ctx: Context, data: CategoryData, doughnut: boolean) {
  const values = data.series[0].values.map((value) => Math.max(0, value ?? 0));
  const percents = percentOfSeries(values);
  const styles = seriesStyles(values.length, ctx.options.palette);
  const top = header(ctx, []);
  const labelSize = ctx.px * 0.9;
  const asPercent = ctx.options.percentages || !ctx.options.dataLabels;
  const labels = data.categories.map((category, index) => `${category}: ${formatValue(asPercent ? (percents[index] ?? 0) : values[index], decimalsFor(ctx, values, asPercent), asPercent)}`);
  const widest = Math.max(0, ...labels.map((label) => width(ctx, label, labelSize)));
  const radius = Math.max(40, Math.min((ctx.width - 2 * (widest + 36)) / 2, (ctx.options.height - top - 24) / 2));
  const cx = ctx.width / 2;
  const cy = top + 8 + radius;
  const total = values.reduce((a, b) => a + b, 0);
  let angle = 0;
  const placed: { x: number; y: number; right: boolean; text: string; ax: number; ay: number }[] = [];
  values.forEach((value, index) => {
    if (total === 0 || value === 0) return;
    const sweep = (value / total) * Math.PI * 2;
    const style = styles[index];
    path(ctx, slicePath(cx, cy, radius, doughnut ? radius * 0.55 : 0, angle, angle + sweep), style.fill, INK.surface, 2);
    const middle = angle + sweep / 2;
    const [ax, ay] = polar(cx, cy, radius + 2, middle);
    const [lx, ly] = polar(cx, cy, radius + 16, middle);
    placed.push({ x: lx, y: ly, right: Math.sin(middle) >= 0, text: labels[index], ax, ay });
    angle += sweep;
  });
  // Keep labels on each side at least one line apart, then draw each with a leader line.
  for (const right of [true, false]) {
    const side = placed.filter((label) => label.right === right).sort((a, b) => a.y - b.y);
    for (let index = 1; index < side.length; index++) side[index].y = Math.max(side[index].y, side[index - 1].y + labelSize * 1.3);
  }
  for (const label of placed) {
    const endX = label.right ? label.x + 6 : label.x - 6;
    line(ctx, label.ax, label.ay, label.x, label.y, INK.axis, 1);
    line(ctx, label.x, label.y, endX, label.y, INK.axis, 1);
    text(ctx, label.right ? endX + 3 : endX - 3, label.y + labelSize * 0.35, label.text, labelSize, { anchor: label.right ? "start" : "end", fill: INK.primary });
  }
  if (ctx.options.palette === "grayscale") ctx.notes.push("Grayscale pie slices are identified by their labels, since shades alone are hard to tell apart.");
}

function lines(ctx: Context, table: DataTable, data: CategoryData, area: boolean, single: boolean) {
  const shown = single ? { ...data, series: data.series.slice(0, 1) } : data;
  const styles = seriesStyles(shown.series.length, ctx.options.palette);
  const top = header(ctx, shown.series.map((series, index) => ({ label: series.name, style: styles[index], kind: "line" as const })));
  const values = shown.series.flatMap((series) => series.values).filter((value): value is number => value !== null);
  const scale = niceScale(Math.min(...values), Math.max(...values), { includeZero: area });
  const f = frame(ctx, top, { kind: "band", labels: shown.categories }, { kind: "linear", scale, format: axisFormat(ctx, scale) }, categoryTitles(ctx, table, shown));
  if (area) {
    shown.series.forEach((series, s) => {
      const points = series.values.map((value, index) => (value === null ? null : ([f.x(index), f.y(value)] as const))).filter((point): point is readonly [number, number] => point !== null);
      if (points.length < 2) return;
      const zero = f.y(Math.max(0, scale.min));
      path(ctx, [["M", points[0][0], zero], ...points.map(([x, y]): PathCommand => ["L", x, y]), ["L", points[points.length - 1][0], zero], ["Z"]], tint(styles[s].fill, ctx.options.palette === "grayscale" ? 0.35 : 0.18));
    });
  }
  shown.series.forEach((series, s) => {
    const style = styles[s];
    let started = false;
    const commands: PathCommand[] = [];
    series.values.forEach((value, index) => {
      if (value === null) {
        started = false;
        return;
      }
      commands.push([started ? "L" : "M", f.x(index), f.y(value)]);
      started = true;
    });
    if (commands.length > 1) path(ctx, commands, null, style.stroke, 2, style.dash);
    series.values.forEach((value, index) => {
      if (value === null) return;
      marker(ctx, style, f.x(index), f.y(value));
    });
    if (ctx.options.dataLabels) {
      // Label the last point only: selective labels read; a number on every point doesn't.
      const last = series.values.map((value, index) => ({ value, index })).filter((point) => point.value !== null).pop();
      if (last) text(ctx, f.x(last.index), f.y(last.value!) - 9, formatValue(last.value!, decimalsFor(ctx, values)), labelSize(ctx), { anchor: "middle", fill: INK.secondary });
    }
  });
  if (area) baseline(ctx, f, false, scale);
}

function histogram(ctx: Context, data: Extract<ChartData, { kind: "histogram" }>, polygon: boolean) {
  const style = seriesStyles(1, ctx.options.palette)[0];
  const top = header(ctx, []);
  const counts = data.bins.map((bin) => bin.count);
  const scale = niceScale(0, Math.max(1, ...counts), { includeZero: true });
  const first = data.bins[0]?.from ?? 0;
  const last = data.bins[data.bins.length - 1]?.to ?? 1;
  const [low, high] = polygon ? [first - data.width, last + data.width] : [first, last];
  const edges = Array.from({ length: Math.round((high - low) / data.width) + 1 }, (_, index) => low + index * data.width);
  const every = Math.max(1, Math.ceil(edges.length / 10));
  const xScale: Scale = { min: low, max: high, step: data.width * every, ticks: edges.filter((_, index) => index % every === 0) };
  const f = frame(ctx, top, { kind: "linear", scale: xScale, format: axisFormat(ctx, xScale) }, { kind: "linear", scale, format: axisFormat(ctx, scale) }, { x: ctx.options.xTitle.trim() || data.name, y: ctx.options.yTitle.trim() || "Frequency" });
  if (polygon) {
    const points: [number, number][] = [[low + data.width / 2, 0], ...data.bins.map((bin): [number, number] => [(bin.from + bin.to) / 2, bin.count]), [last + data.width / 2, 0]];
    path(ctx, points.map(([x, y], index): PathCommand => [index === 0 ? "M" : "L", f.x(x), f.y(y)]), null, style.stroke, 2, style.dash);
    for (const [x, y] of points) marker(ctx, style, f.x(x), f.y(y));
  } else {
    for (const bin of data.bins) {
      const left = f.x(bin.from);
      const right = f.x(bin.to);
      // Histogram bars touch; a 1px gap keeps each interval distinct.
      fillBar(ctx, { x: left + 0.5, y: f.y(bin.count), w: right - left - 1, h: f.y(0) - f.y(bin.count) }, style, "top");
      if (ctx.options.dataLabels && bin.count > 0) text(ctx, (left + right) / 2, f.y(bin.count) - 4, String(bin.count), labelSize(ctx), { anchor: "middle", fill: INK.secondary });
    }
  }
  baseline(ctx, f, false, scale);
}

function scatter(ctx: Context, data: Extract<ChartData, { kind: "points" }>, bubble: boolean) {
  const style = seriesStyles(1, ctx.options.palette)[0];
  const top = header(ctx, []);
  const xs = data.points.map((point) => point.x);
  const ys = data.points.map((point) => point.y);
  // Pad the ranges so no point, or bubble, sits on the plot's edge.
  const pad = (values: number[], share: number) => {
    const range = Math.max(...values) - Math.min(...values) || Math.abs(values[0]) || 1;
    return [Math.min(...values) - range * share, Math.max(...values) + range * share] as const;
  };
  const xScale = niceScale(...pad(xs, bubble ? 0.12 : 0.04));
  const yScale = niceScale(...pad(ys, bubble ? 0.12 : 0.04));
  const f = frame(ctx, top, { kind: "linear", scale: xScale, format: axisFormat(ctx, xScale) }, { kind: "linear", scale: yScale, format: axisFormat(ctx, yScale) }, { x: ctx.options.xTitle.trim() || data.xName, y: ctx.options.yTitle.trim() || data.yName });
  if (ctx.options.gridlines) {
    line(ctx, f.plot.x, f.plot.y + f.plot.h, f.plot.x + f.plot.w, f.plot.y + f.plot.h);
    line(ctx, f.plot.x, f.plot.y, f.plot.x, f.plot.y + f.plot.h);
  }
  if (bubble) {
    const largest = Math.max(1e-9, ...data.points.map((point) => point.size ?? 0));
    // Area, not radius, is proportional to size, so bubbles aren't exaggerated.
    const sorted = [...data.points].sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
    for (const point of sorted) {
      // A small floor keeps near-zero bubbles visible; above it, area stays proportional.
      const radius = Math.max(2, Math.sqrt((point.size ?? 0) / largest) * 22);
      path(ctx, circlePath(f.x(point.x), f.y(point.y), radius + 1.5), INK.surface);
      path(ctx, circlePath(f.x(point.x), f.y(point.y), radius), tint(style.fill, 0.45), style.stroke, 1.5);
    }
    ctx.notes.push(`Bubble area is proportional to ${data.sizeName ?? "size"}.`);
  } else for (const point of data.points) marker(ctx, style, f.x(point.x), f.y(point.y));
  if (ctx.options.dataLabels) for (const point of data.points.filter((candidate) => candidate.label)) text(ctx, f.x(point.x) + 7, f.y(point.y) - 6, point.label!, labelSize(ctx), { fill: INK.secondary });
}

function boxPlot(ctx: Context, data: Extract<ChartData, { kind: "box" }>) {
  const styles = seriesStyles(data.groups.length, ctx.options.palette);
  const top = header(ctx, []);
  const values = data.groups.flatMap((group) => [group.min, group.max]);
  const scale = niceScale(Math.min(...values), Math.max(...values));
  const f = frame(ctx, top, { kind: "band", labels: data.groups.map((group) => group.name) }, { kind: "linear", scale, format: axisFormat(ctx, scale) }, { x: ctx.options.xTitle.trim(), y: ctx.options.yTitle.trim() });
  data.groups.forEach((group, index) => {
    const centre = f.x(index);
    const half = Math.min(f.band * 0.3, 32);
    const style = styles[index];
    line(ctx, centre, f.y(group.upperWhisker), centre, f.y(group.q3), INK.primary, 1);
    line(ctx, centre, f.y(group.q1), centre, f.y(group.lowerWhisker), INK.primary, 1);
    line(ctx, centre - half / 2, f.y(group.upperWhisker), centre + half / 2, f.y(group.upperWhisker), INK.primary, 1);
    line(ctx, centre - half / 2, f.y(group.lowerWhisker), centre + half / 2, f.y(group.lowerWhisker), INK.primary, 1);
    const box = { x: centre - half, y: f.y(group.q3), w: half * 2, h: f.y(group.q1) - f.y(group.q3) };
    ctx.items.push({ type: "rect", x: r2(box.x), y: r2(box.y), width: r2(box.w), height: r2(box.h), fill: ctx.options.palette === "grayscale" ? "#e0e0e0" : tint(style.fill, 0.3), stroke: INK.primary, strokeWidth: 1 });
    line(ctx, centre - half, f.y(group.median), centre + half, f.y(group.median), INK.primary, 2.5);
    for (const outlier of group.outliers) path(ctx, circlePath(centre, f.y(outlier), 3.5), INK.surface, INK.primary, 1.25);
  });
  ctx.notes.push("Boxes show the quartiles and median; whiskers reach the most extreme values within 1.5 × IQR; circles are values beyond.");
}

function radar(ctx: Context, data: CategoryData) {
  const styles = seriesStyles(data.series.length, ctx.options.palette);
  const top = header(ctx, data.series.map((series, index) => ({ label: series.name, style: styles[index], kind: "line" as const })));
  const values = data.series.flatMap((series) => series.values).filter((value): value is number => value !== null);
  const scale = niceScale(0, Math.max(...values), { includeZero: true, target: 4 });
  const labelSize = ctx.px * 0.9;
  const widest = Math.max(0, ...data.categories.map((category) => width(ctx, category, labelSize)));
  const radius = Math.max(40, Math.min((ctx.width - 2 * (widest + 24)) / 2, (ctx.options.height - top - 40) / 2));
  const cx = ctx.width / 2;
  const cy = top + 20 + radius;
  const count = data.categories.length;
  const angle = (index: number) => (index / count) * Math.PI * 2;
  for (const tick of scale.ticks.slice(1)) {
    const r = (tick / scale.max) * radius;
    path(ctx, data.categories.map((_, index): PathCommand => [index === 0 ? "M" : "L", ...polar(cx, cy, r, angle(index))]).concat([["Z"]]), null, INK.grid, 1);
    // Just inside the ring, so the outermost value never meets the top dimension's name.
    // Left of the vertical axis, clear of the markers drawn on it.
    text(ctx, cx - 7, cy - r + labelSize, axisFormat(ctx, scale)(tick), labelSize * 0.9, { anchor: "end", fill: INK.secondary });
  }
  data.categories.forEach((category, index) => {
    const [x, y] = polar(cx, cy, radius, angle(index));
    line(ctx, cx, cy, x, y, INK.grid, 1);
    const [lx, ly] = polar(cx, cy, radius + 10, angle(index));
    const sin = Math.sin(angle(index));
    text(ctx, lx, ly + labelSize * 0.35 + (Math.cos(angle(index)) < -0.5 ? labelSize * 0.6 : 0), category, labelSize, { anchor: Math.abs(sin) < 0.2 ? "middle" : sin > 0 ? "start" : "end", fill: INK.secondary });
  });
  data.series.forEach((series, s) => {
    const points = series.values.map((value, index) => polar(cx, cy, ((value ?? 0) / scale.max) * radius, angle(index)));
    // Only a single profile is filled: tints are solid, so a later fill would hide an earlier profile.
    path(ctx, points.map((point, index): PathCommand => [index === 0 ? "M" : "L", ...point]).concat([["Z"]]), data.series.length === 1 ? tint(styles[s].fill, 0.12) : null, styles[s].stroke, 2, styles[s].dash);
    for (const [x, y] of points) marker(ctx, styles[s], x, y, 3.5);
  });
}

function pareto(ctx: Context, table: DataTable, data: CategoryData) {
  const shares = paretoData(data);
  const [barStyle, lineStyle] = seriesStyles(2, ctx.options.palette);
  const top = header(ctx, [
    { label: "Share of the total", style: barStyle, kind: "box" },
    { label: "Cumulative percentage", style: lineStyle, kind: "line" },
  ]);
  // One percentage axis for both bars and line, avoiding a misleading second axis.
  const scale: Scale = { min: 0, max: 100, step: 20, ticks: [0, 20, 40, 60, 80, 100] };
  const f = frame(ctx, top, { kind: "band", labels: shares.categories }, { kind: "linear", scale, format: axisFormat(ctx, scale, true) }, { x: ctx.options.xTitle.trim() || table.columns[0]?.name || "", y: ctx.options.yTitle.trim() || "Percentage of the total" });
  const barWidth = Math.min(f.band * 0.72, 56);
  shares.percentages.forEach((percentage, index) => {
    fillBar(ctx, { x: f.x(index) - barWidth / 2, y: f.y(percentage), w: barWidth, h: f.y(0) - f.y(percentage) }, barStyle, "top");
    if (ctx.options.dataLabels) {
      // Inside the bar when it fits, clear of the cumulative line that starts at the first bar's top.
      const label = formatValue(percentage, decimalsFor(ctx, [], true), true);
      const height = f.y(0) - f.y(percentage);
      // Below the cumulative marker, which sits on the first bar's top.
      const inset = labelSize(ctx) * 1.25 + (index === 0 ? 7 : 0);
      if (height >= inset + labelSize(ctx) * 0.5 && width(ctx, label, labelSize(ctx)) <= barWidth - 8) insideLabel(ctx, f.x(index), f.y(percentage) + inset, label, barStyle);
      else text(ctx, f.x(index) + barWidth / 2 + 3, f.y(percentage) - 3, label, labelSize(ctx), { fill: INK.secondary });
    }
  });
  path(ctx, shares.cumulative.map((value, index): PathCommand => [index === 0 ? "M" : "L", f.x(index), f.y(value)]), null, lineStyle.stroke, 2, lineStyle.dash);
  shares.cumulative.forEach((value, index) => marker(ctx, lineStyle, f.x(index), f.y(value)));
  baseline(ctx, f, false, scale);
}

function pyramid(ctx: Context, table: DataTable, data: CategoryData) {
  const [left, right] = data.series;
  const styles = seriesStyles(2, ctx.options.palette);
  const top = header(ctx, [
    { label: left.name, style: styles[0], kind: "box" },
    { label: right.name, style: styles[1], kind: "box" },
  ]);
  const largest = Math.max(1e-9, ...[...left.values, ...right.values].map((value) => Math.abs(value ?? 0)));
  const half = niceScale(0, largest, { includeZero: true, target: 3 });
  const scale: Scale = { min: -half.max, max: half.max, step: half.step, ticks: [...half.ticks.slice(1).reverse().map((tick) => -tick), ...half.ticks] };
  // The first row is drawn at the bottom, so the youngest group forms the base of the pyramid.
  const labels = [...data.categories].reverse();
  const f = frame(ctx, top, { kind: "linear", scale, format: (value) => formatValue(Math.abs(value), ctx.options.axisDecimals ?? tickDecimals(scale.step)) }, { kind: "band", labels }, { x: ctx.options.yTitle.trim() || "Count", y: ctx.options.xTitle.trim() || table.columns[0]?.name || "" });
  const thickness = Math.min(f.band * 0.78, 28);
  const zero = f.x(0);
  data.categories.forEach((_, index) => {
    const row = data.categories.length - 1 - index;
    const y = f.y(row) - thickness / 2;
    const l = Math.abs(left.values[index] ?? 0);
    const r = Math.abs(right.values[index] ?? 0);
    fillBar(ctx, { x: f.x(-l), y, w: zero - f.x(-l) - 1, h: thickness }, styles[0], "left");
    const pyramidDecimals = decimalsFor(ctx, [...left.values, ...right.values]);
    fillBar(ctx, { x: zero + 1, y, w: f.x(r) - zero - 1, h: thickness }, styles[1], "right");
    if (ctx.options.dataLabels) {
      text(ctx, f.x(-l) - 4, y + thickness / 2 + labelSize(ctx) * 0.35, formatValue(l, pyramidDecimals), labelSize(ctx), { anchor: "end", fill: INK.secondary });
      text(ctx, f.x(r) + 4, y + thickness / 2 + labelSize(ctx) * 0.35, formatValue(r, pyramidDecimals), labelSize(ctx), { fill: INK.secondary });
    }
  });
  line(ctx, zero, f.plot.y, zero, f.plot.y + f.plot.h, INK.axis);
}

function likert(ctx: Context, data: CategoryData) {
  const layout = likertData(data);
  const styles = divergingStyles(layout.levels.length, ctx.options.palette);
  const top = header(ctx, layout.levels.map((level, index) => ({ label: level, style: styles[index], kind: "box" as const })));
  const extent = Math.max(50, ...layout.rows.flatMap((row) => row.segments.map((segment) => Math.max(Math.abs(segment.from), Math.abs(segment.to)))));
  // Each tick appears on both sides, so narrow figures, such as a journal column, get fewer.
  const half = niceScale(0, extent, { includeZero: true, target: ctx.width < 450 ? 2 : 4 });
  const scale: Scale = { min: -half.max, max: half.max, step: half.step, ticks: [...half.ticks.slice(1).reverse().map((tick) => -tick), ...half.ticks] };
  const f = frame(ctx, top, { kind: "linear", scale, format: (value) => formatValue(Math.abs(value), 0, true) }, { kind: "band", labels: layout.rows.map((row) => row.item) }, { x: ctx.options.xTitle.trim() || "Percentage of responses", y: "" });
  const thickness = Math.min(f.band * 0.62, 28);
  // The centre line goes underneath, so segment labels are never crossed by it.
  line(ctx, f.x(0), f.plot.y, f.x(0), f.plot.y + f.plot.h, INK.primary, 1.25);
  layout.rows.forEach((row, index) => {
    const y = f.y(index) - thickness / 2;
    row.segments.forEach((segment, level) => {
      if (segment.to - segment.from <= 0) return;
      const box = { x: f.x(segment.from) + 1, y, w: f.x(segment.to) - f.x(segment.from) - 2, h: thickness };
      fillBar(ctx, box, styles[level], "right", false);
      const label = ctx.options.dataLabels ? formatValue(row.percentages[level], decimalsFor(ctx, [], true), true) : null;
      if (label && width(ctx, label, labelSize(ctx)) <= box.w - 8) insideLabel(ctx, box.x + box.w / 2, y + thickness / 2 + labelSize(ctx) * 0.35, label, styles[level]);
    });
  });
  if (layout.levels.length % 2 === 1) ctx.notes.push("The neutral response is split evenly either side of the centre line.");
}

function means(ctx: Context, data: Extract<ChartData, { kind: "means" }>, bars: boolean) {
  const style = seriesStyles(1, ctx.options.palette)[0];
  const top = header(ctx, []);
  const lows = data.groups.map((group) => group.value - (group.error ?? 0));
  const highs = data.groups.map((group) => group.value + (group.error ?? 0));
  const scale = niceScale(Math.min(...lows), Math.max(...highs), { includeZero: bars });
  const f = frame(ctx, top, { kind: "band", labels: data.groups.map((group) => group.name) }, { kind: "linear", scale, format: axisFormat(ctx, scale) }, { x: ctx.options.xTitle.trim(), y: ctx.options.yTitle.trim() || data.valueName });
  const barWidth = Math.min(f.band * 0.6, 56);
  data.groups.forEach((group, index) => {
    const centre = f.x(index);
    if (bars) fillBar(ctx, { x: centre - barWidth / 2, y: Math.min(f.y(group.value), f.y(Math.max(0, scale.min))), w: barWidth, h: Math.abs(f.y(Math.max(0, scale.min)) - f.y(group.value)) }, style, group.value >= 0 ? "top" : "bottom");
    if (group.error !== null) {
      const cap = Math.min(10, barWidth / 3);
      line(ctx, centre, f.y(group.value - group.error), centre, f.y(group.value + group.error), INK.primary, 1.25);
      line(ctx, centre - cap, f.y(group.value + group.error), centre + cap, f.y(group.value + group.error), INK.primary, 1.25);
      line(ctx, centre - cap, f.y(group.value - group.error), centre + cap, f.y(group.value - group.error), INK.primary, 1.25);
    }
    if (!bars) marker(ctx, style, centre, f.y(group.value), 4.5);
    if (ctx.options.dataLabels) text(ctx, centre + (bars ? 0 : 10), bars ? f.y(group.value + (group.error ?? 0)) - 6 : f.y(group.value) + labelSize(ctx) * 0.35, formatValue(group.value, decimalsFor(ctx, data.groups.map((candidate) => candidate.value))), labelSize(ctx), { anchor: bars ? "middle" : "start", fill: INK.secondary });
  });
  if (bars) baseline(ctx, f, false, scale);
  if (data.errorName) ctx.notes.push(`Error bars show ${data.errorName}.`);
}

export interface RenderResult {
  scene: Scene | null;
  data: ChartData | null;
  issues: ChartIssue[];
}

/** Draws a chart from a table and options, or returns the problems that stop it. */
export function renderChart(table: DataTable, options: ChartOptions): RenderResult {
  const issues = chartIssues(table, options);
  if (!canDraw(issues)) return { scene: null, data: null, issues };
  const style = STYLES[options.style];
  const ctx: Context = { options, style, items: [], notes: [], px: (options.fontSize * 4) / 3, width: options.width };
  const data = chartData(table, options.type, options.sort);
  const info = CHART_TYPE_INFO[options.type];
  switch (options.type) {
    case "bar":
      verticalBars(ctx, table, data as CategoryData, "single");
      break;
    case "grouped-bar":
      verticalBars(ctx, table, data as CategoryData, "grouped");
      break;
    case "stacked-bar":
      verticalBars(ctx, table, data as CategoryData, "stacked");
      break;
    case "stacked-bar-100":
      verticalBars(ctx, table, data as CategoryData, "percent");
      break;
    case "horizontal-bar":
      horizontalBars(ctx, table, data as CategoryData);
      break;
    case "pie":
    case "doughnut":
      pie(ctx, data as CategoryData, options.type === "doughnut");
      break;
    case "line":
    case "multi-line":
    case "area":
      lines(ctx, table, data as CategoryData, options.type === "area", options.type === "line");
      break;
    case "histogram":
    case "frequency-polygon":
      histogram(ctx, data as Extract<ChartData, { kind: "histogram" }>, options.type === "frequency-polygon");
      break;
    case "scatter":
    case "bubble":
      scatter(ctx, data as Extract<ChartData, { kind: "points" }>, options.type === "bubble");
      break;
    case "box-plot":
      boxPlot(ctx, data as Extract<ChartData, { kind: "box" }>);
      break;
    case "radar":
      radar(ctx, data as CategoryData);
      break;
    case "pareto":
      pareto(ctx, table, data as CategoryData);
      break;
    case "population-pyramid":
      pyramid(ctx, table, data as CategoryData);
      break;
    case "likert":
      likert(ctx, data as CategoryData);
      break;
    case "mean-comparison":
    case "error-bar":
      means(ctx, data as Extract<ChartData, { kind: "means" }>, options.type === "mean-comparison");
      break;
  }
  const scene: Scene = {
    width: options.width,
    height: options.height,
    title: options.title.trim() || info.label,
    description: (() => {
      const described = describeChart(data, options);
      return `${described.alt} ${described.summary}`.trim();
    })(),
    fontFamily: style.fontFamily,
    pdfFonts: style.pdfFonts,
    widthFactor: style.widthFactor,
    items: ctx.items,
    notes: ctx.notes,
  };
  return { scene, data, issues };
}
