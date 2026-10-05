/**
 * Runs one validated search against every configured provider and builds the response.
 * Providers run in parallel; one failing does not lose the others' results.
 */

import { buildResponse, type ProviderResult } from "../../knowledge/literature-search/pipeline";
import type { LiteratureProvider, SearchRequest, SearchResponse } from "../../knowledge/literature-search/types";

export interface ServiceResult {
  response: SearchResponse;
  /** Set when every provider failed, so the caller can answer with an error instead of an empty page. */
  allFailed: boolean;
}

export async function searchLiterature(providers: readonly LiteratureProvider[], request: SearchRequest, notices: readonly string[], signal: AbortSignal, now: () => Date = () => new Date()): Promise<ServiceResult> {
  const results: ProviderResult[] = await Promise.all(
    providers.map(async (provider) => {
      try {
        return { provider, outcome: await provider.search(request, signal) };
      } catch {
        return { provider, outcome: { status: "error" as const, code: "unavailable" as const, message: `${provider.name} could not be searched.` } };
      }
    }),
  );
  return {
    response: buildResponse(request, results, notices, now()),
    allFailed: results.length > 0 && results.every(({ outcome }) => outcome.status === "error"),
  };
}
