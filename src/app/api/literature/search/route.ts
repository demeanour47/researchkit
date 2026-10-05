import { createOpenAlexProvider } from "@/server/literature/openalex-provider";
import { handleLiteratureSearch } from "@/server/literature/handler";
import { createRateLimiter } from "@/server/literature/rate-limit";

/**
 * POST /api/literature/search (ADR-0011). A POST so the student's words are not part of
 * a URL that servers and proxies log. The limiter lives at module scope, so it is shared
 * within one server instance only.
 */

const limiter = createRateLimiter({ windowMs: 60_000, perClient: 12, global: 600, maxClients: 5000 });

export async function POST(request: Request): Promise<Response> {
  const provider = createOpenAlexProvider({ fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }), apiKey: process.env.OPENALEX_API_KEY || undefined });
  return handleLiteratureSearch(request, { providers: [provider], limiter });
}
