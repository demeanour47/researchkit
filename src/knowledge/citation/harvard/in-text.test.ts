import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainText, type CitationLocator, type Contributor, type Source } from "../source";
import { formatHarvard } from "./citation";

// Expected citations are written out by hand from ResearchKit's Harvard profile (Cite Them Right,
// 13th edition). Forms marked (Wolverhampton) reproduce the University of Wolverhampton's Cite Them
// Right quick guide; (Cumbria) the University of Cumbria's.

const person = (family: string, given = "A."): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });

const book = (authors: Contributor[], overrides: Partial<Extract<Source, { type: "book" }>> = {}): Source => ({
  type: "book",
  authors,
  date: { year: 2015 },
  title: "A handbook",
  publisher: "Example Press",
  ...overrides,
});

function cite(source: Source, locator?: CitationLocator, yearLetter?: string) {
  const citation = formatHarvard({ record: { source, provenance: "user-entered" }, locator, yearLetter });
  return { ...citation, parentheticalText: plainText(citation.parenthetical), narrativeText: plainText(citation.narrative), codes: [...citation.decisions, ...citation.notes].map((item) => item.code) };
}

const page = (value: string): CitationLocator => ({ kind: "page", value });

describe("Harvard text citations", () => {
  it("cites one author with a page (Wolverhampton)", () => {
    const result = cite(book([person("Smith")]), page("23"));
    assert.equal(result.parentheticalText, "(Smith, 2015, p. 23)");
    assert.equal(result.narrativeText, "Smith (2015, p. 23)");
  });

  it("names two and three authors in full, with “and” (Wolverhampton)", () => {
    assert.equal(cite(book([person("Hughes"), person("Ali")], { date: { year: 2022 } }), page("6")).parentheticalText, "(Hughes and Ali, 2022, p. 6)");
    const three = cite(book([person("Lloyd"), person("Singh"), person("Alonso")], { date: { year: 2018 } }), page("14"));
    assert.equal(three.parentheticalText, "(Lloyd, Singh and Alonso, 2018, p. 14)");
    assert.equal(three.narrativeText, "Lloyd, Singh and Alonso (2018, p. 14)");
    assert.ok(three.codes.includes("text-all-named"));
  });

  it("uses et al. from four authors (Wolverhampton)", () => {
    const result = cite(book(["Gerrard", "Brown", "Clark", "Diaz"].map((family) => person(family)), { date: { year: 2005 } }), page("8"));
    assert.equal(result.parentheticalText, "(Gerrard et al., 2005, p. 8)");
    assert.equal(result.narrativeText, "Gerrard et al. (2005, p. 8)");
    assert.ok(result.codes.includes("text-et-al"));
  });

  it("cites an organization by its full name (Wolverhampton)", () => {
    const result = cite(book([organization("University of Wolverhampton")]));
    assert.equal(result.parentheticalText, "(University of Wolverhampton, 2015)");
    assert.equal(result.narrativeText, "University of Wolverhampton (2015)");
    assert.ok(result.codes.includes("text-no-locator"));
  });

  it("writes “no date” in place of the year", () => {
    const result = cite({ type: "webpage", authors: [organization("Cool Antarctica")], date: {}, title: "Antarctica and global warming", url: "https://coolantarctica.com/", accessed: { year: 2020, month: 7, day: 23 } });
    assert.equal(result.parentheticalText, "(Cool Antarctica, no date)");
    assert.equal(result.narrativeText, "Cool Antarctica (no date)");
    assert.ok(result.codes.includes("text-no-date"));
  });

  it("uses a page range with “pp.” and an en dash, in full", () => {
    const result = cite(book([person("Jenkins")], { date: { year: 2019 } }), { kind: "page-range", value: "325-327" });
    assert.equal(result.parentheticalText, "(Jenkins, 2019, pp. 325–327)");
    assert.equal(result.narrativeText, "Jenkins (2019, pp. 325–327)");
  });

  it("follows what was typed when a page and a range are confused", () => {
    const single = cite(book([person("Jenkins")]), { kind: "page-range", value: "325" });
    assert.equal(single.parentheticalText, "(Jenkins, 2015, p. 325)");
    assert.ok(single.codes.includes("incomplete-locator"));
    assert.equal(cite(book([person("Jenkins")]), page("325-7")).parentheticalText, "(Jenkins, 2015, pp. 325–7)");
  });

  it("reports paragraph and section locators instead of guessing", () => {
    const result = cite(book([person("Smith")]), { kind: "paragraph", value: "4" });
    assert.equal(result.parentheticalText, "(Smith, 2015)");
    assert.ok(result.notes.some((note) => note.code === "unsupported-locator" && note.kind === "paragraph"));
  });

  it("ignores a blank locator", () => {
    assert.equal(cite(book([person("Smith")]), page("  ")).parentheticalText, "(Smith, 2015)");
  });

  it("cites a work with no author by its title, styled as in the reference", () => {
    const untitledBook = cite(book([], { title: "Coastal management handbook", date: { year: 2019 } }), page("4"));
    assert.equal(untitledBook.parentheticalText, "(Coastal management handbook, 2019, p. 4)");
    assert.deepEqual(untitledBook.parenthetical, [{ text: "(" }, { text: "Coastal management handbook", italic: true }, { text: ", 2019, p. 4)" }]);
    assert.ok(untitledBook.codes.includes("text-title-variant"));

    const untitledArticle = cite({ type: "journal-article", authors: [], date: { year: 2023 }, title: "Climate change could be newest social determinant of health", journal: "Hospital Case Management", volume: "31", issue: "7", pages: "1-16" });
    assert.equal(untitledArticle.parentheticalText, "(‘Climate change could be newest social determinant of health’, 2023)");
    assert.equal(untitledArticle.narrativeText, "‘Climate change could be newest social determinant of health’ (2023)");
  });

  it("shows a placeholder when there is neither author nor title", () => {
    const result = cite(book([], { title: "" }));
    assert.deepEqual(result.parenthetical, [{ text: "(" }, { text: "[Title]", placeholder: true }, { text: ", 2015)" }]);
  });

  it("carries the year letter into both citations", () => {
    const first = cite(book([person("Smith")], { date: { year: 2024 } }), page("5"), "a");
    const second = cite(book([person("Smith")], { date: { year: 2024 } }), undefined, "b");
    assert.equal(first.parentheticalText, "(Smith, 2024a, p. 5)");
    assert.equal(second.narrativeText, "Smith (2024b)");
    assert.equal(plainText(first.reference), "Smith, A. (2024a) A handbook. Example Press.");
  });

  it("matches the reference's lead and date for every type", () => {
    const sources: Source[] = [
      book([person("Smith")]),
      { type: "journal-article", authors: [person("Chen", "Y.")], date: { year: 2023 }, title: "T", journal: "J", volume: "1", pages: "1-2" },
      { type: "webpage", authors: [organization("BBC")], date: { year: 2023 }, title: "News", url: "https://www.bbc.co.uk/news" },
    ];
    assert.deepEqual(sources.map((source) => cite(source).parentheticalText), ["(Smith, 2015)", "(Chen, 2023)", "(BBC, 2023)"]);
  });
});
