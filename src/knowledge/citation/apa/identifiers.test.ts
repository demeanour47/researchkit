import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { editionLabel, formatPages, isWebAddress, normalizeDoi } from "./identifiers";

describe("normalizeDoi", () => {
  const canonical = "https://doi.org/10.1038/nature14539";
  const accepted: string[] = [
    "10.1038/nature14539",
    "doi:10.1038/nature14539",
    "DOI: 10.1038/nature14539",
    "https://doi.org/10.1038/nature14539",
    "http://dx.doi.org/10.1038/nature14539",
    "https://www.doi.org/10.1038/nature14539",
    "   10.1038/nature14539   ",
  ];
  for (const input of accepted) {
    it(`writes ${JSON.stringify(input)} as a doi.org address`, () => assert.equal(normalizeDoi(input), canonical));
  }

  it("keeps the DOI's own characters", () => {
    assert.equal(normalizeDoi("10.1037/0000165-000"), "https://doi.org/10.1037/0000165-000");
  });

  const rejected = ["", "nature14539", "10.12/abc", "10.1038", "https://example.com/10.1038/nature14539", "11.1038/abc"];
  for (const input of rejected) {
    it(`rejects ${JSON.stringify(input)}`, () => assert.equal(normalizeDoi(input), null));
  }
});

describe("formatPages", () => {
  const cases: Array<[string, string]> = [
    ["436-444", "436–444"],
    ["436 - 444", "436–444"],
    ["436–444", "436–444"],
    ["436—444", "436–444"],
    ["e1234", "e1234"],
    ["12", "12"],
  ];
  for (const [input, expected] of cases) {
    it(`${JSON.stringify(input)} → ${JSON.stringify(expected)}`, () => assert.equal(formatPages(input), expected));
  }
});

describe("editionLabel", () => {
  const cases: Array<[string, string | null]> = [
    ["2", "2nd ed."],
    ["3", "3rd ed."],
    ["4", "4th ed."],
    ["11", "11th ed."],
    ["12", "12th ed."],
    ["13", "13th ed."],
    ["21", "21st ed."],
    ["22", "22nd ed."],
    ["Rev.", "Rev. ed."],
    ["Rev. ed.", "Rev. ed."],
    ["1", null],
    ["", null],
  ];
  for (const [input, expected] of cases) {
    it(`${JSON.stringify(input)} → ${JSON.stringify(expected)}`, () => assert.equal(editionLabel(input), expected));
  }
});

describe("isWebAddress", () => {
  it("accepts http and https addresses", () => {
    assert.equal(isWebAddress("https://www.who.int/news"), true);
    assert.equal(isWebAddress("http://example.org"), true);
  });

  it("rejects anything else", () => {
    for (const input of ["www.who.int", "https://", "ftp://example.org", "not a url", "https://example"]) {
      assert.equal(isWebAddress(input), false, input);
    }
  });
});
