import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runsHtml } from "../../features/citation/runs-html";
import { formatMla } from "../../knowledge/citation/mla/citation";
import type { Decision } from "../../knowledge/citation/mla/notes";
import { announcements, authorLabels, copySubjects, decisionText } from "./copy";
import { copyTexts } from "./copy-texts";
import { blankDraft, exampleDraft, isEmptyDraft, toSource, withSourceType, type Draft } from "./draft";
import { emptyAuthor } from "../../features/citation/author-draft";

const citationFor = (draft: Draft, page?: string) =>
  formatMla({ source: toSource(draft), provenance: "user-entered" }, page ? { kind: "page", value: page } : undefined);

describe("load example", () => {
  it("produces the expected MLA entry and in-text citations immediately", () => {
    const texts = copyTexts(citationFor(exampleDraft(10), "437"));
    assert.equal(texts.worksCited.text, "LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.");
    assert.equal(texts.parenthetical.text, "(LeCun et al. 437)");
    assert.equal(texts.narrative.text, "Yann LeCun and others");
  });

  it("uses the same verified article as the APA builder, in title case", () => {
    const draft = exampleDraft(10);
    assert.equal(draft.type, "journal-article");
    assert.deepEqual(draft.authors.map((author) => [author.given, author.family, author.key]), [["Yann", "LeCun", 10], ["Yoshua", "Bengio", 11], ["Geoffrey", "Hinton", 12]]);
    assert.equal(draft.title, "Deep Learning");
    assert.equal(isEmptyDraft(draft), false);
  });
});

describe("clear form", () => {
  it("restores a book with one empty person author and every field empty", () => {
    const cleared = blankDraft(42);
    assert.equal(cleared.type, "book");
    assert.deepEqual(cleared.authors, [emptyAuthor(42)]);
    for (const [field, value] of Object.entries(cleared)) {
      if (field !== "type" && field !== "authors") assert.equal(value, "", field);
    }
    assert.equal(isEmptyDraft(cleared), true);
  });

  it("counts any typed field, including the access date, as content", () => {
    assert.equal(isEmptyDraft({ ...blankDraft(1), type: "webpage", title: "  " }), true);
    assert.equal(isEmptyDraft({ ...blankDraft(1), accessedYear: "2026" }), false);
  });
});

describe("source type changes", () => {
  it("switches between supported types and keeps what was typed", () => {
    const draft = { ...blankDraft(1), title: "Kept" };
    assert.equal(withSourceType(draft, "webpage").type, "webpage");
    assert.equal(withSourceType(draft, "webpage").title, "Kept");
  });

  it("ignores an unsupported type instead of approximating it", () => {
    const draft = blankDraft(1);
    assert.equal(withSourceType(draft, "podcast"), draft);
  });
});

describe("toSource", () => {
  it("passes the web page's publisher and access date only when entered", () => {
    const web = toSource({ ...blankDraft(1), type: "webpage", title: "T", url: "https://example.org", publisher: "P", accessedYear: "2026", accessedMonth: "10", accessedDay: "4" });
    assert.equal(web.type, "webpage");
    assert.deepEqual(web.type === "webpage" && web.accessed, { year: 2026, month: 10, day: 4 });
    assert.equal(web.type === "webpage" && web.publisher, "P");
    const without = toSource({ ...blankDraft(1), type: "webpage", title: "T" });
    assert.ok(without.type === "webpage" && !("accessed" in without));
  });

  it("keeps a journal issue's month, and ignores web-only fields for books", () => {
    const journal = toSource({ ...blankDraft(1), type: "journal-article", year: "2004", month: "10", day: "3" });
    assert.deepEqual(journal.date, { year: 2004, month: 10 });
    const book = toSource({ ...blankDraft(1), year: "2020", month: "5", accessedYear: "2026" });
    assert.deepEqual(book.date, { year: 2020 });
    assert.ok(!("accessed" in book));
  });

  it("formats a full web page from the form", () => {
    const draft: Draft = {
      ...blankDraft(1),
      type: "webpage",
      authors: [{ ...emptyAuthor(1), given: "Shauntee", family: "Burns" }],
      title: "Finding Wonder Women at the Library: Online Biographies and Encyclopedias",
      siteName: "New York Public Library",
      year: "2016",
      month: "3",
      day: "2",
      url: "https://www.nypl.org/blog/2016/03/02/biographies-women-history",
    };
    assert.equal(
      copyTexts(citationFor(draft)).worksCited.text,
      "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/2016/03/02/biographies-women-history.",
    );
  });
});

describe("copy", () => {
  const citation = citationFor(exampleDraft(1), "437");
  const texts = copyTexts(citation);

  it("copies plain text without markup", () => {
    for (const { text } of Object.values(texts)) assert.doesNotMatch(text, /[<>*_]/, text);
  });

  it("keeps the container's italics in the rich copy", () => {
    assert.equal(
      texts.worksCited.html,
      "LeCun, Yann, et al. “Deep Learning.” <i>Nature</i>, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.",
    );
  });

  it("escapes text in rich copy", () => {
    assert.equal(runsHtml([{ text: "Tom & Jerry <3" }, { text: "Title", italic: true }]), "Tom &amp; Jerry &lt;3<i>Title</i>");
  });

  it("italicises a book title used in text when it has no author", () => {
    const book = copyTexts(citationFor({ ...blankDraft(1), title: "MLA Handbook", publisher: "Modern Language Association of America", year: "2021" }, "54"));
    assert.equal(book.parenthetical.html, "(<i>MLA Handbook</i> 54)");
  });
});

describe("wording", () => {
  it("explains every kind of decision", () => {
    const decisions: Decision[] = [
      { code: "first-author-inverted" }, { code: "two-authors" }, { code: "et-al", count: 3 }, { code: "organization-author" },
      { code: "organization-omitted", as: "publisher" }, { code: "organization-omitted", as: "site" }, { code: "title-first" },
      { code: "standalone-title" }, { code: "title-in-container", container: "journal" }, { code: "title-in-container", container: "website" },
      { code: "no-container" }, { code: "edition-shown" }, { code: "first-edition-omitted" }, { code: "publisher-omitted-same-as-site" },
      { code: "date-written", text: "2 Mar. 2016" }, { code: "date-omitted" }, { code: "access-date", text: "4 Oct. 2026" },
      { code: "pages-shortened", from: "436-444", to: "436–44" }, { code: "article-number-omitted" }, { code: "doi-used" },
      { code: "url-left-out-for-doi" }, { code: "url-protocol-omitted" }, { code: "in-text-page" }, { code: "in-text-paragraph" },
      { code: "in-text-no-locator" }, { code: "in-text-title" }, { code: "in-text-et-al" }, { code: "prose-and-others" },
    ];
    const texts = decisions.map(decisionText);
    assert.equal(new Set(texts).size, texts.length);
    assert.match(decisionText({ code: "date-omitted" }), /omitted because it was not supplied/);
  });

  it("asks MLA authors for full given names", () => {
    assert.equal(authorLabels.givenNamesHint, "Use the author's full given name when available.");
  });

  it("announces copies, clearing, loading and updates", () => {
    assert.equal(announcements.copied("worksCited"), "Works Cited entry copied.");
    assert.match(announcements.copyFailed("parenthetical"), /^Parenthetical citation couldn't be copied automatically\. .*Control\+C.*Command\+C/);
    assert.equal(announcements.formCleared, "Form cleared.");
    assert.equal(announcements.exampleLoaded, "Example loaded.");
    assert.equal(announcements.entryUpdated("X.", 0), "Works Cited entry updated: X.");
    assert.equal(announcements.entryUpdated("X.", 2), "Works Cited entry updated: X. 2 items to check.");
  });

  it("gives each copy button a distinct accessible name", () => {
    assert.deepEqual(Object.values(copySubjects).map((subject) => `Copy ${subject}`), ["Copy Works Cited entry", "Copy parenthetical citation", "Copy narrative citation"]);
  });
});
