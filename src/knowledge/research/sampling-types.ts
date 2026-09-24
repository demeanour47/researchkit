/**
 * Sampling techniques: what each is, when it is used, and the traits the
 * compatibility checks and decision assistant compare. Standard textbook content
 * awaiting sampling methodology review. References are left empty until chosen at
 * review; none are invented.
 */

import type { DesignId } from "./design-types";
import type { OnionFit } from "./design-types";

export const SAMPLING_TECHNIQUE_IDS = [
  "simple-random",
  "systematic",
  "stratified",
  "cluster",
  "multistage",
  "convenience",
  "purposive",
  "judgmental",
  "quota",
  "snowball",
  "volunteer",
  "consecutive",
  "theoretical",
] as const;
export type SamplingTechniqueId = (typeof SAMPLING_TECHNIQUE_IDS)[number];

export type SamplingCategory = "probability" | "non-probability";

export const SAMPLING_CATEGORY_LABELS: Readonly<Record<SamplingCategory, string>> = {
  probability: "Probability sampling",
  "non-probability": "Non-probability sampling",
};

/** Traits the decision assistant and compatibility checks compare. */
export interface SamplingTraits {
  /** What list the technique needs before selection. */
  frame: "individuals" | "clusters" | "none";
  /** Whether it suits populations whose members are hard to identify. */
  hiddenPopulations: "suited" | "neutral" | "unsuited";
  representativeness: "high" | "moderate" | "low";
  /** How it is used in qualitative research: only there, typically, possibly, or unusually. */
  qualitative: "only" | "typical" | "possible" | "unusual";
  /** Whether participants recruit other participants. */
  referral: "yes" | "possible" | "no";
  /** Whether the variables need categories to divide the population into groups. */
  needsGroups: boolean;
}

export interface SamplingTechnique {
  id: SamplingTechniqueId;
  name: string;
  category: SamplingCategory;
  definition: string;
  whenUsed: string;
  strengths: readonly string[];
  limitations: readonly string[];
  assumptions: readonly string[];
  commonSampleSizes: string;
  examples: readonly string[];
  representativeness: string;
  biasRisk: string;
  resources: string;
  time: string;
  /** Research designs the technique is commonly used with. */
  typicalDesigns: readonly DesignId[];
  traits: SamplingTraits;
  onion: OnionFit;
  /** Words in objectives that suggest the technique's purpose. */
  objectiveCues: RegExp;
  /** Reference ids, empty until academic review. */
  references: readonly string[];
}

const PROBABILITY_ONION: OnionFit = {
  philosophy: { typical: ["positivism"], possible: ["realism", "pragmatism"] },
  approach: { typical: ["deductive"], possible: ["abductive", "inductive"] },
  choice: { typical: ["quantitative"], possible: ["mixed-methods", "multi-method"] },
  strategy: { typical: ["survey"], possible: ["experiment", "archival-research", "case-study"] },
  timeHorizon: { typical: ["cross-sectional", "longitudinal"] },
};
const QUALITATIVE_ONION: OnionFit = {
  philosophy: { typical: ["interpretivism"], possible: ["pragmatism", "realism"] },
  approach: { typical: ["inductive"], possible: ["abductive"] },
  choice: { typical: ["qualitative"], possible: ["mixed-methods", "multi-method"] },
  strategy: {
    typical: ["case-study", "phenomenology", "grounded-theory", "ethnography", "narrative-inquiry", "action-research"],
    possible: ["archival-research", "survey"],
  },
  timeHorizon: { typical: ["cross-sectional", "longitudinal"] },
};
const ANY_ONION: OnionFit = {
  philosophy: { typical: [], possible: ["positivism", "interpretivism", "pragmatism", "realism"] },
  approach: { typical: [], possible: ["deductive", "inductive", "abductive"] },
  choice: { typical: [], possible: ["quantitative", "qualitative", "mixed-methods", "multi-method"] },
  strategy: { typical: [], possible: ["experiment", "survey", "case-study", "ethnography", "grounded-theory", "action-research", "narrative-inquiry", "phenomenology", "archival-research"] },
  timeHorizon: { typical: ["cross-sectional", "longitudinal"] },
};

const PROBABILITY_DESIGNS: readonly DesignId[] = ["survey", "correlational", "cross-sectional", "longitudinal", "descriptive", "explanatory", "sequential-mixed", "concurrent-mixed"];
const QUALITATIVE_DESIGNS: readonly DesignId[] = [
  "case-study",
  "phenomenology",
  "narrative-inquiry",
  "ethnography",
  "action-research",
  "historical",
  "exploratory",
  "sequential-mixed",
  "embedded-mixed",
];
const GENERALISE_CUES = /\b(generalis\w*|generaliz\w*|estimat\w*|prevalence|population|represent\w*|proportion|how many|levels?)\b/i;
const EXPLORE_CUES = /\b(explor\w*|understand\w*|experienc\w*|perceptions?|meanings?|in depth|insights?)\b/i;
const PROBABILITY_TRAITS: SamplingTraits = { frame: "individuals", hiddenPopulations: "unsuited", representativeness: "high", qualitative: "unusual", referral: "no", needsGroups: false };

export const SAMPLING_TECHNIQUES: readonly SamplingTechnique[] = [
  {
    id: "simple-random",
    name: "Simple random",
    category: "probability",
    definition: "Every member of the population has an equal chance of being selected, and participants are chosen at random from a complete list.",
    whenUsed: "When a complete list of the population exists and findings need to be generalised to it.",
    strengths: ["Selection is free from researcher bias.", "Supports statistical inference about the population."],
    limitations: ["Needs a complete, accurate list of the population.", "Small subgroups may be missed or under-represented by chance."],
    assumptions: ["The sampling frame lists every member of the population.", "The people who take part don't differ systematically from those who decline."],
    commonSampleSizes: "Set by a sample size calculation for the estimate or test the study needs.",
    examples: ["Randomly selecting 300 students from a university's enrolment list."],
    representativeness: "High, provided the frame is complete and most selected people take part.",
    biasRisk: "Low selection bias; non-response can still introduce bias.",
    resources: "Moderate; higher if the population is spread over a wide area.",
    time: "Moderate.",
    typicalDesigns: PROBABILITY_DESIGNS,
    traits: PROBABILITY_TRAITS,
    onion: PROBABILITY_ONION,
    objectiveCues: GENERALISE_CUES,
    references: [],
  },
  {
    id: "systematic",
    name: "Systematic",
    category: "probability",
    definition: "Every kth member of an ordered list is selected, after a random starting point.",
    whenUsed: "When a complete list exists and a simpler procedure than random number selection is wanted.",
    strengths: ["Simple to carry out.", "Spreads the sample evenly across the list."],
    limitations: ["Needs a complete list.", "Biased if the list has a repeating pattern that matches the interval."],
    assumptions: ["The order of the list isn't related to what the study measures."],
    commonSampleSizes: "Set by a sample size calculation; the interval is the population size divided by the sample size.",
    examples: ["Selecting every 20th patient record, starting from a randomly chosen record."],
    representativeness: "High, if the list has no hidden pattern.",
    biasRisk: "Low, unless the list's order follows a cycle.",
    resources: "Low to moderate.",
    time: "Low to moderate.",
    typicalDesigns: PROBABILITY_DESIGNS,
    traits: PROBABILITY_TRAITS,
    onion: PROBABILITY_ONION,
    objectiveCues: GENERALISE_CUES,
    references: [],
  },
  {
    id: "stratified",
    name: "Stratified",
    category: "probability",
    definition: "The population is divided into non-overlapping subgroups (strata), such as year groups, and a random sample is drawn from each.",
    whenUsed: "When subgroups must be represented, or compared, and each member's subgroup is known in advance.",
    strengths: ["Ensures every subgroup is represented.", "Can give more precise estimates than a simple random sample of the same size."],
    limitations: ["Needs to know each member's subgroup before sampling.", "Unequal sampling across strata requires weighting in the analysis."],
    assumptions: ["Every member belongs to exactly one stratum.", "The characteristic used for the strata is recorded in the sampling frame."],
    commonSampleSizes: "Set by a sample size calculation, allocated across strata in proportion or by design.",
    examples: ["Sampling students randomly within each faculty, in proportion to faculty size."],
    representativeness: "High, including for the subgroups used as strata.",
    biasRisk: "Low selection bias.",
    resources: "Moderate: the frame must record the stratifying characteristic.",
    time: "Moderate.",
    typicalDesigns: PROBABILITY_DESIGNS,
    traits: { ...PROBABILITY_TRAITS, needsGroups: true },
    onion: PROBABILITY_ONION,
    objectiveCues: /\b(compar\w*|subgroups?|groups?|between|differ\w*)\b|\b(generalis\w*|represent\w*|population)\b/i,
    references: [],
  },
  {
    id: "cluster",
    name: "Cluster",
    category: "probability",
    definition: "The population is divided into naturally occurring groups (clusters), such as schools or towns. Clusters are selected at random, and everyone in the chosen clusters is included.",
    whenUsed: "When the population is spread widely, or there is a list of groups but not of individuals.",
    strengths: ["Practical and cheaper for widely spread populations.", "Needs a list of clusters rather than of every individual."],
    limitations: ["Less precise than a simple random sample of the same size, because members of a cluster tend to be alike.", "The analysis must account for clustering."],
    assumptions: ["Clusters are broadly similar to each other.", "A complete list of clusters exists."],
    commonSampleSizes: "Larger than a simple random sample for the same precision, because of clustering.",
    examples: ["Randomly selecting 15 schools and surveying every teacher in them."],
    representativeness: "High, if enough clusters are selected.",
    biasRisk: "Low selection bias; precision is reduced by similarity within clusters.",
    resources: "Lower than simple random sampling for spread-out populations.",
    time: "Moderate.",
    typicalDesigns: [...PROBABILITY_DESIGNS, "quasi-experimental"],
    traits: { ...PROBABILITY_TRAITS, frame: "clusters" },
    onion: PROBABILITY_ONION,
    objectiveCues: /\b(schools?|regions?|organisations?|organizations?|communities|areas?|sites?)\b|\b(generalis\w*|represent\w*|population)\b/i,
    references: [],
  },
  {
    id: "multistage",
    name: "Multistage",
    category: "probability",
    definition: "Sampling happens in stages, such as selecting regions, then schools within them, then pupils within those schools, at random at each stage.",
    whenUsed: "For large, widely spread populations where no single list exists.",
    strengths: ["Practical for national or large-scale studies.", "Lists are only needed at each stage, not for the whole population."],
    limitations: ["Complex to design and analyse.", "Sampling error builds up at each stage."],
    assumptions: ["A list exists at each stage.", "Random selection is used at every stage."],
    commonSampleSizes: "Often large; set by a sample size calculation that allows for each stage.",
    examples: ["Selecting districts, then households, then one adult per household for a national survey."],
    representativeness: "High, if every stage is random and response is good.",
    biasRisk: "Low selection bias; error accumulates across stages.",
    resources: "High overall, but lower than listing the whole population.",
    time: "High.",
    typicalDesigns: PROBABILITY_DESIGNS,
    traits: { ...PROBABILITY_TRAITS, frame: "clusters" },
    onion: PROBABILITY_ONION,
    objectiveCues: /\b(national\w*|regional|large[- ]scale|across)\b|\b(generalis\w*|represent\w*|population)\b/i,
    references: [],
  },
  {
    id: "convenience",
    name: "Convenience",
    category: "non-probability",
    definition: "Participants are chosen because they are easy to reach, such as students in the researcher's own class.",
    whenUsed: "In pilot studies, exploratory work, or when time and access are very limited.",
    strengths: ["Quick and inexpensive.", "Useful for piloting instruments and procedures."],
    limitations: ["The sample is unlikely to represent the population.", "Findings can't be generalised statistically."],
    assumptions: ["The people easiest to reach are similar enough to the population for the study's purpose."],
    commonSampleSizes: "Varies widely; often whoever is available in the time.",
    examples: ["Surveying students who pass through the library on one afternoon."],
    representativeness: "Low.",
    biasRisk: "High: those easy to reach may differ from everyone else.",
    resources: "Low.",
    time: "Low.",
    typicalDesigns: ["pre-experimental", "exploratory", "survey", "quasi-experimental"],
    traits: { frame: "none", hiddenPopulations: "neutral", representativeness: "low", qualitative: "possible", referral: "possible", needsGroups: false },
    onion: ANY_ONION,
    objectiveCues: /\b(pilot\w*|test\w* the (questionnaire|instrument)|feasib\w*|preliminary)\b/i,
    references: [],
  },
  {
    id: "purposive",
    name: "Purposive",
    category: "non-probability",
    definition: "Participants are deliberately chosen because they have characteristics or experience relevant to the research question.",
    whenUsed: "In qualitative research, where information-rich cases matter more than representativeness.",
    strengths: ["Focuses on people who can answer the question in depth.", "Allows deliberate variety, such as contrasting cases."],
    limitations: ["Depends on the researcher's judgement, which can introduce bias.", "Findings can't be generalised statistically."],
    assumptions: ["The researcher can identify who holds relevant experience.", "The selection criteria can be stated and justified."],
    commonSampleSizes: "Usually small; sampling continues until the question is answered in enough depth.",
    examples: ["Interviewing nurses who have worked night shifts for at least a year."],
    representativeness: "Low statistically, but chosen for relevance.",
    biasRisk: "Moderate: selection reflects the researcher's criteria and judgement.",
    resources: "Low to moderate.",
    time: "Low to moderate.",
    typicalDesigns: QUALITATIVE_DESIGNS,
    traits: { frame: "none", hiddenPopulations: "neutral", representativeness: "low", qualitative: "typical", referral: "possible", needsGroups: false },
    onion: QUALITATIVE_ONION,
    objectiveCues: EXPLORE_CUES,
    references: [],
  },
  {
    id: "judgmental",
    name: "Judgmental",
    category: "non-probability",
    definition:
      "Participants are chosen by the researcher's, or experts', judgement of who is most typical or most knowledgeable. Many texts treat it as another name for purposive sampling.",
    whenUsed: "When expert judgement is needed to identify typical or key cases, such as selecting representative schools.",
    strengths: ["Draws on expert knowledge of the population.", "Quick when experts are available."],
    limitations: ["Relies heavily on the judgement of whoever selects.", "Findings can't be generalised statistically."],
    assumptions: ["The person judging knows the population well.", "Their judgement of what is typical is sound."],
    commonSampleSizes: "Usually small.",
    examples: ["Asking a head of department to nominate the most experienced teachers."],
    representativeness: "Low statistically; depends on the quality of the judgement.",
    biasRisk: "Moderate to high: selection reflects one person's view.",
    resources: "Low.",
    time: "Low.",
    typicalDesigns: QUALITATIVE_DESIGNS,
    traits: { frame: "none", hiddenPopulations: "neutral", representativeness: "low", qualitative: "typical", referral: "possible", needsGroups: false },
    onion: QUALITATIVE_ONION,
    objectiveCues: /\b(experts?|key informants?|typical|experienced)\b|\b(explor\w*|understand\w*)\b/i,
    references: [],
  },
  {
    id: "quota",
    name: "Quota",
    category: "non-probability",
    definition: "Participants are recruited, not at random, until set numbers (quotas) in each category are filled, usually in proportion to the population.",
    whenUsed: "When categories should be represented in proportion, but no list exists for random sampling.",
    strengths: ["Ensures each category is represented.", "Quicker and cheaper than stratified sampling."],
    limitations: ["Selection within each quota isn't random, so bias remains.", "Needs to know the population's proportions."],
    assumptions: ["The proportions of each category in the population are known.", "People selected within each quota are similar to the rest of their category."],
    commonSampleSizes: "Set by quotas proportional to the population's characteristics.",
    examples: ["Interviewing shoppers until 50 men and 50 women in each of three age groups have taken part."],
    representativeness: "Moderate: matches known proportions, but selection isn't random.",
    biasRisk: "Moderate: interviewers may choose the easiest people within each quota.",
    resources: "Low to moderate.",
    time: "Low to moderate.",
    typicalDesigns: ["survey", "cross-sectional", "descriptive"],
    traits: { frame: "none", hiddenPopulations: "unsuited", representativeness: "moderate", qualitative: "unusual", referral: "no", needsGroups: true },
    onion: { ...PROBABILITY_ONION, strategy: { typical: ["survey"] } },
    objectiveCues: /\b(groups?|categor\w*|proportion\w*|compar\w*)\b/i,
    references: [],
  },
  {
    id: "snowball",
    name: "Snowball",
    category: "non-probability",
    definition: "Initial participants recruit further participants from among people they know, so the sample grows through their networks.",
    whenUsed: "When the population is hidden or hard to reach, such as people in stigmatised groups.",
    strengths: ["Reaches people who couldn't be found otherwise.", "Trust within networks can help recruitment."],
    limitations: ["The sample reflects the first participants' networks, so similar people are recruited.", "Findings can't be generalised statistically."],
    assumptions: ["Members of the population know one another.", "Participants are willing to refer others."],
    commonSampleSizes: "Varies; often small to moderate.",
    examples: ["Recruiting informal carers, each of whom introduces other carers they know."],
    representativeness: "Low.",
    biasRisk: "High: people outside the networks are missed.",
    resources: "Low.",
    time: "Moderate: recruitment depends on referrals.",
    typicalDesigns: ["ethnography", "narrative-inquiry", "phenomenology", "grounded-theory", "exploratory", "case-study"],
    traits: { frame: "none", hiddenPopulations: "suited", representativeness: "low", qualitative: "typical", referral: "yes", needsGroups: false },
    onion: QUALITATIVE_ONION,
    objectiveCues: /\b(hidden|hard[- ]to[- ]reach|marginali\w*|stigma\w*|networks?)\b|\b(explor\w*|experienc\w*)\b/i,
    references: [],
  },
  {
    id: "volunteer",
    name: "Volunteer",
    category: "non-probability",
    definition: "People choose to take part in response to an invitation, such as an advertisement or an email to a mailing list. Also called self-selection sampling.",
    whenUsed: "When a study is advertised widely, or participation needs strong commitment.",
    strengths: ["Participants are willing and motivated.", "Easy to recruit through adverts and online."],
    limitations: ["Volunteers often differ from people who don't volunteer.", "Findings can't be generalised statistically."],
    assumptions: ["Volunteers don't differ from the population in ways that matter to the study."],
    commonSampleSizes: "Varies with the reach of the invitation.",
    examples: ["Recruiting participants through posters for a study of exercise habits."],
    representativeness: "Low.",
    biasRisk: "High: self-selection bias.",
    resources: "Low.",
    time: "Low to moderate.",
    typicalDesigns: ["experimental", "true-experimental", "quasi-experimental", "survey", "exploratory"],
    traits: { frame: "none", hiddenPopulations: "neutral", representativeness: "low", qualitative: "possible", referral: "possible", needsGroups: false },
    onion: ANY_ONION,
    objectiveCues: /\b(interventions?|trials?|participat\w*|volunteer\w*)\b/i,
    references: [],
  },
  {
    id: "consecutive",
    name: "Consecutive",
    category: "non-probability",
    definition: "Every eligible person who presents during a set period is invited, such as all patients attending a clinic over three months.",
    whenUsed: "In clinical and service settings, where eligible people arrive over time.",
    strengths: ["Reduces the researcher's own selection bias compared with convenience sampling.", "Fits naturally into routine settings."],
    limitations: ["Depends on who attends during the period.", "Seasonal or time-related patterns can bias the sample."],
    assumptions: ["The people attending during the period are typical of those attending at other times."],
    commonSampleSizes: "Everyone eligible during the period; the period is set to reach the size needed.",
    examples: ["Inviting every new patient at a diabetes clinic between January and March."],
    representativeness: "Moderate for the people who use the setting; low beyond it.",
    biasRisk: "Moderate: depends on the period and the setting.",
    resources: "Low to moderate.",
    time: "Moderate: set by the recruitment period.",
    typicalDesigns: ["quasi-experimental", "pre-experimental", "longitudinal", "descriptive", "cross-sectional"],
    traits: { frame: "none", hiddenPopulations: "neutral", representativeness: "moderate", qualitative: "possible", referral: "no", needsGroups: false },
    onion: { ...PROBABILITY_ONION, strategy: { typical: ["survey", "experiment"], possible: ["case-study"] } },
    objectiveCues: /\b(patients?|clinics?|admissions?|attend\w*|services?)\b/i,
    references: [],
  },
  {
    id: "theoretical",
    name: "Theoretical",
    category: "non-probability",
    definition: "In grounded theory, participants or sites are chosen according to the concepts emerging from the analysis, and sampling continues until new data add little (saturation).",
    whenUsed: "In grounded theory studies, where sampling and analysis happen together.",
    strengths: ["Directs data collection to where it best develops the theory.", "Supports a well-grounded theory."],
    limitations: ["The sample can't be fully planned in advance.", "Needs analysis to run alongside data collection."],
    assumptions: ["Analysis happens alongside data collection.", "Saturation can be recognised and justified."],
    commonSampleSizes: "Not fixed in advance; sampling continues until saturation.",
    examples: ["Interviewing newly qualified managers, then experienced managers once a concept about confidence emerges."],
    representativeness: "Not the aim: chosen to develop theory.",
    biasRisk: "Moderate: guided by the emerging analysis, which should be documented.",
    resources: "Moderate.",
    time: "High: collection and analysis alternate.",
    typicalDesigns: ["grounded-theory"],
    traits: { frame: "none", hiddenPopulations: "neutral", representativeness: "low", qualitative: "only", referral: "possible", needsGroups: false },
    onion: { ...QUALITATIVE_ONION, strategy: { typical: ["grounded-theory"] } },
    objectiveCues: /\b(theor\w*|develop\w*|process\w*)\b/i,
    references: [],
  },
];

export function getTechnique(id: SamplingTechniqueId): SamplingTechnique {
  const technique = SAMPLING_TECHNIQUES.find((candidate) => candidate.id === id);
  if (!technique) throw new RangeError(`Unknown sampling technique: ${id}`);
  return technique;
}

export const isTechniqueId = (id: string): id is SamplingTechniqueId => (SAMPLING_TECHNIQUE_IDS as readonly string[]).includes(id);
