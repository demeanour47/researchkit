# ADR-0011: Search Scholarly Literature Through a Server-Side Provider Endpoint

- **Status:** Proposed
- **Date:** 2026-10-05

## Context

Until Sprint 56 every ResearchKit tool ran entirely in the browser. The site had no route handlers, no server actions, no `fetch` calls, no environment variables, no caching and no rate limiting. The privacy position that follows from this ("what you enter stays on your device") is stated on tool pages.

Literature Explorer (Sprint 56) helps a student find scholarly works for a topic. That needs a source of scholarly metadata. The documented sources checked on 2026-10-05 were:

- **OpenAlex** ([docs](https://docs.openalex.org/)): a free index of over 200 million works. Search over titles, abstracts and keywords, filters for year, open access and type, DOIs, abstracts (as an inverted index), topics, keywords assigned by OpenAlex, and open-access links. Usable without a key; a free key gives a larger daily allowance and is sent as an `Authorization: Bearer` header or an `api_key` parameter. It answers `429` when the daily allowance or the per-second limit is exceeded. The key also works as a sign-in credential, so it must stay on a server. Pricing and allowances change; see the pricing information in [the OpenAlex help centre](https://help.openalex.org/) rather than this record.
- **Crossref** ([REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)): strong for DOI metadata and reference lists, but a bibliographic rather than a topical index. Abstracts are present only when publishers deposit them, and there are no topics.
- **PubMed / NCBI E-utilities** ([docs](https://www.ncbi.nlm.nih.gov/books/NBK25497/)): excellent for biomedicine, narrow for every other field ResearchKit serves.
- **Google Scholar** offers no API and prohibits automated access. It is not an option.

Whether a browser may call OpenAlex directly depends on a key being in the browser. A key shipped to the browser can be copied and used elsewhere.

ResearchKit already has a neutral source model ([ADR-0006](0006-shared-citation-source-model.md)) that formats APA 7 and MLA 9 references. A found work can be described by it.

## Problem

How can ResearchKit let students search scholarly literature without hiding a secret in the browser, without weakening its privacy position unannounced, and without locking itself to one provider?

## Decision

We will add one server-side endpoint, `POST /api/literature/search`, and search OpenAlex through it.

- **Scope.** OpenAlex is the only provider in this sprint. A `LiteratureProvider` interface (`src/knowledge/literature-search/types.ts`) separates the rest of the pipeline from it, so Crossref or PubMed could be added later by implementing that interface. Neither is implemented now, and no code claims they are.
- **The endpoint is the only server code.** It validates the request, applies a rate limit, calls the provider and returns normalised results. It is not a proxy: the caller cannot choose a host, a path or a provider, only the values of a fixed set of search fields. The provider host is a constant in `src/server/literature/openalex-provider.ts`.
- **POST, not GET,** so the student's words are not part of a URL that servers, proxies and browsers record.
- **Pipeline.** query → validation → provider search → normalisation → validation → deduplication → ranking → keyword discovery → topic grouping → response. Each stage is a pure module under `src/knowledge/literature-search/` and is tested alone. Only the provider call and the handler (`src/server/literature/`) touch the network or the request.
- **Secret handling.** The optional key is read from the server-only environment variable `OPENALEX_API_KEY`, never `NEXT_PUBLIC_*`, never sent to the browser and never placed in a URL (the `Authorization` header is used). Without it the endpoint works on OpenAlex's keyless allowance. A deployment that expects heavy use should set one.
- **Privacy.** The query is sent from the student's browser to ResearchKit's server and from there to OpenAlex. ResearchKit does not store it, does not log it and does not cache the response (`Cache-Control: no-store`). The Literature Explorer page says so in plain words before the first search. The host (for example, Vercel) and OpenAlex may keep their own logs under their own policies, and the page says that too. This changes the site's privacy statement for this one tool only; every other tool still runs entirely in the browser.
- **Abuse limits.** Queries over 300 characters, request bodies over 4 KB, results above 50, years outside 1800 to next year and unknown filter values are rejected or clamped. Provider calls have an 8-second timeout and honour the request's abort signal. Provider responses are size-capped, parsed defensively and rendered as text. Redirects from the provider are refused.
- **Rate limiting is best effort.** A fixed-window limiter (12 searches per client per minute, 600 per instance per minute) is held in the memory of one server instance. On serverless hosting several instances run, each with its own empty memory, and a restart clears it, so this slows a single misbehaving client but is **not a global guarantee**. We will not describe it as one. OpenAlex's own `429` is passed on to the student as "try again later".
- **Session only.** Results live in the page. Nothing is written to a database, to Prisma, to local storage or to a cookie. Literature Explorer does not create a persistent library.
- **One source model.** A found work is a `LiteratureRecord` that wraps the existing citation `Source` (journal article, or book) and adds only discovery information: abstract, topics, provider keywords, open-access links, provenance and metadata completeness. APA 7 references come from the existing formatter. Records are marked as not externally verified, because OpenAlex data is machine-collected and ResearchKit splits author names by rule.
- **Honest labels.** Keywords and topics OpenAlex assigns are shown as OpenAlex's, not as author keywords. Terms ResearchKit counts in titles and abstracts and the topic groups it builds from them are shown as ResearchKit's. Relevance scores come from a published formula (`src/knowledge/literature-search/rank.ts`), not from a hidden model.
- **Hand-off to the Literature Matrix.** The Matrix keeps its state only in the page, so a direct hand-off between tools would need new shared state. That is deferred. In this sprint a student copies BibTeX from Literature Explorer and pastes it into the Matrix's existing import box.

## Alternatives Considered

- **Call OpenAlex from the browser.** No server and no privacy change. But the key would be public, there would be no place for rate limiting or response limits, and the browser's own network errors would be unmanageable. Without a key it would work, which is why the endpoint also works without one. It was rejected because it can't use a key safely and leaves ResearchKit with no control point.
- **Crossref as the first provider.** It has the best DOI data but no topical search quality for a student exploring a subject, and few abstracts. Better as a later second provider.
- **PubMed.** Too narrow for ResearchKit's audience; better added for biomedical use later.
- **Scraping Google Scholar.** Prohibited by its terms, fragile and unreliable. Rejected.
- **A persistent library in Workspace.** Would need a data model, retention rules and an account. The brief for v1 is exploration and a hand-off, so it is deferred.
- **A second source model for literature records.** The citation model already describes the works a search returns; a second one would duplicate it and drift. Rejected.
- **A shared rate-limit store (such as Redis).** Gives a real global guarantee but adds infrastructure and cost for a new feature. Not justified before there is evidence of abuse.
- **Do nothing.** ResearchKit would keep telling students to "search the literature" with no help in doing so.

## Consequences

- ResearchKit now has server code. It needs a host that runs route handlers (Vercel-compatible hosting is assumed) and it is no longer deployable as static files alone.
- Tool-page privacy copy for Literature Explorer differs from other tools, and must stay accurate.
- OpenAlex's availability, allowances and terms now affect one tool. Failures are shown to the student as such, and a result set is never padded or invented.
- Search quality and topic labels depend on OpenAlex's classification, which is machine-generated and imperfect. The page tells students to judge relevance and check each work.
- The in-memory limiter can be bypassed across instances. That is a knowingly accepted risk.
- The environment variable is documented here and on the tool page. `.env*` files are ignored by git, so no example file is committed.
- Tests use recorded OpenAlex responses and injected `fetch`, so they never call the live service.

## Future Revisions

Revisit when: a second provider is added; abuse or provider `429`s show the limiter is inadequate; a persistent library or Workspace integration is wanted; a shared hand-off to the Literature Matrix is justified; OpenAlex changes its terms, allowances or response shape; or hosting changes.

## References

- [ADR-0006](0006-shared-citation-source-model.md): the source model reused here.
- OpenAlex documentation, accessed 2026-10-05: <https://docs.openalex.org/>, <https://help.openalex.org/>.
- Crossref REST API, accessed 2026-10-05: <https://www.crossref.org/documentation/retrieve-metadata/rest-api/>.
- NCBI E-utilities, accessed 2026-10-05: <https://www.ncbi.nlm.nih.gov/books/NBK25497/>.
- Next.js route handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`.
