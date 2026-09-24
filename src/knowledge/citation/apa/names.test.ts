import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { citationName, formatAuthorList, initials, referenceName } from "./names";

describe("initials", () => {
  const cases: Array<[string, string]> = [
    ["Yann", "Y."],
    ["Mary Ann", "M. A."],
    ["Jean-Paul", "J.-P."],
    ["J.-P.", "J.-P."],
    ["J.A.", "J. A."],
    ["j a", "J. A."],
    ["  Geoffrey   Everest  ", "G. E."],
    ["Émile", "É."],
    ["Émile", "É."],
    ["", ""],
  ];
  for (const [given, expected] of cases) {
    it(`${JSON.stringify(given)} → ${JSON.stringify(expected)}`, () => assert.equal(initials(given), expected));
  }
});

describe("referenceName", () => {
  it("writes a person as family name, then initials", () => {
    assert.equal(referenceName({ kind: "person", family: "LeCun", given: "Yann" }), "LeCun, Y.");
  });

  it("keeps family-name particles as given", () => {
    assert.equal(referenceName({ kind: "person", family: "van der Berg", given: "Anna" }), "van der Berg, A.");
  });

  it("allows a person with a single name", () => {
    assert.equal(referenceName({ kind: "person", family: "Plato" }), "Plato");
  });

  it("writes an organization in full", () => {
    assert.equal(referenceName({ kind: "organization", name: "  World Health Organization " }), "World Health Organization");
  });

  it("rejects entries without a family or organization name", () => {
    assert.equal(referenceName({ kind: "person", family: " ", given: "Yann" }), null);
    assert.equal(referenceName({ kind: "organization", name: "" }), null);
  });
});

describe("citationName", () => {
  it("uses the family name for people and the full name for organizations", () => {
    assert.equal(citationName({ kind: "person", family: "Hinton", given: "Geoffrey" }), "Hinton");
    assert.equal(citationName({ kind: "organization", name: "World Health Organization" }), "World Health Organization");
  });
});

describe("formatAuthorList", () => {
  const author = (n: number) => `Author${n}, A.`;
  const authors = (count: number) => Array.from({ length: count }, (_, i) => author(i + 1));

  it("lists one author alone", () => assert.equal(formatAuthorList(["Smith, J."]), "Smith, J."));

  it("puts a comma and ampersand between two authors", () => {
    assert.equal(formatAuthorList(["Smith, J.", "Jones, K."]), "Smith, J., & Jones, K.");
  });

  it("lists three authors with an ampersand before the last", () => {
    assert.equal(formatAuthorList(["Smith, J.", "Jones, K.", "Lee, M."]), "Smith, J., Jones, K., & Lee, M.");
  });

  it("lists all 20 authors when there are 20", () => {
    const expected = `${authors(19).join(", ")}, & ${author(20)}`;
    assert.equal(formatAuthorList(authors(20)), expected);
  });

  it("from 21 authors, lists the first 19, an ellipsis and the last, with no ampersand", () => {
    assert.equal(formatAuthorList(authors(21)), `${authors(19).join(", ")}, . . . ${author(21)}`);
    assert.equal(formatAuthorList(authors(25)), `${authors(19).join(", ")}, . . . ${author(25)}`);
  });
});
