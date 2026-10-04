/**
 * All wording for the Sentence Counter. The rules shown to readers are the rules
 * in src/knowledge/text/sentences.ts, and the abbreviations listed are the ones it
 * uses, so the explanation cannot drift from the logic.
 */

// Relative and type-only imports, so the test runner can load this module (see TESTING.md).
import { OPENING_WORDS, type ParagraphBreak } from "../../knowledge/text/paragraphs";
import { ABBREVIATIONS, type SentenceAnalysis, type SentenceRecord } from "../../knowledge/text/sentences";

const numbers = new Intl.NumberFormat("en");
const count = (value: number) => numbers.format(value);
const words = (value: number) => `${count(value)} ${value === 1 ? "word" : "words"}`;

/** How many sentences the list shows open; longer lists start folded so the page stays short. */
export const OPEN_LIST_UP_TO = 30;

export const page = {
  title: "Sentence Counter",
  /** One sentence, for listings such as the tools index. */
  summary: "Counts sentences and shows how many words each has, with the average, shortest and longest.",
  metaDescription:
    "Free sentence counter for academic writing: count sentences, see the words in each, and find the average, shortest and longest sentence, with abbreviations, decimals and quotations handled. Your text stays in your browser.",
  intro:
    "Paste or type your text to count its sentences and see how long each one is. Sentence count describes structure; it isn't a quality score. Your text never leaves your browser.",
  noScript: "The Sentence Counter counts as you type, which needs JavaScript. Turn on JavaScript to use it.",
  rulesHeading: "How sentences are found",
  limitsHeading: "What the counter can't get right",
  guidanceHeading: "Reading the results",
  privacyHeading: "Privacy",
  learnLink: "Learn about sentence structure and counting",
} as const;

export const form = {
  label: "Your text",
  hint: "Results update as you type. Leave a blank line between paragraphs.",
  placeholder: "Paste your text here. Dr. Smith's 3.14 result, e.g. this one, counts as part of one sentence.",
  breaksLegend: "Where does a paragraph end?",
  breaksHint: "A sentence never runs across a paragraph break. Choose “At every line break” if each line is a heading or a separate paragraph.",
  breaks: { "blank-line": "At a blank line", line: "At every line break" } satisfies Record<ParagraphBreak, string>,
} as const;

export const results = {
  heading: "Sentence structure",
  sentences: "Sentences",
  words: "Words",
  average: "Average words per sentence",
  shortest: "Shortest sentence",
  longest: "Longest sentence",
  none: "—",
  empty: { title: "No sentences yet", description: "Paste or type your text above. Sentences, words and the length of each sentence appear here as you type." },
  joinedTitle: "Lines joined into sentences",
  joined: "A line without end punctuation was joined to the line after it. That's right for a sentence wrapped across lines. If the line is a heading or a separate paragraph, add a blank line after it, or choose “At every line break” above.",
  listHeading: "Words in each sentence",
  listSummary: (value: number) => `Words in each sentence (${count(value)})`,
  columns: { sentence: "Sentence", opening: "Begins", words: "Words" },
  shortestNote: "Shortest",
  longestNote: "Longest",
  copySubject: "results",
  clear: "Clear text",
  cleared: "Text cleared.",
} as const;

/** Labels for the table of each sentence's words. */
export const tableLabels = (total: number) => ({
  summary: results.listSummary(total),
  caption: results.listHeading,
  columns: { item: results.columns.sentence, opening: results.columns.opening, words: results.columns.words },
  shortest: results.shortestNote,
  longest: results.longestNote,
  truncated: (shown: number, all: number) => `Showing the first ${count(shown)} of ${count(all)} sentences. Copy the results to get every sentence's words.`,
});

/** "4 words, sentence 3". */
export const describeRecord = (sentence: SentenceRecord) => `${words(sentence.words)}, sentence ${count(sentence.position)}`;

/** Every result as label and value, in the order shown, for copying and announcing. Missing values are a dash, not a misleading zero. */
export function resultLines(analysis: SentenceAnalysis): [string, string][] {
  return [
    [results.sentences, count(analysis.count)],
    [results.words, count(analysis.words)],
    [results.average, analysis.averageWords === null ? results.none : `${count(analysis.averageWords)} words`],
    [results.shortest, analysis.shortest ? describeRecord(analysis.shortest) : results.none],
    [results.longest, analysis.longest ? describeRecord(analysis.longest) : results.none],
  ];
}

/** The results as plain text, with each sentence's words, for the copy button. */
export function resultsText(analysis: SentenceAnalysis): string {
  return [
    ...resultLines(analysis).map(([label, value]) => `${label}: ${value === results.none ? "None" : value}`),
    ...analysis.sentences.map((sentence) => `Sentence ${count(sentence.position)}: ${words(sentence.words)}`),
  ].join("\n");
}

/** What screen readers hear once typing pauses. */
export const announcement = (analysis: SentenceAnalysis) =>
  resultLines(analysis)
    .slice(0, 3)
    .map(([label, value]) => `${label}: ${value === results.none ? "None" : value}.`)
    .join(" ");

/** The abbreviations the counter recognises, as readers write them. */
const LOWERCASE = new Set(["e.g", "i.e", "cf", "vs", "viz", "approx", "ca", "p", "pp"]);
const abbreviationList = ABBREVIATIONS.map((abbreviation) => `${LOWERCASE.has(abbreviation) ? abbreviation : `${abbreviation.charAt(0).toUpperCase()}${abbreviation.slice(1)}`}.`).join(", ");

export const rules: readonly string[] = [
  "A sentence ends with a full stop, question mark, exclamation mark or ellipsis, or a combination such as ?!, followed by a space or the end of a paragraph. Closing quotation marks and brackets stay with the sentence.",
  "Full stops inside numbers, web addresses and email addresses, as in 3.14, 2.5% or example.com, never end a sentence.",
  "End punctuation doesn't end a sentence when the next word starts with a lowercase letter, as after “e.g. the”, an ellipsis that continues, or a quoted question followed by “she asked”.",
  `A full stop doesn't end a sentence after these abbreviations: ${abbreviationList}; after a single initial, as in J. Smith; or after an initialism such as U.S.`,
  "A sentence never runs across a paragraph break. A single line break inside a paragraph is read as a space, so a sentence wrapped across lines stays whole.",
  `Words are counted exactly as the Word Counter counts them. The average is rounded to one decimal place; when sentences tie for shortest or longest, the first is shown. Each sentence in the list is identified by its first ${OPENING_WORDS} words.`,
];

export const limits: readonly string[] = [
  "A sentence that starts with a lowercase letter, such as “pH was 7.”, is joined to the sentence before it.",
  "A sentence that ends with an abbreviation, initial or initialism, as in “…in the U.K. Results…”, is joined to the next sentence. “Etc.” and “et al.” end a sentence when the next word starts with a capital.",
  "Headings, captions and list items without end punctuation are counted as sentences when they stand alone, and joined to the next line otherwise.",
  "Sentence endings in scripts with their own marks, such as the Devanagari danda (।), aren't recognised. The Word Counter and Text Statistics use a simpler sentence rule, so their counts can differ.",
];

export const guidance: readonly string[] = [
  "Sentence count and length describe structure; they don't measure quality. Good academic writing varies sentence length on purpose, and typical lengths differ between disciplines and kinds of writing.",
  "There is no correct number of words for a sentence. A very long sentence may be worth rereading for clarity, and a run of very short ones for flow, but neither is wrong in itself.",
  "Use the list to find sentences that stand out from the rest of your text, then judge them in context.",
];
