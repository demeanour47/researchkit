/**
 * The sampling decision assistant: yes-or-no questions whose answers narrow the
 * explanation of each technique. It never chooses or ranks: for each technique it
 * says which answers it fits and which it doesn't, and why.
 */

import { SAMPLING_TECHNIQUES, type SamplingTechnique, type SamplingTechniqueId } from "./sampling-types";

export const SAMPLING_QUESTIONS = [
  { id: "probabilityPossible", question: "Is probability sampling possible in your setting?" },
  { id: "completeFrame", question: "Do you have a complete list of the people in your population?" },
  { id: "hardToIdentify", question: "Are the people you want to study difficult to identify or reach?" },
  { id: "representativeness", question: "Is it essential that your sample represents the population?" },
  { id: "inference", question: "Do you need statistical inference about the population?" },
  { id: "qualitative", question: "Is your study qualitative?" },
  { id: "referral", question: "Will participants recruit other participants?" },
] as const;

export type SamplingQuestionId = (typeof SAMPLING_QUESTIONS)[number]["id"];
export type SamplingAnswer = "yes" | "no";
/** The researcher's answers. A question left out is unanswered, and ignored. */
export type SamplingAnswers = Partial<Record<SamplingQuestionId, SamplingAnswer>>;

export const SAMPLING_ANSWER_LABELS: Readonly<Record<SamplingAnswer | "unsure", string>> = { yes: "Yes", no: "No", unsure: "Not sure" };

/** Throws a RangeError for an unknown question or an answer other than yes or no. */
export function validateSamplingAnswers(answers: SamplingAnswers): void {
  for (const [id, value] of Object.entries(answers)) {
    if (!SAMPLING_QUESTIONS.some((question) => question.id === id)) throw new RangeError(`Unknown sampling question: ${id}`);
    if (value !== undefined && value !== "yes" && value !== "no") throw new RangeError(`Unknown answer to ${id}: ${value}`);
  }
}

export interface SamplingFit {
  question: SamplingQuestionId;
  fits: boolean;
  explanation: string;
}

export interface TechniqueNarrowing {
  technique: SamplingTechniqueId;
  fits: SamplingFit[];
  differs: SamplingFit[];
}

function judge(technique: SamplingTechnique, question: SamplingQuestionId, answer: SamplingAnswer): SamplingFit {
  const name = `${technique.name} sampling`;
  const { traits } = technique;
  const probability = technique.category === "probability";
  const fit = (fits: boolean, explanation: string): SamplingFit => ({ question, fits, explanation });
  switch (question) {
    case "probabilityPossible":
      if (answer === "yes") return fit(true, probability ? `${name} is a probability technique, which you say is possible.` : `${name} doesn't need probability sampling, though you could use it.`);
      return probability ? fit(false, `${name} is a probability technique, which you say isn't possible.`) : fit(true, `${name} doesn't need random selection.`);
    case "completeFrame":
      if (traits.frame === "individuals") {
        return answer === "yes" ? fit(true, `${name} needs a complete list of individuals, which you have.`) : fit(false, `${name} needs a complete list of the individuals in the population.`);
      }
      if (traits.frame === "clusters") {
        return fit(true, answer === "yes" ? `${name} can use your list, or a list of groups.` : `${name} needs a list of groups, such as schools or areas, rather than of every individual.`);
      }
      return fit(true, `${name} doesn't need a list of the population.`);
    case "hardToIdentify":
      if (answer === "no") return fit(true, traits.hiddenPopulations === "suited" ? `${name} is designed for hard-to-reach groups, but can also be used when people are easy to find.` : `${name} works when people can be identified.`);
      if (traits.hiddenPopulations === "suited") return fit(true, `${name} is suited to people who are hard to identify, because participants lead you to others.`);
      if (traits.hiddenPopulations === "unsuited") {
        return fit(false, probability ? `${name} needs every member to be identifiable in advance, which is hard for hidden groups.` : `${name} needs the population's characteristics in advance, which are hard to know for hidden groups.`);
      }
      return fit(true, `${name} can be used with hard-to-reach groups if you can make contact with them.`);
    case "representativeness":
      if (answer === "no") return fit(true, `${name} ${traits.representativeness === "high" ? "gives a representative sample, though you don't need one" : "doesn't aim for representativeness, which you don't need"}.`);
      if (traits.representativeness === "high") return fit(true, `${name} aims for a sample that represents the population.`);
      return fit(false, traits.representativeness === "moderate" ? `${name} can match the population's proportions or setting, but selection isn't random, so representativeness is limited.` : `${name} doesn't aim for a representative sample.`);
    case "inference":
      if (answer === "no") return fit(true, `${name} ${probability ? "supports statistical inference, though you don't need it" : "doesn't support statistical inference, which you don't need"}.`);
      return probability ? fit(true, `${name} supports statistical inference about the population.`) : fit(false, `${name} doesn't support statistical inference, because selection isn't random.`);
    case "qualitative":
      if (answer === "yes") {
        if (traits.qualitative === "unusual") return fit(false, `${name} is rarely used in qualitative studies, which usually choose participants for relevance rather than representativeness.`);
        return fit(true, traits.qualitative === "possible" ? `${name} can be used in qualitative studies.` : `${name} is commonly used in qualitative studies.`);
      }
      if (traits.qualitative === "only") return fit(false, `${name} belongs to grounded theory and other qualitative approaches.`);
      return fit(true, `${name} can be used in studies that aren't qualitative.`);
    case "referral":
      if (answer === "yes") {
        if (traits.referral === "no") return fit(false, `${name} doesn't use referrals: participants recruiting others would change who is selected.`);
        return fit(true, traits.referral === "yes" ? `${name} relies on participants recruiting others.` : `${name} can include referrals from participants.`);
      }
      return traits.referral === "yes" ? fit(false, `${name} relies on participants recruiting others.`) : fit(true, `${name} doesn't rely on referrals.`);
  }
}

/** How each technique relates to the answers, in catalogue order. Unanswered questions are ignored. */
export function narrowTechniques(answers: SamplingAnswers): TechniqueNarrowing[] {
  validateSamplingAnswers(answers);
  const given = (Object.entries(answers) as [SamplingQuestionId, SamplingAnswer | undefined][]).filter(
    (entry): entry is [SamplingQuestionId, SamplingAnswer] => entry[1] !== undefined,
  );
  return SAMPLING_TECHNIQUES.map((technique) => {
    const judged = given.map(([question, answer]) => judge(technique, question, answer));
    return { technique: technique.id, fits: judged.filter((entry) => entry.fits), differs: judged.filter((entry) => !entry.fits) };
  });
}

/** Techniques that differ from none of the answers, in catalogue order. Never a single choice. */
export const consistentTechniques = (answers: SamplingAnswers): SamplingTechniqueId[] =>
  narrowTechniques(answers)
    .filter((entry) => entry.differs.length === 0)
    .map((entry) => entry.technique);
