/**
 * The decision assistant: structured questions whose answers narrow the explanation
 * of each design. It never chooses a design and never ranks: for each design it says
 * which answers it fits and which it doesn't, and why.
 */

import { RESEARCH_DESIGNS, type DesignId, type DesignTraits, type ResearchDesign } from "./design-types";

export const DECISION_QUESTIONS = [
  {
    id: "causality",
    question: "Do you need to establish cause and effect?",
    options: [
      { value: "yes", label: "Yes, I need to show that one thing causes another" },
      { value: "no", label: "No, describing, relating or understanding is enough" },
    ],
  },
  {
    id: "manipulation",
    question: "Will you change or introduce something, such as an intervention?",
    options: [
      { value: "yes", label: "Yes, I will manipulate a variable or introduce an intervention" },
      { value: "no", label: "No, I will study things as they are" },
    ],
  },
  {
    id: "timing",
    question: "Will you collect data once or several times?",
    options: [
      { value: "once", label: "Once" },
      { value: "repeated", label: "Several times, to see change" },
    ],
  },
  {
    id: "emphasis",
    question: "Will your data be mainly numbers, words, or both?",
    options: [
      { value: "quantitative", label: "Mainly numbers (quantitative)" },
      { value: "qualitative", label: "Mainly words, observations or images (qualitative)" },
      { value: "mixed", label: "Both, in a planned combination (mixed methods)" },
    ],
  },
  {
    id: "cases",
    question: "Will you study a single case or many participants?",
    options: [
      { value: "single", label: "A single case, group or setting in depth" },
      { value: "multiple", label: "Many participants or cases" },
    ],
  },
  {
    id: "setting",
    question: "Will you study people in their natural setting or in controlled conditions?",
    options: [
      { value: "natural", label: "Their natural setting" },
      { value: "controlled", label: "Controlled conditions" },
    ],
  },
] as const;

export type DecisionQuestionId = (typeof DECISION_QUESTIONS)[number]["id"];
/** The researcher's answers. A question left out is unanswered, and ignored. */
export type DecisionAnswers = Partial<Record<DecisionQuestionId, string>>;

export const DECISION_UNSURE = "unsure";

/** Checks that each answer is one of its question's options, or “unsure”. Throws a RangeError otherwise. */
export function validateAnswers(answers: DecisionAnswers): void {
  for (const [id, value] of Object.entries(answers)) {
    const question = DECISION_QUESTIONS.find((candidate) => candidate.id === id);
    if (!question) throw new RangeError(`Unknown decision question: ${id}`);
    if (value !== undefined && value !== DECISION_UNSURE && !question.options.some((option) => option.value === value)) {
      throw new RangeError(`Unknown answer to ${id}: ${value}`);
    }
  }
}

export interface AnswerFit {
  question: DecisionQuestionId;
  fits: boolean;
  explanation: string;
}

export interface DesignNarrowing {
  design: DesignId;
  /** Answers the design fits, and those it doesn't, each explained. */
  fits: AnswerFit[];
  differs: AnswerFit[];
}

const CAUSAL_PHRASES: Readonly<Record<DesignTraits["causality"], string>> = {
  strong: "can establish cause and effect",
  moderate: "can estimate cause and effect, though less securely than a randomised experiment",
  weak: "can suggest, but rarely establish, cause and effect",
  none: "describe or relate rather than establishing cause and effect",
  either: "can support causal claims only when combined with a suitable strategy",
};

function judge(design: ResearchDesign, question: DecisionQuestionId, answer: string): AnswerFit {
  const { traits } = design;
  const name = `${design.name} designs`;
  const fit = (fits: boolean, explanation: string): AnswerFit => ({ question, fits, explanation });
  switch (question) {
    case "causality": {
      const phrase = `${name} ${CAUSAL_PHRASES[traits.causality]}.`;
      if (answer === "no") return fit(true, `${phrase} You don't need causal claims, so this doesn't rule it in or out.`);
      return fit(traits.causality === "strong" || traits.causality === "moderate" || traits.causality === "either", phrase);
    }
    case "manipulation":
      if (traits.manipulation === "either") return fit(true, `${name} can be used with or without an intervention.`);
      return traits.manipulation === answer
        ? fit(true, answer === "yes" ? `${name} involve manipulating a variable or introducing an intervention.` : `${name} study things as they are, without manipulation.`)
        : fit(false, answer === "yes" ? `${name} study things as they are, without manipulation.` : `${name} involve manipulating a variable, which you don't plan to do.`);
    case "timing":
      if (traits.timing === "either") return fit(true, `${name} can collect data once or several times.`);
      return traits.timing === answer
        ? fit(true, traits.timing === "once" ? `${name} collect data at one point in time.` : `${name} collect data over time.`)
        : fit(false, traits.timing === "once" ? `${name} collect data at one point in time, so they can't show change.` : `${name} collect data over time, which you don't plan to do.`);
    case "emphasis":
      if (traits.emphasis === "either") return fit(true, `${name} can use quantitative or qualitative data.`);
      return traits.emphasis === answer
        ? fit(true, `${name} usually use ${answer === "mixed" ? "both kinds of data in a planned combination" : `${answer} data`}, as you plan.`)
        : fit(false, `${name} usually use ${traits.emphasis === "mixed" ? "both kinds of data" : `${traits.emphasis} data`}.`);
    case "cases":
      if (traits.cases === "either") return fit(true, `${name} can study a single case or many.`);
      return traits.cases === answer
        ? fit(true, traits.cases === "single" ? `${name} study one case, group or setting in depth.` : `${name} study many participants or cases.`)
        : fit(false, traits.cases === "single" ? `${name} study one case in depth rather than many.` : `${name} usually need many participants or cases.`);
    case "setting":
      if (traits.setting === "either") return fit(true, `${name} can be carried out in natural or controlled settings.`);
      return traits.setting === answer
        ? fit(true, traits.setting === "natural" ? `${name} study people in their natural setting.` : `${name} use controlled conditions.`)
        : fit(false, traits.setting === "natural" ? `${name} study people in their natural setting, not controlled conditions.` : `${name} usually need controlled conditions.`);
  }
}

/**
 * How each design relates to the answers given, in catalogue order. Unanswered and
 * “unsure” answers are ignored. This explains; it never chooses or ranks.
 */
export function narrowDesigns(answers: DecisionAnswers): DesignNarrowing[] {
  validateAnswers(answers);
  const given = (Object.entries(answers) as [DecisionQuestionId, string | undefined][]).filter(
    (entry): entry is [DecisionQuestionId, string] => entry[1] !== undefined && entry[1] !== DECISION_UNSURE,
  );
  return RESEARCH_DESIGNS.map((design) => {
    const judged = given.map(([question, answer]) => judge(design, question, answer));
    return { design: design.id, fits: judged.filter((entry) => entry.fits), differs: judged.filter((entry) => !entry.fits) };
  });
}

/** The designs that differ from none of the answers, in catalogue order. */
export const consistentDesigns = (answers: DecisionAnswers): DesignId[] =>
  narrowDesigns(answers)
    .filter((narrowing) => narrowing.differs.length === 0)
    .map((narrowing) => narrowing.design);
