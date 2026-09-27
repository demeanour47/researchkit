import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_ROWS, detectDelimiter, numericColumns, parseNumber, parseTable, splitRecords, tableToCsv, textColumns } from "./table";

describe("splitRecords", () => {
  it("splits simple comma-separated lines", () => {
    assert.deepEqual(splitRecords("a,b\n1,2", ","), [["a", "b"], ["1", "2"]]);
  });
  it("trims unquoted fields", () => {
    assert.deepEqual(splitRecords(" a , b ", ","), [["a", "b"]]);
  });
  it("keeps delimiters inside quotes", () => {
    assert.deepEqual(splitRecords('"Smith, J",3', ","), [["Smith, J", "3"]]);
  });
  it("reads doubled quotes as one quote", () => {
    assert.deepEqual(splitRecords('"He said ""yes""",1', ","), [['He said "yes"', "1"]]);
  });
  it("keeps line breaks inside quotes", () => {
    assert.deepEqual(splitRecords('"two\nlines",1', ","), [["two\nlines", "1"]]);
  });
  it("keeps spaces inside quotes", () => {
    assert.deepEqual(splitRecords('" padded ",1', ","), [[" padded ", "1"]]);
  });
  it("handles Windows line endings", () => {
    assert.deepEqual(splitRecords("a,b\r\n1,2\r\n", ","), [["a", "b"], ["1", "2"]]);
  });
  it("handles old Mac line endings", () => {
    assert.deepEqual(splitRecords("a\r1", ","), [["a"], ["1"]]);
  });
  it("drops blank lines", () => {
    assert.deepEqual(splitRecords("a\n\n\n1\n", ","), [["a"], ["1"]]);
  });
  it("keeps empty fields within a row", () => {
    assert.deepEqual(splitRecords("a,,c", ","), [["a", "", "c"]]);
  });
  it("splits on tabs", () => {
    assert.deepEqual(splitRecords("a\tb\n1\t2", "\t"), [["a", "b"], ["1", "2"]]);
  });
  it("keeps an empty quoted final field", () => {
    assert.deepEqual(splitRecords('a,""', ","), [["a", ""]]);
  });
  it("returns nothing for empty text", () => {
    assert.deepEqual(splitRecords("", ","), []);
  });
});

describe("detectDelimiter", () => {
  it("chooses tabs whenever present, as spreadsheets paste them", () => {
    assert.equal(detectDelimiter("a,b\tc"), "\t");
  });
  it("chooses commas by default", () => {
    assert.equal(detectDelimiter("a,b\n1,2"), ",");
  });
  it("chooses semicolons when the first line has more of them", () => {
    assert.equal(detectDelimiter("a;b;c\n1,5;2;3"), ";");
  });
  it("ignores delimiters inside quotes", () => {
    assert.equal(detectDelimiter('"a;b;c",d'), ",");
  });
  it("chooses commas for a single column", () => {
    assert.equal(detectDelimiter("Score\n12\n14"), ",");
  });
  it("skips leading blank lines", () => {
    assert.equal(detectDelimiter("\n\na;b\n1;2"), ";");
  });
});

describe("parseNumber", () => {
  const cases: [string, number | null][] = [
    ["12", 12],
    ["-3.5", -3.5],
    ["+4", 4],
    [".5", 0.5],
    ["1,234", 1234],
    ["1,234,567.89", 1234567.89],
    ["45%", 45],
    ["−7", -7],
    ["–2", -2],
    ["1e3", 1000],
    [" 8 ", 8],
    ["1 000", 1000],
    ["abc", null],
    ["", null],
    ["-", null],
    ["12a", null],
    ["1,23", null],
    ["Infinity", null],
  ];
  for (const [text, expected] of cases)
    it(`reads “${text}” as ${expected}`, () => {
      assert.equal(parseNumber(text), expected);
    });
  it("reads decimal commas when expected", () => {
    assert.equal(parseNumber("3,5", true), 3.5);
  });
  it("reads dotted thousands with decimal commas", () => {
    assert.equal(parseNumber("1.234,5", true), 1234.5);
  });
});

describe("parseTable", () => {
  it("reads a header and numeric column", () => {
    const result = parseTable("Faculty,Participants\nArts,24\nLaw,15");
    assert.equal(result.hasHeader, true);
    assert.deepEqual(result.table.columns, [
      { name: "Faculty", kind: "text" },
      { name: "Participants", kind: "number" },
    ]);
    assert.deepEqual(result.table.rows, [["Arts", 24], ["Law", 15]]);
    assert.deepEqual(result.notes, []);
  });
  it("names columns when there is no header", () => {
    const result = parseTable("1,2\n3,4");
    assert.equal(result.hasHeader, false);
    assert.deepEqual(result.table.columns.map((column) => column.name), ["Column 1", "Column 2"]);
    assert.equal(result.table.rows.length, 2);
  });
  it("treats a single row as data, not a header", () => {
    assert.equal(parseTable("a,b").hasHeader, false);
  });
  it("reads tab-separated spreadsheet pastes", () => {
    const result = parseTable("Group\tMean\nA\t3.4\nB\t2.7");
    assert.equal(result.delimiter, "\t");
    assert.deepEqual(result.table.rows, [["A", 3.4], ["B", 2.7]]);
  });
  it("reads semicolon files with decimal commas", () => {
    const result = parseTable("Group;Mean\nA;3,4\nB;2,7");
    assert.equal(result.delimiter, ";");
    assert.deepEqual(result.table.rows, [["A", 3.4], ["B", 2.7]]);
  });
  it("reads missing values as null and keeps the column numeric", () => {
    const result = parseTable("x,y\n1,NA\n2,\n3,n/a\n4,.\n5,-\n6,NaN\n7,9");
    assert.equal(result.table.columns[1].kind, "number");
    assert.deepEqual(result.table.rows.map((row) => row[1]), [null, null, null, null, null, null, 9]);
  });
  it("treats a column with any word as text", () => {
    const result = parseTable("a,b\n1,2\nthree,4");
    assert.equal(result.table.columns[0].kind, "text");
    assert.deepEqual(result.table.rows.map((row) => row[0]), ["1", "three"]);
  });
  it("treats an all-missing column as text", () => {
    assert.equal(parseTable("a,b\nx,\ny,").table.columns[1].kind, "text");
  });
  it("pads short rows and says so", () => {
    const result = parseTable("a,b,c\n1,2,3\n4,5");
    assert.deepEqual(result.table.rows[1], [4, 5, null]);
    assert.deepEqual(result.notes, ["Row 2 has 2 values instead of 3; the rest are treated as missing."]);
  });
  it("uses singular wording for a one-value row", () => {
    assert.match(parseTable("a,b\n1,2\n3").notes[0], /has 1 value instead of 2/);
  });
  it("widens to the longest row", () => {
    const result = parseTable("a\n1,2");
    assert.equal(result.table.columns.length, 2);
    assert.equal(result.table.columns[1].name, "Column 2");
  });
  it("numbers duplicate column names", () => {
    const names = parseTable("Score,Score,Score\n1,2,3").table.columns.map((column) => column.name);
    assert.deepEqual(names, ["Score", "Score (2)", "Score (3)"]);
  });
  it("names blank header cells by position", () => {
    assert.equal(parseTable("Name,\nA,1").table.columns[1].name, "Column 2");
  });
  it("reports empty input", () => {
    const result = parseTable("   \n  ");
    assert.deepEqual(result.table, { columns: [], rows: [] });
    assert.deepEqual(result.notes, ["There is no data yet."]);
  });
  it("cuts very long tables with a note", () => {
    const text = ["v", ...Array.from({ length: MAX_ROWS + 10 }, (_, index) => String(index))].join("\n");
    const result = parseTable(text);
    assert.equal(result.table.rows.length, MAX_ROWS);
    assert.deepEqual(result.notes, [`Only the first ${MAX_ROWS} rows are used.`]);
  });
  it("reads percentages and thousands in cells", () => {
    assert.deepEqual(parseTable("a,b\nx,45%\ny,\"1,200\"").table.rows, [["x", 45], ["y", 1200]]);
  });
  it("reads quoted category names containing commas", () => {
    assert.deepEqual(parseTable('Reason,Count\n"Work, paid",12').table.rows, [["Work, paid", 12]]);
  });
});

describe("tableToCsv", () => {
  it("round-trips a table", () => {
    const table = parseTable('Name,Score\n"Smith, J",3\nLee,').table;
    const csv = tableToCsv(table);
    assert.equal(csv, 'Name,Score\n"Smith, J",3\nLee,');
    assert.deepEqual(parseTable(csv).table, table);
  });
  it("doubles quotes inside quoted cells", () => {
    assert.equal(tableToCsv({ columns: [{ name: "a", kind: "text" }], rows: [['say "hi"']] }), 'a\n"say ""hi"""');
  });
});

describe("column helpers", () => {
  const table = parseTable("Name,Age,Group,Score\nA,20,x,3\nB,21,y,4").table;
  it("lists numeric columns with their positions", () => {
    assert.deepEqual(numericColumns(table).map(({ index }) => index), [1, 3]);
  });
  it("lists text columns with their positions", () => {
    assert.deepEqual(textColumns(table).map(({ index }) => index), [0, 2]);
  });
});
