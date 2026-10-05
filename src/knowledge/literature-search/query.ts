/**
 * Validation of a search. A student's words are tidied (whitespace, stray quotation
 * marks) and checked, never rewritten into a different search: what is sent to the
 * provider is what the student typed, and any change made is reported as a notice.
 */

import {
  DOCUMENT_TYPES,
  OPEN_ACCESS_FILTERS,
  SEARCH_LIMITS,
  type DocumentType,
  type OpenAccessFilter,
  type SearchRequest,
} from "./types";
import { fold, STOPWORDS } from "./text";

export type QueryResult = { ok: true; query: string; notices: string[] } | { ok: false; message: string };

const CONTROL = /[\u0000-\u001f\u007f]/g;

/** Tidies a query without changing what it asks. */
export function normalizeQuery(raw: unknown): QueryResult {
  if (typeof raw !== "string") return { ok: false, message: "Enter a search." };
  const notices: string[] = [];
  let query = raw.replace(CONTROL, " ").replace(/[\u201c\u201d\u201e\u00ab\u00bb]/g, '"').replace(/\s+/g, " ").trim();

  if (query.length > SEARCH_LIMITS.maxQueryLength) {
    return { ok: false, message: `Searches are limited to ${SEARCH_LIMITS.maxQueryLength} characters. Yours has ${query.length}. Keep the main concepts and drop the rest.` };
  }

  const quotes = [...query].filter((character) => character === '"').length;
  if (quotes % 2 === 1) {
    const last = query.lastIndexOf('"');
    query = `${query.slice(0, last)}${query.slice(last + 1)}`.replace(/\s+/g, " ").trim();
    notices.push("A quotation mark had no partner, so it was removed. Phrases need an opening and a closing quotation mark.");
  }

  const outside = query.replace(/"[^"]*"/g, "");
  const opening = (outside.match(/\(/g) ?? []).length;
  const closing = (outside.match(/\)/g) ?? []).length;
  if (opening !== closing) {
    query = query.replace(/"[^"]*"|[()]/g, (part) => (part === "(" || part === ")" ? " " : part)).replace(/\s+/g, " ").trim();
    notices.push("The brackets didn't match, so they were removed. Brackets need to come in pairs.");
  }

  if (queryTerms(query).words.length === 0 && queryTerms(query).phrases.length === 0) {
    return { ok: false, message: "Enter at least one word or phrase to search for." };
  }
  if (query.length < SEARCH_LIMITS.minQueryLength) return { ok: false, message: "Enter at least two characters." };
  return { ok: true, query, notices };
}

export interface QueryTerms {
  /** Single words worth matching, folded to lower case without accents. */
  words: string[];
  /** Quoted phrases, folded. */
  phrases: string[];
}

const OPERATORS = new Set(["AND", "OR", "NOT"]);

/**
 * The words and phrases a query looks for. Operators are not terms, and anything after
 * NOT is something to exclude, so it is not matched.
 */
export function queryTerms(query: string): QueryTerms {
  const words: string[] = [];
  const phrases: string[] = [];
  let excluded = false;
  for (const match of query.matchAll(/"([^"]*)"|(\S+)/g)) {
    const phrase = match[1];
    const bare = match[2];
    if (bare !== undefined) {
      const stripped = bare.replace(/[()]/g, "");
      if (stripped === "") continue;
      if (OPERATORS.has(stripped)) {
        excluded = stripped === "NOT";
        continue;
      }
      if (excluded) {
        excluded = false;
        continue;
      }
      for (const word of fold(stripped).split(" ")) {
        if (word !== "" && !STOPWORDS.has(word) && !words.includes(word)) words.push(word);
      }
    } else if (phrase !== undefined) {
      if (excluded) {
        excluded = false;
        continue;
      }
      const folded = fold(phrase);
      if (folded === "") continue;
      if (folded.includes(" ")) {
        if (!phrases.includes(folded)) phrases.push(folded);
      } else if (!STOPWORDS.has(folded) && !words.includes(folded)) {
        words.push(folded);
      }
    }
  }
  return { words, phrases };
}

export type RequestResult = { ok: true; request: SearchRequest; notices: string[] } | { ok: false; message: string; field: string };

const empty = (value: unknown) => value === undefined || value === null || value === "";

function wholeNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  return Number.isFinite(number) ? Math.trunc(number) : null;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Reads a search from untrusted input (the request body). Numbers are clamped; anything unknown is rejected. */
export function parseSearchRequest(body: unknown, currentYear: number): RequestResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, field: "body", message: "The search wasn't understood." };
  const input = body as Record<string, unknown>;

  const query = normalizeQuery(input.query);
  if (!query.ok) return { ok: false, field: "query", message: query.message };
  const notices = [...query.notices];

  const lastYear = currentYear + 1;
  const year = (key: "yearFrom" | "yearTo"): { ok: true; value: number | null } | { ok: false; message: string } => {
    const raw = input[key];
    if (empty(raw)) return { ok: true, value: null };
    const parsed = wholeNumber(raw);
    if (parsed === null) return { ok: false, message: `${key === "yearFrom" ? "The start" : "The end"} year must be a number.` };
    const clamped = clamp(parsed, SEARCH_LIMITS.earliestYear, lastYear);
    if (clamped !== parsed) notices.push(`The ${key === "yearFrom" ? "start" : "end"} year was adjusted to ${clamped}, the nearest year searched.`);
    return { ok: true, value: clamped };
  };
  const yearFrom = year("yearFrom");
  if (!yearFrom.ok) return { ok: false, field: "yearFrom", message: yearFrom.message };
  const yearTo = year("yearTo");
  if (!yearTo.ok) return { ok: false, field: "yearTo", message: yearTo.message };
  if (yearFrom.value !== null && yearTo.value !== null && yearFrom.value > yearTo.value) {
    return { ok: false, field: "yearFrom", message: "The start year is after the end year." };
  }

  const openAccess = empty(input.openAccess) ? "any" : OPEN_ACCESS_FILTERS.find((option) => option === input.openAccess);
  if (openAccess === undefined) return { ok: false, field: "openAccess", message: "The open-access filter wasn't recognised." };
  const documentType = empty(input.documentType) ? "any" : DOCUMENT_TYPES.find((option) => option === input.documentType);
  if (documentType === undefined) return { ok: false, field: "documentType", message: "The document type wasn't recognised." };

  let limit: number = SEARCH_LIMITS.defaultResults;
  if (!empty(input.limit)) {
    const parsed = wholeNumber(input.limit);
    if (parsed === null) return { ok: false, field: "limit", message: "The number of results must be a number." };
    limit = clamp(parsed, 1, SEARCH_LIMITS.maxResults);
  }

  return {
    ok: true,
    notices,
    request: { query: query.query, yearFrom: yearFrom.value, yearTo: yearTo.value, openAccess: openAccess as OpenAccessFilter, documentType: documentType as DocumentType, limit },
  };
}
