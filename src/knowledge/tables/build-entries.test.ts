import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TIMELINE_MARK, captionList, customTable, headingLevel, rawRecords, referenceCoding, researchTimeline, tableOfContents } from "./build-entries";
import { MINUS } from "./format";
import { DEFAULT_TABLE_OPTIONS, type ResearchTable, type TableOptions } from "./types";

const options = (changes: Partial<TableOptions> = {}): TableOptions => ({ ...DEFAULT_TABLE_OPTIONS, ...changes });
const texts = (table: ResearchTable) => table.rows.map((row) => row.cells.map((cell) => cell.text));
const built = (result: { table: ResearchTable | null; issues: unknown[] }) => {
  assert.ok(result.table, JSON.stringify(result.issues));
  return result.table;
};
const messages = (result: { issues: { message: string }[] }) => result.issues.map((issue) => issue.message).join(" | ");

describe("rawRecords", () => {
  it("keeps text exactly as entered", () => {
    assert.deepEqual(rawRecords("Study,Sample\nA,1 204 adolescents\nB,0.050"), { header: ["Study", "Sample"], rows: [["A", "1 204 adolescents"], ["B", "0.050"]] });
  });
  it("pads short rows", () => {
    assert.deepEqual(rawRecords("a,b,c\n1").rows, [["1", "", ""]]);
  });
});

describe("tableOfContents", () => {
  it("sets levels from the numbering", () => {
    assert.deepEqual([headingLevel("1 Introduction"), headingLevel("2.1 Background"), headingLevel("3.1.2 Measures"), headingLevel("References"), headingLevel("1.2.3.4.5 Deep")], [1, 2, 3, 1, 4]);
  });
  const table = built(tableOfContents("Heading,Page\n1 Introduction,1\n1.1 Background,2\nReferences,40", options()));
  it("indents sub-sections and bolds chapters", () => {
    assert.deepEqual(texts(table), [["1 Introduction", "1"], ["1.1 Background", "2"], ["References", "40"]]);
    assert.deepEqual(table.rows.map((row) => [row.cells[0].indent, row.cells[0].bold ?? false]), [[0, true], [1, false], [0, true]]);
  });
  it("uses a Level column when given", () => {
    const levelled = built(tableOfContents("Level,Heading,Page\n1,Introduction,1\n2,Background,2", options()));
    assert.deepEqual(levelled.rows.map((row) => row.cells[0].indent), [0, 1]);
  });
  it("warns about missing page numbers", () => {
    assert.match(messages(tableOfContents("Heading,Page\nIntro,\nMethod,5", options())), /no page number/);
  });
  it("needs entries", () => {
    assert.equal(tableOfContents("Heading,Page", options()).table, null);
  });
});

describe("captionList", () => {
  it("numbers tables automatically", () => {
    const table = built(captionList("list-of-tables", "Title,Page\nA,3\nB,7", options()));
    assert.deepEqual(texts(table), [["1", "A", "3"], ["2", "B", "7"]]);
    assert.deepEqual(table.header[0].map((cell) => cell.text), ["Table", "Title", "Page"]);
  });
  it("uses Roman numerals for IEEE tables but not figures", () => {
    assert.deepEqual(texts(built(captionList("list-of-tables", "Title,Page\nA,3\nB,7", options({ style: "ieee" })))).map((row) => row[0]), ["I", "II"]);
    const figures = built(captionList("list-of-figures", "Title,Page\nA,3\nB,7", options({ style: "ieee" })));
    assert.deepEqual(texts(figures).map((row) => row[0]), ["1", "2"]);
    assert.equal(figures.header[0][0].text, "Fig.");
  });
  it("keeps numbers given in a first column", () => {
    assert.deepEqual(texts(built(captionList("list-of-figures", "Number,Title,Page\n4.1,Model,30", options())))[0], ["4.1", "Model", "30"]);
  });
  it("warns when there are no page numbers", () => {
    assert.match(messages(captionList("list-of-tables", "Title\nA\nB", options())), /No page numbers/);
  });
});

describe("researchTimeline", () => {
  const table = built(researchTimeline("Activity,Start,End\nReview,1,3\nCollect,3,4", options()));
  it("marks each activity's months", () => {
    assert.deepEqual(texts(table), [
      ["Review", TIMELINE_MARK, TIMELINE_MARK, TIMELINE_MARK, ""],
      ["Collect", "", "", TIMELINE_MARK, TIMELINE_MARK],
    ]);
    assert.equal(table.rows[0].cells[1].mark, true);
  });
  it("numbers the months under a spanning heading", () => {
    assert.deepEqual(table.header[0][1], { text: "Month", span: 4 });
    assert.deepEqual(table.header[1].map((cell) => cell.text), ["Activity", "1", "2", "3", "4"]);
  });
  it("leaves out activities that end before they start or have no months", () => {
    const result = researchTimeline("Activity,Start,End\nA,5,2\nB,x,3\nC,1,2", options());
    assert.match(messages(result), /“A” ends \(month 2\) before it starts/);
    assert.match(messages(result), /“B” needs whole month numbers/);
    assert.equal(built(result).rows.length, 1);
  });
  it("warns about long timelines in portrait and refuses over 36 months", () => {
    assert.match(messages(researchTimeline("Activity,Start,End\nA,1,18", options())), /landscape/);
    assert.equal(researchTimeline("Activity,Start,End\nA,1,40", options()).table, null);
  });
  it("needs three columns", () => {
    assert.equal(researchTimeline("Activity,Start\nA,1", options()).table, null);
  });
});

describe("referenceCoding", () => {
  it("keeps every column as text", () => {
    const table = built(referenceCoding("Study,Year,Sample\nStudy A,2021,1 204 adults", options()));
    assert.deepEqual(texts(table), [["Study A", "2021", "1 204 adults"]]);
  });
  it("warns about rows without a study", () => {
    assert.match(messages(referenceCoding("Study,Theme\n,Sleep", options())), /1 row has no study/);
  });
});

describe("customTable", () => {
  it("rounds decimals, keeps whole numbers whole and formats p columns", () => {
    const table = built(customTable("custom", "Group,n,M,p\nA,45,6.824,0.0004\nB,43,-6.2,0.2", options()));
    assert.deepEqual(texts(table), [
      ["A", "45", "6.82", "< .001"],
      ["B", "43", `${MINUS}6.20`, ".200"],
    ]);
  });
  it("starts groups at rows with only a first cell", () => {
    const table = built(customTable("custom", "Name,Value\nGroup one,\nA,1.5", options()));
    assert.deepEqual(table.rows.map((row) => row.kind), ["group", "body"]);
  });
  it("reads note markers such as ^a", () => {
    const table = built(customTable("custom", "Name,Value\nA^a,1.5^b", options()));
    assert.deepEqual(table.rows[0].cells.map((cell) => [cell.text, cell.notes]), [["A", ["a"]], ["1.50", ["b"]]]);
  });
  it("keeps text columns as entered", () => {
    assert.deepEqual(texts(built(customTable("custom", "Item,Wording\nQ1,I sleep well", options()))), [["Q1", "I sleep well"]]);
  });
  it("numbers appendix tables with the letter and checks it", () => {
    assert.match(messages(customTable("appendix", "A,B\n1,2", options({ appendix: "12" }))), /appendix letter should be a letter/);
  });
  it("warns about wide tables in portrait", () => {
    assert.match(messages(customTable("custom", `${"abcdefghij".split("").join(",")}\n${"1234567890".split("").join(",")}`, options())), /10 columns/);
  });
});
