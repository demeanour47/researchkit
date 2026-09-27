"use client";

import { Button, CopyButton, Tag } from "@/ui";
import { LearnMore } from "@/features/research";
import { copyFigure, download, svgToPng } from "@/features/figure-export";
import { chartFileName, describeChart, figureCaption, pngPixels, sceneToPdf, sceneToSvg, tableToCsv, type ChartOptions, type DataTable, type RenderResult } from "@/knowledge/charts";
import { announcements } from "./announcements";
import { steps } from "./copy";

interface ChartFigureProps {
  result: RenderResult;
  options: ChartOptions;
  table: DataTable;
  onAnnounce: (message: string) => void;
}

/** The drawn chart with its checks, caption, text alternatives, table view and exports. */
export function ChartFigure({ result, options, table, onAnnounce }: ChartFigureProps) {
  const problems = result.issues.filter((issue) => issue.severity === "problem");
  const warnings = result.issues.filter((issue) => issue.severity === "warning");
  const { scene, data } = result;
  const text = data ? describeChart(data, options) : null;
  // Every string in the SVG is escaped by the knowledge layer's writer, and colours and numbers come from it too, so inserting it is safe.
  const svg = scene ? sceneToSvg(scene) : "";
  const caption = figureCaption(options);
  const name = options.title.trim() || "chart";

  const exportAs = async (format: "SVG" | "PNG" | "PDF") => {
    if (!scene) return;
    try {
      if (format === "SVG") download(new Blob([svg], { type: "image/svg+xml" }), chartFileName(name, "svg"));
      if (format === "PDF") download(new Blob([sceneToPdf(scene)], { type: "application/pdf" }), chartFileName(name, "pdf"));
      if (format === "PNG") download(await svgToPng(svg, scene, pngPixels(scene)), chartFileName(name, "png"));
      onAnnounce(announcements.exported(format));
    } catch {
      onAnnounce(announcements.exportFailed(format));
    }
  };

  return (
    <div className="grid gap-6">
      {problems.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-subheading font-semibold">{steps.cannotDraw}</h3>
          <ul className="grid gap-2">
            {problems.map((issue) => (
              <li key={issue.message} className="flex flex-wrap items-baseline gap-2 border-s-2 border-border ps-4">
                <Tag tone="caution">{steps.problemTag}</Tag> <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scene && text && (
        <>
          <figure className="grid gap-3">
            {/* A white surface in both themes: the figure is what will print. */}
            <div role="group" aria-label={steps.figureLabel} className="overflow-hidden rounded-panel border border-border bg-paper p-2 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full" style={{ maxWidth: scene.width + 18 }} dangerouslySetInnerHTML={{ __html: svg }} />
            <figcaption className="grid gap-1">
              <span className="font-medium">{steps.caption}</span>
              <span id="chart-caption" className="whitespace-pre-line">{caption}</span>
              <span className="text-small text-text-muted">{steps.captionHint}</span>
            </figcaption>
          </figure>
          <div className="flex flex-wrap gap-3">
            <CopyButton text={caption} subject="" selectOnFailure="chart-caption" copyLabel={steps.copyCaption} copiedLabel={steps.copiedCaption} onResult={(outcome) => onAnnounce(outcome === "copied" ? announcements.captionCopied : announcements.copyFailed)} />
          </div>
        </>
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

      {scene && scene.notes.length > 0 && (
        <div className="grid gap-1">
          <h3 className="font-semibold">{steps.notes}</h3>
          <ul className="grid list-disc gap-1 ps-6 text-small">
            {scene.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {scene && text && (
        <>
          <div className="grid gap-2">
            <h3 className="text-subheading font-semibold">{steps.summary}</h3>
            <p>{text.summary}</p>
          </div>
          <div className="grid gap-2">
            <h3 className="text-subheading font-semibold">{steps.alt}</h3>
            <p className="text-small text-text-muted">{steps.altHint}</p>
            <p id="chart-alt" className="rounded-control border border-border bg-surface p-3">{text.alt}</p>
            <div>
              <CopyButton text={text.alt} subject="" selectOnFailure="chart-alt" copyLabel={steps.copyAlt} copiedLabel={steps.copiedAlt} onResult={(outcome) => onAnnounce(outcome === "copied" ? announcements.altCopied : announcements.copyFailed)} />
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="text-subheading font-semibold">{steps.table}</h3>
            <p className="text-small text-text-muted">{steps.tableHint}</p>
            <LearnMore label={steps.table}>
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={text.table.caption}>
                <table className="w-full border-collapse text-small">
                  <caption className="mb-2 text-start font-medium">{text.table.caption}</caption>
                  <thead>
                    <tr>
                      {text.table.columns.map((column, index) => (
                        <th key={`${column}-${index}`} scope="col" className="border-b border-border px-2 py-1 text-start font-semibold">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {text.table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, index) =>
                          index === 0 ? (
                            <th key={index} scope="row" className="border-b border-border px-2 py-1 text-start font-medium">
                              {cell}
                            </th>
                          ) : (
                            <td key={index} className="border-b border-border px-2 py-1 text-end tabular-nums">
                              {cell}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <CopyButton text={tableToCsv(table)} subject="" copyLabel={steps.copyTable} copiedLabel={steps.copiedTable} onResult={(outcome) => onAnnounce(outcome === "copied" ? announcements.tableCopied : announcements.copyFailed)} />
              </div>
            </LearnMore>
          </div>
          <div className="grid gap-3">
            <h3 className="text-subheading font-semibold">{steps.export}</h3>
            <p className="text-text-muted">{steps.exportIntro}</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={async () => onAnnounce((await copyFigure(svg, scene, pngPixels(scene))) ? announcements.copied : announcements.copyFailed)}>
                {steps.copyChart}
              </Button>
              <Button variant="secondary" onClick={() => exportAs("PNG")}>
                {steps.downloadPng}
              </Button>
              <Button variant="secondary" onClick={() => exportAs("SVG")}>
                {steps.downloadSvg}
              </Button>
              <Button variant="secondary" onClick={() => exportAs("PDF")}>
                {steps.downloadPdf}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
