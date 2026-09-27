/**
 * DOI metadata: the architecture for filling a study from its DOI, without the network
 * connection yet. The knowledge layer can map CSL-JSON, the metadata format DOI
 * registration agencies return (https://doi.org content negotiation), to matrix columns;
 * fetching it needs a service that isn't connected, so lookup reports that plainly and
 * the researcher fills the details in.
 */

import { normalizeDoi } from "../citation/apa/identifiers";
import type { MatrixField } from "./types";

/** The parts of a CSL-JSON item the matrix uses. */
export interface CslItem {
  author?: { family?: string; given?: string; literal?: string }[];
  issued?: { "date-parts"?: (number | string)[][] };
  title?: string | string[];
  "container-title"?: string | string[];
  publisher?: string;
  DOI?: string;
  abstract?: string;
}

/** A source of DOI metadata. None is connected yet; one could be a server route calling doi.org. */
export interface DoiMetadataSource {
  lookup(doi: string): Promise<CslItem | null>;
}

export type DoiLookup = { status: "invalid"; message: string } | { status: "unavailable"; doi: string; url: string; message: string } | { status: "found"; doi: string; fields: Partial<Record<MatrixField, string>> };

/** The DOI's parts, or why it isn't one. */
export function parseDoi(input: string): { doi: string; url: string } | null {
  const url = normalizeDoi(input);
  return url ? { doi: url.replace("https://doi.org/", ""), url } : null;
}

/** Looks up a DOI with a source, or explains that no source is connected. */
export async function lookupDoi(input: string, source: DoiMetadataSource | null): Promise<DoiLookup> {
  const parsed = parseDoi(input);
  if (!parsed) return { status: "invalid", message: `“${input.trim()}” isn't a DOI. A DOI starts with 10., such as 10.1177/0013189X17739591.` };
  const unavailable: DoiLookup = { status: "unavailable", ...parsed, message: "Looking up details from a DOI isn't available yet. The study has been added with its DOI; fill in the other details from the article." };
  if (!source) return unavailable;
  try {
    const item = await source.lookup(parsed.doi);
    return item ? { status: "found", doi: parsed.doi, fields: studyFromCsl(item) } : unavailable;
  } catch {
    return unavailable;
  }
}

const text = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? "")).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/** Matrix columns from CSL-JSON. Only what the metadata states is filled. */
export function studyFromCsl(item: CslItem): Partial<Record<MatrixField, string>> {
  const year = item.issued?.["date-parts"]?.[0]?.[0];
  return {
    authors: (item.author ?? [])
      .map((author) => author.literal?.trim() || [author.family?.trim(), author.given?.trim()].filter(Boolean).join(", "))
      .filter(Boolean)
      .join("; "),
    year: year !== undefined && /^\d{4}$/.test(String(year)) ? String(year) : "",
    title: text(item.title),
    journal: text(item["container-title"]),
    publisher: text(item.publisher),
    doi: item.DOI?.trim() ?? "",
    notes: item.abstract ? `Abstract: ${text(item.abstract)}` : "",
  };
}
