import type { Guide } from "../../src/domains/publishing/guide";

/**
 * What a p-value is, what it isn't, and how to report and interpret one. The six
 * principles are quoted from the ASA statement; the misinterpretations follow Greenland
 * et al. (2016). Every number in the examples is calculated by ResearchKit's own
 * statistics code, and the guide's tests recalculate them.
 */
export const whatAPValueTellsYou: Guide = {
  slug: "what-a-p-value-tells-you",
  title: "What a p-value tells you",
  description:
    "What a p-value measures, what it doesn't, the most common misinterpretations, why statistical significance isn't importance, and how to report and read p-values alongside effect sizes and confidence intervals.",
  summary:
    "A p-value is the probability of getting a result at least as extreme as yours if the null hypothesis, and every other assumption of the test, were true. A small p-value says your data would be unusual under that model; it doesn't say the null hypothesis is false, how large or important an effect is, or that the result is likely to be true. Report it with an effect size and a confidence interval, and never treat .05 as a line between truth and nothing.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "definition",
      heading: "What a p-value is",
      blocks: [
        { type: "paragraph", text: "A statistical test compares your data with what a statistical model predicts. The model includes the null hypothesis, such as “there is no difference between the groups”, and all the test's other assumptions, such as independent observations and the right kind of distribution." },
        { type: "paragraph", text: "The p-value is the probability, calculated assuming that whole model is true, of getting a test statistic at least as far from the model's prediction as the one you observed. A small p-value means your data would be unusual if the model were true; a large one means they wouldn't be (Greenland et al., 2016)." },
        { type: "paragraph", text: "The p-value is calculated assuming the null hypothesis is true, so it can't also be the probability that the null hypothesis is true." },
      ],
    },
    {
      id: "asa-principles",
      heading: "Six principles from the American Statistical Association",
      blocks: [
        { type: "paragraph", text: "In 2016 the American Statistical Association issued a statement on p-values, the first time the association had done so, setting out six principles (Wasserstein & Lazar, 2016):" },
        {
          type: "list",
          ordered: true,
          items: [
            "P-values can indicate how incompatible the data are with a specified statistical model.",
            "P-values do not measure the probability that the studied hypothesis is true, or the probability that the data were produced by random chance alone.",
            "Scientific conclusions and business or policy decisions should not be based only on whether a p-value passes a specific threshold.",
            "Proper inference requires full reporting and transparency.",
            "A p-value, or statistical significance, does not measure the size of an effect or the importance of a result.",
            "By itself, a p-value does not provide a good measure of evidence regarding a model or hypothesis.",
          ],
        },
      ],
    },
    {
      id: "misinterpretations",
      heading: "What a p-value doesn't tell you",
      blocks: [
        { type: "paragraph", text: "These misinterpretations are common in published research as well as in student work (Greenland et al., 2016):" },
        {
          type: "table",
          caption: "Common misreadings of a p-value",
          columns: ["Misreading", "Why it is wrong"],
          rows: [
            ["p = .01 means there is a 1% chance the null hypothesis is true", "The p-value is calculated assuming the null hypothesis is true; it isn't a probability for the hypothesis at all"],
            ["p = .08 means an 8% chance that the result is due to chance alone", "The p-value is calculated assuming chance alone is operating; it can't be the probability of that assumption"],
            ["p ≤ .05 means the null hypothesis is false", "A small p-value can also come from random error or from a violated assumption, such as choosing which results to report because they were significant"],
            ["p > .05 means there is no effect", "Many other hypotheses fit the data too; unless the estimate is exactly zero, some effect is present in the data, and the confidence interval shows which sizes are compatible"],
            ["A significant result is an important one", "In a large study, a trivial effect can be highly significant"],
            ["A non-significant result means the effect is small", "In a small study, even a large effect can fail to reach significance"],
          ],
        },
      ],
    },
    {
      id: "significance",
      heading: "Statistical significance and α",
      blocks: [
        { type: "paragraph", text: "Before analysing data, researchers choose a significance level, α, often .05. A result is called statistically significant if p ≤ α. α is the Type I error rate you accept: the rate at which a test would wrongly reject a true null hypothesis over many studies, not the probability that any one conclusion is wrong." },
        { type: "paragraph", text: "The .05 level is a convention, not a law of nature, and p = .049 and p = .051 are practically the same evidence. Treat significance as one piece of information, alongside the size of the effect, its precision, the study's design and the rest of the evidence (Wasserstein & Lazar, 2016)." },
      ],
    },
    {
      id: "worked-examples",
      heading: "Worked examples",
      blocks: [
        { type: "paragraph", text: "These hypothetical results show what a p-value adds, and what it leaves out. Every p-value here is calculated from the test statistic by ResearchKit's statistics code." },
        {
          type: "table",
          caption: "Three hypothetical results",
          columns: ["Result", "What the p-value says", "What else you need"],
          rows: [
            ["t(58) = 2.45, p = .017, d = 0.63", "Data this far from “no difference” would be unusual if there were no difference and the test's assumptions held", "The effect size: a medium difference by Cohen's conventions; and whether 30 participants per group is enough to estimate it precisely"],
            ["t(58) = 1.12, p = .267, d = 0.29", "Data like these would not be unusual if there were no difference", "Not evidence of no difference: with 30 per group, a two-sided test at α = .05 has only about 20% power to detect an effect of d = 0.29, so an effect that size would usually be missed"],
            ["A difference of 1.20, t(43.00) = 0.59, p = .560, 95% CI [-2.92, 5.32]", "Not significant", "The interval: differences from about −3 to +5 are all compatible with the data, so the study can't tell a negative difference from a positive one"],
          ],
        },
        { type: "paragraph", text: "The reverse problem: with 10,000 participants in each group, a standardised difference of only d = 0.05, far too small to matter in most settings, gives t(19998) = 3.54, p < .001. Significance tells you the data are unusual under the null hypothesis, not that the difference matters." },
      ],
    },
    {
      id: "what-to-report",
      heading: "What to report",
      blocks: [
        {
          type: "list",
          items: [
            "The test statistic with its degrees of freedom, such as t(58) = 2.45.",
            "The exact p-value, to two or three decimal places, such as p = .017, or p < .001 when it is smaller than .001. In APA Style, p has no leading zero, because it can't exceed 1.",
            "An effect size, such as d, r or η², and its confidence interval where you can.",
            "Every analysis you ran on the question, not only the significant ones.",
          ],
        },
        { type: "paragraph", text: "Avoid writing only “p < .05” or “ns”. They hide information readers need, and “ns” invites the reading that nothing was found." },
      ],
    },
    {
      id: "p-hacking",
      heading: "Why selective reporting distorts p-values",
      blocks: [
        { type: "paragraph", text: "A p-value is only valid if the analysis was not chosen because of its result. Running many tests, trying several outcome measures, removing outliers, adding participants or changing the analysis until p falls below .05, and then reporting only that result, makes small p-values far more likely than the test assumes, even when there is no effect (Greenland et al., 2016). Plan the analysis before seeing the data, report everything you did, and label exploratory analyses as exploratory." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Saying the p-value is the probability that the null hypothesis is true, or that the result happened by chance.",
            "Concluding “no effect” from a non-significant result.",
            "Describing p = .06 as a trend towards significance, or p = .001 as more true than p = .01.",
            "Reporting a p-value without an effect size or confidence interval.",
            "Reporting only the tests that came out significant.",
            "Interpreting the p-value of a test whose assumptions the data clearly violate.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Interpret your results with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Results Interpretation tool reads the statistics your software reports and explains them in plain language and in APA-style sentences, effect size included. The Effect Size Calculator and the Confidence Interval Calculator give you the numbers a p-value leaves out, and Power Analysis shows whether a study is large enough to detect the effects that matter." },
        { type: "links", items: [{ label: "Interpret a result", href: "/tools/results-interpretation" }, { label: "Calculate an effect size", href: "/tools/effect-size-calculator" }, { label: "Calculate a confidence interval", href: "/tools/confidence-interval-calculator" }, { label: "Run a power analysis", href: "/tools/power-analysis" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["greenland-2016", "wasserstein-lazar-2016"] }],
    },
  ],
  faq: [
    { question: "What does p < .05 mean in plain words?", answer: "If the null hypothesis and the test's other assumptions were true, a result at least this extreme would happen less than 5% of the time. It doesn't mean there is a 95% chance your hypothesis is right." },
    { question: "Is a smaller p-value a bigger effect?", answer: "No. A p-value depends on the effect's size and on the sample size, so a tiny effect in a huge sample can have a smaller p-value than a large effect in a small one. Report an effect size." },
    { question: "Should I report p = .000?", answer: "No. Software rounds; the p-value is never exactly zero. Report p < .001." },
    { question: "Can I say a result was “marginally significant”?", answer: "It is better not to. Report the exact p-value, the effect size and the confidence interval, and let them speak." },
    { question: "If p-values are so easily misread, should I avoid them?", answer: "No, but don't rely on them alone. Interpret them alongside effect sizes, confidence intervals and the design of the study." },
  ],
  relatedToolIds: ["results-interpretation", "effect-size-calculator", "confidence-interval-calculator", "power-analysis", "statistical-test-finder"],
  relatedGuideSlugs: ["confidence-intervals", "power-analysis", "how-to-report-statistics-in-apa"],
};
