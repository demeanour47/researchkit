import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHART_TYPE_INFO, chartIssues, parseTable, recommendationsForProject } from "../../knowledge/charts";
import { projectFromTyped } from "../../knowledge/research";
import { announcements, chartAnnouncement } from "./announcements";
import { exampleLevels, exampleProject } from "./example";

describe("chartAnnouncement", () => {
  it("asks for data when there is none", () => {
    assert.equal(chartAnnouncement("pie", [], false), "Pie chart chosen. Enter or paste data to draw it.");
  });
  it("announces a drawn chart", () => {
    assert.equal(chartAnnouncement("bar", [], true), "Bar chart drawn.");
  });
  it("counts warnings without grading them", () => {
    assert.equal(chartAnnouncement("bar", [{ severity: "warning", message: "w" }], true), "Bar chart drawn. 1 point to check.");
    assert.equal(chartAnnouncement("bar", [{ severity: "warning", message: "w" }, { severity: "warning", message: "v" }], true), "Bar chart drawn. 2 points to check.");
  });
  it("gives the first problem stopping the chart", () => {
    const issues = chartIssues(parseTable("Name\nA").table, { type: "scatter", sort: "none", percentages: false });
    assert.match(chartAnnouncement("scatter", issues, true), /^Scatter plot can't be drawn yet: Two numeric columns/);
  });
  it("names example data as fictional", () => {
    assert.equal(announcements.exampleLoaded("likert"), "Example data for the likert scale chart loaded. It is fictional.");
    assert.equal(announcements.exported("PNG"), "PNG downloaded.");
  });
});

describe("the example project", () => {
  const plan = recommendationsForProject(projectFromTyped(exampleProject, { ...exampleLevels }));
  it("suggests a histogram for screen time and bars for faculty", () => {
    const lead = (name: string) => plan.variables.find((group) => group.heading.toLowerCase() === name)?.suggestions[0]?.type;
    assert.equal(lead("screen time"), "histogram");
    assert.equal(lead("faculty"), "bar");
  });
  it("suggests a scatter plot relating screen time to sleep quality", () => {
    assert.equal(plan.pairs[0].suggestions[0].type, "scatter");
    assert.equal(CHART_TYPE_INFO[plan.pairs[1].suggestions[0].type].label, "Mean comparison chart");
  });
});
