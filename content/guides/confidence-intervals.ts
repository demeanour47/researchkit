import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Confidence intervals: what they are, how each common one is calculated, and how to
 * read and report them. Every formula is the one the Confidence Interval Calculator
 * uses (src/knowledge/statistics/confidence-interval.ts), and the guide's tests
 * check each worked example against the calculator.
 */
export const confidenceIntervalsGuide: Guide = {
  slug: "confidence-intervals",
  title: "Confidence Intervals",
  description:
    "What a confidence interval is and isn't, how standard errors, critical values and margins of error produce one, how intervals for means, proportions, their differences and correlations are calculated, and how to interpret and report them.",
  summary:
    "A confidence interval is a range of plausible values for a population quantity, calculated from a sample. It pairs a point estimate with a measure of its uncertainty: a narrow interval means a precise estimate, a wide one an imprecise estimate. The confidence level, such as 95%, describes how often the method captures the true value over many samples; it isn't the probability that this particular interval contains it.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-a-ci-is",
      heading: "What a confidence interval is",
      blocks: [
        { type: "paragraph", text: "Research usually studies a sample to learn about a population. A confidence interval uses the sample to give a range of values for a population quantity, such as a mean, a proportion or a correlation, together with a stated confidence level. Where a single number says what the best estimate is, an interval also says how precise that estimate is." },
        { type: "paragraph", text: "Reporting estimates with confidence intervals, rather than only whether a result was significant, is widely recommended (Cumming, 2014), and APA Style asks for confidence intervals to be reported (American Psychological Association, 2020)." },
      ],
    },
    {
      id: "point-estimate",
      heading: "Point estimate",
      blocks: [
        { type: "paragraph", text: "The point estimate is the single value calculated from the sample that best estimates the population value: the sample mean for a population mean, the sample proportion for a population proportion, Pearson's r for a population correlation. It is the centre of attention, but on its own it says nothing about how far from the population value it might be." },
      ],
    },
    {
      id: "sampling-variability",
      heading: "Sampling variability",
      blocks: [
        { type: "paragraph", text: "Different random samples from the same population give different estimates. That sampling variability is what a confidence interval describes. It doesn't describe other sources of error: a biased sample, a poorly measured outcome or a confounded comparison can all give a precise-looking interval around the wrong value." },
      ],
    },
    {
      id: "confidence-level",
      heading: "Confidence level",
      blocks: [
        { type: "paragraph", text: "The confidence level is the long-run proportion of intervals, calculated by the same method from repeated random samples, that would contain the population value. 95% is the most common choice; 90% and 99% are also used. A higher confidence level gives a wider interval from the same data." },
        { type: "table", caption: "A sample mean of 72.4, SD 9.75, n = 20, at three confidence levels", columns: ["Confidence level", "Critical value", "Margin of error", "Interval"], rows: [["90%", "t = 1.729", "3.77", "[68.63, 76.17]"], ["95%", "t = 2.093", "4.56", "[67.84, 76.96]"], ["99%", "t = 2.861", "6.24", "[66.16, 78.64]"]] },
      ],
    },
    {
      id: "alpha",
      heading: "Alpha",
      blocks: [
        { type: "paragraph", text: "α is 1 minus the confidence level: α = .05 for a 95% interval and α = .01 for a 99% interval. A two-sided interval splits α between its two ends, so a 95% interval uses the critical value that cuts off α/2 = 2.5% in each tail." },
      ],
    },
    {
      id: "standard-error",
      heading: "Standard error",
      blocks: [
        { type: "paragraph", text: "The standard error is the standard deviation of an estimate's sampling distribution: how much the estimate would typically vary from sample to sample. For a mean it is s ÷ √n, the sample standard deviation divided by the square root of the sample size. The standard deviation describes how spread out individual observations are; the standard error describes how precise the estimate is." },
      ],
    },
    {
      id: "margin-of-error",
      heading: "Margin of error",
      blocks: [
        { type: "paragraph", text: "For intervals of the form estimate ± critical value × standard error, the margin of error is critical value × standard error, the distance from the estimate to either end. Intervals for proportions and correlations calculated by better methods aren't symmetric around the estimate, so they have a distance below and a distance above rather than one margin." },
      ],
    },
    {
      id: "critical-values",
      heading: "Critical values",
      blocks: [
        { type: "paragraph", text: "The critical value sets how many standard errors the interval extends. It comes from the standard normal distribution (z) when the standard error doesn't depend on an estimated standard deviation, and from the t distribution, with its degrees of freedom, when it does." },
        { type: "table", caption: "Two-sided critical values", columns: ["Confidence level", "z", "t with 19 degrees of freedom"], rows: [["90%", "1.645", "1.729"], ["95%", "1.960", "2.093"], ["99%", "2.576", "2.861"]] },
      ],
    },
    {
      id: "one-mean",
      heading: "Confidence interval for one mean",
      blocks: [
        { type: "paragraph", text: "The interval for a population mean is mean ± t × s ÷ √n, with n − 1 degrees of freedom. For a sample mean of 72.4, a standard deviation of 9.75 and 20 observations, the standard error is 9.75 ÷ √20 = 2.18, the critical value is t = 2.093, and the margin of error is 2.093 × 2.18 = 4.56. The 95% confidence interval is [67.84, 76.96]." },
      ],
    },
    {
      id: "t-intervals",
      heading: "Why t intervals are used",
      blocks: [
        { type: "paragraph", text: "The population standard deviation is almost never known, so it is estimated by the sample standard deviation. That estimate adds uncertainty, which the t distribution accounts for (Student, 1908): its critical values are larger than z's, especially in small samples, and approach z as the sample grows. Using z with an estimated standard deviation gives intervals that are too narrow. A z interval is correct only when the population standard deviation is genuinely known, which is rare in research, so the calculator always uses t for means." },
      ],
    },
    {
      id: "two-means",
      heading: "Difference between two independent means",
      blocks: [
        { type: "paragraph", text: "For two separate groups, the interval estimates μ₁ − μ₂, the difference between the population means, in that direction: a positive difference means group 1 is higher. Swapping the groups reverses the signs of the estimate and both limits." },
        { type: "paragraph", text: "For example, group 1 has a mean of 24.1 (SD 6.2, n = 30) and group 2 a mean of 22.9 (SD 8.5, n = 25). The difference is 1.20, the standard error is 2.04, and the 95% confidence interval is [-2.92, 5.32]." },
      ],
    },
    {
      id: "welch",
      heading: "Welch's method",
      blocks: [
        { type: "paragraph", text: "The calculator uses Welch's method, which doesn't assume the two groups have equal variances (Welch, 1947). The standard error is √(s₁²/n₁ + s₂²/n₂), and the degrees of freedom come from the Welch–Satterthwaite formula (s₁²/n₁ + s₂²/n₂)² ÷ ((s₁²/n₁)²/(n₁ − 1) + (s₂²/n₂)²/(n₂ − 1)), which is usually not a whole number: 43.00 in the example above. The pooled-variance interval assumes equal variances and can be misleading when the groups differ in both spread and size; Welch's interval stays accurate in that case, and when the groups have similar sizes and spreads it gives almost the same interval as the pooled method." },
      ],
    },
    {
      id: "paired",
      heading: "Paired mean differences",
      blocks: [
        { type: "paragraph", text: "When the same participants are measured twice, or participants are matched in pairs, the analysis is performed on the differences within each pair. The interval is the one-mean t interval applied to those differences: mean difference ± t × (SD of the differences) ÷ √n, with n − 1 degrees of freedom, where n is the number of pairs." },
        { type: "paragraph", text: "For 10 pairs with a mean difference of 2.4 and a standard deviation of the differences of 1.51, the 95% confidence interval is [1.32, 3.48]. Treating paired data as two independent groups ignores the pairing; when the two measurements are positively correlated, as repeated measurements usually are, it gives an interval that is wider than it should be." },
      ],
    },
    {
      id: "proportion",
      heading: "Confidence interval for a proportion",
      blocks: [
        { type: "paragraph", text: "The simplest interval for a proportion, p̂ ± z√(p̂(1 − p̂)/n), is known as the Wald interval. It covers the true proportion less often than its confidence level claims, especially in small samples or near 0% or 100%, and with 0 successes it collapses to a single point (Newcombe, 1998a)." },
        { type: "paragraph", text: "The calculator uses the Wilson score interval (Wilson, 1927): (x + z²/2 ± z√(x(n − x)/n + z²/4)) ÷ (n + z²), for x successes in n trials. It stays within 0 to 1 and keeps close to its stated confidence. For 64 successes in 100, the estimate is 64.0% and the 95% Wilson interval is [54.2%, 72.7%]; the Wald interval would be [54.6%, 73.4%]. For 0 successes in 20, the Wilson interval is [0.0%, 16.1%], where the Wald interval would claim the proportion is exactly 0." },
      ],
    },
    {
      id: "two-proportions",
      heading: "Difference between two proportions",
      blocks: [
        { type: "paragraph", text: "For two independent groups, the calculator gives an interval for p₁ − p₂, the difference between the proportions, using Newcombe's hybrid score method (Newcombe, 1998b), which is among those recommended in a comparison of methods (Fagerland et al., 2015). It combines the Wilson interval of each proportion, [l₁, u₁] and [l₂, u₂]: the lower limit is d − √((p̂₁ − l₁)² + (u₂ − p̂₂)²) and the upper limit d + √((u₁ − p̂₁)² + (p̂₂ − l₂)²), where d = p̂₁ − p̂₂." },
        { type: "paragraph", text: "For 45 of 60 in group 1 and 30 of 75 in group 2, the difference is 35.0 percentage points, with a 95% confidence interval of [18.3, 48.9] percentage points. This is an interval for a difference; it is not an interval for a risk ratio, relative risk or odds ratio, which describe the comparison on a different scale." },
      ],
    },
    {
      id: "correlation",
      heading: "Pearson correlation intervals",
      blocks: [
        { type: "paragraph", text: "An interval for a population correlation ρ uses Pearson's r and the number of pairs of observations. For r = .45 from 50 pairs, the 95% confidence interval is [.20, .65]. The interval isn't symmetric around r: it extends further towards 0 than towards ±1, because a correlation can't exceed 1. This method is for Pearson's correlation; it doesn't apply to Spearman's or other rank correlations." },
      ],
    },
    {
      id: "fisher-z",
      heading: "Fisher's z transformation",
      blocks: [
        { type: "paragraph", text: "The sampling distribution of r is skewed, and more so near ±1. Fisher's transformation z = artanh r = ½ ln((1 + r) ÷ (1 − r)) has an approximately normal sampling distribution with standard error 1 ÷ √(n − 3) (Fisher, 1921). The interval is built on the z scale and transformed back with tanh. For r = .45 and n = 50, z = 0.4847 and the standard error is 1 ÷ √47 = 0.1459, so the z interval is 0.4847 ± 1.960 × 0.1459." },
        { type: "paragraph", text: "It needs at least 4 pairs, and it is an approximation that is less accurate in very small samples. A correlation of exactly ±1 has no interval: its z is infinite." },
      ],
    },
    {
      id: "interpreting",
      heading: "Interpreting confidence intervals",
      blocks: [
        { type: "paragraph", text: "The interval is a range of population values that are compatible with the data, given the method's assumptions. Its width shows precision: values near the middle are more compatible with the data than values near the ends, and values outside it are less compatible." },
        { type: "paragraph", text: "The confidence level describes the method: if the sampling procedure were repeated many times, about 95% of 95% intervals constructed this way would contain the true value. A particular interval either contains it or doesn't." },
      ],
    },
    {
      id: "what-it-does-not-mean",
      heading: "What a 95% confidence interval does not mean",
      blocks: [
        { type: "list", items: [
          "It doesn't mean there is a 95% probability that the population value lies in this particular interval. In the standard frequentist framework, the population value is fixed and the interval varies from sample to sample.",
          "It doesn't mean 95% of the observations lie in the interval: that would be a prediction or tolerance interval.",
          "It doesn't mean a repeat of the study would give an estimate inside this interval 95% of the time.",
          "It doesn't account for bias, measurement error or a sample that doesn't represent the population.",
        ] },
        { type: "paragraph", text: "These misreadings are common: when 120 researchers and 442 students in psychology were asked about six statements interpreting a confidence interval, all of them false, they endorsed more than three on average (Hoekstra et al., 2014)." },
      ],
    },
    {
      id: "statistical-significance",
      heading: "Confidence intervals and statistical significance",
      blocks: [
        { type: "paragraph", text: "For the t intervals here, a 95% interval for a difference that excludes 0 corresponds to a two-sided t test using the same method rejecting “no difference” at α = .05, and an interval that includes 0 corresponds to not rejecting it. For the proportion and correlation intervals, the correspondence with the usual tests is close but not exact, because they are built differently." },
        { type: "paragraph", text: "An interval that includes 0 doesn't show that there is no effect. In the example of two means above, [-2.92, 5.32] is compatible with group 2 being nearly 3 points higher, with no difference, and with group 1 being over 5 points higher. That is a statement about imprecision, not evidence of no difference." },
      ],
    },
    {
      id: "practical-significance",
      heading: "Confidence intervals, effect sizes and practical significance",
      blocks: [
        { type: "paragraph", text: "An effect size describes how large an effect is; a confidence interval describes how uncertain an estimate of it is; practical significance is whether an effect of that size matters, which depends on the field and the consequences. A confidence interval doesn't decide practical importance by itself, but it helps: if every value in the interval would be too small to matter, the effect is probably unimportant even when it is statistically significant; if the interval includes both trivial and important values, the study can't tell which applies." },
      ],
    },
    {
      id: "precision-and-sample-size",
      heading: "Precision and sample size",
      blocks: [
        { type: "paragraph", text: "The standard error shrinks with the square root of the sample size, so quadrupling the sample roughly halves the margin of error. Power analysis plans a sample size before data collection; a confidence interval quantifies the uncertainty of an estimate afterwards. The two answer different questions." },
        { type: "table", caption: "A mean of 72.4 with SD 9.75: 95% intervals at three sample sizes", columns: ["Sample size", "Standard error", "Margin of error", "Interval"], rows: [["20", "2.18", "4.56", "[67.84, 76.96]"], ["80", "1.09", "2.17", "[70.23, 74.57]"], ["320", "0.55", "1.07", "[71.33, 73.47]"]] },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        { type: "table", caption: "Common mistakes with confidence intervals", columns: ["Mistake", "Instead"], rows: [
          ["Saying there is a 95% probability that the true value lies in this interval", "Say the method captures the true value in about 95% of samples"],
          ["Reading an interval that includes 0 as proof of no effect", "Describe the range of effects the data are compatible with"],
          ["Using z with a sample standard deviation", "Use the t interval for means"],
          ["Analysing paired data as two independent groups", "Calculate the interval from the within-pair differences"],
          ["Using the Wald interval for a small sample or an extreme proportion", "Use the Wilson score interval"],
          ["Confusing the standard deviation with the standard error", "The standard error is the standard deviation divided by √n"],
          ["Judging whether two groups differ by whether their separate intervals overlap", "Calculate an interval for the difference"],
          ["Reporting the interval without the estimate or confidence level", "Report the estimate, the confidence level and the interval together"],
        ] },
      ],
    },
    {
      id: "assumptions",
      heading: "Assumptions",
      blocks: [
        { type: "list", items: [
          "Independent observations: a random sample, or a design that justifies treating observations as independent.",
          "Means: a quantitative outcome from a roughly normal population, or a sample large enough for the t interval to be robust. Strong skew or outliers in small samples can make it misleading.",
          "Two means: independent groups. Equal variances aren't assumed by Welch's method.",
          "Paired means: meaningful pairs, with the within-pair differences as the unit of analysis.",
          "Proportions: a binary outcome. The Wilson and Newcombe intervals are approximations, accurate enough for most practical sample sizes.",
          "Correlation: paired quantitative observations with a linear relationship, roughly bivariate normal.",
        ] },
      ],
    },
    {
      id: "reporting",
      heading: "How to report confidence intervals",
      blocks: [
        { type: "paragraph", text: "Report the estimate, the confidence level and the interval in square brackets, as APA Style does (American Psychological Association, 2020), and name the method where it isn't the usual one. Describe the study design and how the data were collected: an interval doesn't replace that context." },
        { type: "list", items: [
          "The mean was 72.40 (95% CI [67.84, 76.96]).",
          "The difference between the means (group 1 − group 2) was 1.20 (95% CI [-2.92, 5.32]; Welch's method).",
          "The estimated proportion was 64.0% (95% CI [54.2%, 72.7%]; Wilson score interval).",
          "The correlation was r = .45 (95% CI [.20, .65]; Fisher's z transformation).",
        ] },
      ],
    },
    {
      id: "using-the-calculator",
      heading: "How to use ResearchKit's Confidence Interval Calculator",
      blocks: [
        { type: "list", ordered: true, items: [
          "Choose what you want a confidence interval for: one mean, two independent means, a paired mean difference, one proportion, two proportions or a Pearson correlation.",
          "Enter the summary statistics from your sample, and choose 90%, 95% or 99% confidence.",
          "Press Calculate. Read the estimate, standard error, critical value and interval, and open “How this was calculated” to see every step.",
          "Check the assumptions, then adapt the reporting sentence for your results section.",
        ] },
        { type: "links", items: [{ label: "Open the Confidence Interval Calculator", href: "/tools/confidence-interval-calculator" }, { label: "Calculate an effect size", href: "/tools/effect-size-calculator" }, { label: "Plan a sample size with power analysis", href: "/tools/power-analysis" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [
        { type: "references", ids: ["apa-2020", "cumming-2014", "fagerland-2015", "fisher-1921", "hoekstra-2014", "newcombe-1998a", "newcombe-1998b", "student-1908", "welch-1947", "wilson-1927"] },
      ],
    },
  ],
  faq: [
    { question: "Is a 95% confidence interval a 95% probability that the true value is inside it?", answer: "No. The 95% describes how often the method captures the true value over many samples. Any one interval either contains it or doesn't." },
    { question: "Why is my proportion interval not symmetric?", answer: "The Wilson interval is centred on a value pulled slightly towards 50%, which keeps it within 0 to 1 and closer to its stated confidence, especially in small samples." },
    { question: "Why does the calculator use t rather than z for means?", answer: "Because the population standard deviation is estimated from the sample. The t distribution accounts for that extra uncertainty." },
    { question: "Can I enter percentages?", answer: "Enter counts for proportions: the number with the outcome and the sample size. The result is shown as a proportion and a percentage." },
    { question: "Is my data sent anywhere?", answer: "No. Calculations run in your browser, and the values you enter aren't sent or stored." },
  ],
  relatedToolIds: ["confidence-interval-calculator", "effect-size-calculator", "power-analysis", "results-interpretation"],
  relatedGuideSlugs: ["what-a-p-value-tells-you", "power-analysis", "how-to-report-statistics-in-apa"],
};
