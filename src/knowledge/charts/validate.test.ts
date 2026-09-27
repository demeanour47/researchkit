import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseTable } from "./table";
import { CHART_TYPES, CHART_TYPE_INFO, type ChartType, type SortOrder } from "./types";
import { MAX_SERIES, canDraw, chartIssues, fittingTypes } from "./validate";

const issues = (type: ChartType, text: string, extra: { sort?: SortOrder; percentages?: boolean } = {}) => chartIssues(parseTable(text).table, { type, sort: extra.sort ?? "none", percentages: extra.percentages ?? false });
const problems = (...args: Parameters<typeof issues>) => issues(...args).filter((issue) => issue.severity === "problem").map((issue) => issue.message);
const warnings = (...args: Parameters<typeof issues>) => issues(...args).filter((issue) => issue.severity === "warning").map((issue) => issue.message);
const has = (messages: string[], pattern: RegExp) => assert.ok(messages.some((message) => pattern.test(message)), `No message matches ${pattern}: ${JSON.stringify(messages)}`);

describe("chartIssues: every chart type's example", () => {
  for (const type of CHART_TYPES)
    it(`draws the ${CHART_TYPE_INFO[type].label.toLowerCase()} example without problems`, () => {
      assert.deepEqual(problems(type, CHART_TYPE_INFO[type].example), []);
    });
});

describe("chartIssues: general", () => {
  it("asks for data when the table is empty", () => {
    assert.deepEqual(problems("bar", ""), ["Enter or paste some data."]);
  });
  it("warns that sorting is ignored for ordered charts", () => {
    has(warnings("line", "Week,n\n1,2\n2,3", { sort: "descending" }), /Line graphs keep the order of the data/);
  });
  it("doesn't warn about sorting sortable charts", () => {
    assert.deepEqual(warnings("bar", "F,n\nA,1\nB,2\nC,3", { sort: "descending" }), []);
  });
  it("explains the layout when no numeric column follows the first", () => {
    has(problems("bar", "Name,Group\nA,x"), /First column: categories\. Second column: numbers\. No numeric column was found after the first column\./);
  });
  it("refuses more than eight series", () => {
    const header = ["Cat", ...Array.from({ length: MAX_SERIES + 1 }, (_, index) => `S${index + 1}`)].join(",");
    const row = ["A", ...Array.from({ length: MAX_SERIES + 1 }, () => "1")].join(",");
    has(problems("grouped-bar", `${header}\n${row}`), /There are 9 series, but only 8 can be told apart/);
  });
  it("warns that single-series charts draw only the first numeric column", () => {
    has(warnings("bar", "F,a,b\nA,1,2\nB,3,4"), /Only the first numeric column, “a”, is drawn/);
  });
  it("problems when the numeric columns hold no numbers", () => {
    has(problems("grouped-bar", "Cat,a\nA,\nB,"), /No numeric column was found/);
  });
});

describe("chartIssues: parts of a whole", () => {
  for (const type of ["pie", "doughnut", "stacked-bar", "stacked-bar-100", "pareto", "population-pyramid", "likert"] as ChartType[])
    it(`refuses negative values in a ${CHART_TYPE_INFO[type].label.toLowerCase()}`, () => {
      const text = type === "population-pyramid" ? "Age,F,M\n18,-1,2\n19,3,4" : type === "likert" ? "Item,D,A\nx,-1,2" : "F,a,b\nA,-1,2\nB,3,4\nC,1,1";
      has(problems(type, text), /need values of zero or more/);
    });
  it("allows negative values in plain bar charts", () => {
    assert.deepEqual(problems("bar", "F,n\nA,-1\nB,3"), []);
  });
  it("refuses pies with more than eight parts", () => {
    has(problems("pie", ["P,n", ..."ABCDEFGHI".split("").map((letter) => `${letter},1`)].join("\n")), /at most 8 parts/);
  });
  it("warns about pies with seven or eight parts", () => {
    has(warnings("pie", ["P,n", ..."ABCDEFG".split("").map((letter) => `${letter},1`)].join("\n")), /hard to read with more than 6 parts; there are 7/);
  });
  it("accepts pies with six parts without warning", () => {
    assert.deepEqual(warnings("pie", ["P,n", ..."ABCDEF".split("").map((letter) => `${letter},1`)].join("\n")), []);
  });
  it("suggests stating two percentages instead of a two-part pie", () => {
    has(warnings("doughnut", "P,n\nA,1\nB,2"), /only two parts/);
  });
  it("refuses a pie of zeros", () => {
    has(problems("pie", "P,n\nA,0\nB,0\nC,0"), /Every value is zero/);
  });
});

describe("chartIssues: specific charts", () => {
  it("warns that one bar adds little", () => {
    has(warnings("bar", "F,n\nA,4"), /one bar/);
    has(warnings("horizontal-bar", "F,n\nA,4"), /one bar/);
  });
  it("needs three radar dimensions", () => {
    has(problems("radar", "Skill,a\nX,1\nY,2"), /at least three dimensions/);
  });
  it("warns about more than three radar profiles", () => {
    has(warnings("radar", "Skill,a,b,c,d\nX,1,1,1,1\nY,2,2,2,2\nZ,3,3,3,3"), /more than three profiles/);
  });
  for (const type of ["line", "multi-line", "area"] as ChartType[])
    it(`needs two points for a ${CHART_TYPE_INFO[type].label.toLowerCase()}`, () => {
      has(problems(type, "Week,n\n1,2"), /at least two points/);
    });
  it("suggests a multiple line graph for several series", () => {
    has(warnings("line", "Week,a,b\n1,2,3\n2,3,4"), /choose a multiple line graph/);
  });
  it("suggests a line graph for one series", () => {
    has(warnings("multi-line", "Week,a\n1,2\n2,3"), /a line graph is enough/);
  });
  it("explains that percentage labels don't apply to lines", () => {
    has(warnings("line", "Week,a\n1,2\n2,3", { percentages: true }), /Percentage labels apply to parts of a whole/);
  });
  it("needs exactly two sides for a population pyramid", () => {
    has(problems("population-pyramid", "Age,F\n18,1\n19,2"), /exactly two numeric columns/);
    has(problems("population-pyramid", "Age,F,M,X\n18,1,1,1"), /exactly two numeric columns/);
  });
  it("needs two Likert levels", () => {
    has(problems("likert", "Item,Agree\nx,3"), /at least two response levels/);
  });
  it("allows at most nine Likert levels", () => {
    const header = ["Item", ...Array.from({ length: 10 }, (_, index) => `L${index + 1}`)].join(",");
    has(problems("likert", `${header}\nx,${Array(10).fill(1).join(",")}`), /at most nine response levels/);
  });
});

describe("chartIssues: distributions", () => {
  it("warns about histograms of fewer than ten values", () => {
    has(warnings("histogram", "v\n1\n2\n3"), /With 3 values, a histogram says little/);
  });
  it("uses the singular for one value", () => {
    has(warnings("frequency-polygon", "v\n1"), /With 1 value,/);
  });
  it("warns that only the first column makes a histogram", () => {
    has(warnings("histogram", ["a,b", ...Array.from({ length: 12 }, (_, index) => `${index},${index}`)].join("\n")), /Only the first numeric column, “a”, is drawn/);
  });
  it("needs a numeric column", () => {
    has(problems("histogram", "Name\nx\ny"), /No numeric column was found\./);
  });
  it("warns about box plot groups of fewer than five values", () => {
    has(warnings("box-plot", "A,B\n1,1\n2,2\n3,3\n4,4\n5,"), /“B” has only 4 values/);
  });
  it("refuses more than eight box plot groups", () => {
    const header = Array.from({ length: 9 }, (_, index) => `G${index + 1}`).join(",");
    has(problems("box-plot", `${header}\n${Array(9).fill(1).join(",")}`), /There are 9 groups/);
  });
});

describe("chartIssues: points", () => {
  it("needs two numeric columns for a scatter plot", () => {
    has(problems("scatter", "Name,x\nA,1"), /Found 1 numeric column\./);
  });
  it("needs three numeric columns for a bubble chart", () => {
    has(problems("bubble", "x,y\n1,2"), /Found 2 numeric columns\./);
  });
  it("refuses negative bubble sizes", () => {
    has(problems("bubble", "x,y,s\n1,2,-3"), /Bubble sizes must be zero or more/);
  });
  it("warns about fewer than five points", () => {
    has(warnings("scatter", "x,y\n1,2\n2,3"), /With 2 points/);
  });
  it("warns that extra numeric columns are ignored", () => {
    has(warnings("scatter", "x,y,z\n1,2,3\n2,3,4\n3,4,5\n4,5,6\n5,6,7"), /Only the first 2 numeric columns are drawn/);
  });
  it("problems when no row is complete", () => {
    has(problems("scatter", "x,y\n1,\n,2"), /No row has all the numbers/);
  });
});

describe("chartIssues: means", () => {
  it("needs error margins for every group of an error bar chart", () => {
    has(problems("error-bar", "G,M,E\nA,1,0.1\nB,2,"), /needs an error margin for every group/);
  });
  it("needs an error column for an error bar chart", () => {
    has(problems("error-bar", "G,M\nA,1\nB,2"), /needs an error margin/);
  });
  it("warns that means without error bars can't be judged", () => {
    has(warnings("mean-comparison", "G,M\nA,1\nB,2"), /Without error margins/);
  });
  it("asks the caption to say what the error bars show", () => {
    has(warnings("mean-comparison", "G,M,SE\nA,1,0.1\nB,2,0.2"), /Say in the caption what the error bars show: “SE”/);
  });
  it("needs a group with a value", () => {
    has(problems("mean-comparison", "G,Note\nA,x"), /No group with a numeric value was found/);
  });
});

describe("canDraw", () => {
  it("allows warnings", () => {
    assert.equal(canDraw([{ severity: "warning", message: "w" }]), true);
  });
  it("stops on problems", () => {
    assert.equal(canDraw([{ severity: "warning", message: "w" }, { severity: "problem", message: "p" }]), false);
  });
  it("allows no issues", () => {
    assert.equal(canDraw([]), true);
  });
});

describe("fittingTypes", () => {
  it("includes category charts for a category table", () => {
    const types = fittingTypes(parseTable("F,n\nA,1\nB,2\nC,3").table);
    for (const type of ["bar", "horizontal-bar", "pie", "line", "pareto", "radar"] as ChartType[]) assert.ok(types.includes(type), type);
    assert.ok(!types.includes("scatter"));
    assert.ok(!types.includes("population-pyramid"));
  });
  it("includes point charts for a table of two numeric columns", () => {
    const types = fittingTypes(parseTable("x,y\n1,2\n2,3\n3,5").table);
    assert.ok(types.includes("scatter"));
    assert.ok(!types.includes("bubble"));
  });
  it("includes nothing for an empty table", () => {
    assert.deepEqual(fittingTypes(parseTable("").table), []);
  });
});
