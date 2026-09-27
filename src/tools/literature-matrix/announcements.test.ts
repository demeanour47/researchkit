import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectPatterns, importStudies, potentialGaps, projectLens, addStudy, type Matrix } from "../../knowledge/literature";
import { projectFromTyped } from "../../knowledge/research";
import { announcements, importAnnouncement, viewAnnouncement } from "./announcements";
import { exampleLevels, exampleProject, exampleStudies, exampleTopic } from "./example";

describe("announcements", () => {
  it("describes imports", () => {
    assert.equal(importAnnouncement({ added: 2, duplicates: [], notes: [] }), "2 studies added.");
    assert.equal(importAnnouncement({ added: 1, duplicates: ["x"], notes: ["Note."] }), "1 study added. 1 already in the matrix was skipped. Note.");
    assert.equal(importAnnouncement({ added: 0, duplicates: [], notes: [] }), "No studies were added.");
  });
  it("describes the view", () => {
    assert.equal(viewAnnouncement(3, 3), "Showing all 3 studies.");
    assert.equal(viewAnnouncement(1, 4), "Showing 1 of 4 studies.");
  });
  it("names changes to studies", () => {
    assert.equal(announcements.moved("Chen (2018)", 1, 5), "Chen (2018) moved to position 1 of 5.");
    assert.equal(announcements.favourite("Chen (2018)", true), "Chen (2018) marked as a favourite.");
  });
});

describe("the example matrix", () => {
  const matrix: Matrix = exampleStudies.reduce<Matrix>((current, fields) => addStudy(current, fields), []);
  it("has recurring patterns to find", () => {
    const groups = detectPatterns(matrix).groups;
    assert.ok(groups.find((group) => group.id === "variables")!.repeated.length > 0);
    assert.ok(groups.find((group) => group.id === "designs")!.repeated.length > 0);
  });
  it("suggests gaps for the example project", () => {
    const lens = projectLens({ ...projectFromTyped(exampleProject, { ...exampleLevels }), topic: exampleTopic });
    const gaps = potentialGaps(matrix, lens, 2026);
    assert.ok(gaps.length > 0);
    assert.equal(lens.topic, exampleTopic);
  });
  it("exports to CSV and imports back completely", () => {
    const fromCsv = importStudies([], "csv", ["Author(s),Year,Title", ...matrix.map((study) => `"${study.fields.authors}",${study.fields.year},"${study.fields.title}"`)].join("\n"));
    assert.equal(fromCsv.added, 5);
  });
});
