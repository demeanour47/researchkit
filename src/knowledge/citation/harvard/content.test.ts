import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { harvardCitationsAndReferences as guide } from "../../../../content/guides/harvard-citations-and-references";
import { formatCitation as formatApa } from "../apa/reference";
import { formatChicagoAuthorDate } from "../chicago/author-date/citation";
import { formatSingleCitation } from "../ieee/in-text";
import { formatIeeeReference } from "../ieee/reference";
import { plainText, type CitationLocator, type Contributor, type Source } from "../source";
import { formatHarvard } from "./citation";

const text = guide.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");
const shows = (example: string) => assert.ok(text.includes(JSON.stringify(example).slice(1, -1)), `the guide shows ${example}`);
const person = (family: string, given = "A."): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const harvard = (source: Source, locator?: CitationLocator, yearLetter?: string) => {
  const citation = formatHarvard({ record: { source, provenance: "user-entered" }, locator, yearLetter });
  return { reference: plainText(citation.reference), parenthetical: plainText(citation.parenthetical), narrative: plainText(citation.narrative) };
};
const page = (value: string): CitationLocator => ({ kind: "page", value });

const thakerAuthors = [person("Thaker", "Jagadish"), person("Smith", "Nicholas"), person("Leiserowitz", "Anthony")];
const thaker: Source = { type: "journal-article", authors: thakerAuthors, date: { year: 2020 }, title: "Global warming risk perceptions in India", journal: "Risk Analysis", volume: "40", issue: "12", pages: "2481-2497", doi: "10.1111/risa.13574" };
const cottrell: Source = { type: "book", authors: [person("Cottrell", "Stella")], date: { year: 2019 }, title: "The study skills handbook", edition: "5", publisher: "Red Globe Press" };

describe("Harvard guide", () => {
  it("has unique anchors and the full curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-is-harvard", "harvard-variants", "researchkit-profile", "in-text-citations", "parenthetical-citations", "narrative-citations", "reference-lists",
      "one-author", "two-authors", "multiple-authors", "organization-authors", "no-author", "books", "journal-articles", "web-pages", "doi", "urls",
      "access-dates", "page-locators", "same-author-same-year", "reference-order", "common-mistakes", "harvard-vs-apa", "harvard-vs-chicago", "harvard-vs-ieee",
      "check-institutional-guidance",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "harvard-citations-and-references");
  });

  it("discloses the profile, cites Cite Them Right and never claims to be the only Harvard", () => {
    assert.ok(text.includes('"cite-them-right-2025"'));
    assert.match(text, /one defined Harvard author-date profile, based on Cite Them Right, 13th edition/);
    assert.match(text, /does not claim to be the only correct Harvard/);
    assert.match(text, /Harvard University does not publish or maintain a Harvard style/);
    assert.doesNotMatch(text, /the official Harvard|universally accepted/i);
    assert.deepEqual(guide.relatedToolIds, ["harvard-citation-generator", "citation-style-finder"]);
  });

  it("shows exactly what the generator produces for every reference example", () => {
    const examples: Source[] = [
      cottrell,
      { type: "book", authors: [person("Speight", "James G.")], date: { year: 2019 }, title: "Global climate change demystified", edition: "2", publisher: "Wiley" },
      { type: "book", authors: [person("Pears", "Richard"), person("Shields", "Graham")], date: { year: 2025 }, title: "Cite them right: the essential referencing guide", edition: "13", publisher: "Bloomsbury Academic" },
      { type: "book", authors: [person("Ahmed", "R.")], date: { year: 2024 }, title: "Coastal erosion", publisher: "Example Press", doi: "10.5555/example.2024" },
      { type: "journal-article", authors: [person("Chen", "Yonghong")], date: { year: 2023 }, title: "Addressing uncertainties through improved reserve product design", journal: "IEEE Transactions on Power Systems", volume: "38", issue: "4", pages: "3911-3923", doi: "10.1109/TPWRS.2022.3200697" },
      thaker,
      { type: "journal-article", authors: [person("Iacobellis", "Gaetano")], date: { year: 2020 }, title: "COVID-19 and diabetes: can DPP4 inhibition play a role?", journal: "Diabetes Research and Clinical Practice", volume: "162", articleNumber: "108125" },
      { type: "journal-article", authors: [], date: { year: 2023 }, title: "Climate change could be newest social determinant of health", journal: "Hospital Case Management", volume: "31", issue: "7", pages: "1-16", url: "https://search.ebscohost.com/", accessed: { year: 2023, month: 7, day: 31 } },
      { type: "webpage", authors: [person("Sneed", "Annie")], date: { year: 2019 }, title: "The reason Antarctica is melting", url: "https://www.scientificamerican.com/", accessed: { year: 2020, month: 7, day: 23 } },
      { type: "webpage", authors: [organization("Cool Antarctica")], date: {}, title: "Antarctica and global warming", url: "https://coolantarctica.com/", accessed: { year: 2020, month: 7, day: 23 } },
      { type: "webpage", authors: [organization("Department for Education")], date: { year: 2025 }, title: "Working together to safeguard children", url: "https://www.gov.uk/government/publications/working-together-to-safeguard-children--2", accessed: { year: 2025, month: 8, day: 20 } },
    ];
    for (const source of examples) shows(harvard(source).reference);
  });

  it("shows exactly what the generator produces for citations", () => {
    const book = (authors: Contributor[], year: number): Source => ({ type: "book", authors, date: { year }, title: "T", publisher: "P" });
    const smith = harvard(book([person("Smith")], 2015), page("23"));
    shows(smith.parenthetical);
    shows(smith.narrative);
    shows(harvard(book([person("Smith")], 2015)).parenthetical);
    shows(harvard(book([person("Hughes"), person("Ali")], 2022), page("6")).parenthetical);
    shows(harvard(book([person("Hughes"), person("Ali")], 2022), page("6")).narrative);
    shows(harvard(book([person("Lloyd"), person("Singh"), person("Alonso")], 2018), page("14")).parenthetical);
    shows(harvard(book(["Gerrard", "B", "C", "D"].map((family) => person(family)), 2005), page("8")).parenthetical);
    shows(harvard(book([organization("University of Wolverhampton")], 2015)).parenthetical);
    shows(harvard(book([person("Cottrell")], 2019)).parenthetical);
    const jenkins = harvard(book([person("Jenkins")], 2019), { kind: "page-range", value: "325-327" });
    shows(jenkins.parenthetical);
    shows(jenkins.narrative);
    shows(harvard({ type: "webpage", authors: [organization("Cool Antarctica")], date: {}, title: "T", url: "https://coolantarctica.com/" }).parenthetical);
    shows(harvard(thaker, page("2485")).parenthetical);
    shows(harvard(thaker, page("2485")).narrative);
    shows(harvard(thaker).parenthetical);
    shows(harvard({ type: "journal-article", authors: [], date: { year: 2023 }, title: "Climate change could be newest social determinant of health", journal: "J" }).parenthetical);
  });

  it("shows the generator's year letters", () => {
    for (const [title, letter] of [["Coastal erosion", "a"], ["Flood risk", "b"]] as const) {
      const result = harvard({ type: "book", authors: [person("Ahmed", "R.")], date: { year: 2024 }, title, publisher: "Example Press" }, undefined, letter);
      shows(result.reference);
      shows(result.parenthetical);
    }
  });

  it("compares Harvard with ResearchKit's own APA, Chicago and IEEE output", () => {
    const apaBook = formatApa(cottrell);
    shows(plainText(apaBook.reference));
    shows(plainText(apaBook.parenthetical));
    const apaArticle = formatApa(thaker);
    shows(plainText(apaArticle.reference));
    shows(plainText(apaArticle.parenthetical));

    const chicago = formatChicagoAuthorDate({ source: { ...thaker, title: "Global Warming Risk Perceptions in India" }, provenance: "user-entered" }, page("2485"));
    shows(plainText(chicago.reference));
    shows(plainText(chicago.parenthetical));

    shows(plainText(formatIeeeReference({ ...thaker, journal: "Risk Anal.", date: { year: 2020, month: 12 } }).runs));
    shows(plainText(formatSingleCitation("1", { kind: "page", value: "2485" }).runs ?? []));
  });
});
