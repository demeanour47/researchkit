import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RESEARCH_STAGES } from "../../domains/catalogue/guide-plan";
import { JOURNEY_STAGES } from "../journey/stages";
import { MODULES, MODULE_IDS, moduleForTool } from "../workspace/modules";
import { PROJECT_TYPES, STAGE_DEFINITIONS, STAGE_IDS, GUIDE_PHASE_COVERS, MODULE_STAGE, TRACKER_STAGE_COVERS, buildJourney, createProjectState } from "./index";
import { createProjectDraft } from "../research/research-project";

const canonical = new Set<string>(STAGE_IDS);
const unique = (ids: readonly string[]) => new Set(ids).size === ids.length;

describe("research stage vocabulary", () => {
  it("has no duplicate canonical stage ids, and keeps the required stages", () => {
    assert.ok(unique(STAGE_IDS), "STAGE_IDS has a duplicate");
    for (const id of ["topic", "literature", "questions", "design", "analysis", "writing", "references", "final-review", "final-output"]) {
      assert.ok(canonical.has(id), `required stage "${id}" was removed`);
    }
  });

  it("defines every canonical stage exactly once, and nothing else", () => {
    const ids = STAGE_DEFINITIONS.map((stage) => stage.id);
    assert.ok(unique(ids), "a stage is defined twice");
    assert.deepEqual([...ids].sort(), [...STAGE_IDS].sort());
  });

  it("resolves every project type to a journey of canonical stages", () => {
    for (const type of PROJECT_TYPES) {
      const journey = buildJourney(createProjectDraft(), createProjectState(type));
      assert.ok(journey.nodes.length > 0, type);
      for (const node of journey.nodes) assert.ok(canonical.has(node.id), `${type}: unknown stage "${node.id}"`);
    }
  });

  it("maps every workspace module, and so every tool, to a canonical stage", () => {
    assert.deepEqual(Object.keys(MODULE_STAGE).sort(), [...MODULE_IDS].sort(), "MODULE_STAGE must cover every module id");
    for (const [moduleId, stage] of Object.entries(MODULE_STAGE)) assert.ok(canonical.has(stage), `module "${moduleId}" maps to unknown stage "${stage}"`);
    for (const entry of MODULES) {
      if (entry.toolId) assert.ok(canonical.has(MODULE_STAGE[moduleForTool(entry.toolId)!.id]), `tool "${entry.toolId}" has no canonical stage`);
    }
  });

  it("maps every progress-tracker stage to canonical stages, covering all of them", () => {
    assertCovers(JOURNEY_STAGES.map((stage) => stage.id), TRACKER_STAGE_COVERS, "tracker stage");
  });

  it("maps every Learn guide phase to canonical stages, covering all of them", () => {
    assert.ok(unique(RESEARCH_STAGES.map((stage) => stage.id)));
    assertCovers(RESEARCH_STAGES.map((stage) => stage.id), GUIDE_PHASE_COVERS, "guide phase");
  });
});

function assertCovers(ids: readonly string[], covers: Readonly<Record<string, readonly string[]>>, label: string) {
  assert.deepEqual(Object.keys(covers).sort(), [...ids].sort(), `${label} map must list exactly the ${label}s`);
  const seen = new Set<string>();
  for (const [id, stages] of Object.entries(covers)) {
    for (const stage of stages) {
      assert.ok(canonical.has(stage), `${label} "${id}" maps to unknown stage "${stage}"`);
      seen.add(stage);
    }
  }
  for (const id of STAGE_IDS) assert.ok(seen.has(id), `canonical stage "${id}" is not covered by any ${label}`);
}
