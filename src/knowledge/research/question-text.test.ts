import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { capitalise, containsPhrase, joinList, normalise, sharedWords, stripEndPunctuation, words } from "./question-text";

describe("question text helpers", () => {
  it("splits text into lower-case words, keeping hyphens and apostrophes inside words", () => {
    assert.deepEqual(words("First-year students' sleep, in Nepal?"), ["first-year", "students", "sleep", "in", "nepal"]);
    assert.deepEqual(words("Élèves à Montréal"), ["élèves", "à", "montréal"]);
    assert.deepEqual(words(""), []);
  });

  it("finds whole phrases regardless of case and spacing", () => {
    assert.ok(containsPhrase("What is the effect of Screen  Time on sleep?", "screen time"));
    assert.ok(containsPhrase("among nurses.", "nurses"));
    assert.ok(!containsPhrase("among nursery staff", "nurse"));
    assert.ok(!containsPhrase("anything", "  "));
    assert.ok(containsPhrase("costs (in £) rose", "(in £)"), "special characters are matched literally");
  });

  it("tidies phrases", () => {
    assert.equal(normalise("  a \n b\t c "), "a b c");
    assert.equal(stripEndPunctuation(" Nepal. "), "Nepal");
    assert.equal(stripEndPunctuation("why?!"), "why");
    assert.equal(capitalise("grounded theory"), "Grounded theory");
  });

  it("joins lists in plain English", () => {
    assert.equal(joinList([]), "");
    assert.equal(joinList(["a"]), "a");
    assert.equal(joinList(["a", "b"]), "a and b");
    assert.equal(joinList(["a", "b", "c"]), "a, b and c");
  });

  it("finds meaningful shared words, ignoring common words and simple plurals", () => {
    assert.deepEqual(sharedWords("How does screen time affect students?", "the screen habits of a student"), ["screen", "students"]);
    assert.deepEqual(sharedWords("What is the level of it?", "the level of it"), ["level"]);
    assert.deepEqual(sharedWords("How and why?", "how and why"), []);
  });
});
