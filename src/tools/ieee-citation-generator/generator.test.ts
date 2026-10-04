import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyAuthor } from "../../features/citation/author-draft";
import { blankDraft, isEmptyDraft, toAnySource, withOfferedType } from "../../features/citation/source-draft";
import { formatIeee } from "../../knowledge/citation/ieee/citation";
import type { Decision } from "../../knowledge/citation/ieee/notes";
import { ANY_SOURCE_TYPES, SOURCE_TYPES, plainText } from "../../knowledge/citation/source";
import { announcements, copySubjects, decisionText, form, multiple } from "./copy";
import { copyText } from "./copy-texts";
import { EXAMPLE_NUMBER, exampleDraft } from "./draft";

describe("load example", () => {
  it("reproduces the IEEE Reference Guide's conference example, numbered", () => {
    const result = formatIeee({ source: toAnySource(exampleDraft(10)), provenance: "user-entered", number: EXAMPLE_NUMBER });
    assert.equal(plainText(result.entry ?? []), "[1] D. Sarkar and K. V. Srivastava, “SRR-loaded antipodal Vivaldi antenna for UWB applications with tunable notch function,” in Proc. Int. Symp. Electromagn. Theory, Hiroshima, Japan, 2013, pp. 466–469.");
    assert.equal(plainText(result.citation ?? []), "[1]");
    assert.equal(plainText(result.namedCitation ?? []), "Sarkar and Srivastava [1]");
    assert.equal(copyText(result.entry ?? []).html, "[1] D. Sarkar and K. V. Srivastava, “SRR-loaded antipodal Vivaldi antenna for UWB applications with tunable notch function,” in <i>Proc. Int. Symp. Electromagn. Theory</i>, Hiroshima, Japan, 2013, pp. 466–469.");
  });
});

describe("the shared draft, with the opt-in conference type", () => {
  it("offers conference papers only where a form offers them", () => {
    const draft = blankDraft(1);
    assert.equal(withOfferedType(draft, "conference-paper", ANY_SOURCE_TYPES).type, "conference-paper");
    assert.equal(withOfferedType(draft, "conference-paper", SOURCE_TYPES).type, "book");
    assert.equal(withOfferedType(draft, "podcast", ANY_SOURCE_TYPES), draft);
  });

  it("counts the new fields as content", () => {
    assert.equal(isEmptyDraft({ ...blankDraft(1), place: "Cambridge" }), false);
    assert.equal(isEmptyDraft({ ...blankDraft(1), proceedings: " " }), true);
  });

  it("converts a book's place, and a conference paper's proceedings and location", () => {
    const book = toAnySource({ ...blankDraft(1), authors: [{ ...emptyAuthor(1), given: "B.", family: "Klaus" }], title: "Robot Vision", place: "Cambridge, MA, USA", publisher: "MIT Press", year: "1986" });
    assert.equal(book.type === "book" && book.place, "Cambridge, MA, USA");
    const paper = toAnySource({ ...exampleDraft(1), month: "3" });
    assert.deepEqual(paper.type === "conference-paper" && [paper.proceedings, paper.location, paper.date], ["Proc. Int. Symp. Electromagn. Theory", "Hiroshima, Japan", { year: 2013, month: 3 }]);
  });
});

describe("wording", () => {
  it("explains every kind of decision, each differently", () => {
    const decisions: Decision[] = [
      { code: "number-from-citation-order" }, { code: "initials-first" }, { code: "authors-listed", count: 3 }, { code: "authors-shortened", count: 7 },
      { code: "organization-author" }, { code: "title-first" }, { code: "book-title-italic" }, { code: "article-title-quoted" },
      { code: "conference-in-proceedings" }, { code: "web-elements-periods" }, { code: "edition-shown" }, { code: "place-and-publisher" },
      { code: "journal-numbers" }, { code: "page-range-full" }, { code: "article-number" }, { code: "month-abbreviated", text: "Oct. 2011" },
      { code: "no-date" }, { code: "doi-prefix" }, { code: "doi-and-url" }, { code: "url-online" }, { code: "access-date", text: "Feb. 1, 2009" },
      { code: "citation-brackets" }, { code: "citation-locator", text: "p. 24" }, { code: "citations-written-out" }, { code: "citations-en-dash" },
      { code: "text-names" },
    ];
    const texts = decisions.map(decisionText);
    assert.equal(new Set(texts).size, texts.length);
  });

  it("labels the conference type and both range forms, naming the current IEEE rule", () => {
    assert.equal(form.sourceTypes["conference-paper"], "Conference paper");
    assert.match(multiple.ranges["written-out"], /current IEEE Reference Guide/);
    assert.match(multiple.ranges["en-dash"], /earlier IEEE guidance/);
  });

  it("announces copies, clearing, loading and updates", () => {
    assert.equal(announcements.copied("multiple"), "Citation of several references copied.");
    assert.equal(announcements.entryUpdated("[1] X.", 0), "Reference entry updated: [1] X.");
    assert.match(announcements.copyFailed("entry"), /^Reference entry couldn't be copied automatically\./);
  });

  it("gives each copy button a distinct accessible name", () => {
    assert.deepEqual(Object.values(copySubjects).map((subject) => `Copy ${subject}`), ["Copy citation", "Copy citation with authors", "Copy reference entry", "Copy citation of several references"]);
  });
});
