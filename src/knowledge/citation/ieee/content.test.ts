import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ieeeCitationsAndReferences as guide } from "../../../../content/guides/ieee-citations-and-references";
import { plainText, type AnySource, type Contributor } from "../source";
import { formatMultipleCitation, formatSingleCitation } from "./in-text";
import { formatIeeeReference } from "./reference";

const text = guide.sections.flatMap((section) => section.blocks.map((block) => JSON.stringify(block))).join(" ");
const shows = (example: string) => assert.ok(text.includes(JSON.stringify(example).slice(1, -1)), `the guide shows ${example}`);
const person = (family: string, given: string): Contributor => ({ kind: "person", family, given });
const reference = (source: AnySource) => plainText(formatIeeeReference(source).runs);

describe("IEEE guide", () => {
  it("has unique anchors and the full curriculum", () => {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of [
      "what-is-ieee", "where-used", "numeric-systems", "citation-numbering", "reference-order", "single-citations", "multiple-citations",
      "citation-ranges", "books", "journal-articles", "conference-papers", "web-pages", "authors", "organization-authors", "doi", "urls",
      "locators", "reference-numbering", "duplicate-sources", "common-mistakes", "ieee-vs-apa", "ieee-vs-mla", "ieee-vs-chicago", "consistency",
      "using-the-generator", "limitations",
    ]) assert.ok(ids.includes(id), id);
    assert.equal(guide.slug, "ieee-citations-and-references");
  });

  it("cites the IEEE Reference Guide and explains that numbers follow citation order", () => {
    assert.ok(text.includes('"ieee-2025"'));
    assert.match(text, /order of first citation/);
    assert.match(text, /doesn't see your paper/);
    assert.deepEqual(guide.relatedToolIds, ["ieee-citation-generator", "citation-style-finder"]);
  });

  it("shows exactly what the generator produces for every reference example", () => {
    const examples: AnySource[] = [
      { type: "book", authors: [person("Klaus", "B."), person("Horn", "P.")], date: { year: 1986 }, title: "Robot Vision", place: "Cambridge, MA, USA", publisher: "MIT Press" },
      { type: "book", authors: [{ kind: "organization", name: "Westinghouse Electric Corporation" }], date: { year: 1970 }, title: "Integrated Electronic Systems", place: "Englewood Cliffs, NJ, USA", publisher: "Prentice-Hall" },
      { type: "journal-article", authors: [person("Chiampi", "M. M."), person("Zilberti", "L. L.")], date: { year: 2011, month: 10 }, title: "Induction of electric field in human bodies moving near MRI: An efficient BEM computational procedure", journal: "IEEE Trans. Biomed. Eng.", volume: "58", issue: "10", pages: "2787-2793", doi: "10.1109/TBME.2011.2158315" },
      { type: "journal-article", authors: [person("Risk", "W. P."), person("Kino", "G. S."), person("Shaw", "H. J.")], date: { year: 1986, month: 2 }, title: "Fiber-optic frequency shifter using a surface acoustic wave incident at an oblique angle", journal: "Opt. Lett.", volume: "11", issue: "2", pages: "115-117", url: "http://ol.osa.org/abstract.cfm?URI=ol-11-2-115" },
      { type: "journal-article", authors: [person("Zhang", "J."), person("Tansu", "N.")], date: { year: 2013, month: 4 }, title: "Optical gain and laser characteristics of InGaN quantum wells on ternary InGaN substrates", journal: "IEEE Photon. J.", volume: "5", issue: "2", articleNumber: "2600111" },
      { type: "conference-paper", authors: [person("Sarkar", "D."), person("Srivastava", "K. V.")], date: { year: 2013 }, title: "SRR-loaded antipodal Vivaldi antenna for UWB applications with tunable notch function", proceedings: "Proc. Int. Symp. Electromagn. Theory", location: "Hiroshima, Japan", pages: "466-469" },
      { type: "conference-paper", authors: [person("Veruggio", "G.")], date: { year: 2006 }, title: "The EURON roboethics roadmap", proceedings: "Proc. Humanoids ’06: 6th IEEE-RAS Int. Conf. Humanoid Robots", pages: "612-617", doi: "10.1109/ICHR.2006.321337" },
      { type: "webpage", authors: [person("Smith", "J.")], date: {}, title: "Obama inaugurated as President", siteName: "CNN.com", url: "http://www.cnn.com/POLITICS/01/21/obama_inaugurated/index.html", accessed: { year: 2009, month: 2, day: 1 } },
    ];
    for (const source of examples) shows(reference(source));
  });

  it("shows exactly what the generator produces for citations", () => {
    for (const [numbers, ranges] of [["2, 4, 5, 6, 7, 9", "written-out"], ["2, 4-7, 9", "en-dash"], ["1-4", "written-out"], ["1-4", "en-dash"], ["4, 5", "en-dash"], ["1, 3", "written-out"]] as const) {
      shows(plainText(formatMultipleCitation(numbers, ranges).runs ?? []));
    }
    for (const [kind, value] of [["page-range", "5-10"], ["page", "24"], ["chapter", "2"], ["section", "4.5"]] as const) {
      shows(plainText(formatSingleCitation("3", { kind, value }).runs ?? []));
    }
    assert.equal(plainText(formatSingleCitation("3", { kind: "page", value: "24" }).runs ?? []), "[3, p. 24]");
  });
});
