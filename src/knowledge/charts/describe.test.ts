import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chartData } from "./data";
import { describeChart } from "./describe";
import { parseTable } from "./table";
import { CHART_TYPES, CHART_TYPE_INFO, type ChartType } from "./types";

const text = (type: ChartType, csv = CHART_TYPE_INFO[type].example, title = "", labelDecimals: number | null = null) => describeChart(chartData(parseTable(csv).table, type), { type, title, labelDecimals });

describe("describeChart: every chart type", () => {
  for (const type of CHART_TYPES) {
    const label = CHART_TYPE_INFO[type].label;
    it(`gives the ${label.toLowerCase()} alt text, a summary and a table`, () => {
      const result = text(type);
      assert.ok(result.alt.startsWith(label));
      assert.ok(result.alt.endsWith("."));
      assert.ok(result.summary.length > 0);
      assert.ok(result.table.rows.length > 0);
      assert.ok(result.table.rows.every((row) => row.length === result.table.columns.length));
    });
  }
});

describe("describeChart: wording", () => {
  it("names the chart once when it has no title", () => {
    assert.equal(text("bar").alt.startsWith("Bar chart, showing 5 categories"), true);
  });
  it("includes the title", () => {
    assert.match(text("bar", undefined, "Enrolment by faculty").alt, /^Bar chart: Enrolment by faculty, showing 5 categories/);
  });
  it("names the highest and lowest bars without false precision", () => {
    assert.match(text("bar").summary, /The highest is Science \(48\) and the lowest is Law \(15\)\./);
  });
  it("keeps the decimals values have", () => {
    const result = text("bar", "F,n\nA,2.25\nB,1.5");
    assert.match(result.summary, /A \(2\.25\)/);
    assert.deepEqual(result.table.rows, [["A", "2.25"], ["B", "1.5"]]);
  });
  it("captions the table with the chart's name", () => {
    assert.equal(text("bar", undefined, "Enrolment").table.caption, "Data for Enrolment");
  });
  it("compares several series", () => {
    assert.match(text("grouped-bar").summary, /It compares Female and Male across First, Second, Third and Fourth\./);
  });
  it("lists every series in the table", () => {
    assert.deepEqual(text("grouped-bar").table.columns, ["Category", "Female", "Male"]);
  });
  it("shows only the drawn series for single-series charts", () => {
    assert.deepEqual(text("bar", "F,a,b\nX,1,2").table.columns, ["Category", "a"]);
  });
  it("marks missing values in the table", () => {
    assert.deepEqual(text("grouped-bar", "F,a,b\nX,1,\nY,2,3").table.rows[0], ["X", "1", "–"]);
  });
  it("uses the singular for one category", () => {
    assert.match(text("bar", "F,n\nA,1").alt, /showing 1 category/);
  });
});

describe("describeChart: special charts", () => {
  it("says how many Pareto categories reach 80%", () => {
    const result = text("pareto", "C,n\nA,50\nB,30\nC,15\nD,5");
    assert.match(result.summary, /^A is the largest category, with 50\.0% of the total\. The first 2 categories account for at least 80% of the total\./);
    assert.deepEqual(result.table.columns, ["Category", "Count", "Percentage", "Cumulative percentage"]);
    assert.deepEqual(result.table.rows[1], ["B", "30", "30.0%", "80.0%"]);
  });
  it("uses the singular when one Pareto category reaches 80%", () => {
    assert.match(text("pareto", "C,n\nA,90\nB,10").summary, /The first 1 category accounts/);
  });
  it("names the Likert item with the most positive responses", () => {
    const result = text("likert", "Item,D,N,A\nx,5,3,2\ny,1,1,8");
    assert.match(result.summary, /“y” has the most positive responses: 80\.0% in the top 1 level\./);
    assert.match(result.alt, /2 items rated on 3 levels from D to A/);
    assert.deepEqual(result.table.columns, ["Item", "D (%)", "N (%)", "A (%)"]);
  });
  it("describes the histogram's busiest interval", () => {
    const result = text("histogram", ["v", ...Array.from({ length: 10 }, (_, index) => String(index + 1))].join("\n"));
    assert.match(result.summary, /Each interval is 2 wide\./);
    assert.deepEqual(result.table.columns, ["From", "To (under)", "Count"]);
    assert.deepEqual(result.table.rows[0], ["0", "2", "1"]);
  });
  it("summarises each box plot group", () => {
    const result = text("box-plot", "A\n1\n2\n3\n4\n100");
    assert.match(result.summary, /A: median 3, quartiles 2 to 4, 1 outlier\./);
    assert.deepEqual(result.table.rows[0], ["A", "5", "1", "2", "3", "4", "100", "100"]);
  });
  it("says “None” for box plots without outliers", () => {
    assert.equal(text("box-plot", "A\n1\n2\n3\n4\n5").table.rows[0][7], "None");
  });
  it("describes scatter plots by their ranges", () => {
    const result = text("scatter", "x,y\n1,5\n3,9");
    assert.match(result.alt, /2 points of y against x\./);
    assert.match(result.summary, /from 1 to 3/);
  });
  it("adds labels and sizes to the point table", () => {
    const result = text("bubble", "Name,x,y,s\nA,1,2,3");
    assert.deepEqual(result.table.columns, ["Label", "x", "y", "s"]);
    assert.match(result.alt, /sized by s/);
  });
  it("gives each mean with its error margin", () => {
    const result = text("mean-comparison", "G,Mean,SE\nA,3.4,0.2");
    assert.match(result.summary, /A: 3\.4 ± 0\.2\./);
    assert.match(result.alt, /with error bars showing SE/);
  });
});
