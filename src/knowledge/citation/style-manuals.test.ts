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

  it("are formatted in APA, a group author in full and named authors by surname and initials", () => {
    for (const reference of STYLE_MANUAL_REFERENCES) {
      const authors = reference.cite.replace(/, \d{4}$/, "");
      if (authors.includes(" & ")) {
        const surnames = authors.split(" & ");
        assert.match(reference.apa, new RegExp(`^${surnames[0]}, [A-Z]\\., & ${surnames[1]}, [A-Z]\\. \\(${reference.year}\\)\\.`), reference.id);
      } else {
        assert.ok(reference.apa.startsWith(`${authors}. (${reference.year}).`), reference.id);
      }
      assert.equal(reference.apa.split("*").length, 3, reference.id);
      assert.equal(getReference(reference.id), reference);
    }
  });
});
