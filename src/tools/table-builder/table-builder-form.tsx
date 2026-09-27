"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, RadioGroup, SelectField, Tag, TextField, VisuallyHidden } from "@/ui";
import { LearnMore, ProjectFields } from "@/features/research";
import { EMPTY_TYPED_PROJECT, STRENGTH_LABELS, projectFromTyped, type MeasurementLevel, type RecommendationStrength, type TypedProject } from "@/knowledge/research";
import {
  BORDER_STYLES,
  CORRELATION_METHODS,
  DEFAULT_TABLE_OPTIONS,
  FONT_FAMILIES,
  FONT_SIZES,
  NUMBER_ALIGNS,
  ORIENTATIONS,
  PADDINGS,
  PERCENT_BASES,
  SUPPRESS_BELOW,
  TABLE_FONTS,
  TABLE_GROUP_LABELS,
  TABLE_STYLES,
  TABLE_STYLE_LABELS,
  TABLE_TYPES,
  TABLE_TYPE_INFO,
  TEXT_ALIGNS,
  UNNUMBERED_TYPES,
  applyTableStyle,
  buildTable,
  recommendTables,
  styleSpec,
  typeDefaults,
  type TableOptions,
  type TableSuggestion,
  type TableType,
} from "@/knowledge/tables";
import { announcements, tableAnnouncement } from "./announcements";
import { SOURCE_TEXT, steps } from "./copy";
import { exampleLevels, exampleProject } from "./example";
import { TableOutput } from "./table-output";

const tones: Record<RecommendationStrength, "info" | "neutral" | "caution"> = { strong: "info", possible: "neutral", justify: "caution" };
const DECIMAL_CHOICES = [0, 1, 2, 3, 4] as const;

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

const hasProject = (project: TypedProject) => Object.values(project).some((value) => value.trim() !== "");

/** Project, table type, data, caption and style, and the finished table. The guide to every table type is rendered on the server and passed in. */
export function TableBuilderForm({ guide }: { guide: ReactNode }) {
  const [project, setProject] = useState<TypedProject>(EMPTY_TYPED_PROJECT);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [type, setType] = useState<TableType>("descriptive-statistics");
  const [text, setText] = useState("");
  const [options, setOptions] = useState<TableOptions>(DEFAULT_TABLE_OPTIONS);
  const [announcement, setAnnouncement] = useState("");
  const draft = useMemo(() => projectFromTyped(project, levels), [project, levels]);
  const result = useMemo(() => buildTable({ type, text, project: draft, options }), [type, text, draft, options]);
  const suggestions = useMemo(() => (hasProject(project) ? recommendTables(draft) : []), [project, draft]);
  const info = TABLE_TYPE_INFO[type];
  const needsText = info.source !== "project" || type === "hypothesis-summary";

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  /** Choices rebuild the table at once, so they are announced; typing isn't, to avoid constant interruptions. */
  const choose = (next: Partial<{ type: TableType; text: string; options: TableOptions }>, prefix = "") => {
    const nextType = next.type ?? type;
    const nextText = next.text ?? text;
    const nextOptions = next.options ?? options;
    if (next.type) setType(next.type);
    if (next.text !== undefined) setText(next.text);
    if (next.options) setOptions(next.options);
    announce(`${prefix}${tableAnnouncement(nextType, buildTable({ type: nextType, text: nextText, project: draft, options: nextOptions }))}`);
  };
  const set = <K extends keyof TableOptions>(key: K, value: TableOptions[K]) => choose({ options: { ...options, [key]: value } });

  const chooseType = (next: TableType) => {
    // Untouched example data follows the table, so its layout always matches.
    const onExample = text.trim() !== "" && text.trim() === info.example.trim();
    const nextText = onExample ? TABLE_TYPE_INFO[next].example : text;
    // Front matter drops the rules; leaving it brings back the style's own.
    const leaving = UNNUMBERED_TYPES.has(type) && !UNNUMBERED_TYPES.has(next) ? { borders: styleSpec(options).defaults.borders } : {};
    choose({ type: next, text: nextText, options: { ...options, ...leaving, ...typeDefaults(next) } });
  };

  const suggestionItem = (suggestion: TableSuggestion) => {
    const label = TABLE_TYPE_INFO[suggestion.type].label;
    return (
      <li key={suggestion.type} className="grid content-start gap-2 border-s-2 border-border ps-4">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{label}</span> <Tag tone={tones[suggestion.strength]}>{STRENGTH_LABELS[suggestion.strength]}</Tag>
        </p>
        <p className="text-small">{suggestion.reasons[0]}</p>
        <p className="text-small text-text-muted">
          {steps.basedOn}: {suggestion.basedOn.join("; ")}
        </p>
        <div>
          <Button variant="secondary" size="sm" onClick={() => chooseType(suggestion.type)}>
            {steps.useTable(label)}
          </Button>
        </div>
      </li>
    );
  };

  const onOff = (name: string, legend: string, value: boolean, onChange: (value: boolean) => void, hint?: string) => (
    <RadioGroup name={name} legend={legend} hint={hint} variant="inline" options={(["on", "off"] as const).map((option) => ({ value: option, label: steps.onOff[option] }))} value={value ? "on" : "off"} onChange={(option) => onChange(option === "on")} />
  );
  const inline = <T extends string>(name: string, legend: string, values: readonly T[], labels: Record<string, string>, value: T, onChange: (value: T) => void) => (
    <RadioGroup name={name} legend={legend} variant="inline" options={values.map((option) => ({ value: option, label: labels[option] }))} value={value} onChange={onChange} />
  );

  return (
    <div className="grid gap-10">
      <Step id="project" heading={steps.project}>
        <p className="text-text-muted">{steps.projectIntro}</p>
        <LearnMore label={steps.projectToggle}>
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setProject({ ...exampleProject });
                setLevels({ ...exampleLevels });
                announce(steps.exampleProjectLoaded);
              }}
            >
              {steps.exampleProject}
            </Button>
          </div>
          <ProjectFields
            prefix="tb"
            value={project}
            levels={levels}
            onType={(field, value) => setProject((current) => ({ ...current, [field]: value }))}
            onChoose={(next, nextLevels) => {
              setProject(next);
              setLevels(nextLevels);
            }}
          />
        </LearnMore>
        {suggestions.length > 0 && (
          <div className="grid gap-4">
            <h3 className="text-subheading font-semibold">{steps.suggested}</h3>
            <p className="text-text-muted">{steps.suggestedIntro}</p>
            <ul className="grid gap-4 md:grid-cols-2">{suggestions.filter((suggestion) => suggestion.strength === "strong").map(suggestionItem)}</ul>
            {suggestions.some((suggestion) => suggestion.strength !== "strong") && (
              <LearnMore label={steps.moreSuggestions(suggestions.filter((suggestion) => suggestion.strength !== "strong").length)}>
                <ul className="grid gap-4 md:grid-cols-2">{suggestions.filter((suggestion) => suggestion.strength !== "strong").map(suggestionItem)}</ul>
              </LearnMore>
            )}
          </div>
        )}
      </Step>

      <Step id="type" heading={steps.type}>
        <SelectField
          id="table-type"
          label={steps.typeLabel}
          hint={`${TABLE_GROUP_LABELS[info.group]}. ${info.description} ${SOURCE_TEXT[info.source]}`}
          options={TABLE_TYPES.map((candidate) => ({ value: candidate, label: TABLE_TYPE_INFO[candidate].label }))}
          value={type}
          onChange={(event) => chooseType(event.target.value as TableType)}
        />
        <p>
          <span className="font-medium">{steps.bestFor}:</span> {info.bestFor}
        </p>
      </Step>

      <Step id="data" heading={steps.data}>
        {info.source === "project" && <p>{hasProject(project) ? steps.projectOnly : steps.projectEmpty}</p>}
        {needsText && (
          <>
            <div className="grid gap-2">
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setText(info.example);
                    announce(announcements.exampleLoaded(type));
                  }}
                >
                  {steps.loadExample}
                </Button>
              </div>
              <p className="text-small text-text-muted">{steps.exampleNote}</p>
            </div>
            <TextField
              multiline
              id="table-data"
              label={type === "hypothesis-summary" ? steps.pValuesLabel : steps.dataLabel}
              hint={steps.dataHint(info.layout)}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={8}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="font-mono text-small"
            />
          </>
        )}
      </Step>

      <Step id="caption" heading={steps.caption}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label={steps.title} hint={steps.titleHint} placeholder={info.defaultTitle} value={options.title} onChange={(event) => setOptions({ ...options, title: event.target.value })} />
          {!UNNUMBERED_TYPES.has(type) && (
            <TextField label={steps.number} type="number" min={1} max={999} inputMode="numeric" value={String(options.number)} onChange={(event) => setOptions({ ...options, number: Math.max(1, Math.floor(Number(event.target.value)) || 1) })} />
          )}
          {type === "appendix" && <TextField label={steps.appendix} maxLength={2} value={options.appendix} onChange={(event) => setOptions({ ...options, appendix: event.target.value })} />}
          <TextField multiline rows={3} label={steps.note} hint={steps.noteHint} value={options.note} onChange={(event) => setOptions({ ...options, note: event.target.value })} />
          <TextField label={steps.source} hint={steps.sourceHint} value={options.source} onChange={(event) => setOptions({ ...options, source: event.target.value })} />
          <TextField multiline rows={3} label={steps.footnotes} hint={steps.footnotesHint} value={options.footnotes} onChange={(event) => setOptions({ ...options, footnotes: event.target.value })} />
        </div>
      </Step>

      <Step id="style" heading={steps.style}>
        <RadioGroup
          name="table-style"
          legend={steps.styleLabel}
          hint={styleSpec(options).advice}
          options={TABLE_STYLES.map((style) => ({ value: style, label: TABLE_STYLE_LABELS[style] }))}
          value={options.style}
          onChange={(style) => choose({ options: { ...applyTableStyle(options, style), ...typeDefaults(type) } })}
        />
        {options.style === "custom" && (
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label={steps.customLabel} value={options.custom.label} onChange={(event) => setOptions({ ...options, custom: { ...options.custom, label: event.target.value } })} />
            <SelectField
              label={steps.customSeparator}
              options={Object.entries(steps.separators).map(([value, label]) => ({ value, label }))}
              value={options.custom.separator}
              onChange={(event) => set("custom", { ...options.custom, separator: event.target.value })}
            />
            {inline("table-caption-position", steps.customPosition, ["above", "below"] as const, steps.positions, options.custom.position, (position) => set("custom", { ...options.custom, position }))}
            {onOff("table-label-bold", steps.labelBold, options.custom.labelBold, (labelBold) => set("custom", { ...options.custom, labelBold }))}
            {onOff("table-title-italic", steps.titleItalic, options.custom.titleItalic, (titleItalic) => set("custom", { ...options.custom, titleItalic }))}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label={steps.font} options={TABLE_FONTS.map((font) => ({ value: font, label: FONT_FAMILIES[font].label }))} value={options.font} onChange={(event) => set("font", event.target.value as TableOptions["font"])} />
          <SelectField label={steps.fontSize} options={FONT_SIZES.map((size) => ({ value: String(size), label: steps.points(size) }))} value={String(options.fontSize)} onChange={(event) => set("fontSize", Number(event.target.value))} />
          <SelectField label={steps.decimals} hint={steps.decimalsHint} options={DECIMAL_CHOICES.map((value) => ({ value: String(value), label: String(value) }))} value={String(options.decimals)} onChange={(event) => set("decimals", Number(event.target.value))} />
        </div>
        {inline("table-borders", steps.borders, BORDER_STYLES, steps.borderOptions, options.borders, (value) => set("borders", value))}
        {inline("table-orientation", steps.orientation, ORIENTATIONS, steps.orientationOptions, options.orientation, (value) => set("orientation", value))}
        <LearnMore label={steps.more}>
          <div className="grid gap-6">
            {inline("table-padding", steps.padding, PADDINGS, steps.paddingOptions, options.padding, (value) => set("padding", value))}
            {inline("table-text-align", steps.textAlign, TEXT_ALIGNS, steps.textAlignOptions, options.textAlign, (value) => set("textAlign", value))}
            {inline("table-number-align", steps.numberAlign, NUMBER_ALIGNS, steps.numberAlignOptions, options.numberAlign, (value) => set("numberAlign", value))}
            {onOff("table-bold-headers", steps.boldHeaders, options.boldHeaders, (value) => set("boldHeaders", value))}
            {onOff("table-alternating", steps.alternatingRows, options.alternatingRows, (value) => set("alternatingRows", value))}
            {onOff("table-repeat", steps.repeatHeader, options.repeatHeader, (value) => set("repeatHeader", value), steps.repeatHint)}
            {type === "cross-tabulation" && inline("table-percent", steps.percentBase, PERCENT_BASES, steps.percentOptions, options.percentBase, (value) => set("percentBase", value))}
            {type === "correlation-matrix" && (
              <>
                {inline("table-correlation", steps.correlation, CORRELATION_METHODS, steps.correlationOptions, options.correlation, (value) => set("correlation", value))}
                {onOff("table-stars", steps.stars, options.stars, (value) => set("stars", value))}
              </>
            )}
            {(type === "regression" || type === "coefficients") &&
              inline("table-p", steps.pAsStars, ["column", "stars"] as const, steps.pAsStarsOptions, options.pAsStars ? "stars" : "column", (value) => set("pAsStars", value === "stars"))}
            {type === "factor-analysis" && (
              <SelectField
                label={steps.suppress}
                options={SUPPRESS_BELOW.map((value) => ({ value: String(value), label: value === 0 ? steps.suppressNone : value.toFixed(2) }))}
                value={String(options.suppressBelow)}
                onChange={(event) => set("suppressBelow", Number(event.target.value))}
              />
            )}
            {type === "reliability" && onOff("table-items", steps.itemDetails, options.itemDetails, (value) => set("itemDetails", value))}
            {type === "hypothesis-summary" &&
              inline("table-alpha", steps.alpha, ["0.05", "0.01", "0.1"] as const, { "0.05": ".05", "0.01": ".01", "0.1": ".10" }, String(options.alpha) as "0.05" | "0.01" | "0.1", (value) => set("alpha", Number(value) as TableOptions["alpha"]))}
          </div>
        </LearnMore>
      </Step>

      <Step id="result" heading={steps.result}>
        {needsText && !text.trim() && info.source !== "project" ? <p className="text-text-muted">{steps.empty}</p> : <TableOutput result={result} options={options} onAnnounce={announce} />}
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
