/**
 * The structured description of a source: the one source model every citation
 * style formats (ADR-0006). Fields describe the work, not any style's output, so a
 * style uses the fields it needs and ignores the rest.
 */

import type { Contributor } from "./contributor";
import type { PublicationDate } from "./date";

export const SOURCE_TYPES = ["book", "journal-article", "webpage"] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

/** Reads a source type from untrusted input, such as a form value. Null if it isn't one ResearchKit supports. */
export function parseSourceType(value: unknown): SourceType | null {
  return SOURCE_TYPES.find((type) => type === value) ?? null;
}

interface CommonSource {
  authors: readonly Contributor[];
  date: PublicationDate;
  title: string;
}

export interface BookSource extends CommonSource {
  type: "book";
  edition?: string;
  publisher?: string;
  doi?: string;
  url?: string;
}

export interface JournalArticleSource extends CommonSource {
  type: "journal-article";
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  articleNumber?: string;
  doi?: string;
  url?: string;
}

export interface WebpageSource extends CommonSource {
  type: "webpage";
  siteName?: string;
  /** The organization responsible for the site, when it differs from the site's name. */
  publisher?: string;
  url: string;
  /** When the researcher consulted the page. */
  accessed?: PublicationDate;
}

export type Source = BookSource | JournalArticleSource | WebpageSource;
