/**
 * The title alignment engine: how the title sits with the rest of the project. A title
 * describes the study the problem, gap, question and objectives set up, so their key
 * words, variables, population and place should meet in it.
 *
 * Every finding quotes the researcher's own words and explains why it matters; none
 * suggests replacement wording.
 */

import { joinList, sharedWords } from "../question-text";
import type { ResearchProjectDraft } from "../research-project";
import { analyseTitle, type TitleAnalysis } from "./analyse";
import { extractKeywords, projectDesign, projectPopulation, projectVariables, titleNames, type KeywordPanel } from "./keywords";

export const ALIGNMENT_SOURCES = ["problem", "gap", "question", "objectives", "variables", "population", "location", "design"] as const;
export type AlignmentSource = (typeof ALIGNMENT_SOURCES)[number];

export const ALIGNMENT_SOURCE_LABELS: Readonly<Record<AlignmentSource, string>> = {
  problem: "Research problem",
  gap: "Research gap",
  question: "Research question",
  objectives: "Objectives",
  variables: "Variables",
  population: "Population",
  location: "Location",
  design: "Research design",
};

/**
 * - aligned: the title reflects this part of the project.
 * - partial: it reflects some of it.
 * - not-reflected: it doesn't reflect it.
 * - unavailable: the project doesn't have this part yet.
 */
export type AlignmentStatus = "aligned" | "partial" | "not-reflected" | "unavailable";

export const ALIGNMENT_STATUS_LABELS: Readonly<Record<AlignmentStatus, string>> = {
  aligned: "Reflected",
  partial: "Partly reflected",
  "not-reflected": "Not reflected",
  unavailable: "Not in your project yet",
};

export interface SourceAlignment {
  source: AlignmentSource;
  label: string;
  status: AlignmentStatus;
  explanation: string;
}

export const ALIGNMENT_ISSUE_IDS = [
  "missing-variables",
  "missing-population",
  "missing-location",
  "scope-mismatch",
  "overly-broad",
  "overly-narrow",
  "redundant-wording",
  "repeated-concepts",
] as const;
export type AlignmentIssueId = (typeof ALIGNMENT_ISSUE_IDS)[number];

export const ALIGNMENT_ISSUE_LABELS: Readonly<Record<AlignmentIssueId, string>> = {
  "missing-variables": "Missing variables",
  "missing-population": "Missing population",
  "missing-location": "Missing location",
  "scope-mismatch": "Scope mismatch",
  "overly-broad": "Overly broad",
  "overly-narrow": "Overly narrow",
  "redundant-wording": "Redundant wording",
  "repeated-concepts": "Repeated concepts",
};

export interface AlignmentIssue {
  id: AlignmentIssueId;
  label: string;
  /** What was found, quoting the title and project. */
  explanation: string;
  /** Why it matters. */
  why: string;
}

export interface TitleAlignment {
  sources: SourceAlignment[];
  issues: AlignmentIssue[];
}

const quote = (items: readonly string[]) => joinList(items.map((item) => `“${item}”`));

/** How much of a text's meaningful vocabulary the title shares. */
function textAlignment(source: AlignmentSource, text: string | undefined, title: string, purpose: string): SourceAlignment {
  const label = ALIGNMENT_SOURCE_LABELS[source];
  if (!text) return { source, label, status: "unavailable", explanation: `Your project has no ${label.toLowerCase()} yet.` };
  const key = sharedWords(text, text);
  const shared = sharedWords(text, title);
  if (shared.length === 0) return { source, label, status: "not-reflected", explanation: `The title shares none of the key words in your ${label.toLowerCase()}. ${purpose}` };
  const status: AlignmentStatus = shared.length >= Math.min(3, key.length) ? "aligned" : "partial";
  return { source, label, status, explanation: `The title shares ${quote(shared)} with your ${label.toLowerCase()}. ${purpose}` };
}

function listAlignment(source: AlignmentSource, values: readonly string[], title: string, noun: string): SourceAlignment {
  const label = ALIGNMENT_SOURCE_LABELS[source];
  if (values.length === 0) return { source, label, status: "unavailable", explanation: `Your project has no ${noun} yet.` };
  const present = values.filter((value) => titleNames(title, value));
  const absent = values.filter((value) => !titleNames(title, value));
  if (absent.length === 0) return { source, label, status: "aligned", explanation: `The title names ${quote(present)}.` };
  if (present.length === 0) return { source, label, status: "not-reflected", explanation: `The title doesn't name ${quote(absent)}.` };
  return { source, label, status: "partial", explanation: `The title names ${quote(present)} but not ${quote(absent)}.` };
}

/** How the title aligns with each part of the project, and the issues found between them. */
export function alignTitle(rawTitle: string, project: ResearchProjectDraft, analysis: TitleAnalysis = analyseTitle(rawTitle), keywords: KeywordPanel = extractKeywords(rawTitle, project)): TitleAlignment {
  const { title } = analysis;
  const coreVariables = [...projectVariables(project, "independent"), ...projectVariables(project, "dependent")];
  const population = projectPopulation(project);
  const design = projectDesign(project);
  const objectives = (project.researchObjectives ?? []).join(" ");

  const sources: SourceAlignment[] = [
    textAlignment("problem", project.researchProblem, title, "A title usually names the problem's central concept, so readers see what the study responds to."),
    textAlignment("gap", project.researchGap, title, "The gap is often what makes the study new, such as its population or setting; the title may reflect it."),
    textAlignment("question", project.researchQuestion, title, "The title and the question describe the same study, so they share its key terms."),
    textAlignment("objectives", objectives || undefined, title, "The objectives set out what the study will do; the title names what they share."),
    listAlignment("variables", coreVariables, title, "independent or dependent variables"),
    listAlignment("population", population ? [population] : [], title, "population"),
    listAlignment("location", project.location ? [project.location] : [], title, "location"),
    design
      ? { source: "design", label: ALIGNMENT_SOURCE_LABELS.design, status: titleNames(title, design) ? "aligned" : "partial", explanation: titleNames(title, design) ? `The title names your design, “${design}”.` : `The title doesn't name your design, “${design}”. That is common and acceptable; the criteria above check that its wording doesn't conflict with it.` }
      : { source: "design", label: ALIGNMENT_SOURCE_LABELS.design, status: "unavailable", explanation: "Your project has no research design yet." },
  ];

  const issues: AlignmentIssue[] = [];
  const add = (id: AlignmentIssueId, explanation: string, why: string) => issues.push({ id, label: ALIGNMENT_ISSUE_LABELS[id], explanation, why });

  const missingVariables = coreVariables.filter((value) => !titleNames(title, value));
  if (missingVariables.length > 0)
    add("missing-variables", `Your project's ${missingVariables.length === 1 ? "variable" : "variables"} ${quote(missingVariables)} ${missingVariables.length === 1 ? "isn't" : "aren't"} named in the title.`, "Readers and search engines find studies by their variables. If a variable is secondary, leaving it out may be deliberate.");
  if (population && !titleNames(title, population))
    add("missing-population", `Your population, “${population}”, isn't named in the title.`, "Without the population, readers can't tell whom the findings apply to.");
  if (project.location && !titleNames(title, project.location))
    add("missing-location", `Your location, “${project.location}”, isn't named in the title.`, "A place is optional, but it matters when the setting shapes the findings, as it often does in national education or health systems.");

  // Scope: the title's key words against the question's and objectives'.
  const reference = [project.researchQuestion, objectives].filter(Boolean).join(" ");
  if (reference) {
    const extra = sharedWords(title, title).filter((word) => sharedWords(word, reference).length === 0 && !analysis.fillers.some((filler) => filler.includes(word)));
    const narrowed = (["location", "time"] as const).filter((element) => keywords[element].some((keyword) => keyword.inTitle && keyword.source === "title") && project.researchQuestion && !keywords[element].some((keyword) => titleNames(project.researchQuestion!, keyword.text)));
    if (extra.length >= 3)
      add("scope-mismatch", `The title uses ${quote(extra)}, which ${extra.length === 1 ? "doesn't" : "don't"} appear in your question or objectives.`, "When the title introduces concepts the question doesn't study, readers expect findings the study won't give. Either may need to change.");
    if (narrowed.length > 0)
      add("overly-narrow", `The title limits the study by ${joinList(narrowed.map((element) => (element === "location" ? "place" : "time")))} (${quote(narrowed.flatMap((element) => keywords[element].filter((keyword) => keyword.inTitle).map((keyword) => keyword.text)))}), which your research question doesn't.`, "A title narrower than the question promises less than the study does, or suggests the question should be narrowed too.");
  }
  const broadReasons: string[] = [];
  if (analysis.broad.length > 0) broadReasons.push(`it uses ${quote(analysis.broad)}`);
  if (analysis.words.length > 0 && analysis.words.length < 5) broadReasons.push(`it is only ${analysis.words.length} ${analysis.words.length === 1 ? "word" : "words"} long`);
  if (!keywords.population.some((keyword) => keyword.inTitle) && !keywords.location.some((keyword) => keyword.inTitle) && analysis.words.length > 0) broadReasons.push("it names neither a population nor a place");
  if (broadReasons.length >= 2 || analysis.broad.length > 0)
    add("overly-broad", `The title reads as wider than one study: ${joinList(broadReasons)}.`, "A broad title promises more than a thesis or article can deliver, and examiners may ask why the study doesn't cover it all.");

  const wasted = [...analysis.fillers, ...analysis.tautologies];
  if (wasted.length > 0)
    add("redundant-wording", `${quote(wasted)} ${wasted.length === 1 ? "adds" : "add"} words without adding meaning.`, "Every word in a title should help a reader understand or find the study. APA Style advises against openings such as “A Study of”.");
  if (analysis.repeated.length > 0)
    add("repeated-concepts", `${quote(analysis.repeated)} ${analysis.repeated.length === 1 ? "appears" : "appear"} more than once.`, "Repeating a concept uses words the title could spend on something else. Sometimes repetition is needed for clarity, such as naming a group twice in a comparison.");

  return { sources, issues };
}
