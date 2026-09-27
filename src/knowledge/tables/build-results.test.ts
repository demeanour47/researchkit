import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseTable } from "../charts/table";
import { anovaTable, coefficientTable, factorTable, modelSummary, regressionTable, validityTable } from "./build-results";
import { findColumn, findColumns, nameMatches, normalizeName } from "./columns";
import { MINUS } from "./format";
import { averageVarianceExtracted, compositeReliability, fTestP } from "./stats";
import { DEFAULT_TABLE_OPTIONS, type ResearchTable, type TableOptions } from "./types";

const data = (text: string) => parseTable(text).table;
const options = (changes: Partial<TableOptions> = {}): TableOptions => ({ ...DEFAULT_TABLE_OPTIONS, ...changes });
const texts = (table: ResearchTable) => table.rows.map((row) => row.cells.map((cell) => cell.text));
const headers = (table: ResearchTable, row = 0) => table.header[row].map((cell) => cell.text);
const built = (result: { table: ResearchTable | null; issues: unknown[] }) => {
  assert.ok(result.table, JSON.stringify(result.issues));
  return result.table;
};
const messages = (result: { issues: { message: string }[] }) => result.issues.map((issue) => issue.message).join(" | ");

describe("column names", () => {
  const cases: [string, string][] = [
    ["Adjusted R²", "adjustedr2"],
    ["Std. Error", "stderror"],
    ["β", "beta"],
    ["ΔR²", "deltar2"],
    ["Partial η²", "partialeta2"],
  ];
  for (const [name, expected] of cases)
    it(`reduces “${name}” to “${expected}”`, () => {
      assert.equal(normalizeName(name), expected);
    });
  it("recognises the names software prints", () => {
    assert.ok(nameMatches("Sig.", "p"));
    assert.ok(nameMatches("Unstandardized B", "b"));
    assert.ok(nameMatches("Standardized Beta", "beta"));
    assert.ok(nameMatches("R Square Change", "dr2"));
    assert.ok(!nameMatches("Predictor", "b"));
  });
  it("skips the first column and columns already claimed", () => {
    const table = data("SE,B,Std. Error\n1,2,3");
    assert.equal(findColumn(table, "se"), 0);
    assert.deepEqual(findColumns(table, ["b", "se"]), { b: 1, se: 2 });
  });
});

describe("regressionTable", () => {
  const text = "Predictor,B,SE,β,t,p\n(Constant),8.95,0.41,,21.83,0.000\nScreen time,-0.52,0.09,-0.48,-5.78,0.000\nR²,0.34\nAdjusted R²,0.33\nF,33.45,2,197";
  const table = built(regressionTable(data(text), options()));
  it("formats each predictor's coefficients, with β and p bounded", () => {
    assert.deepEqual(headers(table), ["Predictor", "B", "SE", "β", "t", "p"]);
    assert.deepEqual(texts(table), [
      ["(Constant)", "8.95", "0.41", "", "21.83", "< .001"],
      ["Screen time", `${MINUS}0.52`, "0.09", `${MINUS}.48`, `${MINUS}5.78`, "< .001"],
    ]);
  });
  it("reports the model fit in the note, with p from F", () => {
    assert.equal(table.notes.general[0], "R² = .34, adjusted R² = .33, F(2, 197) = 33.45, p < .001.");
  });
  it("doesn't add stars when p is shown", () => {
    assert.deepEqual(table.notes.probability, []);
  });
  it("calculates p from t when p is missing", () => {
    const noP = built(regressionTable(data("Predictor,B,SE,β,t\nX,0.5,0.1,0.30,2.50\nF,6.25,1,98"), options()));
    assert.deepEqual(headers(noP), ["Predictor", "B", "SE", "β", "t", "p"]);
    assert.equal(texts(noP)[0][5], ".014");
    assert.match(noP.notes.general.join(" "), /calculated from t/);
  });
  it("shows p as asterisks instead of a column when asked", () => {
    const starred = built(regressionTable(data(text), options({ pAsStars: true })));
    assert.deepEqual(headers(starred), ["Predictor", "B", "SE", "β", "t"]);
    assert.equal(texts(starred)[1][3], `${MINUS}.48***`);
    assert.deepEqual(starred.notes.probability, [0.001]);
  });
  it("starts groups at rows with only a name", () => {
    const steps = built(regressionTable(data("Predictor,B,p\nStep 1,,\nX,0.5,0.01\nStep 2,,\nZ,0.2,0.3"), options()));
    assert.deepEqual(steps.rows.map((row) => row.kind), ["group", "body", "group", "body"]);
  });
  it("asks for the model fit when it is missing", () => {
    assert.match(messages(regressionTable(data("Predictor,B\nX,1"), options())), /No model fit was given/);
  });
  it("asks for F's degrees of freedom", () => {
    assert.match(messages(regressionTable(data("Predictor,B\nX,1\nF,3.2"), options())), /two degrees of freedom/);
  });
  it("needs a coefficient column", () => {
    assert.equal(regressionTable(data("Predictor,Value\nX,1"), options()).table, null);
  });
});

describe("coefficientTable", () => {
  const text = "Predictor,B,SE,β,t,p,Lower,Upper,VIF\n(Constant),8.95,0.41,,21.83,0.000,8.14,9.76,\nScreen time,-0.52,0.09,-0.48,-5.78,0.000,-0.70,-0.34,1.12";
  const table = built(coefficientTable(data(text), options()));
  it("groups the interval bounds under 95% CI", () => {
    assert.deepEqual(table.header[0].map((cell) => [cell.text, cell.span ?? 1]), [["Predictor", 1], ["B", 1], ["SE", 1], ["β", 1], ["t", 1], ["p", 1], ["95% CI", 2], ["VIF", 1]]);
    assert.deepEqual(headers(table, 1), ["", "", "", "", "", "", "LL", "UL", ""]);
  });
  it("formats every column", () => {
    assert.deepEqual(texts(table)[1], ["Screen time", `${MINUS}0.52`, "0.09", `${MINUS}.48`, `${MINUS}5.78`, "< .001", `${MINUS}0.70`, `${MINUS}0.34`, "1.12"]);
  });
  it("explains the abbreviations", () => {
    assert.match(table.notes.general.join(" "), /CI = confidence interval; LL = lower limit; UL = upper limit\. VIF = variance inflation factor\./);
  });
  it("uses one header row without an interval", () => {
    assert.equal(built(coefficientTable(data("Predictor,B,SE\nX,1,0.5"), options())).header.length, 1);
  });
  it("warns when only one bound is given", () => {
    assert.match(messages(coefficientTable(data("Predictor,B,Lower\nX,1,0.5"), options())), /Only one confidence interval bound/);
  });
  it("shows p as a column by default, without asterisks", () => {
    assert.deepEqual(table.notes.probability, []);
  });
  it("stars B instead of a p column when asked", () => {
    const starred = built(coefficientTable(data(text), options({ pAsStars: true })));
    assert.ok(!headers(starred).includes("p"));
    assert.equal(texts(starred)[1][1], `${MINUS}0.52***`);
  });
});

describe("modelSummary", () => {
  const text = "Model,R,R²,Adjusted R²,SE,ΔR²,F change,df1,df2\n1,0.41,0.17,0.16,1.12,0.17,40.33,1,198\n2,0.58,0.34,0.33,1.00,0.17,50.71,1,197";
  const table = built(modelSummary(data(text), options()));
  it("shows the columns given, and calculates p for the F change", () => {
    assert.deepEqual(headers(table), ["Model", "R", "R²", "Adjusted R²", "SE", "ΔR²", "ΔF", "df1", "df2", "p"]);
    assert.deepEqual(texts(table)[0], ["1", ".41", ".17", ".16", "1.12", ".17", "40.33", "1", "198", "< .001"]);
    assert.match(table.notes.general.join(" "), /p is for the F change, calculated/);
  });
  it("uses the given p when there is one", () => {
    const given = built(modelSummary(data("Model,R²,p\n1,0.2,0.04"), options()));
    assert.deepEqual(texts(given)[0], ["1", ".20", ".040"]);
  });
  it("needs some model statistics", () => {
    assert.equal(modelSummary(data("Model,Other\n1,2"), options()).table, null);
  });
  it("points out a missing R²", () => {
    assert.match(messages(modelSummary(data("Model,R\n1,0.4"), options())), /No R² column/);
  });
});

describe("anovaTable", () => {
  const text = "Source,SS,df\nBetween groups,24.60,2\nWithin groups,118.20,87\nTotal,142.80,89";
  const table = built(anovaTable(data(text), options()));
  it("calculates MS, F, p and partial eta squared from SS and df", () => {
    const f = 12.3 / (118.2 / 87);
    assert.deepEqual(texts(table)[0], ["Between groups", "24.60", "2", "12.30", f.toFixed(2), fTestP(f, 2, 87) < 0.001 ? "< .001" : "", `.${Math.round((24.6 / 142.8) * 100)}`]);
    assert.deepEqual(texts(table)[1], ["Within groups", "118.20", "87", "1.36", "", "", ""]);
    assert.deepEqual(texts(table)[2], ["Total", "142.80", "89", "", "", "", ""]);
    assert.equal(table.rows[2].kind, "total");
  });
  it("says which values were calculated", () => {
    assert.equal(table.notes.general[0], "MS, F, p and partial η² were calculated from SS and df.");
  });
  it("uses values given instead of calculating them", () => {
    const given = built(anovaTable(data("Source,SS,df,MS,F,p\nGroup,10,1,10,5,0.03\nError,40,20,2,,"), options()));
    assert.deepEqual(texts(given)[0].slice(3, 6), ["10.00", "5.00", ".030"]);
    assert.equal(given.notes.general[0], "partial η² was calculated from SS and df.");
  });
  it("needs SS and df", () => {
    assert.equal(anovaTable(data("Source,F\nA,2"), options()).table, null);
  });
  it("needs an error row to calculate F", () => {
    const result = anovaTable(data("Source,SS,df\nA,10,1\nTotal,20,5"), options());
    assert.equal(result.table, null);
    assert.match(messages(result), /Add the error row/);
  });
  it("warns about a df of zero", () => {
    assert.match(messages(anovaTable(data("Source,SS,df\nA,10,0\nError,20,10"), options())), /df for “A” should be above zero/);
  });
});

describe("factorTable", () => {
  const text = "Item,F1,F2\nA,0.81,0.12\nB,0.20,0.77\nC,0.84,0.45\nEigenvalue,2.41,1.87\n% of variance,40.2,31.1";
  const table = built(factorTable(data(text), options()));
  it("sorts items by the factor they load on most, largest first", () => {
    assert.deepEqual(texts(table).map((row) => row[0]), ["C", "A", "B", "Eigenvalue", "% of variance"]);
  });
  it("suppresses small loadings and bolds each item's highest", () => {
    assert.deepEqual(texts(table)[1], ["A", ".81", ""]);
    assert.equal(table.rows[1].cells[1].bold, true);
    assert.equal(table.rows[0].cells[2].bold, undefined);
  });
  it("keeps eigenvalues and variance explained as footer rows", () => {
    assert.deepEqual(texts(table)[3], ["Eigenvalue", "2.41", "1.87"]);
    assert.deepEqual(texts(table)[4], ["% of variance", "40.2", "31.1"]);
    assert.equal(table.rows[3].kind, "total");
  });
  it("notes the suppression threshold", () => {
    assert.match(table.notes.general[0], /Loadings below \.30 are not shown/);
  });
  it("shows every loading when nothing is suppressed", () => {
    assert.deepEqual(texts(built(factorTable(data(text), options({ suppressBelow: 0 }))))[1], ["A", ".81", ".12"]);
  });
  it("warns about cross-loadings and loadings above 1", () => {
    assert.match(messages(factorTable(data(text), options())), /“C” loads at 0\.40 or more on more than one factor/);
    assert.match(messages(factorTable(data("Item,F1\nA,1.3"), options())), /above 1 in size/);
  });
  it("needs loading columns", () => {
    assert.equal(factorTable(data("Item,Note\nA,x"), options()).table, null);
  });
});

describe("validityTable", () => {
  const text = "Construct,Item,Loading\nSQ,SQ1,0.82\nSQ,SQ2,0.79\nSQ,SQ3,0.85\nWB,WB1,0.60\nWB,WB2,0.55";
  const table = built(validityTable(data(text), options()));
  it("groups items under their construct, with CR and AVE on the first item", () => {
    const loadings = [0.82, 0.79, 0.85];
    assert.deepEqual(texts(table).slice(0, 3), [["SQ"], ["SQ1", ".82", `.${Math.round(compositeReliability(loadings) * 100)}`, `.${Math.round(averageVarianceExtracted(loadings) * 100)}`], ["SQ2", ".79", "", ""]]);
  });
  it("warns when AVE or CR falls below the commonly used values", () => {
    const text2 = messages(validityTable(data(text), options()));
    assert.match(text2, /AVE for “WB” is 0\.33, below the commonly used \.50/);
    assert.match(text2, /CR for “WB” is 0\.50, below the commonly used \.70/);
  });
  it("refuses loadings above 1", () => {
    const result = validityTable(data("Construct,Item,Loading\nX,a,1.2\nX,b,0.8"), options());
    assert.equal(result.table, null);
    assert.match(messages(result), /standardised loadings/);
  });
  it("finds columns by position when unnamed", () => {
    assert.ok(validityTable(data("A,B,C\nX,a,0.7\nX,b,0.8"), options()).table);
  });
});
