/**
 * All wording for the Readability Checker. Each formula's description quotes the
 * constants in src/knowledge/text/readability.ts, and the thresholds come from its
 * exports, so the explanation cannot drift from the calculation.
 */

// Relative and type-only imports, so the test runner can load this module (see TESTING.md).
import type { ParagraphBreak } from "../../knowledge/text/paragraphs";
import { POLYSYLLABLE_MINIMUM, RELIABLE_WORDS, SMOG_SENTENCES, fleschDescription, type Measure, type MeasureId, type ReadabilityAnalysis } from "../../knowledge/text/readability";

const numbers = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const format = (value: number) => numbers.format(value);
const DASH = "—";

export const page = {
  title: "Readability Checker",
  /** One sentence, for listings such as the tools index. */
  summary: "Estimates how hard your text is to read with five established formulas, and explains what each one measures.",
  metaDescription:
    "Free readability checker for academic writing: Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog, SMOG and the Automated Readability Index, with every formula and its limits explained. Your text stays in your browser.",
  intro:
    "Paste or type your text to see five established readability measures, with the counts behind them. Readability formulas estimate how hard text is to read from sentence and word length; they don't measure writing quality. Your text never leaves your browser.",
  noScript: "The Readability Checker analyses your text as you type, which needs JavaScript. Turn on JavaScript to use it.",
  methodHeading: "How the checker counts",
  limitsHeading: "What the scores can't tell you",
  guidanceHeading: "Reading the scores",
  privacyHeading: "Privacy",
  learnLink: "Learn about readability in academic writing",
} as const;

export const form = {
  label: "Your text",
  hint: "Results update as you type. Scores are most meaningful for at least 100 words.",
  placeholder: "Paste a paragraph or more of your writing here to see how the readability formulas score it.",
  breaksLegend: "Where does a paragraph end?",
  breaksHint: "Sentences never run across a paragraph break. Choose “At every line break” if each line is a heading or a separate paragraph.",
  breaks: { "blank-line": "At a blank line", line: "At every line break" } satisfies Record<ParagraphBreak, string>,
} as const;

export interface MeasureCopy {
  name: string;
  /** What the number means, in a few words. */
  scale: string;
  formula: string;
  variables: string;
  interpretation: string;
  limitation: string;
  source: string;
}

export const measures: Record<MeasureId, MeasureCopy> = {
  "flesch-reading-ease": {
    name: "Flesch Reading Ease",
    scale: "Higher scores mean easier text; most prose scores between 0 and 100.",
    formula: "206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)",
    variables: "Average sentence length in words, and average syllables per word.",
    interpretation: "Flesch described scores of 0–29 as very difficult, 30–49 difficult, 50–59 fairly difficult, 60–69 standard, 70–79 fairly easy, 80–89 easy and 90–100 very easy. Specialised academic writing often scores low.",
    limitation: "Calibrated in 1948 on 100-word samples of graded reading lessons for schoolchildren (the McCall-Crabbs lessons). Long technical terms lower the score even when readers know them.",
    source: "Flesch (1948), reprinted in DuBay (2007).",
  },
  "flesch-kincaid-grade": {
    name: "Flesch-Kincaid Grade Level",
    scale: "An approximate U.S. school grade.",
    formula: "0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59",
    variables: "Average sentence length in words, and average syllables per word.",
    interpretation: "Estimates the U.S. school grade at which a reader could understand the text; 12 is the end of high school, and higher values suggest university-level reading.",
    limitation: "Derived from U.S. Navy personnel reading technical training material. A grade is an approximation, not a property of the text.",
    source: "Kincaid, Fishburne, Rogers and Chissom (1975).",
  },
  "gunning-fog": {
    name: "Gunning Fog Index",
    scale: "Approximate years of formal education.",
    formula: "0.4 × (words ÷ sentences + 100 × complex words ÷ words)",
    variables: `Average sentence length in words, and the percentage of complex words: words of ${POLYSYLLABLE_MINIMUM} or more syllables.`,
    interpretation: "Estimates the school grade, or years of education, a reader needs to understand the text.",
    limitation: "Gunning's own instructions set aside some words, such as proper names; descriptions of those rules differ between sources, so this checker counts every word of three or more syllables, which can give a slightly higher score.",
    source: "Gunning (1952), as given by DuBay (2004).",
  },
  smog: {
    name: "SMOG grade",
    scale: "The school grade a reader needs to understand the text fully.",
    formula: `1.0430 × √(polysyllables × ${SMOG_SENTENCES} ÷ sentences) + 3.1291`,
    variables: `Polysyllables, words of ${POLYSYLLABLE_MINIMUM} or more syllables, scaled to ${SMOG_SENTENCES} sentences.`,
    interpretation: "Estimates the grade a reader must have reached to understand the text fully, a stricter standard than the other formulas, so SMOG grades tend to be higher.",
    limitation: `Normed on ${SMOG_SENTENCES}-sentence samples. McLaughlin described results for fewer sentences as statistically invalid, so no score is shown below ${SMOG_SENTENCES} sentences.`,
    source: "McLaughlin (1969).",
  },
  "automated-readability-index": {
    name: "Automated Readability Index",
    scale: "An approximate U.S. school grade.",
    formula: "4.71 × (characters ÷ words) + 0.5 × (words ÷ sentences) − 21.43",
    variables: "Characters per word, counting letters, numbers, symbols and punctuation but not spaces, and average sentence length in words.",
    interpretation: "Estimates a U.S. school grade from word length in characters rather than syllables, so it doesn't depend on syllable counting.",
    limitation: "Punctuation and symbols count as characters, as in the original typewriter-based method, so heavily punctuated or numeric text scores higher.",
    source: "Smith and Senter (1967), as given by Kincaid et al. (1975) and DuBay (2004).",
  },
};

export const results = {
  overviewHeading: "Readability measures",
  characteristicsHeading: "Text characteristics",
  detailsSummary: "How the scores are calculated",
  empty: { title: "No text yet", description: "Paste or type your text above. The readability measures, and the counts behind them, appear here as you type." },
  shortTitle: "Short text",
  short: (words: number) => `This text has ${format(words)} ${words === 1 ? "word" : "words"}. The formulas were built on samples of at least ${RELIABLE_WORDS} words, so treat these scores as rough until you add more text.`,
  joinedTitle: "Lines joined into sentences",
  joined: "A line without end punctuation was joined to the line after it, which lengthens that sentence. If the line is a heading, add a blank line after it, or choose “At every line break” above.",
  shortNote: "Short text: interpret with caution",
  tooFewSentences: (sentences: number) => `Needs at least ${SMOG_SENTENCES} sentences (this text has ${format(sentences)}).`,
  fleschDescription: (score: number) => `Flesch's description: ${fleschDescription(score)}`,
  formula: "Formula",
  variables: "Uses",
  interpretation: "Meaning",
  limitation: "Limitation",
  source: "Source",
  words: "Words",
  sentences: "Sentences",
  averageSentence: "Average sentence length",
  syllablesPerWord: "Average syllables per word",
  charactersPerWord: "Average characters per word",
  polysyllables: `Words of ${POLYSYLLABLE_MINIMUM}+ syllables`,
  longest: "Longest sentence",
  longestNote: (words: number, position: number) => `Your longest sentence, sentence ${format(position)}, has ${format(words)} ${words === 1 ? "word" : "words"}. If it carries several ideas, it may be worth rereading for clarity.`,
  copySubject: "results",
  clear: "Clear text",
  cleared: "Text cleared.",
} as const;

/** A measure's value as shown: the score to one decimal place, or a dash with the reason. */
export function measureValue(measure: Measure): string {
  return measure.value === null ? DASH : format(measure.value);
}

/** The note under a score: why it is missing or weak, or Flesch's description of it. */
export function measureNote(measure: Measure, analysis: ReadabilityAnalysis): string | null {
  if (measure.status === "too-few-sentences") return results.tooFewSentences(analysis.sentences);
  if (measure.status === "short-text") return results.shortNote;
  if (measure.id === "flesch-reading-ease" && measure.value !== null) return results.fleschDescription(measure.value);
  return null;
}

/** The counts behind the scores, as label and value. */
export function characteristicLines(analysis: ReadabilityAnalysis): [string, string][] {
  const or = (value: number | null, unit = "") => (value === null ? DASH : `${format(value)}${unit}`);
  return [
    [results.words, format(analysis.words)],
    [results.sentences, format(analysis.sentences)],
    [results.averageSentence, or(analysis.averageSentenceLength, " words")],
    [results.syllablesPerWord, or(analysis.averageSyllablesPerWord)],
    [results.charactersPerWord, or(analysis.averageCharactersPerWord)],
    [results.polysyllables, analysis.polysyllablePercentage === null ? DASH : `${format(analysis.polysyllables)} (${format(analysis.polysyllablePercentage)}%)`],
  ];
}

/** The results as plain text, for the copy button. */
export function resultsText(analysis: ReadabilityAnalysis): string {
  const measureLines = Object.values(analysis.measures).map((measure) => {
    const note = measure.status === "too-few-sentences" ? ` (${results.tooFewSentences(analysis.sentences)})` : measure.status === "short-text" ? " (short text)" : "";
    return `${measures[measure.id].name}: ${measure.value === null ? "None" : format(measure.value)}${note}`;
  });
  return [...measureLines, ...characteristicLines(analysis).map(([label, value]) => `${label}: ${value === DASH ? "None" : value}`)].join("\n");
}

/** What screen readers hear once typing pauses. */
export const announcement = (analysis: ReadabilityAnalysis) => {
  const ease = analysis.measures["flesch-reading-ease"];
  const grade = analysis.measures["flesch-kincaid-grade"];
  return `Words: ${format(analysis.words)}. Sentences: ${format(analysis.sentences)}. ${measures[ease.id].name}: ${ease.value === null ? "None" : format(ease.value)}. ${measures[grade.id].name}: ${grade.value === null ? "None" : format(grade.value)}.${analysis.shortText ? " Short text: interpret with caution." : ""}`;
};

export const method: readonly string[] = [
  "Words and sentences are counted exactly as in the Word Counter and the Sentence Counter, so the same text gives the same counts in every ResearchKit writing tool.",
  "Syllables are counted with a spelling-based rule: each group of vowels is a syllable, corrected for common patterns such as a silent final e. It is right for most common academic words, not for every word. Numbers and web or email addresses count as one syllable.",
  `A complex word (Gunning Fog) and a polysyllable (SMOG) are both words of ${POLYSYLLABLE_MINIMUM} or more syllables.`,
  "Characters for the Automated Readability Index are letters, numbers, symbols and punctuation, not spaces, counted as the Character Counter counts them.",
  `Scores are rounded to one decimal place. Texts under ${RELIABLE_WORDS} words are scored but flagged, because the formulas were built on longer samples; SMOG isn't shown under ${SMOG_SENTENCES} sentences.`,
];

export const limits: readonly string[] = [
  "Whether your writing is good. The formulas count sentence and word length; they can't see meaning, organization, accuracy or argument.",
  "Who your readers are. A score that is too hard for the general public may suit specialists in your field.",
  "Words that are long but familiar to your readers, such as technical terms, which the formulas treat as difficult.",
  "Text in languages other than English. The formulas and the syllable rule are English-specific.",
];

export const guidance: readonly string[] = [
  "These are indicators of how hard text is to read, not measures of academic writing quality. Academic text often scores as difficult because its subject requires precise, technical language.",
  "The formulas often disagree by a grade or more, because each weighs sentence length and word length differently. Look at where they agree, and at the counts behind them, rather than at any single score.",
  "No score is right or wrong in itself. A higher Flesch Reading Ease score isn't automatically better, and a lower one isn't automatically bad; what matters is whether the text suits its readers.",
];
