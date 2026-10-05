import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBibtex, studyFromBibtex } from "../literature/bibtex";
import { toBibtex } from "./bibtex";
import { apaReference } from "./citation";
import { categorize, OTHER_LABEL } from "./categorize";
import { authorLine, doiOf, excerpt, inCategory, sortRecords, venueOf } from "./display";
import { dedupe, matchReason } from "./dedupe";
import { OPENALEX_PEER_FEEDBACK } from "./fixture-openalex";
import { providerTerms, researchKitTerms } from "./keywords";
import { safeWebUrl, bareDoi } from "./links";
import { splitAuthorName } from "./names";
import { abstractFromInvertedIndex, recordFromWork, recordsFromResponse } from "./openalex-normalize";
import { buildResponse } from "./pipeline";
import { normalizeQuery, parseSearchRequest, queryTerms } from "./query";
import { rank } from "./rank";
import { parseSearchResponse } from "./response";
import type { LiteratureRecord, SearchRequest } from "./types";

const NOW = "2026-10-05T00:00:00.000Z";
const parsed = recordsFromResponse(OPENALEX_PEER_FEEDBACK, NOW);
if (parsed === null) throw new Error("fixture must parse");
const FIXTURE = parsed.records;

/** Hand-made work (not recorded from OpenAlex) for edge cases. */
function work(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "https://openalex.org/W1",
    doi: "https://doi.org/10.1234/abc",
    title: "Peer feedback in academic writing",
    publication_year: 2020,
    type: "article",
    authorships: [{ author: { display_name: "Ana Diaz" } }],
    primary_location: { landing_page_url: "https://example.org/a", source: { display_name: "Journal of Tests" } },
    open_access: { is_oa: false, oa_status: "closed" },
    keywords: [],
    topics: [],
    ...overrides,
  };
}
const one = (overrides?: Record<string, unknown>): LiteratureRecord => {
  const result = recordFromWork(work(overrides), NOW);
  if (!result.ok) throw new Error(result.reason);
  return result.record;
};
const request = (query: string): SearchRequest => ({ query, yearFrom: null, yearTo: null, openAccess: "any", documentType: "any", limit: 25 });

describe("query normalization", () => {
  it("tidies whitespace and control characters without changing the words", () => {
    const result = normalizeQuery("  peer \t feedback\u0000  writing ");
    assert.deepEqual(result, { ok: true, query: "peer feedback writing", notices: [] });
  });
  it("converts curly quotes and balances a stray quotation mark with a notice", () => {
    const curly = normalizeQuery("\u201cpeer feedback\u201d writing");
    assert.equal(curly.ok && curly.query, '"peer feedback" writing');
    const stray = normalizeQuery('"peer feedback writing');
    assert.ok(stray.ok && stray.notices.length === 1 && !stray.query.includes('"'));
  });
  it("rejects empty, non-string and oversized queries", () => {
    assert.equal(normalizeQuery("   ").ok, false);
    assert.equal(normalizeQuery(42).ok, false);
    assert.equal(normalizeQuery("a".repeat(301)).ok, false);
    assert.equal(normalizeQuery("a".repeat(300)).ok, true);
    assert.equal(normalizeQuery('""').ok, false);
  });
  it("extracts words and phrases, ignoring operators and excluded terms", () => {
    const terms = queryTerms('"peer feedback" AND (Writing OR essays) NOT plagiarism');
    assert.deepEqual(terms.phrases, ["peer feedback"]);
    assert.deepEqual(terms.words, ["writing", "essays"]);
  });
});

describe("request validation", () => {
  const ok = (body: unknown) => parseSearchRequest(body, 2026);
  it("applies defaults", () => {
    const result = ok({ query: "feedback" });
    assert.ok(result.ok);
    assert.deepEqual(result.request, { query: "feedback", yearFrom: null, yearTo: null, openAccess: "any", documentType: "any", limit: 25 });
  });
  it("clamps numbers and reports it", () => {
    const result = ok({ query: "feedback", limit: 9999, yearFrom: "1200", yearTo: 3000 });
    assert.ok(result.ok);
    assert.equal(result.request.limit, 50);
    assert.equal(result.request.yearFrom, 1800);
    assert.equal(result.request.yearTo, 2027);
    assert.equal(result.notices.length, 2);
    const low = ok({ query: "feedback", limit: -4 });
    assert.ok(low.ok && low.request.limit === 1);
  });
  it("rejects bad input", () => {
    for (const body of [null, [], "x", {}, { query: "x y", limit: "many" }, { query: "x y", yearFrom: "abc" }, { query: "x y", yearFrom: 2020, yearTo: 2010 }, { query: "x y", openAccess: "yes" }, { query: "x y", documentType: "podcast" }]) {
      assert.equal(ok(body).ok, false, JSON.stringify(body));
    }
  });
  it("never accepts a provider or URL from the caller", () => {
    const result = ok({ query: "feedback", provider: "evil", url: "http://x" });
    assert.ok(result.ok);
    assert.deepEqual(Object.keys(result.request).sort(), ["documentType", "limit", "openAccess", "query", "yearFrom", "yearTo"]);
  });
});

describe("links and names", () => {
  it("only allows plain http(s) links", () => {
    assert.equal(safeWebUrl("https://example.org/a"), "https://example.org/a");
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "ftp://x.org", "https://user:pw@x.org", "", 5, undefined]) assert.equal(safeWebUrl(bad), undefined);
  });
  it("reads DOIs in any form", () => {
    assert.equal(bareDoi("https://doi.org/10.1080/02602938.2018.1424318"), "10.1080/02602938.2018.1424318");
    assert.equal(bareDoi("doi:10.1234/abc"), "10.1234/abc");
    assert.equal(bareDoi("not a doi"), undefined);
  });
  it("splits author names and flags the guess", () => {
    assert.deepEqual(splitAuthorName("Ana Maria Diaz"), { contributor: { kind: "person", family: "Diaz", given: "Ana Maria" }, guessed: true });
    assert.deepEqual(splitAuthorName("Jan H. VAN DRIEL")?.contributor, { kind: "person", family: "van Driel", given: "Jan H." });
    assert.deepEqual(splitAuthorName("Plato")?.contributor, { kind: "person", family: "Plato" });
    assert.equal(splitAuthorName("   "), null);
  });
});

describe("OpenAlex normalization (recorded fixture)", () => {
  it("reads every work of the recorded response", () => {
    assert.equal(parsed.skipped, 0);
    assert.equal(FIXTURE.length, 5);
    assert.equal(parsed.total, 234);
    const first = FIXTURE[0];
    assert.equal(first.source.type, "journal-article");
    assert.equal(first.source.type === "journal-article" && first.source.doi, "https://doi.org/10.1080/02602938.2018.1424318");
    assert.equal(first.source.date.year, 2018);
    assert.ok(first.abstract && first.abstract.length > 50);
    assert.equal(first.provider, "openalex");
    assert.match(first.providerId, /^W\d+$/);
    assert.equal(first.provenance.length, 1);
  });
  it("only produces safe links", () => {
    for (const record of FIXTURE) for (const url of [record.landingPageUrl, record.fullTextUrl, record.pdfUrl]) if (url) assert.match(url, /^https?:\/\//);
  });
  it("rebuilds an abstract from the inverted index", () => {
    assert.equal(abstractFromInvertedIndex({ world: [1], hello: [0] }), "hello world");
    assert.equal(abstractFromInvertedIndex({ a: [0], b: [2] }), "a b");
    assert.equal(abstractFromInvertedIndex({ x: [-1, 1e9, "q"] }), undefined);
    assert.equal(abstractFromInvertedIndex(null), undefined);
  });
  it("skips malformed works and counts them", () => {
    const result = recordsFromResponse({ meta: { count: 3 }, results: [work(), null, "x", { id: "https://openalex.org/W9" }, { title: "No id" }, work({ id: "https://openalex.org/../evil" })] }, NOW);
    assert.equal(result?.records.length, 1);
    assert.equal(result?.skipped, 5);
    assert.equal(recordsFromResponse({ nope: 1 }, NOW), null);
    assert.equal(recordsFromResponse("x", NOW), null);
  });
  it("strips markup from provider text", () => {
    const record = one({ title: "<b>Bold</b> &amp; <script>alert(1)</script>claims about feedback" });
    assert.ok(!/[<>]/.test(record.source.title));
    assert.match(record.source.title, /^Bold & alert\(1\) claims/);
  });
  it("records what is missing instead of inventing it", () => {
    const record = one({ doi: null, publication_year: null, authorships: [], primary_location: null, abstract_inverted_index: null });
    assert.deepEqual(record.missingFields, ["authors", "year", "journal or venue", "DOI", "abstract"]);
    assert.equal(record.metadataConfidence, "minimal");
    assert.equal(record.source.authors.length, 0);
    assert.equal(one().metadataConfidence, "partial");
  });
  it("ignores unsafe or malformed URLs and DOIs", () => {
    const record = one({ doi: "javascript:alert(1)", primary_location: { landing_page_url: "javascript:alert(1)", pdf_url: "data:x", source: { display_name: "J" } } });
    assert.equal(record.landingPageUrl, undefined);
    assert.equal(record.pdfUrl, undefined);
    assert.ok(record.missingFields.includes("DOI"));
  });
  it("labels provider keywords and topics as the provider's, and flags retractions", () => {
    const record = one({
      keywords: [{ display_name: "Peer feedback" }, { display_name: "peer feedback" }, {}],
      primary_topic: { display_name: "Writing", subfield: { display_name: "Education" }, field: { display_name: "Social Sciences" } },
      is_retracted: true,
    });
    assert.deepEqual(record.providerKeywords, ["Peer feedback"]);
    assert.deepEqual(record.researchKitKeywords, []);
    assert.equal(record.topics[0].subfield, "Education");
    assert.equal(record.retracted, true);
    assert.ok(record.notes.some((note) => /retracted/.test(note)));
  });
  it("only offers full text for open-access works", () => {
    assert.equal(one().fullTextUrl, undefined);
    const open = one({ open_access: { is_oa: true, oa_status: "gold", oa_url: "https://example.org/oa" } });
    assert.equal(open.fullTextUrl, "https://example.org/oa");
  });
  it("treats books as books", () => {
    assert.equal(one({ type: "book" }).source.type, "book");
    assert.ok(one({ type: "review" }).notes.some((note) => /review/.test(note)));
  });
});

describe("deduplication", () => {
  it("merges the same DOI, keeping provenance and filling gaps", () => {
    const a = one({ id: "https://openalex.org/W1", abstract_inverted_index: null });
    const b = one({ id: "https://openalex.org/W2", doi: "10.1234/ABC", abstract_inverted_index: { Hello: [0], there: [1] } });
    const result = dedupe([a, b]);
    assert.equal(result.records.length, 1);
    assert.equal(result.merged, 1);
    assert.equal(result.records[0].abstract, "Hello there");
    assert.equal(result.records[0].provenance.length, 2);
    assert.ok(!result.records[0].missingFields.includes("abstract"));
  });
  it("merges the same title and year when a DOI is missing", () => {
    const a = one();
    const b = one({ id: "https://openalex.org/W2", doi: null, title: "Peer Feedback in Academic Writing." });
    assert.equal(matchReason(a, b), "title-year");
  });
  it("merges the same title and first author when a year is missing", () => {
    const a = one({ publication_year: null });
    const b = one({ id: "https://openalex.org/W2", doi: null, publication_year: 2019 });
    assert.equal(matchReason(a, b), "title-author");
  });
  it("does not merge different DOIs, short titles or loosely similar titles", () => {
    assert.equal(matchReason(one(), one({ id: "https://openalex.org/W2", doi: "10.9999/other" })), null);
    assert.equal(matchReason(one({ title: "Feedback", doi: null }), one({ title: "Feedback", doi: null })), null);
    assert.equal(matchReason(one({ doi: null }), one({ doi: null, title: "Peer feedback in academic writing classes" })), null);
    assert.equal(dedupe(FIXTURE).merged, 0);
  });
});

describe("ranking", () => {
  const query = '"peer feedback" writing';
  it("scores a title match above an abstract-only match, deterministically", () => {
    const titleHit = one({ id: "https://openalex.org/W1", title: "Peer feedback and writing" });
    const abstractHit = one({ id: "https://openalex.org/W2", doi: "10.1/x", title: "Something else entirely", abstract_inverted_index: { peer: [0], feedback: [1], writing: [2] } });
    const none = one({ id: "https://openalex.org/W3", doi: "10.1/y", title: "Unrelated botany" });
    const once = rank([none, abstractHit, titleHit], query);
    assert.deepEqual(once.map((r) => r.providerId), ["W1", "W2", "W3"]);
    assert.deepEqual(rank([titleHit, none, abstractHit], query).map((r) => r.providerId), ["W1", "W2", "W3"]);
    assert.equal(once[0].relevance?.score, 60);
    assert.equal(once[2].relevance?.score, 0);
    assert.deepEqual(once[0].matchedKeywords, ["writing", "peer feedback"]);
  });
  it("keeps provider order on ties and handles word variants", () => {
    const a = one({ id: "https://openalex.org/W1", title: "Writing" });
    const b = one({ id: "https://openalex.org/W2", doi: "10.1/x", title: "Writings" });
    assert.deepEqual(rank([a, b], "writing").map((r) => r.providerId), ["W1", "W2"]);
    assert.equal(rank([b], "writing")[0].relevance?.score, 50);
  });
  it("scores zero when the query has no usable terms", () => {
    assert.equal(rank([one()], "the of")[0].relevance?.score, 0);
  });
});

describe("keywords", () => {
  it("counts provider keywords separately from ResearchKit terms", () => {
    const records = [one({ keywords: [{ display_name: "Peer feedback" }, { display_name: "Writing" }] }), one({ id: "https://openalex.org/W2", doi: "10.1/x", keywords: [{ display_name: "peer feedback" }] })];
    assert.deepEqual(providerTerms(records), [{ term: "Peer feedback", count: 2 }, { term: "Writing", count: 1 }]);
  });
  it("suggests terms shared by several works, excluding the searched words", () => {
    const records = FIXTURE.map((record) => ({ ...record }));
    const terms = researchKitTerms(records, "peer feedback");
    assert.ok(terms.length > 0);
    for (const { term, count } of terms) {
      assert.ok(count >= 2);
      assert.ok(!["peer", "feedback", "peer feedback"].includes(term));
    }
    assert.deepEqual(researchKitTerms([], "x y"), []);
  });
});

describe("categorization", () => {
  it("groups by shared provider topics and places every record once", () => {
    const topic = (name: string, subfield: string) => ({ primary_topic: { display_name: name, subfield: { display_name: subfield }, field: { display_name: "F" } } });
    const records = [
      one({ id: "https://openalex.org/W1", ...topic("Writing", "Education") }),
      one({ id: "https://openalex.org/W2", doi: "10.1/a", ...topic("Feedback", "Education") }),
      one({ id: "https://openalex.org/W3", doi: "10.1/b", ...topic("Corpus", "Linguistics") }),
      one({ id: "https://openalex.org/W4", doi: "10.1/c", ...topic("Syntax", "Linguistics") }),
      one({ id: "https://openalex.org/W5", doi: "10.1/d" }),
    ];
    const { categories, assignment } = categorize(records);
    assert.deepEqual(categories.map((c) => [c.label, c.count, c.basis]), [["Education", 2, "provider-topic"], ["Linguistics", 2, "provider-topic"], [OTHER_LABEL, 1, "other"]]);
    assert.equal(assignment.size, 5);
    assert.equal(categories.reduce((sum, c) => sum + c.count, 0), records.length);
  });
  it("returns no groups for no records", () => {
    assert.deepEqual(categorize([]).categories, []);
  });
});

describe("citation conversion", () => {
  it("builds an APA 7 reference through the shared formatter", () => {
    const reference = apaReference(FIXTURE[0]);
    assert.match(reference.text, /^Huisman/);
    assert.match(reference.text, /\(2018\)/);
    assert.match(reference.text, /https:\/\/doi\.org\/10\.1080\/02602938\.2018\.1424318/);
    assert.equal(reference.complete, true);
  });
  it("flags missing parts instead of inventing them", () => {
    const reference = apaReference(one({ primary_location: null }));
    assert.equal(reference.complete, false);
    assert.ok(reference.issues.length > 0);
  });
});

describe("BibTeX export", () => {
  it("round-trips through the Literature Matrix importer", () => {
    const text = toBibtex(FIXTURE);
    const result = parseBibtex(text);
    assert.equal(result.entries.length, FIXTURE.length);
    const study = studyFromBibtex(result.entries[0]);
    assert.match(JSON.stringify(study), /Huisman/);
    assert.match(JSON.stringify(study), /2018/);
  });
  it("escapes special characters and keeps keys unique", () => {
    const text = toBibtex([one({ title: "R&D {fun} 100%" }), one({ id: "https://openalex.org/W2", doi: "10.1/x" })]);
    assert.match(text, /R\\&D \\\{fun\\\} 100\\%/);
    const keys = [...text.matchAll(/@\w+\{(\w+),/g)].map((match) => match[1]);
    assert.equal(new Set(keys).size, 2);
    assert.equal(toBibtex([]), "");
  });
});

describe("pipeline and response", () => {
  const provider = { id: "openalex" as const, name: "OpenAlex" };
  it("composes the stages and reports provider status", () => {
    const response = buildResponse(request("peer feedback"), [{ provider, outcome: { status: "ok", records: FIXTURE, skipped: 1, total: 234 } }], ["note"], new Date(NOW));
    assert.equal(response.records.length, 5);
    assert.equal(response.total, 234);
    assert.equal(response.skipped, 1);
    assert.equal(response.retrievedAt, NOW);
    assert.deepEqual(response.providers, [{ id: "openalex", name: "OpenAlex", status: "ok", count: 5 }]);
    assert.ok(response.records.every((record) => record.category !== undefined && record.relevance !== undefined));
    assert.ok(parseSearchResponse(JSON.parse(JSON.stringify(response))));
  });
  it("reports a failed provider and no records", () => {
    const response = buildResponse(request("x y"), [{ provider, outcome: { status: "error", code: "timeout", message: "Too slow." } }], [], new Date(NOW));
    assert.equal(response.records.length, 0);
    assert.equal(response.total, null);
    assert.equal(response.providers[0].status, "error");
  });
  it("rejects malformed responses on the client", () => {
    for (const bad of [null, "x", {}, { query: "q", records: [{}], providers: [], categories: [], notices: [], suggestions: { providerTerms: [], researchKitTerms: [] } }]) assert.equal(parseSearchResponse(bad), null);
  });
});

describe("display helpers", () => {
  it("summarises authors, excerpts and venues without inventing any", () => {
    assert.equal(authorLine(one()), "Ana Diaz");
    assert.equal(authorLine(one({ authorships: [] })), "");
    const many = one({ authorships: ["A B", "C D", "E F", "G H", "I J"].map((display_name) => ({ author: { display_name } })) });
    assert.equal(authorLine(many), "A B, C D, E F, G H et al.");
    assert.equal(excerpt(undefined), undefined);
    assert.equal(excerpt("short"), "short");
    assert.ok(excerpt("word ".repeat(100), 50)!.endsWith("…"));
    assert.equal(venueOf(one()), "Journal of Tests");
    assert.equal(venueOf(one({ primary_location: null })), undefined);
    assert.equal(doiOf(one()), "https://doi.org/10.1234/abc");
  });
  it("sorts by year with missing years last, and filters by category", () => {
    const a = one({ id: "https://openalex.org/W1", publication_year: 2019 });
    const b = one({ id: "https://openalex.org/W2", doi: "10.1/b", publication_year: null });
    const c = one({ id: "https://openalex.org/W3", doi: "10.1/c", publication_year: 2022 });
    assert.deepEqual(sortRecords([a, b, c], "newest").map((r) => r.providerId), ["W3", "W1", "W2"]);
    assert.deepEqual(sortRecords([a, b, c], "oldest").map((r) => r.providerId), ["W1", "W3", "W2"]);
    assert.deepEqual(sortRecords([a, b, c], "relevance").map((r) => r.providerId), ["W1", "W2", "W3"]);
    assert.equal(inCategory([{ ...a, category: "X" }, b], "X").length, 1);
    assert.equal(inCategory([a, b], null).length, 2);
  });
});
