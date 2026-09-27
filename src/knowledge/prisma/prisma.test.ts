import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diagramProblems } from "../diagrams/validate";
import { renderDiagram, diagramPdf } from "../diagrams/export";
import { DEFAULT_LAYOUT_OPTIONS, ORIENTATIONS, THEMES, TYPEFACES } from "../diagrams/types";
import { EDGE_IDS, defaultLabels, labelsFor, prismaDiagram } from "./diagram";
import { computeFlow, countText, sumCounts } from "./flow";
import { countRecords, includedFromMatrix } from "./records";
import { altText, diagramTitle, flowParagraph, flowTable } from "./summary";
import { SAMPLE_INPUT, WITH_OTHER_METHODS } from "./test-helpers";
import { COMMON_REASONS, EMPTY_PRISMA_INPUT, LABEL_KEYS, PRISMA_KINDS, PRISMA_KIND_INFO, getKind, type PrismaInput } from "./types";
import { CHECK_KIND_LABELS, FIELD_NAMES, canDraw, prismaIssues } from "./validate";

const input = (changes: Partial<PrismaInput> = {}): PrismaInput => ({ ...SAMPLE_INPUT, ...changes });
const messages = (value: PrismaInput) => prismaIssues(value).map((issue) => `${issue.severity}:${issue.kind}:${issue.field}:${issue.message}`);
const has = (value: PrismaInput, pattern: RegExp) => assert.ok(messages(value).some((message) => pattern.test(message)), `No message matches ${pattern}: ${JSON.stringify(messages(value))}`);
const texts = (value: PrismaInput) => prismaDiagram(value, "T").nodes.flatMap((node) => node.paragraphs.map((paragraph) => paragraph.text));

describe("the diagram types", () => {
  it("describes every type", () => {
    assert.equal(PRISMA_KINDS.length, 5);
    for (const kind of PRISMA_KINDS) assert.ok(PRISMA_KIND_INFO[kind].label && PRISMA_KIND_INFO[kind].description.endsWith("."));
  });
  it("offers the common exclusion reasons", () => {
    assert.deepEqual([...COMMON_REASONS], ["Wrong population", "Wrong intervention", "Wrong methodology", "Wrong publication type", "No full text", "Duplicate", "Language restriction", "Conference abstract", "Insufficient data", "Other"]);
  });
  it("refuses unknown types", () => {
    assert.throws(() => getKind("consort" as never), /Unknown diagram type: consort/);
  });
  it("labels every check kind and field", () => {
    for (const kind of Object.keys(CHECK_KIND_LABELS)) assert.ok(CHECK_KIND_LABELS[kind as keyof typeof CHECK_KIND_LABELS]);
    assert.ok(FIELD_NAMES.screened);
  });
});

describe("flow calculation", () => {
  const flow = computeFlow(SAMPLE_INPUT);
  it("adds the sources", () => {
    assert.deepEqual([flow.databases, flow.registers, flow.identified], [1200, 50, 1250]);
  });
  it("calculates every stage from the one before", () => {
    assert.equal(flow.removed, 260);
    assert.deepEqual(flow.screened, { value: 990, expected: 990, calculated: true });
    assert.deepEqual(flow.sought, { value: 140, expected: 140, calculated: true });
    assert.deepEqual(flow.assessed, { value: 135, expected: 135, calculated: true });
    assert.equal(flow.reportsExcluded, 110);
    assert.equal(flow.mainIncluded, 25);
    assert.deepEqual(flow.reportsIncluded, { value: 25, expected: 25, calculated: true });
    assert.equal(flow.studiesIncluded, 22);
  });
  it("uses entered values, keeping what was expected", () => {
    const entered = computeFlow(input({ screened: 1000 }));
    assert.deepEqual(entered.screened, { value: 1000, expected: 990, calculated: false });
    assert.equal(entered.sought.value, 150);
  });
  it("adds the other methods column into the included reports", () => {
    const other = computeFlow(WITH_OTHER_METHODS);
    assert.deepEqual([other.otherIdentified, other.otherSought.value, other.otherAssessed.value, other.otherExcluded, other.otherIncluded], [30, 28, 26, 20, 6]);
    assert.equal(other.reportsIncluded.value, 31);
    assert.equal(other.otherSought.expected, 30);
  });
  it("ignores the other methods column when it is off", () => {
    const off = computeFlow({ ...WITH_OTHER_METHODS, otherMethods: false });
    assert.deepEqual([off.otherIdentified, off.otherIncluded, off.reportsIncluded.value], [null, null, 25]);
  });
  it("leaves stages unknown until the sources are entered", () => {
    const empty = computeFlow(EMPTY_PRISMA_INPUT);
    assert.deepEqual([empty.identified, empty.screened.value, empty.reportsIncluded.value, empty.studiesIncluded], [null, null, null, null]);
    assert.equal(empty.screened.calculated, false);
  });
  it("treats missing removals as none", () => {
    assert.equal(computeFlow(input({ duplicates: null, automation: null, removedOther: null })).screened.value, 1250);
  });
  it("counts studies as reports when studies aren't given", () => {
    assert.equal(computeFlow(input({ studiesIncluded: null })).studiesIncluded, 25);
  });
  it("adds counts, ignoring blanks", () => {
    assert.equal(sumCounts([{ id: "a", name: "A", count: 3 }, { id: "b", name: "B", count: null }]), 3);
    assert.equal(sumCounts([{ id: "a", name: "A", count: null }]), null);
    assert.equal(sumCounts([]), null);
  });
  it("writes counts as PRISMA does", () => {
    assert.deepEqual([countText(1204), countText(0), countText(null), countText(1234567)], ["n = 1,204", "n = 0", "n = ", "n = 1,234,567"]);
  });
});

describe("validation: a consistent review", () => {
  it("has no problems or warnings", () => {
    assert.deepEqual(prismaIssues(SAMPLE_INPUT), []);
  });
  it("can be drawn", () => {
    assert.equal(canDraw(prismaIssues(SAMPLE_INPUT)), true);
  });
});

describe("validation: values", () => {
  const cases: [string, Partial<PrismaInput>, RegExp][] = [
    ["negative duplicates", { duplicates: -5 }, /problem:value:duplicates:Duplicate records removed can't be negative/],
    ["fractional counts", { screenedExcluded: 2.5 }, /problem:value:screenedExcluded:Records excluded must be a whole number/],
    ["negative source counts", { databases: [{ id: "db1", name: "MEDLINE", count: -1 }] }, /problem:value:databases\.db1:MEDLINE can't be negative/],
    ["negative reasons", { reasons: [{ id: "r1", label: "Other", count: -2 }] }, /problem:value:reasons\.r1:Other can't be negative/],
    ["infinite values", { notRetrieved: Infinity }, /must be a whole number/],
    ["negative studies", { studiesIncluded: -1 }, /Studies included can't be negative/],
  ];
  for (const [name, changes, pattern] of cases)
    it(`finds ${name}`, () => {
      has(input(changes), pattern);
    });
  it("stops the drawing only for invalid numbers", () => {
    assert.equal(canDraw(prismaIssues(input({ duplicates: -5 }))), false);
    assert.equal(canDraw(prismaIssues(input({ screened: 5 }))), true);
  });
  it("checks other-methods values only when the column is on", () => {
    assert.deepEqual(prismaIssues(input({ otherSought: -3 })), []);
    has({ ...WITH_OTHER_METHODS, otherSought: -3 }, /Reports sought from other methods can't be negative/);
  });
  it("finds unnamed sources and reasons", () => {
    has(input({ databases: [{ id: "db1", name: " ", count: 10 }] }), /A database with 10 records has no name/);
    has(input({ reasons: [{ id: "r1", label: "", count: 4 }] }), /problem:missing:reasons\.r1:An exclusion reason with 4 reports has no wording/);
  });
  it("finds repeated sources and reasons", () => {
    has(input({ databases: [{ id: "a", name: "Scopus", count: 1 }, { id: "b", name: "scopus", count: 2 }] }), /“scopus” is listed twice/);
    has(input({ reasons: [{ id: "a", label: "Other", count: 1 }, { id: "b", label: "Other", count: 2 }] }), /The reason “other” is listed twice/);
  });
  it("asks for the count of a named reason", () => {
    has(input({ reasons: [...SAMPLE_INPUT.reasons, { id: "r4", label: "Duplicate", count: null }] }), /warning:missing:reasons\.r4:Give the number of reports excluded for “Duplicate”/);
  });
});

describe("validation: missing values", () => {
  it("needs records identified", () => {
    has(EMPTY_PRISMA_INPUT, /problem:missing:databases:Enter the records identified/);
  });
  const warnings: [string, Partial<PrismaInput>, RegExp][] = [
    ["duplicates", { duplicates: null }, /warning:missing:duplicates:Enter the duplicate records removed, or 0/],
    ["records excluded", { screenedExcluded: null }, /warning:missing:screenedExcluded/],
    ["reports not retrieved", { notRetrieved: null }, /warning:missing:notRetrieved/],
    ["exclusion reasons", { reasons: [] }, /warning:missing:reasons:PRISMA 2020 asks for the reasons/],
    ["studies included", { studiesIncluded: null }, /warning:missing:studiesIncluded/],
  ];
  for (const [name, changes, pattern] of warnings)
    it(`asks for ${name}`, () => {
      has(input(changes), pattern);
    });
  it("doesn't ask a narrative review for exclusions", () => {
    const narrative = messages(input({ kind: "narrative", duplicates: null, screenedExcluded: null, notRetrieved: null, reasons: [] }));
    assert.ok(!narrative.some((message) => /duplicates|screenedExcluded|notRetrieved|reasons/.test(message)), narrative.join(" | "));
  });
  it("asks for other-methods records when the column is on", () => {
    has({ ...WITH_OTHER_METHODS, otherSources: [{ id: "x", name: "Websites", count: null }] }, /warning:missing:otherSources/);
  });
});

describe("validation: arithmetic", () => {
  it("finds records screened that don't add up", () => {
    has(input({ screened: 1000 }), /problem:arithmetic:screened:Records screened is 1,000, but records identified \(1,250\) less records removed \(260\) gives 990/);
  });
  it("finds reports sought that don't add up", () => {
    has(input({ sought: 150 }), /problem:arithmetic:sought:Reports sought for retrieval is 150, but records screened \(990\) less records excluded \(850\) gives 140/);
  });
  it("finds reports assessed that don't add up", () => {
    has(input({ assessed: 130 }), /problem:arithmetic:assessed:Reports assessed for eligibility is 130/);
  });
  it("finds included reports that don't add up", () => {
    has(input({ reportsIncluded: 30 }), /problem:arithmetic:reportsIncluded:Reports of included studies is 30, but reports assessed less reports excluded gives 25/);
  });
  it("warns when not every other-methods record was sought", () => {
    has(WITH_OTHER_METHODS, /warning:arithmetic:otherSought/);
  });
  it("accepts entered values that add up", () => {
    assert.deepEqual(prismaIssues(input({ screened: 990, sought: 140, assessed: 135, reportsIncluded: 25 })), []);
  });
});

describe("validation: flow integrity and sequence", () => {
  it("finds more removed than identified", () => {
    has(input({ duplicates: 2000 }), /problem:integrity:duplicates:Records removed before screening \(2,010\) is more than records identified \(1,250\)/);
  });
  it("finds more excluded than screened", () => {
    has(input({ screenedExcluded: 1000 }), /problem:integrity:screenedExcluded:Records excluded \(1,000\) is more than records screened \(990\)/);
  });
  it("finds more not retrieved than sought", () => {
    has(input({ notRetrieved: 200 }), /problem:integrity:notRetrieved:Reports not retrieved \(200\) is more than reports sought \(140\)/);
  });
  it("finds more excluded than assessed", () => {
    has(input({ reasons: [{ id: "r1", label: "Other", count: 200 }] }), /problem:integrity:reasons:Reports excluded \(200\) is more than reports assessed \(135\)/);
  });
  it("finds more studies than reports", () => {
    has(input({ studiesIncluded: 30 }), /problem:integrity:studiesIncluded:Studies included \(30\) is more than the reports of included studies \(25\)/);
  });
  it("finds stages larger than the one before", () => {
    has(input({ screened: 2000 }), /problem:sequence:screened:Records screened \(2,000\) can't be more than records identified \(1,250\)/);
    has(input({ assessed: 500 }), /problem:sequence:assessed:Reports assessed \(500\) can't be more than reports sought \(140\)/);
  });
  it("finds stages that work out negative", () => {
    has(input({ duplicates: 2000 }), /Records screened works out as -760/);
  });
  it("checks the other-methods column", () => {
    has({ ...WITH_OTHER_METHODS, otherNotRetrieved: 40 }, /Reports not retrieved from other methods \(40\) is more than reports sought \(28\)/);
    has({ ...WITH_OTHER_METHODS, otherReasons: [{ id: "o1", label: "Other", count: 99 }] }, /Reports excluded from other methods \(99\) is more than reports assessed \(26\)/);
  });
  it("warns about an empty review", () => {
    has(input({ studiesIncluded: 0 }), /warning:sequence:studiesIncluded:No studies are included/);
  });
  it("reports each message once", () => {
    const all = messages(input({ duplicates: 2000 }));
    assert.equal(new Set(all).size, all.length);
  });
});

describe("labels", () => {
  it("has standard wording for every box and type", () => {
    for (const kind of PRISMA_KINDS) {
      const labels = defaultLabels(kind);
      for (const key of LABEL_KEYS) assert.equal(typeof labels[key], "string", `${kind} ${key}`);
    }
  });
  it("uses the PRISMA 2020 template's wording", () => {
    const labels = defaultLabels("prisma-2020");
    assert.deepEqual([labels.identificationHeader, labels.screened, labels.sought, labels.assessed, labels.included], ["Identification of studies via databases and registers", "Records screened", "Reports sought for retrieval", "Reports assessed for eligibility", "Studies included in review"]);
  });
  it("speaks of sources of evidence in scoping reviews", () => {
    assert.equal(defaultLabels("scoping").included, "Sources of evidence included in review");
    assert.equal(defaultLabels("scoping").assessed, "Full texts assessed for eligibility");
  });
  it("adds a note placeholder for rapid reviews", () => {
    assert.match(defaultLabels("rapid").note, /^Streamlined methods: \[/);
    assert.equal(defaultLabels("prisma-2020").note, "");
  });
  it("uses the researcher's wording, falling back to the standard", () => {
    const labels = labelsFor({ kind: "prisma-2020", labels: { screened: "Titles and abstracts screened", sought: "  " } });
    assert.equal(labels.screened, "Titles and abstracts screened");
    assert.equal(labels.sought, "Reports sought for retrieval");
  });
});

describe("prismaDiagram", () => {
  const diagram = prismaDiagram(SAMPLE_INPUT, "Title");
  it("is a sound diagram for the engine", () => {
    assert.deepEqual(diagramProblems(diagram), []);
  });
  it("follows the template's grid", () => {
    assert.deepEqual([diagram.columns, diagram.rows], [2, 6]);
    assert.deepEqual(diagram.bands.map((band) => [band.label, band.fromRow, band.toRow]), [["Identification", 1, 1], ["Screening", 2, 4], ["Included", 5, 5]]);
  });
  it("writes every count into its box", () => {
    const all = texts(SAMPLE_INPUT);
    for (const text of ["Databases (n = 1,200)", "Registers (n = 50)", "Duplicate records removed (n = 250)", "Records screened (n = 990)", "Records excluded (n = 850)", "Reports sought for retrieval (n = 140)", "Reports not retrieved (n = 5)", "Reports assessed for eligibility (n = 135)", "Wrong population (n = 60)", "Studies included in review (n = 22)", "Reports of included studies (n = 25)"]) assert.ok(all.includes(text), text);
  });
  it("leaves blanks for unknown counts", () => {
    assert.ok(texts(EMPTY_PRISMA_INPUT).includes("Records screened (n = )"));
    assert.ok(texts(EMPTY_PRISMA_INPUT).includes("[Reason] (n = )"));
  });
  it("draws the template's arrows", () => {
    assert.deepEqual(diagram.edges.map((edge) => edge.id), ["identified-removed", "identified-screened", "screened-excluded", "screened-sought", "sought-notRetrieved", "sought-assessed", "assessed-excluded", "assessed-included"]);
    assert.ok(diagram.edges.every((edge) => (EDGE_IDS as readonly string[]).includes(edge.id)));
  });
  it("hides and labels arrows as asked", () => {
    const edited = prismaDiagram(input({ hiddenArrows: ["identified-removed"], arrowLabels: { "screened-sought": " title/abstract " } }), "T");
    assert.equal(edited.edges.find((edge) => edge.id === "identified-removed")!.hidden, true);
    assert.equal(edited.edges.find((edge) => edge.id === "screened-sought")!.label, "title/abstract");
  });
  it("uses edited wording in its boxes", () => {
    assert.ok(texts(input({ labels: { screened: "Titles screened" } })).includes("Titles screened (n = 990)"));
  });
  it("adds the other methods column", () => {
    const other = prismaDiagram(WITH_OTHER_METHODS, "T");
    assert.equal(other.columns, 4);
    assert.deepEqual(diagramProblems(other), []);
    assert.ok(other.edges.some((edge) => edge.id === "other-assessed-included" && edge.to === "included"));
    assert.ok(texts(WITH_OTHER_METHODS).includes("Citation searching (n = 25)"));
    assert.ok(texts(WITH_OTHER_METHODS).includes("Reports of included studies (n = 31)"));
  });
  it("lists every source in PRISMA-S", () => {
    const listed = texts(input({ kind: "prisma-s" }));
    for (const text of ["MEDLINE (n = 700)", "Scopus (n = 500)", "ClinicalTrials.gov (n = 50)"]) assert.ok(listed.includes(text), text);
    assert.ok(!listed.includes("Databases (n = 1,200)"));
  });
  it("draws a narrative review as one column without exclusions", () => {
    const narrative = prismaDiagram(input({ kind: "narrative" }), "T");
    assert.equal(narrative.columns, 1);
    assert.deepEqual(narrative.nodes.map((node) => node.id), ["identification-header", "identified", "screened", "assessed", "included"]);
    assert.deepEqual(diagramProblems(narrative), []);
  });
  it("adds a rapid review's note box, spanning the diagram", () => {
    const rapid = prismaDiagram(input({ kind: "rapid" }), "T");
    const note = rapid.nodes.find((node) => node.id === "note")!;
    assert.equal(note.span, 2);
    assert.equal(rapid.rows, 7);
    assert.equal(prismaDiagram(input({ kind: "rapid", labels: { note: "Single reviewer screening." } }), "T").nodes.find((node) => node.id === "note")!.paragraphs[0].text, "Single reviewer screening.");
  });
  it("carries the title and text alternative", () => {
    assert.equal(diagram.title, "Title");
    assert.equal(diagram.description, altText(SAMPLE_INPUT));
  });
  for (const kind of PRISMA_KINDS)
    for (const other of [false, true])
      it(`draws ${kind}${other ? " with other methods" : ""} without structural problems`, () => {
        assert.deepEqual(diagramProblems(prismaDiagram({ ...WITH_OTHER_METHODS, kind, otherMethods: other }, "T")), []);
      });
});

describe("rendering every combination", () => {
  for (const kind of PRISMA_KINDS)
    for (const orientation of ORIENTATIONS)
      for (const theme of THEMES)
        it(`renders ${kind}, ${orientation}, ${theme}`, () => {
          const rendered = renderDiagram(prismaDiagram({ ...WITH_OTHER_METHODS, kind }, diagramTitle({ kind })), { ...DEFAULT_LAYOUT_OPTIONS, orientation, theme });
          assert.doesNotMatch(rendered.svg, /NaN|undefined|Infinity/);
          assert.ok(rendered.scene.items.every((item) => item.type !== "rect" || (item.x >= 0 && item.x + item.width <= rendered.scene.width + 0.5)));
        });
  for (const typeface of TYPEFACES)
    it(`writes a ${typeface} PDF`, () => {
      const text = Array.from(diagramPdf(renderDiagram(prismaDiagram(SAMPLE_INPUT, "T"), { ...DEFAULT_LAYOUT_OPTIONS, typeface })), (byte) => String.fromCharCode(byte)).join("");
      assert.match(text, typeface === "serif" ? /Times-Roman/ : /Helvetica/);
    });
  it("keeps boxes from overlapping", () => {
    const rects = renderDiagram(prismaDiagram(WITH_OTHER_METHODS, "T"), DEFAULT_LAYOUT_OPTIONS).scene.items.filter((item) => item.type === "rect");
    for (const [i, a] of rects.entries())
      for (const b of rects.slice(i + 1))
        if (a.type === "rect" && b.type === "rect") assert.ok(a.x + a.width <= b.x + 0.5 || b.x + b.width <= a.x + 0.5 || a.y + a.height <= b.y + 0.5 || b.y + b.height <= a.y + 0.5, "overlap");
  });
});

describe("summaries", () => {
  it("writes a one-sentence text alternative", () => {
    assert.equal(altText(SAMPLE_INPUT), "PRISMA 2020 flow diagram: 1,250 records identified, 990 screened, 135 reports assessed for eligibility, 22 studies included.");
    assert.equal(altText(EMPTY_PRISMA_INPUT), "PRISMA 2020 flow diagram, with its numbers still to be entered.");
    assert.match(altText({ ...SAMPLE_INPUT, kind: "scoping" }), /22 sources of evidence included/);
  });
  it("writes a paragraph for the methods or results", () => {
    assert.equal(
      flowParagraph(SAMPLE_INPUT),
      "The searches identified 1,200 records from databases and 50 records from registers. After removing 250 duplicates, 10 marked ineligible by automation tools, 990 records were screened, of which 850 were excluded. 140 reports were sought for retrieval, of which 5 could not be retrieved. 135 reports were assessed for eligibility; 110 were excluded (wrong population, 60; wrong methodology, 40; no full text, 10). In total, 22 studies, described in 25 reports, were included in the review.",
    );
  });
  it("names every source in PRISMA-S", () => {
    assert.match(flowParagraph({ ...SAMPLE_INPUT, kind: "prisma-s" }), /By source: MEDLINE \(700\), Scopus \(500\), ClinicalTrials\.gov \(50\)\./);
  });
  it("describes other methods", () => {
    assert.match(flowParagraph(WITH_OTHER_METHODS), /Other methods identified 30 further records, of which 26 were assessed and 6 included\./);
  });
  it("says nothing it doesn't know", () => {
    assert.equal(flowParagraph(EMPTY_PRISMA_INPUT), "");
  });
  it("uses singular words for one", () => {
    assert.match(flowParagraph({ ...SAMPLE_INPUT, studiesIncluded: 1, reasons: [{ id: "r", label: "Other", count: 134 }] }), /1 study was included/);
  });
  it("lists every number, marking calculated ones", () => {
    const table = flowTable(SAMPLE_INPUT);
    assert.deepEqual(table.find((row) => row.stage === "Records screened"), { stage: "Records screened", count: 990, calculated: true });
    assert.deepEqual(table.find((row) => row.stage === "Duplicate records removed"), { stage: "Duplicate records removed", count: 250, calculated: false });
    assert.ok(table.some((row) => row.stage === "Excluded: Wrong population"));
  });
  it("adds sources and other methods to the table when used", () => {
    assert.ok(flowTable({ ...SAMPLE_INPUT, kind: "prisma-s" }).some((row) => row.stage === "Records from MEDLINE"));
    assert.ok(flowTable(WITH_OTHER_METHODS).some((row) => row.stage === "Records from other methods"));
    assert.ok(!flowTable({ ...SAMPLE_INPUT, kind: "narrative" }).some((row) => row.stage === "Records excluded"));
  });
  it("names the narrative workflow without repeating itself, and counts no other methods for it", () => {
    assert.equal(diagramTitle({ kind: "narrative" }), "Narrative review workflow");
    assert.match(altText({ ...WITH_OTHER_METHODS, kind: "narrative" }), /^Narrative review workflow: 1,250 records identified, 990 screened, 28 studies included\.$/);
    assert.equal(computeFlow({ ...WITH_OTHER_METHODS, kind: "narrative" }).otherIdentified, null);
  });
  it("titles the diagram with the review's topic", () => {
    assert.equal(diagramTitle({ kind: "prisma-2020" }), "PRISMA 2020 flow diagram");
    assert.equal(diagramTitle({ kind: "scoping" }, " Screens and sleep "), "Scoping review (PRISMA-ScR) flow diagram: Screens and sleep");
  });
});

describe("counting records from exports", () => {
  const medline = "TY  - JOUR\nTI  - Screen time and sleep\nPY  - 2020\nDO  - 10.1000/a\nER  - \nTY  - JOUR\nTI  - Phones at bedtime\nPY  - 2021\nDO  - 10.1000/b\nER  - \nTY  - JOUR\nTI  - Short\nER  - ";
  const scopus = "@article{x, title = {Screen time and sleep}, year = 2020, doi = {10.1000/A}}\n@article{y, title = {A different study entirely}, year = 2019}";
  const result = countRecords([
    { id: "s1", name: "MEDLINE", format: "ris", text: medline },
    { id: "s2", name: "Scopus", format: "bibtex", text: scopus },
  ]);
  it("counts every record in each source", () => {
    assert.deepEqual(result.sources.map((source) => [source.name, source.records]), [["MEDLINE", 3], ["Scopus", 2]]);
    assert.equal(result.total, 5);
  });
  it("finds duplicates across sources by DOI, ignoring case", () => {
    assert.equal(result.duplicates, 1);
    assert.equal(result.unique, 4);
  });
  it("reports records it couldn't match", () => {
    assert.equal(result.unmatched, 1);
  });
  it("finds duplicates within one source", () => {
    assert.equal(countRecords([{ id: "a", name: "A", format: "ris", text: `${medline}\n${medline}` }]).duplicates, 2);
  });
  it("names unnamed sources", () => {
    assert.equal(countRecords([{ id: "a", name: " ", format: "csv", text: "Title\nA long enough title" }]).sources[0].name, "Unnamed source");
  });
  it("counts nothing from nothing", () => {
    assert.deepEqual(countRecords([]), { sources: [], total: 0, duplicates: 0, unique: 0, unmatched: 0 });
  });
  it("counts the studies in a Literature Matrix export", () => {
    const matrix = includedFromMatrix('﻿Author(s),Year,Title\r\n"Adams, J.",2016,Screens\r\n"Chen, L.",2018,Phones\r\n');
    assert.equal(matrix.count, 2);
    assert.deepEqual(matrix.labels, ["Adams (2016)", "Chen (2018)"]);
  });
});
