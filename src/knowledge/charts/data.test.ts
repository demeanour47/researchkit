import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { boxData, categoryData, chartData, histogramData, likertData, meanData, niceStep, paretoData, percentOfRow, percentOfSeries, pointData, quantile, sortCategories, type CategoryData } from "./data";
import { parseTable } from "./table";

const table = (text: string) => parseTable(text).table;
const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);
const closeAll = (actual: readonly (number | null)[], expected: readonly number[]) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, index) => close(value ?? Number.NaN, expected[index]));
};

describe("categoryData", () => {
  it("takes the first column as categories and later numeric columns as series", () => {
    const data = categoryData(table("Year,Female,Male\nFirst,34,28\nSecond,29,31"));
    assert.deepEqual(data.categories, ["First", "Second"]);
    assert.deepEqual(data.series, [
      { name: "Female", values: [34, 29] },
      { name: "Male", values: [28, 31] },
    ]);
  });
  it("skips text columns after the first", () => {
    const data = categoryData(table("Name,Note,Score\nA,x,1\nB,y,2"));
    assert.deepEqual(data.series.map((series) => series.name), ["Score"]);
  });
  it("drops rows without a category", () => {
    const data = categoryData(table("Name,Score\nA,1\n,2\nB,3"));
    assert.deepEqual(data.categories, ["A", "B"]);
    assert.deepEqual(data.series[0].values, [1, 3]);
  });
  it("keeps missing numbers as null", () => {
    assert.deepEqual(categoryData(table("Name,Score\nA,\nB,3")).series[0].values, [null, 3]);
  });
  it("uses a numeric first column as category labels", () => {
    assert.deepEqual(categoryData(table("Week,Hours\n1,7.2\n2,7.0")).categories, ["1", "2"]);
  });
});

describe("sortCategories", () => {
  const data: CategoryData = { kind: "category", categories: ["A", "B", "C", "D"], series: [{ name: "n", values: [2, 5, 2, 9] }] };
  it("leaves the order alone for none", () => {
    assert.equal(sortCategories(data, "none"), data);
  });
  it("sorts descending, keeping ties in their original order", () => {
    const sorted = sortCategories(data, "descending");
    assert.deepEqual(sorted.categories, ["D", "B", "A", "C"]);
    assert.deepEqual(sorted.series[0].values, [9, 5, 2, 2]);
  });
  it("sorts ascending, keeping ties in their original order", () => {
    assert.deepEqual(sortCategories(data, "ascending").categories, ["A", "C", "B", "D"]);
  });
  it("sorts by the total across series", () => {
    const grouped: CategoryData = { kind: "category", categories: ["X", "Y"], series: [{ name: "a", values: [10, 1] }, { name: "b", values: [1, 20] }] };
    assert.deepEqual(sortCategories(grouped, "descending").categories, ["Y", "X"]);
    assert.deepEqual(sortCategories(grouped, "descending").series[1].values, [20, 1]);
  });
  it("counts missing values as zero", () => {
    const gaps: CategoryData = { kind: "category", categories: ["X", "Y"], series: [{ name: "a", values: [null, 1] }] };
    assert.deepEqual(sortCategories(gaps, "descending").categories, ["Y", "X"]);
  });
  it("doesn't change the original", () => {
    sortCategories(data, "descending");
    assert.deepEqual(data.categories, ["A", "B", "C", "D"]);
  });
});

describe("percentages", () => {
  it("turns each row into percentages of its total", () => {
    const data: CategoryData = { kind: "category", categories: ["X", "Y"], series: [{ name: "a", values: [1, 3] }, { name: "b", values: [3, 1] }] };
    const result = percentOfRow(data);
    assert.deepEqual(result.series.map((series) => series.values), [[25, 75], [75, 25]]);
  });
  it("gives zeros for a row totalling zero", () => {
    const data: CategoryData = { kind: "category", categories: ["X"], series: [{ name: "a", values: [0] }, { name: "b", values: [0] }] };
    assert.deepEqual(percentOfRow(data).series.map((series) => series.values[0]), [0, 0]);
  });
  it("keeps missing values missing", () => {
    const data: CategoryData = { kind: "category", categories: ["X"], series: [{ name: "a", values: [null] }, { name: "b", values: [4] }] };
    assert.deepEqual(percentOfRow(data).series.map((series) => series.values[0]), [null, 100]);
  });
  it("turns a series into shares of its total", () => {
    assert.deepEqual(percentOfSeries([1, 1, 2]), [25, 25, 50]);
  });
  it("gives zeros for a series totalling zero", () => {
    assert.deepEqual(percentOfSeries([0, 0]), [0, 0]);
  });
});

describe("niceStep", () => {
  const cases: [number, number][] = [
    [0.7, 1],
    [1, 1],
    [1.5, 2],
    [3, 5],
    [7, 10],
    [9.6, 10],
    [12, 20],
    [0.14, 0.2],
    [0.03, 0.05],
    [450, 500],
  ];
  for (const [raw, expected] of cases)
    it(`rounds ${raw} up to ${expected}`, () => {
      close(niceStep(raw), expected);
    });
  it("gives 1 for zero, negatives and non-numbers", () => {
    assert.deepEqual([niceStep(0), niceStep(-3), niceStep(Number.NaN), niceStep(Infinity)], [1, 1, 1, 1]);
  });
});

describe("histogramData", () => {
  it("bins by Sturges' rule with a nice width, lower edges included", () => {
    const data = histogramData(table(["Score", ...Array.from({ length: 10 }, (_, index) => String(index + 1))].join("\n")), 0);
    assert.equal(data.n, 10);
    assert.equal(data.width, 2);
    assert.deepEqual(data.bins.map((bin) => [bin.from, bin.to, bin.count]), [
      [0, 2, 1],
      [2, 4, 2],
      [4, 6, 2],
      [6, 8, 2],
      [8, 10, 2],
      [10, 12, 1],
    ]);
  });
  it("counts every value exactly once", () => {
    const values = [15, 18, 19, 20, 21, 21, 22, 22, 23, 23, 24, 24, 26, 28, 33];
    const data = histogramData(table(["Age", ...values.map(String)].join("\n")), 0);
    assert.equal(data.bins.reduce((sum, bin) => sum + bin.count, 0), values.length);
  });
  it("uses the first numeric column by default", () => {
    assert.equal(histogramData(table("Name,Age\nA,20\nB,30")).name, "Age");
  });
  it("gives one bin when every value is the same", () => {
    const data = histogramData(table("v\n5\n5\n5"), 0);
    assert.equal(data.bins.length, 1);
    assert.equal(data.bins[0].count, 3);
  });
  it("gives no bins without values", () => {
    const data = histogramData(table("v,w\na,\nb,"), 1);
    assert.deepEqual([data.bins.length, data.n], [0, 0]);
  });
  it("handles negative values", () => {
    const data = histogramData(table("v\n-5\n-1\n0\n3"), 0);
    assert.ok(data.bins[0].from <= -5);
    assert.equal(data.bins.reduce((sum, bin) => sum + bin.count, 0), 4);
  });
});

describe("quantile", () => {
  it("interpolates linearly between order statistics", () => {
    close(quantile([1, 2, 3, 4], 0.25), 1.75);
    close(quantile([1, 2, 3, 4], 0.5), 2.5);
    close(quantile([1, 2, 3, 4], 0.75), 3.25);
  });
  it("returns the extremes at 0 and 1", () => {
    assert.deepEqual([quantile([3, 7, 9], 0), quantile([3, 7, 9], 1)], [3, 9]);
  });
  it("returns the only value of a single-value list", () => {
    assert.equal(quantile([4], 0.3), 4);
  });
  it("returns NaN for an empty list", () => {
    assert.ok(Number.isNaN(quantile([], 0.5)));
  });
});

describe("boxData", () => {
  it("computes quartiles, whiskers and outliers by Tukey's rule", () => {
    const [group] = boxData(table("Score\n1\n2\n3\n4\n100")).groups;
    assert.deepEqual([group.q1, group.median, group.q3], [2, 3, 4]);
    assert.deepEqual([group.lowerWhisker, group.upperWhisker], [1, 4]);
    assert.deepEqual(group.outliers, [100]);
    assert.deepEqual([group.min, group.max, group.n], [1, 100, 5]);
  });
  it("makes one group per numeric column, ignoring missing cells", () => {
    const data = boxData(table("A,B\n1,10\n2,\n3,30"));
    assert.deepEqual(data.groups.map((group) => [group.name, group.n]), [["A", 3], ["B", 2]]);
  });
  it("ignores text columns", () => {
    assert.equal(boxData(table("Name,Score\nx,1\ny,2")).groups.length, 1);
  });
  it("finds low outliers too", () => {
    const [group] = boxData(table("v\n-50\n10\n11\n12\n13")).groups;
    assert.deepEqual(group.outliers, [-50]);
    assert.equal(group.lowerWhisker, 10);
  });
});

describe("pointData", () => {
  it("takes the first two numeric columns and labels from a text first column", () => {
    const data = pointData(table("Name,Hours,Grade\nA,5,58\nB,8,64"), false);
    assert.deepEqual([data.xName, data.yName, data.sizeName], ["Hours", "Grade", null]);
    assert.deepEqual(data.points, [
      { x: 5, y: 58, size: null, label: "A" },
      { x: 8, y: 64, size: null, label: "B" },
    ]);
  });
  it("adds sizes for bubbles", () => {
    const data = pointData(table("x,y,n\n1,2,3"), true);
    assert.equal(data.sizeName, "n");
    assert.equal(data.points[0].size, 3);
  });
  it("skips rows missing a coordinate", () => {
    assert.equal(pointData(table("x,y\n1,2\n3,\n5,6"), false).points.length, 2);
  });
  it("has no labels without a text first column", () => {
    assert.equal(pointData(table("x,y\n1,2"), false).points[0].label, null);
  });
});

describe("meanData", () => {
  it("reads groups, values and error margins", () => {
    const data = meanData(table("Group,Mean,SE\nControl,3.4,0.2\nExercise,2.9,-0.2"));
    assert.deepEqual([data.valueName, data.errorName], ["Mean", "SE"]);
    assert.deepEqual(data.groups, [
      { name: "Control", value: 3.4, error: 0.2 },
      { name: "Exercise", value: 2.9, error: 0.2 },
    ]);
  });
  it("allows the error column to be absent", () => {
    const data = meanData(table("Group,Mean\nA,1"));
    assert.equal(data.errorName, null);
    assert.equal(data.groups[0].error, null);
  });
  it("keeps groups whose error is missing", () => {
    assert.deepEqual(meanData(table("Group,Mean,SE\nA,1,\nB,2,0.1")).groups.map((group) => group.error), [null, 0.1]);
  });
});

describe("paretoData", () => {
  it("sorts descending with shares and cumulative shares", () => {
    const data = paretoData({ kind: "category", categories: ["A", "B", "C"], series: [{ name: "n", values: [10, 30, 20] }] });
    assert.deepEqual(data.categories, ["B", "C", "A"]);
    assert.deepEqual(data.counts, [30, 20, 10]);
    closeAll(data.percentages, [50, 100 / 3, 50 / 3]);
    closeAll(data.cumulative, [50, 250 / 3, 100]);
  });
  it("gives zeros when every count is zero", () => {
    const data = paretoData({ kind: "category", categories: ["A"], series: [{ name: "n", values: [0] }] });
    assert.deepEqual([data.percentages, data.cumulative], [[0], [0]]);
  });
});

describe("likertData", () => {
  const five: CategoryData = { kind: "category", categories: ["Item"], series: ["SD", "D", "N", "A", "SA"].map((name, index) => ({ name, values: [[1, 1, 2, 3, 3][index]] })) };
  it("turns counts into percentages", () => {
    assert.deepEqual(likertData(five).rows[0].percentages, [10, 10, 20, 30, 30]);
  });
  it("splits the neutral level across zero", () => {
    assert.deepEqual(likertData(five).rows[0].segments, [
      { from: -30, to: -20 },
      { from: -20, to: -10 },
      { from: -10, to: 10 },
      { from: 10, to: 40 },
      { from: 40, to: 70 },
    ]);
  });
  it("puts half the levels either side of zero when there is no neutral level", () => {
    const four: CategoryData = { kind: "category", categories: ["Item"], series: ["SD", "D", "A", "SA"].map((name) => ({ name, values: [1] })) };
    assert.deepEqual(likertData(four).rows[0].segments.map((segment) => [segment.from, segment.to]), [[-50, -25], [-25, 0], [0, 25], [25, 50]]);
  });
  it("keeps the level names and totals", () => {
    const layout = likertData(five);
    assert.deepEqual(layout.levels, ["SD", "D", "N", "A", "SA"]);
    assert.equal(layout.rows[0].total, 10);
  });
  it("gives zero-width segments for an item with no responses", () => {
    const empty: CategoryData = { kind: "category", categories: ["Item"], series: ["D", "A"].map((name) => ({ name, values: [0] })) };
    assert.ok(likertData(empty).rows[0].segments.every((segment) => segment.from === 0 && segment.to === 0));
  });
});

describe("chartData", () => {
  it("returns category data for bar charts, sorted when asked", () => {
    const data = chartData(table("F,n\nA,1\nB,3"), "bar", "descending");
    assert.equal(data.kind, "category");
    assert.deepEqual((data as CategoryData).categories, ["B", "A"]);
  });
  it("ignores sorting for charts whose order carries meaning", () => {
    const data = chartData(table("Week,n\n1,5\n2,9"), "line", "descending") as CategoryData;
    assert.deepEqual(data.categories, ["1", "2"]);
  });
  it("returns histogram data for histograms and frequency polygons", () => {
    assert.equal(chartData(table("v\n1\n2"), "histogram").kind, "histogram");
    assert.equal(chartData(table("v\n1\n2"), "frequency-polygon").kind, "histogram");
  });
  it("returns box data for box plots", () => {
    assert.equal(chartData(table("v\n1\n2"), "box-plot").kind, "box");
  });
  it("returns points for scatter and bubble charts", () => {
    assert.equal(chartData(table("x,y\n1,2"), "scatter").kind, "points");
    assert.equal((chartData(table("x,y,z\n1,2,3"), "bubble") as { sizeName: string | null }).sizeName, "z");
  });
  it("sorts mean comparison groups by value", () => {
    const data = chartData(table("G,M\nA,2\nB,5\nC,1"), "mean-comparison", "ascending");
    assert.deepEqual((data as { groups: { name: string }[] }).groups.map((group) => group.name), ["C", "A", "B"]);
  });
  it("keeps error bar charts in their order", () => {
    const data = chartData(table("G,M,E\nA,2,1\nB,5,1"), "error-bar", "descending");
    assert.deepEqual((data as { groups: { name: string }[] }).groups.map((group) => group.name), ["A", "B"]);
  });
});
