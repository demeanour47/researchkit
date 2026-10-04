/**
 * Sentence segmentation for academic text, and sentence statistics. Pure and
 * deterministic: the same text always gives the same sentences, and the text is
 * never changed. This is pattern matching, not language parsing; the rules and
 * their limits are stated here so the interface can explain them.
 *
 * Rules
 * - A sentence can end at . ! ? or … , or a run of them such as ?! or ..., with any
 *   closing quotation marks or brackets, followed by a space or the end of the
 *   paragraph. Punctuation followed directly by another character, as in 3.14,
 *   2.5%, example.com or user@example.com, never ends a sentence.
 * - A candidate ending is not a sentence ending when:
 *   - the next word begins with a lowercase letter, as after "e.g. the", an ellipsis
 *     that continues ("unclear... however") or a quoted question ("Why?" she asked);
 *   - the word before it is an abbreviation that precedes what it refers to, such as
 *     Dr. or Fig. (ABBREVIATIONS), a single initial (J. Smith) or an initialism (U.S.);
 *   - it follows a number at the very start of a paragraph, as in a numbered list.
 * - A sentence never crosses a paragraph break. Paragraphs end at blank lines or at
 *   every line break, as in the Paragraph Counter; a single line break inside a
 *   paragraph is read as a space, so a hand-wrapped sentence stays whole.
 * - The paragraph's final text is a sentence even without end punctuation. A
 *   sentence must contain a letter or number.
 * - Words follow the Word Counter's rule exactly (countWords), so the sentences'
 *   words add up to the text's word count.
 *
 * Known limits
 * - A sentence that begins with a lowercase letter, such as "pH was 7.", is joined to
 *   the sentence before it.
 * - A sentence that ends with an abbreviation, initial or initialism, as in "…in the
 *   U.K. Results…", is joined to the next sentence.
 * - "etc." and "et al." end a sentence when the next word is capitalised, which is
 *   usually right but not always.
 * - Sentence endings in scripts with their own marks, such as the Devanagari danda
 *   (।) or the Chinese full stop (。), aren't recognised.
 *
 * The Word Counter and Text Statistics use a simpler rule (text-statistics.ts), in
 * which every line ends a sentence and abbreviations end sentences too, so their
 * sentence counts can differ from this one's.
 */

import { OPENING_WORDS, opening, paragraphGroups, type ParagraphBreak } from "./paragraphs";
import { average, countWords, hasLetterOrNumber } from "./text-statistics";

/**
 * Abbreviations that precede the word they refer to, so a full stop after them
 * doesn't end a sentence: titles before names, and labels before numbers or examples
 * that academic writing uses constantly. Kept small on purpose; compared without case.
 */
export const ABBREVIATIONS: readonly string[] = [
  "dr", "mr", "mrs", "ms", "prof", "st",
  "e.g", "i.e", "cf", "vs", "viz", "approx", "ca",
  "fig", "figs", "eq", "eqs", "no", "nos", "vol", "vols", "p", "pp", "ch", "sec", "para",
];

const ABBREVIATION_SET = new Set(ABBREVIATIONS);

/** A run of end punctuation, any closing quotes or brackets, then a space or the end. */
const CANDIDATE = /[.!?…]+[)\]"'”’»]*(?=\s|$)/gu;
const STARTS_LOWERCASE = /^[("'“‘[]*\p{Ll}/u;
const SINGLE_INITIAL = /^\p{Lu}$/u;
const INITIALISM = /^(?:\p{Lu}\.)+\p{Lu}$/u;
const NUMBER = /^\d+$/u;

export interface SentenceRecord {
  /** 1 for the first sentence. */
  position: number;
  /** The sentence as written, with line breaks inside it read as spaces. */
  text: string;
  words: number;
  /** The paragraph it belongs to, 1 for the first. */
  paragraph: number;
}

export interface SentenceAnalysis {
  breaks: ParagraphBreak;
  sentences: SentenceRecord[];
  count: number;
  words: number;
  /** Words per sentence, to one decimal place; null without sentences. */
  averageWords: number | null;
  shortest: SentenceRecord | null;
  longest: SentenceRecord | null;
  paragraphs: number;
  /**
   * True when a line without end punctuation was joined to the next line, as a
   * heading would be in text without blank lines. Ending paragraphs at every line
   * break keeps such lines separate.
   */
  joinedUnpunctuatedLine: boolean;
}

const ENDS_WITH_MARK = /[.!?…:;][)\]"'”’»]*$/u;

/** The word immediately before a candidate ending, without opening brackets or quotes. */
const wordBefore = (paragraph: string, at: number) => (paragraph.slice(0, at).split(/\s+/u).pop() ?? "").replace(/^[("'“‘[]+/u, "");

/** Whether a candidate ending really ends the sentence. */
function endsSentence(paragraph: string, start: number, end: number, sentenceStart: number): boolean {
  const following = paragraph.slice(end).trimStart();
  if (following === "") return true;
  if (STARTS_LOWERCASE.test(following)) return false;
  const marks = paragraph.slice(start, end).replace(/[)\]"'”’»]+$/u, "");
  if (marks !== ".") return true;
  const before = wordBefore(paragraph, start);
  if (ABBREVIATION_SET.has(before.toLocaleLowerCase("en"))) return false;
  if (SINGLE_INITIAL.test(before) || INITIALISM.test(before)) return false;
  // A number opening the paragraph is a list number ("1. Introduction"), not a sentence.
  if (NUMBER.test(before) && paragraph.slice(sentenceStart, start).trim() === before) return false;
  return true;
}

/** The sentences in one paragraph, its lines joined by spaces. */
function sentencesIn(paragraph: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  for (const match of paragraph.matchAll(CANDIDATE)) {
    const end = match.index + match[0].length;
    if (!endsSentence(paragraph, match.index, end, start)) continue;
    const sentence = paragraph.slice(start, end).trim();
    if (hasLetterOrNumber(sentence)) sentences.push(sentence);
    start = end;
  }
  const rest = paragraph.slice(start).trim();
  if (hasLetterOrNumber(rest)) sentences.push(rest);
  return sentences;
}

/** The text's sentences, in order, with paragraphs ending at blank lines or every line break. */
export function segmentSentences(text: string, breaks: ParagraphBreak = "blank-line"): SentenceRecord[] {
  const records: SentenceRecord[] = [];
  paragraphGroups(text, breaks).paragraphs.forEach((lines, index) => {
    for (const sentence of sentencesIn(lines.map((line) => line.trim()).join(" "))) {
      records.push({ position: records.length + 1, text: sentence, words: countWords(sentence), paragraph: index + 1 });
    }
  });
  return records;
}

/** Sentence count, words, the average, and the shortest and longest sentences (the first when they tie). */
export function analyseSentences(text: string, breaks: ParagraphBreak = "blank-line"): SentenceAnalysis {
  const sentences = segmentSentences(text, breaks);
  const words = sentences.reduce((total, sentence) => total + sentence.words, 0);
  return {
    breaks,
    sentences,
    count: sentences.length,
    words,
    averageWords: average(words, sentences.length),
    shortest: sentences.reduce<SentenceRecord | null>((min, sentence) => (min === null || sentence.words < min.words ? sentence : min), null),
    longest: sentences.reduce<SentenceRecord | null>((max, sentence) => (max === null || sentence.words > max.words ? sentence : max), null),
    paragraphs: paragraphGroups(text, breaks).paragraphs.length,
    joinedUnpunctuatedLine: paragraphGroups(text, breaks).paragraphs.some((lines) => lines.slice(0, -1).some((line) => hasLetterOrNumber(line) && !ENDS_WITH_MARK.test(line.trim()))),
  };
}

/** A sentence's first words, to identify it in a list. */
export const sentenceOpening = (sentence: SentenceRecord) => opening(sentence.text, OPENING_WORDS);
