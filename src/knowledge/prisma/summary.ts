/**
 * The diagram in words: a one-sentence text alternative, a paragraph for the methods or
 * results section, and every number as a table, for readers who can't see the diagram
 * and for checking. Counts that aren't known yet are left out rather than guessed.
 */

import { computeFlow, countText, usesOtherMethods, type FlowNumbers } from "./flow";
import { getKind, type PrismaInput } from "./types";

const num = (value: number) => countText(value).slice(4);
const known = (value: number | null): value is number => value !== null;
const plural = (value: number, one: string, many: string) => `${num(value)} ${value === 1 ? one : many}`;

/** The diagram's name: “PRISMA 2020 flow diagram”, or the workflow's own name. */
export const diagramName = (input: Pick<PrismaInput, "kind">) => (input.kind === "narrative" ? getKind(input.kind).label : `${getKind(input.kind).label} flow diagram`);

/** A one-sentence text alternative for the diagram. */
export function altText(input: PrismaInput, flow: FlowNumbers = computeFlow(input)): string {
  const info = getKind(input.kind);
  const parts = [
    known(flow.identified) ? `${plural(flow.identified, "record", "records")} identified` : "",
    known(flow.otherIdentified) ? `${plural(flow.otherIdentified, "record", "records")} from other methods` : "",
    known(flow.screened.value) ? `${num(flow.screened.value)} screened` : "",
    known(flow.assessed.value) && info.exclusions ? `${plural(flow.assessed.value, "report", "reports")} assessed for eligibility` : "",
    known(flow.studiesIncluded) ? `${plural(flow.studiesIncluded, input.kind === "scoping" ? "source of evidence" : "study", input.kind === "scoping" ? "sources of evidence" : "studies")} included` : "",
  ].filter(Boolean);
  return `${diagramName(input)}${parts.length > 0 ? `: ${parts.join(", ")}` : ", with its numbers still to be entered"}.`;
}

/** A paragraph describing the flow, to adapt for the review's methods or results. */
export function flowParagraph(input: PrismaInput, flow: FlowNumbers = computeFlow(input)): string {
  const sentences: string[] = [];
  const studies = input.kind === "scoping" ? ["source of evidence", "sources of evidence"] : ["study", "studies"];
  if (known(flow.identified)) {
    const from = [known(flow.databases) ? `${plural(flow.databases, "record", "records")} from databases` : "", known(flow.registers) && flow.registers > 0 ? `${plural(flow.registers, "record", "records")} from registers` : ""].filter(Boolean);
    sentences.push(`The searches identified ${from.length > 0 ? from.join(" and ") : plural(flow.identified, "record", "records")}.`);
  }
  if (input.kind === "prisma-s") {
    const named = [...input.databases, ...input.registers].filter((source) => source.name.trim() && known(source.count));
    if (named.length > 0) sentences.push(`By source: ${named.map((source) => `${source.name.trim()} (${num(source.count!)})`).join(", ")}.`);
  }
  const removed = [known(flow.duplicates) && flow.duplicates > 0 ? `${plural(flow.duplicates, "duplicate", "duplicates")}` : "", known(flow.automation) && flow.automation > 0 ? `${num(flow.automation)} marked ineligible by automation tools` : "", known(flow.removedOther) && flow.removedOther > 0 ? `${num(flow.removedOther)} for other reasons` : ""].filter(Boolean);
  if (known(flow.screened.value)) sentences.push(`${removed.length > 0 ? `After removing ${removed.join(", ")}, ` : ""}${plural(flow.screened.value, "record was", "records were")} screened${known(flow.screenedExcluded) ? `, of which ${num(flow.screenedExcluded)} ${flow.screenedExcluded === 1 ? "was" : "were"} excluded` : ""}.`.replace(/^./, (first) => first.toUpperCase()));
  if (known(flow.sought.value) && getKind(input.kind).exclusions) sentences.push(`${plural(flow.sought.value, "report was", "reports were")} sought for retrieval${known(flow.notRetrieved) && flow.notRetrieved > 0 ? `, of which ${num(flow.notRetrieved)} could not be retrieved` : ""}.`.replace(/^./, (first) => first.toUpperCase()));
  if (known(flow.assessed.value)) {
    const reasons = input.reasons.filter((reason) => reason.label.trim() && known(reason.count));
    sentences.push(`${plural(flow.assessed.value, "report was", "reports were")} assessed for eligibility${reasons.length > 0 ? `; ${num(flow.reportsExcluded ?? 0)} ${flow.reportsExcluded === 1 ? "was" : "were"} excluded (${reasons.map((reason) => `${reason.label.trim().toLowerCase()}, ${num(reason.count!)}`).join("; ")})` : ""}.`.replace(/^./, (first) => first.toUpperCase()));
  }
  if (usesOtherMethods(input) && known(flow.otherIdentified)) sentences.push(`Other methods identified ${plural(flow.otherIdentified, "further record", "further records")}${known(flow.otherAssessed.value) ? `, of which ${num(flow.otherAssessed.value)} ${flow.otherAssessed.value === 1 ? "was" : "were"} assessed` : ""}${known(flow.otherIncluded) ? ` and ${num(flow.otherIncluded)} included` : ""}.`);
  if (known(flow.studiesIncluded)) sentences.push(`In total, ${plural(flow.studiesIncluded, studies[0], studies[1])}${known(flow.reportsIncluded.value) && flow.reportsIncluded.value !== flow.studiesIncluded ? `, described in ${plural(flow.reportsIncluded.value, "report", "reports")},` : ""} ${flow.studiesIncluded === 1 ? "was" : "were"} included in the review.`);
  return sentences.join(" ");
}

export interface FlowTableRow {
  stage: string;
  count: number | null;
  calculated: boolean;
}

/** Every number in the diagram, in order, marking those calculated rather than entered. */
export function flowTable(input: PrismaInput, flow: FlowNumbers = computeFlow(input)): FlowTableRow[] {
  const row = (stage: string, count: number | null, calculated = false): FlowTableRow => ({ stage, count, calculated });
  const exclusions = getKind(input.kind).exclusions;
  const sources = input.kind === "prisma-s" ? [...input.databases, ...input.registers].filter((source) => source.name.trim() || known(source.count)).map((source) => row(`Records from ${source.name.trim() || "an unnamed source"}`, source.count)) : [];
  return [
    row("Records from databases", flow.databases),
    row("Records from registers", flow.registers),
    ...sources,
    ...(exclusions ? [row("Duplicate records removed", flow.duplicates), row("Records marked ineligible by automation tools", flow.automation), row("Records removed for other reasons", flow.removedOther)] : []),
    row("Records screened", flow.screened.value, flow.screened.calculated),
    ...(exclusions ? [row("Records excluded", flow.screenedExcluded), row("Reports sought for retrieval", flow.sought.value, flow.sought.calculated), row("Reports not retrieved", flow.notRetrieved)] : []),
    row("Reports assessed for eligibility", flow.assessed.value, flow.assessed.calculated),
    ...(exclusions ? input.reasons.map((reason) => row(`Excluded: ${reason.label.trim() || "unnamed reason"}`, reason.count)) : []),
    ...(usesOtherMethods(input)
      ? [
          row("Records from other methods", flow.otherIdentified),
          row("Reports sought from other methods", flow.otherSought.value, flow.otherSought.calculated),
          row("Reports not retrieved from other methods", flow.otherNotRetrieved),
          row("Reports from other methods assessed", flow.otherAssessed.value, flow.otherAssessed.calculated),
          ...input.otherReasons.map((reason) => row(`Excluded (other methods): ${reason.label.trim() || "unnamed reason"}`, reason.count)),
        ]
      : []),
    row("Reports of included studies", flow.reportsIncluded.value, flow.reportsIncluded.calculated),
    row("Studies included", flow.studiesIncluded, input.studiesIncluded === null && flow.studiesIncluded !== null),
  ];
}

/** The figure's title: the diagram type, and the review's topic when the project has one. */
export function diagramTitle(input: Pick<PrismaInput, "kind">, topic = ""): string {
  return topic.trim() ? `${diagramName(input)}: ${topic.trim()}` : diagramName(input);
}
