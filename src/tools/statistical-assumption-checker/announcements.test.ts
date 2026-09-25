import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assumptionChecklist, projectFromTyped } from "../../knowledge/research";
import { announcements, checklistAnnouncement } from "./announcements";
import { exampleLevels, exampleProject } from "./example";

const example = () => assumptionChecklist(projectFromTyped(exampleProject, exampleLevels));

describe("checklistAnnouncement", () => {
  it("counts analyses, assumptions and those needing attention, without grading", () => {
    assert.equal(checklistAnnouncement({ methods: [], notes: [] }), "Checklist updated: 0 analyses, 0 assumptions. None needs attention from your project yet.");
    assert.match(checklistAnnouncement(example()), /^Checklist updated: \d+ analyses, \d+ assumptions\. \d+ needs? attention now\.$/);
    assert.equal(announcements.copied, "Checklist copied.");
  });
});

describe("the example project", () => {
  it("plans a group comparison adjusted for prior anxiety, with the checks its design raises", () => {
    const checklist = example();
    const methods = checklist.methods.map((method) => method.method);
    assert.ok(methods.includes("ancova"), methods.join(", "));
    assert.ok(methods.includes("independent-t-test"));
    const ancova = checklist.methods.find((method) => method.method === "ancova")!;
    const status = (id: string) => ancova.items.find((item) => item.assumption === id)?.status;
    assert.equal(status("independence"), "worth-checking", "cluster sampling");
    assert.equal(status("normality-of-residuals"), "worth-checking", "a planned sample of 25");
    assert.equal(status("covariate-independence"), "worth-checking", "a quasi-experiment introduces the intervention, so covariates are measured first");
    assert.equal(status("numeric-measurement"), "worth-checking", "exam anxiety is a scale score");
  });
});
