/**
 * Recognising columns pasted from statistics software by their names, whatever the
 * software calls them: “B”, “Unstandardized B” or “Coefficient”; “Sig.” or “p”; “β”
 * or “Beta”. Names are compared without case, spaces or punctuation.
 */

import type { DataTable } from "../charts/table";

export const COLUMN_ALIASES = {
  b: ["b", "coefficient", "coef", "unstandardizedb", "unstandardisedb", "estimate", "unstandardizedcoefficientsb"],
  se: ["se", "stderror", "standarderror", "stderr", "seb"],
  beta: ["beta", "standardizedbeta", "standardisedbeta", "stdbeta", "standardizedcoefficientsbeta"],
  t: ["t", "tvalue", "tstatistic"],
  p: ["p", "sig", "pvalue", "significance", "sig2tailed", "prob"],
  lower: ["lower", "ll", "lowerbound", "cilower", "95cilower", "lower95", "lowerci", "95cill"],
  upper: ["upper", "ul", "upperbound", "ciupper", "95ciupper", "upper95", "upperci", "95ciul"],
  tolerance: ["tolerance", "tol"],
  vif: ["vif"],
  r: ["r", "multipler"],
  r2: ["r2", "rsquare", "rsquared"],
  adjr2: ["adjustedr2", "adjr2", "adjustedrsquare", "adjustedrsquared", "adjrsquared", "adjrsquare"],
  see: ["se", "seestimate", "stderroroftheestimate", "standarderroroftheestimate", "stderrorestimate"],
  dr2: ["deltar2", "r2change", "rsquarechange", "changeinr2", "dr2"],
  fchange: ["fchange", "deltaf", "fchg"],
  f: ["f", "fvalue"],
  df: ["df", "degreesoffreedom"],
  df1: ["df1"],
  df2: ["df2"],
  dw: ["durbinwatson", "dw"],
  ss: ["ss", "sumofsquares", "typeiiisumofsquares", "sumsq"],
  ms: ["ms", "meansquare", "meansq"],
  eta: ["eta2", "partialeta2", "partialetasquared", "etasquared", "eta", "etap2"],
  loading: ["loading", "loadings", "standardizedloading", "standardisedloading", "outerloading", "lambda"],
  construct: ["construct", "factor", "latentvariable", "scale", "variable"],
  item: ["item", "indicator", "measure"],
} as const;
export type ColumnKey = keyof typeof COLUMN_ALIASES;

/** A column name reduced to letters and digits, with symbols spelled out: “Adjusted R²” becomes “adjustedr2”. */
export const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/²/g, "2")
    .replace(/β/g, "beta")
    .replace(/[Δδ]/g, "delta")
    .replace(/η/g, "eta")
    .replace(/λ/g, "lambda")
    .replace(/[^a-z0-9]/g, "");

/** Whether a name is one of a key's aliases. */
export const nameMatches = (name: string, key: ColumnKey) => (COLUMN_ALIASES[key] as readonly string[]).map(normalizeName).includes(normalizeName(name));

/** The index of the first column matching a key, or −1. Columns already claimed are skipped. */
export function findColumn(table: DataTable, key: ColumnKey, claimed: ReadonlySet<number> = new Set()): number {
  return table.columns.findIndex((column, index) => !claimed.has(index) && nameMatches(column.name, key));
}

/** Several keys at once, each column claimed by the first key that matches it. */
export function findColumns<K extends ColumnKey>(table: DataTable, keys: readonly K[], claimed: Set<number> = new Set([0])): Record<K, number> {
  const found = {} as Record<K, number>;
  for (const key of keys) {
    const index = findColumn(table, key, claimed);
    found[key] = index;
    if (index >= 0) claimed.add(index);
  }
  return found;
}
