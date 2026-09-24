/**
 * Types of research question, and how to recognise them from their wording.
 *
 * Types fall into two groups: by purpose (what the question asks, such as describing
 * or comparing) and by approach (the kind of data it implies). A question usually has
 * one of each. Recognition works on wording only: it reports the words that suggest a
 * type, so the researcher can see why, and it can be wrong.
 */

import type { QuestionElementId } from "./question-elements";

export const QUESTION_TYPE_IDS = [
  "descriptive",
  "comparative",
  "relational",
  "correlational",
  "explanatory",
  "exploratory",
  "predictive",
  "qualitative",
  "quantitative",
  "mixed-methods",
] as const;

export type QuestionTypeId = (typeof QUESTION_TYPE_IDS)[number];
export type QuestionDimension = "purpose" | "approach";

export interface QuestionType {
  id: QuestionTypeId;
  name: string;
  dimension: QuestionDimension;
  definition: string;
  /** Typical openings for this type of question. */
  stems: readonly string[];
  example: string;
  /** The elements a question of this type usually names. */
  needs: readonly QuestionElementId[];
  /** Something to keep in mind when using this type of question. */
  note: string;
  sources: readonly string[];
}

export const QUESTION_TYPES: readonly QuestionType[] = [
  {
    id: "descriptive",
    name: "Descriptive",
    dimension: "purpose",
    definition: "Asks what something is like: how common, how much, or what its characteristics are.",
    stems: ["What is the level of…", "How often…", "What are the characteristics of…"],
    example: "What is the level of physical activity among office workers in Leeds?",
    needs: ["dependentVariable", "population"],
    note: "A descriptive question tells you what is happening but not why. It is often a useful first question before a comparative or explanatory one.",
    sources: ["creswell-creswell-2018", "bryman-2016"],
  },
  {
    id: "comparative",
    name: "Comparative",
    dimension: "purpose",
    definition: "Asks how two or more groups, places or times differ on something.",
    stems: ["How does … differ between…", "What are the differences in … between…"],
    example: "How does reading attainment differ between pupils in rural and urban schools?",
    needs: ["independentVariable", "dependentVariable", "population"],
    note: "Name the groups you are comparing. A difference between groups doesn't by itself show what caused it.",
    sources: ["creswell-creswell-2018", "bryman-2016"],
  },
  {
    id: "relational",
    name: "Relational",
    dimension: "purpose",
    definition: "Asks whether and how two or more things are related.",
    stems: ["What is the relationship between … and…", "How is … related to…"],
    example: "What is the relationship between screen time and sleep quality among teenagers?",
    needs: ["independentVariable", "dependentVariable", "population"],
    note: "A relationship can be investigated with numbers or with words. State which, so the question points towards your method.",
    sources: ["creswell-creswell-2018", "white-2009"],
  },
  {
    id: "correlational",
    name: "Correlational",
    dimension: "purpose",
    definition: "Asks whether two measured variables vary together, and how strongly.",
    stems: ["To what extent is … associated with…", "Is there a correlation between … and…"],
    example: "To what extent are working hours associated with burnout among junior doctors?",
    needs: ["independentVariable", "dependentVariable", "population"],
    note: "Correlation doesn't show causation: two variables can move together because a third factor affects both.",
    sources: ["bryman-2016", "shadish-2002"],
  },
  {
    id: "explanatory",
    name: "Explanatory",
    dimension: "purpose",
    definition: "Asks why something happens, or how one thing influences another.",
    stems: ["Why…", "How does … influence…", "What is the effect of … on…"],
    example: "How does peer mentoring influence retention among first-year students?",
    needs: ["independentVariable", "dependentVariable", "population"],
    note: "Claims about causes need a design that can support them, such as an experiment or a longitudinal study, or a careful qualitative account of how the influence works.",
    sources: ["shadish-2002", "maxwell-2013"],
  },
  {
    id: "exploratory",
    name: "Exploratory",
    dimension: "purpose",
    definition: "Asks how people experience or understand something, usually where little is known.",
    stems: ["How do … experience…", "What are … perceptions of…", "How do … make sense of…"],
    example: "How do newly qualified teachers experience their first term?",
    needs: ["population"],
    note: "Exploratory questions stay open so that unexpected findings can emerge. They usually focus on a phenomenon rather than on variables.",
    sources: ["maxwell-2013", "creswell-creswell-2018"],
  },
  {
    id: "predictive",
    name: "Predictive",
    dimension: "purpose",
    definition: "Asks whether one or more factors can predict a later outcome.",
    stems: ["To what extent does … predict…", "Can … predict…"],
    example: "To what extent do first-year grades predict final degree classification?",
    needs: ["independentVariable", "dependentVariable", "population"],
    note: "Prediction needs the predictors to be measured before the outcome, which usually means a longitudinal design or existing records.",
    sources: ["bryman-2016", "menard-2002"],
  },
  {
    id: "qualitative",
    name: "Qualitative",
    dimension: "approach",
    definition: "A question answered with words, observations or images, focusing on meanings, experiences and processes.",
    stems: ["How do…", "What is it like to…", "In what ways…"],
    example: "In what ways do carers describe their access to respite care?",
    needs: ["population"],
    note: "Qualitative questions often change as the study develops. It is normal to refine them as you collect data.",
    sources: ["maxwell-2013", "creswell-creswell-2018"],
  },
  {
    id: "quantitative",
    name: "Quantitative",
    dimension: "approach",
    definition: "A question answered with numerical data, asking how much, how many or how strongly.",
    stems: ["How many…", "What is the level of…", "To what extent…"],
    example: "How many hours of paid work do full-time students do each week?",
    needs: ["dependentVariable", "population"],
    note: "Every concept in a quantitative question must be measurable. Plan how you will measure each one before you collect data.",
    sources: ["creswell-creswell-2018", "bryman-2016"],
  },
  {
    id: "mixed-methods",
    name: "Mixed methods",
    dimension: "approach",
    definition: "A question with a quantitative and a qualitative part, answered by combining both kinds of data.",
    stems: ["To what extent … and how…", "What is … and why…"],
    example: "To what extent does flexible working affect job satisfaction, and how do employees explain the effect?",
    needs: ["dependentVariable", "population"],
    note: "A mixed methods question should show how the two parts connect, not just list them.",
    sources: ["creswell-plano-clark-2018", "johnson-onwuegbuzie-2004"],
  },
];

export function getQuestionType(id: QuestionTypeId): QuestionType {
  const type = QUESTION_TYPES.find((candidate) => candidate.id === id);
  if (!type) throw new RangeError(`Unknown question type: ${id}`);
  return type;
}

interface Cue {
  pattern: RegExp;
  /** What the cue is, as shown to the researcher, such as `"relationship between"`. */
  label: string;
}

const cue = (label: string, pattern: RegExp): Cue => ({ label, pattern });

const PURPOSE_CUES: Record<Exclude<QuestionTypeId, "qualitative" | "quantitative" | "mixed-methods">, Cue[]> = {
  descriptive: [
    cue("“what is the level/rate/prevalence of”", /\bwhat (is|are) the (level|levels|rate|rates|prevalence|frequency|proportion|characteristics|patterns?|nature) of\b/i),
    cue("“how many / how much / how often”", /\bhow (many|much|often)\b/i),
  ],
  comparative: [
    cue("“compare”", /\bcompar(e|es|ed|ing|ison)\b/i),
    cue("“differ / difference”", /\bdiffer(s|ed|ence|ences)?\b/i),
    cue("“versus”", /\b(versus|vs)\b/i),
  ],
  relational: [
    cue("“relationship between”", /\brelationships? between\b/i),
    cue("“related to”", /\brelat(e|es|ed) to\b/i),
  ],
  correlational: [
    cue("“correlated / correlation”", /\bcorrelat(e|es|ed|ion|ions)\b/i),
    cue("“associated / association”", /\bassociat(ed|ion|ions)\b/i),
  ],
  explanatory: [
    cue("“why”", /\bwhy\b/i),
    cue("“effect / impact / influence of”", /\b(effects?|impacts?|influences?) of\b/i),
    cue("“affect / influence / cause”", /\b(affects?|affected|influences?|influenced|causes?|caused|leads? to|explains?)\b/i),
  ],
  exploratory: [
    cue("“experience”", /\bexperienc(e|es|ed|ing)\b/i),
    cue("“perceptions / perceive”", /\b(perceptions?|perceives?|perceived)\b/i),
    cue("“make sense of / meaning”", /\b(make sense of|makes sense of|meanings?)\b/i),
    cue("“explore”", /\bexplor(e|es|ed|ing)\b/i),
  ],
  predictive: [
    cue("“predict”", /\bpredict(s|ed|ion|ions|ive|or|ors)?\b/i),
    cue("“likelihood / forecast”", /\b(likelihood|forecasts?)\b/i),
  ],
};

const QUALITATIVE_CUES: Cue[] = [
  cue("“experience”", /\bexperienc(e|es|ed|ing)\b/i),
  cue("“perceptions / perceive”", /\b(perceptions?|perceives?|perceived)\b/i),
  cue("“meaning / make sense of”", /\b(meanings?|make sense of|makes sense of)\b/i),
  cue("“understand”", /\bunderstand(s|ing)?\b/i),
  cue("“views / beliefs / feelings”", /\b(views?|beliefs?|feelings?|attitudes? towards)\b/i),
  cue("“how do … describe / explain”", /\bhow do [\w' -]+? (describe|explain|interpret|view)\b/i),
  cue("“in what ways”", /\bin what ways\b/i),
];

const QUANTITATIVE_CUES: Cue[] = [
  cue("“how many / how much / how often”", /\bhow (many|much|often)\b/i),
  cue("“level / rate / prevalence”", /\b(levels?|rates?|prevalence|percentage|proportion|frequency|scores?)\b/i),
  cue("“correlated / associated”", /\b(correlat\w*|associated)\b/i),
  cue("“predict”", /\bpredict\w*\b/i),
  cue("“effect of / impact of”", /\b(effects?|impacts?) of\b/i),
  cue("“to what extent”", /\bto what extent\b/i),
  cue("“significant”", /\bsignificant(ly)?\b/i),
];

export interface TypeDetection {
  type: QuestionTypeId;
  /** The wording that suggested the type. */
  cues: string[];
  reason: string;
}

const matching = (cues: Cue[], text: string) => cues.filter((candidate) => candidate.pattern.test(text)).map((candidate) => candidate.label);

/** The purpose and approach types the wording suggests, each with the words that suggested it. */
export function detectQuestionTypes(question: string): TypeDetection[] {
  const detections: TypeDetection[] = [];
  for (const [type, cues] of Object.entries(PURPOSE_CUES) as [QuestionTypeId, Cue[]][]) {
    const found = matching(cues, question);
    if (found.length > 0) {
      detections.push({ type, cues: found, reason: `The wording ${found.join(", ")} is typical of ${article(type)} ${getQuestionType(type).name.toLowerCase()} question.` });
    }
  }

  const qualitative = matching(QUALITATIVE_CUES, question);
  const quantitative = matching(QUANTITATIVE_CUES, question);
  if (qualitative.length > 0 && quantitative.length > 0) {
    detections.push({
      type: "mixed-methods",
      cues: [...quantitative, ...qualitative],
      reason: `The question combines quantitative wording (${quantitative.join(", ")}) with qualitative wording (${qualitative.join(", ")}).`,
    });
  } else if (qualitative.length > 0) {
    detections.push({ type: "qualitative", cues: qualitative, reason: `The wording ${qualitative.join(", ")} is typical of qualitative questions about meanings and experiences.` });
  } else if (quantitative.length > 0) {
    detections.push({ type: "quantitative", cues: quantitative, reason: `The wording ${quantitative.join(", ")} is typical of quantitative questions about amounts and measurable relationships.` });
  }
  return detections;
}

const article = (type: QuestionTypeId) => (/^[aeiou]/.test(type) ? "an" : "a");

/** The approach a question's wording suggests, or null when there is no clear signal. */
export function detectApproach(question: string): "qualitative" | "quantitative" | "mixed-methods" | null {
  const approach = detectQuestionTypes(question).find((detection) => getQuestionType(detection.type).dimension === "approach");
  return (approach?.type as "qualitative" | "quantitative" | "mixed-methods" | undefined) ?? null;
}
