/** A fictional, consistent review for the PRISMA tests. Not part of the product. */

import { EMPTY_PRISMA_INPUT, type PrismaInput } from "./types";

/** Databases 1,200 + registers 50; 250 duplicates, 10 by automation; 990 screened, 850 excluded; 140 sought, 5 not retrieved; 135 assessed, 110 excluded; 25 reports, 22 studies. */
export const SAMPLE_INPUT: PrismaInput = {
  ...EMPTY_PRISMA_INPUT,
  databases: [
    { id: "db1", name: "MEDLINE", count: 700 },
    { id: "db2", name: "Scopus", count: 500 },
  ],
  registers: [{ id: "rg1", name: "ClinicalTrials.gov", count: 50 }],
  duplicates: 250,
  automation: 10,
  removedOther: 0,
  screenedExcluded: 850,
  notRetrieved: 5,
  reasons: [
    { id: "r1", label: "Wrong population", count: 60 },
    { id: "r2", label: "Wrong methodology", count: 40 },
    { id: "r3", label: "No full text", count: 10 },
  ],
  studiesIncluded: 22,
};

/** The same review with other methods: 30 found, 28 sought, 2 not retrieved, 26 assessed, 20 excluded, 6 included. */
export const WITH_OTHER_METHODS: PrismaInput = {
  ...SAMPLE_INPUT,
  otherMethods: true,
  otherSources: [
    { id: "os1", name: "Citation searching", count: 25 },
    { id: "os2", name: "Websites", count: 5 },
  ],
  otherSought: 28,
  otherNotRetrieved: 2,
  otherReasons: [{ id: "o1", label: "Wrong population", count: 20 }],
  studiesIncluded: 28,
};
