import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseTable } from "../charts/table";
import { orderCategories } from "./build-common";
import { chiSquareTable, correlationMatrix, crossTabulation, demographicProfile, descriptiveStatistics, frequencyDistribution, intervalLabel, percentageDistribution, reliability, scaleOf } from "./build-data";
import { MINUS } from "./format";
import { chiSquareTest, cronbachAlpha, pearson } from "./stats";
import { DEFAULT_TABLE_OPTIONS, type ResearchTable, type TableOptions } from "./types";

const data = (text: string) => parseTable(text).table;
const options = (changes: Partial<TableOptions> = {}): TableOptions => ({ ...DEFAULT_TABLE_OPTIONS, ...changes });
const texts = (table: ResearchTable) => table.rows.map((row) => row.cells.map((cell) => cell.text));
const built = (result: { table: ResearchTable | null; issues: unknown[] }) => {
  assert.ok(result.table, JSON.stringify(result.issues));
  return result.table;
};
const messages = (result: { issues: { message: string }[] }) => result.issues.map((issue) => issue.message).join(" | ");

describe("orderCategories", () => {
  it("sorts numbers ascending", () => {
    assert.deepEqual(orderCategories(["3", "1", "10", "2"]), ["1", "2", "3", "10"]);
  });
  it("puts rating words in scale order", () => {
    assert.deepEqual(orderCategories(["Agree", "Neutral", "Strongly disagree", "Strongly agree", "Disagree"]), ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]);
  });
  it("puts yes after no and frequency words in order", () => {
    assert.deepEqual(orderCategories(["Yes", "No"]), ["No", "Yes"]);
    assert.deepEqual(orderCategories(["Often", "Never", "Always", "Sometimes"]), ["Never", "Sometimes", "Often", "Always"]);
  });
  it("keeps other categories in the order they first appear", () => {
    assert.deepEqual(orderCategories(["Science", "Arts", "Science", "Law"]), ["Science", "Arts", "Law"]);
  });
});

describe("demographicProfile", () => {
  const result = demographicProfile(data("Gender,Year\nFemale,1\nMale,2\nFemale,1\nFemale,\nMale,3"), options());
  const table = built(result);
  it("groups categories under each characteristic, with n and %", () => {
    assert.deepEqual(texts(table), [["Gender"], ["Female", "3", "60.0"], ["Male", "2", "40.0"], ["Year"], ["1", "2", "40.0"], ["2", "1", "20.0"], ["3", "1", "20.0"], ["Missing", "1", "20.0"]]);
  });
  it("marks characteristics as row groups spanning the table", () => {
    assert.equal(table.rows[0].kind, "group");
    assert.equal(table.rows[0].cells[0].span, 3);
  });
  it("indents categories and gives N in the note", () => {
    assert.equal(table.rows[1].cells[0].indent, 1);
    assert.deepEqual(table.notes.general, ["N = 5."]);
  });
  it("italicises the n header", () => {
    assert.deepEqual(table.header[0].map((cell) => [cell.text, cell.italic ?? false]), [["Characteristic", false], ["n", true], ["%", false]]);
  });
  it("warns about characteristics with many categories", () => {
    const many = ["ID", ...Array.from({ length: 20 }, (_, index) => `P${index}`)].join("\n");
    assert.match(messages(demographicProfile(data(many), options())), /has 20 categories/);
  });
  it("asks for data when there is none", () => {
    assert.equal(demographicProfile(data(""), options()).table, null);
  });
  it("leaves out empty characteristics", () => {
    const partial = demographicProfile(data("A,B\nx,\ny,"), options());
    assert.match(messages(partial), /“B” has no responses/);
  });
});

describe("frequencyDistribution", () => {
  it("tabulates frequency, percent, valid percent and cumulative percent", () => {
    const table = built(frequencyDistribution(data("Sleep\n6\n7\n7\n8"), options()));
    assert.deepEqual(texts(table), [
      ["6", "1", "25.0", "25.0", "25.0"],
      ["7", "2", "50.0", "50.0", "75.0"],
      ["8", "1", "25.0", "25.0", "100.0"],
      ["Total", "4", "100.0", "", ""],
    ]);
    assert.equal(table.rows[3].kind, "total");
    assert.equal(table.header[0][0].text, "Sleep");
  });
  it("reports missing responses and excludes them from valid percentages", () => {
    const table = built(frequencyDistribution(data("A\nx\nx\ny\n.\n"), options()));
    assert.deepEqual(texts(table), [
      ["x", "2", "50.0", "66.7", "66.7"],
      ["y", "1", "25.0", "33.3", "100.0"],
      ["Missing", "1", "25.0", "", ""],
      ["Total", "4", "100.0", "100.0", ""],
    ]);
  });
  it("groups many numeric values into intervals", () => {
    const values = Array.from({ length: 40 }, (_, index) => String(18 + index));
    const table = built(frequencyDistribution(data(["Age", ...values].join("\n")), options()));
    assert.match(table.notes.general.join(" "), /grouped into intervals of 10/);
    assert.equal(table.rows[0].cells[0].text, "10–19");
    const counts = table.rows.filter((row) => row.kind === "body").reduce((sum, row) => sum + Number(row.cells[1].text), 0);
    assert.equal(counts, 40);
  });
  it("labels intervals", () => {
    assert.equal(intervalLabel(10, 20, true, 2), "10–19");
    assert.equal(intervalLabel(5, 6, true, 2), "5");
    assert.equal(intervalLabel(1.5, 2, false, 1), "1.5 to < 2.0");
  });
  it("warns that only the first column is used", () => {
    assert.match(messages(frequencyDistribution(data("A,B\n1,2"), options())), /Only the first column, “A”/);
  });
  it("refuses a column with no responses", () => {
    assert.equal(frequencyDistribution(data("A,B\n,1\n,2"), options()).table, null);
  });
});

describe("percentageDistribution", () => {
  const table = built(percentageDistribution(data("Q1,Q2\nAgree,Disagree\nAgree,Agree\nDisagree,Agree\nNeutral,"), options()));
  it("puts items in rows and categories in scale order", () => {
    assert.deepEqual(
      table.header[0].map((cell) => cell.text),
      ["Item", "Disagree", "Neutral", "Agree", "n"],
    );
  });
  it("gives percentages of each item's valid responses", () => {
    assert.deepEqual(texts(table), [
      ["Q1", "25.0", "25.0", "50.0", "4"],
      ["Q2", "33.3", "0.0", "66.7", "3"],
    ]);
  });
  it("warns when items don't share a few categories", () => {
    const many = ["Q", ...Array.from({ length: 12 }, (_, index) => `answer ${index}`)].join("\n");
    assert.match(messages(percentageDistribution(data(many), options())), /12 different responses/);
  });
});

describe("crossTabulation", () => {
  const text = "Faculty,App\nArts,Yes\nArts,No\nScience,Yes\nScience,Yes";
  it("gives counts with row percentages and totals", () => {
    const table = built(crossTabulation(data(text), options()));
    assert.deepEqual(texts(table), [
      ["Arts", "1 (50.0)", "1 (50.0)", "2 (100.0)"],
      ["Science", "0 (0.0)", "2 (100.0)", "2 (100.0)"],
      ["Total", "1 (25.0)", "3 (75.0)", "4 (100.0)"],
    ]);
  });
  it("groups the column categories under the variable's name", () => {
    const table = built(crossTabulation(data(text), options()));
    assert.deepEqual(table.header[0].map((cell) => [cell.text, cell.span ?? 1]), [["", 1], ["App", 2], ["", 1]]);
    assert.deepEqual(table.header[1].map((cell) => cell.text), ["Faculty", "No", "Yes", "Total"]);
  });
  it("gives column percentages", () => {
    assert.deepEqual(texts(built(crossTabulation(data(text), options({ percentBase: "column" }))))[0], ["Arts", "1 (100.0)", "1 (33.3)", "2 (50.0)"]);
  });
  it("gives percentages of the whole sample", () => {
    assert.deepEqual(texts(built(crossTabulation(data(text), options({ percentBase: "total" }))))[0], ["Arts", "1 (25.0)", "1 (25.0)", "2 (50.0)"]);
  });
  it("gives counts alone", () => {
    const table = built(crossTabulation(data(text), options({ percentBase: "none" })));
    assert.deepEqual(texts(table)[2], ["Total", "1", "3", "4"]);
    assert.deepEqual(table.notes.general, ["Values are counts."]);
  });
  it("notes participants excluded for missing answers", () => {
    assert.match(built(crossTabulation(data(`${text}\nLaw,`), options())).notes.general.join(" "), /1 participant missing either variable is excluded/);
  });
  it("needs two columns", () => {
    assert.equal(crossTabulation(data("A\nx"), options()).table, null);
  });
});

describe("descriptiveStatistics", () => {
  const table = built(descriptiveStatistics(data("Name,Score,Hours\nA,1,2\nB,2,4\nC,3,6\nD,4,8\nE,5,"), options()));
  it("reports n, M, SD, min, max, skewness and kurtosis for each numeric column", () => {
    assert.deepEqual(texts(table)[0], ["Score", "5", "3.00", "1.58", "1.00", "5.00", "0.00", `${MINUS}1.20`]);
    assert.deepEqual(texts(table)[1].slice(0, 6), ["Hours", "4", "5.00", "2.58", "2.00", "8.00"]);
  });
  it("leaves out text columns, with a warning", () => {
    assert.match(messages(descriptiveStatistics(data("Name,Score\nA,1\nB,2\nC,3"), options())), /“Name” isn't numeric/);
  });
  it("gives N only when every variable has the same n", () => {
    assert.doesNotMatch(table.notes.general.join(" "), /^N =/);
    assert.match(built(descriptiveStatistics(data("A,B\n1,2\n2,3\n3,5\n4,4"), options())).notes.general[0], /^N = 4\./);
  });
  it("uses the chosen decimals", () => {
    assert.equal(texts(built(descriptiveStatistics(data("A\n1\n2\n4"), options({ decimals: 3 }))))[0][2], "2.333");
  });
  it("needs a numeric column", () => {
    assert.equal(descriptiveStatistics(data("A\nx\ny"), options()).table, null);
  });
  it("warns when too few values for skewness", () => {
    assert.match(messages(descriptiveStatistics(data("A\n1\n2"), options())), /skewness needs 3/);
  });
});

describe("correlationMatrix", () => {
  const text = "X,Y,Z\n1,2,5\n2,1,4\n3,4,3\n4,3,2\n5,5,1";
  const table = built(correlationMatrix(data(text), options()));
  it("numbers the variables and gives M and SD", () => {
    assert.deepEqual(texts(table).map((row) => row.slice(0, 3)), [
      ["1. X", "3.00", "1.58"],
      ["2. Y", "3.00", "1.58"],
      ["3. Z", "3.00", "1.58"],
    ]);
  });
  it("fills the lower triangle, with dashes on the diagonal and the last column left out", () => {
    const r = pearson([1, 2, 3, 4, 5], [2, 1, 4, 3, 5]);
    assert.equal(r.r, 0.8);
    assert.deepEqual(table.header[0].map((cell) => cell.text), ["Variable", "M", "SD", "1", "2"]);
    assert.deepEqual(texts(table)[0].slice(3), ["—", ""]);
    assert.deepEqual(texts(table)[1].slice(3), [".80", "—"]);
    assert.deepEqual(texts(table)[2].slice(3), [`${MINUS}1.00***`, `${MINUS}.80`]);
  });
  it("explains the stars it uses", () => {
    assert.deepEqual(table.notes.probability, [0.001]);
    assert.match(table.notes.general.join(" "), /N = 5\. Correlations are Pearson's r/);
  });
  it("keeps the leading zero outside APA", () => {
    assert.equal(texts(built(correlationMatrix(data(text), options({ style: "harvard" }))))[1][3], "0.80");
  });
  it("leaves stars off when asked", () => {
    const plain = built(correlationMatrix(data(text), options({ stars: false })));
    assert.equal(texts(plain)[2][3], `${MINUS}1.00`);
    assert.deepEqual(plain.notes.probability, []);
  });
  it("uses Spearman's rho when asked", () => {
    assert.match(built(correlationMatrix(data(text), options({ correlation: "spearman" }))).notes.general.join(" "), /Spearman's rho/);
  });
  it("reports the range of n with missing values", () => {
    assert.match(built(correlationMatrix(data("X,Y,Z\n1,2,5\n2,1,4\n3,4,3\n4,,2\n5,5,1"), options())).notes.general[0], /n ranges from 4 to 5/);
  });
  it("needs two numeric columns", () => {
    assert.equal(correlationMatrix(data("X\n1\n2"), options()).table, null);
  });
  it("warns when a correlation can't be calculated", () => {
    assert.match(messages(correlationMatrix(data("X,Y\n1,1\n2,1\n3,1"), options())), /can't be calculated/);
  });
});

describe("reliability", () => {
  it("groups items into scales by their stem", () => {
    assert.deepEqual(scaleOf("SQ1"), { scale: "SQ", item: "SQ1" });
    assert.deepEqual(scaleOf("wb_2"), { scale: "wb", item: "wb_2" });
    assert.deepEqual(scaleOf("Sleep quality: Q3"), { scale: "Sleep quality", item: "Q3" });
    assert.deepEqual(scaleOf("Motivation"), { scale: "Motivation", item: "Motivation" });
  });
  const text = "A1,A2,B1,B2\n1,2,5,4\n2,1,4,5\n3,4,3,3\n4,3,2,2\n5,5,1,1";
  it("reports items, M, SD and alpha for each scale", () => {
    const table = built(reliability(data(text), options()));
    const alpha = cronbachAlpha([[1, 2, 3, 4, 5], [2, 1, 4, 3, 5]]).alpha;
    assert.deepEqual(texts(table)[0], ["A", "2", "3.00", "1.50", `.${Math.round(alpha * 100)}`]);
    assert.equal(texts(table).length, 2);
  });
  it("adds item-total statistics when asked", () => {
    const table = built(reliability(data(text), options({ itemDetails: true })));
    assert.equal(table.header[0].length, 7);
    assert.deepEqual(texts(table).map((row) => row[0]), ["A", "A1", "A2", "B", "B1", "B2"]);
    assert.equal(table.rows[1].cells[0].indent, 1);
  });
  it("warns about one-item scales", () => {
    assert.match(messages(reliability(data("A1,A2,C1\n1,2,3\n2,3,4\n3,3,5"), options())), /“C” has one item/);
  });
  it("warns about negative alpha", () => {
    assert.match(messages(reliability(data("R1,R2\n1,5\n2,4\n3,2\n4,2\n5,1"), options())), /negative/);
  });
  it("refuses data with no scale of two items", () => {
    assert.equal(reliability(data("A,B\n1,2\n2,3"), options()).table, null);
  });
});

describe("chiSquareTable", () => {
  const text = ["Group,Gender", ...Array.from({ length: 10 }, (_, index) => `${index % 2 ? "Control" : "Intervention"},${index < 7 ? "Female" : "Male"}`)].join("\n");
  const table = built(chiSquareTable(data(text), options()));
  it("gives n (%) by group with χ², df, p and V on the characteristic's row", () => {
    const test = chiSquareTest([
      [4, 3],
      [1, 2],
    ]);
    assert.deepEqual(texts(table)[0].slice(3), [test.chi2.toFixed(2), "1", `.${Math.round(test.p * 1000)}`, `.${Math.round(test.cramersV * 100)}`]);
    assert.deepEqual(texts(table)[1], ["Female", "4 (80.0)", "3 (60.0)", "", "", "", ""]);
  });
  it("heads the groups with the grouping variable", () => {
    assert.deepEqual(table.header[0][1], { text: "Group", span: 2 });
    assert.deepEqual(table.header[1].map((cell) => cell.text), ["Characteristic", "Intervention", "Control", "χ²", "df", "p", "V"]);
  });
  it("adds a lettered note when expected counts are small", () => {
    assert.equal(table.notes.specific[0].mark, "a");
    assert.deepEqual(table.rows[0].cells[3].notes, ["a"]);
  });
  it("needs two groups", () => {
    assert.equal(chiSquareTable(data("Group,X\nA,y\nA,z"), options()).table, null);
  });
  it("warns about characteristics with one category", () => {
    assert.match(messages(chiSquareTable(data("Group,X,Y\nA,y,1\nB,y,2"), options())), /“X” has fewer than two categories/);
  });
});
