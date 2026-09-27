"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, RadioGroup, SelectField, Tag, TextField, VisuallyHidden } from "@/ui";
import { LearnMore } from "@/features/research";
import { DEFAULT_LAYOUT_OPTIONS, ORIENTATIONS, ORIENTATION_LABELS, THEMES, THEME_LABELS, TYPEFACES, TYPEFACE_LABELS, diagramProblems, renderDiagram, type LayoutOptions } from "@/knowledge/diagrams";
import {
  CHECK_KIND_LABELS,
  EMPTY_PRISMA_INPUT,
  LABEL_KEYS,
  PRISMA_KINDS,
  PRISMA_KIND_INFO,
  altText,
  computeFlow,
  defaultLabels,
  diagramTitle,
  flowParagraph,
  flowTable,
  includedFromMatrix,
  prismaDiagram,
  prismaIssues,
  type PrismaInput,
  type PrismaKind,
} from "@/knowledge/prisma";
import { createProjectDraft } from "@/knowledge/research";
import { announcements, checksAnnouncement } from "./announcements";
import { steps } from "./copy";
import { DiagramOutput } from "./diagram-output";
import { exampleInput, exampleTopic } from "./example";
import { ReasonList, SourceList } from "./item-lists";
import { NumberField } from "./number-field";
import { RecordsPanel } from "./records-panel";

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

const FONT_SIZES = [8, 9, 10, 11, 12] as const;

/** Where each input's field is on the page, for linking checks to fields. */
const fieldId = (field: string) => (field.includes(".") ? `field-${field.split(".").join("-")}` : `field-${field}`);

/** Diagram type, numbers, checks, appearance and the finished diagram. The guide is rendered on the server and passed in. */
export function FlowBuilder({ guide }: { guide: ReactNode }) {
  const [input, setInput] = useState<PrismaInput>(EMPTY_PRISMA_INPUT);
  const [layout, setLayout] = useState<LayoutOptions>(DEFAULT_LAYOUT_OPTIONS);
  const [topic, setTopic] = useState("");
  const [matrixCsv, setMatrixCsv] = useState("");
  const [announcement, setAnnouncement] = useState("");
  // The topic is the project's, kept in the shared project draft.
  const project = useMemo(() => createProjectDraft({ topic }), [topic]);
  const flow = useMemo(() => computeFlow(input), [input]);
  const issues = useMemo(() => prismaIssues(input, flow), [input, flow]);
  const diagram = useMemo(() => prismaDiagram(input, diagramTitle(input, project.topic ?? ""), flow), [input, project, flow]);
  const rendered = useMemo(() => (diagramProblems(diagram).length === 0 ? renderDiagram(diagram, layout) : null), [diagram, layout]);
  const narrative = input.kind === "narrative";
  const exclusions = PRISMA_KIND_INFO[input.kind].exclusions;
  const standard = defaultLabels(input.kind);

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };
  const set = <K extends keyof PrismaInput>(key: K, value: PrismaInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  /** Choices that change the diagram at once are announced with the checks. */
  const choose = (next: PrismaInput) => {
    setInput(next);
    announce(checksAnnouncement(prismaIssues(next)));
  };
  const errorFor = (field: string) => issues.find((issue) => issue.field === field && issue.severity === "problem")?.message;
  const count = (field: "duplicates" | "automation" | "removedOther" | "screenedExcluded" | "notRetrieved" | "studiesIncluded" | "otherNotRetrieved", label: string, hint?: string) => (
    <NumberField id={fieldId(field)} label={label} hint={hint} value={input[field]} error={errorFor(field)} onChange={(value) => set(field, value)} />
  );
  const calculated = (field: "screened" | "sought" | "assessed" | "otherSought" | "otherAssessed" | "reportsIncluded", label: string) => {
    const stage = flow[field];
    return <NumberField id={fieldId(field)} label={label} hint={steps.calculate(stage.expected)} placeholder={stage.expected === null ? "" : String(stage.expected)} value={input[field]} error={errorFor(field)} onChange={(value) => set(field, value)} />;
  };
  const problems = issues.filter((issue) => issue.severity === "problem");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return (
    <div className="grid gap-10">
      <Step id="setup" heading={steps.setup}>
        <RadioGroup name="diagram-kind" legend={steps.kind} hint={PRISMA_KIND_INFO[input.kind].description} options={PRISMA_KINDS.map((kind) => ({ value: kind, label: PRISMA_KIND_INFO[kind].label }))} value={input.kind} onChange={(kind: PrismaKind) => choose({ ...input, kind })} />
        {!narrative && (
          <RadioGroup name="other-methods" legend={steps.otherMethods} hint={steps.otherMethodsHint} variant="inline" options={(["on", "off"] as const).map((value) => ({ value, label: steps.onOff[value] }))} value={input.otherMethods ? "on" : "off"} onChange={(value) => choose({ ...input, otherMethods: value === "on" })} />
        )}
        <TextField label={steps.topic} hint={steps.topicHint} value={topic} onChange={(event) => setTopic(event.target.value)} />
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setInput({ ...exampleInput, kind: input.kind, otherMethods: input.otherMethods });
              setTopic(exampleTopic);
              announce(steps.exampleLoaded);
            }}
          >
            {steps.loadExample}
          </Button>
        </div>
      </Step>

      <Step id="numbers" heading={steps.numbers}>
        <section aria-labelledby="identification-title" className="grid gap-4">
          <h3 id="identification-title" className="text-subheading font-semibold">
            {steps.identification}
          </h3>
          <SourceList id="databases" legend={steps.databases} noun="database" sources={input.databases} errorFor={errorFor} onChange={(databases) => set("databases", databases)} />
          <SourceList id="registers" legend={steps.registers} noun="register" sources={input.registers} errorFor={errorFor} onChange={(registers) => set("registers", registers)} />
          <LearnMore label={steps.countFromFiles}>
            <RecordsPanel
              onAnnounce={announce}
              onUse={(result) => {
                const next: PrismaInput = { ...input, databases: result.sources.map((source) => ({ id: source.id, name: source.name, count: source.records })), duplicates: result.duplicates };
                setInput(next);
                announce(`${announcements.countsUsed} ${checksAnnouncement(prismaIssues(next))}`);
              }}
            />
          </LearnMore>
          {exclusions && (
            <fieldset className="grid gap-4 sm:grid-cols-3">
              <legend className="mb-2 font-semibold">{steps.removed}</legend>
              {count("duplicates", steps.duplicates)}
              {count("automation", steps.automation)}
              {count("removedOther", steps.removedOther)}
            </fieldset>
          )}
        </section>

        <section aria-labelledby="screening-title" className="grid gap-4">
          <h3 id="screening-title" className="text-subheading font-semibold">
            {steps.screening}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {calculated("screened", steps.screened)}
            {exclusions && count("screenedExcluded", steps.screenedExcluded)}
            {exclusions && calculated("sought", steps.sought)}
            {exclusions && count("notRetrieved", steps.notRetrieved)}
            {calculated("assessed", narrative ? standard.assessed : steps.assessed)}
          </div>
          {exclusions && <ReasonList id="reasons" legend={steps.reasons} reasons={input.reasons} errorFor={errorFor} onChange={(reasons) => set("reasons", reasons)} />}
        </section>

        {input.otherMethods && !narrative && (
          <section aria-labelledby="other-title" className="grid gap-4">
            <h3 id="other-title" className="text-subheading font-semibold">
              {steps.otherColumn}
            </h3>
            <SourceList id="otherSources" legend={steps.otherSources} noun="source" sources={input.otherSources} errorFor={errorFor} onChange={(otherSources) => set("otherSources", otherSources)} />
            <div className="grid gap-4 sm:grid-cols-2">
              {calculated("otherSought", steps.otherSought)}
              {count("otherNotRetrieved", steps.otherNotRetrieved)}
              {calculated("otherAssessed", steps.otherAssessed)}
            </div>
            <ReasonList id="otherReasons" legend={steps.otherReasons} reasons={input.otherReasons} errorFor={errorFor} onChange={(otherReasons) => set("otherReasons", otherReasons)} />
          </section>
        )}

        <section aria-labelledby="included-title" className="grid gap-4">
          <h3 id="included-title" className="text-subheading font-semibold">
            {steps.included}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {!narrative && calculated("reportsIncluded", steps.reportsIncluded)}
            {count("studiesIncluded", steps.studiesIncluded, steps.studiesHint)}
          </div>
          <LearnMore label={steps.fromMatrix}>
            <p className="text-text-muted">{steps.fromMatrixIntro}</p>
            <TextField multiline rows={4} label="Literature Matrix CSV" value={matrixCsv} spellCheck={false} className="font-mono text-small" onChange={(event) => setMatrixCsv(event.target.value)} />
            <div>
              <Button
                variant="secondary"
                size="sm"
                disabled={!matrixCsv.trim()}
                onClick={() => {
                  const result = includedFromMatrix(matrixCsv);
                  const next = { ...input, studiesIncluded: result.count };
                  setInput(next);
                  announce(`${announcements.studiesCounted(result.count)} ${checksAnnouncement(prismaIssues(next))}`);
                }}
              >
                {steps.fromMatrixButton}
              </Button>
            </div>
          </LearnMore>
        </section>
      </Step>

      <Step id="checks" heading={steps.checks}>
        {issues.length === 0 ? (
          <p>{steps.checksClear}</p>
        ) : (
          <div className="grid gap-3">
            <p className="font-medium">{[problems.length > 0 ? steps.problems(problems.length) : "", warnings.length > 0 ? steps.warnings(warnings.length) : ""].filter(Boolean).join(", ")}</p>
            <ul className="grid gap-2">
              {[...problems, ...warnings].map((issue, index) => (
                <li key={index} className="flex flex-wrap items-baseline gap-2 border-s-2 border-border ps-4">
                  <Tag tone={issue.severity === "problem" ? "caution" : "neutral"}>{`${issue.severity === "problem" ? "Problem" : "Check"}: ${CHECK_KIND_LABELS[issue.kind]}`}</Tag>
                  <span>{issue.message}</span>
                  <a
                    href={`#${fieldId(issue.field)}`}
                    className="text-small underline focus-ring"
                    onClick={(event) => {
                      const target = document.getElementById(fieldId(issue.field));
                      if (!target) return;
                      event.preventDefault();
                      target.focus();
                      target.scrollIntoView({ block: "center" });
                    }}
                  >
                    {steps.goTo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Step>

      <Step id="appearance" heading={steps.appearance}>
        <div className="grid gap-4 sm:grid-cols-2">
          <RadioGroup name="orientation" legend={steps.orientation} variant="inline" options={ORIENTATIONS.map((value) => ({ value, label: ORIENTATION_LABELS[value] }))} value={layout.orientation} onChange={(orientation) => setLayout({ ...layout, orientation })} />
          <RadioGroup name="typeface" legend={steps.typeface} variant="inline" options={TYPEFACES.map((value) => ({ value, label: TYPEFACE_LABELS[value] }))} value={layout.typeface} onChange={(typeface) => setLayout({ ...layout, typeface })} />
        </div>
        <RadioGroup name="theme" legend={steps.theme} variant="inline" options={THEMES.map((value) => ({ value, label: THEME_LABELS[value] }))} value={layout.theme} onChange={(theme) => setLayout({ ...layout, theme })} />
        <div className="max-w-xs">
          <SelectField label={steps.fontSize} options={FONT_SIZES.map((size) => ({ value: String(size), label: steps.points(size) }))} value={String(layout.fontSize)} onChange={(event) => setLayout({ ...layout, fontSize: Number(event.target.value) })} />
        </div>
        <LearnMore label={steps.wording}>
          <p className="text-small text-text-muted">{steps.wordingHint}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {LABEL_KEYS.filter((key) => (input.otherMethods || !key.startsWith("other")) && (exclusions || !["removed", "screenedExcluded", "sought", "notRetrieved", "reportsExcluded"].includes(key))).map((key) => (
              <TextField key={key} label={steps.labelNames[key]} placeholder={standard[key]} value={input.labels[key] ?? ""} onChange={(event) => set("labels", { ...input.labels, [key]: event.target.value })} />
            ))}
          </div>
        </LearnMore>
        {!narrative && (
          <LearnMore label={steps.arrows}>
            <div className="grid gap-4">
              {diagram.edges.map((edge) => (
                <fieldset key={edge.id} className="grid items-end gap-3 sm:grid-cols-[1fr_auto_14rem]">
                  <legend className="font-medium">{steps.arrowNames[edge.id] ?? edge.id}</legend>
                  <label className="flex min-h-control items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-action focus-ring"
                      checked={!input.hiddenArrows.includes(edge.id)}
                      onChange={(event) => set("hiddenArrows", event.target.checked ? input.hiddenArrows.filter((id) => id !== edge.id) : [...input.hiddenArrows, edge.id])}
                    />
                    {steps.arrowShown}
                  </label>
                  <TextField label={steps.arrowLabel} value={input.arrowLabels[edge.id] ?? ""} onChange={(event) => set("arrowLabels", { ...input.arrowLabels, [edge.id]: event.target.value })} />
                </fieldset>
              ))}
            </div>
          </LearnMore>
        )}
      </Step>

      <Step id="result" heading={steps.result}>
        {rendered ? <DiagramOutput rendered={rendered} alt={altText(input, flow)} paragraph={flowParagraph(input, flow)} table={flowTable(input, flow)} onAnnounce={announce} /> : <p>{diagramProblems(diagram)[0]?.message}</p>}
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
