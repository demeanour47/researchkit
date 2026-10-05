/**
 * The literature-search domain (ADR-0011): what a search asks for, what a provider
 * returns once normalised, and what ResearchKit adds. Pure types and constants; nothing
 * here touches the network.
 */

import type { Source } from "../citation/source";

/** Limits applied to every search, whatever provider answers it. */
export const SEARCH_LIMITS = {
  maxQueryLength: 300,
  minQueryLength: 2,
  defaultResults: 25,
  maxResults: 50,
  earliestYear: 1800,
} as const;

export const DOCUMENT_TYPES = ["any", "article", "review", "book", "book-chapter", "preprint", "dissertation"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const OPEN_ACCESS_FILTERS = ["any", "open"] as const;
export type OpenAccessFilter = (typeof OPEN_ACCESS_FILTERS)[number];

/** A search after validation: every field is in range and safe to hand to a provider. */
export interface SearchRequest {
  /** The query as the provider receives it: whitespace tidied, nothing else changed. */
  query: string;
  yearFrom: number | null;
  yearTo: number | null;
  openAccess: OpenAccessFilter;
  documentType: DocumentType;
  limit: number;
}

export type ProviderId = "openalex";

export interface ProviderRef {
  provider: ProviderId;
  /** The provider's own identifier for the work. */
  providerId: string;
  retrievedAt: string;
}

/** A topic the provider assigned. It is the provider's classification, not the author's. */
export interface LiteratureTopic {
  name: string;
  subfield?: string;
  field?: string;
}

export interface OpenAccessInfo {
  isOpen: boolean;
  /** The provider's own status word, such as "gold" or "hybrid". */
  status?: string;
}

export type MetadataConfidence = "complete" | "partial" | "minimal";

export interface Relevance {
  /** 0 to 100; the formula is in rank.ts and explained on the tool page. */
  score: number;
  inTitle: boolean;
  inAbstract: boolean;
  inKeywords: boolean;
}

/**
 * A work found by a search. The citable description is a Source from the shared
 * citation model (ADR-0006); everything else is information only discovery needs.
 * Missing information stays missing: nothing is guessed or filled in.
 */
export interface LiteratureRecord {
  /** Stable within a response. */
  id: string;
  source: Source;
  /** The provider's word for the kind of work, such as "article" or "book-chapter". */
  workType: string | null;
  abstract?: string;
  /** Terms the provider assigned (OpenAlex tags them automatically). They are not author keywords. */
  providerKeywords: string[];
  /** Terms ResearchKit found in the results' titles and abstracts. Never author keywords. */
  researchKitKeywords: string[];
  topics: LiteratureTopic[];
  /** Words and phrases of the search that this work's text contains. */
  matchedKeywords: string[];
  openAccess: OpenAccessInfo | null;
  landingPageUrl?: string;
  fullTextUrl?: string;
  pdfUrl?: string;
  /** True if the provider reports a retraction. */
  retracted: boolean;
  provider: ProviderId;
  providerId: string;
  retrievedAt: string;
  /** Every provider record merged into this one, the first being the primary. */
  provenance: ProviderRef[];
  metadataConfidence: MetadataConfidence;
  /** What the provider didn't supply, in the words used on the page. */
  missingFields: string[];
  /** Things to check before citing, such as author names split by ResearchKit. */
  notes: string[];
  relevance?: Relevance;
  /** The group this work is shown in (see categorize.ts). */
  category?: string;
}

export type ProviderErrorCode = "rate-limited" | "timeout" | "unavailable" | "network" | "malformed" | "rejected";

export interface ProviderFailure {
  status: "error";
  code: ProviderErrorCode;
  message: string;
  retryAfterSeconds?: number;
}

export interface ProviderSuccess {
  status: "ok";
  records: LiteratureRecord[];
  /** Records the provider returned that couldn't be read. */
  skipped: number;
  /** How many works the provider says match the whole search. */
  total: number | null;
}

export type ProviderOutcome = ProviderSuccess | ProviderFailure;

/** What the rest of ResearchKit needs from a source of scholarly metadata. Adding a provider means implementing this. */
export interface LiteratureProvider {
  id: ProviderId;
  /** The name shown to students. */
  name: string;
  search(request: SearchRequest, signal: AbortSignal): Promise<ProviderOutcome>;
}

export interface ProviderStatus {
  id: ProviderId;
  name: string;
  status: "ok" | "error";
  count: number;
  message?: string;
  code?: ProviderErrorCode;
}

export interface TermCount {
  term: string;
  count: number;
}

export interface Category {
  label: string;
  /** Where the label came from, so the page can say so. */
  basis: "provider-topic" | "provider-keyword" | "researchkit-term" | "other";
  count: number;
  recordIds: string[];
}

export interface SearchResponse {
  query: string;
  notices: string[];
  filters: Pick<SearchRequest, "yearFrom" | "yearTo" | "openAccess" | "documentType">;
  total: number | null;
  records: LiteratureRecord[];
  categories: Category[];
  suggestions: { providerTerms: TermCount[]; researchKitTerms: TermCount[] };
  providers: ProviderStatus[];
  /** Records that couldn't be read and were left out. */
  skipped: number;
  retrievedAt: string;
}

export interface SearchErrorBody {
  error: { code: "invalid" | "rate-limited" | "timeout" | "unavailable" | "malformed" | "too-large"; message: string; retryAfterSeconds?: number };
}
