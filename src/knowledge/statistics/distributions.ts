/**
 * Probability distributions for statistical calculations: the normal, Student t and
 * F distributions, their noncentral forms, and bounded root finding. Pure and
 * deterministic, with no dependencies.
 *
 * Methods
 * - ln Γ(x): Stirling's series with seven terms after shifting x to at least 10 by
 *   the recurrence Γ(x + 1) = x Γ(x); accurate to about 1e-15 for x > 0.
 * - Regularized incomplete gamma P(a, x) and Q(a, x): the power series for
 *   x < a + 1, otherwise a continued fraction evaluated by the modified Lentz method
 *   (Press et al., Numerical Recipes, §6.2). The normal distribution uses
 *   erfc(y) = Q(½, y²), so far tails keep their relative precision.
 * - Regularized incomplete beta I_x(a, b): a continued fraction evaluated by the
 *   modified Lentz method, using the symmetry I_x(a, b) = 1 − I_{1−x}(b, a) where
 *   the fraction converges faster (Numerical Recipes, §6.4). Student t and F
 *   probabilities are incomplete beta functions.
 * - Noncentral t: Lenth's algorithm AS 243 (Applied Statistics, 1989), a series in
 *   incomplete beta functions. When δ² is so large that its first Poisson weight
 *   underflows (|δ| > 37), the normal approximation of Abramowitz and Stegun 26.7.10
 *   is used; there, power is 1 to many decimal places.
 * - Noncentral F: the Poisson mixture of incomplete beta functions, summed outward
 *   from the largest weight until the remaining weight is negligible.
 * - Quantiles: bisection on the distribution function, within a bracket that is
 *   widened until it contains the root, to a fixed tolerance and iteration limit.
 */

const EPSILON = 1e-15;
const TINY = 1e-300;
const MAX_ITERATIONS = 10_000;
const LN_SQRT_2PI = 0.9189385332046728; // ln √(2π)
const LN_SQRT_PI = 0.5723649429247001; // ln √π
const SQRT_2_OVER_PI = 0.7978845608028654; // √(2/π)

/** ln Γ(x) for x > 0. */
export function logGamma(x: number): number {
  if (!(x > 0)) throw new RangeError("logGamma needs a positive argument");
  // One logarithm of the product, rather than a sum of logarithms, keeps rounding error small.
  let product = 1;
  let z = x;
  while (z < 10) {
    product *= z;
    z += 1;
  }
  const shift = Math.log(product);
  const inverse = 1 / z;
  const inverse2 = inverse * inverse;
  // Stirling's series: 1/12z − 1/360z³ + 1/1260z⁵ − 1/1680z⁷ + 1/1188z⁹ − 691/360360z¹¹ + 1/156z¹³
  // (Bernoulli numbers B2 to B14); for z ≥ 10 the first omitted term is below 1e-16.
  const series = inverse * (1 / 12 - inverse2 * (1 / 360 - inverse2 * (1 / 1260 - inverse2 * (1 / 1680 - inverse2 * (1 / 1188 - inverse2 * (691 / 360360 - inverse2 / 156))))));
  return (z - 0.5) * Math.log(z) - z + LN_SQRT_2PI + series - shift;
}

/** The regularized incomplete gamma functions P(a, x) and Q(a, x) = 1 − P(a, x), each computed where it is precise. */
function incompleteGamma(a: number, x: number): { lower: number; upper: number } {
  if (x <= 0) return { lower: 0, upper: 1 };
  const prefix = Math.exp(-x + a * Math.log(x) - logGamma(a));
  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n < MAX_ITERATIONS; n += 1) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * EPSILON) break;
    }
    const lower = sum * prefix;
    return { lower, upper: 1 - lower };
  }
  let b = x + 1 - a;
  let c = 1 / TINY;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < MAX_ITERATIONS; i += 1) {
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
  const upper = prefix * h;
  return { lower: 1 - upper, upper };
}

/** P(Z > z) for a standard normal Z, precise in the far upper tail. */
export function normalUpper(z: number): number {
  if (Number.isNaN(z)) return Number.NaN;
  if (z === Number.POSITIVE_INFINITY) return 0;
  if (z === Number.NEGATIVE_INFINITY) return 1;
  // P(Z > z) = ½ erfc(z/√2), and erfc(y) = Q(½, y²) for y ≥ 0.
  const tail = 0.5 * incompleteGamma(0.5, (z * z) / 2).upper;
  return z >= 0 ? tail : 1 - tail;
}

/** P(Z ≤ z) for a standard normal Z. */
export const normalCdf = (z: number) => normalUpper(-z);

/**
 * Finds the x in [low, high] where an increasing function reaches a target, by
 * bisection. Returns null if the bracket doesn't contain the target.
 */
export function bisect(f: (x: number) => number, target: number, low: number, high: number, tolerance = 1e-12): number | null {
  let lo = low;
  let hi = high;
  const fLow = f(lo) - target;
  const fHigh = f(hi) - target;
  if (Number.isNaN(fLow) || Number.isNaN(fHigh) || fLow > 0 || fHigh < 0) return null;
  for (let i = 0; i < 400 && hi - lo > tolerance * Math.max(1, Math.abs(lo)); i += 1) {
    const mid = (lo + hi) / 2;
    if (f(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The z with P(Z > z) = p, for 0 < p < 1. */
export function normalUpperQuantile(p: number): number {
  if (!(p > 0 && p < 1)) throw new RangeError("probability must be between 0 and 1");
  // P(Z > z) decreases in z, so solve −P(Z > z) = −p, an increasing function.
  const z = bisect((x) => -normalUpper(x), -p, -40, 40, 1e-15);
  if (z === null) throw new RangeError("normal quantile not found");
  return z;
}

/** The continued fraction for the incomplete beta function (modified Lentz). */
function betaFraction(a: number, b: number, x: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m < MAX_ITERATIONS; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
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

/** The regularized incomplete beta function I_x(a, b), for 0 ≤ x ≤ 1 and a, b > 0. */
export function regularizedBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (front * betaFraction(a, b, x)) / a : 1 - (front * betaFraction(b, a, 1 - x)) / b;
}

/** 1 − I_x(a, b), computed directly so small upper tails keep their precision. */
const regularizedBetaUpper = (x: number, a: number, b: number) => regularizedBeta(1 - x, b, a);

/** P(T > t) for Student's t with df degrees of freedom. */
export function studentTUpper(t: number, df: number): number {
  const tail = 0.5 * regularizedBeta(df / (df + t * t), df / 2, 0.5);
  return t >= 0 ? tail : 1 - tail;
}

/** P(T ≤ t) for Student's t with df degrees of freedom. */
export const studentTCdf = (t: number, df: number) => studentTUpper(-t, df);

/** The t with P(T > t) = p, for 0 < p < 1. */
export function studentTUpperQuantile(p: number, df: number): number {
  if (!(p > 0 && p < 1)) throw new RangeError("probability must be between 0 and 1");
  let high = 10;
  while (studentTUpper(high, df) > p && high < 1e12) high *= 2;
  const t = bisect((x) => -studentTUpper(x, df), -p, -high, high, 1e-14);
  if (t === null) throw new RangeError("t quantile not found");
  return t;
}

/** P(F > f) for the F distribution with d1 and d2 degrees of freedom. */
export function fUpper(f: number, d1: number, d2: number): number {
  if (f <= 0) return 1;
  return regularizedBeta(d2 / (d2 + d1 * f), d2 / 2, d1 / 2);
}

/** The f with P(F > f) = p, for 0 < p < 1. */
export function fUpperQuantile(p: number, d1: number, d2: number): number {
  if (!(p > 0 && p < 1)) throw new RangeError("probability must be between 0 and 1");
  let high = 10;
  while (fUpper(high, d1, d2) > p && high < 1e12) high *= 2;
  const f = bisect((x) => -fUpper(x, d1, d2), -p, 0, high, 1e-14);
  if (f === null) throw new RangeError("F quantile not found");
  return f;
}

/** P(T ≤ t) for the noncentral t distribution with df degrees of freedom and noncentrality δ (AS 243). */
export function noncentralTCdf(t: number, df: number, delta: number): number {
  if (!(df > 0)) throw new RangeError("degrees of freedom must be positive");
  const negative = t < 0;
  const del = negative ? -delta : delta;
  const lambda = del * del;
  let p = 0.5 * Math.exp(-0.5 * lambda);
  if (p === 0) {
    // Abramowitz and Stegun 26.7.10: a normal approximation, used only where the series underflows.
    const tt = negative ? -t : t;
    const z = (tt * (1 - 1 / (4 * df)) - del) / Math.sqrt(1 + (tt * tt) / (2 * df));
    const cdf = normalCdf(z);
    return negative ? 1 - cdf : cdf;
  }
  let result = 0;
  const x = (t * t) / (t * t + df);
  if (x > 0) {
    let q = SQRT_2_OVER_PI * p * del;
    let s = 0.5 - p;
    let a = 0.5;
    const b = 0.5 * df;
    const rxb = Math.pow(1 - x, b);
    const logBeta = LN_SQRT_PI + logGamma(b) - logGamma(a + b);
    let xOdd = regularizedBeta(x, a, b);
    let gOdd = 2 * rxb * Math.exp(a * Math.log(x) - logBeta);
    let xEven = 1 - rxb;
    let gEven = b * x * rxb;
    result = p * xOdd + q * xEven;
    for (let en = 1; en <= MAX_ITERATIONS; en += 1) {
      a += 1;
      xOdd -= gOdd;
      xEven -= gEven;
      gOdd *= (x * (a + b - 1)) / a;
      gEven *= (x * (a + b - 0.5)) / (a + 0.5);
      p *= lambda / (2 * en);
      q *= lambda / (2 * en + 1);
      s -= p;
      result += p * xOdd + q * xEven;
      const errorBound = 2 * s * (xOdd - gOdd);
      if (errorBound <= 1e-14 && en > lambda / 2) break;
    }
  }
  result += normalCdf(-del);
  const cdf = Math.min(1, Math.max(0, result));
  return negative ? 1 - cdf : cdf;
}

/** P(F > f) for the noncentral F distribution with d1, d2 degrees of freedom and noncentrality λ. */
export function noncentralFUpper(f: number, d1: number, d2: number, lambda: number): number {
  if (f <= 0) return 1;
  if (lambda <= 0) return fUpper(f, d1, d2);
  const x = (d1 * f) / (d1 * f + d2);
  const half = lambda / 2;
  const mode = Math.floor(half);
  const weightAt = (j: number) => Math.exp(-half + j * Math.log(half) - logGamma(j + 1));
  const term = (j: number) => weightAt(j) * regularizedBetaUpper(x, d1 / 2 + j, d2 / 2);
  let sum = term(mode);
  let used = weightAt(mode);
  for (let j = mode + 1; j < mode + MAX_ITERATIONS; j += 1) {
    const w = weightAt(j);
    sum += term(j);
    used += w;
    if (w < 1e-17 && 1 - used < 1e-15) break;
    if (w < 1e-20) break;
  }
  for (let j = mode - 1; j >= 0; j -= 1) {
    const w = weightAt(j);
    sum += term(j);
    if (w < 1e-20) break;
  }
  return Math.min(1, Math.max(0, sum));
}
