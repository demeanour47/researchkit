import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { getReference } from "../../knowledge/research/references";
import { getGuide, guidePath, guideSlugs } from "../publishing/guides";
import { GUIDE_CATEGORIES, GUIDE_PLAN, RESEARCH_STAGES } from "./guide-plan";

// Tool ids and addresses, read from each tool's path module so the test needs no path alias.
const root = resolve(__dirname, "../../../..");
const tools = readdirSync(join(root, "src/tools")).flatMap((folder) => {
  try {
    const source = readFileSync(join(root, "src/tools", folder, "path.ts"), "utf8");
    const id = /TOOL_ID = "([^"]+)"/.exec(source)?.[1];
    const path = /TOOL_PATH = "([^"]+)"/.exec(source)?.[1];
    return id && path ? [{ id, path }] : [];
  } catch {
    return [];
  }
});
const toolIds = new Set(tools.map((tool) => tool.id));
const toolPaths = new Set(tools.map((tool) => tool.path));

const published = guideSlugs().map((slug) => getGuide(slug)!);
const placed = (slug: string) => GUIDE_PLAN.find((entry) => entry.slug === slug);

describe("guide plan", () => {
  it("finds the tools to check against", () => {
    assert.ok(tools.length >= 30, `found ${tools.length} tools`);
  });

  it("places every published guide exactly once, and no guide twice", () => {
    const slugs = GUIDE_PLAN.map((entry) => entry.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicate slug in the plan");
    for (const guide of published) assert.ok(placed(guide.slug), `${guide.slug} is published but not in the plan`);
  });

  it("lists a guide as coming soon only while it is unpublished", () => {
    for (const entry of GUIDE_PLAN) {
      if (entry.planned) assert.equal(getGuide(entry.slug), undefined, `${entry.slug} is published but still listed as coming soon`);
      else assert.ok(getGuide(entry.slug), `${entry.slug} isn't planned, so it must be published`);
    }
  });

  it("has guides in every category and every research stage", () => {
    for (const category of GUIDE_CATEGORIES) assert.ok(GUIDE_PLAN.some((entry) => entry.category === category.id && !entry.planned), category.id);
    for (const stage of RESEARCH_STAGES) assert.ok(GUIDE_PLAN.some((entry) => entry.stage === stage.id && !entry.planned), stage.id);
    assert.equal(new Set(RESEARCH_STAGES.map((stage) => stage.id)).size, RESEARCH_STAGES.length);
  });
});

describe("published guides", () => {
  it("have unique, well-formed slugs and addresses", () => {
    for (const guide of published) {
      assert.match(guide.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, guide.slug);
      assert.equal(guidePath(guide.slug), `/learn/${guide.slug}`);
    }
    assert.equal(new Set(published.map((guide) => guide.slug)).size, published.length);
  });

  it("have unique titles and descriptions, of a length search results can show", () => {
    assert.equal(new Set(published.map((guide) => guide.title.toLowerCase())).size, published.length, "duplicate title");
    assert.equal(new Set(published.map((guide) => guide.description)).size, published.length, "duplicate description");
    for (const guide of published) {
      assert.ok(guide.title.length > 0 && guide.title.length <= 70, `${guide.slug} title length ${guide.title.length}`);
      assert.ok(guide.description.length >= 70 && guide.description.length <= 320, `${guide.slug} description length ${guide.description.length}`);
      assert.ok(guide.summary.length >= 100, `${guide.slug} summary`);
      assert.match(guide.updated, /^\d{4}-\d{2}-\d{2}$/, guide.slug);
      assert.ok(!Number.isNaN(Date.parse(guide.updated)), guide.slug);
    }
  });

  it("have substantive content: several sections, unique section ids, and questions answered", () => {
    for (const guide of published) {
      assert.ok(guide.sections.length >= 6, `${guide.slug} has ${guide.sections.length} sections`);
      const ids = guide.sections.map((section) => section.id);
      assert.equal(new Set(ids).size, ids.length, `${guide.slug} repeats a section id`);
      for (const section of guide.sections) assert.ok(section.heading.trim() && section.blocks.length > 0, `${guide.slug}#${section.id}`);
      assert.ok(guide.faq.length >= 3, `${guide.slug} has ${guide.faq.length} questions`);
    }
  });

  it("contain no placeholder text", () => {
    for (const guide of published) assert.doesNotMatch(JSON.stringify(guide), /\b(?:TODO|TBD|FIXME|lorem ipsum|XXX)\b|coming soon/i, guide.slug);
  });

  it("link only to tools that exist, and to at least one", () => {
    for (const guide of published) {
      assert.ok(guide.relatedToolIds.length > 0, `${guide.slug} has no related tool`);
      for (const id of guide.relatedToolIds) assert.ok(toolIds.has(id), `${guide.slug} links to unknown tool ${id}`);
    }
  });

  it("link to other published guides, never to themselves", () => {
    for (const guide of published) {
      assert.ok(guide.relatedGuideSlugs.length > 0, `${guide.slug} has no related guide`);
      assert.equal(new Set(guide.relatedGuideSlugs).size, guide.relatedGuideSlugs.length, `${guide.slug} repeats a related guide`);
      for (const slug of guide.relatedGuideSlugs) {
        assert.notEqual(slug, guide.slug, `${guide.slug} lists itself`);
        assert.ok(getGuide(slug), `${guide.slug} links to unpublished guide ${slug}`);
      }
    }
  });

  it("are reachable from at least one other guide", () => {
    const linked = new Set(published.flatMap((guide) => guide.relatedGuideSlugs));
    for (const guide of published) assert.ok(linked.has(guide.slug), `${guide.slug} isn't a related guide anywhere`);
  });

  it("only link to internal addresses that exist", () => {
    for (const guide of published) {
      for (const block of guide.sections.flatMap((section) => section.blocks)) {
        if (block.type !== "links") continue;
        for (const { href } of block.items) {
          const path = href.split("#")[0];
          if (/^https:\/\//.test(href)) continue;
          if (path.startsWith("/learn/")) assert.ok(getGuide(path.slice("/learn/".length)), `${guide.slug} links to ${href}`);
          else if (path.startsWith("/tools/")) assert.ok(toolPaths.has(path), `${guide.slug} links to ${href}`);
          else assert.ok(["/workspace", "/learn", "/tools", "/styles"].includes(path), `${guide.slug} links to ${href}`);
        }
      }
    }
  });

  it("cite only registered references, each once", () => {
    for (const guide of published) {
      const ids = guide.sections.flatMap((section) => section.blocks.flatMap((block) => (block.type === "references" ? block.ids : [])));
      assert.equal(new Set(ids).size, ids.length, `${guide.slug} lists a reference twice`);
      for (const id of ids) assert.doesNotThrow(() => getReference(id), `${guide.slug} cites unknown reference ${id}`);
    }
  });
});

describe("tools and guides", () => {
  it("give every tool at least one guide, so each tool page links to Learn", () => {
    const covered = new Set(published.flatMap((guide) => guide.relatedToolIds));
    const missing = [...toolIds].filter((id) => !covered.has(id));
    assert.deepEqual(missing, [], `tools without a guide: ${missing.join(", ")}`);
  });
});
