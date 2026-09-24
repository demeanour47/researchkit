/**
 * All wording for the Word Counter. The counting rules shown to readers are built
 * from the same constants the logic uses, so the explanation cannot drift from it.
 */

import { statFields } from "@/features/text-analysis/format";
import { READING_WORDS_PER_MINUTE, SPEAKING_WORDS_PER_MINUTE } from "@/knowledge/text/text-statistics";

export const page = {
  title: "Word Counter",
  /** One sentence, for listings such as the tools index. */
  summary: "Counts words, characters, sentences and paragraphs, and estimates reading and speaking time.",
  metaDescription:
    "Free word counter: count words, characters, sentences and paragraphs as you type, and estimate reading and speaking time. Your text stays in your browser.",
  intro:
    "Paste or type your text to count words, characters, sentences and paragraphs as you type. Your text never leaves your browser.",
  inputLabel: "Your text",
  inputHint: "Counts update as you type.",
  countsHeading: "Counts",
  noScript: "The word counter counts as you type, which needs JavaScript. Turn on JavaScript to use it.",
  rulesHeading: "How we count",
  limitsHeading: "What the counter can't know",
  browseGuides: { lead: "Looking for help with academic writing?", label: "Browse Research Guides" },
} as const;

/** The results shown, and the ones announced when typing pauses. */
export const shownResults = statFields([
  "words",
  "charactersWithSpaces",
  "charactersWithoutSpaces",
  "sentences",
  "paragraphs",
  "readingTime",
  "speakingTime",
]);
export const announcedResults = statFields(["words", "charactersWithSpaces", "readingTime"]);

export const rules: readonly string[] = [
  "A word is any run of characters between spaces that contains at least one letter or number, in any language. “State-of-the-art”, “don't” and “2020” each count as one word; a dash or emoji on its own does not.",
  "Characters are counted as you see them, so an accented letter or an emoji with a skin tone counts as one. “With spaces” includes spaces and tabs, but not line breaks.",
  "A sentence ends with a full stop, question mark, exclamation mark or ellipsis, or at the end of a paragraph.",
  "A paragraph is a line containing at least one letter or number. Blank lines are ignored.",
  `Reading time assumes ${READING_WORDS_PER_MINUTE} words per minute and speaking time ${SPEAKING_WORDS_PER_MINUTE} words per minute, rounded to the nearest minute.`,
];

export const limits: readonly string[] = [
  "What your word limit includes. Institutions differ on headings, quotations, tables, footnotes and reference lists, so check your assignment brief.",
  "Languages written without spaces between words, such as Chinese, Japanese or Thai. Each unbroken run of text is counted as one word.",
  "Abbreviations such as “e.g.” or “Dr.”, which are counted as the end of a sentence.",
];
