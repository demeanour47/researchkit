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

export function countWords(text: string): number {
  return text.split(WHITESPACE_RUN).filter(hasLetterOrNumber).length;
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

function sentencesInParagraph(paragraph: string): number {
  let count = 0;
  let start = 0;
  for (const match of paragraph.matchAll(SENTENCE_END)) {
    const end = match.index + match[0].length;
    if (hasLetterOrNumber(paragraph.slice(start, end))) count += 1;
    start = end;
  }
  if (hasLetterOrNumber(paragraph.slice(start))) count += 1;
  return count;
}

export function countSentences(text: string): number {
  return paragraphsOf(text).reduce((total, paragraph) => total + sentencesInParagraph(paragraph), 0);
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

export interface TextStatistics {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: Duration;
  speakingTime: Duration;
}

export function analyseText(text: string): TextStatistics {
  const words = countWords(text);
  const characters = countCharacters(text);
  return {
    words,
    charactersWithSpaces: characters.withSpaces,
    charactersWithoutSpaces: characters.withoutSpaces,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime: estimateDuration(words, READING_WORDS_PER_MINUTE),
    speakingTime: estimateDuration(words, SPEAKING_WORDS_PER_MINUTE),
  };
}
