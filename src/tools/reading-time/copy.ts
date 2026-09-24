/**
 * All wording for the Reading Time Calculator. Paces are taken from the same
 * constants the calculation uses, so the explanation cannot drift from it.
 */

import { formatPace, statFields } from "@/features/text-analysis/format";
import { READING_WORDS_PER_MINUTE, SPEAKING_WORDS_PER_MINUTE } from "@/knowledge/text/text-statistics";

export const page = {
  title: "Reading Time Calculator",
  /** One sentence, for listings such as the tools index. */
  summary: "Estimates how long a text takes to read silently, or to present aloud.",
  metaDescription:
    "Free reading time calculator: estimate how long a text takes to read or to present aloud, with the assumptions explained. Your text stays in your browser.",
  intro:
    "Paste or type your text to estimate how long it takes to read silently or to present aloud. Your text never leaves your browser.",
  inputLabel: "Your text",
  inputHint: "Estimates update as you type.",
  resultsHeading: "Estimates",
  noScript: "The calculator estimates as you type, which needs JavaScript. Turn on JavaScript to use it.",
  methodHeading: "How reading time is estimated",
  limitsHeading: "Limitations",
  privacyHeading: "Privacy",
} as const;

/** The results shown, and the ones announced when typing pauses. */
export const shownResults = statFields(["readingTime", "speakingTime", "words"]);
export const announcedResults = statFields(["readingTime", "speakingTime", "words"]);

/** The assumptions, shown beside the results. */
export const paceNotes = [
  { label: "Reading pace used", value: formatPace(READING_WORDS_PER_MINUTE) },
  { label: "Speaking pace used", value: formatPace(SPEAKING_WORDS_PER_MINUTE) },
] as const;

export const method: readonly string[] = [
  "Words are counted with the same rules as the Word Counter: a word is any run of characters between spaces that contains at least one letter or number.",
  `Reading time divides the word count by ${READING_WORDS_PER_MINUTE} words per minute, a commonly used average for silent reading. Speaking time divides it by ${SPEAKING_WORDS_PER_MINUTE} words per minute, a commonly used pace for presenting aloud.`,
  "Texts that would take under a minute are shown as “Less than one minute”. Anything longer is rounded to the nearest minute.",
];

export const limits: readonly string[] = [
  "These are averages, not measurements of you. Reading speed varies widely between people, and with how familiar the subject is.",
  "Dense academic writing, technical terms, equations and tables all take longer to read than the average suggests. Skimming takes less.",
  "Speaking time doesn't include pauses for slides, questions or emphasis. For a timed presentation, rehearse aloud with a timer.",
  "Only the words in your text are counted. Figures, tables and references are included only if their words are part of what you paste.",
];
