import { EMPTY_PRISMA_INPUT, type PrismaInput } from "../../knowledge/prisma";

/** A fictional systematic review's numbers, for trying the builder. Every stage adds up. */
export const exampleInput: PrismaInput = {
  ...EMPTY_PRISMA_INPUT,
  databases: [
    { id: "db1", name: "MEDLINE", count: 812 },
    { id: "db2", name: "PsycINFO", count: 455 },
    { id: "db3", name: "Scopus", count: 603 },
  ],
  registers: [{ id: "rg1", name: "ClinicalTrials.gov", count: 34 }],
  otherSources: [
    { id: "os1", name: "Citation searching", count: 18 },
    { id: "os2", name: "Websites", count: 6 },
  ],
  duplicates: 612,
  automation: 0,
  removedOther: 12,
  screenedExcluded: 1104,
  notRetrieved: 9,
  reasons: [
    { id: "r1", label: "Wrong population", count: 58 },
    { id: "r2", label: "Wrong methodology", count: 41 },
    { id: "r3", label: "Conference abstract", count: 17 },
    { id: "r4", label: "Insufficient data", count: 12 },
  ],
  otherNotRetrieved: 2,
  otherReasons: [{ id: "o1", label: "Wrong population", count: 15 }],
  studiesIncluded: 36,
};
export const exampleTopic = "Screen use and sleep among university students (fictional example)";
