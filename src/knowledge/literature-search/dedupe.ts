/**
 * Merging of records that describe the same work. Deliberately conservative: a wrong
 * merge hides a paper from the student, while a missed one only shows it twice.
 * Order of evidence: same DOI; same title and year; same title and first author.
 * Records with different DOIs are never merged.
 */

import { fold } from "./text";
import { bareDoi } from "./links";
import type { LiteratureRecord } from "./types";

const MIN_TITLE_WORDS = 3;

export function normalizedTitle(title: string): string {
  return fold(title);
}

const doiOf = (record: LiteratureRecord): string | undefined => {
  const doi = record.source.type === "webpage" ? undefined : record.source.doi;
  const bare = bareDoi(doi);
  return bare?.toLocaleLowerCase("en");
};

const yearOf = (record: LiteratureRecord) => record.source.date.year;

function firstFamily(record: LiteratureRecord): string | undefined {
  const first = record.source.authors[0];
  if (first === undefined) return undefined;
  const name = first.kind === "person" ? first.family : first.name;
  const folded = fold(name);
  return folded === "" ? undefined : folded;
}

export type MatchReason = "doi" | "title-year" | "title-author";

/** Whether two records are the same work, and why. */
export function matchReason(a: LiteratureRecord, b: LiteratureRecord): MatchReason | null {
  const doiA = doiOf(a);
  const doiB = doiOf(b);
  if (doiA !== undefined && doiB !== undefined) return doiA === doiB ? "doi" : null;

  const titleA = normalizedTitle(a.source.title);
  if (titleA !== normalizedTitle(b.source.title) || titleA.split(" ").length < MIN_TITLE_WORDS) return null;

  const yearA = yearOf(a);
  if (yearA !== undefined && yearA === yearOf(b)) return "title-year";
  const authorA = firstFamily(a);
  if (authorA !== undefined && authorA === firstFamily(b)) return "title-author";
  return null;
}

const richness = (record: LiteratureRecord) =>
  (record.abstract ? 4 : 0) + (doiOf(record) ? 3 : 0) + record.source.authors.length + (record.openAccess ? 1 : 0) + record.topics.length + (record.landingPageUrl ? 1 : 0) - record.missingFields.length;

function unique<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Combines two records of one work: the richer one leads, and gaps are filled only from real data. */
export function mergeRecords(a: LiteratureRecord, b: LiteratureRecord): LiteratureRecord {
  const [lead, other] = richness(b) > richness(a) ? [b, a] : [a, b];
  const abstract = lead.abstract ?? other.abstract;
  const landingPageUrl = lead.landingPageUrl ?? other.landingPageUrl;
  const fullTextUrl = lead.fullTextUrl ?? other.fullTextUrl;
  const pdfUrl = lead.pdfUrl ?? other.pdfUrl;
  const missing = abstract === undefined ? lead.missingFields : lead.missingFields.filter((field) => field !== "abstract");
  return {
    ...lead,
    ...(abstract ? { abstract } : {}),
    ...(landingPageUrl ? { landingPageUrl } : {}),
    ...(fullTextUrl ? { fullTextUrl } : {}),
    ...(pdfUrl ? { pdfUrl } : {}),
    openAccess: lead.openAccess ?? other.openAccess,
    retracted: lead.retracted || other.retracted,
    providerKeywords: unique([...lead.providerKeywords, ...other.providerKeywords], (word) => word.toLocaleLowerCase("en")),
    topics: unique([...lead.topics, ...other.topics], (topic) => topic.name),
    provenance: unique([...lead.provenance, ...other.provenance], (ref) => `${ref.provider}:${ref.providerId}`),
    missingFields: missing,
    notes: unique([...lead.notes, ...other.notes], (note) => note),
  };
}

export interface DedupeResult {
  records: LiteratureRecord[];
  /** How many records were folded into another. */
  merged: number;
}

/** Merges duplicates while keeping the order in which each work first appeared. */
export function dedupe(records: readonly LiteratureRecord[]): DedupeResult {
  const kept: LiteratureRecord[] = [];
  let merged = 0;
  for (const record of records) {
    const index = kept.findIndex((existing) => matchReason(existing, record) !== null);
    if (index === -1) kept.push(record);
    else {
      kept[index] = mergeRecords(kept[index], record);
      merged += 1;
    }
  }
  return { records: kept, merged };
}
