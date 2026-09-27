"use client";

import { useState } from "react";
import { Button, RadioGroup, TextField } from "@/ui";
import { importStudies, lookupDoi, addStudy, type ImportFormat, type Matrix } from "@/knowledge/literature";
import { importAnnouncement } from "./announcements";
import { steps } from "./copy";

type Mode = ImportFormat | "doi";
const MODES: readonly Mode[] = ["bibtex", "ris", "csv", "doi"];

/** Guesses the format from a file's extension. */
const formatOf = (name: string): ImportFormat | null => (/\.bib$/i.test(name) ? "bibtex" : /\.ris$/i.test(name) ? "ris" : /\.(csv|tsv|txt)$/i.test(name) ? "csv" : null);

/** Importing from BibTeX, RIS or CSV, or adding a study by its DOI. */
export function ImportPanel({ matrix, onImported }: { matrix: Matrix; onImported: (next: Matrix, message: string) => void }) {
  const [mode, setMode] = useState<Mode>("bibtex");
  const [text, setText] = useState("");
  const [doi, setDoi] = useState("");
  const [message, setMessage] = useState("");
  const report = (next: Matrix, sentence: string) => {
    setMessage(sentence);
    onImported(next, sentence);
  };

  const importText = () => {
    if (mode === "doi") return;
    const result = importStudies(matrix, mode, text);
    report(result.matrix, importAnnouncement(result));
    if (result.added > 0) setText("");
  };
  const addDoi = async () => {
    const result = await lookupDoi(doi, null);
    if (result.status === "invalid") {
      setMessage(result.message);
      onImported(matrix, result.message);
      return;
    }
    const fields = result.status === "found" ? result.fields : { doi: result.doi };
    report(addStudy(matrix, fields), result.status === "found" ? "Study added from its DOI." : result.message);
    setDoi("");
  };

  return (
    <div className="grid gap-4">
      <h3 className="text-subheading font-semibold">{steps.importHeading}</h3>
      <RadioGroup name="import-format" legend={steps.importFormat} variant="inline" options={MODES.map((value) => ({ value, label: steps.formats[value] }))} value={mode} onChange={setMode} />
      {mode === "doi" ? (
        <div className="grid gap-3">
          <TextField label={steps.doiLabel} hint={steps.doiHint} value={doi} onChange={(event) => setDoi(event.target.value)} autoComplete="off" spellCheck={false} />
          <div>
            <Button variant="secondary" onClick={addDoi} disabled={!doi.trim()}>
              {steps.addDoi}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <TextField multiline rows={6} label={steps.importText} hint={steps.importHint[mode]} value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} className="font-mono text-small" />
          <div className="grid gap-2">
            <label htmlFor="import-file" className="font-medium">
              {steps.chooseFile}
            </label>
            <input
              id="import-file"
              type="file"
              accept=".bib,.ris,.csv,.tsv,.txt"
              className="max-w-full text-small focus-ring"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const detected = formatOf(file.name);
                if (detected) setMode(detected);
                setText(await file.text());
              }}
            />
          </div>
          <div>
            <Button variant="secondary" onClick={importText} disabled={!text.trim()}>
              {steps.importButton}
            </Button>
          </div>
        </div>
      )}
      {message && <p className="text-small">{message}</p>}
    </div>
  );
}
