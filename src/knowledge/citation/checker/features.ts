/**
 * Readings of reference text that don't depend on a style: where a DOI or URL is,
 * which years appear, where an author list ends, and the names in it. Each style's
 * checker decides what the readings mean for that style. Nothing here guesses a
 * value that isn't in the text.
 */

import { isWebAddress, normalizeDoi } from "../source";

export const clean = (value: string) => value.replace(/\s+/gu, " ").trim();

/** A name or title reduced for comparison: no accents, case or punctuation. */
export const comparable = (value: string) =>
  value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Trailing punctuation that ends a sentence rather than an address. */
const trimTrailing = (value: string) => {
  let text = value.replace(/[.,;:]+$/u, "");
  // A closing bracket belongs to the address only if the address opened one.
  while (text.endsWith(")") && (text.match(/\(/gu) ?? []).length < (text.match(/\)/gu) ?? []).length) text = text.slice(0, -1).replace(/[.,;:]+$/u, "");
  return text;
};

export interface FoundDoi {
  /** The DOI as written, with its prefix. */
  raw: string;
  /** The https://doi.org/ form, or null when the DOI isn't valid. */
  normalized: string | null;
  /** "link" for https://doi.org/…, "prefix" for doi:10… or doi: 10…. */
  form: "link" | "prefix";
  index: number;
}

const DOI = /(?:https?:\/\/(?:dx\.|www\.)?doi\.org\/|\bdoi:\s*)(\S+)/iu;

export function findDoi(text: string): FoundDoi | null {
  const match = DOI.exec(text);
  if (!match || match.index === undefined) return null;
  const suffix = trimTrailing(match[1]);
  const raw = trimTrailing(match[0]);
  return { raw, normalized: normalizeDoi(suffix), form: /^https?:/iu.test(match[0]) ? "link" : "prefix", index: match.index };
}

export interface FoundUrl {
  raw: string;
  /** True for an address without http:// or https://, as MLA writes it. */
  bare: boolean;
  valid: boolean;
  index: number;
}

/** The first web address that isn't a DOI link. */
export function findUrl(text: string): FoundUrl | null {
  for (const match of text.matchAll(/\bhttps?:\/\/[^\s<>"]+|\bwww\.[^\s<>"]+/giu)) {
    if (/^https?:\/\/(?:dx\.|www\.)?doi\.org\//iu.test(match[0])) continue;
    const raw = trimTrailing(match[0]);
    const bare = !/^https?:/iu.test(raw);
    return { raw, bare, valid: isWebAddress(bare ? `https://${raw}` : raw), index: match.index ?? 0 };
  }
  return null;
}

/** Years in the text, as written, with any letter: "2015", "2024a". */
export function years(text: string): string[] {
  return [...text.matchAll(/\b(1[5-9]\d\d|20\d\d)([a-z])?\b/gu)].map((match) => match[0]);
}

/** The last year before any DOI or URL: in styles that give the date late, the publication year. */
export function lastYear(text: string): string | null {
  const cut = Math.min(...[findDoi(text)?.index, findUrl(text)?.index].filter((index): index is number => index !== undefined), text.length);
  const found = years(text.slice(0, cut));
  return found.length > 0 ? found[found.length - 1].replace(/[a-z]$/u, "") : null;
}

/** The first title in quotation marks: “…”, ‘…’ or "…". */
export function quotedTitle(text: string): { title: string; quotes: "double" | "single"; index: number; end: number } | null {
  const match = /“([^”]+)”|‘((?:[^’]|’(?=\p{L}))+)’|"([^"]+)"/u.exec(text);
  if (!match || match.index === undefined) return null;
  const title = match[1] ?? match[2] ?? match[3];
  return { title: title.replace(/[.,]$/u, ""), quotes: match[2] !== undefined ? "single" : "double", index: match.index, end: match.index + match[0].length };
}

const isInitial = (token: string) => /^\p{Lu}\.?$/u.test(token) || /^(?:\p{Lu}\.){2,}$/u.test(token) || /^\p{Lu}\.-\p{Lu}\.?$/u.test(token);

/**
 * Where an author list that ends with a full stop ends: the first ". " that isn't
 * between two initials, as in "Smith, J. R. Title." or "LeCun, Yann, et al. “Deep…”".
 */
export function authorBoundary(text: string): { lead: string; rest: string } | null {
  for (const match of text.matchAll(/\.\s+/gu)) {
    const at = match.index ?? 0;
    const before = text.slice(0, at).split(/\s+/u).pop() ?? "";
    const after = text.slice(at + match[0].length).split(/\s+/u)[0] ?? "";
    if (isInitial(`${before}.`) && isInitial(after)) continue;
    // A middle initial in a later author's name, which is in normal order: "…, and Jeffrey L. Kidder".
    const sinceComma = text.slice(0, at).split(",");
    if (isInitial(`${before}.`) && (sinceComma.length > 2 || /^\s*and\s/u.test(sinceComma[sinceComma.length - 1]))) continue;
    return { lead: text.slice(0, at + 1).replace(/\.$/u, ""), rest: text.slice(at + match[0].length) };
  }
  return null;
}

export interface NameList {
  names: string[];
  etAl: boolean;
}

const ET_AL = /,?\s*et al\.?$/u;

/**
 * Family names from a list whose first name is inverted and the rest are in normal
 * order, as MLA and Chicago write it: "Binder, Amy J., and Jeffrey L. Kidder". A
 * list with no comma is an organization.
 */
export function invertedFirstNames(lead: string): NameList {
  const etAl = ET_AL.test(lead);
  // A later author written inverted by mistake ("…, and Erdrich, Louise") is read in normal order, so it counts once.
  const text = lead.replace(ET_AL, "").trim().replace(/(,\s+and\s+)(\p{Lu}[\p{L}'’-]+),\s+([^,]+)$/u, "$1$3 $2");
  const comma = text.indexOf(",");
  if (comma < 0) return { names: text ? [text] : [], etAl };
  const first = text.slice(0, comma).trim();
  const others = text
    .slice(comma + 1)
    .split(/,\s*and\s+|\s+and\s+|,\s*/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(1);
  return { names: [first, ...others.map((name) => name.split(/\s+/u).pop() ?? name)], etAl };
}

/** Family names from "Family, I., Family, I. and Family, I." lists, as APA and Harvard write them. */
export function familyInitialNames(lead: string): NameList {
  const etAl = ET_AL.test(lead);
  const tokens = lead
    .replace(ET_AL, "")
    .replace(/,?\s+(?:&|and)\s+/gu, ", ")
    .split(/\s*,\s*/u)
    .map((token) => token.trim())
    .filter(Boolean);
  const names: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const next = tokens[i + 1];
    names.push(tokens[i]);
    if (next !== undefined && /^(?:\p{Lu}[\p{L}]*\.?[\s-]*)+$/u.test(next) && /\./u.test(next)) i += 1;
  }
  return { names, etAl };
}

/** Family names from "B. Klaus and P. Horn" lists, initials first, as IEEE writes them. */
export function initialsFirstNames(lead: string): NameList {
  const etAl = ET_AL.test(lead);
  const names = lead
    .replace(ET_AL, "")
    .split(/,\s*and\s+|\s+and\s+|,\s*/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => {
      const initials = /^(?:\p{Lu}\.[\s-]?)+/u.exec(name);
      return initials ? name.slice(initials[0].length).trim() : name;
    });
  return { names, etAl };
}

export interface Group {
  text: string;
  /** The text inside the brackets. */
  inner: string;
  index: number;
}

/** Text in round brackets that contains no other brackets. */
export const roundGroups = (text: string): Group[] => [...text.matchAll(/\(([^()]+)\)/gu)].map((match) => ({ text: match[0], inner: match[1].trim(), index: match.index ?? 0 }));

/** Text in square brackets. */
export const squareGroups = (text: string): Group[] => [...text.matchAll(/\[([^[\]]+)\]/gu)].map((match) => ({ text: match[0], inner: match[1].trim(), index: match.index ?? 0 }));

/** Numeric citations such as [1] or [1, p. 5] in the text: how many there are. */
export const numericCitationCount = (text: string) => squareGroups(text).filter((group) => /^\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*(?:\d+|pp?\.\s*\S+))*$/u.test(group.inner)).length;

/** Author–year parentheticals such as (Smith, 2024) or (Smith 2024) in the text: how many there are. */
export const authorYearCitationCount = (text: string) =>
  roundGroups(text).filter((group) => /^(?:see\s+)?\p{Lu}[^()]*?,?\s(?:1[5-9]\d\d|20\d\d)[a-z]?\b/u.test(group.inner)).length;

/** The opening of an entry, as several styles shape it: where the year sits relative to the authors. */
export type EntryForm = "author-year-stop" | "author-year" | "author-period-year" | "initials-first" | null;

/**
 * Recognises an entry's opening when it clearly has one style family's shape. Used
 * only to explain a mismatch; a style never accepts or rejects an entry by it.
 */
export function entryForm(text: string): EntryForm {
  if (/^[^()]{1,200}?\s\((?:(?:1[5-9]|20)\d\d[a-z]?|n\.d\.)\)\.\s/u.test(text)) return "author-year-stop";
  if (/^[^()]{1,200}?\s\((?:(?:1[5-9]|20)\d\d[a-z]?|no date)\)\s/u.test(text)) return "author-year";
  if (/^[^()“"]{1,200}?\.\s(?:(?:1[5-9]|20)\d\d[a-z]?|n\.d\.)\.\s/u.test(text)) return "author-period-year";
  if (/^(?:\p{Lu}\.[\s-]?)+\p{Lu}[\p{L}'’-]+(?:,|\sand\s)/u.test(text)) return "initials-first";
  return null;
}

/** How each form is described to the writer. */
export const ENTRY_FORM_NAMES: Record<Exclude<EntryForm, null>, string> = {
  "author-year-stop": "APA-style author–date formatting, with the year in brackets followed by a full stop",
  "author-year": "Harvard-style author–date formatting, with the year in brackets after the author",
  "author-period-year": "Chicago author–date formatting, with the year after the author's name and a full stop",
  "initials-first": "IEEE-style formatting, with initials before the family name",
};
