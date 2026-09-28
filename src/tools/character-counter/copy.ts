/**
 * All wording for the Character Counter. The counting rules shown to readers are
 * built from the same constants the logic uses, so the explanation cannot drift
 * from it.
 */

import { statFields } from "@/features/text-analysis/format";
import { READING_WORDS_PER_MINUTE } from "@/knowledge/text/text-statistics";

export const page = {
  title: "Character Counter",
  /** One sentence, for listings such as the tools index. */
  summary: "Counts characters, with and without spaces, and the words, sentences and paragraphs that make them up.",
  metaDescription:
    "Free character counter for academic writing: count characters with and without spaces as you type, for abstracts, titles and forms with a character limit. Handles Nepali/Devanagari, accented letters and emoji correctly. Your text stays in your browser.",
  intro:
    "Paste or type your text to count its characters, with and without spaces, as you type. Built for the character limits abstracts, titles and online submission forms set, and counted correctly for Nepali (Devanagari), accented letters, emoji and mixed-language text. Your text never leaves your browser.",
  inputLabel: "Your text",
  inputHint: "Counts update as you type.",
  inputPlaceholder: "Paste or type an abstract, title or any academic text here…",
  countsHeading: "Counts",
  noScript: "The character counter counts as you type, which needs JavaScript. Turn on JavaScript to use it.",
  emptyTitle: "Nothing typed yet",
  emptyDescription: "Paste or type text above, and its character, word, sentence and paragraph counts will appear here.",
  /** Completes the Copy button's accessible name: "Copy" + " the counts". */
  copySubject: "the counts",
  clearLabel: "Clear",
  rulesHeading: "How characters are counted",
  guidanceHeading: "Why character counts matter in academic writing",
  limitsHeading: "What the counter can't know",
  privacyHeading: "Privacy",
  browseGuides: { lead: "Want the full guide to counting characters?", label: "Browse Research Guides" },
} as const;

/** The results shown, in the order readers scan them, and the ones announced when typing pauses. */
export const shownResults = statFields([
  "charactersWithSpaces",
  "charactersWithoutSpaces",
  "words",
  "sentences",
  "paragraphs",
  "readingTime",
]);
export const announcedResults = statFields(["charactersWithSpaces", "charactersWithoutSpaces", "words"]);

export const rules: readonly string[] = [
  "“Characters with spaces” counts every character you see, including spaces and tabs, but not line breaks. “Characters without spaces” counts only the visible, non-blank characters.",
  "A character is counted as a reader sees it (a grapheme), not as the computer stores it. An accented letter such as “é”, a Devanagari syllable such as “क्षे”, and an emoji with a skin tone or a flag such as “🇳🇵” each count as one character, however many computer code points they are built from.",
  "Words, sentences and paragraphs are counted with the same rules as the Word Counter: a word is any run of characters between spaces that contains at least one letter or number, a sentence ends with a full stop, question mark, exclamation mark or ellipsis (or at the end of a paragraph), and a paragraph is a line containing at least one letter or number.",
  `Reading time assumes ${READING_WORDS_PER_MINUTE} words per minute, rounded to the nearest minute.`,
];

export const guidance: readonly string[] = [
  "Characters with spaces is usually what a character limit means: every letter, digit, punctuation mark and space counts towards it. Check the exact wording of the limit you're working to, since some systems mean something else.",
  "Character count and word count measure different things. “Assessment” and “a” are each one word but ten and one characters; a limit given in characters can be reached by a few long words, while a limit given in words allows more short ones.",
  "Journal and conference submission systems often set a character limit for the abstract, the title or a cover letter, separately from any word limit, because their layout or database field has a fixed width.",
  "Online academic forms, such as scholarship or ethics applications, frequently enforce a hard character limit in the browser itself: the field stops accepting input, sometimes without warning, once the limit is reached. Counting first avoids losing a sentence you were still writing.",
  "For text that mixes English with Nepali or another script, count in the same way you will submit it. Devanagari text is usually written with fewer, denser characters per word than English, so a character limit written with English text in mind can feel short once translated.",
];

export const limits: readonly string[] = [
  "What a character limit includes. Institutions and systems differ on whether spaces, a title, or formatting marks count, so check the instructions you were given.",
  "Devanagari's own sentence-ending mark, the danda “।”, isn't recognised as a sentence ending; only a full stop, question mark, exclamation mark or ellipsis is. Sentence counts for Nepali text written with dandas will be lower than the number of sentences a reader would count.",
  "Languages written without spaces between words, such as Chinese, Japanese or Thai, aren't measured accurately by the word count. Character counts are unaffected, since they don't depend on where words start and end.",
  "Abbreviations such as “e.g.” or “Dr.” are counted as the end of a sentence.",
];
