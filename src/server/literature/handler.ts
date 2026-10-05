/**
 * The logic behind POST /api/literature/search, free of Next.js so it can be tested with
 * plain Request objects. It validates, rate-limits, searches and answers. It never logs
 * or stores the query (ADR-0011).
 */

import { parseSearchRequest } from "../../knowledge/literature-search/query";
import type { LiteratureProvider, SearchErrorBody } from "../../knowledge/literature-search/types";
import type { RateLimiter } from "./rate-limit";
import { searchLiterature } from "./search-service";

export const MAX_BODY_BYTES = 4096;

export interface HandlerDeps {
  providers: readonly LiteratureProvider[];
  limiter: RateLimiter;
  now?: () => Date;
}

const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff" } as const;

function reply(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });
}

function problem(status: number, error: SearchErrorBody["error"], extra: Record<string, string> = {}): Response {
  return reply(status, { error } satisfies SearchErrorBody, extra);
}

/** A key for the caller; only used in memory, to count requests. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip")?.trim();
  return (forwarded || real || "unknown").slice(0, 64);
}

export async function handleLiteratureSearch(request: Request, deps: HandlerDeps): Promise<Response> {
  const now = deps.now ?? (() => new Date());

  if (request.headers.get("sec-fetch-site") === "cross-site") return problem(403, { code: "invalid", message: "Searches can only be made from ResearchKit." });
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return problem(400, { code: "invalid", message: "The search wasn't understood." });

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return problem(413, { code: "too-large", message: "The search is too long." });

  const decision = deps.limiter.check(clientKey(request));
  if (!decision.allowed) return problem(429, { code: "rate-limited", message: "Too many searches in a short time. Wait a moment and try again.", retryAfterSeconds: decision.retryAfterSeconds }, { "Retry-After": String(decision.retryAfterSeconds) });

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return problem(400, { code: "invalid", message: "The search wasn't understood." });
  }
  if (raw.length > MAX_BODY_BYTES) return problem(413, { code: "too-large", message: "The search is too long." });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return problem(400, { code: "invalid", message: "The search wasn't understood." });
  }

  const parsed = parseSearchRequest(body, now().getUTCFullYear());
  if (!parsed.ok) return problem(400, { code: "invalid", message: parsed.message });

  const { response, allFailed } = await searchLiterature(deps.providers, parsed.request, parsed.notices, request.signal, now);
  if (!allFailed) return reply(200, response);

  const failed = response.providers.find((provider) => provider.status === "error");
  if (failed?.code === "rate-limited") {
    return problem(429, { code: "rate-limited", message: `${failed.name} is limiting requests right now. Try again in a few minutes.` }, {});
  }
  if (failed?.code === "timeout") return problem(504, { code: "timeout", message: failed.message ?? "The search took too long." });
  if (failed?.code === "malformed") return problem(502, { code: "malformed", message: failed.message ?? "The answer couldn't be read." });
  return problem(502, { code: "unavailable", message: failed?.message ?? "The search service is not available right now." });
}
