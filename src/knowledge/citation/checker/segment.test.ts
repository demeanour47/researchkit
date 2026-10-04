import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findDoi, findUrl, familyInitialNames, initialsFirstNames, invertedFirstNames, authorBoundary } from "./features";
import { segment, splitReferenceEntries } from "./segment";

describe("splitting pasted references", () => {
  it("splits on blank lines and keeps multiline entries together", () => {
    assert.deepEqual(splitReferenceEntries("Smith, J. (2024). Title.\nJournal, 10, 1–2.\n\n\nJones, K. (2023). Book. Publisher."), ["Smith, J. (2024). Title.\nJournal, 10, 1–2.", "Jones, K. (2023). Book. Publisher."]);
  });

  it("splits a numbered list pasted without blank lines, one entry per number", () => {
    const entries = segment("[1] B. Klaus and P. Horn, Robot Vision.\nCambridge, MA, USA: MIT Press, 1986.\n[2] A. Author, Book. Publisher, 2020.");
    assert.equal(entries.length, 2);
    assert.equal(entries[0].originalText, "[1] B. Klaus and P. Horn, Robot Vision.\nCambridge, MA, USA: MIT Press, 1986.");
    assert.deepEqual(entries[0].label, { raw: "[1]", form: "bracket", number: 1 });
    assert.equal(entries[0].text, "B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986.");
  });

  it("reads list numbers and malformed bracket labels without correcting them", () => {
    assert.deepEqual(segment("3. Smith, J. (2020). T. P.")[0].label, { raw: "3.", form: "list", number: 3 });
    assert.deepEqual(segment("[3a] A. Author, Book. P, 2020.")[0].label, { raw: "[3a]", form: "bracket", number: null });
  });

  it("doesn't split an unnumbered block, even with a line that starts with a number", () => {
    assert.equal(segment("Smith, J. (2020). Title.\n2nd line of the same entry.").length, 1);
  });

  it("keeps a long reference whole", () => {
    const long = `Smith, J. (2020). ${"A very long title ".repeat(40)}. Publisher.`;
    assert.equal(segment(long)[0].originalText, long);
  });

  it("returns nothing for empty text", () => {
    assert.deepEqual(segment(" \n\n "), []);
  });
});

describe("neutral readings", () => {
  it("finds DOIs in every written form", () => {
    const doi = findDoi("Risk Analysis, 40(12). https://doi.org/10.1111/risa.13574.");
    assert.deepEqual(doi && { raw: doi.raw, normalized: doi.normalized, form: doi.form }, { raw: "https://doi.org/10.1111/risa.13574", normalized: "https://doi.org/10.1111/risa.13574", form: "link" });
    assert.equal(findDoi("…, Oct. 2011, doi: 10.1109/TBME.2011.2158315.")?.form, "prefix");
    assert.equal(findDoi("doi:not-a-doi")?.normalized, null);
  });

  it("finds URLs with or without a protocol, and skips DOI links", () => {
    assert.equal(findUrl("https://doi.org/10.1/x https://example.org/a.")?.raw, "https://example.org/a");
    assert.deepEqual(findUrl("Library, 2 Mar. 2016, www.nypl.org/blog/2016."), { raw: "www.nypl.org/blog/2016", bare: true, valid: true, index: 22 });
    assert.equal(findUrl("(see https://example.org/page)")?.raw, "https://example.org/page");
    assert.equal(findUrl("https://localhost")?.valid, false);
  });

  it("reads author lists in each style's order, including organizations", () => {
    assert.deepEqual(invertedFirstNames("Binder, Amy J., and Jeffrey L. Kidder"), { names: ["Binder", "Kidder"], etAl: false });
    assert.deepEqual(invertedFirstNames("LeCun, Yann, et al"), { names: ["LeCun"], etAl: true });
    assert.deepEqual(invertedFirstNames("World Health Organization"), { names: ["World Health Organization"], etAl: false });
    assert.deepEqual(familyInitialNames("Thaker, J., Smith, N. and Leiserowitz, A."), { names: ["Thaker", "Smith", "Leiserowitz"], etAl: false });
    assert.deepEqual(initialsFirstNames("J. Thaker, N. Smith, and A. Leiserowitz"), { names: ["Thaker", "Smith", "Leiserowitz"], etAl: false });
  });

  it("finds where an author list ends without stopping at initials", () => {
    assert.deepEqual(authorBoundary("Smith, J. R. Title. Publisher, 2020."), { lead: "Smith, J. R", rest: "Title. Publisher, 2020." });
    assert.equal(authorBoundary("Binder, Amy J., and Jeffrey L. Kidder. The Channels.")?.lead, "Binder, Amy J., and Jeffrey L. Kidder");
    assert.equal(authorBoundary("Binder, Amy J. The Channels.")?.lead, "Binder, Amy J");
  });
});
