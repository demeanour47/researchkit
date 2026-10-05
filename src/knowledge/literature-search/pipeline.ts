/**
 * The stages that follow the provider call, composed: deduplicate → rank → discover
 * keywords → categorize. Each stage is its own module and is tested on its own; this
 * file only orders them and builds the response.
 */

import { categorize } from "./categorize";
import { dedupe } from "./dedupe";
import { attachResearchKitKeywords, providerTerms, researchKitTerms } from "./keywords";
import { rank } from "./rank";
import type { LiteratureProvider, ProviderOutcome, ProviderStatus, SearchRequest, SearchResponse } from "./types";

export interface ProviderResult {
  provider: Pick<LiteratureProvider, "id" | "name">;
  outcome: ProviderOutcome;
}

export function buildResponse(request: SearchRequest, results: readonly ProviderResult[], notices: readonly string[], now: Date): SearchResponse {
  const gathered = results.flatMap(({ outcome }) => (outcome.status === "ok" ? outcome.records : []));
  const { records: unique, merged } = dedupe(gathered);
  const ranked = rank(unique, request.query);
  const terms = researchKitTerms(ranked, request.query);
  const withTerms = attachResearchKitKeywords(ranked, terms);
  const { categories, assignment } = categorize(withTerms);
  const records = withTerms.map((record) => ({ ...record, category: assignment.get(record.id) }));

  const providers: ProviderStatus[] = results.map(({ provider, outcome }) =>
    outcome.status === "ok"
      ? { id: provider.id, name: provider.name, status: "ok", count: outcome.records.length }
      : { id: provider.id, name: provider.name, status: "error", count: 0, message: outcome.message, code: outcome.code },
  );
  const totals = results.flatMap(({ outcome }) => (outcome.status === "ok" && outcome.total !== null ? [outcome.total] : []));
  const skipped = results.reduce((sum, { outcome }) => sum + (outcome.status === "ok" ? outcome.skipped : 0), 0);
  const allNotices = [...notices];
  if (merged > 0) allNotices.push(`${merged} duplicate ${merged === 1 ? "record was" : "records were"} combined.`);

  return {
    query: request.query,
    notices: allNotices,
    filters: { yearFrom: request.yearFrom, yearTo: request.yearTo, openAccess: request.openAccess, documentType: request.documentType },
    total: totals.length === 0 ? null : totals.reduce((a, b) => a + b, 0),
    records,
    categories,
    suggestions: { providerTerms: providerTerms(records), researchKitTerms: terms },
    providers,
    skipped,
    retrievedAt: now.toISOString(),
  };
}
