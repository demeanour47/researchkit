import { Button } from "@/ui";
import { toMarkdown, toPlainText, toPrintHtml, type OnionSummary } from "@/knowledge/research";
import { exportFiles, summary as copy } from "./copy";

type Format = keyof typeof exportFiles;

const formatters: Record<Format, (summary: OnionSummary) => string> = {
  markdown: toMarkdown,
  text: toPlainText,
  html: toPrintHtml,
};

/** Saves text as a file in the browser. Nothing is uploaded. */
function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Buttons that download the summary as Markdown, plain text or a print-friendly page. */
export function ExportActions({ summary, onExported }: { summary: OnionSummary; onExported: (label: string) => void }) {
  const save = (format: Format) => {
    const file = exportFiles[format];
    download(formatters[format](summary), file.name, file.type);
    onExported(file.label);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h3 className="text-subheading font-semibold">{copy.exportHeading}</h3>
        <p className="text-small text-text-muted">{copy.exportHint}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => save("markdown")}>
          {copy.exportMarkdown}
        </Button>
        <Button variant="secondary" onClick={() => save("text")}>
          {copy.exportText}
        </Button>
        <Button variant="secondary" onClick={() => save("html")}>
          {copy.exportHtml}
        </Button>
      </div>
    </div>
  );
}
