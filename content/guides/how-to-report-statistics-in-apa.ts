import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Reporting statistical results in APA Style. The formatting rules are the ones
 * ResearchKit's results tools apply (src/knowledge/research/results/format.ts), and
 * every example sentence is what the Results Interpretation tool or the Confidence
 * Interval Calculator writes for the same numbers; the guide's tests regenerate them.
 */
export const howToReportStatisticsInApa: Guide = {
  slug: "how-to-report-statistics-in-apa",
  title: "How to report statistics in APA Style",
  description:
    "How to write statistical results in APA Style: formatting t, F, r, χ² and p, decimal places and leading zeros, effect sizes and confidence intervals, example sentences for common tests, and when to use a table.",
  summary:
    "In APA Style, report each result as a sentence that says what you found, followed by the test statistic with its degrees of freedom, the exact p-value and an effect size, such as t(58) = 2.45, p = .017, d = 0.63. Give most statistics to two decimal places and p to three, drop the leading zero from values that can't exceed 1, and add confidence intervals in square brackets. Report non-significant results just as fully.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "principles",
      heading: "The principles",
      blocks: [
        {
          type: "list",
          items: [
            "Say what you found in words, then give the statistics that support it. The statistics support the sentence; they don't replace it.",
            "Give enough for a reader to judge the result: the test, its statistic and degrees of freedom, the exact p-value, an effect size and, where possible, a confidence interval.",
            "Report every analysis you planned, whether or not it was significant.",
            "Use a table when there are many numbers to compare; don't repeat the same numbers in the text and a table.",
          ],
        },
        { type: "paragraph", text: "These follow the APA Publication Manual (American Psychological Association, 2020). Your instructor or journal may differ in details such as decimal places; follow their instructions where they do." },
      ],
    },
    {
      id: "formatting",
      heading: "Formatting numbers and symbols",
      blocks: [
        {
          type: "table",
          caption: "APA formatting rules",
          columns: ["Rule", "Example"],
          rows: [
            ["Statistics to two decimal places", "t(58) = 2.45; M = 72.40; SD = 9.75"],
            ["p-values exact, to three decimal places", "p = .017; p = .267"],
            ["Very small p-values as less than .001", "p < .001, never p = .000"],
            ["No leading zero for values that can't exceed 1", "p = .017; r = .34; η² = .09; V = .25"],
            ["A leading zero for values that can exceed 1", "d = 0.63; M = 0.85"],
            ["Degrees of freedom in parentheses after the symbol", "t(58); F(2, 87); χ²(1); r(118)"],
            ["Confidence intervals in square brackets, with the level", "95% CI [67.84, 76.96]"],
            ["A space either side of =, < and >", "p < .001, not p<.001"],
          ],
        },
        { type: "paragraph", text: "Statistical symbols written with Latin letters, such as t, F, p, M, SD and d, are italic in APA Style; Greek letters, such as χ² and η², are not. Italics are lost in the plain text on this page, and the Results Interpretation tool's copied sentences are plain text too, so add the italics in your document." },
      ],
    },
    {
      id: "examples",
      heading: "Example sentences for common analyses",
      blocks: [
        { type: "paragraph", text: "These sentences are hypothetical: the numbers are invented to show the format, and each sentence is exactly what ResearchKit's Results Interpretation tool writes for them." },
        {
          type: "table",
          caption: "APA-style sentences for common results",
          columns: ["Analysis", "Sentence"],
          rows: [
            ["Descriptive statistics", "Exam score had a mean of 72.40 (SD = 9.75, N = 20)."],
            ["Independent-samples t test, significant", "There was a statistically significant difference in exam score between the teaching method groups, t(58) = 2.45, p = .017, d = 0.63."],
            ["Independent-samples t test, not significant", "There was no statistically significant difference in exam score between the teaching method groups, t(58) = 1.12, p = .267, d = 0.29."],
            ["Pearson correlation", "There was a statistically significant medium positive correlation between study hours and GPA, r(118) = .34, p < .001."],
            ["One-way ANOVA", "There was a statistically significant effect of faculty on satisfaction, F(2, 87) = 4.21, p = .018, η² = .09."],
            ["Chi-square test of association", "There was a statistically significant association between gender and internet use, χ²(1) = 6.12, p = .013, V = .25."],
          ],
        },
        { type: "paragraph", text: "A significant one-way ANOVA shows that at least one group differs, not which; report post hoc comparisons, such as Tukey's, to show which groups differ. For the correlation, the degrees of freedom are N − 2, so r(118) comes from 120 participants." },
      ],
    },
    {
      id: "effect-sizes-and-intervals",
      heading: "Effect sizes and confidence intervals",
      blocks: [
        { type: "paragraph", text: "APA asks for effect sizes and confidence intervals because a p-value alone says nothing about how large or how precise an effect is (American Psychological Association, 2020). Give the confidence interval after the estimate it belongs to, with its level:" },
        {
          type: "list",
          items: [
            "The mean was 72.40 (95% CI [67.84, 76.96]).",
            "The difference between the means (group 1 − group 2) was 1.20 (95% CI [-2.92, 5.32]; Welch's method).",
          ],
        },
        { type: "paragraph", text: "Both sentences are what the Confidence Interval Calculator writes for those hypothetical results. When you describe an effect as small, medium or large, say which conventions you use, such as Cohen's, and remember that they are rough benchmarks, not rules." },
      ],
    },
    {
      id: "order",
      heading: "The order of a results section",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "The sample: who took part, how many, and any data excluded, with reasons.",
            "Descriptive statistics for the main variables, usually in a table.",
            "Checks of the assumptions your analyses rely on, and what you did if they weren't met.",
            "Each research question or hypothesis in turn: the analysis, the result in words, and the statistics.",
            "Any further analyses, labelled as exploratory if they weren't planned.",
          ],
        },
        { type: "paragraph", text: "Keep interpretation for the discussion: the results section says what you found; the discussion says what it means." },
      ],
    },
    {
      id: "tables-and-figures",
      heading: "Tables and figures",
      blocks: [
        { type: "paragraph", text: "Use a table for several results that readers will compare, such as descriptive statistics for many variables or a regression model; use a figure to show a pattern, such as a difference between groups or a trend. In the text, refer to each table and figure by number and say what it shows, rather than repeating all its numbers. APA tables and figures have a number, a title and, where needed, a note; the Table Builder and Chart Builder produce them in APA format." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Writing p = .000, or only “p < .05” or “ns”, instead of the exact value.",
            "Leaving out degrees of freedom or the effect size.",
            "Giving statistics to more decimal places than the measures justify, such as M = 72.4382.",
            "Adding a leading zero to p or r, or leaving it off d or M.",
            "Reporting only significant results.",
            "Describing p = .06 as “approaching significance”.",
            "Repeating every number from a table in the text.",
            "Interpreting results in the results section and repeating them in the discussion.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Report your results with ResearchKit",
      blocks: [
        { type: "paragraph", text: "Enter the numbers your statistics software reports into the Results Interpretation tool to get APA-style sentences and a plain-language explanation. The SPSS Research Lab shows where to find each number in SPSS output, and the Table Builder and Chart Builder lay out APA tables and figures." },
        { type: "links", items: [{ label: "Interpret and report a result", href: "/tools/results-interpretation" }, { label: "Build an APA table", href: "/tools/table-builder" }, { label: "Build a chart", href: "/tools/chart-builder" }, { label: "Find results in SPSS output", href: "/tools/spss-research-lab" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["apa-2020"] }],
    },
  ],
  faq: [
    { question: "How many decimal places should I use?", answer: "Usually two for statistics and three for p-values, as APA Style recommends, unless your instructor or journal says otherwise or the measure justifies a different precision." },
    { question: "Should I write p = .000?", answer: "No. Write p < .001." },
    { question: "Do I need a leading zero before decimals?", answer: "Only for values that can exceed 1, such as d, t and means. Values that can't, such as p, r and η², have none." },
    { question: "Do I report non-significant results?", answer: "Yes, in the same detail: the statistic, its degrees of freedom, the exact p-value and the effect size." },
    { question: "Where do I put the confidence interval?", answer: "Straight after the estimate it belongs to, as 95% CI [lower, upper]." },
  ],
  relatedToolIds: ["results-interpretation", "table-builder", "chart-builder", "spss-research-lab", "confidence-interval-calculator", "effect-size-calculator"],
  relatedGuideSlugs: ["what-a-p-value-tells-you", "confidence-intervals", "apa-7-citations-and-references", "how-to-write-an-abstract"],
};
