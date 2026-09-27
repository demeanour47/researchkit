"use client";

import { Button, Tag, copyRich } from "@/ui";
import { download } from "@/features/figure-export";
// The same title-to-file-name rule the chart builder uses.
import { chartFileName as fileName } from "@/knowledge/charts";
import { tableCsv, tableDocx, tableHtml, tableHtmlDocument, tableMarkdown, tablePdf, tablePlainText, tableTsv, type BuildResult, type TableOptions } from "@/knowledge/tables";
import { announcements } from "./announcements";
import { steps } from "./copy";

const FORMATS = ["DOCX", "PDF", "HTML", "Markdown", "CSV", "TSV"] as const;
type Format = (typeof FORMATS)[number];

/** The built table with its checks, a preview that is itself an accessible table, and every way to copy or save it. */
export function TableOutput({ result, options, onAnnounce }: { result: BuildResult; options: TableOptions; onAnnounce: (message: string) => void }) {
  const problems = result.issues.filter((issue) => issue.severity === "problem");
  const warnings = result.issues.filter((issue) => issue.severity === "warning");
  const table = result.table;

  const save = (format: Format) => {
    if (!table) return;
    try {
      const name = (extension: string) => fileName(table.title, extension);
      if (format === "DOCX") download(new Blob([tableDocx(table, options)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), name("docx"));
      if (format === "PDF") download(new Blob([tablePdf(table, options)], { type: "application/pdf" }), name("pdf"));
      if (format === "HTML") download(new Blob([tableHtmlDocument(table, options)], { type: "text/html;charset=utf-8" }), name("html"));
      if (format === "Markdown") download(new Blob([tableMarkdown(table, options)], { type: "text/markdown;charset=utf-8" }), name("md"));
      if (format === "CSV") download(new Blob([tableCsv(table)], { type: "text/csv;charset=utf-8" }), name("csv"));
      if (format === "TSV") download(new Blob([tableTsv(table)], { type: "text/tab-separated-values;charset=utf-8" }), name("tsv"));
      onAnnounce(announcements.exported(format));
    } catch {
      onAnnounce(announcements.exportFailed(format));
    }
  };

  return (
    <div className="grid gap-6">
      {problems.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-subheading font-semibold">{steps.cannotBuild}</h3>
          <ul className="grid gap-2">
            {problems.map((issue) => (
              <li key={issue.message} className="flex flex-wrap items-baseline gap-2 border-s-2 border-border ps-4">
                <Tag tone="caution">{steps.problemTag}</Tag> <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {table && (
        // The preview is the exported HTML itself, so what is seen is what is copied. Every string in it is escaped by the knowledge layer's writer.
        <div
          role="region"
          aria-label={steps.previewLabel}
          tabIndex={0}
          className="overflow-x-auto rounded-panel border border-border bg-paper p-4 text-on-paper focus-ring sm:p-6"
          dangerouslySetInnerHTML={{ __html: tableHtml(table, options, { mode: "document", idPrefix: "preview" }) }}
        />
      )}

      {warnings.length > 0 && (
        <ul className="grid gap-2">
          {warnings.map((issue) => (
            <li key={issue.message} className="flex flex-wrap items-baseline gap-2 border-s-2 border-border ps-4">
              <Tag tone="caution">{steps.warningTag}</Tag> <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}

      {table && (
        <div className="grid gap-3">
          <h3 className="text-subheading font-semibold">{steps.export}</h3>
          <p className="text-text-muted">{steps.exportIntro}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={async () => onAnnounce((await copyRich(tableHtml(table, options, { mode: "word" }), tablePlainText(table, options))) ? announcements.copied : announcements.copyFailed)}>{steps.copyTable}</Button>
            {FORMATS.map((format) => (
              <Button key={format} variant="secondary" onClick={() => save(format)}>
                {steps.download(steps.downloads[format])}
              </Button>
            ))}
          </div>
          <p className="text-small text-text-muted">{steps.spreadsheetNote}</p>
        </div>
      )}
    </div>
  );
}
