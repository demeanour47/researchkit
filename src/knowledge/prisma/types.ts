/**
 * The numbers a PRISMA flow diagram reports, and the diagrams the builder draws. The
 * boxes and wording follow the PRISMA 2020 flow diagram templates (Page et al., 2021,
 * BMJ 372:n71), whose authors publish them for anyone to use. The other diagrams adapt
 * the same flow: PRISMA-S lists every database and register searched; scoping reviews
 * report sources of evidence, as PRISMA-ScR does; rapid reviews and narrative reviews
 * use the same stages with their own wording.
 */

export const PRISMA_KINDS = ["prisma-2020", "prisma-s", "scoping", "rapid", "narrative"] as const;
export type PrismaKind = (typeof PRISMA_KINDS)[number];

export interface PrismaKindInfo {
  label: string;
  description: string;
  /** Whether the diagram has boxes for records removed and reasons for exclusion. */
  exclusions: boolean;
}

export const PRISMA_KIND_INFO: Readonly<Record<PrismaKind, PrismaKindInfo>> = {
  "prisma-2020": { label: "PRISMA 2020", description: "The flow diagram for systematic reviews and meta-analyses, from identification through screening to inclusion.", exclusions: true },
  "prisma-s": { label: "PRISMA-S", description: "PRISMA 2020's flow with every database and register listed with its own count, as the PRISMA-S extension for reporting searches asks.", exclusions: true },
  scoping: { label: "Scoping review (PRISMA-ScR)", description: "The same flow in the language of scoping reviews: sources of evidence rather than studies.", exclusions: true },
  rapid: { label: "Rapid review", description: "PRISMA 2020's flow for a rapid review, with a note on streamlined screening.", exclusions: true },
  narrative: { label: "Narrative review workflow", description: "A simpler workflow for a narrative review: sources found, screened, read in full and included.", exclusions: false },
};

/** A source searched, with the number of records it gave. */
export interface CountedSource {
  id: string;
  name: string;
  count: number | null;
}

export interface ExclusionReason {
  id: string;
  label: string;
  count: number | null;
}

/** Common reasons for excluding reports, offered as a start; any can be renamed and more added. */
export const COMMON_REASONS = [
  "Wrong population",
  "Wrong intervention",
  "Wrong methodology",
  "Wrong publication type",
  "No full text",
  "Duplicate",
  "Language restriction",
  "Conference abstract",
  "Insufficient data",
  "Other",
] as const;

/** Wording that can be changed box by box. */
export const LABEL_KEYS = [
  "identificationHeader",
  "otherHeader",
  "identified",
  "removed",
  "screened",
  "screenedExcluded",
  "sought",
  "notRetrieved",
  "assessed",
  "reportsExcluded",
  "otherIdentified",
  "otherSought",
  "otherNotRetrieved",
  "otherAssessed",
  "otherExcluded",
  "included",
  "note",
] as const;
export type LabelKey = (typeof LABEL_KEYS)[number];

export interface PrismaInput {
  kind: PrismaKind;
  /** Whether studies found by other methods, such as citation searching, get their own column. */
  otherMethods: boolean;
  databases: CountedSource[];
  registers: CountedSource[];
  otherSources: CountedSource[];
  duplicates: number | null;
  automation: number | null;
  removedOther: number | null;
  /** Leave null to calculate from those above it. */
  screened: number | null;
  screenedExcluded: number | null;
  sought: number | null;
  notRetrieved: number | null;
  assessed: number | null;
  reasons: ExclusionReason[];
  otherSought: number | null;
  otherNotRetrieved: number | null;
  otherAssessed: number | null;
  otherReasons: ExclusionReason[];
  /** Reports of included studies; null to calculate. */
  reportsIncluded: number | null;
  /** Studies included; several reports can describe one study. */
  studiesIncluded: number | null;
  /** Wording changed box by box; empty strings mean the standard wording. */
  labels: Partial<Record<LabelKey, string>>;
  /** Arrows hidden by id, and labels added to arrows. */
  hiddenArrows: string[];
  arrowLabels: Record<string, string>;
}

export const EMPTY_PRISMA_INPUT: PrismaInput = {
  kind: "prisma-2020",
  otherMethods: false,
  databases: [{ id: "db1", name: "Databases", count: null }],
  registers: [{ id: "rg1", name: "Registers", count: null }],
  otherSources: [
    { id: "os1", name: "Websites", count: null },
    { id: "os2", name: "Organisations", count: null },
    { id: "os3", name: "Citation searching", count: null },
  ],
  duplicates: null,
  automation: null,
  removedOther: null,
  screened: null,
  screenedExcluded: null,
  sought: null,
  notRetrieved: null,
  assessed: null,
  reasons: [],
  otherSought: null,
  otherNotRetrieved: null,
  otherAssessed: null,
  otherReasons: [],
  reportsIncluded: null,
  studiesIncluded: null,
  labels: {},
  hiddenArrows: [],
  arrowLabels: {},
};

export function getKind(kind: PrismaKind): PrismaKindInfo {
  const info = PRISMA_KIND_INFO[kind];
  if (!info) throw new RangeError(`Unknown diagram type: ${kind}`);
  return info;
}
