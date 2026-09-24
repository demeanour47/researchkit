import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCitation } from "../../knowledge/citation/apa/reference";
import { announcements, copySubjects } from "./announcements";
import { copyTexts } from "./copy-texts";
import { blankDraft, emptyAuthor, exampleDraft, isEmptyDraft, toSource, type Draft } from "./draft";

const citationFor = (draft: Draft) => formatCitation(toSource(draft));

describe("load example", () => {
  it("produces the expected reference and in-text citations immediately", () => {
    const texts = copyTexts(citationFor(exampleDraft(10)));
    assert.equal(
      texts.reference,
      "LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature, 521(7553), 436–444. https://doi.org/10.1038/nature14539",
    );
    assert.equal(texts.parenthetical, "(LeCun et al., 2015)");
    assert.equal(texts.narrative, "LeCun et al. (2015)");
  });

  it("fills the form as specified", () => {
    const draft = exampleDraft(10);
    assert.equal(draft.type, "journal-article");
    assert.deepEqual(
      draft.authors.map((author) => [author.kind, author.given, author.family]),
      [
        ["person", "Yann", "LeCun"],
        ["person", "Yoshua", "Bengio"],
        ["person", "Geoffrey", "Hinton"],
      ],
    );
    assert.deepEqual(
      [draft.year, draft.title, draft.journal, draft.volume, draft.issue, draft.pages, draft.doi],
      ["2015", "Deep learning", "Nature", "521", "7553", "436–444", "10.1038/nature14539"],
    );
  });

  it("gives every author a fresh, distinct key", () => {
    assert.deepEqual(exampleDraft(10).authors.map((author) => author.key), [10, 11, 12]);
  });

  it("counts as a filled form", () => assert.equal(isEmptyDraft(exampleDraft(1)), false));
});

describe("clear form", () => {
  it("restores the initial form: a book with one empty person author", () => {
    const cleared = blankDraft(42);
    assert.equal(cleared.type, "book");
    assert.deepEqual(cleared.authors, [emptyAuthor(42)]);
    assert.deepEqual(cleared.authors[0], { key: 42, kind: "person", family: "", given: "", name: "" });
  });

  it("empties every field, whatever was filled in before", () => {
    const cleared = blankDraft(7);
    for (const [field, value] of Object.entries(cleared)) {
      if (field === "type" || field === "authors") continue;
      assert.equal(value, "", field);
    }
    assert.deepEqual({ ...blankDraft(1), authors: [] }, { ...cleared, authors: [] });
  });

  it("counts as empty, so no reference is shown", () => assert.equal(isEmptyDraft(blankDraft(1)), true));
});

describe("isEmptyDraft", () => {
  it("ignores the source type and whitespace", () => {
    assert.equal(isEmptyDraft({ ...blankDraft(1), type: "webpage", title: "   " }), true);
  });

  it("notices any single field or author name", () => {
    assert.equal(isEmptyDraft({ ...blankDraft(1), doi: "10.1038/x" }), false);
    assert.equal(isEmptyDraft({ ...blankDraft(1), authors: [{ ...emptyAuthor(1), given: "Yann" }] }), false);
    assert.equal(isEmptyDraft({ ...blankDraft(1), authors: [{ ...emptyAuthor(1), kind: "organization", name: "WHO" }] }), false);
  });
});

describe("copy text", () => {
  const texts = copyTexts(citationFor(exampleDraft(1)));

  it("is plain text: no HTML and no markdown for italics", () => {
    for (const text of Object.values(texts)) {
      assert.doesNotMatch(text, /[<>*_]/, text);
    }
    assert.ok(texts.reference.includes("Nature, 521(7553)"));
  });

  it("keeps punctuation exactly, including the en dash and ampersand", () => {
    assert.ok(texts.reference.includes("436–444"));
    assert.ok(texts.reference.includes("Bengio, Y., & Hinton, G."));
    assert.ok(!texts.reference.endsWith("."), "a DOI ends the reference without a full stop");
  });

  it("copies an unauthored article's in-text title with its curly quotation marks", () => {
    const unauthored = copyTexts(citationFor({ ...exampleDraft(1), authors: [emptyAuthor(1)] }));
    assert.equal(unauthored.parenthetical, "(“Deep learning,” 2015)");
  });
});

describe("announcements", () => {
  it("name what was copied", () => {
    assert.equal(announcements.copied("reference"), "Reference copied.");
    assert.equal(announcements.copied("parenthetical"), "Parenthetical citation copied.");
    assert.equal(announcements.copied("narrative"), "Narrative citation copied.");
  });

  it("confirm clearing and loading the example", () => {
    assert.equal(announcements.formCleared, "Form cleared.");
    assert.equal(announcements.exampleLoaded, "Example loaded.");
  });

  it("explain how to copy by keyboard when automatic copying fails", () => {
    assert.match(announcements.copyFailed("reference"), /^Reference couldn't be copied automatically\. .*Control\+C.*Command\+C/);
  });

  it("give each copy button a distinct accessible name", () => {
    const names = Object.values(copySubjects).map((subject) => `Copy ${subject}`);
    assert.deepEqual(names, ["Copy reference", "Copy parenthetical citation", "Copy narrative citation"]);
  });
});
