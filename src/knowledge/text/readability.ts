/**
 * Readability formulas for English text: estimates of how hard a text is to read,
 * from sentence length, word length and syllables. They describe difficulty; they
 * don't measure quality, correctness or how good the writing is.
 *
 * Formulas, each verified against an original or authoritative reprinted source
 * (see content/guides/readability-in-academic-writing.ts for full references):
 *
 *   Flesch Reading Ease          206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / words)
 *     Flesch (1948), reprinted in DuBay (2007); Flesch wrote the last term as 0.846 per 100 words.
 *   Flesch-Kincaid Grade Level   0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59
 *     Kincaid, Fishburne, Rogers and Chissom (1975), Table 3.
 *   Gunning Fog Index            0.4 × (words / sentences + 100 × complex words / words)
 *     Gunning (1952), as given by DuBay (2004): complex words have more than two syllables.
 *   SMOG grade                   1.0430 × √(polysyllables × 30 / sentences) + 3.1291
 *     McLaughlin (1969); polysyllables have three or more syllables; normed on 30 sentences.
 *   Automated Readability Index  4.71 × (characters / words) + 0.5 × (words / sentences) − 21.43
 *     Smith and Senter (1967), as given in Kincaid et al. (1975), Table 3 (the "old" ARI, not the
 *     Navy recalculation), and DuBay (2004); characters ("strokes") are letters, numbers, symbols
 *     and punctuation, not spaces (Kincaid et al., 1975, Appendix).
 *
 * Counting is shared with ResearchKit's other text tools, so the same text gives the
 * same counts everywhere: words by the Word Counter's rule (wordsOf), sentences by the
 * Sentence Counter's segmentation (segmentSentences), characters as the Character
 * Counter counts them without spaces (countCharacters), and syllables by the heuristic
 * in syllables.ts. A complex word (Fog) and a polysyllable (SMOG) are the same thing
 * here: a word of three or more syllables.
 *
 * Scores are rounded to one decimal place. A score is null when there is nothing to
 * calculate; it is flagged, not hidden, when the text is shorter than the samples the
 * formula was built on, except SMOG, which isn't shown for fewer than 30 sentences
 * because McLaughlin described such results as statistically invalid.
 */

import type { ParagraphBreak } from "./paragraphs";
import { analyseSentences, type SentenceRecord } from "./sentences";
import { countSyllables } from "./syllables";
import { countCharacters, wordsOf } from "./text-statistics";

/** Flesch built his formulas on samples of 100 words; shorter texts give weak estimates. */
export const RELIABLE_WORDS = 100;
/** SMOG was normed on 30-sentence samples (McLaughlin, 1969). */
export const SMOG_SENTENCES = 30;
/** Words of this many syllables or more are complex (Fog) and polysyllabic (SMOG). */
export const POLYSYLLABLE_MINIMUM = 3;

const round = (value: number, places = 1) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Flesch Reading Ease, unrounded; null without words or sentences. Higher means easier. */
export function fleschReadingEase(words: number, sentences: number, syllables: number): number | null {
  if (words <= 0 || sentences <= 0) return null;
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

/** Flesch-Kincaid Grade Level, unrounded; null without words or sentences. An approximate U.S. school grade. */
export function fleschKincaidGrade(words: number, sentences: number, syllables: number): number | null {
  if (words <= 0 || sentences <= 0) return null;
  return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

/** Gunning Fog Index, unrounded; null without words or sentences. Approximate years of schooling. */
export function gunningFog(words: number, sentences: number, complexWords: number): number | null {
  if (words <= 0 || sentences <= 0) return null;
  return 0.4 * (words / sentences + 100 * (complexWords / words));
}

/** SMOG grade, unrounded; null without sentences. The grade a reader needs to understand the text fully. */
export function smogGrade(sentences: number, polysyllables: number): number | null {
  if (sentences <= 0) return null;
  return 1.043 * Math.sqrt(polysyllables * (SMOG_SENTENCES / sentences)) + 3.1291;
}

/** Automated Readability Index, unrounded; null without words or sentences. An approximate U.S. school grade. */
export function automatedReadabilityIndex(characters: number, words: number, sentences: number): number | null {
  if (words <= 0 || sentences <= 0) return null;
  return 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43;
}

export type MeasureId = "flesch-reading-ease" | "flesch-kincaid-grade" | "gunning-fog" | "smog" | "automated-readability-index";

export const MEASURES: readonly MeasureId[] = ["flesch-reading-ease", "flesch-kincaid-grade", "gunning-fog", "smog", "automated-readability-index"];

/**
 * Whether a score can be read: "reliable" when the text is at least as long as the
 * formula's samples; "short-text" when it was calculated from less; "too-few-sentences"
 * when SMOG lacks the sentences it needs, so no score is given; "no-text" otherwise.
 */
export type MeasureStatus = "reliable" | "short-text" | "too-few-sentences" | "no-text";

export interface Measure {
  id: MeasureId;
  /** Rounded to one decimal place; null when no score is given. */
  value: number | null;
  status: MeasureStatus;
}

/** Flesch's own descriptions of Reading Ease ranges, from The Art of Readable Writing (1949), as reproduced by DuBay (2007). */
export type FleschDescription = "very difficult" | "difficult" | "fairly difficult" | "standard" | "fairly easy" | "easy" | "very easy";

export function fleschDescription(score: number): FleschDescription {
  if (score < 30) return "very difficult";
  if (score < 50) return "difficult";
  if (score < 60) return "fairly difficult";
  if (score < 70) return "standard";
  if (score < 80) return "fairly easy";
  if (score < 90) return "easy";
  return "very easy";
}

export interface ReadabilityAnalysis {
  breaks: ParagraphBreak;
  words: number;
  sentences: number;
  syllables: number;
  /** Letters, numbers, symbols and punctuation, without spaces: ARI's characters. */
  characters: number;
  /** Words of three or more syllables. */
  polysyllables: number;
  /** Words per sentence, to one decimal place; null without sentences. */
  averageSentenceLength: number | null;
  /** Syllables per word, to two decimal places; null without words. */
  averageSyllablesPerWord: number | null;
  /** Characters per word, to one decimal place; null without words. */
  averageCharactersPerWord: number | null;
  /** Polysyllables as a percentage of words, to one decimal place; null without words. */
  polysyllablePercentage: number | null;
  longestSentence: SentenceRecord | null;
  /** True when the text has fewer words than the formulas' samples. */
  shortText: boolean;
  /** True when a heading-like line was joined into a sentence (see sentences.ts). */
  joinedUnpunctuatedLine: boolean;
  measures: Record<MeasureId, Measure>;
}

const measure = (id: MeasureId, raw: number | null, status: MeasureStatus): Measure => ({ id, value: raw === null || status === "too-few-sentences" ? null : round(raw), status: raw === null ? "no-text" : status });

/** Every measure for a text, with the counts behind them. */
export function analyseReadability(text: string, breaks: ParagraphBreak = "blank-line"): ReadabilityAnalysis {
  const sentenceAnalysis = analyseSentences(text, breaks);
  const words = wordsOf(text);
  const syllableCounts = words.map(countSyllables);
  const wordCount = words.length;
  const sentences = sentenceAnalysis.count;
  const syllables = syllableCounts.reduce((total, value) => total + value, 0);
  const polysyllables = syllableCounts.filter((value) => value >= POLYSYLLABLE_MINIMUM).length;
  const characters = countCharacters(text).withoutSpaces;
  const shortText = wordCount > 0 && wordCount < RELIABLE_WORDS;
  const lengthStatus: MeasureStatus = shortText ? "short-text" : "reliable";

  return {
    breaks,
    words: wordCount,
    sentences,
    syllables,
    characters,
    polysyllables,
    averageSentenceLength: sentences === 0 ? null : round(wordCount / sentences),
    averageSyllablesPerWord: wordCount === 0 ? null : round(syllables / wordCount, 2),
    averageCharactersPerWord: wordCount === 0 ? null : round(characters / wordCount),
    polysyllablePercentage: wordCount === 0 ? null : round((100 * polysyllables) / wordCount),
    longestSentence: sentenceAnalysis.longest,
    shortText,
    joinedUnpunctuatedLine: sentenceAnalysis.joinedUnpunctuatedLine,
    measures: {
      "flesch-reading-ease": measure("flesch-reading-ease", fleschReadingEase(wordCount, sentences, syllables), lengthStatus),
      "flesch-kincaid-grade": measure("flesch-kincaid-grade", fleschKincaidGrade(wordCount, sentences, syllables), lengthStatus),
      "gunning-fog": measure("gunning-fog", gunningFog(wordCount, sentences, polysyllables), lengthStatus),
      smog: measure("smog", wordCount === 0 ? null : smogGrade(sentences, polysyllables), sentences < SMOG_SENTENCES ? "too-few-sentences" : lengthStatus),
      "automated-readability-index": measure("automated-readability-index", automatedReadabilityIndex(characters, wordCount, sentences), lengthStatus),
    },
  };
}
