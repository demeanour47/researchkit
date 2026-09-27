/**
 * Recognising what studies report in their own words. Designs, sampling techniques,
 * analyses and research-onion choices are matched to the catalogues the other research
 * tools use, so each carries the same explanation of when and why it is used. Data
 * collection methods and qualitative analyses the catalogues don't cover have short
 * descriptions here, awaiting the same academic review.
 */

import { ANALYSIS_METHOD_IDS, getAnalysisMethod, type AnalysisMethodId } from "../research/data-analysis-types";
import { DESIGN_IDS, getDesign, type DesignId } from "../research/design-types";
import { findOption } from "../research/research-onion";
import { SAMPLING_TECHNIQUE_IDS, getTechnique, type SamplingTechniqueId } from "../research/sampling-types";
import { fold } from "./query";

export type ConceptKind = "design" | "sampling" | "analysis" | "philosophy" | "approach" | "collection";

export interface Concept {
  kind: ConceptKind;
  id: string;
  label: string;
  /** Why researchers usually choose it, as a sentence. */
  why: string;
  /** What to keep in mind about it, as a sentence. */
  caution: string;
}

/** Aliases as patterns on folded text (lower case, no accents), most specific first within each kind. */
const DESIGN_ALIASES: readonly [DesignId, RegExp][] = [
  ["quasi-experimental", /\bquasi[- ]?experiment/],
  ["true-experimental", /\b(true[- ]experiment|randomi[sz]ed controlled|\brct\b)/],
  ["pre-experimental", /\bpre[- ]?experiment/],
  ["experimental", /\bexperiment/],
  ["cross-sectional", /\bcross[- ]?sectional/],
  ["longitudinal", /\b(longitudinal|panel (study|data|survey)|cohort)/],
  ["correlational", /\bcorrelational/],
  ["case-study", /\bcase stud/],
  ["phenomenology", /\bphenomenolog/],
  ["grounded-theory", /\bgrounded theory/],
  ["ethnography", /\bethnograph/],
  ["narrative-inquiry", /\bnarrative (inquiry|research)/],
  ["action-research", /\baction research/],
  ["historical", /\bhistorical (research|study|design)/],
  ["sequential-mixed", /\b(sequential|explanatory sequential|exploratory sequential)\b.*\bmixed|\bmixed\b.*\bsequential/],
  ["concurrent-mixed", /\b(concurrent|convergent|parallel)\b.*\bmixed|\bmixed\b.*\b(concurrent|convergent)/],
  ["embedded-mixed", /\bembedded\b.*\bmixed|\bmixed\b.*\bembedded/],
  ["survey", /\bsurvey/],
  ["descriptive", /\bdescriptive (design|study|research)|^descriptive$/],
  ["explanatory", /\bexplanatory (design|study|research)|^explanatory$/],
  ["exploratory", /\bexploratory (design|study|research)|^exploratory$/],
];

const SAMPLING_ALIASES: readonly [SamplingTechniqueId, RegExp][] = [
  ["stratified", /\bstratif/],
  ["cluster", /\bcluster/],
  ["multistage", /\bmulti[- ]?stage/],
  ["systematic", /\bsystematic (random )?sampl|^systematic$/],
  ["simple-random", /\b(simple random|random sampl|probability sampl)|^random$/],
  ["convenience", /\b(convenien|accidental|opportunit|availability sampl)/],
  ["purposive", /\b(purposive|purposeful)/],
  ["judgmental", /\b(judge?mental|expert sampl)/],
  ["quota", /\bquota/],
  ["snowball", /\b(snowball|chain[- ]referral|respondent[- ]driven)/],
  ["volunteer", /\b(volunteer|self[- ]select)/],
  ["consecutive", /\bconsecutive/],
  ["theoretical", /\btheoretical sampl/],
];

const ANALYSIS_ALIASES: readonly [AnalysisMethodId, RegExp][] = [
  ["pls-sem", /\b(pls[- ]?sem|partial least squares|smart ?pls)/],
  ["cb-sem", /\b(cb[- ]?sem|covariance[- ]based|amos|lisrel)/],
  ["sem", /\b(sem|structural equation)/],
  ["hierarchical-regression", /\bhierarchical (multiple )?regression/],
  ["multiple-regression", /\bmultiple (linear )?regression/],
  ["logistic-regression", /\blogistic/],
  ["simple-regression", /\bsimple (linear )?regression/],
  ["moderation", /\b(moderation|moderated|interaction effect)/],
  ["mediation", /\b(mediation|mediated|indirect effect|process macro)/],
  ["regression", /\b(regression|ols\b)/],
  ["paired-t-test", /\bpaired/],
  ["independent-t-test", /\b(independent[- ]samples? t|\bt[- ]tests?\b)/],
  ["repeated-measures-anova", /\brepeated[- ]measures/],
  ["two-way-anova", /\b(two|2)[- ]way anova|\bfactorial anova/],
  ["manova", /\bmanova/],
  ["ancova", /\bancova/],
  ["one-way-anova", /\banova/],
  ["chi-square", /\b(chi[- ]?squared?|χ ?2|χ²)/],
  ["fisher-exact", /\bfisher/],
  ["wilcoxon", /\bwilcoxon/],
  ["mann-whitney", /\bmann[- ]whitney/],
  ["kruskal-wallis", /\bkruskal/],
  ["factor-analysis", /\b(factor analysis|\befa\b|\bcfa\b|principal component)/],
  ["kmo", /\bkmo\b|kaiser[- ]meyer/],
  ["bartlett", /\bbartlett/],
  ["cronbach-alpha", /\bcronbach/],
  ["pearson", /\bpearson/],
  ["spearman", /\bspearman/],
  ["correlation", /\bcorrelation/],
  ["descriptive-statistics", /\bdescriptive stat/],
  ["frequency", /\bfrequenc/],
  ["percentage", /\bpercentage/],
];

/** Qualitative and review analyses the statistical catalogue doesn't cover. */
const EXTRA_ANALYSES: readonly [string, string, RegExp, string, string][] = [
  ["thematic-analysis", "Thematic analysis", /\bthematic/, "It finds and reports patterns of meaning across qualitative data such as interviews, and is flexible about theory.", "Its flexibility means studies must explain their coding clearly for readers to judge the themes."],
  ["content-analysis", "Content analysis", /\bcontent analys/, "It counts or categorises content in texts or media systematically, bridging qualitative and quantitative work.", "Counting categories can lose the context that gives words their meaning."],
  ["ipa", "Interpretative phenomenological analysis", /\b(interpretative phenomenological|\bipa\b)/, "It examines in depth how a few people make sense of a particular experience.", "Its small, homogeneous samples limit how far findings extend."],
  ["discourse-analysis", "Discourse analysis", /\bdiscourse analys/, "It studies how language constructs meaning, identities and power.", "It rests heavily on the analyst's interpretation."],
  ["narrative-analysis", "Narrative analysis", /\bnarrative analys/, "It studies the stories people tell to understand how they make sense of events.", "Stories are hard to compare across participants."],
  ["framework-analysis", "Framework analysis", /\bframework (analys|method)/, "It organises qualitative data in a matrix of cases and themes, which suits applied and policy research.", "The framework set early can narrow what the analysis notices."],
  ["meta-analysis", "Meta-analysis", /\bmeta[- ]?analys/, "It combines the results of several studies statistically to estimate an overall effect.", "Its conclusions depend on the quality and comparability of the studies combined."],
];

const COLLECTION: readonly [string, string, RegExp, string, string][] = [
  ["questionnaire", "Questionnaire or survey", /\b(questionnaire|survey)/, "Questionnaires reach many participants quickly and at low cost, giving standardised answers that can be compared.", "Self-reported answers can be affected by memory, social desirability and common method bias."],
  ["interview", "Interviews", /\binterview/, "Interviews explore experiences and reasons in depth, with room to follow up.", "They are time-consuming, so samples are usually small."],
  ["focus-group", "Focus groups", /\bfocus group/, "Focus groups gather several views at once and show how people discuss a topic together.", "Some participants may dominate or hold back in a group."],
  ["observation", "Observation", /\bobservation/, "Observation records what people actually do rather than what they report.", "Being observed can change behaviour."],
  ["secondary", "Secondary or archival data", /\b(secondary|archival|existing data|database|records|registry)/, "Secondary data offer large samples and long time spans without new data collection.", "The variables available may not match the study's concepts exactly."],
  ["documents", "Documents", /\b(document|policy texts?)/, "Documents show how organisations and policies frame an issue.", "Documents were written for other purposes and may be incomplete."],
  ["test", "Tests or measurements", /\b(tests?|assessment|measurement|scale scores?|physiological)/, "Tests and measurements give objective, comparable scores.", "A test measures only what it was designed to measure."],
];

const PHILOSOPHY_ALIASES: readonly [string, RegExp][] = [
  ["positivism", /\bpositiv/],
  ["interpretivism", /\b(interpretiv|constructiv)/],
  ["pragmatism", /\bpragmati/],
  ["realism", /\b(critical realis|realis)/],
];

const APPROACH_ALIASES: readonly [string, RegExp][] = [
  ["deductive", /\bdeduct/],
  ["inductive", /\binduct/],
  ["abductive", /\babduct/],
  ["mixed-methods", /\bmixed/],
  ["quantitative", /\bquantitativ/],
  ["qualitative", /\bqualitativ/],
];

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function onionConcept(kind: "philosophy" | "approach", id: string): Concept {
  const option = findOption(id)!;
  return { kind, id, label: option.name, why: `Researchers choose it ${lowerFirst(option.whyUsed)}`, caution: option.limitations[0] ?? "" };
}

/** The concept a piece of text names, or null. The most specific alias of the kind wins. */
export function matchConcept(kind: ConceptKind, text: string): Concept | null {
  const folded = fold(text);
  if (!folded) return null;
  switch (kind) {
    case "design": {
      const found = DESIGN_ALIASES.find(([, pattern]) => pattern.test(folded));
      if (!found) return null;
      const design = getDesign(found[0]);
      return { kind, id: design.id, label: design.name, why: `It is chosen ${lowerFirst(design.purpose)}`, caution: design.limitations[0] ?? "" };
    }
    case "sampling": {
      const found = SAMPLING_ALIASES.find(([, pattern]) => pattern.test(folded));
      if (!found) return null;
      const technique = getTechnique(found[0]);
      return { kind, id: technique.id, label: `${technique.name} sampling`.replace(/ sampling sampling$/, " sampling"), why: `It is typically used ${lowerFirst(technique.whenUsed)}`, caution: technique.limitations[0] ?? "" };
    }
    case "analysis": {
      const extra = EXTRA_ANALYSES.find(([, , pattern]) => pattern.test(folded));
      if (extra) return { kind, id: extra[0], label: extra[1], why: extra[3], caution: extra[4] };
      const found = ANALYSIS_ALIASES.find(([, pattern]) => pattern.test(folded));
      if (!found) return null;
      const method = getAnalysisMethod(found[0]);
      return { kind, id: method.id, label: method.name, why: `It ${lowerFirst(method.purpose)}`, caution: method.limitations[0] ?? "" };
    }
    case "philosophy":
    case "approach": {
      const found = (kind === "philosophy" ? PHILOSOPHY_ALIASES : APPROACH_ALIASES).find(([, pattern]) => pattern.test(folded));
      return found ? onionConcept(kind, found[0]) : null;
    }
    case "collection": {
      const found = COLLECTION.find(([, , pattern]) => pattern.test(folded));
      return found ? { kind, id: found[0], label: found[1], why: found[3], caution: found[4] } : null;
    }
  }
}

/**
 * Every concept a piece of text names. Designs can name several at once, such as a
 * “cross-sectional survey”; the general “experimental” gives way to a specific kind.
 * Other kinds name one concept, the most specific.
 */
export function matchConcepts(kind: ConceptKind, text: string): Concept[] {
  if (kind !== "design") {
    const concept = matchConcept(kind, text);
    return concept ? [concept] : [];
  }
  const folded = fold(text);
  const ids = DESIGN_ALIASES.filter(([, pattern]) => pattern.test(folded)).map(([id]) => id);
  const specific = ids.some((id) => id !== "experimental" && id.endsWith("experimental"));
  return ids
    .filter((id) => !(specific && id === "experimental"))
    .map((id) => {
      const design = getDesign(id);
      return { kind, id: design.id, label: design.name, why: `It is chosen ${lowerFirst(design.purpose)}`, caution: design.limitations[0] ?? "" };
    });
}

/** Every catalogue id each kind can match, for tests and documentation. */
export const KNOWN_IDS: Readonly<Record<ConceptKind, readonly string[]>> = {
  design: DESIGN_IDS,
  sampling: SAMPLING_TECHNIQUE_IDS,
  analysis: [...ANALYSIS_METHOD_IDS, ...EXTRA_ANALYSES.map(([id]) => id)],
  philosophy: PHILOSOPHY_ALIASES.map(([id]) => id),
  approach: APPROACH_ALIASES.map(([id]) => id),
  collection: COLLECTION.map(([id]) => id),
};

/** Whether a sampling technique is a probability technique, for generalisation gaps. */
export const isProbabilitySampling = (id: string) => (SAMPLING_TECHNIQUE_IDS as readonly string[]).includes(id) && getTechnique(id as SamplingTechniqueId).category === "probability";

// Terms that aren't in any catalogue: variables, theories, countries.

// Unicode property patterns are built with the constructor, as the test build targets ES2017.
const NOT_WORD = new RegExp("[^\\p{L}\\p{N}\\s'-]", "gu");
const CAPITALISED_THEORY = new RegExp("((?:[A-Z][\\p{L}'’-]*\\s+){1,5}(?:Theory|Model|Framework))\\b", "gu");
const THEORY_OF = new RegExp("\\b[Tt]heory of ((?:[\\p{L}'’-]+\\s?){1,4})", "gu");

/** A term reduced for counting: folded, without bracketed abbreviations or edge punctuation. “Technology Acceptance Model (TAM)” and “technology acceptance model” count as one. */
export const termKey = (term: string) =>
  fold(term)
    .replace(/\([^)]*\)/g, " ")
    .replace(NOT_WORD, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Theories and models named in running text: “Self-Determination Theory”, “the Technology Acceptance Model”, “theory of planned behaviour”. */
export function theoriesInText(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(CAPITALISED_THEORY)) {
    const name = match[1].replace(/^(The|A|An|This|Our|Using|Drawing|On|Based|In)\s+/g, "").trim();
    if (name.split(/\s+/).length >= 2) found.add(name);
  }
  for (const match of text.matchAll(THEORY_OF)) found.add(`Theory of ${match[1].trim().replace(/[.,;:]$/, "")}`);
  return [...found];
}
