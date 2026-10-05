/** Small pure helpers for showing results: author lines, excerpts, sorting and filtering. */

import type { Contributor } from "../citation/source";
import type { LiteratureRecord } from "./types";

export type SortOrder = "relevance" | "newest" | "oldest";

const nameOf = (author: Contributor) => (author.kind === "organization" ? author.name : author.given ? `${author.given} ${author.family}` : author.family);

/** "A, B, C et al." for long lists; empty when the provider gave no authors. */
export function authorLine(record: LiteratureRecord, max = 4): string {
  const names = record.source.authors.map(nameOf);
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} et al.`;
}

/** The start of a text, cut at a word boundary. */
export function excerpt(text: string | undefined, max = 280): string | undefined {
  if (text === undefined) return undefined;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

export function venueOf(record: LiteratureRecord): string | undefined {
  const { source } = record;
  if (source.type === "journal-article") return source.journal === "" ? undefined : source.journal;
  if (source.type === "book") return source.publisher;
  return undefined;
}

export function doiOf(record: LiteratureRecord): string | undefined {
  const { source } = record;
  return source.type === "webpage" ? undefined : source.doi;
}

export function sortRecords(records: readonly LiteratureRecord[], order: SortOrder): LiteratureRecord[] {
  if (order === "relevance") return [...records];
  const year = (record: LiteratureRecord) => record.source.date.year ?? (order === "newest" ? -Infinity : Infinity);
  return records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => (order === "newest" ? year(b.record) - year(a.record) : year(a.record) - year(b.record)) || a.index - b.index)
    .map(({ record }) => record);
}

export function inCategory(records: readonly LiteratureRecord[], category: string | null): LiteratureRecord[] {
  return category === null ? [...records] : records.filter((record) => record.category === category);
}
