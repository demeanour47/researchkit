"use client";

import { useState } from "react";
import { Button, RadioGroup, TextField } from "@/ui";
import { countRecords, type RecordCount, type RecordExport } from "@/knowledge/prisma";
import { steps } from "./copy";
import { newId } from "./item-lists";

const FORMATS = [
  { value: "ris", label: "RIS" },
  { value: "bibtex", label: "BibTeX" },
  { value: "csv", label: "CSV" },
] as const;

/** Counting records, and duplicates across them, from the files each database exported. */
export function RecordsPanel({ onUse, onAnnounce }: { onUse: (result: RecordCount) => void; onAnnounce: (message: string) => void }) {
  const [files, setFiles] = useState<RecordExport[]>([{ id: "f1", name: "", format: "ris", text: "" }]);
  const [result, setResult] = useState<RecordCount | null>(null);
  const update = (index: number, change: Partial<RecordExport>) => setFiles(files.map((file, position) => (position === index ? { ...file, ...change } : file)));
  return (
    <div className="grid gap-4">
      <p className="text-text-muted">{steps.countIntro}</p>
      {files.map((file, index) => (
        <fieldset key={file.id} className="grid gap-3 rounded-panel border border-border p-4">
          <legend className="px-1 font-semibold">{`File ${index + 1}`}</legend>
          <TextField label={steps.exportName} value={file.name} onChange={(event) => update(index, { name: event.target.value })} />
          <RadioGroup name={`format-${file.id}`} legend={steps.exportFormat} variant="inline" options={FORMATS} value={file.format} onChange={(format) => update(index, { format })} />
          <TextField multiline rows={4} label={steps.exportText} value={file.text} spellCheck={false} className="font-mono text-small" onChange={(event) => update(index, { text: event.target.value })} />
          <div className="grid gap-1">
            <label htmlFor={`file-${file.id}`} className="font-medium">
              Or choose the file
            </label>
            <input
              id={`file-${file.id}`}
              type="file"
              accept=".ris,.bib,.csv,.txt"
              className="max-w-full text-small focus-ring"
              onChange={async (event) => {
                const chosen = event.target.files?.[0];
                if (!chosen) return;
                const format = /\.bib$/i.test(chosen.name) ? "bibtex" : /\.csv$/i.test(chosen.name) ? "csv" : "ris";
                update(index, { text: await chosen.text(), format, name: file.name || chosen.name.replace(/\.[^.]+$/, "") });
              }}
            />
          </div>
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={() => setFiles([...files, { id: newId("f"), name: "", format: "ris", text: "" }])}>
          {steps.addExport}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={files.every((file) => !file.text.trim())}
          onClick={() => {
            const counted = countRecords(files.filter((file) => file.text.trim()));
            setResult(counted);
            onAnnounce(`${counted.total} records counted, ${counted.duplicates} of them duplicates.`);
          }}
        >
          {steps.countButton}
        </Button>
      </div>
      {result && (
        <div className="grid gap-2">
          <p>{steps.countResult(result.total, result.duplicates, result.unique)}</p>
          <ul className="grid list-disc gap-1 ps-6 text-small">
            {result.sources.map((source) => (
              <li key={source.id}>{`${source.name}: ${source.records} records${source.notes.length > 0 ? ` (${source.notes[0]})` : ""}`}</li>
            ))}
          </ul>
          {result.unmatched > 0 && <p className="text-small">{steps.unmatched(result.unmatched)}</p>}
          <div>
            <Button size="sm" onClick={() => onUse(result)}>
              {steps.useCounts}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
