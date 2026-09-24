/**
 * Counts words, characters, sentences and paragraphs, and estimates reading and
 * speaking time. Pure functions: every rule is stated here so the interface can
 * explain it, and every rule is tested.
 *
 * Rules
 * - Word: a run of non-space characters containing at least one letter or number,
 *   in any script. "state-of-the-art", "don't" and "2020" are one word each; a
 *   lone dash or emoji is not a word.
 * - Character: what a reader sees as one character (a grapheme), so an emoji with
 *   a skin tone counts as one. "With spaces" includes spaces and tabs but not line
 *   breaks; "without spaces" excludes all whitespace.
 * - Paragraph: a line containing at least one letter or number. Blank lines and
 *   decorative lines such as "***" are ignored.
 * - Sentence: text ending in . ! ? or … (with any closing quotes or brackets),
 *   followed by a space or the end of a paragraph; a paragraph's final text counts
 *   even without end punctuation. A sentence must contain a letter or number.
 *
 * - Characters per word: letters and numbers only, so attached punctuation does not
 *   lengthen a word.
 * - Averages are rounded to one decimal place, and have no value (null) when there
 *   is nothing to average over. Page estimates assume a fixed number of words per page.
 *
 * Known limits
 * - Languages written without spaces between words (such as Chinese, Japanese or
 *   Thai) are counted as one word per unbroken run of text.
 * - Abbreviations such as "e.g." or "Dr." are counted as sentence endings.
 */

export const READING_WORDS_PER_MINUTE = 200;
export const SPEAKING_WORDS_PER_MINUTE = 130;

const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;
const WHITESPACE_RUN = /\s+/u;
const LINE_BREAK = /\r\n|[\n\r\u0085\u2028\u2029]/u;
const SENTENCE_END = /[.!?…]+[)\]"'”’»]*(?=\s|$)/gu;
const ONLY_WHITESPACE = /^\s+$/u;
const ONLY_LINE_BREAK = /^(?:\r\n|[\n\r\u0085\u2028\u2029])$/u;

const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" });

const hasLetterOrNumber = (text: string) => LETTER_OR_NUMBER.test(text);

/** The words in a text, by the word rule above. Every word count derives from this. */
function wordsOf(text: string): string[] {
  return text.split(WHITESPACE_RUN).filter(hasLetterOrNumber);
}

export function countWords(text: string): number {
  return wordsOf(text).length;
}

const ASCII_ONLY = /^[\x00-\x7f]*$/;
const ASCII_LETTERS_AND_NUMBERS = /[A-Za-z0-9]/g;
const LETTERS_AND_NUMBERS = /[\p{L}\p{N}]/gu;

/**
 * Characters that can join a neighbour into one visible character: combining marks,
 * joiners, the few "prepend" and spacing characters defined by Unicode, conjoining
 * Hangul jamo, and anything outside the Basic Multilingual Plane (emoji, flags).
 * A word without any of them has exactly one visible character per code point.
 */
const MAY_COMBINE =
  /[\p{M}‌‍؀-؅۝܏࢐࢑࣢ൎำຳᄀ-ᇿꥠ-꥿ힰ-퟿ﾞﾟ\u{10000}-\u{10ffff}]/u;

/**
 * The letters and numbers in a word, counted as a reader sees them, so attached
 * punctuation ("sources!", "don't") does not lengthen the word.
 */
function lettersIn(word: string): number {
  if (ASCII_ONLY.test(word)) return word.match(ASCII_LETTERS_AND_NUMBERS)?.length ?? 0;
  if (!MAY_COMBINE.test(word)) return word.match(LETTERS_AND_NUMBERS)?.length ?? 0;
  let count = 0;
  for (const { segment } of graphemes.segment(word)) {
    if (hasLetterOrNumber(segment)) count += 1;
  }
  return count;
}

export interface CharacterCounts {
  withSpaces: number;
  withoutSpaces: number;
}

/** Counts characters by full grapheme segmentation: exact, but too slow for long text on its own. */
function segmentCharacters(text: string): CharacterCounts {
  let withSpaces = 0;
  let withoutSpaces = 0;
  for (const { segment } of graphemes.segment(text)) {
    if (ONLY_LINE_BREAK.test(segment)) continue;
    withSpaces += 1;
    if (!ONLY_WHITESPACE.test(segment)) withoutSpaces += 1;
  }
  return { withSpaces, withoutSpaces };
}

const ASCII_OR_OTHER_RUNS = /[\x00-\x7f]+|[^\x00-\x7f]+/g;
const LINE_FEED = 10;
const CARRIAGE_RETURN = 13;
const isAsciiSpace = (code: number) => code === 32 || code === 9 || code === 11 || code === 12;

/**
 * Counts characters as full segmentation would, but quickly. ASCII characters
 * never join one another, so they are counted directly. Other characters can join
 * the character before them (a combining accent, an emoji modifier), so each run
 * of them is segmented together with that character, whose own count is removed.
 */
export function countCharacters(text: string): CharacterCounts {
  let withSpaces = 0;
  let withoutSpaces = 0;
  let previousAscii = "";

  for (const [run] of text.matchAll(ASCII_OR_OTHER_RUNS)) {
    if (run.charCodeAt(0) < 0x80) {
      for (let index = 0; index < run.length; index += 1) {
        const code = run.charCodeAt(index);
        if (code === LINE_FEED || code === CARRIAGE_RETURN) continue;
        withSpaces += 1;
        if (!isAsciiSpace(code)) withoutSpaces += 1;
      }
      previousAscii = run[run.length - 1];
    } else {
      const joined = segmentCharacters(previousAscii + run);
      const alreadyCounted = segmentCharacters(previousAscii);
      withSpaces += joined.withSpaces - alreadyCounted.withSpaces;
      withoutSpaces += joined.withoutSpaces - alreadyCounted.withoutSpaces;
      previousAscii = "";
    }
  }
  return { withSpaces, withoutSpaces };
}

function paragraphsOf(text: string): string[] {
  return text.split(LINE_BREAK).filter(hasLetterOrNumber);
}

export function countParagraphs(text: string): number {
  return paragraphsOf(text).length;
}

/** The sentences in a paragraph, by the sentence rule above. Every sentence count derives from this. */
function sentencesOf(paragraph: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  for (const match of paragraph.matchAll(SENTENCE_END)) {
    const end = match.index + match[0].length;
    const sentence = paragraph.slice(start, end);
    if (hasLetterOrNumber(sentence)) sentences.push(sentence);
    start = end;
  }
  const rest = paragraph.slice(start);
  if (hasLetterOrNumber(rest)) sentences.push(rest);
  return sentences;
}

export function countSentences(text: string): number {
  return paragraphsOf(text).reduce((total, paragraph) => total + sentencesOf(paragraph).length, 0);
}

/** An estimated duration: nothing to read, under a minute, or a whole number of minutes. */
export type Duration =
  | { kind: "none" }
  | { kind: "under-a-minute" }
  | { kind: "minutes"; minutes: number };

/**
 * Estimates time from a word count at a given pace. Under one minute's worth of
 * words is reported as such; otherwise the result is rounded to the nearest minute.
 */
export function estimateDuration(words: number, wordsPerMinute: number): Duration {
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new RangeError("wordsPerMinute must be a positive number");
  }
  if (!Number.isInteger(words) || words < 0) {
    throw new RangeError("words must be a whole number of zero or more");
  }
  if (words === 0) return { kind: "none" };
  if (words < wordsPerMinute) return { kind: "under-a-minute" };
  return { kind: "minutes", minutes: Math.round(words / wordsPerMinute) };
}

export const WORDS_PER_PAGE_SINGLE_SPACED = 500;
export const WORDS_PER_PAGE_DOUBLE_SPACED = 250;

/** Rounds to one decimal place, the precision used for averages and page estimates. */
const toOneDecimal = (value: number) => Math.round(value * 10) / 10;

/** An average rounded to one decimal place, or null when there is nothing to average over. */
const average = (total: number, count: number): number | null => (count === 0 ? null : toOneDecimal(total / count));

const longest = (values: readonly number[]) => values.reduce((max, value) => Math.max(max, value), 0);

export interface TextStatistics {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: Duration;
  speakingTime: Duration;
  /** Words divided by sentences, to one decimal place; null without sentences. */
  averageWordsPerSentence: number | null;
  /** Letters and numbers per word, to one decimal place; null without words. */
  averageCharactersPerWord: number | null;
  /** Sentences divided by paragraphs, to one decimal place; null without paragraphs. */
  averageSentencesPerParagraph: number | null;
  longestSentenceWords: number;
  longestParagraphWords: number;
  /** Pages at the stated words per page, to one decimal place. */
  estimatedPagesSingleSpaced: number;
  estimatedPagesDoubleSpaced: number;
}

/**
 * Every statistic, from a single pass over the text's words, paragraphs and
 * sentences. Derived measures reuse those same parts, so they always agree with
 * the counts they are derived from.
 */
export function analyseText(text: string): TextStatistics {
  const words = wordsOf(text);
  const paragraphs = paragraphsOf(text);
  const sentences = paragraphs.flatMap(sentencesOf);
  const characters = countCharacters(text);
  const wordCount = words.length;
  const letters = words.reduce((total, word) => total + lettersIn(word), 0);

  return {
    words: wordCount,
    charactersWithSpaces: characters.withSpaces,
    charactersWithoutSpaces: characters.withoutSpaces,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    readingTime: estimateDuration(wordCount, READING_WORDS_PER_MINUTE),
    speakingTime: estimateDuration(wordCount, SPEAKING_WORDS_PER_MINUTE),
    averageWordsPerSentence: average(wordCount, sentences.length),
    averageCharactersPerWord: average(letters, wordCount),
    averageSentencesPerParagraph: average(sentences.length, paragraphs.length),
    longestSentenceWords: longest(sentences.map(countWords)),
    longestParagraphWords: longest(paragraphs.map(countWords)),
    estimatedPagesSingleSpaced: toOneDecimal(wordCount / WORDS_PER_PAGE_SINGLE_SPACED),
    estimatedPagesDoubleSpaced: toOneDecimal(wordCount / WORDS_PER_PAGE_DOUBLE_SPACED),
  };
}
