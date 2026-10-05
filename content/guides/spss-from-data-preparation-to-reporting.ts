import type { Guide } from "../../src/domains/publishing/guide";
import { FORMULA_IDS, type WorkedExampleId } from "../../src/knowledge/research/test-finder";
import { SPSS_PROCEDURE_METHODS, SPSS_WORKFLOW_STEPS } from "../../src/knowledge/research/spss-procedures";

const PRACTICE_EXAMPLES: readonly WorkedExampleId[] = ["independent-t", "paired-t", "correlation", "one-way-anova", "chi-square", "goodness-of-fit"];

export const spssFromDataPreparationToReporting: Guide = {
  slug: "spss-from-data-preparation-to-reporting",
  title: "SPSS: From data preparation to reporting",
  description: "A connected guide to preparing research data, choosing a supported analysis, running its IBM SPSS Statistics procedure, checking assumptions, reading output and reporting results.",
  summary: "Start with your research question and data structure, not a familiar SPSS button. Use ResearchKit's existing test reasoning, follow the matching IBM SPSS procedure, then check assumptions, effect size, output and reporting in context.",
  updated: "2026-09-28",
  reviewedBy: null,
  sections: [
    {
      id: "what-spss-does",
      heading: "What SPSS is and what this guide is",
      blocks: [
        { type: "paragraph", text: "IBM SPSS Statistics is statistical software for managing data, running analyses and producing tables and charts. It is not a research design and it does not choose a defensible analysis on your behalf. ResearchKit is independent of IBM: this guide explains an educational workflow and links to IBM's own documentation; ResearchKit does not provide an installer, license or technical support for SPSS." },
        { type: "paragraph", text: "The Lab reads shared ResearchProjectDraft context when a workspace is open. It does not import an SPSS file, upload data, edit the project or save new SPSS state. Menu instructions and feature availability below are checked against IBM SPSS Statistics 32 documentation; dialog labels and licensing may vary by release, operating system and edition. Confirm a path in the documentation for the version you use." },
        { type: "spss-workflow", steps: SPSS_WORKFLOW_STEPS },
        { type: "links", items: [{ label: "IBM SPSS Statistics documentation and release versions", href: "https://www.ibm.com/docs/en/spss-statistics" }, { label: "IBM SPSS Statistics 32 installation and help", href: "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=installation" }] },
      ],
    },
    {
      id: "interface-and-files",
      heading: "Recognize the editor, output and syntax",
      blocks: [
        { type: "paragraph", text: "The Data Editor has two complementary views: Data View contains case values; Variable View contains the variable definitions and labels applied to those values. The Output Viewer collects procedure tables, notes and charts. The Syntax Editor holds commands that can be inspected, saved and rerun. Menu dialogs can paste their corresponding syntax, giving you a record of how an analysis was specified." },
        { type: "table", caption: "SPSS windows and common file types", columns: ["Window or file", "Purpose"], rows: [["Data Editor: Data View", "Rows are cases; columns are variables and their recorded values."], ["Data Editor: Variable View", "Define names, labels, value labels, missing values, storage formats and measurement level."], ["Output Viewer (.spv)", "Review and save the tables, warnings and charts produced by procedures."], ["Data file (.sav)", "Save an SPSS Statistics dataset and its variable metadata."], ["Syntax file (.sps)", "Preserve executable commands and analysis decisions separately from the data and output."]] },
        { type: "paragraph", text: "Save the data, syntax and output as distinct project artifacts. Exporting output for a report is separate from keeping the editable SPSS output file; use the export options present in your installed version and verify the exported tables after conversion. IBM menu labels and available file formats can change between releases." },
        { type: "links", items: [{ label: "IBM SPSS Statistics version 32 documentation", href: "https://www.ibm.com/docs/en/spss-statistics/32.0.0" }] },
      ],
    },
    {
      id: "design-before-software",
      heading: "Start with the research question and variables",
      blocks: [
        { type: "paragraph", text: "Write down the question, target population, design and unit of analysis first. Mark the outcome, predictor or grouping factor, any covariate, and whether the question compares groups, examines association, predicts an outcome, or compares a single sample with a value. This question-first sequence follows established research-methods teaching (Field, 2018; Howell, 2013). The Statistical Test Finder owns the deterministic test-selection reasoning; the SPSS Lab only maps an already selected method to a procedure." },
        { type: "table", caption: "Keep question, variable roles and study structure distinct", columns: ["Question", "Variable roles", "Structure to record"], rows: [["Do two groups differ in a score?", "Quantitative outcome; categorical grouping variable", "Separate participants or the same/matched participants?"], ["Are two measurements associated?", "Two variables; neither is inherently the outcome for correlation", "One pair of values per case; inspect the form of association"], ["Can predictors estimate an outcome?", "Outcome plus one or more predictors", "Predictor coding, model specification and residual diagnostics"], ["Do category counts match stated proportions?", "One categorical variable and expected proportions", "Observed independent counts; expected proportions justified in advance"], ["Are two categories associated?", "Two categorical variables", "One observation per case in a cross-tabulation cell"]] },
        { type: "structure-diagrams", diagrams: ["one-sample", "two-groups", "paired", "correlation", "regression", "multiple-regression", "association", "goodness-of-fit"] },
        { type: "links", items: [{ label: "Use the Statistical Test Finder", href: "/tools/statistical-test-finder" }, { label: "Review and document variables", href: "/tools/variables-builder" }, { label: "Build the broader analysis plan", href: "/tools/data-analysis-recommender" }] },
      ],
    },
    {
      id: "prepare-data",
      heading: "Create, code and check the data file",
      blocks: [
        { type: "paragraph", text: "In the Data Editor, Data View organizes cases as rows and variables as columns. Variable View records metadata for each column: a concise unique variable name, a human-readable label, value labels for category codes, missing-value definitions, and a measurement level. SPSS uses nominal, ordinal and scale as its measurement labels; scale combines interval and ratio for many procedures. A software label never repairs an invalid measurement or study design." },
        { type: "paragraph", text: "Coding is defined by the researcher and documented in the codebook; no code is universal. For one questionnaire, gender might use 1, 2 and 3 for locally defined responses; education might use ordered codes from secondary study to doctoral study; a Likert item might use 1 to 5 from strongly disagree to strongly agree. State every label, preserve meaningful missing categories, and do not treat arbitrary category numbers as measurements with equal intervals." },
        { type: "list", items: ["Keep an untouched source copy; record the imported file, date and any transformations.", "Check IDs and duplicate cases, valid ranges, category labels, impossible combinations, missing-value codes and each analysis's eligible N.", "Inspect frequency tables for categorical variables and distributions/plots for quantitative variables before choosing summaries or inferential methods.", "Reverse-code only the specified items using the documented scale endpoints; verify the resulting minimum and maximum.", "Compute a total or mean scale score only when the item definitions and missing-item rule justify it; keep the source items and record the scoring rule.", "For regression, encode categorical predictors with explicit contrasts/dummy variables; the numeric codes alone do not model categories correctly.", "Record exclusions, recodes, computed variables and outlier decisions before interpreting outcomes."] },
        { type: "table", caption: "Example codebook entries (codes are study-defined, not standards)", columns: ["Variable", "Type / level", "Example documentation"], rows: [["department", "Categorical / nominal", "1 = Operations; 2 = Finance; 3 = Marketing. Codes are local to this example."], ["education", "Categorical / ordinal", "1 = Secondary; 2 = Bachelor's; 3 = Master's; 4 = MPhil; 5 = PhD. Verify order and labels for the study."], ["agreement_item", "Ordered response / ordinal", "1 = Strongly disagree through 5 = Strongly agree; document any reverse scoring and its formula."]] },
        { type: "links", items: [{ label: "IBM SPSS Statistics Data Preparation documentation", href: "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=edition-data-preparation" }] },
      ],
    },
    {
      id: "describe-data",
      heading: "Describe before testing",
      blocks: [
        { type: "paragraph", text: "Frequencies can show counts, percentages and, when requested, descriptive statistics and charts. Descriptives summarizes numeric variables with N, mean, minimum, maximum, standard deviation and variance. Explore supports distributions, percentiles and graphical checks. Match the statistic to the measurement: mode/frequencies for categories, median and quartiles for ordered or skewed values, and mean/SD for quantitative values where those summaries are informative." },
        { type: "list", items: ["Analyze → Descriptive Statistics → Frequencies: use for category counts/percentages and optionally mode, median, quartiles, charts or other statistics.", "Analyze → Descriptive Statistics → Descriptives: use for numeric summaries such as mean, SD, variance, range, minimum and maximum.", "Analyze → Descriptive Statistics → Explore: use to inspect distributions, percentiles and potential outliers alongside plots.", "An outlier or non-normality flag prompts inspection and methodological reasoning; it does not automatically invalidate a method or require a nonparametric replacement."] },
        { type: "descriptive-example" },
        { type: "links", items: [{ label: "IBM Frequencies documentation", href: "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=features-frequencies" }, { label: "IBM Descriptives documentation", href: "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=features-descriptives" }] },
      ],
    },
    {
      id: "choose-test",
      heading: "Choose the analysis before opening its dialog",
      blocks: [
        { type: "paragraph", text: "The Statistical Test Finder asks only for information relevant to the question and shows candidate methods, uncertainty, reasons and assumptions. After deciding with that tool and your research context, use the SPSS Lab to locate the corresponding procedure. The one-variable goodness-of-fit chi-square and two-variable chi-square test of independence have different inputs and answer different questions." },
        { type: "test-decision-tree" },
        { type: "test-matrix" },
        { type: "table", caption: "Parametric and rank-based methods answer different versions of a question", columns: ["Situation", "Common parametric method", "Possible rank/count method", "Decision point"], rows: [["Two independent groups, ordered or quantitative outcome", "Independent-samples t-test", "Mann–Whitney U", "Estimand, measurement, distribution, design and robustness"], ["Two paired measurements", "Paired-samples t-test", "Wilcoxon signed-rank", "Analyze pairing; for t, consider the distribution of differences"], ["Three or more independent groups", "One-way ANOVA", "Kruskal–Wallis", "A global test does not identify which groups differ"], ["Two quantitative measurements", "Pearson correlation", "Spearman rank correlation", "Linear versus consistently monotonic association and influential outliers"]] },
        { type: "paragraph", text: "Do not switch methods solely because a preliminary normality test crosses a threshold. Consider what parameter the research question concerns, the actual distribution and outliers, sample size, independence, robustness, and whether the alternative answers the same question. The Assumption Checker describes checks and alternatives; the researcher remains responsible for the decision." },
        { type: "links", items: [{ label: "Open the Statistical Test Finder", href: "/tools/statistical-test-finder" }, { label: "Open the SPSS Research Lab", href: "/tools/spss-research-lab" }] },
      ],
    },
    {
      id: "spss-procedures",
      heading: "Follow the SPSS procedure for the selected method",
      blocks: [
        { type: "paragraph", text: "These procedure cards reuse ResearchKit's analysis-method IDs, test profiles and assumption knowledge. Menu labels and selected options below were checked against IBM SPSS Statistics 32 documentation. Most referenced procedures require Statistics Base; verify your licensed edition. A single menu path does not establish that the method suits the design." },
        { type: "spss-procedures", methods: SPSS_PROCEDURE_METHODS },
      ],
    },
    {
      id: "assumptions",
      heading: "Check assumptions with the existing Assumption Checker",
      blocks: [
        { type: "paragraph", text: "The Statistical Assumption Checker owns the assumption definitions, design-aware checks, thresholds and remedies. Use it to prepare a checklist, then inspect the relevant data and model diagnostics in SPSS. Independence comes from the sampling/design; a menu option cannot repair dependent observations. For a paired t-test, examine the differences. For regression and GLM models, inspect residuals and the model structure." },
        { type: "list", items: ["Normality is not a universal pass/fail switch; consider the relevant residuals or paired differences, plots, sample size and robustness.", "Homogeneity tests such as Levene's are evidence to consider, not an automatic command to change tests.", "Outlier rules should be justified by data quality and design; do not remove valid cases solely to obtain a preferred p-value.", "If assumptions are questionable, consult the method's alternatives and supervisor; record the decision and sensitivity checks."] },
        { type: "figure", figure: "normality" },
        { type: "figure", figure: "variance" },
        { type: "links", items: [{ label: "Plan checks with the Statistical Assumption Checker", href: "/tools/statistical-assumption-checker" }] },
      ],
    },
    {
      id: "effect-size-and-significance",
      heading: "Effect size, statistical significance and practical importance differ",
      blocks: [
        { type: "paragraph", text: "A p-value is evidence relative to a specified null model; an effect size describes a chosen measure of magnitude; practical importance depends on consequences, context, measurement and uncertainty. None implies the others (Wasserstein & Lazar, 2016). Conventional magnitude thresholds are context-bound guides, not universal laws (Cohen, 1988). For t-tests, name the standardizer; for paired data, d_z and d_av use different denominators (Hedges, 1981; Lakens, 2013). For ANOVA, distinguish eta squared from partial eta squared. For contingency tables, use a measure suited to the table design." },
        { type: "formulas", formulas: FORMULA_IDS },
        { type: "paragraph", text: "The Effect Size Calculator shows inputs, formulas and substitutions. It does not calculate significance or declare practical importance. IBM SPSS Statistics 32 can estimate effect sizes in its one-sample and independent/paired t-test procedures and one-way ANOVA when the relevant effect-size option is selected; available standardizers and tables differ by procedure." },
        { type: "links", items: [{ label: "Calculate an effect size", href: "/tools/effect-size-calculator" }, { label: "Read the ASA statement on p-values", href: "https://doi.org/10.1080/00031305.2016.1154108" }] },
      ],
    },
    {
      id: "read-output-and-report",
      heading: "Find the value, then interpret and report it",
      blocks: [
        { type: "paragraph", text: "Read the named output table and row for the effect you planned. Record the correct test row (for example, the variance row justified by the assumptions for an independent t-test), degrees of freedom, p-value, estimate, confidence interval and effect size. For GLM, distinguish the factor, interaction, covariate and error rows. For regression, distinguish model fit from an individual predictor's coefficient. For crosstabs, inspect expected counts and the correct association statistic." },
        { type: "paragraph", text: "The Results Interpretation Assistant validates and interprets the numbers you enter, linking them to the project where possible. It does not read an output file or recompute raw data. An APA-style result should identify the analysis, statistic and degrees of freedom where applicable, p, effect-size measure and relevant interval; accompany it with the design-specific substantive explanation and limitations." },
        { type: "links", items: [{ label: "Interpret output values", href: "/tools/results-interpretation" }, { label: "Build an APA-style results table", href: "/tools/table-builder" }] },
      ],
    },
    {
      id: "worked-examples-and-practice",
      heading: "Work through synthetic examples",
      blocks: [
        { type: "paragraph", text: "The datasets below are fixed and invented for teaching. They show research questions, variable roles, data structure, candidate method and summaries. They are not empirical findings, are too small to support strong inferential conclusions, and do not contain fabricated SPSS p-values or completed APA results." },
        { type: "worked-examples", examples: PRACTICE_EXAMPLES },
        { type: "list", items: ["Employee satisfaction across two bank types: identify the outcome, independent grouping factor and independent-samples t-test structure.", "The same participants before and after training: identify pairs and why the analysis concerns within-person differences.", "Study hours and exam score: decide whether the question is symmetric association (correlation) or prediction (regression).", "Exam scores across three teaching groups: explain why one overall ANOVA precedes justified pairwise follow-up.", "Observed customer service-channel counts: distinguish goodness-of-fit against stated shares from independence in a two-variable crosstab."] },
      ],
    },
    {
      id: "syntax-and-reproducibility",
      heading: "Keep a reproducible analysis record",
      blocks: [
        { type: "paragraph", text: "SPSS syntax is a record of commands that can be saved and rerun. For example, `FREQUENCIES VARIABLES=department.` is a short syntax command for a frequency table; inspect the pasted command and adapt variable names to your file. Preserve syntax with the input data, output, codebook and decision log. A reproducible record explains sample exclusions, coding, transformations, model specification, assumption checks, output values and reporting choices. Syntax is not a substitute for understanding the analysis." },
        { type: "table", caption: "A compact reproducible project folder", columns: ["Artifact", "Record"], rows: [["Data", "Unmodified source and clearly named analysis copy; describe provenance and exclusions."], ["Codebook", "Variable names/labels, category codes, missing values, units and measurement."], ["Syntax", "Imports, cleaning, recodes, computed scores, procedure, options and software version."], ["Output", "Tables and diagnostics used; keep enough context to trace reported values."], ["Decision log", "Research question, chosen method, assumptions, effect-size convention and justified deviations."], ["Report", "Statistic, df, p, effect size, interval, interpretation and limitations."]] },
        { type: "spss-workflow", steps: SPSS_WORKFLOW_STEPS },
      ],
    },
    {
      id: "mistakes-and-limits",
      heading: "Common mistakes and limits",
      blocks: [
        { type: "list", items: ["Choosing a test because it is familiar or because the software menu makes it easy, rather than because the question and design support it.", "Treating independent groups as paired, or paired measurements as independent.", "Confusing one-variable goodness-of-fit chi-square with a two-variable test of independence.", "Ignoring data coding, duplicate cases, missingness, distributions, expected counts or residual diagnostics.", "Changing the analysis after seeing results without a prespecified methodological reason.", "Reporting only p, treating p < .05 as practical importance, or treating a large effect-size label as statistical significance.", "Copying output tables without identifying which row answers the research question or acknowledging multiple comparisons.", "Treating correlation or regression as proof of causation."] },
        { type: "paragraph", text: "ResearchKit supports methodological reasoning; it cannot inspect your SPSS dataset, verify its provenance, certify assumptions, choose among all valid models, or replace supervisor/statistician judgment. When your design includes clustering, survey weights, substantial missingness, complex sampling, repeated-factor designs, or methods outside the supported catalogue, seek specialist guidance." },
      ],
    },
    {
      id: "references",
      heading: "References and official SPSS documentation",
      blocks: [
        { type: "paragraph", text: "Operational menu paths and procedure descriptions link directly to IBM SPSS Statistics 32 documentation. Methodological references support the statistical explanations and effect-size distinctions." },
        { type: "references", ids: ["field-2018", "howell-2013", "cohen-1988", "wasserstein-lazar-2016", "hedges-1981", "lakens-2013"] },
        { type: "links", items: [{ label: "IBM SPSS Statistics documentation index", href: "https://www.ibm.com/docs/en/spss-statistics" }, { label: "IBM SPSS Statistics 32 documentation", href: "https://www.ibm.com/docs/en/spss-statistics/32.0.0" }] },
      ],
    },
  ],
  faq: [
    { question: "Does the SPSS Research Lab choose my statistical test?", answer: "No. The Statistical Test Finder owns that decision support. The Lab maps an already selected analysis method to a documented SPSS procedure." },
    { question: "Does SPSS install with ResearchKit?", answer: "No. SPSS is IBM software. Obtain it through IBM or your institution and follow IBM's current licensing and installation instructions." },
    { question: "Does a significant p-value mean the effect matters?", answer: "No. Statistical significance, effect magnitude and practical importance answer different questions. Interpret them with design, measurement, context and uncertainty." },
    { question: "Does the Lab save or upload my data?", answer: "No. It does not accept SPSS data files or save procedure state. If you use the ResearchKit workspace, its existing browser-only storage behavior applies." },
  ],
  relatedToolIds: ["spss-research-lab", "effect-size-calculator", "statistical-test-finder", "statistical-assumption-checker", "results-interpretation", "data-analysis-recommender", "variables-builder", "table-builder"],
  relatedGuideSlugs: ["how-to-choose-a-statistical-test", "how-to-report-statistics-in-apa", "what-a-p-value-tells-you"],
};