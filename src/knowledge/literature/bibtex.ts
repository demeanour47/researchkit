/**
 * BibTeX, as exported by reference managers and Google Scholar. The parser follows the
 * format BibTeX itself reads: entries “@type{key, field = value, …}” with values in
 * braces (which may nest), in quotation marks, as numbers, or as @string abbreviations,
 * joined with “#”. LaTeX accents and escapes become ordinary characters. @comment and
 * @preamble are skipped.
 */

import type { MatrixField } from "./types";

export interface BibEntry {
  type: string;
  key: string;
  /** Field names in lower case, values as written, before LaTeX is cleaned. */
  fields: Record<string, string>;
}

export interface ParseOutcome<T> {
  entries: T[];
  /** Problems found, each as a sentence; entries that could be read are still returned. */
  notes: string[];
}

const MONTHS: Record<string, string> = { jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June", jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December" };

/** Reads one piece of BibTeX text: whitespace, balanced groups, quoted strings and values joined with #. */
class Reader {
  at = 0;
  constructor(
    readonly text: string,
    private readonly macros: Readonly<Record<string, string>>,
  ) {}

  skipSpace() {
    while (this.at < this.text.length && /\s/.test(this.text[this.at])) this.at++;
  }

  /** The inside of a balanced group starting at an opening brace or bracket, or null if it isn't closed. */
  group(open: string, close: string): string | null {
    if (this.text[this.at] !== open) return null;
    let depth = 0;
    const start = this.at + 1;
    for (; this.at < this.text.length; this.at++) {
      const character = this.text[this.at];
      if (character === "\\") {
        this.at++;
        continue;
      }
      if (character === open) depth++;
      else if (character === close && --depth === 0) {
        this.at++;
        return this.text.slice(start, this.at - 1);
      }
    }
    return null;
  }

  /** The inside of a quoted value, where braces may contain quotation marks. */
  quoted(): string | null {
    if (this.text[this.at] !== '"') return null;
    let depth = 0;
    const start = ++this.at;
    for (; this.at < this.text.length; this.at++) {
      const character = this.text[this.at];
      if (character === "\\") {
        this.at++;
        continue;
      }
      if (character === "{") depth++;
      else if (character === "}") depth--;
      else if (character === '"' && depth === 0) {
        this.at++;
        return this.text.slice(start, this.at - 1);
      }
    }
    return null;
  }

  /** A field value: braced, quoted, a number or an abbreviation, pieces joined with #. */
  value(): string | null {
    const parts: string[] = [];
    for (;;) {
      this.skipSpace();
      let part: string | null;
      if (this.text[this.at] === "{") part = this.group("{", "}");
      else if (this.text[this.at] === '"') part = this.quoted();
      else {
        const match = /^[A-Za-z0-9_:.+/-]+/.exec(this.text.slice(this.at));
        if (!match) return parts.length > 0 ? parts.join("") : null;
        this.at += match[0].length;
        part = /^\d+$/.test(match[0]) ? match[0] : (this.macros[match[0].toLowerCase()] ?? match[0]);
      }
      if (part === null) return null;
      parts.push(part);
      this.skipSpace();
      if (this.text[this.at] !== "#") return parts.join("");
      this.at++;
    }
  }

  /** The fields of an entry body, after its key. */
  fields(label: string): { fields: Record<string, string>; problem?: string } {
    const fields: Record<string, string> = {};
    while (this.at < this.text.length) {
      this.skipSpace();
      const name = /^[A-Za-z][A-Za-z0-9_:.-]*/.exec(this.text.slice(this.at));
      if (!name) break;
      this.at += name[0].length;
      this.skipSpace();
      if (this.text[this.at] !== "=") return { fields, problem: `The entry “${label}” has a field “${name[0]}” without “=”; it was skipped.` };
      this.at++;
      const read = this.value();
      if (read === null) return { fields, problem: `The entry “${label}” has an unfinished value for “${name[0]}”; it was skipped.` };
      fields[name[0].toLowerCase()] = read;
      this.skipSpace();
      if (this.text[this.at] === ",") this.at++;
    }
    return { fields };
  }
}

/** Reads BibTeX text into entries. */
export function parseBibtex(text: string): ParseOutcome<BibEntry> {
  const entries: BibEntry[] = [];
  const notes: string[] = [];
  const macros: Record<string, string> = { ...MONTHS };
  const reader = new Reader(text, macros);
  while (reader.at < text.length) {
    const next = text.indexOf("@", reader.at);
    if (next < 0) break;
    reader.at = next + 1;
    const typeMatch = /^\s*([A-Za-z]+)\s*/.exec(text.slice(reader.at));
    if (!typeMatch) continue;
    const type = typeMatch[1].toLowerCase();
    reader.at += typeMatch[0].length;
    const open = text[reader.at];
    if (open !== "{" && open !== "(") continue;
    const body = reader.group(open, open === "{" ? "}" : ")");
    if (body === null) {
      notes.push(`An @${type} entry isn't closed, so it and anything after it were skipped.`);
      break;
    }
    if (type === "comment" || type === "preamble") continue;
    const inner = new Reader(body, macros);
    let key = "";
    if (type !== "string") {
      const comma = body.indexOf(",");
      key = (comma < 0 ? body : body.slice(0, comma)).trim();
      inner.at = comma < 0 ? body.length : comma + 1;
    }
    const parsed = inner.fields(key || type);
    if (type === "string") for (const [name, value] of Object.entries(parsed.fields)) macros[name] = value;
    else if (parsed.problem) notes.push(parsed.problem);
    else entries.push({ type, key, fields: parsed.fields });
  }
  return { entries, notes };
}

// LaTeX to plain text.

const COMBINING: Record<string, string> = { '"': "̈", "'": "́", "`": "̀", "^": "̂", "~": "̃", "=": "̄", ".": "̇", c: "̧", v: "̌", u: "̆", H: "̋", k: "̨", r: "̊" };
const SYMBOLS: Record<string, string> = { ss: "ß", ae: "æ", AE: "Æ", oe: "œ", OE: "Œ", o: "ø", O: "Ø", aa: "å", AA: "Å", l: "ł", L: "Ł", i: "ı", j: "ȷ" };

/** LaTeX as plain text: accents as accented letters, escapes as characters, braces and formatting commands removed. */
export function latexToText(value: string): string {
  let text = value
    // Accents: \"{o}, {\"o}, \"o, \c{c}, \v{s}.
    .replace(/\{?\\(["'`^~=.])\s*\{?([A-Za-z])\}?\}?/g, (_, accent: string, letter: string) => `${letter}${COMBINING[accent]}`)
    .replace(/\{?\\([cvuHkr])\s*\{([A-Za-z])\}\}?/g, (_, accent: string, letter: string) => `${letter}${COMBINING[accent]}`)
    // A control word swallows the space after it (“Stra\\ss e” is “Straße”), unless it is braced (“{\\ss} e”).
    .replace(/\{\\(ss|ae|AE|oe|OE|aa|AA|o|O|l|L)\}|\\(ss|ae|AE|oe|OE|aa|AA|o|O|l|L)\b\s*/g, (_, braced: string | undefined, bare: string | undefined) => SYMBOLS[braced ?? bare ?? ""])
    .replace(/\\(?:emph|textit|textbf|textsc|textrm|mathrm|text)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\([&%$#_{}])/g, "$1")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/\\textendash\b\s*/g, "–")
    .replace(/\\textemdash\b\s*/g, "—")
    .replace(/(^|[^\\])~/g, "$1 ");
  text = text.replace(/[{}]/g, "").replace(/\\[A-Za-z]+\s*/g, "");
  return text.normalize("NFC").replace(/\s+/g, " ").trim();
}

/** Splits a BibTeX author list at “and”, except inside braces, where a group name such as “{Barnes and Noble}” stays whole. */
export function splitAuthors(value: string): string[] {
  const names: string[] = [];
  let depth = 0;
  let current = "";
  const words = value.split(/(\s+)/);
  for (const word of words) {
    for (const character of word) depth += character === "{" ? 1 : character === "}" ? -1 : 0;
    if (depth === 0 && /^and$/i.test(word)) {
      names.push(current.trim());
      current = "";
    } else current += word;
  }
  if (current.trim()) names.push(current.trim());
  return names.filter(Boolean);
}

/** A name as “Surname, Given”: from “Surname, Given”, “Given Surname” or “Given van der Surname”. Group names in braces stay as they are. */
export function surnameFirst(name: string): string {
  const trimmed = name.trim();
  if (/^\{.*\}$/.test(trimmed)) return latexToText(trimmed);
  const clean = latexToText(trimmed);
  if (clean.includes(",")) return clean.replace(/\s*,\s*/, ", ");
  const parts = clean.split(" ");
  if (parts.length === 1) return clean;
  // Lower-case particles before the surname belong to it: “Ludwig van Beethoven”.
  let first = parts.length - 1;
  while (first > 1 && /^[a-z]/.test(parts[first - 1])) first--;
  return `${parts.slice(first).join(" ")}, ${parts.slice(0, first).join(" ")}`;
}

/** Matrix columns from a BibTeX entry. Only what the entry states is filled; nothing is guessed. */
export function studyFromBibtex(entry: BibEntry): Partial<Record<MatrixField, string>> {
  const get = (...names: string[]) => {
    for (const name of names) if (entry.fields[name]?.trim()) return latexToText(entry.fields[name]);
    return "";
  };
  const year = get("year") || (/\d{4}/.exec(get("date"))?.[0] ?? "");
  const doi = get("doi") || (/doi\.org\/(10\.\S+)/.exec(get("url"))?.[1] ?? "");
  const notes = [get("abstract") && `Abstract: ${get("abstract")}`, get("keywords") && `Keywords: ${get("keywords")}`, get("note")].filter(Boolean).join("\n");
  return {
    authors: splitAuthors(entry.fields.author ?? entry.fields.editor ?? "").map(surnameFirst).join("; "),
    year,
    title: get("title"),
    journal: get("journal", "journaltitle", "booktitle", "series"),
    publisher: get("publisher", "institution", "school", "organization"),
    doi,
    notes,
  };
}
