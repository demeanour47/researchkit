/**
 * The OpenAlex adapter (ADR-0011). Server-only: it may carry an API key, so it must never
 * be imported by client code. `fetch` is injected so tests never reach the network.
 *
 * The host is a constant. Nothing a student types can change where the request goes,
 * only the query string values, which URLSearchParams encodes.
 */

import { recordsFromResponse } from "../../knowledge/literature-search/openalex-normalize";
import type { LiteratureProvider, ProviderFailure, ProviderOutcome, SearchRequest } from "../../knowledge/literature-search/types";

export const OPENALEX_ORIGIN = "https://api.openalex.org";
export const OPENALEX_TIMEOUT_MS = 8000;
/** A response larger than this is refused rather than parsed. */
export const MAX_RESPONSE_BYTES = 6_000_000;

/** The fields ResearchKit reads. Asking for less keeps responses small and fast. */
const SELECT = "id,doi,title,display_name,publication_year,type,biblio,authorships,primary_location,best_oa_location,open_access,keywords,topics,primary_topic,abstract_inverted_index,is_retracted";

export type FetchLike = (input: string, init: { headers: Record<string, string>; signal: AbortSignal; redirect: "error" }) => Promise<Response>;

export interface OpenAlexOptions {
  fetch: FetchLike;
  /** Optional. Raises OpenAlex's daily allowance; sent in a header so it never appears in a URL. */
  apiKey?: string;
  timeoutMs?: number;
  now?: () => Date;
}

/** The request URL for a search. Exported for tests. */
export function buildSearchUrl(request: SearchRequest): string {
  const filters: string[] = [];
  if (request.yearFrom !== null) filters.push(`from_publication_date:${request.yearFrom}-01-01`);
  if (request.yearTo !== null) filters.push(`to_publication_date:${request.yearTo}-12-31`);
  if (request.openAccess === "open") filters.push("is_oa:true");
  if (request.documentType !== "any") filters.push(`type:${request.documentType}`);
  const params = new URLSearchParams();
  params.set("search.title_abstract_keywords", request.query);
  if (filters.length > 0) params.set("filter", filters.join(","));
  params.set("per_page", String(request.limit));
  params.set("select", SELECT);
  return `${OPENALEX_ORIGIN}/works?${params.toString()}`;
}

const failure = (code: ProviderFailure["code"], message: string, retryAfterSeconds?: number): ProviderFailure => ({ status: "error", code, message, ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}) });

function retryAfter(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  const value = header === null ? Number.NaN : Number(header);
  if (Number.isFinite(value) && value > 0) return Math.min(Math.ceil(value), 86_400);
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  return Number.isFinite(reset) && reset > 0 ? Math.min(Math.ceil(reset), 86_400) : undefined;
}

export function createOpenAlexProvider(options: OpenAlexOptions): LiteratureProvider {
  const timeoutMs = options.timeoutMs ?? OPENALEX_TIMEOUT_MS;
  const now = options.now ?? (() => new Date());
  return {
    id: "openalex",
    name: "OpenAlex",
    async search(request, signal): Promise<ProviderOutcome> {
      const timeout = new AbortController();
      const timer = setTimeout(() => timeout.abort(), timeoutMs);
      try {
        return await run(request, AbortSignal.any([signal, timeout.signal]), timeout.signal, signal);
      } finally {
        clearTimeout(timer);
      }
    },
  };

  async function run(request: SearchRequest, combined: AbortSignal, timedOut: AbortSignal, signal: AbortSignal): Promise<ProviderOutcome> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;

    let response: Response;
    try {
      response = await options.fetch(buildSearchUrl(request), { headers, signal: combined, redirect: "error" });
    } catch {
      if (timedOut.aborted) return failure("timeout", "OpenAlex took too long to answer.");
      if (signal.aborted) return failure("network", "The search was cancelled.");
      return failure("network", "ResearchKit couldn't reach OpenAlex.");
    }

    if (response.status === 429) return failure("rate-limited", "OpenAlex is limiting requests right now.", retryAfter(response));
    if (response.status === 400) return failure("rejected", "OpenAlex couldn't read this search. Try simpler words.");
    if (response.status >= 500) return failure("unavailable", "OpenAlex is not available right now.");
    if (!response.ok) return failure("unavailable", "OpenAlex did not return results.");

    let body: unknown;
    try {
      const declared = Number(response.headers.get("content-length"));
      if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) return failure("malformed", "OpenAlex sent more data than ResearchKit accepts.");
      const raw = await response.text();
      if (raw.length > MAX_RESPONSE_BYTES) return failure("malformed", "OpenAlex sent more data than ResearchKit accepts.");
      body = JSON.parse(raw);
    } catch {
      return timedOut.aborted ? failure("timeout", "OpenAlex took too long to answer.") : failure("malformed", "OpenAlex sent an answer ResearchKit couldn't read.");
    }

    const parsed = recordsFromResponse(body, now().toISOString());
    if (parsed === null) return failure("malformed", "OpenAlex sent an answer ResearchKit couldn't read.");
    return { status: "ok", ...parsed };
  }
}
