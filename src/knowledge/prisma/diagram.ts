/**
 * PRISMA diagrams described for the shared diagram engine. The grid follows the
 * PRISMA 2020 template: a heading row; then identification, screening, retrieval,
 * eligibility and inclusion down the main column, with removals and exclusions beside
 * each; and, when other methods were used, a second pair of columns that joins the
 * included studies. Every box's wording can be changed, and every arrow hidden or labelled.
 */

import type { DiagramEdge, DiagramNode, DiagramText, FlowDiagram } from "../diagrams/types";
import { computeFlow, countText, type FlowNumbers } from "./flow";
import { altText } from "./summary";
import { type CountedSource, type ExclusionReason, type LabelKey, type PrismaInput, type PrismaKind } from "./types";

/** The standard wording of each box, by diagram. */
export function defaultLabels(kind: PrismaKind): Record<LabelKey, string> {
  const scoping = kind === "scoping";
  const narrative = kind === "narrative";
  const reports = scoping ? "Full texts" : "Reports";
  return {
    identificationHeader: narrative ? "Narrative review workflow" : scoping ? "Identification of sources of evidence via databases and registers" : "Identification of studies via databases and registers",
    otherHeader: scoping ? "Identification of sources of evidence via other methods" : "Identification of studies via other methods",
    identified: narrative ? "Sources identified" : "Records identified from:",
    removed: "Records removed before screening:",
    screened: narrative ? "Sources screened" : "Records screened",
    screenedExcluded: "Records excluded",
    sought: `${reports} sought for retrieval`,
    notRetrieved: `${reports} not retrieved`,
    assessed: narrative ? "Full texts read" : `${reports} assessed for eligibility`,
    reportsExcluded: `${reports} excluded:`,
    otherIdentified: "Records identified from:",
    otherSought: `${reports} sought for retrieval`,
    otherNotRetrieved: `${reports} not retrieved`,
    otherAssessed: `${reports} assessed for eligibility`,
    otherExcluded: `${reports} excluded:`,
    included: narrative ? "Sources included in the review" : scoping ? "Sources of evidence included in review" : "Studies included in review",
    note: kind === "rapid" ? "Streamlined methods: [describe them, such as screening by one reviewer with a second checking a sample]" : "",
  };
}

/** The wording in use: the researcher's, or the standard. */
export const labelsFor = (input: Pick<PrismaInput, "kind" | "labels">): Record<LabelKey, string> => {
  const standard = defaultLabels(input.kind);
  return Object.fromEntries(Object.entries(standard).map(([key, text]) => [key, input.labels[key as LabelKey]?.trim() || text])) as Record<LabelKey, string>;
};

const withCount = (label: string, value: number | null): DiagramText[] => [{ text: `${label} (${countText(value)})` }];
const listed = (heading: string, items: readonly { name: string; count: number | null }[]): DiagramText[] => [{ text: heading }, ...items.map((item) => ({ text: `${item.name.trim() || "[source]"} (${countText(item.count)})`, indent: 1 }))];
const reasonsList = (heading: string, reasons: readonly ExclusionReason[]): DiagramText[] =>
  reasons.length === 0 ? [{ text: heading }, { text: "[Reason] (n = )", indent: 1 }] : listed(heading, reasons.map((reason) => ({ name: reason.label, count: reason.count })));

/** Sources as PRISMA 2020 shows them (one line per kind of source) or as PRISMA-S lists them (every source). */
function identifiedLines(input: PrismaInput, flow: FlowNumbers): { name: string; count: number | null }[] {
  const each = (sources: readonly CountedSource[]) => sources.filter((source) => source.name.trim() || source.count !== null);
  if (input.kind === "prisma-s") return [...each(input.databases), ...each(input.registers)];
  return [
    { name: "Databases", count: flow.databases },
    { name: "Registers", count: flow.registers },
  ];
}

export const EDGE_IDS = [
  "identified-removed",
  "identified-screened",
  "screened-excluded",
  "screened-sought",
  "sought-notRetrieved",
  "sought-assessed",
  "assessed-excluded",
  "assessed-included",
  "other-identified-sought",
  "other-sought-notRetrieved",
  "other-sought-assessed",
  "other-assessed-excluded",
  "other-assessed-included",
] as const;

/** The whole PRISMA diagram, ready to lay out. */
export function prismaDiagram(input: PrismaInput, title: string, flow: FlowNumbers = computeFlow(input)): FlowDiagram {
  const labels = labelsFor(input);
  const narrative = input.kind === "narrative";
  const other = input.otherMethods && !narrative;
  const columns = narrative ? 1 : other ? 4 : 2;
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const node = (id: string, column: number, row: number, paragraphs: DiagramText[], extra: Partial<DiagramNode> = {}) => nodes.push({ id, column, row, paragraphs, ...extra });
  const edge = (id: string, from: string, to: string) => edges.push({ id, from, to, label: input.arrowLabels[id]?.trim() || undefined, hidden: input.hiddenArrows.includes(id) });

  node("identification-header", 0, 0, [{ text: labels.identificationHeader, bold: true }], { span: narrative ? 1 : 2, tone: "header", align: "center" });
  if (narrative) {
    node("identified", 0, 1, withCount(labels.identified, flow.identified));
    node("screened", 0, 2, withCount(labels.screened, flow.screened.value));
    node("assessed", 0, 3, withCount(labels.assessed, flow.assessed.value));
    node("included", 0, 4, withCount(labels.included, flow.studiesIncluded));
    edge("identified-screened", "identified", "screened");
    edge("screened-sought", "screened", "assessed");
    edge("assessed-included", "assessed", "included");
  } else {
    node("identified", 0, 1, listed(labels.identified, identifiedLines(input, flow)));
    node("removed", 1, 1, [
      { text: labels.removed },
      { text: `Duplicate records removed (${countText(flow.duplicates)})`, indent: 1 },
      { text: `Records marked as ineligible by automation tools (${countText(flow.automation)})`, indent: 1 },
      { text: `Records removed for other reasons (${countText(flow.removedOther)})`, indent: 1 },
    ]);
    node("screened", 0, 2, withCount(labels.screened, flow.screened.value));
    node("screened-excluded", 1, 2, withCount(labels.screenedExcluded, flow.screenedExcluded));
    node("sought", 0, 3, withCount(labels.sought, flow.sought.value));
    node("not-retrieved", 1, 3, withCount(labels.notRetrieved, flow.notRetrieved));
    node("assessed", 0, 4, withCount(labels.assessed, flow.assessed.value));
    node("reports-excluded", 1, 4, reasonsList(labels.reportsExcluded, input.reasons));
    node("included", 0, 5, [{ text: `${labels.included} (${countText(flow.studiesIncluded)})` }, { text: `${input.kind === "scoping" ? "Reports of included sources" : "Reports of included studies"} (${countText(flow.reportsIncluded.value)})` }]);
    edge("identified-removed", "identified", "removed");
    edge("identified-screened", "identified", "screened");
    edge("screened-excluded", "screened", "screened-excluded");
    edge("screened-sought", "screened", "sought");
    edge("sought-notRetrieved", "sought", "not-retrieved");
    edge("sought-assessed", "sought", "assessed");
    edge("assessed-excluded", "assessed", "reports-excluded");
    edge("assessed-included", "assessed", "included");
  }
  if (other) {
    node("other-header", 2, 0, [{ text: labels.otherHeader, bold: true }], { span: 2, tone: "muted", align: "center" });
    node("other-identified", 2, 1, listed(labels.otherIdentified, input.otherSources.filter((source) => source.name.trim() || source.count !== null)));
    node("other-sought", 2, 3, withCount(labels.otherSought, flow.otherSought.value));
    node("other-not-retrieved", 3, 3, withCount(labels.otherNotRetrieved, flow.otherNotRetrieved));
    node("other-assessed", 2, 4, withCount(labels.otherAssessed, flow.otherAssessed.value));
    node("other-excluded", 3, 4, reasonsList(labels.otherExcluded, input.otherReasons));
    edge("other-identified-sought", "other-identified", "other-sought");
    edge("other-sought-notRetrieved", "other-sought", "other-not-retrieved");
    edge("other-sought-assessed", "other-sought", "other-assessed");
    edge("other-assessed-excluded", "other-assessed", "other-excluded");
    edge("other-assessed-included", "other-assessed", "included");
  }
  const lastRow = narrative ? 4 : 5;
  const note = labels.note.trim();
  if (note) node("note", 0, lastRow + 1, [{ text: note, italic: true }], { span: columns, tone: "muted" });
  return {
    title,
    description: altText(input, flow),
    columns,
    rows: lastRow + 1 + (note ? 1 : 0),
    nodes,
    edges,
    bands: narrative
      ? [
          { id: "identification", label: "Identification", fromRow: 1, toRow: 1 },
          { id: "screening", label: "Screening", fromRow: 2, toRow: 3 },
          { id: "included", label: "Included", fromRow: 4, toRow: 4 },
        ]
      : [
          { id: "identification", label: "Identification", fromRow: 1, toRow: 1 },
          { id: "screening", label: "Screening", fromRow: 2, toRow: 4 },
          { id: "included", label: "Included", fromRow: 5, toRow: 5 },
        ],
    columnWeights: narrative ? [1] : other ? [1.1, 1, 1.1, 1] : [1.1, 1],
  };
}
