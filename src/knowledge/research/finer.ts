/**
 * The FINER criteria for a good research question: Feasible, Interesting, Novel,
 * Ethical and Relevant (Hulley et al., 2013).
 *
 * Each criterion gets a judgement in words and its reasons, never a score. Some
 * criteria can't be judged from wording at all, and say so: only the researcher and
 * their supervisor can judge whether a question is interesting or novel.
 */

import type { ElementFinding } from "./question-elements";
import { sharedWords, words } from "./question-text";
import type { ResearchProjectDraft } from "./research-project";

export const FINER_CRITERIA = ["feasible", "interesting", "novel", "ethical", "relevant"] as const;
export type FinerCriterion = (typeof FINER_CRITERIA)[number];

/**
 * - addressed: the wording shows signs of meeting the criterion.
 * - attention: something in the wording, or missing from it, needs a closer look.
 * - yours: it can't be judged from the wording; the researcher must judge it.
 */
export type FinerJudgement = "addressed" | "attention" | "yours";

export const FINER_JUDGEMENT_LABELS: Readonly<Record<FinerJudgement, string>> = {
  addressed: "Looks addressed",
  attention: "Needs attention",
  yours: "For you to judge",
};

export const FINER_SOURCES = ["hulley-2013"] as const;

export interface FinerAssessment {
  criterion: FinerCriterion;
  name: string;
  /** What the criterion asks. */
  meaning: string;
  judgement: FinerJudgement;
  /** Why the judgement was made. Never empty. */
  reasons: string[];
  /** Questions the researcher should answer for themselves. */
  toConsider: string[];
}

/** Scope words that suggest a question may be too broad to answer in one study. */
const BROAD_WORDS = ["all", "every", "everyone", "everybody", "worldwide", "global", "globally", "universal", "always", "never"];

/** Groups and topics that usually need particular care in ethical review. */
const SENSITIVE_TERMS = [
  "child", "children", "minor", "minors", "infant", "infants", "adolescent", "adolescents", "pupil", "pupils", "teenager", "teenagers",
  "patient", "patients", "prisoner", "prisoners", "refugee", "refugees", "asylum", "migrant", "migrants", "disabled", "disability",
  "dementia", "pregnant", "pregnancy", "vulnerable", "homeless", "victim", "victims", "suicide", "suicidal", "self-harm", "abuse",
  "trauma", "violence", "grief", "bereavement", "illness", "mental", "addiction", "drug", "drugs", "alcohol", "sexual", "sexuality",
  "crime", "criminal", "illegal", "undocumented",
];

const LONG_QUESTION_WORDS = 35;
const MANY_VARIABLES = 4;

export function evaluateFiner(question: string, project: ResearchProjectDraft, elements: readonly ElementFinding[]): FinerAssessment[] {
  const found = (id: string) => elements.find((finding) => finding.element === id)?.status === "found";
  const questionWords = words(question);

  // Feasible
  const feasibleConcerns: string[] = [];
  const feasibleSigns: string[] = [];
  const broad = BROAD_WORDS.filter((word) => questionWords.includes(word));
  if (broad.length > 0) {
    feasibleConcerns.push(`Words such as ${broad.map((word) => `“${word}”`).join(", ")} suggest a very wide scope, which may be hard to cover in one study.`);
  }
  if (!found("population")) feasibleConcerns.push("No population is named, so the scope of the study isn't clear yet.");
  const variableCount = (project.independentVariables?.length ?? 0) + (project.dependentVariables?.length ?? 0);
  if (variableCount > MANY_VARIABLES) {
    feasibleConcerns.push(`You have listed ${variableCount} variables. Each one adds to what you must measure and analyse.`);
  }
  if (questionWords.length > LONG_QUESTION_WORDS) {
    feasibleConcerns.push(`At ${questionWords.length} words, the question may be trying to do several things at once.`);
  }
  if (found("population") && (found("context") || found("time"))) {
    feasibleSigns.push("The question names a population and a setting or time frame, which keeps the scope manageable.");
  } else if (found("population")) {
    feasibleSigns.push("The question names a population, which gives the study a defined scope.");
  }
  const feasible: FinerAssessment = {
    criterion: "feasible",
    name: "Feasible",
    meaning: "Can you answer it with the time, access, skills and resources you have?",
    judgement: feasibleConcerns.length > 0 ? "attention" : feasibleSigns.length > 0 ? "addressed" : "yours",
    reasons: [
      ...feasibleConcerns,
      ...feasibleSigns,
      "Feasibility also depends on things the wording can't show: whether you can reach participants or data, and how much time you have.",
    ],
    toConsider: [
      "Can you reach enough participants or data in the time available?",
      "Do you have, or can you learn, the skills the method needs?",
      "What will it cost, and who will pay?",
    ],
  };

  // Interesting
  const interesting: FinerAssessment = {
    criterion: "interesting",
    name: "Interesting",
    meaning: "Does the answer matter to you, your supervisor and people in your field?",
    judgement: "yours",
    reasons: [
      "Whether a question is interesting depends on your field and your readers. ResearchKit can't judge it from the wording.",
      ...(project.researchAim ? ["Your research aim can help you explain why the answer matters."] : []),
    ],
    toConsider: ["Would you stay motivated to answer it over the whole project?", "Who would want to know the answer, and why?"],
  };

  // Novel
  const novel: FinerAssessment = {
    criterion: "novel",
    name: "Novel",
    meaning: "Does it add something new: new evidence, a new setting, or a new way of looking at the problem?",
    judgement: "yours",
    reasons: [
      "Novelty can only be established by reviewing the published literature. ResearchKit can't check what has already been studied.",
    ],
    toConsider: [
      "What do existing studies already say about this question?",
      "Does your study add a new population, setting, time or method?",
    ],
  };

  // Ethical
  const sensitive = SENSITIVE_TERMS.filter((term) => questionWords.includes(term) || words(project.population ?? "").includes(term));
  const ethical: FinerAssessment = {
    criterion: "ethical",
    name: "Ethical",
    meaning: "Can it be answered without undue risk to participants, researchers or communities?",
    judgement: sensitive.length > 0 ? "attention" : "yours",
    reasons:
      sensitive.length > 0
        ? [
            `The wording mentions ${sensitive.map((term) => `“${term}”`).join(", ")}. Research with these groups or on these topics usually needs particular care and a full ethical review.`,
          ]
        : [
            "No groups or topics that usually need extra care were recognised in the wording. This isn't an ethical review: all research with people needs approval from your institution.",
          ],
    toConsider: [
      "How will you obtain informed consent?",
      "Could taking part cause harm or distress, and how would you respond?",
      "How will you protect participants' privacy and data?",
    ],
  };

  // Relevant
  const aimOverlap = project.researchAim ? sharedWords(question, project.researchAim) : [];
  const topicOverlap = project.topic ? sharedWords(question, project.topic) : [];
  const relevantReasons: string[] = [];
  let relevantJudgement: FinerJudgement;
  if (!project.researchAim) {
    relevantJudgement = "yours";
    relevantReasons.push("You haven't entered a research aim, so the question can't be compared with what the project sets out to do.");
  } else if (aimOverlap.length > 0) {
    relevantJudgement = "addressed";
    relevantReasons.push(`The question shares key words with your aim (${aimOverlap.map((word) => `“${word}”`).join(", ")}), which suggests it serves the aim.`);
  } else {
    relevantJudgement = "attention";
    relevantReasons.push("The question shares no key words with your research aim. Check that answering it will achieve the aim.");
  }
  if (project.topic && topicOverlap.length === 0) {
    relevantReasons.push("The question doesn't use any key words from your topic. Check that it is still about your topic.");
    relevantJudgement = "attention";
  }
  relevantReasons.push("Relevance to your field, to practice or to policy is for you and your supervisor to judge.");
  const relevant: FinerAssessment = {
    criterion: "relevant",
    name: "Relevant",
    meaning: "Will the answer serve your aim and matter to your field, to practice or to policy?",
    judgement: relevantJudgement,
    reasons: relevantReasons,
    toConsider: ["How would the answer change what people know or do?", "Does the question fit the requirements of your course or funder?"],
  };

  return [feasible, interesting, novel, ethical, relevant];
}
