import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chicagoAuthorDateCitations as guide } from "../../../../../content/guides/chicago-author-date-citations";
import { plainText, type CitationLocator, type Contributor, type Source } from "../../source";
import { formatChicagoAuthorDate } from "./citation";

const text = guide.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");
const person = (family: string, given: string): Contributor => ({ kind: "person", family, given });
const organization = (name: string): Contributor => ({ kind: "organization", name });
const cite = (source: Source, locator?: CitationLocator) => formatChicagoAuthorDate({ source, provenance: "user-entered" }, locator);
const page = (value: string): CitationLocator => ({ kind: "page", value });

describe("Chicago author-date guide", () => {
  it("has unique anchors and the full curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-is-author-date", "when-to-use", "author-date-and-notes", "in-text-citations", "parenthetical-citations", "narrative-citations",
      "reference-lists", "one-author", "two-authors", "three-or-more-authors", "organization-authors", "books", "journal-articles", "web-pages",
      "doi-and-url", "page-locators", "missing-dates", "same-author-same-year", "common-mistakes", "reporting-consistently",
      "when-not-appropriate", "relationship-to-notes-bibliography", "using-the-generator", "limitations",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "chicago-author-date-citations");
  });

  it("cites the Chicago Manual of Style and links the generator", () => {
    assert.ok(text.includes('"chicago-2024"'));
    assert.ok(text.includes("/tools/chicago-author-date-citation-generator"));
    assert.deepEqual(guide.relatedToolIds, ["chicago-author-date-citation-generator", "citation-style-finder"]);
  });

  it("does not claim the author-date generator produces notes, and points to the one that does", () => {
    assert.match(text, /author-date generator produces author-date only/);
    assert.match(text, /This generator produces author-date citations only/);
    assert.ok(text.includes("/tools/chicago-notes-bibliography-citation-generator"));
    assert.ok(text.includes("/learn/chicago-notes-bibliography"));
  });

  it("shows exactly what the generator produces for every generator example", () => {
    const sevenAuthors = [person("Snyder", "Carl D."), person("Bedrossian", "Manuel"), person("Barr", "Casey"), person("Four", "A."), person("Five", "B."), person("Six", "C."), person("Seven", "D.")];
    const examples: [Source, CitationLocator | undefined, string, string | null][] = [
      [{ type: "book", authors: [person("Yu", "Charles")], date: { year: 2020 }, title: "Interior Chinatown", publisher: "Pantheon Books" }, page("45"), "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.", "(Yu 2020, 45)"],
      [{ type: "book", authors: [person("Binder", "Amy J."), person("Kidder", "Jeffrey L.")], date: { year: 2022 }, title: "The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today", publisher: "University of Chicago Press" }, { kind: "page-range", value: "117-118" }, "Binder, Amy J., and Jeffrey L. Kidder. 2022. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press.", "(Binder and Kidder 2022, 117–18)"],
      [{ type: "book", authors: [person("Borel", "Brooke")], date: { year: 2023 }, title: "The Chicago Guide to Fact-Checking", edition: "2", publisher: "University of Chicago Press" }, undefined, "Borel, Brooke. 2023. The Chicago Guide to Fact-Checking. 2nd ed. University of Chicago Press.", null],
      [{ type: "book", authors: [person("Smith", "Jane"), person("Jones", "John"), person("Lee", "Min-jun")], date: { year: 2024 }, title: "A Shared Book", publisher: "Example Press" }, undefined, "Smith, Jane, John Jones, and Min-jun Lee. 2024. A Shared Book. Example Press.", "(Smith et al. 2024)"],
      [{ type: "book", authors: [], date: { year: 2020 }, title: "Guide to Field Methods", publisher: "Example Press" }, undefined, "Guide to Field Methods. 2020. Example Press.", null],
      [{ type: "journal-article", authors: [person("Dittmar", "Emily L."), person("Schemske", "Douglas W.")], date: { year: 2023 }, title: "Temporal Variation in Selection Influences Microgeographic Local Adaptation", journal: "American Naturalist", volume: "202", issue: "4", pages: "471-485", doi: "10.1086/725865" }, page("480"), "Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” American Naturalist 202 (4): 471–85. https://doi.org/10.1086/725865.", "(Dittmar and Schemske 2023, 480)"],
      [{ type: "journal-article", authors: [person("Kwon", "Hyeyoung")], date: { year: 2022 }, title: "Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life", journal: "American Journal of Sociology", volume: "127", issue: "6", pages: "1818-1859", doi: "10.1086/720277" }, { kind: "page-range", value: "1842-1843" }, "Kwon, Hyeyoung. 2022. “Inclusion Work: Children of Immigrants Claiming Membership in Everyday Life.” American Journal of Sociology 127 (6): 1818–59. https://doi.org/10.1086/720277.", "(Kwon 2022, 1842–43)"],
      [{ type: "journal-article", authors: sevenAuthors, date: { year: 2025 }, title: "Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments", journal: "PLOS ONE", volume: "20", issue: "3", articleNumber: "e0318239", doi: "10.1371/journal.pone.0318239" }, { kind: "page-range", value: "9-10" }, "Snyder, Carl D., Manuel Bedrossian, Casey Barr, et al. 2025. “Extant Life Detection Using Label-Free Video Microscopy in Analog Aquatic Environments.” PLOS ONE 20 (3): e0318239. https://doi.org/10.1371/journal.pone.0318239.", "(Snyder et al. 2025, 9–10)"],
      [{ type: "webpage", authors: [organization("Yale University")], date: {}, title: "About Yale: Yale Facts", siteName: "Yale University", url: "https://www.yale.edu/about-yale/yale-facts", accessed: { year: 2022, month: 3, day: 8 } }, undefined, "Yale University. n.d. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.", "(Yale University, n.d.)"],
      [{ type: "webpage", authors: [organization("Google")], date: { year: 2023, month: 11, day: 15 }, title: "Privacy Policy", siteName: "Privacy & Terms", url: "https://policies.google.com/privacy" }, undefined, "Google. 2023. “Privacy Policy.” Privacy & Terms. November 15. https://policies.google.com/privacy.", "(Google 2023)"],
    ];
    for (const [source, locator, entry, parenthetical] of examples) {
      const result = cite(source, locator);
      assert.equal(plainText(result.reference), entry);
      assert.ok(text.includes(JSON.stringify(entry).slice(1, -1)), `the guide shows ${entry}`);
      if (parenthetical) {
        assert.equal(plainText(result.parenthetical), parenthetical);
        assert.ok(text.includes(parenthetical), `the guide shows ${parenthetical}`);
      }
    }
  });

  it("shows narrative citations the generator produces", () => {
    const yale: Source = { type: "webpage", authors: [organization("Yale University")], date: {}, title: "About Yale: Yale Facts", url: "https://www.yale.edu/about-yale/yale-facts" };
    assert.equal(plainText(cite(yale).narrative), "Yale University (n.d.)");
    assert.ok(text.includes("Yale University (n.d.)"));
    const dittmar: Source = { type: "journal-article", authors: [person("Dittmar", "Emily L."), person("Schemske", "Douglas W.")], date: { year: 2023 }, title: "T", journal: "J" };
    assert.equal(plainText(cite(dittmar, page("480")).narrative), "Dittmar and Schemske (2023, 480)");
    assert.ok(text.includes("Dittmar and Schemske (2023, 480) found"));
  });
});
