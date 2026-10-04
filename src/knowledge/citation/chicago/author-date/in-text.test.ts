import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainText, type CitationLocator, type Contributor, type Source } from "../../source";
import { formatChicagoAuthorDate } from "./citation";

// Every expected string is written out by hand from Chicago author-date rules, independently of the
// code. Citations marked CMOS reproduce the Chicago Manual of Style's author-date sample citations.

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const page = (value: string): CitationLocator => ({ kind: "page", value });
const range = (value: string): CitationLocator => ({ kind: "page-range", value });

const book = (authors: Contributor[], overrides: Partial<Extract<Source, { type: "book" }>> = {}): Source => ({
  type: "book",
  authors,
  date: { year: 2022 },
  title: "The Channels of Student Activism",
  publisher: "University of Chicago Press",
  ...overrides,
});

const cite = (source: Source, locator?: CitationLocator) => formatChicagoAuthorDate({ source, provenance: "user-entered" }, locator);
const parenthetical = (source: Source, locator?: CitationLocator) => plainText(cite(source, locator).parenthetical);
const narrative = (source: Source, locator?: CitationLocator) => plainText(cite(source, locator).narrative);

const binderKidder = [person("Binder", "Amy J."), person("Kidder", "Jeffrey L.")];
const three = [person("Snyder", "Carl D."), person("Bedrossian", "Manuel"), person("Barr", "Casey")];

describe("parenthetical citations", () => {
  it("one author: no punctuation between name and year, a comma before the page (CMOS: Yu)", () => {
    assert.equal(parenthetical(book([person("Yu", "Charles")], { date: { year: 2020 } }), page("45")), "(Yu 2020, 45)");
  });

  it("one author without a locator", () => {
    assert.equal(parenthetical(book([person("Yu", "Charles")], { date: { year: 2020 } })), "(Yu 2020)");
  });

  it("two authors, with a shortened page range (CMOS: Binder and Kidder)", () => {
    assert.equal(parenthetical(book(binderKidder), range("117-118")), "(Binder and Kidder 2022, 117–18)");
  });

  it("three or more authors: the first and et al. (CMOS: Snyder et al.)", () => {
    assert.equal(parenthetical(book(three, { date: { year: 2025 } }), range("9-10")), "(Snyder et al. 2025, 9–10)");
    assert.equal(parenthetical(book(three, { date: { year: 2025 } })), "(Snyder et al. 2025)");
  });

  it("an organization author (CMOS: Google)", () => {
    const web: Source = { type: "webpage", authors: [organization("Google")], date: { year: 2023, month: 11, day: 15 }, title: "Privacy Policy", siteName: "Privacy & Terms", url: "https://policies.google.com/privacy" };
    assert.equal(parenthetical(web), "(Google 2023)");
  });

  it("no date: a comma before n.d. (CMOS Q&A: (OED, n.d.))", () => {
    const yale: Source = { type: "webpage", authors: [organization("Yale University")], date: {}, title: "About Yale: Yale Facts", url: "https://www.yale.edu/about-yale/yale-facts" };
    assert.equal(parenthetical(yale), "(Yale University, n.d.)");
    assert.equal(parenthetical(book([person("Smith", "Jane")], { date: {} }), page("12")), "(Smith, n.d., 12)");
  });

  it("no author: the title, italic for a book", () => {
    const result = cite(book([], { title: "Guide to Field Methods" }), page("8"));
    assert.deepEqual(result.parenthetical, [{ text: "(" }, { text: "Guide to Field Methods", italic: true }, { text: " 2022, 8)" }]);
    assert.ok(result.notes.some((note) => note.code === "shorten-title"));
  });

  it("no author and no date: the comma goes inside the quotation marks", () => {
    const web: Source = { type: "webpage", authors: [], date: {}, title: "Statistics for Water Rights", url: "https://example.org/water" };
    assert.equal(parenthetical(web), "(“Statistics for Water Rights,” n.d.)");
    assert.equal(narrative(web), "“Statistics for Water Rights” (n.d.)");
  });

  it("several pages typed as a list are kept as typed", () => {
    assert.equal(parenthetical(book(binderKidder), page("24, 36")), "(Binder and Kidder 2022, 24, 36)");
  });

  it("reports a range with only one page, and still cites it", () => {
    const result = cite(book(binderKidder), range("117"));
    assert.equal(plainText(result.parenthetical), "(Binder and Kidder 2022, 117)");
    assert.ok(result.notes.some((note) => note.code === "incomplete-locator"));
  });

  it("does not format paragraph or section locators, and says so", () => {
    for (const kind of ["paragraph", "section"] as const) {
      const result = cite(book(binderKidder), { kind, value: "4" });
      assert.equal(plainText(result.parenthetical), "(Binder and Kidder 2022)");
      assert.ok(result.notes.some((note) => note.code === "unsupported-locator" && note.kind === kind));
    }
  });
});

describe("narrative citations", () => {
  it("the name in the sentence, the year and locator in parentheses", () => {
    assert.equal(narrative(book([person("Smith", "Jane")], { date: { year: 2024 } })), "Smith (2024)");
    assert.equal(narrative(book([person("Smith", "Jane")], { date: { year: 2024 } }), page("24")), "Smith (2024, 24)");
    assert.equal(narrative(book(binderKidder), range("117-118")), "Binder and Kidder (2022, 117–18)");
    assert.equal(narrative(book(three, { date: { year: 2025 } })), "Snyder et al. (2025)");
  });

  it("no date: n.d. in the parentheses", () => {
    assert.equal(narrative(book([organization("Yale University")], { date: {} })), "Yale University (n.d.)");
  });
});

describe("Chicago author-date is not APA or MLA", () => {
  const sources: Source[] = [
    book([person("Smith", "Jane")]),
    book(binderKidder),
    book(three),
    { type: "journal-article", authors: binderKidder, date: { year: 2022 }, title: "An Article", journal: "Journal", volume: "12", issue: "3", pages: "101-118" },
    { type: "webpage", authors: [person("Smith", "Jane")], date: { year: 2022, month: 3, day: 5 }, title: "A Page", siteName: "Site", url: "https://example.org" },
  ];
  const locators = [undefined, page("24"), range("24-30")];

  it("never uses an ampersand, p. or pp., vol. or no. before a volume, or APA's bracketed year", () => {
    for (const source of sources) {
      for (const locator of locators) {
        const result = cite(source, locator);
        const all = [result.reference, result.parenthetical, result.narrative].map(plainText).join(" ");
        assert.doesNotMatch(all, /&|\bpp?\. |\bvol\. |\(2022\)\./, all);
      }
    }
  });

  it("keeps the year in text citations, with no comma between name and year", () => {
    for (const source of sources) {
      const text = plainText(cite(source, page("24")).parenthetical);
      assert.match(text, / 2022, 24\)$/, text);
      assert.doesNotMatch(text, /, 2022/, text);
    }
  });

  it("gives full given names, not APA initials, and puts the year after the author", () => {
    const text = plainText(cite(book([person("Smith", "Jane Anne")])).reference);
    assert.ok(text.startsWith("Smith, Jane Anne. 2022. "), text);
  });

  it("writes a web page's date month first, unlike MLA's day-month-year", () => {
    const text = plainText(cite(sources[4]).reference);
    assert.ok(text.includes("Site. March 5."), text);
    assert.doesNotMatch(text, /5 Mar\./);
  });
});
