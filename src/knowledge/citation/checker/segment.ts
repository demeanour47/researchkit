/**
 * Splitting pasted text into entries. Splitting is conservative: entries are
 * separated by blank lines, and a block is split further only when two or more of
 * its lines begin with a number, as in a numbered list pasted without blank lines.
 * Each entry keeps its original text for evidence; nothing is rewritten.
 */

import type { ReferenceEntry, ReferenceLabel } from "./types";

/** "[3] ", "[3a] ", "3. " or "3) " at the start of a line. */
const LABEL = /^\s*(?:\[([^\]\s]{1,8})\]|(\d{1,4})[.)])\s+/u;

const clean = (value: string) => value.replace(/\s+/gu, " ").trim();

export function readLabel(text: string): { label?: ReferenceLabel; rest: string } {
  const match = LABEL.exec(text);
  if (!match) return { rest: text };
  const bracketed = match[1];
  const raw = match[0].trim();
  const rest = text.slice(match[0].length);
  if (bracketed !== undefined) return { label: { raw, form: "bracket", number: /^\d+$/u.test(bracketed) ? Number(bracketed) : null }, rest };
  return { label: { raw, form: "list", number: Number(match[2]) }, rest };
}

const labelled = (line: string) => LABEL.test(line);

/** The entries as pasted, each with its original text. */
export function splitReferenceEntries(text: string): string[] {
  const blocks = text.replace(/\r\n?/gu, "\n").split(/\n\s*\n+/u).map((block) => block.trim()).filter(Boolean);
  return blocks.flatMap((block) => {
    const lines = block.split("\n");
    if (lines.filter(labelled).length < 2) return [block];
    const entries: string[][] = [];
    for (const line of lines) {
      if (labelled(line) || entries.length === 0) entries.push([line]);
      else entries[entries.length - 1].push(line);
    }
    return entries.map((entry) => entry.join("\n").trim());
  });
}

export function segment(text: string): ReferenceEntry[] {
  return splitReferenceEntries(text).map((originalText, position) => {
    const { label, rest } = readLabel(originalText);
    return { index: position + 1, originalText, text: clean(rest), ...(label ? { label } : {}) };
  });
}
