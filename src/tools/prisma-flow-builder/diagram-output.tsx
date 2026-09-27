"use client";

import { Button, CopyButton } from "@/ui";
import { LearnMore } from "@/features/research";
import { copyFigure, download, svgToPng } from "@/features/figure-export";
import { diagramFileName, diagramPdf, type RenderedDiagram } from "@/knowledge/diagrams";
import type { FlowTableRow } from "@/knowledge/prisma";
import { announcements } from "./announcements";
import { steps } from "./copy";

export interface DiagramOutputProps {
  rendered: RenderedDiagram;
  alt: string;
  paragraph: string;
  table: readonly FlowTableRow[];
  onAnnounce: (message: string) => void;
}

/** The diagram, its text alternative, the flow in words, every number as a table, and exports. */
export function DiagramOutput({ rendered, alt, paragraph, table, onAnnounce }: DiagramOutputProps) {
  const { scene, svg, png } = rendered;
  const name = (extension: string) => diagramFileName(scene.title, extension);
  const save = async (format: "SVG" | "PNG" | "PDF") => {
    try {
      if (format === "SVG") download(new Blob([svg], { type: "image/svg+xml" }), name("svg"));
      if (format === "PDF") download(new Blob([diagramPdf(rendered)], { type: "application/pdf" }), name("pdf"));
      if (format === "PNG") download(await svgToPng(svg, scene, png), name("png"));
      onAnnounce(announcements.exported(format));
    } catch {
      onAnnounce(announcements.exportFailed(format));
    }
  };
  return (
    <div className="grid gap-6">
      {/* The SVG is written by the knowledge layer, which escapes every string; it names itself with its title and text alternative. */}
      <div role="region" aria-label={steps.previewLabel} tabIndex={0} className="overflow-x-auto rounded-panel border border-border bg-paper p-2 focus-ring [&>svg]:block [&>svg]:h-auto [&>svg]:w-full [&>svg]:min-w-[36rem]" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{steps.export}</h3>
        <p className="text-text-muted">{steps.exportIntro}</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={async () => onAnnounce((await copyFigure(svg, scene, png)) ? announcements.copied : announcements.copyFailed)}>{steps.copyDiagram}</Button>
          {(["SVG", "PNG", "PDF"] as const).map((format) => (
            <Button key={format} variant="secondary" onClick={() => save(format)}>
              {steps.download(format === "PNG" ? "PNG (300 DPI)" : format)}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <h3 className="text-subheading font-semibold">{steps.alt}</h3>
        <p className="text-small text-text-muted">{steps.altHint}</p>
        <p id="diagram-alt" className="rounded-control border border-border bg-surface p-3">
          {alt}
        </p>
        <div>
          <CopyButton text={alt} subject="" selectOnFailure="diagram-alt" copyLabel={steps.copyAlt} copiedLabel={steps.copiedAlt} onResult={(result) => onAnnounce(result === "copied" ? announcements.textCopied : announcements.copyFailed)} />
        </div>
      </div>
      {paragraph && (
        <div className="grid gap-2">
          <h3 className="text-subheading font-semibold">{steps.paragraph}</h3>
          <p className="text-small text-text-muted">{steps.paragraphHint}</p>
          <p id="diagram-paragraph" className="rounded-control border border-border bg-surface p-3">
            {paragraph}
          </p>
          <div>
            <CopyButton text={paragraph} subject="" selectOnFailure="diagram-paragraph" copyLabel={steps.copyParagraph} copiedLabel={steps.copiedParagraph} onResult={(result) => onAnnounce(result === "copied" ? announcements.textCopied : announcements.copyFailed)} />
          </div>
        </div>
      )}
      <div className="grid gap-2">
        <h3 className="text-subheading font-semibold">{steps.table}</h3>
        <LearnMore label={steps.table}>
          <div role="region" aria-labelledby="flow-table-caption" tabIndex={0} className="overflow-x-auto focus-ring">
            <table className="w-full border-collapse text-small">
              <caption id="flow-table-caption" className="mb-2 text-start font-medium">
                {steps.tableCaption}
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-2 py-1 text-start">{steps.stage}</th>
                  <th scope="col" className="px-2 py-1 text-end">{steps.count}</th>
                  <th scope="col" className="px-2 py-1 text-start">{steps.source}</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.stage} className="border-b border-border">
                    <th scope="row" className="px-2 py-1 text-start font-normal">{row.stage}</th>
                    <td className="px-2 py-1 text-end tabular-nums">{row.count === null ? "—" : row.count.toLocaleString("en-GB")}</td>
                    <td className="px-2 py-1">{row.count === null ? "" : row.calculated ? steps.calculated : steps.entered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LearnMore>
      </div>
    </div>
  );
}
