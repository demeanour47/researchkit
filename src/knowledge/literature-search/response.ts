/** The browser's check on what the server sent: a response of the wrong shape is reported, never rendered. */

import type { SearchErrorBody, SearchResponse } from "./types";

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** Whether `value` has the structure the results screen relies on. */
export function parseSearchResponse(value: unknown): SearchResponse | null {
  if (!isObject(value)) return null;
  if (typeof value.query !== "string" || !Array.isArray(value.records) || !Array.isArray(value.providers) || !Array.isArray(value.categories) || !Array.isArray(value.notices)) return null;
  if (!isObject(value.suggestions) || !Array.isArray(value.suggestions.providerTerms) || !Array.isArray(value.suggestions.researchKitTerms)) return null;
  for (const record of value.records) {
    if (!isObject(record) || typeof record.id !== "string" || !isObject(record.source) || typeof record.source.title !== "string" || !Array.isArray(record.source.authors)) return null;
    if (!Array.isArray(record.providerKeywords) || !Array.isArray(record.researchKitKeywords) || !Array.isArray(record.topics) || !Array.isArray(record.matchedKeywords) || !Array.isArray(record.missingFields) || !Array.isArray(record.notes)) return null;
  }
  return value as unknown as SearchResponse;
}

export function parseErrorBody(value: unknown): SearchErrorBody["error"] | null {
  if (!isObject(value) || !isObject(value.error) || typeof value.error.message !== "string" || typeof value.error.code !== "string") return null;
  return value.error as unknown as SearchErrorBody["error"];
}
