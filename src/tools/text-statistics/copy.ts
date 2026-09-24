/**
 * All wording for Text Statistics. Every figure quoted in the explanation comes
 * from the constants the calculations use, so the explanation cannot drift from them.
 */

import { formatCount, statFields } from "@/features/text-analysis/format";
import {
  READING_WORDS_PER_MINUTE,
  SPEAKING_WORDS_PER_MINUTE,
  WORDS_PER_PAGE_DOUBLE_SPACED,
  WORDS_PER_PAGE_SINGLE_SPACED,
} from "@/knowledge/text/text-statistics";

export const page = {
  title: "Text Statistics",
  /** One sentence, for listings such as the tools index. */
  summary: "Measures sentence length, word length and paragraph structure, and estimates how many pages your text fills.",
  metaDescription:
    "Free text statistics for academic writing: average sentence and word length, longest sentence and paragraph, and estimated pages. Your text stays in your browser.",
  intro:
    "Paste or type your writing to see how it is built: sentence and word length, paragraph structure, and roughly how many pages it fills. Your text never leaves your browser.",
  inputLabel: "Your text",
  inputHint: "Statistics update as you type.",
  resultsHeading: "Statistics",
  noScript: "Text Statistics updates as you type, which needs JavaScript. Turn on JavaScript to use it.",
  methodHeading: "How these statistics are calculated",
  limitsHeading: "Limitations",
  privacyHeading: "Privacy",
} as const;

/** The results shown, in the order readers scan them, and the ones announced when typing pauses. */
export const shownResults = statFields([
  "words",
  "charactersWithSpaces",
  "charactersWithoutSpaces",
  "paragraphs",
  "sentences",
  "readingTime",
  "speakingTime",
  "averageWordsPerSentence",
  "averageCharactersPerWord",
  "averageSentencesPerParagraph",
  "longestSentenceWords",
  "longestParagraphWords",
  "estimatedPagesSingleSpaced",
  "estimatedPagesDoubleSpaced",
]);
export const announcedResults = statFields(["words", "sentences", "averageWordsPerSentence", "estimatedPagesDoubleSpaced"]);

/** The page-length assumptions, shown beside the results. */
export const pageNotes = [
  { label: "Words per single-spaced page", value: formatCount(WORDS_PER_PAGE_SINGLE_SPACED) },
  { label: "Words per double-spaced page", value: formatCount(WORDS_PER_PAGE_DOUBLE_SPACED) },
] as const;

export const method: readonly string[] = [
  "Words, characters, sentences and paragraphs are counted with the same rules as the Word Counter.",
  "Average words per sentence divides the word count by the sentence count. Average sentences per paragraph divides the sentence count by the paragraph count.",
  "Average characters per word counts only letters and numbers, so punctuation attached to a word, as in “sources!”, doesn't make it longer.",
  "The longest sentence and longest paragraph are measured in words, using the same sentence and paragraph rules.",
  `Reading time assumes ${READING_WORDS_PER_MINUTE} words per minute and speaking time ${SPEAKING_WORDS_PER_MINUTE}, rounded to the nearest minute.`,
  `Estimated pages divide the word count by ${WORDS_PER_PAGE_SINGLE_SPACED} words for a single-spaced page and ${WORDS_PER_PAGE_DOUBLE_SPACED} for a double-spaced page.`,
  "Averages and page estimates are shown to one decimal place. An average shows “None” until there is text to average.",
];

export const limits: readonly string[] = [
  "Page counts are estimates. The real number depends on font, text size, margins, headings, figures, tables and reference lists, so check with the template your assignment requires.",
  "Sentence statistics depend on finding sentence endings. Abbreviations such as “e.g.” are counted as the end of a sentence, which makes sentences look shorter.",
  "These figures describe your text; they don't judge it. Good academic writing varies sentence length on purpose, and the right length depends on your subject and audience.",
  "Languages written without spaces between words, such as Chinese, Japanese or Thai, aren't measured accurately.",
];
