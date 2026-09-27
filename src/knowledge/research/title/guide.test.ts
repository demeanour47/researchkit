/** The title guide's content: every citation is listed, every listed work is cited, and its examples come from the knowledge layer. */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToWriteAGoodResearchTitle as guide } from "../../../../content/guides/how-to-write-a-good-research-title";
import { getReference } from "../references";

const text = [
  guide.summary,
  ...guide.sections.flatMap((section) => section.blocks.flatMap((block) => (block.type === "paragraph" ? [block.text] : block.type === "list" ? block.items : []))),
  ...guide.faq.flatMap((entry) => [entry.question, entry.answer]),
].join(" ");
const listed = guide.sections.flatMap((section) => section.blocks.flatMap((block) => (block.type === "references" ? block.ids : [])));

describe("How to write a good research title", () => {
  it("covers every topic the guide promises", () => {
    const headings = guide.sections.map((section) => section.id);
    for (const id of ["definition", "purpose", "characteristics", "structure", "variables", "population", "location", "design", "length", "patterns", "weak-and-strong", "examples-nepal", "examples-global", "checklist", "mistakes", "references"]) assert.ok(headings.includes(id), id);
    assert.ok(guide.faq.length >= 4);
  });

  it("lists every work it cites, and cites every work it lists", () => {
    for (const id of listed) {
      const reference = getReference(id);
      const author = reference.cite.replace(/, \d{4}$/, "").replace(" et al.", "").split(" & ")[0];
      assert.ok(text.includes(author) && text.includes(String(reference.year)), `${id} is listed but not cited`);
    }
    for (const [, author, year] of text.matchAll(/([A-Z][a-z]+)(?: (?:and|&) [A-Z][a-z]+| et al\.)?,? \(?(\d{4})\)?/g)) {
      if (!/^(?:Grade|Stage|Title)$/.test(author)) assert.ok(listed.some((id) => getReference(id).cite.includes(author) && getReference(id).year === Number(year)), `${author} ${year} is cited but not listed`);
    }
  });

  it("links the related methodology tools and the workspace", () => {
    assert.deepEqual([...guide.relatedToolIds].sort(), ["hypothesis-builder", "research-question-builder", "research-title-builder", "variables-builder"]);
    const links = guide.sections.flatMap((section) => section.blocks.flatMap((block) => (block.type === "links" ? block.items.map((item) => item.href) : [])));
    assert.ok(links.includes("/workspace"));
  });

  it("teaches with the knowledge layer's examples, from Nepal and elsewhere", () => {
    const regions = guide.sections.flatMap((section) => section.blocks.flatMap((block) => (block.type === "title-examples" ? [block.region] : [])));
    assert.deepEqual(regions, ["nepal", "global"]);
  });
});
