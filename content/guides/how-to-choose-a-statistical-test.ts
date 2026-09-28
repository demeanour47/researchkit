import type { Guide } from "@/domains/publishing/guide";
import { FORMULA_IDS, PROFILED_TESTS, WORKED_EXAMPLE_IDS } from "../../src/knowledge/research/test-finder";

export const howToChooseAStatisticalTest: Guide = {
  slug: "how-to-choose-a-statistical-test",
  title: "How to choose a statistical test",
  description:
    "A practical, step-by-step guide to matching a research question, variables and study design with statistical tests, assumptions and interpretation.",
  summary:
    "Start with the question, then identify the variables and how observations are arranged. This guide explains why common tests may fit, what to check, and when the available information is not enough to choose uniquely.",
  updated: "2026-09-28",
  reviewedBy: null,
  sections: [
    {
      id: "start-with-the-question",
      heading: "Start with the question, not the test name",
      blocks: [
        {
          type: "paragraph",
          text: "A statistical test is a method for answering a particular kind of question with a particular arrangement of data. Begin by writing what you want to learn in one sentence. Decide whether you are describing a sample, comparing groups or measurements, examining an association, or predicting an outcome. Then identify the variables, their measurement levels, and whether observations are independent or paired. This order follows standard research-methods guidance (Field, 2018; Howell, 2013).",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "State the research question and the population or sample it concerns.",
            "Name the outcome, predictor, grouping factor, covariate, or comparison value. A relationship question may have two variables without designating either as the outcome.",
            "Record whether each variable is categorical, ordinal, or quantitative, and how many categories or groups it has.",
            "Establish whether the observations come from separate people, repeated measurements of the same people, or matched pairs.",
            "Only then compare candidate methods and check their assumptions against the data and study design.",
          ],
        },
        { type: "test-decision-tree" },
      ],
    },
    {
      id: "question-types-and-variable-roles",
      heading: "Separate comparison, association and prediction",
      blocks: [
        {
          type: "paragraph",
          text: "The wording of a question helps distinguish the analysis family. A comparison asks whether an outcome differs between groups, measurements, or a value set in advance. An association asks whether variables vary together without claiming that one predicts or causes the other. Prediction estimates an outcome from one or more predictors; a prediction model does not by itself establish causation.",
        },
        {
          type: "table",
          caption: "Three common purposes and the structure each asks about",
          columns: ["Purpose", "Question form", "Variable roles", "Typical starting point"],
          rows: [
            ["Compare", "Do groups or measurements differ?", "Outcome plus grouping factor, time/condition, or stated value", "Measurement level and independent versus paired observations"],
            ["Association", "Are these variables related?", "Two variables considered together; neither must be an outcome", "Variable types and whether the data are paired within a person"],
            ["Predict", "How well does one or more variables estimate an outcome?", "Outcome plus one or more predictors", "Outcome type, predictor types, and model assumptions"],
          ],
        },
        {
          type: "paragraph",
          text: "In a management study, for example, comparing satisfaction by bank type treats bank type as the grouping variable and satisfaction as the outcome. Relating study hours to exam scores treats the two quantitative measurements symmetrically. Predicting exam score from study hours assigns study hours as predictor and exam score as outcome. The design and the research question, not the names alone, determine those roles.",
        },
        { type: "structure-diagrams", diagrams: ["two-groups", "correlation", "regression", "multiple-regression", "association"] },
      ],
    },
    {
      id: "measurement-and-description",
      heading: "Match summaries to the measurement level",
      blocks: [
        {
          type: "paragraph",
          text: "Before testing a hypothesis, describe the observations. Frequencies and percentages summarize categories. The mode identifies the most frequent value and can describe nominal data. The median is meaningful when values can be ordered; the mean and standard deviation summarize quantitative data when an average and spread around it are informative. A skewed distribution or influential extremes can make the mean and standard deviation misleading, so inspect the data and consider the median and interquartile range as well.",
        },
        { type: "descriptive-example" },
        {
          type: "paragraph",
          text: "The calculations in the example are deterministic summaries of a small invented dataset, not inferential evidence. A mean or median describes the observed sample; it does not on its own test a hypothesis or justify generalizing to a wider population.",
        },
      ],
    },
    {
      id: "independent-and-paired",
      heading: "Independent groups are not paired measurements",
      blocks: [
        {
          type: "paragraph",
          text: "Independent observations come from distinct units: each participant contributes to one group only. Paired observations are linked, most often because the same participant is measured twice or because participants are deliberately matched. The analysis must preserve that link. Treating paired scores as independent discards useful within-person information; treating independent groups as paired invents a link that is not in the design.",
        },
        { type: "figure", figure: "pairing" },
        {
          type: "paragraph",
          text: "For a paired t-test, calculate each person's change and analyse those differences. Its normality assumption concerns the distribution of differences, not each time point separately. With independent groups, use a method for separate groups and check the outcome distribution within each group. The figure and the candidate profiles show how these structures lead to different methods.",
        },
        { type: "structure-diagrams", diagrams: ["one-sample", "two-groups", "paired", "three-groups"] },
      ],
    },
    {
      id: "compare-tests",
      heading: "Compare common tests by their data structure",
      blocks: [
        {
          type: "paragraph",
          text: "The names can sound similar while answering different questions. A one-sample t-test compares one quantitative sample with a value specified in advance. An independent-samples t-test compares two separate groups; a paired-samples t-test compares linked measurements. One-way ANOVA compares three or more independent group means. Two-way ANOVA includes two grouping factors and their interaction. ANCOVA compares group means while adjusting for quantitative covariates. Chi-square tests use counts: the test of independence examines two categorical variables, while goodness-of-fit compares one categorical variable with expected proportions (Field, 2018; Howell, 2013).",
        },
        { type: "test-matrix" },
        {
          type: "paragraph",
          text: "The matrix is a starting comparison, not a substitute for the design. For example, ANOVA's overall result indicates that not all group means are equal, but does not identify which groups differ; planned contrasts or appropriate post-hoc comparisons address that next question. A two-way ANOVA also tests whether one factor's relationship with the outcome changes across the other factor, called an interaction.",
        },
        { type: "structure-diagrams", diagrams: ["two-way", "ancova", "goodness-of-fit"] },
      ],
    },
    {
      id: "test-profiles",
      heading: "Test profiles: hypotheses, assumptions and reporting",
      blocks: [
        {
          type: "paragraph",
          text: "A candidate is not a verdict. Each profile states the question it addresses, the roles and structure it needs, its null and alternative hypotheses, why it may fit, common confusions, assumptions, limitations, alternatives, and a reporting template. The Statistical Assumption Checker gives a fuller account of how to examine assumptions where it has a guide. Assumptions should be checked against the design and data, not treated as boxes to tick mechanically.",
        },
        { type: "test-profiles", tests: PROFILED_TESTS },
      ],
    },
    {
      id: "worked-examples",
      heading: "Follow worked examples from question to method",
      blocks: [
        {
          type: "paragraph",
          text: "Each example uses a small, fixed illustrative dataset. The tool calculates the displayed summaries from those values so a reader can reproduce the arithmetic. These examples demonstrate how to describe the design and identify a candidate; their small samples are not used to claim statistical significance or to teach a complete inferential calculation.",
        },
        { type: "worked-examples", examples: WORKED_EXAMPLE_IDS },
      ],
    },
    {
      id: "formulas-and-interpretation",
      heading: "What the formulas compare, and what results mean",
      blocks: [
        {
          type: "paragraph",
          text: "A test statistic expresses how the observed pattern compares with variation expected under a null hypothesis. The formulas below show the ideas behind means, t statistics, expected counts, chi-square, regression and the F ratio; every symbol is defined. Software can calculate these quantities, but the researcher still has to select a defensible method and explain the result.",
        },
        { type: "formulas", formulas: FORMULA_IDS },
        {
          type: "paragraph",
          text: "A p-value is not the probability that the null hypothesis is true, nor a measure of the size or practical importance of an effect. Interpret it with the study design, uncertainty intervals, an appropriate effect size, the measurement context and the research question. Effect-size benchmarks are context-dependent guides, not universal cut-offs (Cohen, 1988; Wasserstein & Lazar, 2016).",
        },
      ],
    },
    {
      id: "common-mistakes-and-limits",
      heading: "Common mistakes and limits of a decision guide",
      blocks: [
        {
          type: "list",
          items: [
            "Choosing a test from the research topic alone, without identifying the outcome, predictors and study design.",
            "Treating ordinal categories as if equal distances between their values were guaranteed.",
            "Using separate-group methods for repeated measurements, or paired methods without genuinely matched observations.",
            "Running many pairwise t-tests after an ANOVA without addressing the increased chance of false-positive findings.",
            "Treating association or prediction as proof of cause; causal claims require a design and assumptions that support them.",
            "Checking normality only with a significance test, or checking the wrong quantity: paired differences for paired t-tests, and residuals for regression.",
            "Reporting only a p-value while omitting descriptive statistics, effect size, uncertainty and the analysis choices that matter.",
            "Treating a suggested test as uniquely correct. Small samples, complex designs, missing data, clustering, survey weights, non-linear patterns and unusual distributions may require methods outside this guide.",
          ],
        },
        {
          type: "paragraph",
          text: "This guide covers common introductory methods, not every valid analysis. It does not inspect a dataset, determine whether an assumption holds, calculate a sample-size-specific power analysis, or replace a supervisor's methodological judgement. When several candidates remain plausible, explain the choice and its assumptions rather than forcing certainty.",
        },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["field-2018", "howell-2013", "cohen-1988", "wasserstein-lazar-2016"] }],
    },
  ],
  faq: [
    {
      question: "Can the finder identify the one correct test?",
      answer:
        "Not in every study. It narrows the options using your stated purpose, variable types and design, then explains what may fit. Complex sampling, missing data, small samples or unmet assumptions may change the analysis, so discuss uncertain choices with a supervisor.",
    },
    {
      question: "Does a significant result show that an effect matters?",
      answer:
        "No. Statistical evidence and practical importance are different. Report an appropriate effect size and uncertainty, and interpret them in the context of the research question and study design.",
    },
    {
      question: "Should I test normality before collecting data?",
      answer:
        "Usually the distribution cannot be known before data exist. Plan the analysis from the design, then inspect the relevant distribution or residuals when data are available. For a paired t-test, assess the differences.",
    },
    {
      question: "What should I do if two candidate tests may fit?",
      answer:
        "Compare the assumptions, estimand and limitations of each, and state why your chosen method answers the research question. A supervisor or statistician can help when the design is complex.",
    },
  ],
  relatedToolIds: ["statistical-test-finder"],
};