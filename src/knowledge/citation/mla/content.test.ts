import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mla9CitationsAndWorksCited as guide } from "../../../../content/guides/mla-9-citations-and-works-cited";
import { plainText, type CitationLocator, type Contributor, type Source } from "../source";
import { getReference } from "../../research/references";
import { formatMla } from "./citation";

const text = guide.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");
const person = (family: string, given: string): Contributor => ({ kind: "person", family, given });
const cite = (source: Source, locator?: CitationLocator) => formatMla({ source, provenance: "user-entered" }, locator);

describe("MLA 9 guide", () => {
  it("has unique anchors and the full curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-is-mla", "works-cited-and-in-text", "source-and-container", "authors", "multiple-authors", "organization-authors",
      "books", "journal-articles", "web-pages", "page-numbers", "missing-metadata", "doi-and-url", "access-dates",
      "common-mistakes", "examples", "using-the-generator", "limitations",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "mla-9-citations-and-works-cited");
    assert.equal(guide.title, "MLA 9 Citation and Works Cited Guide");
  });

  it("cites the MLA Handbook and links the generator, without claiming synthetic examples are real", () => {
    assert.ok(text.includes('"mla-2021"'));
    assert.ok(text.includes("/tools/mla-citation-generator"));
    assert.ok(text.includes("synthetic examples"));
    assert.deepEqual(guide.relatedToolIds, ["mla-citation-generator", "citation-style-finder"]);
  });

  it("cites the MLA Handbook from the registry, formatted as a group author", () => {
    const reference = getReference("mla-2021");
    assert.ok(text.includes(`"${reference.id}"`), `${reference.id} is unused`);
    assert.ok(reference.apa.startsWith(`${reference.cite.replace(/, \d{4}$/, "")}. (${reference.year}).`));
  });

  it("shows exactly what the generator produces for its worked examples", () => {
    const examples: [Source, CitationLocator | undefined, string, string][] = [
      [
        { type: "journal-article", authors: [person("LeCun", "Yann"), person("Bengio", "Yoshua"), person("Hinton", "Geoffrey")], date: { year: 2015 }, title: "Deep Learning", journal: "Nature", volume: "521", issue: "7553", pages: "436-444", doi: "10.1038/nature14539" },
        { kind: "page", value: "437" },
        "LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.",
        "(LeCun et al. 437)",
      ],
      [
        { type: "webpage", authors: [person("Burns", "Shauntee")], date: { year: 2016, month: 3, day: 2 }, title: "Finding Wonder Women at the Library: Online Biographies and Encyclopedias", siteName: "New York Public Library", url: "https://www.nypl.org/blog/2016/03/02/biographies-women-history" },
        undefined,
        "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/2016/03/02/biographies-women-history.",
        "(Burns)",
      ],
      [
        { type: "book", authors: [person("Dorris", "Michael"), person("Erdrich", "Louise")], date: { year: 1991 }, title: "The Crown of Columbus", publisher: "HarperCollins" },
        { kind: "page", value: "24" },
        "Dorris, Michael, and Louise Erdrich. The Crown of Columbus. HarperCollins, 1991.",
        "(Dorris and Erdrich 24)",
      ],
      [
        { type: "journal-article", authors: [], date: { year: 2020 }, title: "Homily", journal: "Journal of Examples", volume: "3", issue: "1", pages: "90-104" },
        { kind: "page", value: "97" },
        "“Homily.” Journal of Examples, vol. 3, no. 1, 2020, pp. 90–104.",
        "(“Homily” 97)",
      ],
      [
        { type: "book", authors: [{ kind: "organization", name: "Modern Language Association of America" }], date: { year: 2021 }, title: "MLA Handbook", edition: "9", publisher: "Modern Language Association of America" },
        { kind: "page", value: "54" },
        "MLA Handbook. 9th ed., Modern Language Association of America, 2021.",
        "(MLA Handbook 54)",
      ],
    ];
    for (const [source, locator, entry, parenthetical] of examples) {
      const result = cite(source, locator);
      assert.equal(plainText(result.worksCited), entry);
      assert.equal(plainText(result.parenthetical), parenthetical);
      assert.ok(text.includes(entry), `the guide shows ${entry}`);
      assert.ok(text.includes(parenthetical), `the guide shows ${parenthetical}`);
    }
  });
});
