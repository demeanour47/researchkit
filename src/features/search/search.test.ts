import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalize, queryWords, searchItems } from "./match";
import type { SearchItem } from "./types";

const item = (id: string, title: string, description = "", group: SearchItem["group"] = "Tools", keywords?: string): SearchItem => ({ id, title, description, href: `/${id}`, group, icon: "search", keywords });

const ITEMS = [
  item("wc", "Word Counter", "Counts words, characters and paragraphs."),
  item("apa", "APA Citation Generator", "Formats references in APA Style, 7th edition.", "Tools", "Citation"),
  item("guide", "How to choose a citation style", "Who decides which style you use.", "Guides"),
  item("apa-style", "APA Style", "The American Psychological Association's style.", "Citation styles"),
  item("prisma", "PRISMA Flow Diagram Builder", "Draws flow diagrams and counts records for systematic reviews.", "Tools", "Research"),
];

describe("normalize", () => {
  it("lowers case and removes accents", () => {
    assert.equal(normalize("Méthode ÉTUDE"), "methode etude");
  });
  it("splits a query into words, ignoring punctuation and spaces", () => {
    assert.deepEqual(queryWords("  APA, 7th-edition "), ["apa", "7th", "edition"]);
    assert.deepEqual(queryWords("   "), []);
  });
});

describe("searchItems", () => {
  it("returns everything, in order, for a blank query", () => {
    assert.deepEqual(searchItems(ITEMS, "").map((entry) => entry.id), ["wc", "apa", "guide", "apa-style", "prisma"]);
  });
  it("needs every word to appear", () => {
    assert.deepEqual(searchItems(ITEMS, "apa generator").map((entry) => entry.id), ["apa"]);
    assert.deepEqual(searchItems(ITEMS, "apa nothing"), []);
  });
  it("puts title matches before description matches", () => {
    assert.deepEqual(searchItems(ITEMS, "citation").map((entry) => entry.id), ["apa", "guide", "apa-style"]);
  });
  it("puts titles starting with the word before titles merely containing it", () => {
    const items = [item("sub", "Subquestion Finder"), item("q", "Questionnaire Builder")];
    assert.deepEqual(searchItems(items, "question").map((entry) => entry.id), ["q", "sub"]);
  });
  it("matches keywords and groups", () => {
    assert.deepEqual(searchItems(ITEMS, "research").map((entry) => entry.id), ["prisma"]);
    assert.deepEqual(searchItems(ITEMS, "guides").map((entry) => entry.id), ["guide"]);
  });
  it("ignores case and accents in the query", () => {
    assert.deepEqual(searchItems(ITEMS, "PRÍSMA").map((entry) => entry.id), ["prisma"]);
  });
  it("finds partial words, as people type", () => {
    assert.deepEqual(searchItems(ITEMS, "coun").map((entry) => entry.id), ["wc", "prisma"]);
  });
});
