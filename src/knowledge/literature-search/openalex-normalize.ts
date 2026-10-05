/**
 * Turns OpenAlex "work" objects into LiteratureRecords. OpenAlex data is untrusted:
 * every field is checked, text is reduced to plain text, links are validated, and a
 * work that can't be read is skipped and counted rather than shown half-formed.
 * Pure: the response is passed in.
 */

import type { Contributor, Source } from "../citation/source";
import { bareDoi, doiUrl, safeWebUrl } from "./links";
import { splitAuthorName } from "./names";
import { plainTextOf } from "./text";
import type { LiteratureRecord, LiteratureTopic, MetadataConfidence, OpenAccessInfo } from "./types";

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const plain = plainTextOf(value);
  return plain === "" ? undefined : plain;
};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Words of an OpenAlex abstract, which it supplies as an inverted index (word → positions). */
export function abstractFromInvertedIndex(index: unknown): string | undefined {
  if (!isObject(index)) return undefined;
  const words: string[] = [];
  let size = 0;
  for (const [word, positions] of Object.entries(index)) {
    if (!Array.isArray(positions)) continue;
    for (const position of positions) {
      if (typeof position !== "number" || !Number.isInteger(position) || position < 0 || position > 20000) continue;
      words[position] = word;
      size += 1;
      if (size > 20000) return undefined;
    }
  }
  const joined = plainTextOf(words.filter((word) => word !== undefined).join(" "));
  return joined === "" ? undefined : joined;
}

function readTopic(value: unknown): LiteratureTopic | null {
  if (!isObject(value)) return null;
  const name = text(value.display_name);
  if (name === undefined) return null;
  const subfield = isObject(value.subfield) ? text(value.subfield.display_name) : undefined;
  const field = isObject(value.field) ? text(value.field.display_name) : undefined;
  return { name, ...(subfield ? { subfield } : {}), ...(field ? { field } : {}) };
}

function readOpenAccess(value: unknown): OpenAccessInfo | null {
  if (!isObject(value) || typeof value.is_oa !== "boolean") return null;
  const status = text(value.oa_status);
  return { isOpen: value.is_oa, ...(status ? { status } : {}) };
}

function pageRange(biblio: Json): string | undefined {
  const first = text(biblio.first_page);
  const last = text(biblio.last_page);
  if (first === undefined) return undefined;
  if (last === undefined || last === first) return undefined;
  return `${first}-${last}`;
}

function unique(items: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = item.toLocaleLowerCase("en");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

export type WorkResult = { ok: true; record: LiteratureRecord } | { ok: false; reason: string };

/** Reads one OpenAlex work. Fails (so the work is skipped) when it has no usable id or title. */
export function recordFromWork(work: unknown, retrievedAt: string): WorkResult {
  if (!isObject(work)) return { ok: false, reason: "not an object" };
  const rawId = text(work.id);
  if (rawId === undefined) return { ok: false, reason: "no id" };
  const providerId = rawId.replace(/^https?:\/\/openalex\.org\//, "");
  if (!/^[A-Za-z0-9]{1,32}$/.test(providerId)) return { ok: false, reason: "unrecognised id" };
  const title = text(work.title) ?? text(work.display_name);
  if (title === undefined) return { ok: false, reason: "no title" };

  const notes: string[] = [];
  const missing: string[] = [];

  const authors: Contributor[] = [];
  let guessed = false;
  for (const authorship of list(work.authorships)) {
    if (!isObject(authorship) || !isObject(authorship.author)) continue;
    const name = text(authorship.author.display_name);
    const split = name === undefined ? null : splitAuthorName(name);
    if (split === null) continue;
    authors.push(split.contributor);
    guessed = guessed || split.guessed;
  }
  if (authors.length === 0) missing.push("authors");
  if (guessed) notes.push("OpenAlex gives each author as one name. ResearchKit split it into family and given names, so check them against the article.");
  if (list(work.authorships).length >= 100) notes.push("OpenAlex lists at most 100 authors, so the author list may be incomplete.");

  const year = typeof work.publication_year === "number" && Number.isInteger(work.publication_year) ? work.publication_year : undefined;
  if (year === undefined) missing.push("year");

  const primary = isObject(work.primary_location) ? work.primary_location : undefined;
  const best = isObject(work.best_oa_location) ? work.best_oa_location : undefined;
  const venueSource = primary && isObject(primary.source) ? primary.source : undefined;
  const venue = venueSource ? text(venueSource.display_name) : undefined;
  const publisher = venueSource ? text(venueSource.host_organization_name) : undefined;
  if (venue === undefined) missing.push("journal or venue");

  const doi = bareDoi(work.doi);
  if (doi === undefined) missing.push("DOI");

  const landingPageUrl = safeWebUrl(primary?.landing_page_url);
  const bestPage = safeWebUrl(best?.landing_page_url);
  const openAccess = readOpenAccess(work.open_access);
  const oaUrl = safeWebUrl(isObject(work.open_access) ? work.open_access.oa_url : undefined);
  const pdfUrl = safeWebUrl(best?.pdf_url) ?? safeWebUrl(primary?.pdf_url);
  const fullTextUrl = openAccess?.isOpen ? (bestPage ?? oaUrl ?? pdfUrl) : undefined;

  const abstract = abstractFromInvertedIndex(work.abstract_inverted_index);
  if (abstract === undefined) missing.push("abstract");

  const biblio = isObject(work.biblio) ? work.biblio : {};
  const workType = text(work.type) ?? null;
  const date = { ...(year !== undefined ? { year } : {}) };
  const volume = text(biblio.volume);
  const issue = text(biblio.issue);
  const pages = pageRange(biblio);
  const url = doi === undefined ? landingPageUrl : undefined;

  let source: Source;
  if (workType === "book") {
    notes.push("Check the publisher and place of publication before citing this book.");
    source = { type: "book", authors, date, title, ...(publisher ? { publisher } : {}), ...(doi ? { doi: doiUrl(doi) } : {}), ...(url ? { url } : {}) };
  } else {
    if (workType !== null && workType !== "article") notes.push(`OpenAlex classes this as a ${workType}. It is formatted as a journal article, so check the reference against the work itself.`);
    source = {
      type: "journal-article",
      authors,
      date,
      title,
      journal: venue ?? "",
      ...(volume ? { volume } : {}),
      ...(issue ? { issue } : {}),
      ...(pages ? { pages } : {}),
      ...(doi ? { doi: doiUrl(doi) } : {}),
      ...(url ? { url } : {}),
    };
  }

  const shownPage = landingPageUrl ?? bestPage;
  const retracted = work.is_retracted === true;
  if (retracted) notes.push("OpenAlex marks this work as retracted. Don't cite it as evidence without saying so.");

  const providerKeywords = unique(
    list(work.keywords).flatMap((entry) => {
      const name = isObject(entry) ? text(entry.display_name) : undefined;
      return name === undefined ? [] : [name];
    }),
  );
  const topics: LiteratureTopic[] = [];
  const primaryTopic = readTopic(work.primary_topic);
  if (primaryTopic) topics.push(primaryTopic);
  for (const entry of list(work.topics)) {
    const topic = readTopic(entry);
    if (topic && !topics.some((known) => known.name === topic.name)) topics.push(topic);
  }

  const core = ["authors", "year", "journal or venue"].filter((field) => missing.includes(field));
  const confidence: MetadataConfidence = core.length >= 2 ? "minimal" : missing.length === 0 ? "complete" : "partial";

  return {
    ok: true,
    record: {
      id: `openalex:${providerId}`,
      source,
      workType,
      ...(abstract ? { abstract } : {}),
      providerKeywords,
      researchKitKeywords: [],
      topics,
      matchedKeywords: [],
      openAccess,
      ...(shownPage ? { landingPageUrl: shownPage } : {}),
      ...(fullTextUrl ? { fullTextUrl } : {}),
      ...(pdfUrl ? { pdfUrl } : {}),
      retracted,
      provider: "openalex",
      providerId,
      retrievedAt,
      provenance: [{ provider: "openalex", providerId, retrievedAt }],
      metadataConfidence: confidence,
      missingFields: missing,
      notes,
    },
  };
}

export interface ParsedWorks {
  records: LiteratureRecord[];
  skipped: number;
  total: number | null;
}

/** Reads a whole OpenAlex response, or returns null if it isn't the shape of one. */
export function recordsFromResponse(response: unknown, retrievedAt: string): ParsedWorks | null {
  if (!isObject(response) || !Array.isArray(response.results)) return null;
  const records: LiteratureRecord[] = [];
  let skipped = 0;
  for (const work of response.results) {
    const result = recordFromWork(work, retrievedAt);
    if (result.ok) records.push(result.record);
    else skipped += 1;
  }
  const count = isObject(response.meta) && typeof response.meta.count === "number" && Number.isFinite(response.meta.count) ? Math.max(0, Math.trunc(response.meta.count)) : null;
  return { records, skipped, total: count };
}
