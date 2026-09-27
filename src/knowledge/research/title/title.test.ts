import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { questionnaireDocx, questionnairePdf } from "../questionnaire-export";
import { questionnaireMarkdown, questionnaireText } from "../questionnaire-summary";
import { EMPTY_DESIGN, chooseDesign } from "../research-design";
import { applyDesign } from "../design-summary";
import { GROUP_REFERENCES, TEXTBOOK_REFERENCES, getReference } from "../references";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "../research-project";
import { EMPTY_SAMPLING_PLAN, updatePopulation } from "../sampling";
import { analyseTitle } from "./analyse";
import { ALIGNMENT_ISSUE_IDS, alignTitle, type AlignmentIssueId } from "./alignment";
import { CRITERION_IDS, TITLE_CATEGORY_MEANINGS, categorise, evaluateTitle, type CriterionId, type CriterionResult, type CriterionStatus } from "./evaluate";
import { TITLE_EXAMPLES } from "./examples";
import { KEYWORD_ELEMENTS, extractKeywords, titleNames } from "./keywords";
import { TITLE_PATTERNS, TITLE_PATTERN_IDS, classifyTitle, primaryPattern, type TitlePatternId } from "./patterns";
import { REPORT_TITLE, titleReport } from "./report";
import { EMPTY_TITLE_SET, HISTORY_LIMIT, addTitle, editTitle, removeTitle, restoreVersion, setWorkingTitle, titleSetFrom, toggleFavourite, workingTitle } from "./titles";

const GOOD = "Relationship between Daily Smartphone Use and Sleep Quality among Grade 11 Students in Kathmandu Valley";

const project: ResearchProjectDraft = createProjectDraft({
  researchProblem: "Many secondary students report poor sleep, which affects their learning.",
  researchGap: "Few studies have examined smartphone use and sleep among students in Nepal.",
  researchQuestion: "What is the relationship between daily smartphone use and sleep quality among Grade 11 students in Kathmandu Valley?",
  researchObjectives: ["To measure daily smartphone use", "To examine the relationship between smartphone use and sleep quality"],
  independentVariables: ["daily smartphone use"],
  dependentVariables: ["sleep quality"],
  population: "Grade 11 students",
  location: "Kathmandu Valley",
});

const status = (title: string, id: CriterionId, draft: ResearchProjectDraft = project): CriterionStatus => evaluateTitle(title, draft).criteria.find((criterion) => criterion.id === id)!.status;
const issueIds = (title: string, draft: ResearchProjectDraft = project): AlignmentIssueId[] => alignTitle(title, draft).issues.map((issue) => issue.id);

describe("title patterns", () => {
  const samples: Record<TitlePatternId, string> = {
    relationship: "The relationship between screen time and sleep among students",
    correlational: "A correlational study of stress and grades",
    comparative: "A comparison of public and private schools in Nepal",
    impact: "Impact of remittances on household spending",
    effect: "Effects of peer tutoring on reading scores",
    factors: "Factors affecting exam performance among nursing students",
    descriptive: "Prevalence of anaemia among pregnant women in Dang",
    exploratory: "Exploring teachers' use of mother-tongue instruction",
    phenomenological: "Lived experiences of widows in rural Nepal",
    "case-study": "Community forestry in Kavre: a case study",
    experimental: "A randomised trial of text reminders for vaccination",
    "mixed-methods": "Teacher motivation in Pokhara: a mixed-methods study",
    qualitative: "A qualitative study of caregivers' coping",
    quantitative: "A cross-sectional survey of smoking among adolescents",
  };

  for (const id of TITLE_PATTERN_IDS)
    it(`recognises a ${id} title`, () => {
      assert.ok(classifyTitle(samples[id]).some((match) => match.pattern.id === id), samples[id]);
    });

  it("defines every pattern with an explanation, what it needs and real references", () => {
    for (const pattern of TITLE_PATTERNS) {
      assert.ok(pattern.explanation.endsWith("."), pattern.id);
      assert.ok(pattern.needs.includes("population") || pattern.needs.includes("dependent"), pattern.id);
      for (const id of pattern.references) assert.doesNotThrow(() => getReference(id), `${pattern.id} → ${id}`);
    }
  });

  it("recognises “X and Y among P” as a relationship only when nothing else describes the study", () => {
    assert.equal(primaryPattern(classifyTitle("Screen time and sleep quality among nursing students"))?.pattern.id, "relationship");
    assert.equal(primaryPattern(classifyTitle("Prevalence and determinants of anaemia among women"))?.pattern.id, "factors");
    assert.deepEqual(classifyTitle("Screen time and sleep quality"), []);
  });

  it("prefers what the study does over the method it names", () => {
    const matches = classifyTitle("Effect of tutoring on reading: a quasi-experimental study");
    assert.deepEqual(matches.map((match) => match.pattern.id), ["effect", "experimental"]);
    assert.equal(primaryPattern(matches)?.pattern.id, "effect");
    assert.equal(primaryPattern(classifyTitle("A mixed-methods study"))?.pattern.id, "mixed-methods");
    assert.equal(primaryPattern([]), null);
  });

  it("quotes the title's own wording for each match", () => {
    assert.equal(classifyTitle("The Effects of Diet on Mood")[0].wording, "Effects of");
  });
});

describe("reading a title", () => {
  it("finds filler, repeated meanings and vague words", () => {
    const analysis = analyseTitle("A Study on the Past History and Current Issues of Tourism");
    assert.deepEqual(analysis.fillers, ["a study on"]);
    assert.deepEqual(analysis.tautologies, ["past history"]);
    assert.deepEqual(analysis.ambiguous.sort(), ["current", "issues"]);
  });

  it("reports the longest filler phrase only", () => {
    assert.deepEqual(analyseTitle("An Experimental Investigation of Memory").fillers, ["an experimental investigation of"]);
  });

  it("finds informal wording, first person, buzzwords, sweeping scope and causal claims", () => {
    const analysis = analyseTitle("How Our Holistic Programme Has a Huge Impact of Coaching on Society");
    assert.deepEqual(analysis.informal, ["huge"]);
    assert.deepEqual(analysis.firstPerson, ["our"]);
    assert.deepEqual(analysis.buzzwords, ["holistic"]);
    assert.deepEqual(analysis.broad, ["society"]);
    assert.deepEqual(analysis.causal, ["impact of"]);
  });

  it("finds concepts used twice, ignoring plurals", () => {
    assert.deepEqual(analyseTitle("Student Motivation and Achievement among Students").repeated, ["student"]);
    assert.deepEqual(analyseTitle("Motivation and achievement in schools").repeated, []);
  });

  it("finds abbreviations, but not Roman numerals or titles written in capitals", () => {
    assert.deepEqual(analyseTitle("HIV Testing among SMEs in Phase II").abbreviations, ["HIV", "SMEs"]);
    assert.deepEqual(analyseTitle("COVID-19 and Remote Learning").abbreviations, ["COVID-19"]);
    assert.deepEqual(analyseTitle("SLEEP AND SCREEN TIME AMONG STUDENTS").abbreviations, []);
  });

  const grammar = (title: string) => analyseTitle(title).grammar.map((indicator) => indicator.id);
  it("flags grammar indicators", () => {
    assert.deepEqual(grammar("The the effect of diet"), ["repeated-word"]);
    assert.ok(grammar("Diet (and mood among adults").includes("unbalanced-brackets"));
    assert.ok(grammar("“Diet and mood among adults").includes("unbalanced-quotes"));
    assert.ok(grammar("Diet and mood among adults.").includes("full-stop"));
    assert.ok(grammar("Diet and mood , among adults").includes("space-before-punctuation"));
    assert.ok(grammar("Diet and mood:among adults").includes("missing-space"));
    assert.ok(grammar("diet and mood among adults").includes("lowercase-start"));
    assert.ok(grammar("DIET AND MOOD AMONG ADULTS").includes("all-capitals"));
    assert.ok(grammar("Diet and mood;; among adults").includes("doubled-punctuation"));
    assert.deepEqual(grammar(GOOD), []);
    assert.deepEqual(grammar("Trends in 2010–2020: a review"), []);
  });

  it("notices a subtitle", () => {
    assert.equal(analyseTitle("Stress at work: a case study").hasSubtitle, true);
    assert.equal(analyseTitle(GOOD).hasSubtitle, false);
  });
});

describe("keyword panel", () => {
  it("sets the project's elements beside the title", () => {
    const panel = extractKeywords(GOOD, project);
    assert.deepEqual(panel.independent, [{ text: "daily smartphone use", inTitle: true, source: "project" }]);
    assert.deepEqual(panel.dependent, [{ text: "sleep quality", inTitle: true, source: "project" }]);
    assert.deepEqual(panel.population, [{ text: "Grade 11 students", inTitle: true, source: "project" }]);
    assert.deepEqual(panel.location, [{ text: "Kathmandu Valley", inTitle: true, source: "project" }]);
    assert.deepEqual(panel.moderator, []);
    assert.equal(Object.keys(panel).length, KEYWORD_ELEMENTS.length);
  });

  it("marks project elements the title leaves out", () => {
    const panel = extractKeywords("Smartphone use among students", updateProjectDraft(project, { moderatorVariables: ["gender"] }));
    assert.equal(panel.dependent[0].inTitle, false);
    assert.deepEqual(panel.moderator, [{ text: "gender", inTitle: false, source: "project" }]);
  });

  it("reads elements from the title when the project has none, and never invents them", () => {
    const panel = extractKeywords("Effect of Peer Tutoring on Reading Scores among Grade 3 Pupils in Dhulikhel: A Quasi-Experimental Study", {});
    assert.deepEqual(panel.independent.map((keyword) => keyword.text), ["Peer Tutoring"]);
    assert.deepEqual(panel.dependent.map((keyword) => keyword.text), ["Reading Scores"]);
    assert.deepEqual(panel.population.map((keyword) => keyword.text), ["Grade 3 Pupils"]);
    assert.deepEqual(panel.location.map((keyword) => keyword.text), ["Dhulikhel"]);
    assert.deepEqual(panel.design.map((keyword) => keyword.text), ["Quasi-Experimental"]);
    assert.ok([...panel.independent, ...panel.dependent, ...panel.population].every((keyword) => keyword.source === "title" && keyword.inTitle));
    assert.deepEqual(extractKeywords("Tourism", {}).population, []);
  });

  it("takes the population from the sampling plan when the question stage has none", () => {
    const draft = createProjectDraft({ samplingPlan: updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: "nurses" }) });
    assert.deepEqual(extractKeywords("Burnout among nurses", draft).population, [{ text: "nurses", inTitle: true, source: "project" }]);
  });

  it("takes the last place named, as the setting usually ends the title", () => {
    assert.deepEqual(extractKeywords("Participation in Forest User Groups among Women in Kaski District, Nepal", {}).location.map((keyword) => keyword.text), ["Kaski District"]);
  });

  it("names the chosen design and any method words in the title", () => {
    const draft = applyDesign({}, chooseDesign(EMPTY_DESIGN, "survey"));
    assert.deepEqual(extractKeywords("A survey of smoking among adolescents", draft).design, [{ text: "Survey", inTitle: true, source: "project" }]);
    assert.deepEqual(extractKeywords("Smoking among adolescents: a mixed-methods study", draft).design.map((keyword) => `${keyword.text}:${keyword.source}`), ["Survey:project", "mixed-methods:title"]);
  });

  it("matches singular and plural forms", () => {
    assert.ok(titleNames("Stress among Teachers", "teacher"));
    assert.ok(titleNames("Stress among the teacher", "teachers"));
    assert.ok(titleNames("Care for the elderly and babies", "baby"));
    assert.ok(!titleNames("Stress among nurses", "teachers"));
    assert.ok(!titleNames("Stress", ""));
  });
});

describe("title quality engine", () => {
  it("judges every criterion, in order, with a finding and a reason", () => {
    const evaluation = evaluateTitle(GOOD, project);
    assert.deepEqual(evaluation.criteria.map((criterion) => criterion.id), [...CRITERION_IDS]);
    for (const criterion of evaluation.criteria) {
      assert.ok(criterion.finding.length > 20 && criterion.why.length > 20, criterion.id);
      for (const id of criterion.references) assert.doesNotThrow(() => getReference(id), id);
    }
  });

  it("rates a well-aligned title as excellent", () => {
    const evaluation = evaluateTitle(GOOD, project);
    assert.deepEqual(evaluation.criteria.filter((criterion) => criterion.status === "attention").map((criterion) => criterion.finding), []);
    assert.equal(evaluation.category, "excellent");
  });

  it("never gives percentages or points", () => {
    for (const title of [GOOD, "A study on stuff", ...TITLE_EXAMPLES.map((example) => example.weak)]) {
      const evaluation = evaluateTitle(title, project);
      const text = [evaluation.categoryReason, ...evaluation.criteria.flatMap((criterion) => [criterion.finding, criterion.why])].join(" ");
      assert.doesNotMatch(text, /%|\bpoints?\b|\bscore/i, title);
    }
  });

  it("never rewrites the title: every phrase a finding quotes comes from the title or the project", () => {
    const sources = (title: string) => [title, ...Object.values(project).flat().filter((value): value is string => typeof value === "string")].join(" ").toLowerCase();
    for (const title of [GOOD, "A Study on the Impact of Mobile Phones on Kids Nowadays", "Effects of Diet", ...TITLE_EXAMPLES.flatMap((example) => [example.weak, example.stronger])]) {
      const haystack = sources(title);
      for (const criterion of evaluateTitle(title, project).criteria)
        for (const [, quoted] of criterion.finding.matchAll(/“([^”]+)”/g)) assert.ok(haystack.includes(quoted.toLowerCase()), `${criterion.id} quotes “${quoted}” for ${title}`);
    }
  });

  it("judges clarity by ambiguous words and recognisable structure", () => {
    assert.equal(status("Relationship between stress and grades among nurses", "clarity"), "strength");
    assert.equal(status("Stress in nursing", "clarity"), "adequate");
    assert.equal(status("Current issues in nursing", "clarity"), "attention");
  });

  it("judges specificity by the elements named, and sweeping scope", () => {
    assert.equal(status(GOOD, "specificity"), "strength");
    assert.equal(status("Stress and grades among nurses", "specificity", {}), "strength");
    assert.equal(status("Burnout among nurses in Nepal", "specificity", {}), "adequate");
    assert.equal(status("Stress", "specificity", {}), "attention");
    assert.equal(status("Relationship between stress and grades in society", "specificity", {}), "attention");
  });

  it("judges brevity by filler and repeated meanings", () => {
    assert.equal(status("A Study of Stress among Nurses", "brevity"), "attention");
    assert.equal(status("The Final Outcome of Surgery among Adults", "brevity"), "attention");
    assert.equal(status(GOOD, "brevity"), "strength");
  });

  it("judges completeness against what the title's pattern needs", () => {
    assert.equal(status("Effect of tutoring on reading scores among pupils", "completeness", {}), "strength");
    assert.equal(status("Effect of tutoring on reading scores", "completeness", {}), "attention");
    assert.match(evaluateTitle("Effect of tutoring on reading scores", {}).criteria.find((criterion) => criterion.id === "completeness")!.finding, /doesn't clearly name the population/);
    assert.equal(status("Lived experiences of widows in rural Nepal", "completeness", {}), "strength");
  });

  it("judges academic tone", () => {
    assert.equal(status("Our Amazing Programme and Stress among Nurses!", "academic-tone"), "attention");
    assert.equal(status("Does Stress Lower Grades among Nurses?", "academic-tone"), "adequate");
    assert.equal(status(GOOD, "academic-tone"), "strength");
  });

  it("judges variable coverage against the project", () => {
    assert.equal(status(GOOD, "variable-coverage"), "strength");
    assert.equal(status("Smartphone use and learning among Grade 11 students", "variable-coverage"), "attention");
    assert.equal(status("Daily smartphone use among Grade 11 students", "variable-coverage"), "adequate");
    assert.equal(status("Relationship between stress and grades among nurses", "variable-coverage", {}), "adequate");
    assert.equal(status("Lived experiences of widows", "variable-coverage", {}), "not-applicable");
  });

  it("judges population and location coverage", () => {
    assert.equal(status(GOOD, "population-coverage"), "strength");
    assert.equal(status("Smartphone use and sleep quality in Kathmandu Valley", "population-coverage"), "attention");
    assert.equal(status("Smartphone use and sleep quality among Grade 11 students", "location-coverage"), "adequate");
    assert.equal(status(GOOD, "location-coverage"), "strength");
    assert.equal(status("Stress among nurses", "location-coverage", {}), "not-applicable");
  });

  it("checks the title's wording against the chosen design", () => {
    const survey = applyDesign(project, chooseDesign(EMPTY_DESIGN, "survey"));
    assert.equal(status("Impact of daily smartphone use on sleep quality among Grade 11 students", "design-consistency", survey), "attention");
    assert.match(evaluateTitle("Impact of daily smartphone use on sleep quality among Grade 11 students", survey).criteria.find((criterion) => criterion.id === "design-consistency")!.finding, /can't usually support a causal claim/);
    assert.equal(status(GOOD, "design-consistency", survey), "adequate");
    assert.equal(status(`${GOOD}: a survey`, "design-consistency", survey), "strength");
    assert.equal(status(`${GOOD}: a qualitative study`, "design-consistency", survey), "attention");
    const experiment = applyDesign(project, chooseDesign(EMPTY_DESIGN, "quasi-experimental"));
    assert.equal(status("Effect of daily smartphone use on sleep quality among Grade 11 students", "design-consistency", experiment), "adequate");
    assert.equal(status(GOOD, "design-consistency"), "not-applicable");
    assert.equal(status("Effect of diet on mood", "design-consistency", {}), "adequate");
    assert.equal(status(`${GOOD}: a qualitative study`, "design-consistency", updateProjectDraft(project, { methodology: "quantitative" })), "attention");
  });

  it("judges abbreviations, ambiguity and jargon", () => {
    assert.equal(status("HIV Testing among Adults in Nepal", "abbreviations"), "attention");
    assert.equal(status(GOOD, "abbreviations"), "strength");
    assert.equal(status("Effective Teaching among Nurses", "ambiguity"), "attention");
    assert.equal(status("Leveraging Synergies in Nursing Teams", "jargon"), "attention");
    assert.equal(status(GOOD, "jargon"), "strength");
  });

  it("judges length in bands, saying they are rules of thumb", () => {
    assert.equal(status("Stress in nurses", "length"), "attention");
    assert.equal(status("Stress among hospital nurses in Nepal", "length"), "adequate");
    assert.equal(status(GOOD, "length"), "strength");
    const long = `${GOOD} and Their Parents and Teachers during the Academic Year`;
    assert.equal(status(long, "length"), "adequate");
    assert.equal(status(`${long} before and after the National Examinations in Nepal`, "length"), "attention");
    assert.match(evaluateTitle(GOOD, project).criteria.find((criterion) => criterion.id === "length")!.why, /rules of thumb|no word limit/);
  });

  it("judges keyword coverage against the question and objectives", () => {
    assert.equal(status(GOOD, "keyword-coverage"), "strength");
    assert.equal(status("Tourism in Pokhara", "keyword-coverage"), "attention");
    assert.equal(status(GOOD, "keyword-coverage", {}), "not-applicable");
  });

  it("explains every category, naming the criteria that decided it", () => {
    const criterion = (id: CriterionId, statusValue: CriterionStatus): CriterionResult => ({ id, label: id, status: statusValue, finding: "", why: "", references: [] });
    assert.equal(categorise([criterion("length", "strength")]).category, "excellent");
    const good = categorise([criterion("length", "attention"), criterion("jargon", "attention")]);
    assert.equal(good.category, "good");
    assert.match(good.reason, /length and jargon/);
    assert.equal(categorise([criterion("length", "attention"), criterion("jargon", "attention"), criterion("grammar", "attention")]).category, "needs-improvement");
    const core = categorise([criterion("completeness", "attention")]);
    assert.equal(core.category, "needs-improvement");
    assert.match(core.reason, /core criterion/);
    for (const meaning of Object.values(TITLE_CATEGORY_MEANINGS)) assert.ok(meaning.endsWith("."));
  });

  it("works with no project at all", () => {
    const evaluation = evaluateTitle("Effect of Peer Tutoring on Reading Scores among Grade 3 Pupils in Dhulikhel");
    assert.equal(evaluation.category, "excellent");
  });
});

describe("worked examples", () => {
  for (const example of TITLE_EXAMPLES) {
    it(`teaches with ${example.id}: the weak title needs improvement and the stronger one is excellent`, () => {
      assert.equal(evaluateTitle(example.weak, {}).category, "needs-improvement", example.weak);
      assert.equal(evaluateTitle(example.stronger, {}).category, "excellent", `${example.stronger}: ${evaluateTitle(example.stronger, {}).categoryReason}`);
      assert.ok(example.whyWeak.length > 0 && example.strongerCharacteristics.length > 0 && example.explanation.endsWith("."));
      for (const id of example.references) assert.doesNotThrow(() => getReference(id), id);
    });
  }

  it("includes examples from Nepal and elsewhere", () => {
    assert.ok(TITLE_EXAMPLES.filter((example) => example.region === "nepal").length >= 3);
    assert.ok(TITLE_EXAMPLES.filter((example) => example.region === "global").length >= 3);
  });
});

describe("alignment engine", () => {
  it("reflects every part of a well-aligned project", () => {
    const alignment = alignTitle(GOOD, project);
    const statuses = Object.fromEntries(alignment.sources.map((source) => [source.source, source.status]));
    assert.deepEqual(statuses, { problem: "partial", gap: "aligned", question: "aligned", objectives: "aligned", variables: "aligned", population: "aligned", location: "aligned", design: "unavailable" });
    assert.deepEqual(alignment.issues, []);
  });

  it("says which parts of the project are missing", () => {
    for (const source of alignTitle(GOOD, {}).sources) assert.equal(source.status, "unavailable", source.source);
  });

  it("finds missing variables, population and location", () => {
    assert.deepEqual(issueIds("Smartphone use among young people"), ["missing-variables", "missing-population", "missing-location", "overly-broad"].filter((id) => issueIds("Smartphone use among young people").includes(id as AlignmentIssueId)));
    const ids = issueIds("Sleep quality among teenagers");
    for (const id of ["missing-variables", "missing-population", "missing-location"] as const) assert.ok(ids.includes(id), id);
  });

  it("finds a scope mismatch when the title introduces concepts the question doesn't study", () => {
    assert.ok(issueIds(`${GOOD}: Anxiety, Nutrition and Family Income`).includes("scope-mismatch"));
  });

  it("finds a title narrower than the question", () => {
    const draft = updateProjectDraft(project, { location: null, researchQuestion: "What is the relationship between daily smartphone use and sleep quality among Grade 11 students?" });
    assert.ok(issueIds("Relationship between daily smartphone use and sleep quality among Grade 11 students in Lalitpur", draft).includes("overly-narrow"));
  });

  it("finds a broad title", () => {
    const issue = alignTitle("Technology and society", project).issues.find((entry) => entry.id === "overly-broad")!;
    assert.match(issue.explanation, /“society”/);
  });

  it("finds redundant wording and repeated concepts", () => {
    const ids = issueIds("A Study of Student Sleep among Grade 11 Students in Kathmandu Valley");
    assert.ok(ids.includes("redundant-wording"));
    assert.ok(ids.includes("repeated-concepts"));
  });

  it("explains every issue and why it matters", () => {
    const issues = alignTitle("A Study of Current Issues among People and People", project).issues;
    assert.ok(issues.length >= 4);
    for (const issue of issues) {
      assert.ok(ALIGNMENT_ISSUE_IDS.includes(issue.id));
      assert.ok(issue.explanation.endsWith(".") && issue.why.endsWith("."), issue.id);
    }
  });
});

describe("titles, alternatives and history", () => {
  it("makes the first title the working title, and refuses blanks and repeats", () => {
    let set = addTitle(EMPTY_TITLE_SET, "  First   title ");
    assert.equal(workingTitle(set)?.text, "First title");
    assert.equal(addTitle(set, "   "), set);
    assert.equal(addTitle(set, "FIRST TITLE"), set);
    set = addTitle(set, "Second title");
    assert.equal(set.titles.length, 2);
    assert.equal(workingTitle(set)?.text, "First title");
  });

  it("keeps earlier wordings when a title is edited, newest first, and restores them", () => {
    let set = addTitle(EMPTY_TITLE_SET, "Version one");
    const id = set.titles[0].id;
    set = editTitle(set, id, "Version two", 1);
    set = editTitle(set, id, "Version three", 2);
    assert.deepEqual(set.titles[0].history.map((version) => version.text), ["Version two", "Version one"]);
    set = restoreVersion(set, id, 1, 3);
    assert.equal(set.titles[0].text, "Version one");
    assert.deepEqual(set.titles[0].history.map((version) => version.text), ["Version three", "Version two", "Version one"]);
    assert.equal(editTitle(set, id, "Version one", 4), set);
    assert.equal(restoreVersion(set, id, 99, 4), set);
  });

  it("limits the history", () => {
    let set = addTitle(EMPTY_TITLE_SET, "v0");
    for (let index = 1; index <= HISTORY_LIMIT + 5; index++) set = editTitle(set, set.titles[0].id, `v${index}`, index);
    assert.equal(set.titles[0].history.length, HISTORY_LIMIT);
  });

  it("marks favourites, changes the working title, and reassigns it when removed", () => {
    let set = addTitle(addTitle(EMPTY_TITLE_SET, "A"), "B");
    const [a, b] = set.titles;
    set = toggleFavourite(set, b.id);
    assert.equal(set.titles[1].favourite, true);
    set = setWorkingTitle(set, b.id);
    assert.equal(workingTitle(set)?.text, "B");
    assert.equal(setWorkingTitle(set, "nope"), set);
    set = removeTitle(set, b.id);
    assert.equal(workingTitle(set)?.id, a.id);
    assert.deepEqual(removeTitle(set, a.id), EMPTY_TITLE_SET);
  });

  it("gives new titles ids that never repeat, even after removals", () => {
    let set = addTitle(addTitle(EMPTY_TITLE_SET, "A"), "B");
    set = removeTitle(set, set.titles[0].id);
    set = addTitle(set, "C");
    assert.equal(new Set(set.titles.map((title) => title.id)).size, set.titles.length);
  });

  it("starts from the project's saved title", () => {
    assert.equal(workingTitle(titleSetFrom("Saved title"))?.text, "Saved title");
    assert.deepEqual(titleSetFrom(undefined), EMPTY_TITLE_SET);
  });
});

describe("the title report", () => {
  let set = addTitle(addTitle(EMPTY_TITLE_SET, GOOD), "Smartphones and sleep");
  set = toggleFavourite(set, set.titles[1].id);
  const evaluation = evaluateTitle(GOOD, project);
  const blocks = titleReport(set, evaluation, alignTitle(GOOD, project));

  it("lists every title with its marks, then the evaluation, keywords, alignment and references", () => {
    assert.deepEqual(blocks[0], { kind: "title", text: REPORT_TITLE, placeholder: false });
    const text = blocks.map((block) => ("text" in block ? block.text : "")).join("\n");
    assert.match(text, /\(working title\)/);
    assert.match(text, /Smartphones and sleep \(favourite\)/);
    assert.match(text, /Excellent: /);
    assert.match(text, /Independent variables: daily smartphone use \(in the title\)/);
    assert.match(text, /Research question \(Reflected\)/);
    assert.match(text, /American Psychological Association\. \(2020\)/);
    assert.doesNotMatch(text, /\*/);
  });

  it("exports through the shared Markdown, text, Word and PDF writers", () => {
    assert.match(questionnaireMarkdown(blocks), /^# Research title review/);
    assert.match(questionnaireText(blocks), /Research title review\n=+/);
    const docx = questionnaireDocx(blocks, REPORT_TITLE);
    assert.equal(String.fromCharCode(docx[0], docx[1]), "PK");
    const pdf = questionnairePdf(blocks, REPORT_TITLE);
    assert.equal(String.fromCharCode(...pdf.slice(0, 5)), "%PDF-");
  });

  it("still exports with no titles", () => {
    const empty = titleReport(EMPTY_TITLE_SET, null, null);
    assert.ok(empty.some((block) => "text" in block && block.text === "No titles yet."));
  });
});

describe("references", () => {
  it("formats group authors as APA does", () => {
    for (const reference of GROUP_REFERENCES) {
      assert.ok(reference.apa.startsWith(`${reference.cite.replace(/, \d{4}$/, "")}. (${reference.year}).`));
      assert.equal(reference.apa.split("*").length, 3);
      assert.equal(getReference(reference.id), reference);
    }
  });

  it("formats the textbook sources as the registry does, and uses each one", () => {
    const used = new Set([
      ...TITLE_PATTERNS.flatMap((pattern) => pattern.references),
      ...TITLE_EXAMPLES.flatMap((example) => example.references),
      ...evaluateTitle(GOOD, project).criteria.flatMap((criterion) => criterion.references),
    ]);
    for (const reference of TEXTBOOK_REFERENCES) {
      assert.ok(reference.apa.includes(`(${reference.year}).`) && reference.apa.endsWith("."), reference.id);
      assert.equal(reference.apa.split("*").length, 3, reference.id);
      const surnames = reference.apa.slice(0, reference.apa.indexOf(" (")).split(/\.,(?: &)? /).map((author) => author.split(",")[0]);
      assert.equal(reference.cite, `${surnames.length === 2 ? `${surnames[0]} & ${surnames[1]}` : surnames[0]}, ${reference.year}`);
      assert.ok(used.has(reference.id), `${reference.id} is unused`);
    }
    for (const reference of GROUP_REFERENCES) assert.ok(used.has(reference.id), `${reference.id} is unused`);
  });

  it("knows the new sources", () => {
    for (const id of ["apa-2020", "sekaran-bougie-2013", "punch-2005", "kothari-2004"]) assert.doesNotThrow(() => getReference(id));
  });
});
