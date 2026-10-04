import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getGuide, guideSlugs } from "../../domains/publishing/guides";
import { STYLE_MANUAL_REFERENCES, getReference } from "../research/references";

describe("style manuals in the reference registry", () => {
  const cited = new Set(
    guideSlugs().flatMap((slug) => getGuide(slug)?.sections.flatMap((section) => section.blocks.flatMap((block) => (block.type === "references" ? block.ids : []))) ?? []),
  );

  it("are each cited by a published guide, so none is listed without a purpose", () => {
    for (const reference of STYLE_MANUAL_REFERENCES) assert.ok(cited.has(reference.id), `${reference.id} is unused`);
  });

  it("are formatted as group authors, as APA does", () => {
    for (const reference of STYLE_MANUAL_REFERENCES) {
      assert.ok(reference.apa.startsWith(`${reference.cite.replace(/, \d{4}$/, "")}. (${reference.year}).`), reference.id);
      assert.equal(reference.apa.split("*").length, 3, reference.id);
      assert.equal(getReference(reference.id), reference);
    }
  });
});
