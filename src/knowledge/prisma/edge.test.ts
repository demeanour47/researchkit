import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { layoutDiagram } from "../diagrams/layout";
import { DEFAULT_LAYOUT_OPTIONS } from "../diagrams/types";
import { EDGE_IDS, defaultLabels, prismaDiagram } from "./diagram";
import { computeFlow } from "./flow";
import { WITH_OTHER_METHODS } from "./test-helpers";
import { EMPTY_PRISMA_INPUT, LABEL_KEYS, type PrismaInput } from "./types";
import { prismaIssues } from "./validate";

/** A small deterministic generator, so the generated reviews are the same on every run. */
function random(seed: number) {
  let state = seed;
  return (max: number) => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return Math.floor((state / 2147483648) * (max + 1));
  };
}

/** A consistent review built forwards from random numbers: every stage follows from the one before. */
function generatedReview(seed: number): PrismaInput {
  const next = random(seed);
  const databases = 50 + next(5000);
  const registers = next(200);
  const duplicates = next(Math.floor((databases + registers) / 3));
  const screened = databases + registers - duplicates;
  const screenedExcluded = next(screened);
  const sought = screened - screenedExcluded;
  const notRetrieved = next(Math.floor(sought / 5));
  const assessed = sought - notRetrieved;
  const excludedA = next(assessed);
  const excludedB = next(assessed - excludedA);
  const reports = assessed - excludedA - excludedB;
  return {
    ...EMPTY_PRISMA_INPUT,
    databases: [{ id: "db", name: "Databases", count: databases }],
    registers: [{ id: "rg", name: "Registers", count: registers }],
    duplicates,
    automation: 0,
    removedOther: 0,
    screenedExcluded,
    notRetrieved,
    reasons: [
      { id: "a", label: "Wrong population", count: excludedA },
      { id: "b", label: "Wrong methodology", count: excludedB },
    ],
    studiesIncluded: reports === 0 ? 0 : 1 + next(reports - 1),
  };
}

describe("generated consistent reviews", () => {
  for (let seed = 1; seed <= 30; seed++)
    it(`validates review ${seed} without problems, and every stage adds up`, () => {
      const review = generatedReview(seed);
      const problems = prismaIssues(review).filter((issue) => issue.severity === "problem");
      assert.deepEqual(problems, []);
      const flow = computeFlow(review);
      assert.equal(flow.screened.value, flow.identified! - flow.removed);
      assert.equal(flow.sought.value, flow.screened.value! - review.screenedExcluded!);
      assert.equal(flow.assessed.value, flow.sought.value! - review.notRetrieved!);
      assert.equal(flow.reportsIncluded.value, flow.assessed.value! - flow.reportsExcluded!);
      assert.ok(flow.studiesIncluded! <= flow.reportsIncluded.value!);
    });
});

const NUMBER_FIELDS = ["duplicates", "automation", "removedOther", "screened", "screenedExcluded", "sought", "notRetrieved", "assessed", "otherSought", "otherNotRetrieved", "otherAssessed", "reportsIncluded", "studiesIncluded"] as const;

describe("every number is checked", () => {
  for (const field of NUMBER_FIELDS) {
    it(`refuses a negative ${field}`, () => {
      const issues = prismaIssues({ ...WITH_OTHER_METHODS, [field]: -1 });
      assert.ok(issues.some((issue) => issue.field === field && issue.kind === "value" && /can't be negative/.test(issue.message)), JSON.stringify(issues));
    });
    it(`refuses a fractional ${field}`, () => {
      const issues = prismaIssues({ ...WITH_OTHER_METHODS, [field]: 1.5 });
      assert.ok(issues.some((issue) => issue.field === field && /whole number/.test(issue.message)));
    });
  }
});

describe("every box's wording can be changed", () => {
  for (const key of LABEL_KEYS)
    it(`shows edited wording for ${key}`, () => {
      const input: PrismaInput = { ...WITH_OTHER_METHODS, kind: "rapid", labels: { [key]: `Edited ${key}` } };
      const texts = prismaDiagram(input, "T").nodes.flatMap((node) => node.paragraphs.map((paragraph) => paragraph.text));
      assert.ok(texts.some((text) => text.startsWith(`Edited ${key}`)), `${key}: ${defaultLabels("rapid")[key]}`);
    });
});

describe("every arrow can be hidden on its own", () => {
  for (const id of EDGE_IDS)
    it(`hides only ${id}`, () => {
      const diagram = prismaDiagram({ ...WITH_OTHER_METHODS, hiddenArrows: [id] }, "T");
      const shown = layoutDiagram(diagram, DEFAULT_LAYOUT_OPTIONS).edges.map((edge) => edge.edge.id);
      assert.ok(!shown.includes(id));
      assert.equal(shown.length, diagram.edges.length - 1);
    });
});

describe("large and unusual numbers", () => {
  it("handles a very large search", () => {
    const flow = computeFlow({ ...WITH_OTHER_METHODS, databases: [{ id: "db", name: "Databases", count: 2_500_000 }] });
    assert.equal(flow.identified, 2_500_050);
    assert.ok(prismaDiagram({ ...WITH_OTHER_METHODS, databases: [{ id: "db", name: "Databases", count: 2_500_000 }] }, "T").nodes.some((node) => node.paragraphs.some((paragraph) => paragraph.text === "Databases (n = 2,500,000)")));
  });
  it("handles a review of zeros", () => {
    const zero: PrismaInput = { ...EMPTY_PRISMA_INPUT, databases: [{ id: "db", name: "Databases", count: 0 }], registers: [], duplicates: 0, screenedExcluded: 0, notRetrieved: 0, reasons: [{ id: "r", label: "Other", count: 0 }], studiesIncluded: 0 };
    assert.deepEqual(
      prismaIssues(zero).filter((issue) => issue.severity === "problem"),
      [],
    );
    assert.equal(computeFlow(zero).reportsIncluded.value, 0);
  });
  it("handles sources without names or counts in PRISMA-S", () => {
    const diagram = prismaDiagram({ ...WITH_OTHER_METHODS, kind: "prisma-s", databases: [{ id: "db", name: "", count: null }] }, "T");
    assert.ok(diagram.nodes.find((node) => node.id === "identified"));
  });
  it("keeps long custom wording inside its box", () => {
    const long = "Records identified from bibliographic databases, trial registers and grey literature sources searched between 2010 and 2024";
    const layout = layoutDiagram(prismaDiagram({ ...WITH_OTHER_METHODS, labels: { screened: long } }, "T"), DEFAULT_LAYOUT_OPTIONS);
    const box = layout.nodes.find((node) => node.node.id === "screened")!;
    assert.ok(box.lines.length > 1);
    assert.ok(box.lines.every((line) => line.y < box.height));
  });
});
