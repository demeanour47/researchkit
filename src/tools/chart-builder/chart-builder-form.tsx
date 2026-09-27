"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, RadioGroup, SelectField, TextField, VisuallyHidden } from "@/ui";
import { LearnMore } from "@/features/research";
import {
  CHART_TYPES,
  CHART_TYPE_INFO,
  DEFAULT_OPTIONS,
  FIGURE_SIZES,
  FONT_SIZES,
  LABEL_ROTATIONS,
  PALETTES,
  SORT_ORDERS,
  STYLES,
  STYLE_PRESETS,
  applyStyle,
  chartIssues,
  fittingTypes,
  paletteLabel,
  parseTable,
  renderChart,
  type ChartOptions,
  type ChartSuggestion,
  type ChartType,
  type FigureSizeId,
  type LabelRotation,
  type PaletteId,
  type SortOrder,
  type StylePreset,
} from "@/knowledge/charts";
import { announcements, chartAnnouncement } from "./announcements";
import { ChartFigure } from "./chart-figure";
import { steps } from "./copy";
import { Suggestions } from "./suggestions";

/** Rows shown in the preview of how the data was read; the chart itself uses them all. */
const PREVIEW_ROWS = 8;
const DECIMALS = ["auto", "0", "1", "2", "3"] as const;
const isExample = (text: string) => CHART_TYPES.some((type) => CHART_TYPE_INFO[type].example.trim() === text.trim());

function Step({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-border pt-8">
      <h2 id={`${id}-title`} className="text-heading font-semibold">
        {heading}
      </h2>
      {children}
    </section>
  );
}

const decimalValue = (value: string) => (value === "auto" ? null : Number(value));

/** Data, chart choice, appearance and the finished figure. The chart guide is rendered on the server and passed in. */
export function ChartBuilderForm({ guide }: { guide: ReactNode }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<ChartOptions>(DEFAULT_OPTIONS);
  const [announcement, setAnnouncement] = useState("");
  const parsed = useMemo(() => parseTable(text), [text]);
  const hasData = parsed.table.rows.length > 0;
  const result = useMemo(() => renderChart(parsed.table, options), [parsed, options]);
  const fits = useMemo(() => (hasData ? fittingTypes(parsed.table) : []), [parsed, hasData]);
  const info = CHART_TYPE_INFO[options.type];
  const sizeId = FIGURE_SIZES.find((size) => size.width === options.width && size.height === options.height)?.id ?? "page";

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  /** Choices redraw the chart at once, so they are announced; typing isn't, to avoid constant interruptions. */
  const choose = (next: ChartOptions, nextText = text) => {
    setOptions(next);
    const table = parseTable(nextText).table;
    announce(chartAnnouncement(next.type, chartIssues(table, next), table.rows.length > 0));
  };
  const set = <K extends keyof ChartOptions>(key: K, value: ChartOptions[K]) => choose({ ...options, [key]: value });

  const chooseType = (type: ChartType) => {
    // Swap untouched example data for the new chart's example, so the layout always matches.
    const onExample = text.trim() === CHART_TYPE_INFO[options.type].example.trim();
    const nextText = onExample ? CHART_TYPE_INFO[type].example : text;
    if (onExample) setText(nextText);
    choose({ ...options, type }, nextText);
  };
  const loadExample = () => {
    setText(CHART_TYPE_INFO[options.type].example);
    setOptions((current) => ({ ...current, subtitle: current.subtitle || steps.exampleSubtitle }));
    announce(announcements.exampleLoaded(options.type));
  };
  const applySuggestion = (suggestion: ChartSuggestion) => {
    const next: ChartOptions = {
      ...options,
      type: suggestion.type,
      sort: suggestion.sort ?? options.sort,
      title: suggestion.title || options.title,
      xTitle: suggestion.xTitle || options.xTitle,
      yTitle: suggestion.yTitle || options.yTitle,
    };
    choose(next);
  };

  const onOff = (name: string, legend: string, value: boolean, onChange: (value: boolean) => void) => (
    <RadioGroup
      name={name}
      legend={legend}
      variant="inline"
      options={(["on", "off"] as const).map((option) => ({ value: option, label: steps.onOff[option] }))}
      value={value ? "on" : "off"}
      onChange={(option) => onChange(option === "on")}
    />
  );

  return (
    <div className="grid gap-10">
      <Step id="data" heading={steps.data}>
        <p className="text-text-muted">{steps.dataIntro}</p>
        <div className="grid gap-2">
          <div>
            <Button variant="secondary" size="sm" onClick={loadExample}>
              {steps.loadExample}
            </Button>
          </div>
          <p className="text-small text-text-muted">{steps.exampleNote}</p>
        </div>
        <TextField
          multiline
          id="chart-data"
          label={steps.dataLabel}
          hint={steps.dataHint(info.layout)}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            // The example's subtitle mustn't stay on the researcher's own data.
            if (options.subtitle === steps.exampleSubtitle && !isExample(event.target.value)) setOptions({ ...options, subtitle: "" });
          }}
          rows={8}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="font-mono text-small"
        />
        {hasData && (
          <div className="grid gap-3">
            <p className="text-small">{steps.readAs(parsed.table.rows.length, parsed.table.columns.length, steps.delimiters[parsed.delimiter], parsed.hasHeader)}</p>
            {parsed.notes.length > 0 && (
              <ul className="grid list-disc gap-1 ps-6 text-small">
                {parsed.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
            <LearnMore label={steps.checkData}>
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={steps.previewCaption(Math.min(PREVIEW_ROWS, parsed.table.rows.length), parsed.table.rows.length)}>
                <table className="w-full border-collapse text-small">
                  <caption className="mb-2 text-start font-medium">{steps.previewCaption(Math.min(PREVIEW_ROWS, parsed.table.rows.length), parsed.table.rows.length)}</caption>
                  <thead>
                    <tr>
                      {parsed.table.columns.map((column) => (
                        <th key={column.name} scope="col" className="border-b border-border px-2 py-1 text-start align-bottom">
                          <span className="block font-semibold">{column.name}</span>
                          <span className="block font-normal text-text-muted">{steps.columnKind[column.kind]}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.table.rows.slice(0, PREVIEW_ROWS).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, index) => (
                          <td key={index} className={`border-b border-border px-2 py-1 ${typeof cell === "number" ? "text-end tabular-nums" : ""}`}>
                            {cell === null ? <span className="text-text-muted">{steps.missing}</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LearnMore>
            {fits.length > 0 && (
              <p className="text-small">
                <span className="font-medium">{steps.fits}:</span> {fits.map((type) => CHART_TYPE_INFO[type].label).join(", ")}.
              </p>
            )}
          </div>
        )}
      </Step>

      <Step id="chart" heading={steps.chart}>
        <p className="text-text-muted">{steps.chartIntro}</p>
        <SelectField
          id="chart-type"
          label={steps.chartLabel}
          hint={`${info.description} ${steps.bestFor}: ${info.bestFor.charAt(0).toLowerCase()}${info.bestFor.slice(1)}`}
          options={CHART_TYPES.map((type) => ({ value: type, label: CHART_TYPE_INFO[type].label }))}
          value={options.type}
          onChange={(event) => chooseType(event.target.value as ChartType)}
        />
        <Suggestions onUse={applySuggestion} onAnnounce={announce} />
      </Step>

      <Step id="appearance" heading={steps.appearance}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label={steps.title} hint={steps.titleHint} value={options.title} onChange={(event) => setOptions({ ...options, title: event.target.value })} />
          <TextField label={steps.subtitle} value={options.subtitle} onChange={(event) => setOptions({ ...options, subtitle: event.target.value })} />
          <TextField label={steps.xTitle} hint={steps.axisHint} value={options.xTitle} onChange={(event) => setOptions({ ...options, xTitle: event.target.value })} />
          <TextField label={steps.yTitle} hint={steps.axisHint} value={options.yTitle} onChange={(event) => setOptions({ ...options, yTitle: event.target.value })} />
        </div>
        <RadioGroup
          name="chart-style"
          legend={steps.style}
          hint={STYLES[options.style].advice}
          options={STYLE_PRESETS.map((preset) => ({ value: preset, label: STYLES[preset].label }))}
          value={options.style}
          onChange={(preset: StylePreset) => choose(applyStyle(options, preset))}
        />
        <RadioGroup
          name="chart-palette"
          legend={steps.palette}
          options={PALETTES.map((palette) => ({ value: palette, label: paletteLabel[palette] }))}
          value={options.palette}
          onChange={(palette: PaletteId) => set("palette", palette)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={steps.fontSize}
            hint={steps.fontSizeHint}
            options={FONT_SIZES.map((size) => ({ value: String(size), label: steps.points(size) }))}
            value={String(options.fontSize)}
            onChange={(event) => set("fontSize", Number(event.target.value))}
          />
          <SelectField
            label={steps.size}
            hint={steps.sizeHint}
            options={FIGURE_SIZES.map((size) => ({ value: size.id, label: size.label }))}
            value={sizeId}
            onChange={(event) => {
              const size = FIGURE_SIZES.find((candidate) => candidate.id === (event.target.value as FigureSizeId))!;
              choose({ ...options, width: size.width, height: size.height });
            }}
          />
        </div>

        <LearnMore label={steps.more}>
          <div className="grid gap-6">
            <RadioGroup
              name="chart-legend"
              legend={steps.legend}
              variant="inline"
              options={(["auto", "show", "hide"] as const).map((value) => ({ value, label: steps.legendOptions[value] }))}
              value={options.legend}
              onChange={(value) => set("legend", value)}
            />
            {onOff("chart-labels", steps.dataLabels, options.dataLabels, (value) => set("dataLabels", value))}
            <RadioGroup
              name="chart-percentages"
              legend={steps.percentages}
              variant="inline"
              options={(["values", "percentages"] as const).map((value) => ({ value, label: steps.percentageOptions[value] }))}
              value={options.percentages ? "percentages" : "values"}
              onChange={(value) => set("percentages", value === "percentages")}
            />
            {onOff("chart-gridlines", steps.gridlines, options.gridlines, (value) => set("gridlines", value))}
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label={steps.axisDecimals}
                options={DECIMALS.map((value) => ({ value, label: value === "auto" ? steps.auto : value }))}
                value={options.axisDecimals === null ? "auto" : String(options.axisDecimals)}
                onChange={(event) => set("axisDecimals", decimalValue(event.target.value))}
              />
              <SelectField
                label={steps.labelDecimals}
                options={DECIMALS.map((value) => ({ value, label: value === "auto" ? steps.auto : value }))}
                value={options.labelDecimals === null ? "auto" : String(options.labelDecimals)}
                onChange={(event) => set("labelDecimals", decimalValue(event.target.value))}
              />
              <SelectField
                label={steps.rotate}
                options={LABEL_ROTATIONS.map((value) => ({ value: String(value), label: steps.rotateOptions[String(value)] }))}
                value={String(options.rotateLabels)}
                onChange={(event) => set("rotateLabels", Number(event.target.value) as LabelRotation)}
              />
              <SelectField
                label={steps.sort}
                hint={steps.sortHint}
                options={SORT_ORDERS.map((value) => ({ value, label: steps.sortOptions[value] }))}
                value={options.sort}
                disabled={!info.sortable}
                onChange={(event) => set("sort", event.target.value as SortOrder)}
              />
            </div>
          </div>
        </LearnMore>
      </Step>

      <Step id="result" heading={steps.result}>
        {hasData ? <ChartFigure result={result} options={options} table={parsed.table} onAnnounce={announce} /> : <p className="text-text-muted">{steps.empty}</p>}
      </Step>

      <Step id="guide" heading={steps.guide}>
        {guide}
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
