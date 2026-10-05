import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToMeetAWordLimit as guide } from "../../../content/guides/how-to-meet-a-word-limit";
import { proseOf, tableOf } from "../../domains/publishing/guide-checks";
import { countWords } from "./text-statistics";

describe("How to meet a word limit guide", () => {
  it("counts the examples exactly as the Word Counter does", () => {
    for (const [text, words] of tableOf(guide, "How the Word Counter counts").rows) {
      const sample = text.replace(/ \(a dash on its own\)$/, "");
      assert.equal(String(countWords(sample)), words, text);
    }
  });

  it("gives the Word Counter's counts for every before-and-after pair", () => {
    for (const [wordy, concise, words] of tableOf(guide, "Wordy and concise").rows) {
      assert.equal(words, `${countWords(wordy)} → ${countWords(concise)}`, wordy);
      assert.ok(countWords(concise) < countWords(wordy), concise);
    }
    for (const [version, text, words] of tableOf(guide, "A paragraph before and after").rows) assert.equal(words, String(countWords(text)), version);
  });

  it("doesn't start an example sentence with a numeral, which APA avoids", () => {
    for (const [wordy, concise] of tableOf(guide, "Wordy and concise").rows) for (const sentence of [wordy, concise]) assert.doesNotMatch(sentence, /^\d/, sentence);
  });

  it("leaves what counts towards a limit to the institution, without claiming a universal rule", () => {
    const prose = proseOf(guide);
    assert.match(prose, /Institutions and even individual assignments differ on what is included/);
    assert.doesNotMatch(prose, /\b(?:never|always) count/i);
  });

  it("labels its example citations as invented", () => {
    assert.match(proseOf(guide), /The citations in these examples are invented/);
  });
});
