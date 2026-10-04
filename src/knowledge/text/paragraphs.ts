/**
 * The paragraph structure of a text: how many paragraphs it has, how long each is
 * in words, and which are shortest and longest. Pure functions; the text is never
 * changed.
 *
 * Rules
 * - Paragraph break: by default, a blank line (a line that is empty or holds only
 *   spaces). Lines with a single line break between them belong to the same
 *   paragraph, so text wrapped by hand is still one paragraph. Any number of blank
 *   lines counts as one break.
 * - Alternatively, every line break ends a paragraph. This matches text pasted from
 *   a word processor, where each paragraph is one line, and is the rule the Word
 *   Counter and Text Statistics use (text-statistics.ts).
 * - A paragraph must contain at least one letter or number, in any script. A block
 *   without one, such as a "***" scene break, is reported as ignored, not counted.
 * - Words follow the Word Counter's rule exactly (countWords), so a paragraph's words
 *   add up to the text's word count.
 * - The average is rounded to one decimal place and has no value (null) without
 *   paragraphs. When paragraphs tie for shortest or longest, the first is reported.
 *
 * The counter describes structure; it doesn't judge it. No length is treated as
 * right or wrong.
 */

import { LINE_BREAK, average, countWords, hasLetterOrNumber, paragraphsOf } from "./text-statistics";

export type ParagraphBreak = "blank-line" | "line";

export const PARAGRAPH_BREAKS: readonly ParagraphBreak[] = ["blank-line", "line"];

/** How many words of a paragraph's opening are kept to identify it. */
export const OPENING_WORDS = 8;

export interface ParagraphRecord {
  /** 1 for the first paragraph. */
  position: number;
  words: number;
  /** The paragraph's first words, to identify it, with "…" if it continues. */
  opening: string;
  /** Lines in the paragraph: more than one when it was wrapped by hand. */
  lines: number;
}

export interface ParagraphAnalysis {
  breaks: ParagraphBreak;
  paragraphs: ParagraphRecord[];
  count: number;
  words: number;
  /** Words per paragraph, to one decimal place; null without paragraphs. */
  averageWords: number | null;
  shortest: ParagraphRecord | null;
  longest: ParagraphRecord | null;
  /** Blocks, or lines, that hold no letter or number, such as "***", and so aren't counted. */
  ignored: number;
  /**
   * True when blank-line breaks are in use and the text has several lines but no
   * blank line, so it reads as one paragraph. Text pasted from a word processor
   * often looks like this, with one line per paragraph.
   */
  lineBreaksWithoutBlankLines: boolean;
}

const BLANK = /^\s*$/u;
const WORD_SEPARATOR = /\s+/u;

/** The text's blocks between blank lines, each with its lines. Blank lines themselves are separators. */
function blocks(text: string): string[][] {
  const found: string[][] = [];
  let current: string[] = [];
  for (const line of text.split(LINE_BREAK)) {
    if (BLANK.test(line)) {
      if (current.length > 0) found.push(current);
      current = [];
    } else current.push(line);
  }
  if (current.length > 0) found.push(current);
  return found;
}

/** A text's first words, to identify it in a list, with "…" if it continues. */
export function opening(text: string, words = OPENING_WORDS): string {
  const found = text.trim().split(WORD_SEPARATOR);
  return found.length > words ? `${found.slice(0, words).join(" ")}…` : found.join(" ");
}

export interface ParagraphGroups {
  /** Every non-blank block (or line), counted or not. */
  groups: string[][];
  /** The groups that are paragraphs: those with a letter or number. */
  paragraphs: string[][];
}

/** The text's paragraphs, each as its lines, by the chosen break rule. Shared with the Sentence Counter, whose sentences never cross a paragraph break. */
export function paragraphGroups(text: string, breaks: ParagraphBreak = "blank-line"): ParagraphGroups {
  const groups = breaks === "blank-line" ? blocks(text) : text.split(LINE_BREAK).filter((line) => !BLANK.test(line)).map((line) => [line]);
  const paragraphs = breaks === "blank-line" ? groups.filter((group) => hasLetterOrNumber(group.join("\n"))) : paragraphsOf(text).map((line) => [line]);
  return { groups, paragraphs };
}

const record = (lines: readonly string[], position: number): ParagraphRecord => {
  const text = lines.join("\n");
  return { position, words: countWords(text), opening: opening(text), lines: lines.length };
};

/** The paragraph structure of a text, with paragraphs ending at blank lines or at every line break. */
export function analyseParagraphs(text: string, breaks: ParagraphBreak = "blank-line"): ParagraphAnalysis {
  const { groups, paragraphs: counted } = paragraphGroups(text, breaks);
  const paragraphs = counted.map((group, index) => record(group, index + 1));
  const words = paragraphs.reduce((total, paragraph) => total + paragraph.words, 0);
  const shortest = paragraphs.reduce<ParagraphRecord | null>((min, paragraph) => (min === null || paragraph.words < min.words ? paragraph : min), null);
  const longest = paragraphs.reduce<ParagraphRecord | null>((max, paragraph) => (max === null || paragraph.words > max.words ? paragraph : max), null);

  return {
    breaks,
    paragraphs,
    count: paragraphs.length,
    words,
    averageWords: average(words, paragraphs.length),
    shortest,
    longest,
    ignored: groups.length - counted.length,
    lineBreaksWithoutBlankLines: breaks === "blank-line" && groups.length === 1 && groups[0].length > 1 && paragraphs.length === 1,
  };
}
