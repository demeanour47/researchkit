/**
 * The title quality engine: fifteen criteria, each judged in words with its reasons.
 *
 * It teaches; it never rewrites. Every judgement quotes the researcher's own title and
 * explains what readers and examiners look for, so the researcher can decide what to
 * change. There are no percentages or points: the overall category is a summary of the
 * criteria, and says which ones decided it.
 */

import { getDesign, type ResearchDesign } from "../design-types";
import { joinList, sharedWords } from "../question-text";
import type { ResearchProjectDraft } from "../research-project";
import { analyseTitle, type GrammarIndicator, type TitleAnalysis } from "./analyse";
import { extractKeywords, projectPopulation, type Keyword, type KeywordPanel } from "./keywords";
import { primaryPattern, type PatternMatch, type TitleElement } from "./patterns";

export const CRITERION_IDS = [
  "clarity",
  "specificity",
  "brevity",
  "completeness",
  "academic-tone",
  "variable-coverage",
  "population-coverage",
  "location-coverage",
  "design-consistency",
  "grammar",
  "abbreviations",
  "ambiguity",
  "jargon",
  "length",
  "keyword-coverage",
] as const;
export type CriterionId = (typeof CRITERION_IDS)[number];

export const CRITERION_LABELS: Readonly<Record<CriterionId, string>> = {
  clarity: "Clarity",
  specificity: "Specificity",
  brevity: "Brevity",
  completeness: "Completeness",
  "academic-tone": "Academic tone",
  "variable-coverage": "Variable coverage",
  "population-coverage": "Population coverage",
  "location-coverage": "Location coverage",
  "design-consistency": "Research design consistency",
  grammar: "Grammar indicators",
  abbreviations: "Abbreviations",
  ambiguity: "Ambiguous wording",
  jargon: "Jargon",
  length: "Length",
  "keyword-coverage": "Keyword coverage",
};

/**
 * - strength: the title does what the criterion asks.
 * - adequate: acceptable, with something worth knowing.
 * - attention: worth another look, with the reason.
 * - not-applicable: nothing to judge yet, such as keyword coverage without a question.
 */
export type CriterionStatus = "strength" | "adequate" | "attention" | "not-applicable";

export const CRITERION_STATUS_LABELS: Readonly<Record<CriterionStatus, string>> = {
  strength: "Strength",
  adequate: "Adequate",
  attention: "Worth another look",
  "not-applicable": "Not assessed",
};

export interface CriterionResult {
  id: CriterionId;
  label: string;
  status: CriterionStatus;
  /** What was found, quoting the title. */
  finding: string;
  /** Why it matters, in general terms. */
  why: string;
  references: readonly string[];
}

export const TITLE_CATEGORIES = ["excellent", "good", "needs-improvement"] as const;
export type TitleCategory = (typeof TITLE_CATEGORIES)[number];

export const TITLE_CATEGORY_LABELS: Readonly<Record<TitleCategory, string>> = {
  excellent: "Excellent",
  good: "Good",
  "needs-improvement": "Needs improvement",
};

/** What each category means, shown with it. */
export const TITLE_CATEGORY_MEANINGS: Readonly<Record<TitleCategory, string>> = {
  excellent: "Every criterion is met or acceptable, and the title names what its pattern needs. It tells a reader what is studied, in whom, and how, without wasted words.",
  good: "The title is sound, with one or two points worth another look. None of them is about the title's core: what it studies and in whom.",
  "needs-improvement": "Several points, or a core one, need another look: the title leaves out something it needs, or its wording could mislead readers about the study.",
};

/** The criteria that decide whether a title says what the study is. */
export const CORE_CRITERIA: readonly CriterionId[] = ["clarity", "completeness", "variable-coverage", "population-coverage", "design-consistency"];

export interface TitleEvaluation {
  title: string;
  analysis: TitleAnalysis;
  keywords: KeywordPanel;
  pattern: PatternMatch | null;
  criteria: CriterionResult[];
  category: TitleCategory;
  /** Why the title is in its category, naming the criteria that decided it. */
  categoryReason: string;
  wordCount: number;
}

/** The limits of the engine, stated wherever it gives feedback. */
export const TITLE_LIMITATIONS: readonly string[] = [
  "It reads wording, not meaning. It recognises common patterns and word lists, so it can miss what a title means or misread an unusual one.",
  "It never rewrites your title or suggests wording. What to change is your decision, with your supervisor.",
  "It can't tell whether a title suits a particular journal, department or examiner. Their instructions come first.",
  "Its word-count bands are ResearchKit's rules of thumb, not a published standard. APA Style sets no word limit.",
];

const quote = (items: readonly string[]) => joinList(items.map((item) => `“${item}”`));
/** “a relationship study”, “an impact study”. */
const withArticle = (name: string) => `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}`;
const WHY_REFERENCES = {
  apa: ["apa-2020"],
  creswell: ["creswell-creswell-2018"],
  variables: ["sekaran-bougie-2013", "creswell-creswell-2018"],
  design: ["saunders-2019", "creswell-creswell-2018"],
} as const;

/** ResearchKit's word-count bands: prompts to check, not rules. */
export const LENGTH_BANDS = { tooShort: 5, short: 8, long: 20, tooLong: 25 } as const;

function result(id: CriterionId, status: CriterionStatus, finding: string, why: string, references: readonly string[] = []): CriterionResult {
  return { id, label: CRITERION_LABELS[id], status, finding, why, references };
}

const named = (keywords: readonly Keyword[]) => keywords.filter((keyword) => keyword.inTitle).map((keyword) => keyword.text);
const unnamed = (keywords: readonly Keyword[]) => keywords.filter((keyword) => !keyword.inTitle && keyword.source === "project").map((keyword) => keyword.text);

function hasElement(element: TitleElement, keywords: KeywordPanel): boolean {
  return named(keywords[element]).length > 0;
}

const GRAMMAR_WHY: Readonly<Record<GrammarIndicator["id"], string>> = {
  "repeated-word": "a word typed twice",
  "unbalanced-brackets": "a bracket without its pair",
  "unbalanced-quotes": "a quotation mark without its pair",
  "full-stop": "a full stop at the end, which titles leave out",
  "space-before-punctuation": "a space before punctuation",
  "missing-space": "punctuation without a space after it",
  "lowercase-start": "a title that starts in lower case",
  "all-capitals": "a title written entirely in capitals, which is harder to read",
  "doubled-punctuation": "doubled punctuation",
};

/** The design's name, and whether it can support a causal claim. */
function designFacts(project: ResearchProjectDraft): { design: ResearchDesign | null; methodology: string | null } {
  const chosen = project.researchDesign?.chosen;
  return { design: chosen ? getDesign(chosen) : null, methodology: project.methodology ?? null };
}

function designConsistency(analysis: TitleAnalysis, project: ResearchProjectDraft): CriterionResult {
  const { design, methodology } = designFacts(project);
  const why = "A title makes a promise about the kind of study. Causal words such as “effect” or “impact” promise evidence of cause, which only experimental designs support well; method words should match the design you use.";
  if (!design && !methodology) {
    if (analysis.causal.length > 0)
      return result("design-consistency", "adequate", `The title uses causal wording (${quote(analysis.causal)}), and no design has been chosen yet. When you choose one, check that it can show cause and effect.`, why, WHY_REFERENCES.design);
    return result("design-consistency", "not-applicable", "No research design or methodology has been chosen yet, so the title can't be compared with one.", why, WHY_REFERENCES.design);
  }
  const conflicts: string[] = [];
  if (design && analysis.causal.length > 0 && (design.traits.causality === "none" || design.traits.causality === "weak"))
    conflicts.push(`the title claims cause and effect (${quote(analysis.causal)}), but a ${design.name.toLowerCase()} design can't usually support a causal claim; words such as “relationship” or “association” describe what it can show`);
  const approaches = new Set(analysis.patterns.filter((match) => match.pattern.method).map((match) => match.pattern.approach));
  const emphasis = design?.traits.emphasis ?? (methodology === "qualitative" ? "qualitative" : methodology === "quantitative" ? "quantitative" : methodology === "mixed-methods" ? "mixed" : "either");
  for (const approach of approaches) {
    if (approach === "either" || emphasis === "either" || approach === emphasis) continue;
    const words = analysis.patterns.filter((match) => match.pattern.method && match.pattern.approach === approach).map((match) => match.wording);
    conflicts.push(`the title names a ${approach} method (${quote(words)}), but your ${design ? `design, ${design.name},` : "methodology"} is ${emphasis}`);
  }
  if (conflicts.length > 0) return result("design-consistency", "attention", `There is a mismatch: ${conflicts.join("; and ")}.`, why, WHY_REFERENCES.design);
  const methodWords = analysis.patterns.filter((match) => match.pattern.method).map((match) => match.wording);
  const against = design ? `your design, ${design.name}` : "your methodology";
  if (methodWords.length > 0) return result("design-consistency", "strength", `The method the title names (${quote(methodWords)}) fits ${against}.`, why, WHY_REFERENCES.design);
  return result("design-consistency", "adequate", `Nothing in the title's wording conflicts with ${against}. Naming the design is optional, and many titles leave it out.`, why, WHY_REFERENCES.design);
}

/** Every criterion, judged with its reasons, and the overall category. */
export function evaluateTitle(rawTitle: string, project: ResearchProjectDraft = {}): TitleEvaluation {
  const analysis = analyseTitle(rawTitle);
  const { title } = analysis;
  const keywords = extractKeywords(title, project);
  const pattern = primaryPattern(analysis.patterns);
  const wordCount = analysis.words.length;
  const criteria: CriterionResult[] = [];

  // Clarity: a recognisable structure and no words readers may take differently.
  {
    const why = "A clear title lets readers tell at once what the study is about. Recognisable structures, such as “relationship between … and …”, help; words with several meanings don't.";
    if (analysis.ambiguous.length > 0) criteria.push(result("clarity", "attention", `The title uses ${quote(analysis.ambiguous)}, which readers may understand in different ways.`, why, WHY_REFERENCES.apa));
    else if (pattern) criteria.push(result("clarity", "strength", `The title follows a recognisable pattern (${pattern.pattern.name.toLowerCase()}, “${pattern.wording}”), so readers can tell what kind of study it is.`, why, WHY_REFERENCES.apa));
    else criteria.push(result("clarity", "adequate", "No common title pattern was recognised. That can be fine, but check that a reader who knows nothing of your study can tell what it examines.", why, WHY_REFERENCES.apa));
  }

  // Specificity: how many of the study's elements the title names, and no sweeping scope words.
  {
    const why = "A specific title names what is studied, in whom and where, so readers know the study's scope before they read on.";
    const elements = (["independent", "dependent", "population", "location", "time"] as const).filter((element) => named(keywords[element]).length > 0);
    const labels = elements.map((element) => ({ independent: "a cause or predictor", dependent: "an outcome", population: "a population", location: "a place", time: "a time" })[element]);
    if (analysis.broad.length > 0) criteria.push(result("specificity", "attention", `${quote(analysis.broad)} ${analysis.broad.length === 1 ? "sets" : "set"} a scope wider than one study can cover.${labels.length > 0 ? ` The title does name ${joinList(labels)}.` : ""}`, why, WHY_REFERENCES.creswell));
    else if (elements.length >= 3) criteria.push(result("specificity", "strength", `The title names ${joinList(labels)}.`, why, WHY_REFERENCES.creswell));
    else if (elements.length === 2) criteria.push(result("specificity", "adequate", `The title names ${joinList(labels)}. Check whether readers also need to know ${elements.includes("population") ? "where the study takes place" : "who is studied"}.`, why, WHY_REFERENCES.creswell));
    else criteria.push(result("specificity", "attention", elements.length === 1 ? `The title names only ${labels[0]}, so readers can't tell the study's scope.` : "The title names none of the study's elements that could be recognised: a variable, a population, a place or a time.", why, WHY_REFERENCES.creswell));
  }

  // Brevity: words that serve no purpose.
  {
    const why = "APA Style advises leaving out words that serve no purpose, such as “A Study of”, because every title word should help readers find and understand the study.";
    const wasted = [...analysis.fillers, ...analysis.tautologies];
    if (wasted.length > 0) criteria.push(result("brevity", "attention", `${quote(wasted)} ${wasted.length === 1 ? "adds" : "add"} words without adding meaning.`, why, WHY_REFERENCES.apa));
    else criteria.push(result("brevity", "strength", "No filler openings or repeated meanings were found.", why, WHY_REFERENCES.apa));
  }

  // Completeness: what the title's own pattern needs.
  {
    const why = "Each kind of title needs particular elements: a relationship study needs both variables and the population, a phenomenological study needs the experience and who has it.";
    if (!pattern) {
      const has = (["dependent", "population"] as const).filter((element) => hasElement(element, keywords));
      criteria.push(result("completeness", has.length === 2 ? "adequate" : "attention", has.length === 2 ? "No pattern was recognised, but the title names an outcome and a population." : `No pattern was recognised, and the title doesn't clearly name ${has.includes("population") ? "what is studied" : "who is studied"}.`, why, WHY_REFERENCES.creswell));
    } else {
      const names = { independent: "the independent variable (the cause or predictor)", dependent: "the dependent variable (the outcome)", population: "the population" } as const;
      const missing = pattern.pattern.needs.filter((element) => !hasElement(element, keywords));
      if (missing.length === 0) criteria.push(result("completeness", "strength", `As ${withArticle(pattern.pattern.name.toLowerCase())}, the title needs ${joinList(pattern.pattern.needs.map((element) => names[element]))}, and it names each.`, why, WHY_REFERENCES.creswell));
      else criteria.push(result("completeness", "attention", `As ${withArticle(pattern.pattern.name.toLowerCase())}, the title needs ${joinList(pattern.pattern.needs.map((element) => names[element]))}. It doesn't clearly name ${joinList(missing.map((element) => names[element]))}.`, why, WHY_REFERENCES.creswell));
    }
  }

  // Academic tone.
  {
    const why = "Academic titles are neutral and impersonal: no first person, conversational words or exclamation marks, which can make a study sound less rigorous than it is.";
    const problems = [
      ...(analysis.informal.length > 0 ? [`conversational wording (${quote(analysis.informal)})`] : []),
      ...(analysis.firstPerson.length > 0 ? [`first-person words (${quote(analysis.firstPerson)})`] : []),
      ...(analysis.title.includes("!") ? ["an exclamation mark"] : []),
    ];
    if (problems.length > 0) criteria.push(result("academic-tone", "attention", `The title uses ${joinList(problems)}.`, why, ["bryman-2016"]));
    else if (analysis.title.includes("?")) criteria.push(result("academic-tone", "adequate", "The title is a question. Some fields accept question titles; others expect a statement, so check your department's or journal's practice.", why, ["bryman-2016"]));
    else criteria.push(result("academic-tone", "strength", "The wording is neutral and impersonal.", why, ["bryman-2016"]));
  }

  // Variable coverage.
  {
    const why = "Readers search for studies by their variables. Naming the independent and dependent variables tells them what the study relates; moderators and mediators are usually left to the abstract.";
    const core = [...keywords.independent, ...keywords.dependent];
    const projectCore = core.filter((keyword) => keyword.source === "project");
    const qualitative = pattern?.pattern.approach === "qualitative" || project.methodology === "qualitative";
    if (projectCore.length === 0) {
      const detected = named(core);
      if (detected.length > 0) criteria.push(result("variable-coverage", "adequate", `The wording suggests ${quote(detected)} as the title's variables. Add your variables to the project to check the title against them.`, why, WHY_REFERENCES.variables));
      else criteria.push(result("variable-coverage", qualitative ? "not-applicable" : "attention", qualitative ? "Qualitative titles name a phenomenon rather than variables, so this doesn't apply." : "No variables were found in the title or your project.", why, WHY_REFERENCES.variables));
    } else {
      const missing = unnamed(projectCore);
      const present = named(projectCore);
      if (missing.length === 0) criteria.push(result("variable-coverage", "strength", `The title names every independent and dependent variable in your project: ${quote(present)}.`, why, WHY_REFERENCES.variables));
      else if (present.length > 0) criteria.push(result("variable-coverage", "adequate", `The title names ${quote(present)} but not ${quote(missing)}. With many variables, titles often name the main ones; check that the ones left out are secondary.`, why, WHY_REFERENCES.variables));
      else criteria.push(result("variable-coverage", "attention", `The title names none of your project's independent or dependent variables (${quote(missing)}).`, why, WHY_REFERENCES.variables));
    }
  }

  // Population coverage.
  {
    const why = "The population tells readers whom the findings apply to, and whether the study is relevant to them.";
    const population = projectPopulation(project);
    const inTitle = named(keywords.population);
    if (population) criteria.push(inTitle.length > 0 ? result("population-coverage", "strength", `The title names your population, “${population}”.`, why, WHY_REFERENCES.creswell) : result("population-coverage", "attention", `Your project's population is “${population}”, which the title doesn't name.`, why, WHY_REFERENCES.creswell));
    else if (inTitle.length > 0) criteria.push(result("population-coverage", "adequate", `The wording suggests ${quote(inTitle)} as the population. Add the population to your project to check it.`, why, WHY_REFERENCES.creswell));
    else criteria.push(result("population-coverage", "attention", "No population was found in the title or your project. Every study is about someone or something.", why, WHY_REFERENCES.creswell));
  }

  // Location coverage: optional, but helpful when findings depend on setting.
  {
    const why = "Naming the place is optional, but it helps when findings depend on the setting, such as a country's education system. Some journals prefer places in the title; others leave them to the abstract.";
    const location = project.location;
    const inTitle = named(keywords.location);
    if (location) criteria.push(inTitle.length > 0 ? result("location-coverage", "strength", `The title names your location, “${location}”.`, why, WHY_REFERENCES.creswell) : result("location-coverage", "adequate", `Your project's location is “${location}”, which the title doesn't name. That is acceptable if the setting doesn't shape the findings.`, why, WHY_REFERENCES.creswell));
    else if (inTitle.length > 0) criteria.push(result("location-coverage", "adequate", `The title names ${quote(inTitle)} as a place. Add the location to your project to check it.`, why, WHY_REFERENCES.creswell));
    else criteria.push(result("location-coverage", "not-applicable", "No location is set in your project or named in the title. That is fine unless the setting matters to your findings.", why, WHY_REFERENCES.creswell));
  }

  criteria.push(designConsistency(analysis, project));

  // Grammar indicators.
  {
    const why = "Small slips in a title are the first thing examiners and editors notice. These are indicators to check, not a full grammar check.";
    if (analysis.grammar.length > 0) criteria.push(result("grammar", "attention", `The title has ${joinList(analysis.grammar.map((indicator) => `${GRAMMAR_WHY[indicator.id]} (${indicator.text})`))}.`, why, WHY_REFERENCES.apa));
    else criteria.push(result("grammar", "strength", "No grammar indicators were found: no doubled words, unpaired brackets or stray punctuation.", why, WHY_REFERENCES.apa));
  }

  // Abbreviations.
  {
    const why = "APA Style advises spelling out abbreviations in titles, because readers from other fields may not know them and search engines may not match them.";
    if (analysis.abbreviations.length > 0) criteria.push(result("abbreviations", "attention", `The title uses ${quote(analysis.abbreviations)}. Some, such as “HIV”, are widely known; check whether your readers would recognise each one.`, why, WHY_REFERENCES.apa));
    else criteria.push(result("abbreviations", "strength", "No abbreviations were found.", why, WHY_REFERENCES.apa));
  }

  // Ambiguous wording.
  {
    const why = "Words such as “effective”, “issues” or “current” mean different things to different readers, and “current” dates quickly. Naming what you mean makes the title precise.";
    if (analysis.ambiguous.length > 0) criteria.push(result("ambiguity", "attention", `${quote(analysis.ambiguous)} can be read in more than one way.`, why, ["kothari-2004"]));
    else criteria.push(result("ambiguity", "strength", "No ambiguous words were found.", why, ["kothari-2004"]));
  }

  // Jargon.
  {
    const why = "Fashionable business words sound impressive but tell readers little about the study. Established technical terms of your field are fine.";
    if (analysis.buzzwords.length > 0) criteria.push(result("jargon", "attention", `${quote(analysis.buzzwords)} ${analysis.buzzwords.length === 1 ? "is a buzzword" : "are buzzwords"} rather than a precise term.`, why, WHY_REFERENCES.apa));
    else criteria.push(result("jargon", "strength", "No buzzwords were found.", why, WHY_REFERENCES.apa));
  }

  // Length.
  {
    const why = `APA Style sets no word limit but asks for a focused, succinct title. ResearchKit flags titles under ${LENGTH_BANDS.tooShort} or over ${LENGTH_BANDS.tooLong} words as prompts to check.`;
    const count = `${wordCount} ${wordCount === 1 ? "word" : "words"}`;
    if (wordCount < LENGTH_BANDS.tooShort) criteria.push(result("length", "attention", `At ${count}, the title is probably too short to say what is studied and in whom.`, why, WHY_REFERENCES.apa));
    else if (wordCount < LENGTH_BANDS.short) criteria.push(result("length", "adequate", `At ${count}, the title is short. Check that it still names the main variables and the population.`, why, WHY_REFERENCES.apa));
    else if (wordCount <= LENGTH_BANDS.long) criteria.push(result("length", "strength", `At ${count}, the title is focused.`, why, WHY_REFERENCES.apa));
    else if (wordCount <= LENGTH_BANDS.tooLong) criteria.push(result("length", "adequate", `At ${count}, the title is long. Check whether every word is needed${analysis.hasSubtitle ? ", or whether the subtitle could move to the abstract" : ""}.`, why, WHY_REFERENCES.apa));
    else criteria.push(result("length", "attention", `At ${count}, the title is long enough that readers may lose its main idea.`, why, WHY_REFERENCES.apa));
  }

  // Keyword coverage: the question's and objectives' key words.
  {
    const why = "A title and a research question describe the same study, so the question's key words usually appear in the title. Readers who search for those words will then find it.";
    const source = [project.researchQuestion, ...(project.researchObjectives ?? [])].filter(Boolean).join(" ");
    if (!source) criteria.push(result("keyword-coverage", "not-applicable", "There is no research question or objective to compare the title with yet.", why, ["punch-2005"]));
    else {
      // The source's meaningful words, without repeats: the words it shares with itself.
      const key = sharedWords(source, source);
      const shared = sharedWords(source, title);
      const ratio = key.length === 0 ? 1 : shared.length / key.length;
      const detail = `The title shares ${shared.length} of the ${key.length} key words in your question and objectives${shared.length > 0 ? `: ${quote(shared)}` : ""}.`;
      criteria.push(result("keyword-coverage", ratio >= 0.5 ? "strength" : ratio >= 0.25 ? "adequate" : "attention", detail, why, ["punch-2005"]));
    }
  }

  const { category, reason } = categorise(criteria);
  return { title, analysis, keywords, pattern, criteria, category, categoryReason: reason, wordCount };
}

/** The overall category, and why: the criteria that decided it, by name. */
export function categorise(criteria: readonly CriterionResult[]): { category: TitleCategory; reason: string } {
  const attention = criteria.filter((criterion) => criterion.status === "attention");
  const core = attention.filter((criterion) => CORE_CRITERIA.includes(criterion.id));
  const names = (list: readonly CriterionResult[]) => joinList(list.map((criterion) => criterion.label.toLowerCase()));
  if (core.length > 0) return { category: "needs-improvement", reason: `A core criterion needs another look: ${names(core)}.${attention.length > core.length ? ` Also worth a look: ${names(attention.filter((criterion) => !core.includes(criterion)))}.` : ""}` };
  if (attention.length >= 3) return { category: "needs-improvement", reason: `${attention.length} criteria need another look: ${names(attention)}.` };
  if (attention.length > 0) return { category: "good", reason: `The core criteria are met. Worth another look: ${names(attention)}.` };
  return { category: "excellent", reason: "No criterion needs another look, and the core criteria (clarity, completeness, variables, population and design) are all met or acceptable." };
}
