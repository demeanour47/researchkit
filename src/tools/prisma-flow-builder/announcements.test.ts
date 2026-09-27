import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeFlow, flowParagraph, prismaIssues } from "../../knowledge/prisma";
import { announcements, checksAnnouncement } from "./announcements";
import { exampleInput } from "./example";

describe("announcements", () => {
  it("summarises the checks", () => {
    assert.equal(checksAnnouncement([]), "Diagram updated. Every number adds up.");
    assert.equal(checksAnnouncement([{ severity: "problem", kind: "value", field: "x", message: "m" }]), "Diagram updated. 1 problem.");
    assert.equal(
      checksAnnouncement([
        { severity: "problem", kind: "value", field: "x", message: "m" },
        { severity: "warning", kind: "missing", field: "y", message: "m" },
        { severity: "warning", kind: "missing", field: "z", message: "m" },
      ]),
      "Diagram updated. 1 problem and 2 points to check.",
    );
  });
  it("describes counting", () => {
    assert.equal(announcements.counted(10, 2), "10 records counted, 2 of them duplicates.");
    assert.equal(announcements.studiesCounted(1), "1 included study filled in.");
  });
});

describe("the example", () => {
  it("adds up without problems", () => {
    assert.deepEqual(prismaIssues(exampleInput).filter((issue) => issue.severity === "problem"), []);
  });
  it("adds up with the other methods column too", () => {
    const withOther = { ...exampleInput, otherMethods: true };
    assert.deepEqual(prismaIssues(withOther), []);
    assert.equal(computeFlow(withOther).reportsIncluded.value, 46);
  });
  it("describes itself in words", () => {
    assert.match(flowParagraph(exampleInput), /^The searches identified 1,870 records from databases and 34 records from registers\./);
  });
});
