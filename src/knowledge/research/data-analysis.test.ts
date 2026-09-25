import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STAGE_IDS, STAGE_TITLES, allRecommendations, analysisQuestions, listNames, recommendAnalyses, uses, type AnalysisPlan, type StageId } from "./data-analysis";
import { analysisProfile } from "./data-analysis-profile";
import { build, type ProjectSpec } from "./data-analysis-test-helpers";
import type { AnalysisMethodId } from "./data-analysis-types";
import { updateProjectDraft } from "./research-project";

const stage = (plan: AnalysisPlan, id: StageId) => plan.stages.find((candidate) => candidate.id === id)!;
const verdictsIn = (plan: AnalysisPlan, id: StageId, question = 0) => stage(plan, id).questions[question]?.recommendations.map((recommendation) => `${recommendation.method}:${recommendation.strength}`) ?? [];
const verdictOf = (plan: AnalysisPlan, method: AnalysisMethodId, id: StageId = "questions") =>
  stage(plan, id)
    .questions.flatMap((question) => question.recommendations)
    .find((recommendation) => recommendation.method === method)?.strength;

const survey = (extra: ProjectSpec = {}) =>
  build({
    variables: [
      ["screen time", "independent", "ratio"],
      ["sleep quality", "dependent", "ratio"],
    ],
    hypotheses: [{ form: "relationship", ivs: ["screen time"], dvs: ["sleep quality"] }],
    design: "survey",
    onion: { philosophy: "positivism", approach: "deductive", choice: "quantitative" },
    margin: 5,
    sampling: "simple-random",
    ...extra,
  });

describe("recommendAnalyses: the plan's shape", () => {
  it("has the four stages, in reporting order", () => {
    const plan = recommendAnalyses(survey());
    assert.deepEqual(
      plan.stages.map((candidate) => [candidate.id, candidate.title]),
      STAGE_IDS.map((id) => [id, STAGE_TITLES[id]]),
    );
  });

  it("is deterministic", () => {
    assert.deepEqual(recommendAnalyses(survey()), recommendAnalyses(survey()));
  });

  it("gives every recommendation a reason, and a justification when one is needed", () => {
    for (const spec of [{}, { onion: { choice: "qualitative" as const } }, { margin: 20 }, { hypotheses: [] }]) {
      for (const { recommendation } of allRecommendations(recommendAnalyses(survey(spec)))) {
        assert.ok(recommendation.reasons.length > 0, recommendation.method);
        assert.ok(["strong", "possible", "justify"].includes(recommendation.strength));
        if (recommendation.strength === "justify") assert.ok(recommendation.justify, `${recommendation.method} says what to justify`);
      }
    }
  });

  it("never calls a method invalid, forbidden or impossible", () => {
    for (const spec of [{}, { onion: { choice: "qualitative" as const } }, { design: "phenomenology" as const }, { margin: 20 }]) {
      const text = JSON.stringify(recommendAnalyses(survey(spec))).toLowerCase();
      for (const word of ["invalid", "forbidden", "impossible"]) assert.ok(!text.includes(word), word);
    }
  });

  it("lists each method once per question", () => {
    for (const current of recommendAnalyses(survey()).stages) {
      for (const question of current.questions) {
        const methods = question.recommendations.map((recommendation) => recommendation.method);
        assert.equal(new Set(methods).size, methods.length, question.title);
      }
    }
  });

  it("puts stronger verdicts first within each question", () => {
    const order = { strong: 0, possible: 1, justify: 2 };
    for (const current of recommendAnalyses(survey()).stages) {
      for (const question of current.questions) {
        const ranks = question.recommendations.map((recommendation) => order[recommendation.strength]);
        assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), question.title);
      }
    }
  });
});

describe("describing the data", () => {
  it("recommends summaries matched to each variable's measure", () => {
    const project = build({
      variables: [
        ["age", "control", "ratio"],
        ["course", "control", "nominal"],
        ["pain", "dependent", "ordinal"],
      ],
    });
    assert.deepEqual(verdictsIn(recommendAnalyses(project), "describe"), [
      "descriptive-statistics:strong",
      "frequency:strong",
      "percentage:strong",
      "mean:strong",
      "standard-deviation:strong",
      "median:strong",
    ]);
  });

  it("offers counts for participants even when no variable is categorical, and no mean without numbers", () => {
    const plan = recommendAnalyses(build({ variables: [["hours", "dependent", "ratio"]] }));
    assert.equal(verdictOf(plan, "frequency", "describe"), "possible");
    assert.equal(verdictOf(plan, "mean", "describe"), "strong");
    const categorical = recommendAnalyses(build({ variables: [["course", "independent", "nominal"]] }));
    assert.equal(verdictOf(categorical, "mean", "describe"), undefined);
  });

  it("treats means of scale scores as possible, and the median as possible for skewed numbers", () => {
    const plan = recommendAnalyses(build({ variables: [["stress", "dependent", "likert"]], items: { stress: 4 } }));
    assert.equal(verdictOf(plan, "mean", "describe"), "possible");
    assert.equal(verdictOf(plan, "median", "describe"), "possible");
  });

  it("carries no normality fallbacks for descriptive summaries", () => {
    for (const recommendation of stage(recommendAnalyses(survey()), "describe").questions[0].recommendations) assert.equal(recommendation.fallback, null);
  });

  it("still describes participants in a qualitative project, as a possibility", () => {
    assert.equal(verdictOf(recommendAnalyses(build({ onion: { choice: "qualitative" } })), "descriptive-statistics", "describe"), "possible");
  });

  it("writes the names as a list", () => {
    const plan = recommendAnalyses(build({ variables: [["a", "independent", "ratio"], ["b", "independent", "ratio"], ["c", "dependent", "ratio"]] }));
    const mean = stage(plan, "describe").questions[0].recommendations.find((recommendation) => recommendation.method === "mean")!;
    assert.equal(mean.reasons[0], "a, b and c are numeric, so the average summarises the typical value.");
    assert.deepEqual([listNames([]), listNames(["a"]), listNames(["a", "b"])], ["", "a", "a and b"]);
  });
});

describe("checking the measures", () => {
  const scales = (extra: ProjectSpec = {}) =>
    build({
      variables: [
        ["support", "independent", "likert"],
        ["stress", "mediator", "likert"],
        ["wellbeing", "dependent", "likert"],
      ],
      items: { support: 4, stress: 4, wellbeing: 5 },
      hypotheses: [
        { form: "prediction", ivs: ["support"], dvs: ["wellbeing"], mediators: ["stress"] },
        { form: "prediction", ivs: ["support"], dvs: ["stress"] },
      ],
      design: "correlational",
      onion: { philosophy: "positivism", approach: "deductive", choice: "quantitative" },
      margin: 5,
      ...extra,
    });

  it("explains that reliability checks don't apply without multi-item scales", () => {
    const measures = stage(recommendAnalyses(survey()), "measures");
    assert.deepEqual(measures.questions, []);
    assert.match(measures.notes[0], /^No variable is measured with several rating items/);
  });

  it("recommends Cronbach's alpha and reliability for every multi-item scale", () => {
    const plan = recommendAnalyses(scales());
    assert.equal(verdictOf(plan, "cronbach-alpha", "measures"), "strong");
    assert.equal(verdictOf(plan, "reliability", "measures"), "strong");
    assert.match(stage(plan, "measures").questions[0].recommendations[0].reasons[0], /^support \(4 items\), stress \(4 items\), wellbeing \(5 items\) each combine several rating items/);
  });

  it("recommends confirmatory factor analysis as possible for a deductive project, with its checks", () => {
    const plan = recommendAnalyses(scales());
    for (const method of ["factor-analysis", "kmo", "bartlett", "validity"] as const) assert.equal(verdictOf(plan, method, "measures"), "possible", method);
    assert.match(stage(plan, "measures").questions[0].recommendations.find((recommendation) => recommendation.method === "factor-analysis")!.reasons[0], /confirmatory factor analysis/);
  });

  it("recommends exploratory factor analysis strongly for an inductive project", () => {
    const plan = recommendAnalyses(scales({ onion: { approach: "inductive", choice: "quantitative" } }));
    assert.equal(verdictOf(plan, "factor-analysis", "measures"), "strong");
    assert.match(stage(plan, "measures").questions[0].recommendations.find((recommendation) => recommendation.method === "factor-analysis")!.reasons[0], /inductive approach explores structure/);
  });

  it("needs justification for factor analysis with a planned sample under 100", () => {
    const plan = recommendAnalyses(scales({ margin: 10 }));
    for (const method of ["factor-analysis", "kmo", "bartlett", "validity"] as const) assert.equal(verdictOf(plan, method, "measures"), "justify", method);
    assert.equal(verdictOf(plan, "cronbach-alpha", "measures"), "strong", "reliability doesn't depend on sample size here");
  });

  it("skips factor analysis for two-item scales, and says why", () => {
    const plan = recommendAnalyses(build({ variables: [["stress", "dependent", "likert"]], items: { stress: 2 } }));
    assert.equal(verdictOf(plan, "factor-analysis", "measures"), undefined);
    assert.deepEqual(stage(plan, "measures").questions[0].notes, ["Factor analysis needs at least three items per scale; your scales have two."]);
  });
});

describe("answering the research questions", () => {
  it("makes one question per alternative hypothesis, with its wording", () => {
    const plan = recommendAnalyses(survey());
    const [question] = stage(plan, "questions").questions;
    assert.deepEqual([question.title, question.hypothesis, question.form], ["Hypothesis 1", "screen time relates to sleep quality", "relationship"]);
  });

  it("recommends Pearson for a relationship between numeric variables in a deductive survey, with Spearman as the fallback", () => {
    const plan = recommendAnalyses(survey());
    assert.deepEqual(verdictsIn(plan, "questions"), ["pearson:strong", "simple-regression:possible", "spearman:possible"]);
    const pearson = stage(plan, "questions").questions[0].recommendations[0];
    assert.equal(pearson.fallback, "spearman");
    assert.ok(pearson.reasons.includes("Your deductive approach tests hypotheses stated before the data are collected, which is what this test does."));
    assert.ok(pearson.reasons.includes("Your survey design measures variables as they occur, which suits tests of relationships."));
  });

  it("recommends the independent t-test for an experiment comparing two groups", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["condition", "independent", "binary"],
          ["recall", "dependent", "ratio"],
        ],
        hypotheses: [{ form: "difference", ivs: ["condition"], dvs: ["recall"] }],
        design: "true-experimental",
        margin: 5,
      }),
    );
    assert.deepEqual(verdictsIn(plan, "questions"), ["independent-t-test:strong", "mann-whitney:possible"]);
    assert.ok(stage(plan, "questions").questions[0].recommendations[0].reasons.includes("Your true experimental design creates the groups being compared."));
  });

  it("recommends the paired t-test when the same people are measured twice", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["time", "independent", "binary"],
          ["anxiety", "dependent", "interval"],
        ],
        hypotheses: [{ form: "difference", ivs: ["time"], dvs: ["anxiety"] }],
        design: "longitudinal",
      }),
    );
    assert.deepEqual(verdictsIn(plan, "questions"), ["paired-t-test:strong", "wilcoxon:possible"]);
  });

  it("recommends ANOVA across a known number of groups from the questionnaire's options", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["course", "independent", null],
          ["grade", "dependent", "ratio"],
        ],
        questions: [["course", "multiple-choice", ["Arts", "Science", "Law"]]],
        hypotheses: [{ form: "difference", ivs: ["course"], dvs: ["grade"] }],
      }),
    );
    assert.deepEqual(verdictsIn(plan, "questions"), ["one-way-anova:strong", "kruskal-wallis:possible"]);
  });

  it("recommends chi-square for two categorical variables", () => {
    const plan = recommendAnalyses(build({ variables: [["gender", "independent", "nominal"], ["voted", "dependent", "binary"]], hypotheses: [{ form: "relationship", ivs: ["gender"], dvs: ["voted"] }] }));
    assert.deepEqual(verdictsIn(plan, "questions"), ["chi-square:strong", "fisher-exact:possible"]);
  });

  it("recommends logistic regression for a binary outcome", () => {
    const plan = recommendAnalyses(build({ variables: [["income", "independent", "ratio"], ["defaulted", "dependent", "binary"]], hypotheses: [{ form: "prediction", ivs: ["income"], dvs: ["defaulted"] }] }));
    assert.deepEqual(verdictsIn(plan, "questions"), ["logistic-regression:strong"]);
  });

  it("recommends multiple regression for several predictors, with each pair as a first look", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["sleep", "independent", "ratio"],
          ["exercise", "independent", "ratio"],
          ["mood", "dependent", "interval"],
        ],
        hypotheses: [{ form: "prediction", ivs: ["sleep", "exercise"], dvs: ["mood"] }],
      }),
    );
    assert.equal(verdictOf(plan, "multiple-regression"), "strong");
    assert.equal(verdictOf(plan, "simple-regression"), "possible");
    assert.ok(stage(plan, "questions").questions[0].recommendations.find((recommendation) => recommendation.method === "simple-regression")!.reasons.some((reason) => reason.startsWith("As a first look at sleep alone")));
  });

  it("recommends two-way ANOVA for two grouping factors", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["dose", "independent", "binary"],
          ["gender", "independent", "binary"],
          ["recovery", "dependent", "ratio"],
        ],
        hypotheses: [{ form: "difference", ivs: ["dose", "gender"], dvs: ["recovery"] }],
      }),
    );
    assert.equal(verdictOf(plan, "two-way-anova"), "strong");
  });

  it("recommends MANOVA for one grouping variable and several numeric outcomes", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["programme", "independent", "binary"],
          ["reading", "dependent", "ratio"],
          ["maths", "dependent", "ratio"],
        ],
        hypotheses: [{ form: "difference", ivs: ["programme"], dvs: ["reading", "maths"] }],
      }),
    );
    assert.equal(verdictOf(plan, "manova"), "strong");
    assert.equal(verdictOf(plan, "independent-t-test"), "strong", "each outcome can still be compared on its own");
  });

  it("recommends ANCOVA when groups are compared with a numeric control", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["group", "independent", "binary"],
          ["score", "dependent", "ratio"],
          ["pretest", "control", "ratio"],
        ],
        hypotheses: [{ form: "difference", ivs: ["group"], dvs: ["score"], controls: ["pretest"] }],
        design: "quasi-experimental",
      }),
    );
    assert.equal(verdictOf(plan, "ancova"), "strong");
  });

  it("uses the project's control variables when a hypothesis names none", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["screen time", "independent", "ratio"],
          ["sleep quality", "dependent", "ratio"],
          ["age", "control", "ratio"],
        ],
        hypotheses: [{ form: "relationship", ivs: ["screen time"], dvs: ["sleep quality"] }],
      }),
    );
    assert.equal(verdictOf(plan, "hierarchical-regression"), "strong");
  });

  it("recommends moderation analysis for a moderator", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["workload", "independent", "ratio"],
          ["support", "moderator", "ratio"],
          ["burnout", "dependent", "ratio"],
        ],
        hypotheses: [{ form: "relationship", ivs: ["workload"], dvs: ["burnout"], moderators: ["support"] }],
      }),
    );
    assert.equal(verdictOf(plan, "moderation"), "strong");
  });

  it("recommends mediation analysis, as possible in a cross-sectional design", () => {
    const plan = recommendAnalyses(
      build({
        variables: [
          ["workload", "independent", "ratio"],
          ["stress", "mediator", "ratio"],
          ["burnout", "dependent", "ratio"],
        ],
        hypotheses: [{ form: "prediction", ivs: ["workload"], dvs: ["burnout"], mediators: ["stress"] }],
        design: "cross-sectional",
      }),
    );
    assert.equal(verdictOf(plan, "mediation"), "possible");
  });

  it("weakens parametric tests for a small planned sample", () => {
    const plan = recommendAnalyses(survey({ margin: 20 }));
    assert.equal(verdictOf(plan, "pearson"), "possible");
    assert.equal(verdictOf(plan, "spearman"), "possible");
  });

  it("explores each dependent variable when there are no hypotheses", () => {
    const plan = recommendAnalyses(survey({ hypotheses: [] }));
    const questions = stage(plan, "questions");
    assert.deepEqual(questions.questions.map((question) => [question.title, question.hypothesis]), [["What explains sleep quality", null]]);
    assert.equal(verdictOf(plan, "pearson"), "possible", "exploring, not confirming");
    assert.match(questions.notes[0], /^Your project has no hypotheses/);
  });

  it("explains when there is nothing to analyse", () => {
    assert.deepEqual(stage(recommendAnalyses({}), "questions").notes, ["Record your dependent and independent variables, or hypotheses, to see which tests answer your research questions."]);
    const onlyOutcome = recommendAnalyses(build({ variables: [["y", "dependent", "ratio"]] }));
    assert.deepEqual(stage(onlyOutcome, "questions").questions[0].notes, ["Record both independent and dependent variables to see which tests suit them."]);
  });

  it("notes a hypothesis that names a variable the project doesn't record", () => {
    const plan = recommendAnalyses(build({ variables: [["y", "dependent", "ratio"]], hypotheses: [{ form: "relationship", ivs: ["ghost"], dvs: ["y"] }] }));
    assert.deepEqual(stage(plan, "questions").questions[0].notes, ["Record how ghost is measured to see which tests suit ghost and y."]);
    assert.deepEqual(stage(plan, "questions").questions[0].recommendations, []);
  });

  it("notes a hypothesis without a dependent variable", () => {
    const plan = recommendAnalyses(build({ variables: [["x", "independent", "ratio"]], hypotheses: [{ form: "relationship", ivs: ["x"], dvs: [] }] }));
    assert.deepEqual(stage(plan, "questions").questions[0].notes, ["This hypothesis doesn't name both an independent and a dependent variable, so no test can be matched to it."]);
  });

  it("needs justification for every test in a qualitative project", () => {
    const plan = recommendAnalyses(survey({ onion: { choice: "qualitative" } }));
    for (const recommendation of stage(plan, "questions").questions[0].recommendations) assert.equal(recommendation.strength, "justify", recommendation.method);
  });

  it("matches variable names in hypotheses regardless of case and spacing", () => {
    const plan = recommendAnalyses(build({ variables: [["Screen Time", "independent", "ratio"], ["sleep", "dependent", "ratio"]], hypotheses: [{ form: "relationship", ivs: [" screen time "], dvs: ["SLEEP"] }] }));
    assert.equal(verdictOf(plan, "pearson"), "strong");
  });

  it("reads questions from the profile", () => {
    const parts = analysisQuestions(analysisProfile(survey()));
    assert.deepEqual(parts.map((part) => [part.id, part.independents.map((variable) => variable.name), part.dependents.map((variable) => variable.name)]), [["h1", ["screen time"], ["sleep quality"]]]);
  });
});

describe("testing the whole model", () => {
  const model = (extra: ProjectSpec = {}) =>
    build({
      variables: [
        ["support", "independent", "likert"],
        ["stress", "mediator", "likert"],
        ["wellbeing", "dependent", "likert"],
      ],
      items: { support: 4, stress: 4, wellbeing: 4 },
      hypotheses: [
        { form: "prediction", ivs: ["support"], dvs: ["wellbeing"], mediators: ["stress"] },
        { form: "prediction", ivs: ["support"], dvs: ["stress"] },
      ],
      onion: { philosophy: "positivism", approach: "deductive", choice: "quantitative" },
      margin: 5,
      ...extra,
    });

  it("recommends SEM and CB-SEM strongly for a confirmatory model with a large sample", () => {
    assert.deepEqual(verdictsIn(recommendAnalyses(model()), "model"), ["sem:strong", "cb-sem:strong", "pls-sem:possible"]);
  });

  it("prefers PLS-SEM below 200, and asks CB-SEM to be justified", () => {
    assert.deepEqual(verdictsIn(recommendAnalyses(model({ margin: 7 })), "model"), ["sem:strong", "pls-sem:strong", "cb-sem:justify"]);
  });

  it("asks both to be justified below 100", () => {
    assert.deepEqual(verdictsIn(recommendAnalyses(model({ margin: 10 })), "model"), ["sem:strong", "cb-sem:justify", "pls-sem:justify"]);
  });

  it("prefers PLS-SEM for an exploratory approach", () => {
    assert.deepEqual(verdictsIn(recommendAnalyses(model({ onion: { approach: "inductive", choice: "quantitative" } })), "model"), ["sem:strong", "pls-sem:strong", "cb-sem:possible"]);
  });

  it("notes the missing sample size for CB-SEM", () => {
    const plan = recommendAnalyses(model({ margin: undefined }));
    const cb = stage(plan, "model").questions[0].recommendations.find((recommendation) => recommendation.method === "cb-sem")!;
    assert.equal(cb.strength, "possible");
    assert.ok(cb.reasons.includes("CB-SEM needs a large sample, and no planned sample size is recorded."));
  });

  it("explains why SEM doesn't apply to a simpler project", () => {
    const current = stage(recommendAnalyses(survey()), "model");
    assert.deepEqual(current.questions, []);
    assert.match(current.notes[0], /^Structural equation modelling suits frameworks linking three or more variables/);
  });
});

describe("overview and notes", () => {
  it("summarises the families of methods used, with their strongest verdict", () => {
    const plan = recommendAnalyses(survey());
    assert.deepEqual(
      plan.overview.map((entry) => `${entry.method}:${entry.strength}`),
      ["descriptive-statistics:strong", "correlation:strong", "regression:possible"],
    );
    assert.equal(plan.overview[1].reasons[0], "Your plan uses Pearson correlation, Spearman's rank correlation.");
  });

  it("includes repeated measures when the plan uses them", () => {
    const plan = recommendAnalyses(build({ variables: [["time", "independent", "categorical"], ["score", "dependent", "ratio"]], hypotheses: [{ form: "difference", ivs: ["time"], dvs: ["score"] }], design: "longitudinal" }));
    assert.ok(plan.overview.some((entry) => entry.method === "repeated-measures-anova"));
  });

  it("notes qualitative and mixed methods projects", () => {
    assert.match(recommendAnalyses(build({ onion: { choice: "qualitative" } })).notes[0], /^Your project is qualitative/);
    assert.match(recommendAnalyses(build({ onion: { choice: "mixed-methods" } })).notes[0], /^Your project uses mixed methods/);
  });

  it("warns that non-probability samples limit generalising", () => {
    assert.ok(recommendAnalyses(survey({ sampling: "convenience" })).notes.includes("Your sample is chosen without probability sampling (Sampling technique: Convenience sampling), so p-values describe your sample more safely than the wider population. Say so when you generalise."));
    assert.ok(!recommendAnalyses(survey()).notes.some((note) => note.includes("probability sampling")));
  });

  it("lists the project's gaps", () => {
    assert.deepEqual(recommendAnalyses({}).notes, analysisProfile({}).gaps);
  });
});

describe("allRecommendations and uses", () => {
  it("lists every recommendation with its stage and question", () => {
    const plan = recommendAnalyses(survey());
    const entries = allRecommendations(plan);
    assert.equal(entries.length, plan.stages.reduce((total, current) => total + current.questions.reduce((sum, question) => sum + question.recommendations.length, 0), 0));
    assert.deepEqual(uses(plan, "pearson").map((entry) => [entry.stage, entry.question]), [["questions", "Hypothesis 1"]]);
    assert.deepEqual(uses(plan, "manova"), []);
  });
});

describe("robustness", () => {
  it("handles an empty project without throwing", () => {
    const plan = recommendAnalyses({});
    assert.equal(plan.stages.length, 4);
    assert.deepEqual(verdictsIn(plan, "describe"), ["descriptive-statistics:strong", "frequency:possible", "percentage:possible"]);
  });

  it("handles written and ticked-choice variables", () => {
    const plan = recommendAnalyses(build({ variables: [["views", "independent", "open-ended"], ["devices", "independent", "multiple-response"], ["y", "dependent", "ratio"]], hypotheses: [{ form: "relationship", ivs: ["views", "devices"], dvs: ["y"] }] }));
    const [question] = stage(plan, "questions").questions;
    assert.ok(question.notes.some((note) => note.includes("written answers")));
    assert.equal(verdictOf(plan, "chi-square"), "justify");
  });

  it("builds a plan for a large project quickly (best of three)", () => {
    const names = Array.from({ length: 30 }, (_, index) => `v${index}`);
    const project = build({
      variables: names.map((name, index) => [name, index < 20 ? "independent" : "dependent", index % 3 === 0 ? "ratio" : index % 3 === 1 ? "likert" : "nominal"] as [string, "independent" | "dependent", "ratio" | "likert" | "nominal"]),
      hypotheses: Array.from({ length: 20 }, (_, index) => ({ form: "prediction" as const, ivs: [names[index], names[(index + 1) % 20]], dvs: [names[20 + (index % 10)]] })),
      items: Object.fromEntries(names.filter((_, index) => index % 3 === 1).map((name) => [name, 4])),
      margin: 5,
    });
    const run = () => {
      const started = performance.now();
      recommendAnalyses(project);
      return performance.now() - started;
    };
    const best = Math.min(run(), run(), run());
    assert.ok(best < 500, `${Math.round(best)} ms`);
    assert.equal(stage(recommendAnalyses(project), "questions").questions.length, 20);
  });

  it("reads everything from the draft, changing nothing", () => {
    const project = survey();
    const copy = structuredClone(project);
    recommendAnalyses(project);
    assert.deepEqual(project, copy);
    assert.deepEqual(recommendAnalyses(updateProjectDraft(project, {})), recommendAnalyses(project));
  });
});
