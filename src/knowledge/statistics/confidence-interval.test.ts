import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CI_METHODS, correlationInterval, meanInterval, newcombeInterval, parseCiMethod, welchDf, welchInterval, wilsonInterval, type ConfidenceInterval } from "./confidence-interval";

/**
 * Reference values come from published examples where they exist, and otherwise
 * from SciPy 1.18 and statsmodels 0.15, independent implementations computed from raw
 * data where possible (scipy.stats.ttest_1samp, ttest_rel and ttest_ind(equal_var=False)
 * confidence_interval(); statsmodels proportion_confint(method="wilson") and
 * confint_proportions_2indep(method="newcomb"); scipy.stats.pearsonr confidence_interval()).
 */
const close = (actual: number, expected: number, tolerance = 1e-9, label = "") =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label} expected ${expected}, got ${actual}`);
const bounds = (interval: ConfidenceInterval, [lower, upper]: readonly [number, number], tolerance = 1e-9, label = "") => {
  close(interval.lower, lower, tolerance, `${label} lower`);
  close(interval.upper, upper, tolerance, `${label} upper`);
};
const finite = (interval: ConfidenceInterval) => {
  for (const [key, value] of Object.entries(interval)) if (typeof value === "number") assert.ok(Number.isFinite(value), `${key} = ${value}`);
  assert.ok(interval.lower <= interval.estimate && interval.estimate <= interval.upper, `${interval.lower} ≤ ${interval.estimate} ≤ ${interval.upper}`);
};

describe("methods", () => {
  it("reads only supported methods", () => {
    assert.equal(CI_METHODS.length, 6);
    assert.equal(parseCiMethod("one-proportion"), "one-proportion");
    assert.equal(parseCiMethod("odds-ratio"), null);
  });
});

describe("t interval for one mean", () => {
  it("reproduces the NIST/SEMATECH e-Handbook example (§1.3.5.2): N = 195, 95% limits 9.258242 and 9.264679", () => {
    const interval = meanInterval(9.26146, 0.022789, 195, 0.95);
    close(interval.critical.value, 1.9723, 5e-5, "t");
    assert.ok(interval.critical.distribution === "t" && interval.critical.df === 194);
    // NIST's limits come from the unrounded data; from the printed mean and SD they agree to 1e-6.
    bounds(interval, [9.258242, 9.264679], 1.5e-6, "NIST");
  });

  it("matches SciPy at 90%, 95% and 99% for a small sample", () => {
    const [mean, sd, n] = [13.4875, 1.2322308457196065, 8];
    bounds(meanInterval(mean, sd, n, 0.9), [12.66210903397261, 14.31289096602739], 1e-9, "90%");
    bounds(meanInterval(mean, sd, n, 0.95), [12.457329232700937, 14.517670767299064], 1e-9, "95%");
    bounds(meanInterval(mean, sd, n, 0.99), [11.96291722912066, 15.012082770879342], 1e-9, "99%");
  });

  it("gives standard error s/√n, margin t × SE, and widens with the confidence level", () => {
    const interval = meanInterval(72.4, 9.8, 25, 0.95);
    close(interval.standardError, 1.96, 1e-12);
    close(interval.margin, interval.critical.value * 1.96, 1e-12);
    close(interval.critical.value, 2.063898561628021, 1e-9, "t(0.975, 24)");
    const widths = [0.9, 0.95, 0.99].map((level) => meanInterval(72.4, 9.8, 25, level).margin);
    assert.ok(widths[0] < widths[1] && widths[1] < widths[2]);
    finite(interval);
  });

  it("handles the smallest sample, n = 2, with t(0.975, 1) = 12.706", () => {
    const interval = meanInterval(10, 2, 2, 0.95);
    close(interval.critical.value, 12.706204736174698, 1e-8);
    finite(interval);
  });

  it("approaches the normal critical value for very large samples", () => {
    const interval = meanInterval(50, 10, 10_000_000, 0.95);
    close(interval.critical.value, 1.959964, 1e-5);
    finite(interval);
  });
});

describe("paired mean difference", () => {
  it("is the one-sample t interval of the differences, matching SciPy's paired t test", () => {
    bounds(meanInterval(2.4, 1.5055453054181622, 10, 0.95), [1.3229977685174041, 3.4770022314825955], 1e-9, "paired");
  });
});

describe("Welch interval for two independent means", () => {
  const group1 = { mean: 5.8999999999999995, sd: 0.8602325267042628, n: 7 };
  const group2 = { mean: 4.0181818181818185, sd: 0.9368224824567157, n: 11 };

  it("uses the Welch–Satterthwaite degrees of freedom", () => {
    close(welchDf(group1, group2), 13.768684746824265, 1e-9);
  });

  it("matches SciPy's Welch test at 90%, 95% and 99%, with unequal sizes and SDs", () => {
    bounds(welchInterval(group1, group2, 0.9), [1.1223266638029001, 2.6413096998334615], 1e-9, "90%");
    bounds(welchInterval(group1, group2, 0.95), [0.9566081529321167, 2.807028210704245], 1e-9, "95%");
    bounds(welchInterval(group1, group2, 0.99), [0.5963961774485511, 3.1672401861878106], 1e-9, "99%");
  });

  it("keeps the direction: swapping the groups negates the interval", () => {
    const forward = welchInterval(group1, group2, 0.95);
    const backward = welchInterval(group2, group1, 0.95);
    close(backward.estimate, -forward.estimate, 1e-12);
    close(backward.lower, -forward.upper, 1e-12);
    close(backward.upper, -forward.lower, 1e-12);
  });

  it("reduces to n − 1 degrees of freedom when one group has no variation", () => {
    close(welchDf({ mean: 1, sd: 0, n: 5 }, { mean: 2, sd: 3, n: 12 }), 11, 1e-12);
    finite(welchInterval({ mean: 1, sd: 0, n: 5 }, { mean: 2, sd: 3, n: 12 }, 0.95));
  });
});

describe("Wilson interval for one proportion", () => {
  const cases: readonly [number, number, number, readonly [number, number]][] = [
    [0, 20, 0.95, [0, 0.16112515805281938]],
    [20, 20, 0.95, [0.8388748419471806, 1]],
    [1, 29, 0.95, [0.006113214292762653, 0.17175521879320288]],
    [81, 263, 0.95, [0.2552885198782742, 0.36620957698280004]],
    [15, 148, 0.95, [0.0623863995307363, 0.16048724172330803]],
    [64, 100, 0.9, [0.5583186599395069, 0.7143053782412043]],
    [64, 100, 0.95, [0.5423540245160874, 0.7272877959859567]],
    [64, 100, 0.99, [0.5112410876440067, 0.7513371197955628]],
    [1, 1, 0.95, [0.20654931437723745, 1]],
    [0, 1, 0.95, [0, 0.7934506856227626]],
    [999_999, 1_000_000, 0.95, [0.9999943350881957, 0.9999998234754233]],
  ];
  for (const [x, n, level, expected] of cases) {
    it(`matches statsmodels for ${x}/${n} at ${level * 100}%`, () => {
      const interval = wilsonInterval(x, n, level);
      bounds(interval, expected, 1e-9, `${x}/${n}`);
      finite(interval);
    });
  }

  it("is exactly 0 or 1 at 0 or n successes, never outside [0, 1]", () => {
    for (const n of [1, 7, 38, 1000]) {
      assert.equal(wilsonInterval(0, n, 0.95).lower, 0);
      assert.equal(wilsonInterval(n, n, 0.95).upper, 1);
      for (const level of [0.9, 0.95, 0.99]) for (const x of [0, 1, n - 1, n]) {
        const interval = wilsonInterval(Math.max(0, x), n, level);
        assert.ok(interval.lower >= 0 && interval.upper <= 1);
      }
    }
  });

  it("is centred on (x + z²/2)/(n + z²), not on p̂", () => {
    const interval = wilsonInterval(64, 100, 0.95);
    close((interval.lower + interval.upper) / 2, interval.centre, 1e-12);
    assert.ok(interval.centre < interval.estimate);
  });
});

describe("Newcombe interval for a difference of proportions", () => {
  it("reproduces Fagerland et al. (2015): 7/34 − 1/34 gives 0.019 to 0.34", () => {
    const interval = newcombeInterval(7, 34, 1, 34, 0.95);
    close(interval.lower, 0.019, 0.0005);
    close(interval.upper, 0.34, 0.005);
  });

  const cases: readonly [number, number, number, number, number, readonly [number, number]][] = [
    [7, 34, 1, 34, 0.95, [0.018921443885772993, 0.3403686870327073]],
    [56, 70, 48, 80, 0.9, [0.07656419154407207, 0.31364458358294384]],
    [56, 70, 48, 80, 0.95, [0.05243147240236498, 0.333872654036906]],
    [56, 70, 48, 80, 0.99, [0.005370869250078403, 0.3718084317757736]],
    [9, 10, 3, 10, 0.95, [0.17052272393450302, 0.8090179735354881]],
    [6, 7, 2, 7, 0.95, [0.0582279274823122, 0.8062496375242277]],
    [5, 56, 0, 29, 0.95, [-0.03813714790353688, 0.19256001385511162]],
    [0, 10, 0, 20, 0.95, [-0.16112515805281938, 0.2775327998628892]],
    [10, 10, 0, 20, 0.95, [0.6790860371419147, 1]],
    [45, 60, 30, 75, 0.95, [0.18339147541441841, 0.4885410117656505]],
  ];
  for (const [x1, n1, x2, n2, level, expected] of cases) {
    it(`matches statsmodels for ${x1}/${n1} − ${x2}/${n2} at ${level * 100}%`, () => {
      const interval = newcombeInterval(x1, n1, x2, n2, level);
      bounds(interval, expected, 1e-9, `${x1}/${n1} − ${x2}/${n2}`);
      finite(interval);
    });
  }

  it("keeps the direction p₁ − p₂ and stays within [−1, 1]", () => {
    const forward = newcombeInterval(45, 60, 30, 75, 0.95);
    const backward = newcombeInterval(30, 75, 45, 60, 0.95);
    close(backward.lower, -forward.upper, 1e-12);
    close(backward.upper, -forward.lower, 1e-12);
    const extreme = newcombeInterval(0, 5, 5, 5, 0.99);
    assert.ok(extreme.lower >= -1 && extreme.upper <= 0);
    finite(extreme);
  });
});

describe("Fisher z interval for a correlation", () => {
  const cases: readonly [number, number, number, readonly [number, number]][] = [
    [0.6859201221617036, 6, 0.95, [-0.28340081344815804, 0.9619797679192155]],
    [-0.6859201221617036, 6, 0.95, [-0.9619797679192155, 0.28340081344815804]],
    [0.41087234089034536, 30, 0.9, [0.11953381515276425, 0.6370615843372142]],
    [0.41087234089034536, 30, 0.95, [0.05939505036119784, 0.6717116723486115]],
    [0.41087234089034536, 30, 0.99, [-0.05898972614225499, 0.7317010754251552]],
    [-0.421546547805275, 200, 0.95, [-0.5293293165900993, -0.30037309197419093]],
  ];
  for (const [r, n, level, expected] of cases) {
    it(`matches SciPy's pearsonr interval for r = ${r.toFixed(3)}, n = ${n}, ${level * 100}%`, () => {
      const interval = correlationInterval(r, n, level);
      bounds(interval, expected, 1e-9, `r ${r}`);
      finite(interval);
    });
  }

  it("is symmetric about 0 for r = 0, and on the z scale for any r", () => {
    const zero = correlationInterval(0, 50, 0.95);
    close(zero.lower, -zero.upper, 1e-15);
    const interval = correlationInterval(0.7, 40, 0.95);
    close(interval.z - interval.zLower, interval.zUpper - interval.z, 1e-12);
    close(interval.standardError, 1 / Math.sqrt(37), 1e-15);
    assert.ok(interval.upper - interval.estimate < interval.estimate - interval.lower, "asymmetric on the r scale");
  });

  it("stays finite and inside (−1, 1) for r close to ±1 and the smallest n", () => {
    for (const r of [0.999999, -0.999999, 0.9999999999]) {
      const interval = correlationInterval(r, 4, 0.99);
      finite(interval);
      assert.ok(interval.lower > -1 && interval.upper <= 1);
    }
  });
});
