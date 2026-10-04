import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Statistical power and a priori power analysis. Every worked example is the result
 * ResearchKit's Power Analysis gives, and the guide's tests check them against it;
 * the methods are those documented in src/knowledge/statistics/power.ts, checked
 * against G*Power's manual and the R pwr package.
 */
export const powerAnalysisGuide: Guide = {
  slug: "power-analysis",
  title: "Power Analysis",
  description:
    "What statistical power is, how α, effect size and sample size determine it, how to plan a sample size before collecting data for t tests, proportions, correlation and one-way ANOVA, and why observed power after a study is not the same thing.",
  summary:
    "Statistical power is the probability that a study will detect an effect of a given size, if that effect exists. A priori power analysis uses the effect size you want to detect, your significance level and the power you want to work out how many participants you need before collecting data. It plans a study; it doesn't prove that a study was adequate.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "what-power-means",
      heading: "What statistical power means",
      blocks: [
        { type: "paragraph", text: "Statistical power is the probability that a test rejects the null hypothesis when a specified alternative is true: the chance of detecting an effect of a given size, if it exists. A study with 80% power for an effect of d = 0.5 would detect such an effect in about 80 of every 100 replications, and miss it in about 20." },
        { type: "paragraph", text: "Power is a property of a planned study under stated assumptions: the test, the effect size, α and the sample size. It isn't the probability that a study's conclusion is correct." },
      ],
    },
    {
      id: "type-i-error",
      heading: "Type I error",
      blocks: [
        { type: "paragraph", text: "A Type I error is rejecting a null hypothesis that is true: concluding there is an effect when there isn't one. The significance level α is the rate of Type I errors you accept when the null hypothesis is true." },
      ],
    },
    {
      id: "type-ii-error",
      heading: "Type II error",
      blocks: [
        { type: "paragraph", text: "A Type II error is failing to reject a null hypothesis that is false: missing an effect that exists. Its probability, β, depends on how large the effect is. A small study can have a high β for realistic effects, so a non-significant result from it says little." },
      ],
    },
    {
      id: "power-and-beta",
      heading: "Power = 1 − β",
      blocks: [
        { type: "paragraph", text: "Power is the complement of β: if a design has a 20% chance of missing an effect of the specified size (β = 0.20), its power for that effect is 1 − 0.20 = 0.80. Cohen (1988) suggested 0.80 as a conventional default when there is no other basis for choosing; many funders and journals now expect 0.80 or 0.90, chosen and justified for the study." },
        { type: "table", caption: "The four outcomes of a test", columns: ["", "Null hypothesis true", "Null hypothesis false"], rows: [["Reject the null", "Type I error (probability α)", "Correct detection (power, 1 − β)"], ["Don't reject the null", "Correct", "Type II error (probability β)"]] },
      ],
    },
    {
      id: "alpha",
      heading: "Alpha",
      blocks: [
        { type: "paragraph", text: "α, the significance level, is the Type I error rate you choose before analysing data, usually 0.05. It isn't the probability that the null hypothesis is true, and it isn't the probability that a significant result is wrong. A stricter α, such as 0.01, makes Type I errors rarer but needs a larger sample for the same power." },
      ],
    },
    {
      id: "effect-size",
      heading: "Effect size",
      blocks: [
        { type: "paragraph", text: "The effect size states how large an effect you want to be able to detect, in a form the calculation can use. Each design has its own measure:" },
        { type: "table", caption: "Effect sizes used by ResearchKit's Power Analysis", columns: ["Design", "Effect size", "Definition"], rows: [["One-sample or two independent means", "Cohen's d", "Difference in means divided by the standard deviation"], ["Paired means", "dz", "Mean of the paired differences divided by their standard deviation"], ["Proportions", "Cohen's h", "2 arcsin √p₁ − 2 arcsin √p₂"], ["Correlation", "r", "The population correlation you expect"], ["One-way ANOVA", "Cohen's f", "Standard deviation of the group means divided by the standard deviation within groups"]] },
        { type: "paragraph", text: "Cohen (1988) offered conventional benchmarks, such as d = 0.20, 0.50 and 0.80 for small, medium and large effects. He intended them as a last resort when nothing better is known. A meaningful effect depends on the field, the measures and the practical consequences; the best basis is previous research, a pilot study or the smallest effect that would matter." },
      ],
    },
    {
      id: "sample-size",
      heading: "Sample size",
      blocks: [
        { type: "paragraph", text: "For a given test, α and effect size, power rises with sample size. Power analysis turns that relationship around: given the power you want, it finds the smallest sample that reaches it. ResearchKit always rounds that sample size up to a whole number, never down, so the target power is met." },
      ],
    },
    {
      id: "a-priori",
      heading: "A priori power analysis",
      blocks: [
        { type: "paragraph", text: "An a priori power analysis is done before data collection, to decide how many participants a study needs. You specify the test, the effect size to detect, α and the target power, and the analysis gives the required sample size. This is the main use of power analysis, and the one research protocols, ethics applications and funding proposals usually ask for (Faul et al., 2007)." },
      ],
    },
    {
      id: "common-tests",
      heading: "Power for common tests",
      blocks: [
        { type: "paragraph", text: "Power depends on the test, because each test's statistic has its own distribution when the effect exists. ResearchKit calculates t tests and one-way ANOVA exactly from the noncentral t and F distributions, as G*Power does (Faul et al., 2007), and correlations and proportions with standard normal approximations." },
        { type: "table", caption: "Required sample size for 80% power at α = 0.05, two-sided, from ResearchKit's Power Analysis", columns: ["Design", "Effect", "Required sample"], rows: [["One-sample mean", "d = 0.5", "34 participants"], ["Two independent means", "d = 0.5", "128 participants (64 per group)"], ["Paired means", "dz = 0.5", "34 pairs"], ["One-sample proportion", "0.50 against 0.65", "85 participants"], ["Two independent proportions", "0.50 and 0.65", "340 participants (170 per group)"], ["Correlation", "r = 0.30", "85 participants"], ["One-way ANOVA, 3 groups", "f = 0.25", "159 participants (53 per group)"]] },
      ],
    },
    {
      id: "one-sample-means",
      heading: "One-sample means",
      blocks: [
        { type: "paragraph", text: "A one-sample t test compares a group's mean with a fixed reference value, such as a published norm. The effect size is d = (μ − μ₀) ÷ σ. Power comes from the noncentral t distribution with N − 1 degrees of freedom and noncentrality δ = d√N." },
        { type: "paragraph", text: "G*Power's manual gives a worked example: a one-sided test of d = 0.625 at α = 0.05 with 95% power needs N = 30. ResearchKit gives the same N and the same actual power, 0.955." },
      ],
    },
    {
      id: "two-means",
      heading: "Two independent means",
      blocks: [
        { type: "paragraph", text: "An independent-samples t test compares the means of two separate groups. With d = (μ₁ − μ₂) ÷ σ and equal groups of n, power comes from the noncentral t distribution with 2n − 2 degrees of freedom and δ = d√(n ÷ 2). ResearchKit assumes equal group sizes; unequal allocation needs more participants in total for the same power and isn't supported." },
        { type: "table", caption: "Two independent means, d = 0.5, α = 0.05, two-sided", columns: ["Target power", "Per group", "Total"], rows: [["0.80", "64", "128"], ["0.90", "86", "172"], ["0.95", "105", "210"]] },
      ],
    },
    {
      id: "paired-means",
      heading: "Paired means",
      blocks: [
        { type: "paragraph", text: "A paired design measures the same participants twice, or matched pairs, and is analysed through the differences within each pair. Its effect size, dz, is the mean difference divided by the standard deviation of the differences. Because pairing removes stable differences between participants, dz is often larger than d for the same mean difference, and a paired design can need far fewer participants." },
        { type: "paragraph", text: "A paired design must not be planned as two independent groups. dz depends on the correlation between the two measurements, so it can't be read off Cohen's benchmarks for d." },
      ],
    },
    {
      id: "proportions",
      heading: "Proportions",
      blocks: [
        { type: "paragraph", text: "For a single proportion compared with a fixed value, or two independent proportions, ResearchKit uses Cohen's arcsine method (Cohen, 1988), as the R pwr package does. The effect size h = 2 arcsin √p₁ − 2 arcsin √p₂ treats differences near 0 or 1 as larger than the same difference near 0.5: 0.10 against 0.05 is easier to detect than 0.55 against 0.50." },
        { type: "paragraph", text: "The method is a normal approximation. With small expected counts, fewer than about 10 successes or failures, it can be inaccurate, and the tool says so; exact methods, such as those in G*Power, are then preferable. Enter proportions as decimals, such as 0.65, not percentages." },
      ],
    },
    {
      id: "correlation",
      heading: "Correlation",
      blocks: [
        { type: "paragraph", text: "For a Pearson correlation, the effect size is the correlation r you expect, tested against a null value, usually 0. ResearchKit uses Fisher's z approximation, the large-sample method described in G*Power's manual: the test statistic is normal with mean (z(r) − z(r₀))√(N − 3), where z(r) = ½ ln((1 + r) ÷ (1 − r))." },
        { type: "paragraph", text: "A correlation is not a standardized mean difference: r = 0.30 is not the same effect as d = 0.30. For very small samples the approximation can differ noticeably from exact methods." },
      ],
    },
    {
      id: "anova",
      heading: "One-way ANOVA",
      blocks: [
        { type: "paragraph", text: "A one-way between-groups ANOVA compares three or more group means. Its effect size, Cohen's f, is the standard deviation of the group means divided by the standard deviation within groups. With k equal groups and N participants in total, power comes from the noncentral F distribution with k − 1 and N − k degrees of freedom and λ = f²N." },
        { type: "paragraph", text: "G*Power's manual gives a worked example: 10 groups and f = 0.25, at α = 0.05 with 95% power, need 390 participants, 39 per group. ResearchKit gives the same result. The calculation covers the overall F test only, not follow-up comparisons, factorial designs or repeated measures." },
      ],
    },
    {
      id: "one-or-two-sided",
      heading: "One-sided versus two-sided tests",
      blocks: [
        { type: "paragraph", text: "A two-sided test asks whether the parameter differs in either direction. A one-sided test specifies the direction in advance and can only detect an effect in that direction, so it needs fewer participants: for d = 0.5, 102 instead of 128 for 80% power." },
        { type: "paragraph", text: "The direction must be decided before seeing the data and justified by the research question. Switching to a one-sided test after looking at the results doubles the effective α and misrepresents the evidence." },
      ],
    },
    {
      id: "allocation",
      heading: "Sample allocation",
      blocks: [
        { type: "paragraph", text: "For a fixed total, equal group sizes give the most power. ResearchKit's two-group and ANOVA calculations assume equal groups and report both the total and the size of each group. If your groups will be unequal, for example because one is harder to recruit, plan with software that models the allocation ratio." },
      ],
    },
    {
      id: "minimum-detectable-effect",
      heading: "Minimum detectable effect",
      blocks: [
        { type: "paragraph", text: "When the sample size is fixed, for example by the available population or budget, a power analysis can work the other way: what is the smallest effect this study could detect with the power you want? With 50 participants per group, a two-sided independent-samples t test at α = 0.05 has 80% power for effects of about d = 0.566 or larger. If plausible effects are smaller than that, the study is likely to miss them." },
      ],
    },
    {
      id: "why-effect-size-matters",
      heading: "Why effect size matters",
      blocks: [
        { type: "paragraph", text: "The required sample size depends more on the effect size than on anything else, and it is the assumption most open to optimism. Overestimating the effect leads to an underpowered study. Base it on the smallest effect that would matter, or on cautious estimates from earlier work, rather than on the largest effect reported." },
      ],
    },
    {
      id: "larger-samples",
      heading: "Why larger samples increase power",
      blocks: [
        { type: "paragraph", text: "A larger sample estimates means, proportions and correlations more precisely, so the test statistic's distribution under the alternative moves further from zero relative to its spread. The noncentrality grows with the square root of the sample size: δ = d√N for one sample. More participants make the same effect easier to tell apart from no effect." },
      ],
    },
    {
      id: "smaller-effects",
      heading: "Why smaller effects require larger samples",
      blocks: [
        { type: "paragraph", text: "Because the noncentrality grows with the square root of N, halving the effect size roughly quadruples the sample needed. For two independent means at 80% power and α = 0.05, d = 0.8 needs 52 participants, d = 0.5 needs 128 and d = 0.2 needs 788." },
      ],
    },
    {
      id: "assumptions",
      heading: "Assumptions",
      blocks: [
        { type: "list", items: ["The test you plan to use, analysed as planned.", "The effect size, which is an assumption about the population, not a known value.", "The distributional assumptions of the test: for t tests and ANOVA, roughly normal outcomes with equal variances.", "Independent observations, and pairs that really are pairs.", "Equal group sizes, for two-group designs and ANOVA.", "No loss of participants: increase the sample for expected dropout and missing data."] },
      ],
    },
    {
      id: "practical-significance",
      heading: "Practical significance versus statistical power",
      blocks: [
        { type: "paragraph", text: "A well-powered study can detect effects too small to matter; an effect can matter even when a study lacks the power to detect it. Power is about detecting an effect reliably. Whether the effect is important is a separate judgement about its size and consequences, and it should guide the effect size you plan for." },
      ],
    },
    {
      id: "observed-power",
      heading: "Post hoc and observed power",
      blocks: [
        { type: "paragraph", text: "Observed, or post hoc, power is power calculated after a study from the effect it observed. It adds no information: it is a direct function of the p-value, so a non-significant result always has low observed power (Hoenig & Heisey, 2001). It can't show whether a non-significant result reflects no effect or too small a study." },
        { type: "paragraph", text: "After a study, report the estimated effect size with a confidence interval: the interval shows which effects the data are compatible with. ResearchKit's power-for-a-sample mode calculates power for an effect you specify, such as the smallest effect that would matter; it is labelled as planned power, not observed power." },
      ],
    },
    {
      id: "reporting",
      heading: "Reporting power analysis in research",
      blocks: [
        { type: "paragraph", text: "Report the power analysis in your methods section, with enough detail for a reader to repeat it:" },
        { type: "list", items: ["the test the analysis was for, and whether it was one- or two-sided;", "the effect size assumed, and where it came from;", "α and the target power;", "the resulting sample size, per group where relevant, and any allowance for attrition;", "the software or tool used."] },
        { type: "paragraph", text: "A template: “An a priori power analysis for a two-sided independent-samples t test indicated that a minimum of [N] participants ([n] per group) was required to detect an effect of d = [effect size] with [power]% power at α = .05.” Fill in your own values, and give the source of the effect size." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        { type: "table", caption: "Common mistakes in power analysis", columns: ["Mistake", "Instead"], rows: [["Choosing a large effect size to make the required sample affordable", "Plan for the smallest effect that matters, or a cautious estimate"], ["Planning a paired design as two independent groups", "Use dz and the paired design"], ["Reporting a per-group size as the total", "State both the total and the size of each group"], ["Using observed power to explain a non-significant result", "Report the effect size with a confidence interval"], ["Choosing a one-sided test after seeing the data", "Decide the direction in advance"], ["Forgetting dropout", "Add participants for expected attrition"]] },
      ],
    },
    {
      id: "using-the-tool",
      heading: "How to use ResearchKit Power Analysis",
      blocks: [
        { type: "list", ordered: true, items: ["Choose the analysis you plan to run.", "Choose what to calculate: required sample size (a priori), power for a planned sample, or the smallest detectable effect.", "Enter the effect size, or proportions or a correlation, with α, the target power and the test direction.", "Press Calculate. Read the result, what it means, and the assumptions and method.", "Use the reporting sentence as a starting point for your methods section."] },
        { type: "links", items: [{ label: "Open Power Analysis", href: "/tools/power-analysis" }, { label: "Choose a statistical test", href: "/tools/statistical-test-finder" }, { label: "Calculate an effect size", href: "/tools/effect-size-calculator" }, { label: "Plan a survey sample size", href: "/tools/sample-size-calculator" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [
        { type: "paragraph", text: "The t test and ANOVA calculations follow G*Power (Faul et al., 2007; Faul et al., 2009), and the effect size conventions and arcsine method follow Cohen (Cohen, 1988)." },
        { type: "references", ids: ["cohen-1988", "faul-2007", "faul-2009", "hoenig-heisey-2001"] },
      ],
    },
  ],
  faq: [
    { question: "What power should I aim for?", answer: "0.80 is a common default and 0.90 is increasingly expected. Choose based on the cost of missing a real effect, and justify it." },
    { question: "Where do I get the effect size?", answer: "From previous studies of similar effects, a pilot study, or the smallest effect that would matter in practice. Conventional benchmarks are a last resort." },
    { question: "Is the sample size per group or in total?", answer: "ResearchKit shows both for two-group designs and ANOVA: the total, and the size of each equal group." },
    { question: "Can I calculate the power of my completed study?", answer: "Not from the effect you observed: that observed power adds nothing to the p-value. Report the effect size with a confidence interval instead." },
    { question: "Is my data sent anywhere?", answer: "No. Calculations run in your browser, and the values you enter aren't sent or stored." },
  ],
  relatedToolIds: ["power-analysis", "effect-size-calculator", "sample-size-calculator", "statistical-test-finder"],
};
