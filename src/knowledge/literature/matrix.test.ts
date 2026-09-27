import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addStudy, cleanFields, createStudy, deleteStudy, duplicateStudy, listItems, moveStudy, nextId, setFavourite, setPriority, setStatus, setTag, shiftStudy, studyLabel, updateField } from "./matrix";
import { filterStudies, fold, leadingNumber, searchStudies, sortStudies, viewStudies, visibleFields } from "./query";
import { SAMPLE_MATRIX, study } from "./test-helpers";
import { COLOUR_TAGS, COLOUR_TAG_LABELS, COLUMN_PRESETS, FIELD_GROUPS, FIELD_GROUP_LABELS, FIELD_INFO, MATRIX_FIELDS, PRIORITIES, PRIORITY_LABELS, READING_STATUSES, READING_STATUS_LABELS, getField, type Matrix } from "./types";
import { EARLIEST_YEAR, identityKey, matrixIssues, studyIssues } from "./validate";

const ids = (matrix: readonly { id: string }[]) => matrix.map((item) => item.id);

describe("the matrix columns", () => {
  it("has every column the brief lists, plus title and theory", () => {
    assert.equal(MATRIX_FIELDS.length, 30);
    for (const field of MATRIX_FIELDS) {
      const info = FIELD_INFO[field];
      assert.ok(info.label && info.hint.endsWith("."), field);
      assert.ok(FIELD_GROUPS.includes(info.group), field);
    }
  });
  it("labels every group, status, priority and tag", () => {
    for (const group of FIELD_GROUPS) assert.ok(FIELD_GROUP_LABELS[group]);
    for (const status of READING_STATUSES) assert.ok(READING_STATUS_LABELS[status]);
    for (const priority of PRIORITIES) assert.ok(PRIORITY_LABELS[priority]);
    for (const tag of COLOUR_TAGS) assert.ok(COLOUR_TAG_LABELS[tag]);
  });
  it("keeps presets to real columns, each starting with the authors", () => {
    for (const [name, fields] of Object.entries(COLUMN_PRESETS)) {
      assert.equal(fields[0], "authors", name);
      for (const field of fields) assert.ok(MATRIX_FIELDS.includes(field), `${name}: ${field}`);
    }
  });
  it("refuses unknown columns", () => {
    assert.throws(() => getField("impact" as never), /Unknown matrix column: impact/);
  });
});

describe("creating and changing studies", () => {
  it("creates an empty study to read", () => {
    const created = createStudy("s1");
    assert.equal(created.status, "to-read");
    assert.deepEqual([created.tag, created.priority, created.favourite], [null, null, false]);
    assert.ok(MATRIX_FIELDS.every((field) => created.fields[field] === ""));
  });
  it("tidies fields and drops unknown keys", () => {
    const fields = cleanFields({ year: " 2021 ", impact: "x" } as never);
    assert.equal(fields.year, "2021");
    assert.ok(!("impact" in fields));
  });
  it("gives new studies unused ids", () => {
    assert.equal(nextId([]), "s1");
    assert.equal(nextId([study("s1"), study("s3")]), "s4");
    assert.equal(nextId([study("s3"), study("s2")]), "s4");
  });
  it("adds a study at the end", () => {
    const matrix = addStudy(SAMPLE_MATRIX, { title: "New" });
    assert.equal(matrix.length, 7);
    assert.equal(matrix[6].fields.title, "New");
    assert.equal(SAMPLE_MATRIX.length, 6);
  });
  it("duplicates a study just after it, with a new id", () => {
    const matrix = duplicateStudy(SAMPLE_MATRIX, "s2");
    assert.deepEqual(ids(matrix).slice(0, 4), ["s1", "s2", "s7", "s3"]);
    assert.deepEqual(matrix[2].fields, matrix[1].fields);
  });
  it("deletes a study", () => {
    assert.deepEqual(ids(deleteStudy(SAMPLE_MATRIX, "s3")), ["s1", "s2", "s4", "s5", "s6"]);
  });
  it("refuses unknown ids", () => {
    assert.throws(() => deleteStudy(SAMPLE_MATRIX, "s99"), /No study with id s99/);
    assert.throws(() => updateField(SAMPLE_MATRIX, "s99", "year", "2020"), /No study/);
  });
  it("moves a study to a position, clamped to the ends", () => {
    assert.deepEqual(ids(moveStudy(SAMPLE_MATRIX, "s5", 0)), ["s5", "s1", "s2", "s3", "s4", "s6"]);
    assert.deepEqual(ids(moveStudy(SAMPLE_MATRIX, "s1", 99)), ["s2", "s3", "s4", "s5", "s6", "s1"]);
    assert.equal(moveStudy(SAMPLE_MATRIX, "s2", 1), SAMPLE_MATRIX);
  });
  it("shifts a study up or down one place", () => {
    assert.deepEqual(ids(shiftStudy(SAMPLE_MATRIX, "s3", -1)).slice(0, 3), ["s1", "s3", "s2"]);
    assert.deepEqual(ids(shiftStudy(SAMPLE_MATRIX, "s3", 1)).slice(2, 4), ["s4", "s3"]);
    assert.deepEqual(ids(shiftStudy(SAMPLE_MATRIX, "s1", -1)), ids(SAMPLE_MATRIX));
  });
  it("updates one field without touching others", () => {
    const matrix = updateField(SAMPLE_MATRIX, "s1", "notes", "Key paper");
    assert.equal(matrix[0].fields.notes, "Key paper");
    assert.equal(matrix[0].fields.year, "2016");
    assert.equal(SAMPLE_MATRIX[0].fields.notes, "");
  });
  it("sets tags, favourites, statuses and priorities", () => {
    let matrix: Matrix = setTag(SAMPLE_MATRIX, "s1", "green");
    matrix = setFavourite(matrix, "s1", true);
    matrix = setStatus(matrix, "s1", "reviewed");
    matrix = setPriority(matrix, "s1", "high");
    assert.deepEqual([matrix[0].tag, matrix[0].favourite, matrix[0].status, matrix[0].priority], ["green", true, "reviewed", "high"]);
    assert.equal(setTag(matrix, "s1", null)[0].tag, null);
  });
});

describe("studyLabel and listItems", () => {
  const cases: [string, string, string, string][] = [
    ["Smith, J.", "2020", "", "Smith (2020)"],
    ["Smith, J.; Lee, K.", "2020", "", "Smith & Lee (2020)"],
    ["Smith, J.; Lee, K.; Wu, H.", "2020", "", "Smith et al. (2020)"],
    ["Smith, J.", "", "", "Smith (n.d.)"],
    ["", "2019", "A study of sleep", "A study of sleep (2019)"],
    ["", "", "", "Untitled study (n.d.)"],
  ];
  for (const [authors, year, title, expected] of cases)
    it(`labels “${authors || title || "nothing"}” as ${expected}`, () => {
      assert.equal(studyLabel(study("x", { authors, year, title })), expected);
    });
  it("labels a study known only by its DOI", () => {
    assert.equal(studyLabel(study("x", { doi: "https://doi.org/10.1000/abc" })), "DOI 10.1000/abc (n.d.)");
  });
  it("splits lists at semicolons and line breaks", () => {
    assert.deepEqual(listItems(" a ;b\nc;; "), ["a", "b", "c"]);
  });
});

describe("searchStudies", () => {
  it("finds studies containing every word, in any column", () => {
    assert.deepEqual(ids(searchStudies(SAMPLE_MATRIX, "sleep regression")), ["s1", "s2"]);
  });
  it("ignores case and accents", () => {
    const matrix = [study("a", { authors: "Müller, K." }), study("b", { authors: "Smith, J." })];
    assert.deepEqual(ids(searchStudies(matrix, "MULLER")), ["a"]);
  });
  it("returns everything for an empty query", () => {
    assert.equal(searchStudies(SAMPLE_MATRIX, "  ").length, 6);
  });
  it("searches only the given columns", () => {
    assert.deepEqual(ids(searchStudies(SAMPLE_MATRIX, "japan", ["title"])), []);
    assert.deepEqual(ids(searchStudies(SAMPLE_MATRIX, "japan", ["country"])), ["s6"]);
  });
  it("folds text", () => {
    assert.equal(fold("  Crème  BRÛLÉE "), "creme brulee");
  });
});

describe("sortStudies", () => {
  it("sorts years as numbers", () => {
    assert.deepEqual(ids(sortStudies(SAMPLE_MATRIX, "year")), ["s5", "s1", "s6", "s4", "s2", "s3"]);
    assert.deepEqual(ids(sortStudies(SAMPLE_MATRIX, "year", "descending")).slice(0, 2), ["s3", "s2"]);
  });
  it("sorts sample sizes as numbers, not text", () => {
    assert.deepEqual(ids(sortStudies(SAMPLE_MATRIX, "sampleSize")), ["s6", "s5", "s3", "s2", "s4", "s1"]);
  });
  it("sorts text alphabetically, ignoring case and accents", () => {
    const matrix = [study("a", { authors: "zhou" }), study("b", { authors: "Émile" }), study("c", { authors: "adams" })];
    assert.deepEqual(ids(sortStudies(matrix, "authors")), ["c", "b", "a"]);
  });
  it("puts empty values last in both directions", () => {
    assert.equal(ids(sortStudies(SAMPLE_MATRIX, "title")).at(-1), "s4");
    assert.equal(ids(sortStudies(SAMPLE_MATRIX, "title", "descending")).at(-1), "s4");
  });
  it("keeps ties in their original order", () => {
    assert.deepEqual(ids(sortStudies(SAMPLE_MATRIX, "country")).slice(0, 4), ["s6", "s1", "s2", "s4"]);
  });
  it("doesn't change the matrix", () => {
    sortStudies(SAMPLE_MATRIX, "year");
    assert.deepEqual(ids(SAMPLE_MATRIX), ["s1", "s2", "s3", "s4", "s5", "s6"]);
  });
  it("reads leading numbers", () => {
    assert.deepEqual([leadingNumber("2021a"), leadingNumber("1,204 students"), leadingNumber("n.d."), leadingNumber(" 12.5")], [2021, 1204, null, 12.5]);
  });
});

describe("filterStudies", () => {
  const organised: Matrix = [
    { ...study("a", { year: "2015" }), status: "read", priority: "high", tag: "red", favourite: true },
    { ...study("b", { year: "2020" }), status: "to-read", priority: null, tag: null, favourite: false },
    { ...study("c", { year: "" }), status: "reviewed", priority: "low", tag: "blue", favourite: true },
  ];
  it("filters by status", () => {
    assert.deepEqual(ids(filterStudies(organised, { statuses: ["read", "reviewed"] })), ["a", "c"]);
  });
  it("filters by priority, including none", () => {
    assert.deepEqual(ids(filterStudies(organised, { priorities: ["none"] })), ["b"]);
    assert.deepEqual(ids(filterStudies(organised, { priorities: ["high", "low"] })), ["a", "c"]);
  });
  it("filters by tag, including untagged", () => {
    assert.deepEqual(ids(filterStudies(organised, { tags: ["red", "none"] })), ["a", "b"]);
  });
  it("shows favourites only", () => {
    assert.deepEqual(ids(filterStudies(organised, { favouritesOnly: true })), ["a", "c"]);
  });
  it("filters by year range, leaving out studies without a year", () => {
    assert.deepEqual(ids(filterStudies(organised, { fromYear: 2016 })), ["b"]);
    assert.deepEqual(ids(filterStudies(organised, { toYear: 2015 })), ["a"]);
  });
  it("shows everything with no filters", () => {
    assert.equal(filterStudies(organised, {}).length, 3);
  });
  it("combines filter, search and sort in a view", () => {
    const view = viewStudies(SAMPLE_MATRIX, { query: "sleep", filter: { fromYear: 2016 }, sort: { field: "year", direction: "descending" } });
    assert.deepEqual(ids(view), ["s3", "s2", "s1", "s6"]);
  });
  it("keeps the researcher's order without a sort", () => {
    assert.deepEqual(ids(viewStudies(SAMPLE_MATRIX, { query: "", filter: {}, sort: null })), ids(SAMPLE_MATRIX));
  });
  it("keeps the author column visible", () => {
    assert.deepEqual(visibleFields(["year", "doi"]), ["authors", "year", "doi"]);
    assert.deepEqual(visibleFields(new Set(["gap", "title"] as const)), ["authors", "title", "gap"]);
  });
});

describe("validation", () => {
  const issues = (fields: Parameters<typeof study>[1]) => studyIssues(study("x", fields), 2026).map((issue) => `${issue.severity}:${issue.field}:${issue.message}`);
  it("accepts a complete study", () => {
    assert.deepEqual(studyIssues(SAMPLE_MATRIX[0], 2026), []);
  });
  it("asks for authors or a title, and a year", () => {
    assert.match(issues({}).join(" "), /add the authors or title/);
    assert.match(issues({ authors: "A" }).join(" "), /add the year/);
  });
  const years: [string, boolean][] = [
    ["2021", true],
    ["2021a", true],
    ["n.d.", true],
    ["in press", true],
    ["21", false],
    ["twenty", false],
    [`${EARLIEST_YEAR - 1}`, false],
    ["2028", false],
    ["2027", true],
  ];
  for (const [year, ok] of years)
    it(`${ok ? "accepts" : "questions"} the year “${year}”`, () => {
      assert.equal(issues({ authors: "A", year }).some((issue) => issue.includes(":year:")), !ok);
    });
  it("checks DOIs", () => {
    assert.match(issues({ authors: "A", year: "2020", doi: "doi 123" }).join(" "), /isn't a DOI/);
    assert.deepEqual(issues({ authors: "A", year: "2020", doi: "doi:10.1000/abc" }), []);
  });
  it("checks sample sizes", () => {
    assert.match(issues({ authors: "A", year: "2020", sampleSize: "about 300" }).join(" "), /as a number/);
    assert.match(issues({ authors: "A", year: "2020", sampleSize: "0" }).join(" "), /0 can't be right/);
    assert.deepEqual(issues({ authors: "A", year: "2020", sampleSize: "1,204" }), []);
  });
  it("checks that variables fit together", () => {
    assert.match(issues({ authors: "A", year: "2020", independent: "x" }).join(" "), /without a dependent variable/);
    assert.match(issues({ authors: "A", year: "2020", mediator: "m" }).join(" "), /mediator or moderator needs/);
  });
  it("identifies publications by DOI, or title and year", () => {
    assert.equal(identityKey(study("a", { doi: "10.1000/ABC" })), "https://doi.org/10.1000/abc");
    assert.equal(identityKey(study("a", { title: "Sleep and Screens!", year: "2020" })), "sleep and screens|2020");
    assert.equal(identityKey(study("a", { title: "Short" })), null);
  });
  it("points out studies entered twice", () => {
    const matrix = [...SAMPLE_MATRIX, study("s7", { authors: "Chen, L.", year: "2018", doi: "10.1000/rk.2018.002" })];
    const duplicate = matrixIssues(matrix, 2026).find((issue) => issue.studyId === "s7");
    assert.match(duplicate?.message ?? "", /looks like the same publication as Chen \(2018\) \(same DOI\)/);
  });
});
