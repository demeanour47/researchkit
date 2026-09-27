/**
 * RIS, the tagged format most databases and reference managers export: one tag per
 * line, “AU  - Smith, John”, each record from “TY” to “ER”. Repeated tags, such as
 * several authors or keywords, are kept in order.
 */

import type { ParseOutcome } from "./bibtex";
import type { MatrixField } from "./types";

export interface RisRecord {
  type: string;
  /** Values by tag, in order. */
  tags: Record<string, string[]>;
}

const LINE = /^([A-Z][A-Z0-9])  ?-(?: (.*))?$/;

export function parseRis(text: string): ParseOutcome<RisRecord> {
  const entries: RisRecord[] = [];
  const notes: string[] = [];
  let current: RisRecord | null = null;
  let last: string | null = null;
  for (const raw of text.replace(/^﻿/, "").split(/\r?\n|\r/)) {
    const line = raw.trimEnd();
    const match = LINE.exec(line);
    if (!match) {
      // A line without a tag continues the previous value, as long abstracts do.
      if (current && last && line.trim()) {
        const values = current.tags[last];
        values[values.length - 1] = `${values[values.length - 1]} ${line.trim()}`;
      }
      continue;
    }
    const [, tag, value = ""] = match;
    if (tag === "TY") {
      if (current) {
        notes.push(`A record of type ${current.type} had no “ER” line; it was kept.`);
        entries.push(current);
      }
      current = { type: value.trim(), tags: {} };
      last = null;
      continue;
    }
    if (tag === "ER") {
      if (current) entries.push(current);
      current = null;
      last = null;
      continue;
    }
    if (!current) continue;
    (current.tags[tag] ??= []).push(value.trim());
    last = tag;
  }
  if (current) {
    notes.push(`The last record, of type ${current.type}, had no “ER” line; it was kept.`);
    entries.push(current);
  }
  return { entries, notes };
}

/** Matrix columns from an RIS record. Only what the record states is filled. */
export function studyFromRis(record: RisRecord): Partial<Record<MatrixField, string>> {
  const first = (...tags: string[]) => {
    for (const tag of tags) {
      const value = record.tags[tag]?.find((item) => item.trim());
      if (value) return value.trim();
    }
    return "";
  };
  const all = (...tags: string[]) => tags.flatMap((tag) => record.tags[tag] ?? []).map((item) => item.trim()).filter(Boolean);
  const url = all("UR").find((item) => /doi\.org\/10\./.test(item));
  const notes = [first("AB", "N2") && `Abstract: ${first("AB", "N2")}`, all("KW").length > 0 && `Keywords: ${all("KW").join("; ")}`, first("N1")].filter(Boolean).join("\n");
  return {
    authors: all("AU", "A1").join("; "),
    year: /\d{4}/.exec(first("PY", "Y1", "DA"))?.[0] ?? "",
    title: first("TI", "T1"),
    journal: first("JO", "JF", "T2", "JA", "J2"),
    publisher: first("PB"),
    doi: first("DO") || (url ? (/doi\.org\/(10\.\S+)/.exec(url)?.[1] ?? "") : ""),
    notes,
  };
}
