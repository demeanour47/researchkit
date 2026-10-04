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
  /** Where the book was published, such as "Cambridge, MA, USA". Some styles no longer give it. */
  place?: string;
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

/** The source types every citation style in ResearchKit formats. */
export type Source = BookSource | JournalArticleSource | WebpageSource;

/** A paper in the proceedings of a conference. */
export interface ConferencePaperSource extends CommonSource {
  type: "conference-paper";
  /** The proceedings or conference, as the source names it. */
  proceedings: string;
  /** Where the conference was held, such as "Tuskegee, AL, USA". */
  location?: string;
  pages?: string;
  doi?: string;
  url?: string;
}

/**
 * Every source type in the model. Types beyond the common three are opt-in: a style
 * that formats them accepts AnySource, and the others keep accepting Source, so
 * adding a type never changes what an existing style handles (ADR-0006).
 */
export type AnySource = Source | ConferencePaperSource;

export const ANY_SOURCE_TYPES = [...SOURCE_TYPES, "conference-paper"] as const;

export type AnySourceType = (typeof ANY_SOURCE_TYPES)[number];

/** Reads any source type from untrusted input. Null if it isn't one ResearchKit models. */
export function parseAnySourceType(value: unknown): AnySourceType | null {
  return ANY_SOURCE_TYPES.find((type) => type === value) ?? null;
}
