import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToChooseAStatisticalTest } from "../../../../content/guides/how-to-choose-a-statistical-test";
import { spssFromDataPreparationToReporting } from "../../../../content/guides/spss-from-data-preparation-to-reporting";
import { getReference, STATISTICS_REFERENCES } from "../references";

describe("Statistical Test Finder references", () => {
  it("registers unique, complete APA references that resolve through the shared registry", () => {
    assert.equal(new Set(STATISTICS_REFERENCES.map((reference) => reference.id)).size, STATISTICS_REFERENCES.length);
    for (const reference of STATISTICS_REFERENCES) {
      assert.ok(reference.apa.includes(`(${reference.year}).`), reference.id);
      assert.ok(reference.apa.endsWith("."), reference.id);
      assert.equal(getReference(reference.id), reference);
    }
  });

  it("cites every registered statistics source in the guide and lists it under references", () => {
    const guides = [howToChooseAStatisticalTest, spssFromDataPreparationToReporting];
    const blocks = guides.flatMap((guide) => guide.sections.flatMap((section) => section.blocks));
    const paragraphs = blocks.filter((block) => block.type === "paragraph").map((block) => block.text);
    const cited = new Set(paragraphs.flatMap((paragraph) => STATISTICS_REFERENCES.filter((reference) => paragraph.includes(reference.cite)).map((reference) => reference.id)));
    const listed = new Set(blocks.filter((block) => block.type === "references").flatMap((block) => block.ids));

    for (const reference of STATISTICS_REFERENCES) {
      assert.ok(cited.has(reference.id), `${reference.id} is not cited in the guide text`);
      assert.ok(listed.has(reference.id), `${reference.id} is not listed in the guide references`);
    }
  });
});