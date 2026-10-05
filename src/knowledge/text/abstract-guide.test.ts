import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToWriteAnAbstract as guide } from "../../../content/guides/how-to-write-an-abstract";
import { citationProblems, proseOf, tableOf } from "../../domains/publishing/guide-checks";
import { GROUP_REFERENCES, LEARN_REFERENCES } from "../research/references";
import { analyseText } from "./text-statistics";

const section = guide.sections.find((entry) => entry.id === "worked-example")!;
const example = section.blocks.find((block) => block.type === "paragraph" && block.text.startsWith("Homestay tourism"));

describe("How to write an abstract guide", () => {
  it("states the example's length as the Word Counter counts it, within APA's 250-word limit", () => {
    assert.ok(example && example.type === "paragraph");
    const counts = analyseText(example.text);
    assert.match(proseOf(guide), new RegExp(`It is ${counts.words} words and ${counts.charactersWithSpaces} characters including spaces, as the Word Counter counts them`));
    assert.ok(counts.words <= 250);
  });

  it("explains each sentence of the example", () => {
    assert.ok(example && example.type === "paragraph");
    assert.equal(tableOf(guide, "What each sentence of the example does").rows.length, analyseText(example.text).sentences);
  });

  it("labels the example as invented", () => {
    assert.match(proseOf(guide), /This is an invented abstract for a hypothetical study; its findings aren't real/);
  });

  it("cites the guidance it follows", () => {
    assert.deepEqual(citationProblems(guide, [...LEARN_REFERENCES, ...GROUP_REFERENCES].map((reference) => reference.id)), []);
  });
});
