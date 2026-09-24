/**
 * Evaluates a research question the researcher has written: its type, its elements,
 * the FINER criteria, strengths and weaknesses, what is missing, possible improvements,
 * consistency with their methodology, and academic notes.
 *
 * Every point explains why it is made. The evaluation describes the question; it never
 * rewrites it, and it never judges quality, originality, publishability or approval.
 */

import { evaluateFiner, FINER_SOURCES, type FinerAssessment } from "./finer";
import { identifyElements, type ElementFinding } from "./question-elements";
import { VAGUE_WORDS, capitalise, normalise, words } from "./question-text";
import { detectApproach, detectQuestionTypes, getQuestionType, type QuestionTypeId, type TypeDetection } from "./question-types";
import { getReference } from "./references";
import { findOption } from "./research-onion";
import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import type { Reference } from "./types";

export interface Feedback {
  text: string;
  why: string;
}

/** Whether the question's wording fits one of the researcher's methodological choices. */
export interface ConsistencyNote {
  /** The choice being compared, such as "Positivism". */
  choice: string;
  status: "consistent" | "worth-checking";
  text: string;
  why: string;
}

export const CONSISTENCY_LABELS: Readonly<Record<ConsistencyNote["status"], string>> = {
  consistent: "Consistent",
  "worth-checking": "Worth checking",
};

export interface AcademicNote {
  text: string;
  references: Reference[];
}

export interface QuestionEvaluation {
  question: string;
  /** The question type the researcher chose, if any. */
  chosenType: QuestionTypeId | null;
  detectedTypes: TypeDetection[];
  elements: ElementFinding[];
  finer: FinerAssessment[];
  strengths: Feedback[];
  weaknesses: Feedback[];
  /** Expected elements that are missing, and project details the evaluation needed. */
  missing: Feedback[];
  improvements: Feedback[];
  consistency: ConsistencyNote[];
  academicNotes: AcademicNote[];
  /** The project draft with the question recorded as its research question. */
  project: ResearchProjectDraft;
}

/** What this tool can't determine, stated wherever it gives feedback. */
export const QUESTION_BUILDER_LIMITATIONS: readonly string[] = [
  "It can't determine the quality of your research. That depends on your design, your data and how well you carry the study out.",
  "It can't determine whether your question is original. Only a review of the published literature can show that.",
  "It can't determine whether your research would be publishable. That is decided by editors and peer reviewers.",
  "It can't give supervisor or ethics approval. Your supervisor and your institution decide whether your question and design are acceptable.",
];

const SHORT_QUESTION_WORDS = 8;
const LONG_QUESTION_WORDS = 35;
const OPEN_START = /^(what|how|why|to what extent|in what ways?|which|who|where|when|under what)\b/i;
const CLOSED_START = /^(is|are|was|were|does|do|did|can|could|will|would|should|shall|must|has|have|had)\b/i;

export function evaluateQuestion(
  questionText: string,
  project: ResearchProjectDraft,
  chosenType: QuestionTypeId | null = null,
): QuestionEvaluation {
  const question = normalise(questionText);
  const detectedTypes = detectQuestionTypes(question);
  const types: QuestionTypeId[] = chosenType ? [chosenType] : detectedTypes.map((detection) => detection.type);
  const elements = identifyElements(question, project, types);
  const finer = evaluateFiner(question, project, elements);
  const questionWords = words(question);
  const isMixed = chosenType === "mixed-methods" || detectApproach(question) === "mixed-methods";

  const strengths: Feedback[] = [];
  const weaknesses: Feedback[] = [];
  const improvements: Feedback[] = [];

  // Form
  if (!question.endsWith("?")) {
    weaknesses.push({ text: "It is written as a statement, not a question.", why: "A question makes clear what the study must answer, and how you will know when you have answered it." });
    improvements.push({ text: "Rewrite it as a question that ends with a question mark.", why: "Phrasing it as a question shows exactly what your findings must address." });
  }
  if (OPEN_START.test(question)) {
    strengths.push({ text: "It is an open question.", why: `Starting with “${OPEN_START.exec(question)![0]}” invites a detailed answer rather than a yes or no.` });
  } else if (CLOSED_START.test(question)) {
    weaknesses.push({ text: "It can be answered with yes or no.", why: "A yes/no answer says little about how much, how or why, which limits what you can report." });
    improvements.push({ text: "Consider starting with “To what extent”, “How” or “What”.", why: "An open opening asks for the size, nature or reasons of an effect, not just whether it exists." });
  }
  if (/\bshould\b/i.test(question)) {
    weaknesses.push({ text: "It asks what “should” happen.", why: "Research can provide evidence about what happens and why, but what should happen is a question of values that data alone can't settle." });
    improvements.push({ text: "Ask what the evidence shows, for example about effects, experiences or outcomes.", why: "An empirical question can be answered with data; your conclusions can then discuss what should follow." });
  }

  // Length
  if (questionWords.length > 0 && questionWords.length < SHORT_QUESTION_WORDS) {
    weaknesses.push({ text: `It is short (${questionWords.length} words) and may be too broad.`, why: "Very short questions usually leave out who, where or what exactly will be studied." });
    improvements.push({ text: "Add the population, setting or time frame you will study.", why: "Each detail narrows the scope and makes the study more feasible." });
  } else if (questionWords.length > LONG_QUESTION_WORDS) {
    weaknesses.push({ text: `It is long (${questionWords.length} words).`, why: "Long questions often combine several questions, which makes each one harder to answer fully." });
    improvements.push({ text: "Split it into one main question and a few sub-questions.", why: "A focused main question is easier to answer, and sub-questions can cover the detail." });
  } else if (questionWords.length > 0) {
    strengths.push({ text: `Its length (${questionWords.length} words) is manageable.`, why: `Questions of about ${SHORT_QUESTION_WORDS} to ${LONG_QUESTION_WORDS} words are usually specific enough to guide a study without trying to do too much.` });
  }

  // More than one question
  const questionMarks = (question.match(/\?/g) ?? []).length;
  const joined = /,? and (how|why|what|to what extent|whether)\b/i.test(question);
  if (questionMarks > 1 || (joined && !isMixed)) {
    weaknesses.push({ text: "It may contain more than one question.", why: "Each part may need different data and analysis, and it can be unclear which one your findings answer." });
    improvements.push({ text: "Keep one main question and make the other part a sub-question.", why: "Separate questions can each be answered clearly." });
  } else if (joined && isMixed) {
    strengths.push({ text: "It links a measured part and an interpretive part.", why: "Mixed methods questions often combine the two, as long as the answer to one part informs the other." });
  }

  // Vague words
  const vague = VAGUE_WORDS.filter((word) => questionWords.includes(word));
  if (vague.length > 0) {
    weaknesses.push({ text: `It uses words that need defining: ${vague.map((word) => `“${word}”`).join(", ")}.`, why: "Readers may understand these words differently, and you can't measure or explore them until you say what they mean." });
    improvements.push({ text: `Replace ${vague.map((word) => `“${word}”`).join(", ")} with what you will actually measure or explore.`, why: "Precise terms show how the question will be answered." });
  }

  // Type
  if (detectedTypes.length > 0) {
    const names = detectedTypes.map((detection) => getQuestionType(detection.type).name.toLowerCase());
    strengths.push({ text: `The wording signals the type of question (${names.join(", ")}).`, why: "A clear type points readers, and you, towards a suitable design and analysis." });
  }
  if (chosenType && question && !detectedTypes.some((detection) => detection.type === chosenType)) {
    const chosen = getQuestionType(chosenType);
    weaknesses.push({ text: `The wording doesn't clearly signal the ${chosen.name.toLowerCase()} type you chose.`, why: `${chosen.name} questions usually start with openings such as ${chosen.stems.map((stem) => `“${stem}”`).join(" or ")}.` });
    improvements.push({ text: `If you mean to ask ${/^[aeiou]/i.test(chosen.name) ? "an" : "a"} ${chosen.name.toLowerCase()} question, consider an opening such as “${chosen.stems[0]}”.`, why: chosen.definition });
  }

  // Elements
  const missing: Feedback[] = [];
  for (const finding of elements) {
    if (finding.status === "found" && finding.expected) {
      strengths.push({ text: `It names the ${finding.label.toLowerCase()}: “${finding.value}”.`, why: finding.explanation });
    }
    if (finding.status === "missing" && finding.expected) {
      missing.push({ text: finding.label, why: finding.explanation });
      improvements.push({ text: `Add the ${finding.label.toLowerCase()} to the question.`, why: finding.explanation });
    }
    // Optional context and time are worth mentioning; a variable this type doesn't use isn't.
    if (finding.status === "notInQuestion" && (finding.expected || finding.element === "context" || finding.element === "time")) {
      missing.push({ text: `${finding.label} (in your details, not in the question)`, why: finding.explanation });
      improvements.push({ text: `Consider naming the ${finding.label.toLowerCase()} you entered, “${finding.value}”, in the question.`, why: finding.explanation });
    }
  }
  if (!project.researchAim) {
    missing.push({ text: "Research aim", why: "Without an aim, the question can't be checked for relevance: a good question is one whose answer achieves the aim." });
  }
  if (!project.topic) {
    missing.push({ text: "Topic", why: "Without a topic, the question can't be checked against what your project is about." });
  }

  return {
    question,
    chosenType,
    detectedTypes,
    elements,
    finer,
    strengths,
    weaknesses,
    missing,
    improvements,
    consistency: checkConsistency(question, project, detectedTypes, elements),
    academicNotes: academicNotes(chosenType, detectedTypes, project),
    project: updateProjectDraft(project, { researchQuestion: question || null }),
  };
}

const essenceOf = (id: string) => {
  const option = findOption(id)!;
  return `${capitalise(option.subject)} usually ${option.essence}.`;
};

/**
 * How the question's wording fits the researcher's philosophy, approach and methodology.
 * It explains; it never requires a change.
 */
export function checkConsistency(
  question: string,
  project: ResearchProjectDraft,
  detected: readonly TypeDetection[] = detectQuestionTypes(question),
  elements: readonly ElementFinding[] = identifyElements(question, project, detected.map((detection) => detection.type)),
): ConsistencyNote[] {
  if (!normalise(question)) return [];
  const notes: ConsistencyNote[] = [];
  const onion = project.researchOnionSelection ?? {};
  const approach = detectApproach(question);
  const has = (type: QuestionTypeId) => detected.some((detection) => detection.type === type);
  const found = (id: string) => elements.find((finding) => finding.element === id)?.status === "found";
  const note = (id: string, status: ConsistencyNote["status"], text: string) =>
    notes.push({ choice: findOption(id)!.name, status, text, why: essenceOf(id) });

  switch (onion.philosophy) {
    case "positivism":
      if (approach === "quantitative") note("positivism", "consistent", "The question uses measurable wording, which suits a positivist position.");
      else if (approach === "qualitative") note("positivism", "worth-checking", "The question uses wording about experiences or meanings, which interpretive research usually uses. If you keep a positivist position, consider how these will be measured.");
      else note("positivism", "worth-checking", "Positivist research usually asks about things that can be measured, such as levels, differences or effects. Consider whether your wording makes clear what you will measure.");
      break;
    case "interpretivism":
      if (approach === "qualitative") note("interpretivism", "consistent", "The question asks about experiences or meanings, which suits an interpretivist position.");
      else if (approach === "quantitative") note("interpretivism", "worth-checking", "The question uses measurement wording, which positivist research usually uses. If you keep an interpretivist position, consider asking how people experience or understand the issue.");
      else note("interpretivism", "worth-checking", "Interpretivist research usually asks how people experience or make sense of something. Consider whether your wording shows that focus.");
      break;
    case "pragmatism":
      note("pragmatism", "consistent", approach === "mixed-methods"
        ? "The question combines a measured part and an interpretive part, which pragmatist research often does."
        : "Pragmatism allows any kind of question, as long as your methods are chosen to answer it.");
      break;
    case "realism":
      if (has("explanatory")) note("realism", "consistent", "The question asks how or why something happens, which suits realist research into underlying mechanisms.");
      else note("realism", "worth-checking", "Realist research often asks what works, for whom and in what circumstances, and why. Consider whether your question reaches for explanation.");
      break;
  }

  switch (onion.approach) {
    case "deductive":
      if (found("independentVariable") && found("dependentVariable")) note("deductive", "consistent", "The question names what may influence an outcome and the outcome, so it can be turned into testable hypotheses.");
      else note("deductive", "worth-checking", "A deductive study tests expectations drawn from theory. Consider whether the question names the variables your hypotheses will relate.");
      break;
    case "inductive":
      if (has("predictive") || has("correlational")) note("inductive", "worth-checking", "The question sets out to test a relationship, which deductive research usually does. If your approach is inductive, consider a more open question.");
      else note("inductive", "consistent", "The question is open enough to let patterns emerge from the data.");
      break;
    case "abductive":
      if (has("explanatory")) note("abductive", "consistent", "The question seeks an explanation, which abductive research develops by moving between data and theory.");
      else note("abductive", "worth-checking", "Abductive research often starts from a puzzling observation and asks why it happens. Consider whether your question seeks an explanation.");
      break;
  }

  const methodology = project.methodology ?? onion.choice;
  if (project.methodology && onion.choice && project.methodology !== onion.choice) {
    notes.push({
      choice: findOption(project.methodology)!.name,
      status: "worth-checking",
      text: `Your stated methodology (${findOption(project.methodology)!.name}) differs from the methodological choice in your Research Onion (${findOption(onion.choice)!.name}).`,
      why: "Your methodology chapter will need to present one consistent choice.",
    });
  }
  switch (methodology) {
    case "quantitative":
      note("quantitative", approach === "quantitative" ? "consistent" : "worth-checking", approach === "quantitative"
        ? "The question uses measurable wording, which suits a quantitative design."
        : "A quantitative design needs a question about amounts, differences or relationships you can measure. Consider whether your wording shows what you will measure.");
      break;
    case "qualitative":
      note("qualitative", approach === "qualitative" ? "consistent" : "worth-checking", approach === "qualitative"
        ? "The question asks about experiences or meanings, which suits a qualitative design."
        : "A qualitative design usually needs an open question about experiences, meanings or processes. Consider whether your wording invites that kind of answer.");
      break;
    case "mixed-methods":
      note("mixed-methods", approach === "mixed-methods" ? "consistent" : "worth-checking", approach === "mixed-methods"
        ? "The question has a measured part and an interpretive part, which suits a mixed methods design."
        : "A mixed methods design usually needs a question, or sub-questions, that call for both numbers and words. Consider whether your question shows both parts.");
      break;
    case "multi-method":
      note("multi-method", "consistent", "A multi-method design uses several techniques from one tradition, so check that your wording matches that tradition.");
      break;
  }
  return notes;
}

/** Sources for the general notes, alongside each question type's own sources. */
export const GENERAL_NOTE_SOURCES = { revision: "white-2009", realism: "pawson-tilley-1997" } as const;

function academicNotes(chosen: QuestionTypeId | null, detected: readonly TypeDetection[], project: ResearchProjectDraft): AcademicNote[] {
  const ids = [...new Set([...(chosen ? [chosen] : []), ...detected.map((detection) => detection.type)])];
  const realism: AcademicNote[] =
    project.researchOnionSelection?.philosophy === "realism"
      ? [
          {
            text: "Realist research often asks what works, for whom, in what circumstances and why, rather than only whether something works.",
            references: [getReference(GENERAL_NOTE_SOURCES.realism)],
          },
        ]
      : [];
  return [
    {
      text: "Research questions are usually revised several times as you read, plan and discuss them. A first draft is expected to change.",
      references: [getReference(GENERAL_NOTE_SOURCES.revision)],
    },
    ...realism,
    ...ids.map((id) => {
      const type = getQuestionType(id);
      return { text: `${type.name} questions: ${type.note}`, references: type.sources.map(getReference) };
    }),
    {
      text: "The FINER criteria (feasible, interesting, novel, ethical, relevant) are a widely used checklist for judging a research question.",
      references: FINER_SOURCES.map(getReference),
    },
  ];
}
