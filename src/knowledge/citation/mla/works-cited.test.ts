import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainText, type Contributor, type Source } from "../source";
import type { Decision, Note } from "./notes";
import { formatWorksCited } from "./works-cited";

// Every expected string is written out by hand from MLA 9 rules, independently of the code.
// Where the MLA Style Center publishes the entry, the test reproduces it and cites the page;
// the MLA prints page ranges with a hyphen, and publishers (and ResearchKit) use an en dash.

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const text = (source: Source) => plainText(formatWorksCited(source).runs);
const codes = (items: readonly (Note | Decision)[]) => items.map((item) => item.code);

const book = (overrides: Partial<Extract<Source, { type: "book" }>> = {}): Source => ({
  type: "book",
  authors: [person("Lodge", "David")],
  date: { year: 1979 },
  title: "Changing Places: A Tale of Two Campuses",
  publisher: "Penguin Books",
  ...overrides,
});

const article = (overrides: Partial<Extract<Source, { type: "journal-article" }>> = {}): Source => ({
  type: "journal-article",
  authors: [person("Berman", "Russell")],
  date: { year: 2015 },
  title: "The Necessity of Language Learning",
  journal: "ADFL Bulletin",
  volume: "43",
  issue: "2",
  pages: "11-14",
  doi: "10.1632/adfl.43.2.11",
  ...overrides,
});

const webpage = (overrides: Partial<Extract<Source, { type: "webpage" }>> = {}): Source => ({
  type: "webpage",
  authors: [person("Burns", "Shauntee")],
  date: { year: 2016, month: 3, day: 2 },
  title: "Finding Wonder Women at the Library: Online Biographies and Encyclopedias",
  siteName: "New York Public Library",
  url: "https://www.nypl.org/blog/2016/03/02/biographies-women-history",
  ...overrides,
});

describe("books", () => {
  it("formats one author, an edition and a publisher (style.mla.org: Lodge, Changing Places)", () => {
    assert.equal(text(book({ edition: "2" })), "Lodge, David. Changing Places: A Tale of Two Campuses. 2nd ed., Penguin Books, 1979.");
  });

  it("italicises the book's title, a self-contained work", () => {
    assert.deepEqual(formatWorksCited(book()).runs, [
      { text: "Lodge, David. " },
      { text: "Changing Places: A Tale of Two Campuses", italic: true },
      { text: ". Penguin Books, 1979." },
    ]);
    assert.ok(codes(formatWorksCited(book()).decisions).includes("standalone-title"));
  });

  it("inverts only the first of two authors and joins them with a comma and 'and'", () => {
    const entry = formatWorksCited(book({ authors: [person("Dorris", "Michael"), person("Erdrich", "Louise")], title: "The Crown of Columbus", publisher: "HarperCollins", date: { year: 1991 } }));
    assert.equal(plainText(entry.runs), "Dorris, Michael, and Louise Erdrich. The Crown of Columbus. HarperCollins, 1991.");
    assert.deepEqual(codes(entry.decisions).slice(0, 2), ["first-author-inverted", "two-authors"]);
  });

  it("gives three or more authors as the first author and et al. (style.mla.org: Burdick et al.)", () => {
    const entry = formatWorksCited(book({ authors: [person("Burdick", "Anne"), person("Drucker", "Johanna"), person("Lunenfeld", "Peter")], title: "Digital_Humanities", publisher: "MIT P", date: { year: 2012 } }));
    assert.equal(plainText(entry.runs), "Burdick, Anne, et al. Digital_Humanities. MIT P, 2012.");
    assert.ok(entry.decisions.some((decision) => decision.code === "et-al" && decision.count === 3));
  });

  it("begins with the title when the organization author is also the publisher (style.mla.org: MLA Handbook)", () => {
    const mla = "Modern Language Association of America";
    const entry = formatWorksCited(book({ authors: [organization(mla)], title: "MLA Handbook", edition: "9", publisher: mla, date: { year: 2021 } }));
    assert.equal(plainText(entry.runs), "MLA Handbook. 9th ed., Modern Language Association of America, 2021.");
    assert.ok(entry.decisions.some((decision) => decision.code === "organization-omitted" && decision.as === "publisher"));
    assert.ok(!codes(entry.notes).includes("no-author"), "an omitted organization author is not a missing author");
    assert.deepEqual(entry.lead, { kind: "title", title: "MLA Handbook", italic: true });
  });

  it("keeps an organization author that differs from the publisher, uninverted", () => {
    const entry = formatWorksCited(book({ authors: [organization("World Health Organization")], title: "Example Report", publisher: "Example Press", date: { year: 2020 } }));
    assert.equal(plainText(entry.runs), "World Health Organization. Example Report. Example Press, 2020.");
    assert.ok(codes(entry.decisions).includes("organization-author"));
  });

  it("begins with the title when there is no author, and says so", () => {
    const entry = formatWorksCited(book({ authors: [] }));
    assert.equal(plainText(entry.runs), "Changing Places: A Tale of Two Campuses. Penguin Books, 1979.");
    assert.ok(codes(entry.notes).includes("no-author"));
    assert.ok(codes(entry.decisions).includes("title-first"));
  });

  it("leaves out a missing date instead of writing n.d.", () => {
    const entry = formatWorksCited(book({ date: {} }));
    assert.equal(plainText(entry.runs), "Lodge, David. Changing Places: A Tale of Two Campuses. Penguin Books.");
    assert.ok(codes(entry.decisions).includes("date-omitted"));
    assert.ok(entry.notes.some((note) => note.code === "no-date" && note.sourceType === "book"));
  });

  it("leaves out a missing publisher and asks for it without inventing one", () => {
    const entry = formatWorksCited(book({ publisher: "" }));
    assert.equal(plainText(entry.runs), "Lodge, David. Changing Places: A Tale of Two Campuses. 1979.");
    assert.ok(entry.notes.some((note) => note.code === "missing-recommended" && note.field === "publisher"));
  });

  it("does not show a first edition, and shows a worded edition exactly as typed", () => {
    assert.equal(text(book({ edition: "1" })), "Lodge, David. Changing Places: A Tale of Two Campuses. Penguin Books, 1979.");
    const worded = formatWorksCited(book({ edition: "Expanded ed." }));
    assert.equal(plainText(worded.runs), "Lodge, David. Changing Places: A Tale of Two Campuses. Expanded ed., Penguin Books, 1979.");
    assert.ok(codes(worded.notes).includes("check-edition"));
  });

  it("suggests UP for University Press without changing what was typed", () => {
    const entry = formatWorksCited(book({ publisher: "Oxford University Press" }));
    assert.ok(plainText(entry.runs).includes("Oxford University Press, 1979."));
    assert.ok(entry.notes.some((note) => note.code === "publisher-abbreviation" && note.suggestion === "Oxford UP"));
  });

  it("adds no full stop after a title ending in a question mark", () => {
    assert.equal(text(book({ title: "Why Read?" })), "Lodge, David. Why Read? Penguin Books, 1979.");
  });

  it("ends with a DOI written after https://doi.org/ and a full stop", () => {
    assert.equal(text(book({ doi: "doi:10.1000/xyz123" })), "Lodge, David. Changing Places: A Tale of Two Campuses. Penguin Books, 1979, https://doi.org/10.1000/xyz123.");
  });

  it("marks a missing title with a placeholder and an error note", () => {
    const entry = formatWorksCited(book({ title: " " }));
    assert.equal(plainText(entry.runs), "Lodge, David. [Title]. Penguin Books, 1979.");
    assert.ok(entry.notes.some((note) => note.code === "missing" && note.field === "title"));
  });

  it("does not change the contributor data it was given", () => {
    const authors = [person(" Lodge ", " David ")];
    const source = book({ authors });
    formatWorksCited(source);
    assert.deepEqual(authors, [person(" Lodge ", " David ")]);
  });
});

describe("journal articles", () => {
  it("formats the article with pages and a DOI (style.mla.org/page-range-and-doi/)", () => {
    assert.equal(text(article()), "Berman, Russell. “The Necessity of Language Learning.” ADFL Bulletin, vol. 43, no. 2, 2015, pp. 11–14, https://doi.org/10.1632/adfl.43.2.11.");
  });

  it("quotes the article title and italicises only the journal, its container", () => {
    const entry = formatWorksCited(article());
    assert.deepEqual(entry.runs, [
      { text: "Berman, Russell. “The Necessity of Language Learning.” " },
      { text: "ADFL Bulletin", italic: true },
      { text: ", vol. 43, no. 2, 2015, pp. 11–14, https://doi.org/10.1632/adfl.43.2.11." },
    ]);
    assert.ok(entry.decisions.some((decision) => decision.code === "title-in-container" && decision.container === "journal"));
  });

  it("formats three authors with et al. and shortens a three-digit page range", () => {
    const entry = formatWorksCited(article({
      authors: [person("LeCun", "Yann"), person("Bengio", "Yoshua"), person("Hinton", "Geoffrey")],
      title: "Deep Learning",
      journal: "Nature",
      volume: "521",
      issue: "7553",
      pages: "436-444",
      doi: "10.1038/nature14539",
    }));
    assert.equal(plainText(entry.runs), "LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.");
    assert.ok(entry.decisions.some((decision) => decision.code === "pages-shortened" && decision.to === "436–44"));
  });

  it("formats two authors, a month, and leaves out an article number (style.mla.org/journals-with-article-numbers/)", () => {
    const entry = formatWorksCited(article({
      authors: [person("Boyd", "James W."), person("Nishimura", "Tetsuya")],
      title: "Shinto Perspectives in Miyazaki's Anime Film Spirited Away",
      journal: "Journal of Religion and Film",
      volume: "8",
      issue: "3",
      date: { year: 2004, month: 10 },
      pages: "",
      articleNumber: "2",
      doi: "",
    }));
    assert.equal(plainText(entry.runs), "Boyd, James W., and Tetsuya Nishimura. “Shinto Perspectives in Miyazaki's Anime Film Spirited Away.” Journal of Religion and Film, vol. 8, no. 3, Oct. 2004.");
    assert.ok(codes(entry.decisions).includes("article-number-omitted"));
  });

  it("uses a single page with p.", () => {
    assert.ok(text(article({ pages: "49", doi: "" })).endsWith("2015, p. 49."));
  });

  it("uses a URL without its protocol when there is no DOI", () => {
    const entry = formatWorksCited(article({ doi: "", url: "https://example.org/articles/45" }));
    assert.ok(plainText(entry.runs).endsWith("pp. 11–14, example.org/articles/45."));
    assert.ok(codes(entry.decisions).includes("url-protocol-omitted"));
  });

  it("prefers the DOI and leaves out the URL when both are given", () => {
    const entry = formatWorksCited(article({ url: "https://example.org/articles/45" }));
    assert.ok(plainText(entry.runs).endsWith("https://doi.org/10.1632/adfl.43.2.11."));
    assert.ok(!plainText(entry.runs).includes("example.org"));
    assert.ok(codes(entry.decisions).includes("url-left-out-for-doi"));
  });

  it("reports an invalid DOI and falls back to a valid URL", () => {
    const entry = formatWorksCited(article({ doi: "not-a-doi", url: "https://example.org/a" }));
    assert.ok(plainText(entry.runs).endsWith("example.org/a."));
    assert.ok(codes(entry.notes).includes("invalid-doi"));
  });

  it("reports missing volume, issue and pages, and a missing journal", () => {
    const entry = formatWorksCited(article({ journal: "", volume: "", issue: "", pages: "", doi: "" }));
    assert.equal(plainText(entry.runs), "Berman, Russell. “The Necessity of Language Learning.” [Journal], 2015.");
    assert.ok(entry.notes.some((note) => note.code === "missing" && note.field === "journal"));
    assert.ok(codes(entry.notes).includes("no-journal-numbers"));
  });

  it("puts a question mark inside the closing quotation mark, with no added full stop", () => {
    assert.ok(text(article({ title: "Why Learn Languages?" })).includes("“Why Learn Languages?” ADFL Bulletin,"));
  });
});

describe("web pages", () => {
  it("formats a named author, website and full date (style.mla.org/author-publisher-web-site-names/)", () => {
    assert.equal(
      text(webpage()),
      "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/2016/03/02/biographies-women-history.",
    );
  });

  it("italicises the website, the page's container", () => {
    const entry = formatWorksCited(webpage());
    assert.deepEqual(entry.runs[1], { text: "New York Public Library", italic: true });
    assert.ok(entry.decisions.some((decision) => decision.code === "title-in-container" && decision.container === "website"));
    assert.ok(entry.decisions.some((decision) => decision.code === "date-written" && decision.text === "2 Mar. 2016"));
  });

  it("leaves out an organization author and publisher that share the site's name (same page)", () => {
    const nypl = "New York Public Library";
    const entry = formatWorksCited(webpage({ authors: [organization(nypl)], title: "Education", publisher: nypl, date: { year: 2018 }, url: "https://www.nypl.org/education" }));
    assert.equal(plainText(entry.runs), "“Education.” New York Public Library, 2018, www.nypl.org/education.");
    assert.ok(entry.decisions.some((decision) => decision.code === "organization-omitted" && decision.as === "site"));
    assert.ok(codes(entry.decisions).includes("publisher-omitted-same-as-site"));
    assert.deepEqual(entry.lead, { kind: "title", title: "Education", italic: false });
  });

  it("gives an organization author that is also the publisher only as publisher", () => {
    const entry = formatWorksCited(webpage({ authors: [organization("Example Foundation")], siteName: "Example Data Portal", publisher: "Example Foundation", date: { year: 2020 }, title: "Annual Figures", url: "https://data.example.org/annual" }));
    assert.equal(plainText(entry.runs), "“Annual Figures.” Example Data Portal, Example Foundation, 2020, data.example.org/annual.");
    assert.ok(entry.decisions.some((decision) => decision.code === "organization-omitted" && decision.as === "publisher"));
  });

  it("begins with the title when there is no author (style.mla.org/source-with-no-author/)", () => {
    const entry = formatWorksCited(webpage({ authors: [], title: "English Language Arts Standards", siteName: "Common Core State Standards Initiative", date: { year: 2017 }, url: "http://www.corestandards.org/ELA-Literacy/" }));
    assert.equal(plainText(entry.runs), "“English Language Arts Standards.” Common Core State Standards Initiative, 2017, www.corestandards.org/ELA-Literacy/.");
  });

  it("adds a publisher and an access date at the end, with no publication date (style.mla.org/access-dates/)", () => {
    const entry = formatWorksCited(webpage({
      authors: [],
      title: "Orhan Pamuk: Un écrivain turc à succès",
      siteName: "Orhan Pamuk Site",
      publisher: "İletişm Publishing",
      date: {},
      url: "http://orhanpamuk.net/book.aspx?id=10&lng=eng",
      accessed: { year: 2015, month: 10, day: 25 },
    }));
    assert.equal(plainText(entry.runs), "“Orhan Pamuk: Un écrivain turc à succès.” Orhan Pamuk Site, İletişm Publishing, orhanpamuk.net/book.aspx?id=10&lng=eng. Accessed 25 Oct. 2015.");
    assert.ok(entry.decisions.some((decision) => decision.code === "access-date" && decision.text === "25 Oct. 2015"));
    assert.ok(entry.notes.some((note) => note.code === "no-date" && note.sourceType === "webpage"));
  });

  it("leaves out a missing date and reports it", () => {
    const entry = formatWorksCited(webpage({ date: {} }));
    assert.ok(plainText(entry.runs).includes("New York Public Library, www.nypl.org/"));
    assert.ok(codes(entry.decisions).includes("date-omitted"));
  });

  it("writes a month without a day as 'Mar. 2016' and abbreviates only months longer than four letters", () => {
    assert.ok(text(webpage({ date: { year: 2016, month: 3 } })).includes(", Mar. 2016, "));
    assert.ok(text(webpage({ date: { year: 2016, month: 6, day: 1 } })).includes(", 1 June 2016, "));
  });

  it("reports a missing URL and site name without inventing them", () => {
    const entry = formatWorksCited(webpage({ url: "", siteName: "" }));
    assert.equal(plainText(entry.runs), "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” 2 Mar. 2016.");
    assert.ok(entry.notes.some((note) => note.code === "missing-recommended" && note.field === "url"));
    assert.ok(entry.notes.some((note) => note.code === "missing-recommended" && note.field === "site-name"));
    assert.ok(codes(entry.decisions).includes("no-container"));
  });

  it("reports and leaves out a URL that is not a web address", () => {
    const entry = formatWorksCited(webpage({ url: "nypl dot org" }));
    assert.ok(plainText(entry.runs).endsWith("2 Mar. 2016."));
    assert.ok(codes(entry.notes).includes("invalid-url"));
  });
});

describe("authors needing review", () => {
  it("leaves out an author with no family name, and reports its position", () => {
    const entry = formatWorksCited(book({ authors: [person("Lodge", "David"), person("", "Anne")] }));
    assert.ok(plainText(entry.runs).startsWith("Lodge, David. "));
    assert.ok(entry.notes.some((note) => note.code === "author-incomplete" && note.position === 2));
  });

  it("flags several names typed into one author's fields", () => {
    const entry = formatWorksCited(book({ authors: [person("Smith and Jones")] }));
    assert.ok(entry.notes.some((note) => note.code === "ambiguous-author" && note.position === 1));
  });

  it("flags a name typed already inverted", () => {
    assert.ok(formatWorksCited(book({ authors: [person("Smith, Jane")] })).notes.some((note) => note.code === "ambiguous-author"));
  });

  it("ignores blank author entries", () => {
    assert.equal(text(book({ authors: [person("Lodge", "David"), person("", "")] })), text(book()));
  });
});
