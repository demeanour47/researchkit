/**
 * All wording for the Paragraph Counter. The counting rules shown to readers are
 * the rules in src/knowledge/text/paragraphs.ts, and the figures they quote come
 * from its constants, so the explanation cannot drift from the logic.
 */

// Relative and type-only imports, so the test runner can load this module (see TESTING.md).
import { OPENING_WORDS, type ParagraphAnalysis, type ParagraphBreak, type ParagraphRecord } from "../../knowledge/text/paragraphs";

const numbers = new Intl.NumberFormat("en");
const count = (value: number) => numbers.format(value);
const words = (value: number) => `${count(value)} ${value === 1 ? "word" : "words"}`;

export const page = {
  title: "Paragraph Counter",
  /** One sentence, for listings such as the tools index. */
  summary: "Counts paragraphs and shows how many words each has, with the average, shortest and longest.",
  metaDescription:
    "Free paragraph counter for academic writing: count paragraphs, see the words in each, and find the average, shortest and longest paragraph. Your text stays in your browser.",
  intro:
    "Paste or type your text to count its paragraphs and see how its words are spread across them. Paragraph count is a structural measure, not a quality score. Your text never leaves your browser.",
  noScript: "The Paragraph Counter counts as you type, which needs JavaScript. Turn on JavaScript to use it.",
  rulesHeading: "How paragraphs are counted",
  limitsHeading: "What the counter can't know",
  guidanceHeading: "Reading the results",
  privacyHeading: "Privacy",
  learnLink: "Learn about paragraph structure and counting",
} as const;

export const form = {
  label: "Your text",
  hint: "Leave a blank line between paragraphs. Results update as you type.",
  placeholder: "Paste your text here.\n\nLeave a blank line between paragraphs, as in this example.",
  breaksLegend: "Where does a paragraph end?",
  breaksHint: "Text pasted from a word processor often has each paragraph on one line, with no blank lines between them.",
  breaks: { "blank-line": "At a blank line", line: "At every line break" } satisfies Record<ParagraphBreak, string>,
} as const;

export const results = {
  heading: "Paragraph structure",
  paragraphs: "Paragraphs",
  words: "Words",
  average: "Average words per paragraph",
  shortest: "Shortest paragraph",
  longest: "Longest paragraph",
  empty: { title: "No paragraphs yet", description: "Paste or type your text above. Paragraphs, words and the length of each paragraph appear here as you type." },
  lineBreaksTitle: "Counted as one paragraph",
  lineBreaks: "Your text has line breaks but no blank lines, so it is counted as one paragraph. If each line is a paragraph, as in text pasted from a word processor, choose “At every line break” above.",
  ignored: (value: number) => `${count(value)} ${value === 1 ? "block has" : "blocks have"} no letters or numbers, such as *** or ---, and ${value === 1 ? "isn't" : "aren't"} counted.`,
  listHeading: "Words in each paragraph",
  listSummary: (value: number) => `Words in each paragraph (${count(value)})`,
  columns: { paragraph: "Paragraph", opening: "Begins", words: "Words", note: "Note" },
  shortestNote: "Shortest",
  longestNote: "Longest",
  copySubject: "results",
  clear: "Clear text",
  cleared: "Text cleared.",
} as const;

/** "42 words, paragraph 3". */
export const describeRecord = (paragraph: ParagraphRecord) => `${words(paragraph.words)}, paragraph ${count(paragraph.position)}`;

/** Every result as label and value, in the order shown, for copying and announcing. */
export function resultLines(analysis: ParagraphAnalysis): [string, string][] {
  return [
    [results.paragraphs, count(analysis.count)],
    [results.words, count(analysis.words)],
    [results.average, analysis.averageWords === null ? "None" : `${count(analysis.averageWords)} words`],
    [results.shortest, analysis.shortest ? describeRecord(analysis.shortest) : "None"],
    [results.longest, analysis.longest ? describeRecord(analysis.longest) : "None"],
  ];
}

/** The results as plain text, with each paragraph's words, for the copy button. */
export function resultsText(analysis: ParagraphAnalysis): string {
  return [
    ...resultLines(analysis).map(([label, value]) => `${label}: ${value}`),
    ...analysis.paragraphs.map((paragraph) => `Paragraph ${count(paragraph.position)}: ${words(paragraph.words)}`),
  ].join("\n");
}

/** What screen readers hear once typing pauses. */
export const announcement = (analysis: ParagraphAnalysis) =>
  resultLines(analysis)
    .slice(0, 3)
    .map(([label, value]) => `${label}: ${value}.`)
    .join(" ");

export const rules: readonly string[] = [
  "A paragraph ends at a blank line. Lines with only a single line break between them stay in the same paragraph, so text wrapped by hand counts once. Several blank lines in a row count as one break.",
  "Choose “At every line break” when each paragraph is on its own line, as in text pasted from a word processor. This is the rule the Word Counter and Text Statistics use, so their paragraph counts match it.",
  "A paragraph needs at least one letter or number. Blank lines and decorative lines such as *** are not paragraphs.",
  "Words are counted exactly as the Word Counter counts them, so the paragraphs' words add up to the total.",
  `The average is rounded to one decimal place. When paragraphs tie for shortest or longest, the first is shown. Each paragraph in the list is identified by its first ${OPENING_WORDS} words.`,
];

export const limits: readonly string[] = [
  "Where your paragraphs end in the original document. The counter sees only the text you paste, and some editors don't copy paragraph breaks the way they display them.",
  "Headings, captions, block quotations and list items, which look like short paragraphs when pasted.",
  "Whether a paragraph works. It measures length, not unity, coherence or argument.",
];

export const guidance: readonly string[] = [
  "Paragraph count is a structural measure, not a quality score. A strong academic paragraph usually develops one main idea, but paragraph length varies by discipline, purpose and writing context.",
  "There is no correct number of words for a paragraph. An unusually long or short one may be worth a second look: a very long paragraph may combine several ideas, and a very short one may need developing or joining to its neighbour.",
  "Compare paragraphs within your own text, and with the expectations of your discipline or assignment, rather than with a fixed rule.",
];
