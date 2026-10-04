import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainText, type CitationLocator, type Contributor, type Source } from "../source";
import { formatMla } from "./citation";

// Every expected string is written out by hand from MLA 9 rules, independently of the code.

const person = (family: string, given?: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const page = (value: string): CitationLocator => ({ kind: "page", value });

const article = (authors: Contributor[], overrides: Partial<Extract<Source, { type: "journal-article" }>> = {}): Source => ({
  type: "journal-article",
  authors,
  date: { year: 2015 },
  title: "Deep Learning",
  journal: "Nature",
  volume: "521",
  issue: "7553",
  pages: "436-444",
  doi: "10.1038/nature14539",
  ...overrides,
});

const cite = (source: Source, locator?: CitationLocator) => formatMla({ source, provenance: "user-entered" }, locator);
const parenthetical = (source: Source, locator?: CitationLocator) => plainText(cite(source, locator).parenthetical);

const lecun = [person("LeCun", "Yann"), person("Bengio", "Yoshua"), person("Hinton", "Geoffrey")];

describe("parenthetical citations", () => {
  it("one author with a page: the page follows the name directly, with no p. or comma", () => {
    assert.equal(parenthetical(article([person("Baron", "Naomi")]), page("194")), "(Baron 194)");
  });

  it("one author without a locator", () => {
    assert.equal(parenthetical(article([person("Baron", "Naomi")])), "(Baron)");
  });

  it("two authors, joined by 'and'", () => {
    assert.equal(parenthetical(article([person("Dorris", "Michael"), person("Erdrich", "Louise")]), page("24")), "(Dorris and Erdrich 24)");
  });

  it("three or more authors: the first and et al., with no comma", () => {
    assert.equal(parenthetical(article(lecun), page("437")), "(LeCun et al. 437)");
  });

  it("a page range, shortened by the inclusive-number rule", () => {
    assert.equal(parenthetical(article(lecun), { kind: "page-range", value: "436-444" }), "(LeCun et al. 436–44)");
    assert.equal(parenthetical(article(lecun), { kind: "page-range", value: "96-101" }), "(LeCun et al. 96–101)");
    assert.equal(parenthetical(article(lecun), { kind: "page-range", value: "24-26" }), "(LeCun et al. 24–26)");
  });

  it("paragraph numbers take par. or pars. after a comma", () => {
    assert.equal(parenthetical(article([person("Chan", "Evans")]), { kind: "paragraph", value: "41" }), "(Chan, par. 41)");
    assert.equal(parenthetical(article([person("Chan", "Evans")]), { kind: "paragraph", value: "25-30" }), "(Chan, pars. 25–30)");
  });

  it("does not format a section locator, and reports it", () => {
    const result = cite(article([person("Chan", "Evans")]), { kind: "section", value: "Methods" });
    assert.equal(plainText(result.parenthetical), "(Chan)");
    assert.ok(result.notes.some((note) => note.code === "unsupported-locator"));
  });

  it("an organization author, in full", () => {
    assert.equal(parenthetical(article([organization("World Health Organization")]), page("12")), "(World Health Organization 12)");
  });

  it("no author: the article title in quotation marks (style.mla.org: (\"Homily\" 97))", () => {
    const result = cite(article([], { title: "Homily" }), page("97"));
    assert.equal(plainText(result.parenthetical), "(“Homily” 97)");
    assert.ok(result.decisions.some((decision) => decision.code === "in-text-title"));
  });

  it("no author: a book title in italics", () => {
    const book: Source = { type: "book", authors: [], date: { year: 2021 }, title: "MLA Handbook", publisher: "Modern Language Association of America" };
    assert.deepEqual(cite(book, page("54")).parenthetical, [{ text: "(" }, { text: "MLA Handbook", italic: true }, { text: " 54)" }]);
  });

  it("an organization that is also the publisher is cited by title, the entry's first element", () => {
    const mla = "Modern Language Association of America";
    const book: Source = { type: "book", authors: [organization(mla)], date: { year: 2021 }, title: "MLA Handbook", edition: "9", publisher: mla };
    assert.equal(plainText(cite(book, page("54")).parenthetical), "(MLA Handbook 54)");
  });

  it("a missing title is a visible placeholder", () => {
    assert.equal(parenthetical(article([], { title: "" })), "([Title])");
  });
});

describe("narrative citations", () => {
  it("one author: full name at first mention, surname later, locator for the end of the sentence", () => {
    const { narrative } = cite(article([person("Baron", "Naomi")]), page("194"));
    assert.equal(plainText(narrative.firstMention), "Naomi Baron");
    assert.equal(plainText(narrative.laterMentions), "Baron");
    assert.equal(plainText(narrative.locator ?? []), "(194)");
  });

  it("two authors", () => {
    const { narrative } = cite(article([person("Dorris", "Michael"), person("Erdrich", "Louise")]));
    assert.equal(plainText(narrative.firstMention), "Michael Dorris and Louise Erdrich");
    assert.equal(plainText(narrative.laterMentions), "Dorris and Erdrich");
    assert.equal(narrative.locator, null);
  });

  it("three or more authors: 'and others', never et al. in prose", () => {
    const result = cite(article(lecun), page("437"));
    assert.equal(plainText(result.narrative.firstMention), "Yann LeCun and others");
    assert.equal(plainText(result.narrative.laterMentions), "LeCun and others");
    assert.ok(result.decisions.some((decision) => decision.code === "prose-and-others"));
  });

  it("a paragraph locator keeps its label in the closing parentheses", () => {
    assert.equal(plainText(cite(article([person("Chan", "Evans")]), { kind: "paragraph", value: "41" }).narrative.locator ?? []), "(par. 41)");
  });

  it("no author: the title", () => {
    const { narrative } = cite(article([], { title: "Homily" }), page("97"));
    assert.equal(plainText(narrative.firstMention), "“Homily”");
    assert.equal(plainText(narrative.locator ?? []), "(97)");
  });
});

describe("MLA is not APA", () => {
  const sources: Source[] = [
    article([person("Smith", "Jane")]),
    article([person("Smith", "Jane"), person("Jones", "John")]),
    article(lecun),
    article([], { date: {} }),
    { type: "book", authors: [person("Smith", "Jane Anne")], date: {}, title: "A Book", publisher: "Pub" },
    { type: "webpage", authors: [organization("World Health Organization")], date: {}, title: "A Page", siteName: "WHO", url: "https://www.who.int/page" },
  ];
  const locators: (CitationLocator | undefined)[] = [undefined, page("24"), { kind: "page-range", value: "24-30" }];

  it("never uses an ampersand, n.d., or initials in place of full given names", () => {
    for (const source of sources) {
      for (const locator of locators) {
        const result = cite(source, locator);
        const all = [result.worksCited, result.parenthetical, result.narrative.firstMention, result.narrative.laterMentions].map(plainText).join(" ");
        assert.doesNotMatch(all, /&/, all);
        assert.doesNotMatch(all, /n\.d\./, all);
        assert.doesNotMatch(all, /Smith, J\./, all);
      }
    }
    assert.ok(plainText(cite(sources[4]).worksCited).startsWith("Smith, Jane Anne."));
  });

  it("never puts the year, p., pp. or an author–year comma in an in-text citation", () => {
    for (const source of sources) {
      for (const locator of locators) {
        const result = cite(source, locator);
        for (const text of [plainText(result.parenthetical), plainText(result.narrative.locator ?? [])]) {
          assert.doesNotMatch(text, /2015/, text);
          assert.doesNotMatch(text, /\bpp?\./, text);
          assert.doesNotMatch(text, /, \d{4}/, text);
        }
      }
    }
  });

  it("does not write the date in brackets after the author, APA's (2020, March 5) form", () => {
    const web: Source = { type: "webpage", authors: [person("Smith", "Jane")], date: { year: 2020, month: 3, day: 5 }, title: "Page", siteName: "Site", url: "https://example.org" };
    const text = plainText(cite(web).worksCited);
    assert.ok(text.includes("5 Mar. 2020"));
    assert.doesNotMatch(text, /\(2020/);
  });
});
