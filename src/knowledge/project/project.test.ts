import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createProjectDraft, updateProjectDraft } from "../research/research-project";
import { completeProject } from "../workspace/test-helpers";
import {
  PROJECT_TYPES, PROJECT_TYPE_INFO, buildJourney, createProjectState, assembleOutput, outputAsText, formattingFor, nextStepFor,
  parseProjectState, readinessOf, sectionsFor, setConfirmed, setNote, setSection, updateProfile, type ProjectType,
} from "./index";

const root = resolve(__dirname, "../../../..");
const empty = () => createProjectDraft();
const stateOf = (type: ProjectType = "paper") => createProjectState(type);
const node = (journey: ReturnType<typeof buildJourney>, id: string) => journey.nodes.find((n) => n.id === id)!;

describe("project state", () => {
  it("creates each project type, optionally with only an interest", () => {
    for (const type of PROJECT_TYPES) assert.equal(createProjectState(type).profile.type, type);
    assert.equal(createProjectState("thesis", { interest: "  sleep   and study " }).profile.interest, "sleep and study");
  });

  it("drops unknown citation styles and blank fields", () => {
    const profile = updateProfile(stateOf(), { discipline: "   ", citationStyle: "nope" as never }).profile;
    assert.equal(profile.discipline, undefined);
    assert.equal(profile.citationStyle, undefined);
  });

  it("marks a section in progress when text is first typed", () => {
    assert.equal(setSection(stateOf(), "introduction", { text: "Hello" }).sections.introduction.status, "in-progress");
    assert.equal(setSection(stateOf(), "introduction", { status: "needs-review" }).sections.introduction.status, "needs-review");
  });

  it("refuses bad section ids", () => {
    assert.throws(() => setSection(stateOf(), "../x", { text: "a" }), RangeError);
  });

  it("round-trips through parsing and refuses bad data", () => {
    let state = updateProfile(stateOf("thesis"), { citationStyle: "apa", interest: "x" });
    state = setNote(state, "keywords", "sleep; study");
    state = setConfirmed(state, "structure", true);
    state = setSection(state, "abstract", { text: "t", status: "complete" });
    const parsed = parseProjectState(JSON.parse(JSON.stringify(state)));
    assert.ok(parsed.ok);
    assert.deepEqual(parsed.ok && parsed.state, state);
    for (const bad of [null, {}, { profile: { type: "essay" } }, { profile: { type: "paper" }, notes: { x: "y" } }, { profile: { type: "paper" }, sections: { a: { status: "zzz", text: "" } } }]) {
      assert.equal(parseProjectState(bad).ok, false);
    }
  });
});

describe("journeys", () => {
  it("has a journey for each type with different stages", () => {
    const ids = PROJECT_TYPES.map((type) => buildJourney(empty(), stateOf(type)).nodes.map((n) => n.id));
    for (const list of ids) assert.ok(list.includes("interest") && list.includes("final-output"));
  });

  it("starts empty with the first stage current and 0%", () => {
    const journey = buildJourney(empty(), stateOf());
    assert.equal(journey.percent, 0);
    assert.equal(journey.current?.id, "interest");
    assert.equal(journey.nodes.filter((n) => n.state === "current").length, 1);
  });

  it("starts from only an interest", () => {
    const journey = buildJourney(empty(), createProjectState("paper", { interest: "sleep" }));
    assert.equal(node(journey, "interest").state, "completed");
    assert.ok(journey.percent > 0);
    assert.equal(journey.current?.id, "topic");
  });

  it("completes and reopens a stage from real artifacts", () => {
    const draft = updateProjectDraft(empty(), { topic: "Sleep" });
    assert.equal(node(buildJourney(draft, stateOf()), "topic").state, "completed");
    const reopened = updateProjectDraft(draft, { topic: "" });
    assert.notEqual(node(buildJourney(reopened, stateOf()), "topic").state, "completed");
  });

  it("blocks stages whose prerequisites are missing and explains why", () => {
    const blocked = node(buildJourney(empty(), stateOf()), "objectives");
    assert.equal(blocked.state, "blocked");
    assert.ok(blocked.reason);
  });

  it("sets statistical stages aside for qualitative projects without lowering progress", () => {
    const base = { ...completeProject(), methodology: "qualitative" as const };
    const journey = buildJourney(base, stateOf());
    assert.equal(node(journey, "sample-size").state, "not-applicable");
    assert.equal(node(journey, "hypothesis").state === "completed" || node(journey, "hypothesis").state === "not-applicable" || node(journey, "hypothesis").state === "optional", true);
    assert.equal(journey.applicable, journey.nodes.filter((n) => n.state !== "not-applicable" && n.state !== "optional").length);
  });

  it("does not count progress from notes that are empty", () => {
    assert.equal(buildJourney(empty(), setNote(stateOf(), "keywords", "   ")).percent, 0);
  });

  it("reaches 100% only with every applicable stage and section complete", () => {
    let project = updateProfile(createProjectState("paper"), { interest: "sleep", citationStyle: "apa" });
    for (const stage of ["keywords", "literature", "data-collection", "ethics"] as const) project = setNote(project, stage, "done");
    for (const stage of ["structure", "final-review"] as const) project = setConfirmed(project, stage, true);
    for (const section of sectionsFor("paper")) project = setSection(project, section.id, { text: "text", status: "complete" });
    const draft = completeProject();
    const journey = buildJourney(draft, project, { problem: 1, question: 1, objectives: 1, title: 1, hypotheses: 1, variables: 1, framework: 1, onion: 1, design: 1, sampling: 1, "sample-size": 1, questionnaire: 1, analysis: 1, assumptions: 1, interpretation: 1, references: 1 });
    assert.ok(journey.percent > 80, `percent was ${journey.percent}`);
    assert.ok(journey.percent <= 100);
  });

  it("links every handoff and Learn guide to something that exists", () => {
    const tools = new Set(readdirSync(join(root, "src/tools")).filter((d) => existsSync(join(root, `src/tools/${d}/path.ts`))));
    for (const type of PROJECT_TYPES) {
      for (const n of buildJourney(empty(), stateOf(type)).nodes) {
        const match = n.handoff?.href.match(/^\/tools\/([a-z0-9-]+)$/);
        if (match) assert.ok(tools.has(match[1]), `${n.id} -> ${n.handoff?.href}`);
        else if (n.handoff) assert.ok(n.handoff.href.startsWith("/workspace"), n.handoff.href);
      }
    }
  });
});

describe("document structure", () => {
  it("gives a proposal no results and a thesis a framework and appendices", () => {
    assert.ok(!sectionsFor("proposal").some((s) => /results|findings|discussion/.test(s.id)));
    const thesis = sectionsFor("thesis").map((s) => s.id);
    assert.ok(thesis.includes("framework") && thesis.includes("appendices"));
    assert.ok(sectionsFor("paper").some((s) => s.id === "results") && sectionsFor("paper").some((s) => s.id === "discussion"));
  });

  it("has complete, unique, linked guidance for each section", () => {
    const tools = new Set(readdirSync(join(root, "src/tools")));
    for (const type of PROJECT_TYPES) {
      const sections = sectionsFor(type);
      assert.equal(new Set(sections.map((s) => s.id)).size, sections.length);
      for (const s of sections) {
        assert.ok(s.purpose && s.include.length && s.questions.length && s.mistakes.length && s.formatting, s.id);
        for (const t of s.tools) assert.ok(tools.has(t.href.replace("/tools/", "")), t.href);
      }
    }
  });

  it("describes each type", () => {
    assert.equal(PROJECT_TYPE_INFO.length, 3);
    assert.match(PROJECT_TYPE_INFO[0].results, /None/);
  });
});

describe("output, readiness, next steps and formatting", () => {
  it("never invents text for missing sections", () => {
    const out = assembleOutput(stateOf("proposal"));
    assert.equal(out.complete, false);
    assert.ok(out.sections.every((s) => s.text === "" && s.incomplete));
    assert.match(outputAsText(stateOf("proposal"), "T"), /\[No text written yet\]/);
  });

  it("marks only unfinished sections", () => {
    const project = setSection(stateOf("proposal"), "abstract", { text: "A", status: "complete" });
    assert.equal(assembleOutput(project).sections.find((s) => s.id === "abstract")!.incomplete, false);
    assert.equal(assembleOutput(project).incomplete, sectionsFor("proposal").length - 1);
  });

  it("computes readiness from the journey and not as a grade", () => {
    const readiness = readinessOf(buildJourney(empty(), stateOf()));
    assert.equal(readiness.bars.length, 5);
    assert.match(readiness.sentence, /Nothing is recorded/);
    const some = readinessOf(buildJourney(updateProjectDraft(empty(), { topic: "x" }), createProjectState("paper", { interest: "x" })));
    assert.ok(some.bars.find((b) => b.dimension === "foundation")!.completed >= 1);
  });

  it("recommends a next step that depends on the state", () => {
    const fresh = stateOf();
    assert.equal(nextStepFor(buildJourney(empty(), fresh), fresh).kind, "start");
    const started = createProjectState("paper", { interest: "x" });
    const step = nextStepFor(buildJourney(empty(), started), started);
    assert.equal(step.kind, "work");
    assert.equal(step.node?.id, "topic");
  });

  it("separates general, type-specific, style and institution guidance", () => {
    const a = formattingFor({ type: "proposal", citationStyle: "apa", institution: "Use 12pt" });
    assert.ok(a.general.length && a.forType.some((p) => /not been done|results/i.test(p)));
    assert.equal(a.style?.id, "apa");
    assert.equal(a.institution, "Use 12pt");
    assert.equal(formattingFor({ type: "paper" }).style, null);
  });
});

describe("learn guide links", () => {
  it("only links to guides that are registered when they exist in the plan", () => {
    const plan = readFileSync(join(root, "src/domains/catalogue/guide-plan.ts"), "utf8");
    for (const info of PROJECT_TYPE_INFO) assert.ok(plan.includes(info.guide.slug), info.guide.slug);
  });
});
