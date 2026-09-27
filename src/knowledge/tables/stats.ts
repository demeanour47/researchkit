/**
 * The statistics the table builder calculates from raw data, and the distributions
 * behind their p-values. Methods follow standard references: the Lanczos approximation
 * of the log-gamma function, the continued fractions for the regularised incomplete
 * beta and gamma functions (as in Press et al., Numerical Recipes), sample skewness and
 * excess kurtosis as SPSS and Excel report them, and Cronbach's alpha from item and
 * total variances. Tests check each against published critical values.
 */

// Distributions.

const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

/** The natural logarithm of the gamma function, for positive arguments (Lanczos, g = 7). */
export function logGamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const z = x - 1;
  let sum = LANCZOS[0];
  for (let index = 1; index < 9; index++) sum += LANCZOS[index] / (z + index);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(sum);
}

const EPSILON = 1e-14;
const TINY = 1e-300;

/** The continued fraction for the incomplete beta function, by the modified Lentz method. */
function betaFraction(a: number, b: number, x: number): number {
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return h;
}

/** The regularised incomplete beta function Iₓ(a, b). */
export function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  // The fraction converges quickly on one side of the mean; use the symmetry relation on the other.
  return x < (a + 1) / (a + b + 2) ? (front * betaFraction(a, b, x)) / a : 1 - (front * betaFraction(b, a, 1 - x)) / b;
}

/** The regularised lower incomplete gamma function P(a, x). */
export function incompleteGamma(a: number, x: number): number {
  if (x <= 0) return 0;
  const logFront = -x + a * Math.log(x) - logGamma(a);
  if (x < a + 1) {
    // Series expansion.
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n <= 500; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * EPSILON) break;
    }
    return sum * Math.exp(logFront);
  }
  // Continued fraction for the upper function, by the modified Lentz method.
  let b = x + 1 - a;
  let c = 1 / TINY;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < TINY) d = TINY;
    c = b + an / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPSILON) break;
  }
  return 1 - Math.exp(logFront) * h;
}

/** The two-tailed p-value of a t statistic. */
export function tTestP(t: number, df: number): number {
  if (!Number.isFinite(t)) return 0;
  return incompleteBeta(df / (df + t * t), df / 2, 0.5);
}

/** The upper-tail p-value of an F statistic. */
export function fTestP(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  if (!Number.isFinite(f)) return 0;
  return incompleteBeta(df2 / (df2 + df1 * f), df2 / 2, df1 / 2);
}

/** The upper-tail p-value of a chi-square statistic. */
export function chiSquareP(value: number, df: number): number {
  if (value <= 0) return 1;
  return 1 - incompleteGamma(df / 2, value / 2);
}

// Descriptive statistics.

export const mean = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** The sample variance, with n − 1 in the denominator. */
export function variance(values: readonly number[]): number {
  if (values.length < 2) return Number.NaN;
  const m = mean(values);
  return values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (values.length - 1);
}

export const standardDeviation = (values: readonly number[]) => Math.sqrt(variance(values));

/** Sample skewness, adjusted for sample size (G1), as SPSS and Excel's SKEW report it. Needs three values. */
export function skewness(values: readonly number[]): number {
  const n = values.length;
  const s = standardDeviation(values);
  if (n < 3 || !(s > 0)) return Number.NaN;
  const m = mean(values);
  return (n / ((n - 1) * (n - 2))) * values.reduce((sum, value) => sum + ((value - m) / s) ** 3, 0);
}

/** Sample excess kurtosis, adjusted for sample size (G2), as SPSS and Excel's KURT report it. Needs four values. */
export function kurtosis(values: readonly number[]): number {
  const n = values.length;
  const s = standardDeviation(values);
  if (n < 4 || !(s > 0)) return Number.NaN;
  const m = mean(values);
  const fourth = values.reduce((sum, value) => sum + ((value - m) / s) ** 4, 0);
  return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * fourth - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
}

// Correlation.

export interface Correlation {
  r: number;
  n: number;
  p: number;
}

/** Pearson's r over the pairs where both values are present, with its two-tailed p from the t distribution on n − 2 df. */
export function pearson(xs: readonly (number | null)[], ys: readonly (number | null)[]): Correlation {
  const pairs = xs.map((x, index) => [x, ys[index]] as const).filter((pair): pair is readonly [number, number] => pair[0] !== null && pair[1] !== null);
  const n = pairs.length;
  if (n < 3) return { r: Number.NaN, n, p: Number.NaN };
  const mx = mean(pairs.map(([x]) => x));
  const my = mean(pairs.map(([, y]) => y));
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pairs) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return { r: Number.NaN, n, p: Number.NaN };
  const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
  const p = Math.abs(r) === 1 ? 0 : tTestP((r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r), n - 2);
  return { r, n, p };
}

/** Ranks from 1, with tied values given the average of their ranks. */
export function ranks(values: readonly number[]): number[] {
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const result = new Array<number>(values.length);
  for (let start = 0; start < order.length; ) {
    let end = start;
    while (end + 1 < order.length && order[end + 1].value === order[start].value) end++;
    const rank = (start + end) / 2 + 1;
    for (let k = start; k <= end; k++) result[order[k].index] = rank;
    start = end + 1;
  }
  return result;
}

/** Spearman's rho: Pearson's r on ranks of the complete pairs, with p from the t approximation SPSS also uses. */
export function spearman(xs: readonly (number | null)[], ys: readonly (number | null)[]): Correlation {
  const pairs = xs.map((x, index) => [x, ys[index]] as const).filter((pair): pair is readonly [number, number] => pair[0] !== null && pair[1] !== null);
  return pearson(ranks(pairs.map(([x]) => x)), ranks(pairs.map(([, y]) => y)));
}

// Reliability.

export interface Reliability {
  alpha: number;
  items: number;
  /** Participants with every item answered. */
  n: number;
  /** Mean and SD of the scale mean score. */
  scaleMean: number;
  scaleSd: number;
  /** For each item: its correlation with the sum of the other items, and alpha without it. */
  itemTotal: { r: number; alphaIfDeleted: number }[];
}

/** Cronbach's alpha = k / (k − 1) × (1 − Σ item variances / total variance), over participants who answered every item. */
export function cronbachAlpha(items: readonly (readonly (number | null)[])[]): Reliability {
  const k = items.length;
  const rows = (items[0] ?? []).map((_, row) => items.map((item) => item[row])).filter((row): row is number[] => row.every((value) => value !== null));
  const alphaOf = (columns: number[][]) => {
    const count = columns.length;
    if (count < 2) return Number.NaN;
    const totals = columns[0].map((_, row) => columns.reduce((sum, column) => sum + column[row], 0));
    const totalVariance = variance(totals);
    if (!(totalVariance > 0)) return Number.NaN;
    return (count / (count - 1)) * (1 - columns.reduce((sum, column) => sum + variance(column), 0) / totalVariance);
  };
  const columns = items.map((_, index) => rows.map((row) => row[index]));
  const means = rows.map((row) => mean(row));
  return {
    alpha: rows.length < 2 ? Number.NaN : alphaOf(columns),
    items: k,
    n: rows.length,
    scaleMean: rows.length > 0 ? mean(means) : Number.NaN,
    scaleSd: standardDeviation(means),
    itemTotal: columns.map((column, index) => {
      const others = columns.filter((_, other) => other !== index);
      const rest = rows.map((_, row) => others.reduce((sum, candidate) => sum + candidate[row], 0));
      return { r: pearson(column, rest).r, alphaIfDeleted: k > 2 ? alphaOf(others) : Number.NaN };
    }),
  };
}

// Composite reliability and average variance extracted.

/** Composite reliability from standardised loadings: (Σλ)² / ((Σλ)² + Σ(1 − λ²)). */
export function compositeReliability(loadings: readonly number[]): number {
  const sum = loadings.reduce((total, loading) => total + loading, 0);
  const error = loadings.reduce((total, loading) => total + (1 - loading * loading), 0);
  return (sum * sum) / (sum * sum + error);
}

/** Average variance extracted: the mean of the squared standardised loadings. */
export const averageVarianceExtracted = (loadings: readonly number[]) => loadings.reduce((total, loading) => total + loading * loading, 0) / loadings.length;

// Chi-square test of association.

export interface ChiSquare {
  chi2: number;
  df: number;
  p: number;
  n: number;
  cramersV: number;
  minExpected: number;
  /** The share of cells with an expected count below 5. */
  smallExpected: number;
}

/** Pearson's chi-square test for a contingency table of counts, with Cramér's V = √(χ² / (n × (min(rows, columns) − 1))). */
export function chiSquareTest(counts: readonly (readonly number[])[]): ChiSquare {
  const rowTotals = counts.map((row) => row.reduce((sum, value) => sum + value, 0));
  const columnTotals = (counts[0] ?? []).map((_, column) => counts.reduce((sum, row) => sum + row[column], 0));
  const n = rowTotals.reduce((sum, value) => sum + value, 0);
  const rows = rowTotals.filter((total) => total > 0).length;
  const columns = columnTotals.filter((total) => total > 0).length;
  let chi2 = 0;
  let minExpected = Infinity;
  let small = 0;
  let cells = 0;
  counts.forEach((row, r) =>
    row.forEach((observed, c) => {
      if (rowTotals[r] === 0 || columnTotals[c] === 0) return;
      const expected = (rowTotals[r] * columnTotals[c]) / n;
      chi2 += (observed - expected) ** 2 / expected;
      minExpected = Math.min(minExpected, expected);
      cells++;
      if (expected < 5) small++;
    }),
  );
  const df = (rows - 1) * (columns - 1);
  const smaller = Math.min(rows, columns) - 1;
  return {
    chi2,
    df,
    p: df > 0 ? chiSquareP(chi2, df) : Number.NaN,
    n,
    cramersV: smaller > 0 && n > 0 ? Math.sqrt(chi2 / (n * smaller)) : Number.NaN,
    minExpected: cells > 0 ? minExpected : Number.NaN,
    smallExpected: cells > 0 ? small / cells : 0,
  };
}
