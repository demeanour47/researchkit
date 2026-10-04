import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chicagoNotesBibliography as guide } from "../../../../../content/guides/chicago-notes-bibliography";
import { plainText, type Contributor, type Source } from "../../source";
import { formatChicagoNotesBibliography } from "./citation";
import type { NoteLocator } from "./request";

const text = guide.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");
const person = (family: string, given: string): Contributor => ({ kind: "person", family, given });
const cite = (source: Source, locator?: NoteLocator, shortTitle?: string) => formatChicagoNotesBibliography({ record: { source, provenance: "user-entered" }, locator, shortTitle });
const shows = (example: string) => assert.ok(text.includes(JSON.stringify(example).slice(1, -1)), `the guide shows ${example}`);

const yu: Source = { type: "book", authors: [person("Yu", "Charles")], date: { year: 2020 }, title: "Interior Chinatown", publisher: "Pantheon Books" };
const kwon: Source = {
  type: "journal-article",
  authors: [person("Kwon", "Hyeyoung")],
  date: { year: 2022 },
  title: "Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life",
  journal: "American Journal of Sociology",
  volume: "127",
  issue: "6",
  pages: "1818-1859",
  doi: "10.1086/720277",
};

describe("Chicago notes-and-bibliography guide", () => {
  it("has unique anchors and the full curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-is-notes-bibliography", "when-to-use", "how-notes-work", "footnotes", "endnotes", "full-notes", "shortened-notes", "bibliography",
      "books", "journal-articles", "web-pages", "multiple-authors", "organization-authors", "no-author", "page-locators", "doi-and-url",
      "repeated-sources", "short-titles", "bibliography-order", "common-mistakes", "compared-with-author-date", "research-writing",
      "using-the-generator", "limitations",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "chicago-notes-bibliography");
  });

  it("cites the Chicago Manual of Style and links both Chicago generators", () => {
    assert.ok(text.includes('"chicago-2024"'));
    assert.ok(text.includes("/tools/chicago-notes-bibliography-citation-generator"));
    assert.ok(text.includes("/tools/chicago-author-date-citation-generator"));
    assert.deepEqual(guide.relatedToolIds, ["chicago-notes-bibliography-citation-generator", "citation-style-finder"]);
  });

  it("says the generator formats text and doesn't manage notes in a document", () => {
    assert.match(text, /doesn't insert or number notes in your document/);
  });

  it("shows exactly what the generator produces for every generator example", () => {
    const yuFull = cite(yu, { kind: "page", value: "45" });
    shows(plainText(yuFull.fullNote));
    shows(plainText(yuFull.bibliography));
    shows(plainText(cite(yu, { kind: "page", value: "48" }).shortNote));
    shows(plainText(cite(yu, { kind: "chapter", value: "6" }).fullNote));

    const binder: Source = { type: "book", authors: [person("Binder", "Amy J."), person("Kidder", "Jeffrey L.")], date: { year: 2022 }, title: "The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today", publisher: "University of Chicago Press" };
    assert.equal(plainText(cite(binder, { kind: "page", value: "125" }).shortNote), "Binder and Kidder, Channels of Student Activism, 125.");
    shows("Binder and Kidder, Channels of Student Activism, 125.");
    shows(plainText(cite(binder, { kind: "page-range", value: "117-118" }).shortNote));

    const borel: Source = { type: "book", authors: [person("Borel", "Brooke")], date: { year: 2023 }, title: "The Chicago Guide to Fact-Checking", edition: "2", publisher: "University of Chicago Press" };
    shows(plainText(cite(borel, { kind: "page", value: "92" }).fullNote));
    shows(plainText(cite(borel).bibliography));
    shows(plainText(cite(borel, { kind: "page-range", value: "104-105" }).shortNote));
    shows(plainText(cite(borel, { kind: "page-range", value: "104-105" }, "Fact-Checking").shortNote));

    const kwonFull = cite(kwon, { kind: "page-range", value: "1842-1843" });
    shows(plainText(kwonFull.fullNote));
    shows(plainText(kwonFull.bibliography));
    shows(plainText(cite(kwon, { kind: "page", value: "1851" }).shortNote));

    const yale: Source = { type: "webpage", authors: [{ kind: "organization", name: "Yale University" }], date: {}, title: "About Yale: Yale Facts", siteName: "Yale University", url: "https://www.yale.edu/about-yale/yale-facts", accessed: { year: 2022, month: 3, day: 8 } };
    const yaleCitation = cite(yale);
    shows(plainText(yaleCitation.fullNote));
    shows(plainText(yaleCitation.bibliography));
    assert.equal(plainText(cite(yale, undefined, "Yale Facts").shortNote), "“Yale Facts.”");

    const google: Source = { type: "webpage", authors: [{ kind: "organization", name: "Google" }], date: { year: 2023, month: 11, day: 15 }, title: "Privacy Policy", siteName: "Privacy & Terms", url: "https://policies.google.com/privacy" };
    shows(plainText(cite(google).bibliography));
    assert.equal(plainText(cite(google).shortNote), "Google, “Privacy Policy.”");

    const report: Source = { type: "book", authors: [{ kind: "organization", name: "World Health Organization" }], date: { year: 2020 }, title: "Example Report", publisher: "Example Press" };
    shows(plainText(cite(report, { kind: "page", value: "8" }).fullNote));
    shows(plainText(cite(report, { kind: "page", value: "9" }).shortNote));
    shows(plainText(cite(report).bibliography));

    const anonymous: Source = { type: "book", authors: [], date: { year: 2020 }, title: "The Guide to Field Methods", publisher: "Example Press" };
    shows(plainText(cite(anonymous, { kind: "page", value: "8" }).fullNote));
    shows(plainText(cite(anonymous, { kind: "page", value: "9" }).shortNote));
    shows(plainText(cite(anonymous).bibliography));
  });

  it("shows the author forms the generator uses", () => {
    const three: Source = { type: "book", authors: [person("Smith", "Jane"), person("Jones", "John"), person("Lee", "Min-jun")], date: { year: 2024 }, title: "A Shared Book", publisher: "Example Press" };
    const result = cite(three, { kind: "page", value: "1" });
    assert.ok(plainText(result.fullNote).startsWith("Jane Smith et al., "));
    assert.ok(plainText(result.shortNote).startsWith("Smith et al., "));
    assert.ok(plainText(result.bibliography).startsWith("Smith, Jane, John Jones, and Min-jun Lee."));
    for (const form of ["Jane Smith et al.", "Smith et al.", "Smith, Jane, John Jones, and Min-jun Lee."]) shows(form);
  });
});
