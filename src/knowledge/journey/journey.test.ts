import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { getGuide, guideSlugs } from "../../domains/publishing/guides";
import { getAnalysisMethod } from "../research/data-analysis-types";
import { NEXT_STEPS, nextStepsFor } from "./next-steps";
import { EMPTY_PROGRESS, MAX_IDS, countOf, isEmpty, parseProgress, recordProgress } from "./progress";
import { JOURNEY_STAGES, getJourneyStage, stageOfTool } from "./stages";
import { DEMO_COMPARISONS, DEMO_OUTCOMES, demoAnswers, demoSuggestion } from "./test-demo";

const root = resolve(__dirname, "../../../..");
const toolIds = new Set(
  readdirSync(join(root, "src/tools")).flatMap((folder) => {
    try {
      const id = /TOOL_ID = "([^"]+)"/.exec(readFileSync(join(root, "src/tools", folder, "path.ts"), "utf8"))?.[1];
      return id ? [id] : [];
    } catch {
      return [];
    }
  }),
);
const published = new Set(guideSlugs());

describe("research journey", () => {
  it("has the nine stages in order, with unique ids", () => {
    assert.deepEqual(
      JOURNEY_STAGES.map((stage) => stage.id),
      ["idea", "question", "keywords", "literature", "design", "data", "statistics", "writing", "references"],
    );
  });

  it("links only to tools and guides that exist", () => {
    for (const stage of JOURNEY_STAGES) {
      for (const id of stage.toolIds) assert.ok(toolIds.has(id), `${stage.id} links to unknown tool ${id}`);
      for (const slug of stage.guideSlugs) assert.ok(published.has(slug), `${stage.id} links to unpublished guide ${slug}`);
    }
  });

  it("gives every stage a meaning, a reason and something to read or use", () => {
    for (const stage of JOURNEY_STAGES) {
      assert.ok(stage.meaning.length > 20 && stage.why.length > 20, stage.id);
      assert.ok(stage.toolIds.length + stage.guideSlugs.length > 0, `${stage.id} has no links`);
    }
  });

  it("keeps the idea stage educational: guides only, no tool", () => {
    assert.deepEqual(getJourneyStage("idea")?.toolIds, []);
  });

  it("finds the first stage of a tool, and none for a tool outside the journey", () => {
    assert.equal(stageOfTool("literature-matrix")?.id, "literature");
    assert.equal(stageOfTool("character-counter"), undefined);
  });
});

describe("next steps", () => {
  it("links only to tools and guides that exist, never to the tool itself", () => {
    for (const [toolId, entry] of Object.entries(NEXT_STEPS)) {
      assert.ok(toolIds.has(toolId), `unknown tool ${toolId}`);
      assert.ok(entry.toolIds.length + entry.guideSlugs.length > 0, toolId);
      for (const id of entry.toolIds) {
        assert.ok(toolIds.has(id), `${toolId} → unknown tool ${id}`);
        assert.notEqual(id, toolId);
      }
      for (const slug of entry.guideSlugs) assert.ok(published.has(slug), `${toolId} → unpublished guide ${slug}`);
    }
  });

  it("gives the requested next steps for the four named tools", () => {
    assert.deepEqual(nextStepsFor("literature-explorer")?.toolIds, ["literature-matrix", "reference-checker"]);
    assert.ok(nextStepsFor("statistical-test-finder")?.toolIds.includes("power-analysis"));
    assert.ok(nextStepsFor("apa-citation-generator")?.toolIds.includes("reference-checker"));
    assert.ok(nextStepsFor("readability-checker")?.toolIds.includes("sentence-counter"));
  });

  it("derives steps from the following stage for a tool without its own entry", () => {
    const steps = nextStepsFor("research-design-builder");
    assert.ok(steps && steps.toolIds.every((id) => getJourneyStage("data")?.toolIds.includes(id)));
  });

  it("offers nothing for the last stage or a tool outside the journey", () => {
    assert.equal(nextStepsFor("reference-checker")?.toolIds.includes("literature-matrix"), true);
    assert.equal(nextStepsFor("citation-style-finder"), null);
    assert.equal(nextStepsFor("not-a-tool"), null);
  });

  it("only derives steps whose guides are published", () => {
    for (const stage of JOURNEY_STAGES) for (const id of stage.toolIds) for (const slug of nextStepsFor(id)?.guideSlugs ?? []) assert.ok(getGuide(slug), slug);
  });
});

describe("test demo", () => {
  it("answers every combination from the finder's own logic", () => {
    for (const comparison of DEMO_COMPARISONS) {
      for (const outcome of DEMO_OUTCOMES) {
        const suggestion = demoSuggestion(comparison.value, outcome.value);
        const handsOver = comparison.value === "paired" && outcome.value === "categorical";
        assert.equal(suggestion.status, handsOver ? "open-finder" : "suggestion", `${comparison.value} / ${outcome.value}`);
        if (suggestion.status === "suggestion") for (const method of suggestion.methods) assert.ok(getAnalysisMethod(method).name);
      }
    }
  });

  it("suggests the independent-samples t-test for two separate groups and a numeric outcome", () => {
    const suggestion = demoSuggestion("two-independent", "numeric");
    assert.equal(suggestion.status === "suggestion" && suggestion.methods.includes("independent-t-test"), true);
  });

  it("suggests ANOVA for three groups, and the paired t-test for the same people twice", () => {
    const three = demoSuggestion("three-independent", "numeric");
    const paired = demoSuggestion("paired", "numeric");
    assert.equal(three.status === "suggestion" && three.methods.includes("one-way-anova"), true);
    assert.equal(paired.status === "suggestion" && paired.methods.includes("paired-t-test"), true);
  });

  it("maps the answers to a finder situation", () => {
    assert.equal(demoAnswers("paired", "numeric").comparison, "paired");
    assert.equal(demoAnswers("three-independent", "categorical").groups, "three-plus");
  });
});

describe("session progress", () => {
  it("starts empty and records each id once", () => {
    let progress = recordProgress(EMPTY_PROGRESS, "tools", "word-counter");
    progress = recordProgress(progress, "tools", "word-counter");
    progress = recordProgress(progress, "guides", "how-to-paraphrase");
    assert.equal(countOf(progress, "tools"), 1);
    assert.equal(countOf(progress, "guides"), 1);
    assert.equal(isEmpty(EMPTY_PROGRESS), true);
    assert.equal(isEmpty(progress), false);
  });

  it("returns the same object when nothing changes", () => {
    const progress = recordProgress(EMPTY_PROGRESS, "tools", "word-counter");
    assert.equal(recordProgress(progress, "tools", "word-counter"), progress);
    assert.equal(recordProgress(progress, "tools", "Not A Valid Id!"), progress);
  });

  it("reads stored progress defensively", () => {
    assert.deepEqual(parseProgress(null), EMPTY_PROGRESS);
    assert.deepEqual(parseProgress("not json"), EMPTY_PROGRESS);
    assert.deepEqual(parseProgress("42"), EMPTY_PROGRESS);
    assert.deepEqual(parseProgress(JSON.stringify({ tools: ["a-tool", 7, "<script>", "a-tool"], guides: "x" })), { tools: ["a-tool"], guides: [], challenges: [] });
  });

  it("bounds how many ids are kept", () => {
    const many = Array.from({ length: MAX_IDS + 50 }, (_, index) => `id-${index}`);
    assert.equal(parseProgress(JSON.stringify({ tools: many })).tools.length, MAX_IDS);
  });
});
