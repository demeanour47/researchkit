import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OPENALEX_PEER_FEEDBACK } from "../../knowledge/literature-search/fixture-openalex";
import type { LiteratureProvider, SearchRequest } from "../../knowledge/literature-search/types";
import { handleLiteratureSearch } from "./handler";
import { buildSearchUrl, createOpenAlexProvider, OPENALEX_ORIGIN, type FetchLike } from "./openalex-provider";
import { createRateLimiter } from "./rate-limit";
import { searchLiterature } from "./search-service";

const REQUEST: SearchRequest = { query: '"peer feedback" writing', yearFrom: 2018, yearTo: 2024, openAccess: "open", documentType: "article", limit: 10 };
const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { status: 200, ...init });
const signal = () => new AbortController().signal;
const provider = (fetch: FetchLike, extra: { apiKey?: string; timeoutMs?: number } = {}) => createOpenAlexProvider({ fetch, now: () => new Date("2026-10-05T00:00:00Z"), ...extra });

describe("OpenAlex provider", () => {
  it("builds a request to the fixed host with encoded filters and no key in the URL", () => {
    const url = new URL(buildSearchUrl(REQUEST));
    assert.equal(url.origin, OPENALEX_ORIGIN);
    assert.equal(url.pathname, "/works");
    assert.equal(url.searchParams.get("search.title_abstract_keywords"), '"peer feedback" writing');
    assert.equal(url.searchParams.get("filter"), "from_publication_date:2018-01-01,to_publication_date:2024-12-31,is_oa:true,type:article");
    assert.equal(url.searchParams.get("per_page"), "10");
    assert.ok(!url.search.includes("api_key"));
  });
  it("cannot be redirected by a hostile query", () => {
    const url = new URL(buildSearchUrl({ ...REQUEST, query: "x&filter=evil#@evil.com/..", yearFrom: null, yearTo: null, openAccess: "any", documentType: "any" }));
    assert.equal(url.host, "api.openalex.org");
    assert.equal(url.searchParams.get("filter"), null);
  });
  it("returns normalized records from a recorded response", async () => {
    let seen: Parameters<FetchLike>[1] | undefined;
    const outcome = await provider(async (_url, init) => ((seen = init), json(OPENALEX_PEER_FEEDBACK)), { apiKey: "secret" }).search(REQUEST, signal());
    assert.equal(outcome.status, "ok");
    assert.equal(outcome.status === "ok" && outcome.records.length, 5);
    assert.equal(seen?.headers.Authorization, "Bearer secret");
    assert.equal(seen?.redirect, "error");
  });
  it("sends no Authorization header without a key", async () => {
    let headers: Record<string, string> = {};
    await provider(async (_url, init) => ((headers = init.headers), json({ results: [] }))).search(REQUEST, signal());
    assert.equal(headers.Authorization, undefined);
  });
  it("handles empty results", async () => {
    const outcome = await provider(async () => json({ meta: { count: 0 }, results: [] })).search(REQUEST, signal());
    assert.deepEqual(outcome, { status: "ok", records: [], skipped: 0, total: 0 });
  });
  it("maps 429 with its retry time", async () => {
    const outcome = await provider(async () => new Response("", { status: 429, headers: { "retry-after": "30" } })).search(REQUEST, signal());
    assert.deepEqual(outcome, { status: "error", code: "rate-limited", message: "OpenAlex is limiting requests right now.", retryAfterSeconds: 30 });
  });
  it("maps provider errors", async () => {
    const code = async (status: number) => {
      const outcome = await provider(async () => new Response("", { status })).search(REQUEST, signal());
      return outcome.status === "error" ? outcome.code : "ok";
    };
    assert.equal(await code(500), "unavailable");
    assert.equal(await code(503), "unavailable");
    assert.equal(await code(400), "rejected");
    assert.equal(await code(404), "unavailable");
  });
  it("maps network failure and malformed output", async () => {
    const network = await provider(async () => { throw new TypeError("fetch failed"); }).search(REQUEST, signal());
    assert.equal(network.status === "error" && network.code, "network");
    for (const body of ["not json", JSON.stringify({ nope: true }), "[]"]) {
      const outcome = await provider(async () => new Response(body)).search(REQUEST, signal());
      assert.equal(outcome.status === "error" && outcome.code, "malformed", body);
    }
  });
  it("refuses oversized responses", async () => {
    const outcome = await provider(async () => new Response("{}", { headers: { "content-length": "999999999" } })).search(REQUEST, signal());
    assert.equal(outcome.status === "error" && outcome.code, "malformed");
  });
  it("times out", async () => {
    const slow: FetchLike = (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new Error("aborted"))));
    const outcome = await provider(slow, { timeoutMs: 20 }).search(REQUEST, signal());
    assert.equal(outcome.status === "error" && outcome.code, "timeout");
  });
  it("stops when the caller cancels", async () => {
    const controller = new AbortController();
    const slow: FetchLike = (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new Error("aborted"))));
    const pending = provider(slow, { timeoutMs: 5000 }).search(REQUEST, controller.signal);
    controller.abort();
    const outcome = await pending;
    assert.equal(outcome.status === "error" && outcome.code, "network");
  });
});

describe("search service", () => {
  const ok: LiteratureProvider = { id: "openalex", name: "A", search: async () => ({ status: "ok", records: [], skipped: 0, total: 0 }) };
  const bad: LiteratureProvider = { id: "openalex", name: "B", search: async () => ({ status: "error", code: "timeout", message: "slow" }) };
  const throws: LiteratureProvider = { id: "openalex", name: "C", search: async () => { throw new Error("boom"); } };
  it("reports partial failure without failing the search", async () => {
    const result = await searchLiterature([ok, bad], REQUEST, [], signal());
    assert.equal(result.allFailed, false);
    assert.deepEqual(result.response.providers.map((p) => p.status), ["ok", "error"]);
  });
  it("reports total failure, including a provider that throws", async () => {
    assert.equal((await searchLiterature([bad, throws], REQUEST, [], signal())).allFailed, true);
  });
});

describe("rate limiter", () => {
  it("limits per client, resets after the window and has a global cap", () => {
    let time = 0;
    const limiter = createRateLimiter({ windowMs: 1000, perClient: 2, global: 3, maxClients: 10, now: () => time });
    assert.equal(limiter.check("a").allowed, true);
    assert.equal(limiter.check("a").allowed, true);
    const blocked = limiter.check("a");
    assert.deepEqual(blocked, { allowed: false, retryAfterSeconds: 1 });
    assert.equal(limiter.check("b").allowed, true);
    assert.equal(limiter.check("c").allowed, false);
    time = 1000;
    assert.equal(limiter.check("a").allowed, true);
  });
  it("bounds the clients it remembers", () => {
    const limiter = createRateLimiter({ windowMs: 1000, perClient: 5, global: 100, maxClients: 2, now: () => 0 });
    assert.equal(limiter.check("a").allowed, true);
    assert.equal(limiter.check("b").allowed, true);
    assert.equal(limiter.check("c").allowed, false);
  });
});

describe("request handler", () => {
  const okProvider: LiteratureProvider = { id: "openalex", name: "OpenAlex", search: createOpenAlexProvider({ fetch: async () => json(OPENALEX_PEER_FEEDBACK), now: () => new Date("2026-10-05T00:00:00Z") }).search };
  const deps = (providers: LiteratureProvider[] = [okProvider], perClient = 100) => ({ providers, limiter: createRateLimiter({ windowMs: 60000, perClient, global: 1000, maxClients: 100 }), now: () => new Date("2026-10-05T00:00:00Z") });
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("http://localhost/api/literature/search", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
  const errorOf = async (response: Response) => ((await response.json()) as { error: { code: string } }).error.code;

  it("answers a valid search with an uncached response", async () => {
    const response = await handleLiteratureSearch(post({ query: "peer feedback" }), deps());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = (await response.json()) as { records: unknown[]; providers: { status: string }[] };
    assert.equal(body.records.length, 5);
    assert.equal(body.providers[0].status, "ok");
  });
  it("rejects invalid input", async () => {
    for (const body of ["{", "[]", { query: "" }, { query: "x".repeat(400) }, { query: "ab cd", limit: "lots" }]) {
      const response = await handleLiteratureSearch(post(body), deps());
      assert.equal(response.status, 400, JSON.stringify(body));
    }
    assert.equal((await handleLiteratureSearch(new Request("http://x/", { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" }), deps())).status, 400);
  });
  it("rejects oversized bodies and cross-site requests", async () => {
    assert.equal((await handleLiteratureSearch(post({ query: "a b", pad: "x".repeat(5000) }), deps())).status, 413);
    assert.equal((await handleLiteratureSearch(post({ query: "a b" }, { "sec-fetch-site": "cross-site" }), deps())).status, 403);
    assert.equal((await handleLiteratureSearch(post({ query: "a b" }, { "sec-fetch-site": "same-origin" }), deps())).status, 200);
  });
  it("rate limits with Retry-After", async () => {
    const shared = deps([okProvider], 1);
    assert.equal((await handleLiteratureSearch(post({ query: "a b" }), shared)).status, 200);
    const second = await handleLiteratureSearch(post({ query: "a b" }), shared);
    assert.equal(second.status, 429);
    assert.ok(Number(second.headers.get("retry-after")) >= 1);
    assert.equal(await errorOf(second), "rate-limited");
  });
  it("maps provider failures to errors", async () => {
    const failing = (code: "rate-limited" | "timeout" | "malformed" | "unavailable"): LiteratureProvider => ({ id: "openalex", name: "OpenAlex", search: async () => ({ status: "error", code, message: "m" }) });
    assert.equal((await handleLiteratureSearch(post({ query: "a b" }), deps([failing("rate-limited")]))).status, 429);
    assert.equal((await handleLiteratureSearch(post({ query: "a b" }), deps([failing("timeout")]))).status, 504);
    assert.equal((await handleLiteratureSearch(post({ query: "a b" }), deps([failing("malformed")]))).status, 502);
    assert.equal((await handleLiteratureSearch(post({ query: "a b" }), deps([failing("unavailable")]))).status, 502);
  });
  it("returns 200 with a provider status on partial failure", async () => {
    const bad: LiteratureProvider = { id: "openalex", name: "Other", search: async () => ({ status: "error", code: "timeout", message: "m" }) };
    const response = await handleLiteratureSearch(post({ query: "a b" }), deps([okProvider, bad]));
    assert.equal(response.status, 200);
    assert.deepEqual(((await response.json()) as { providers: { status: string }[] }).providers.map((p) => p.status), ["ok", "error"]);
  });
  it("does not echo the query into error messages or log it", async () => {
    const original = console.log;
    const logged: unknown[] = [];
    console.log = (...args) => void logged.push(args);
    try {
      const response = await handleLiteratureSearch(post({ query: "secret-topic-xyz", limit: "many" }), deps());
      assert.ok(!(await response.text()).includes("secret-topic-xyz"));
    } finally {
      console.log = original;
    }
    assert.equal(logged.length, 0);
  });
});
