/**
 * Reads a title once, for every check that follows: its words, the phrases the
 * lexicon flags, repeated concepts, grammar indicators and abbreviations. Each finding
 * quotes the title's own words, so the checks can explain without rewriting.
 */

import { STOPWORDS, containsPhrase, normalise, words } from "../question-text";
import { AMBIGUOUS_WORDS, BROAD_WORDS, BUZZWORDS, CAUSAL_WORDS, FILLER_PHRASES, FIRST_PERSON, INFORMAL_WORDS, TAUTOLOGIES } from "./lexicon";
import { classifyTitle, type PatternMatch } from "./patterns";

export interface GrammarIndicator {
  id: "repeated-word" | "unbalanced-brackets" | "unbalanced-quotes" | "full-stop" | "space-before-punctuation" | "missing-space" | "lowercase-start" | "all-capitals" | "doubled-punctuation";
  /** What was found, quoting the title. */
  text: string;
}

export interface TitleAnalysis {
  title: string;
  words: string[];
  /** Words other than articles, prepositions and similar. */
  contentWords: string[];
  fillers: string[];
  tautologies: string[];
  ambiguous: string[];
  informal: string[];
  firstPerson: string[];
  buzzwords: string[];
  broad: string[];
  causal: string[];
  /** Content words used more than once, such as “students … students”. */
  repeated: string[];
  abbreviations: string[];
  grammar: GrammarIndicator[];
  patterns: PatternMatch[];
  /** Parts after a colon or dash that introduces a subtitle. */
  hasSubtitle: boolean;
}

const found = (title: string, phrases: readonly string[]) => [...new Set(phrases.filter((phrase) => containsPhrase(title, phrase)))];

/** A crude stem, so that “student” and “students” count as one concept. Only compared, never shown. */
const stem = (word: string) => word.replace(/(?:ies|es|s)$/, "");

/** Words in capitals, such as “HIV” or “SMEs”: two or more capital letters, optionally with digits or a plural “s”. */
const ABBREVIATION = new RegExp("(?:^|[^\\p{L}\\p{N}])(\\p{Lu}[\\p{Lu}\\p{N}&-]*\\p{Lu}[\\p{Lu}\\p{N}-]*s?)(?![\\p{L}\\p{N}])", "gu");
// Built with the constructor because Unicode property escapes need ES2018 syntax.
const LOWERCASE_START = new RegExp("^\\p{Ll}", "u");
const NOT_LETTER = new RegExp("[^\\p{L}]", "gu");

/** Short words that look like abbreviations only because they are written in capitals for emphasis. */
const ROMAN_NUMERAL = /^(?:I{1,3}|IV|VI{0,3}|IX|X{1,3})$/;

function grammarIndicators(title: string): GrammarIndicator[] {
  const found: GrammarIndicator[] = [];
  const repeated = new RegExp("(?:^|[^\\p{L}])(\\p{L}+)\\s+\\1(?![\\p{L}])", "iu").exec(title);
  if (repeated) found.push({ id: "repeated-word", text: `“${repeated[1]} ${repeated[1]}”` });
  const count = (character: string) => title.split(character).length - 1;
  if (count("(") !== count(")") || count("[") !== count("]")) found.push({ id: "unbalanced-brackets", text: "an opening or closing bracket without its pair" });
  if ((count("“") !== count("”")) || count('"') % 2 === 1) found.push({ id: "unbalanced-quotes", text: "a quotation mark without its pair" });
  if (/[^.]\.$/.test(title)) found.push({ id: "full-stop", text: "a full stop at the end" });
  const before = /\s[,;:?!]/.exec(title);
  if (before) found.push({ id: "space-before-punctuation", text: `a space before “${before[0].trim()}”` });
  const after = /[,;:][^\s\d]/.exec(title);
  if (after) found.push({ id: "missing-space", text: `no space after “${after[0][0]}”` });
  if (LOWERCASE_START.test(title)) found.push({ id: "lowercase-start", text: `a lower-case first letter, “${title[0]}”` });
  const letters = title.replace(NOT_LETTER, "");
  if (letters.length > 12 && letters === letters.toUpperCase()) found.push({ id: "all-capitals", text: "every letter in capitals" });
  const doubled = /([,;:!?])\1|[,;:][,;:]/.exec(title);
  if (doubled) found.push({ id: "doubled-punctuation", text: `“${doubled[0]}”` });
  return found;
}

export function analyseTitle(rawTitle: string): TitleAnalysis {
  const title = normalise(rawTitle);
  const titleWords = words(title);
  const contentWords = titleWords.filter((word) => !STOPWORDS.has(word) && word.length > 2);
  const seen = new Map<string, string>();
  const repeated: string[] = [];
  for (const word of contentWords) {
    const key = stem(word);
    if (seen.has(key) && !repeated.includes(seen.get(key)!)) repeated.push(seen.get(key)!);
    else if (!seen.has(key)) seen.set(key, word);
  }
  const abbreviations = [...new Set([...title.matchAll(ABBREVIATION)].map((match) => match[1]).filter((word) => !ROMAN_NUMERAL.test(word)))];
  const allCapitals = grammarIndicators(title).some((indicator) => indicator.id === "all-capitals");

  return {
    title,
    words: titleWords,
    contentWords,
    fillers: found(title, FILLER_PHRASES).filter((phrase, _, list) => !list.some((other) => other !== phrase && other.includes(phrase))),
    tautologies: found(title, TAUTOLOGIES),
    ambiguous: found(title, AMBIGUOUS_WORDS),
    informal: found(title, INFORMAL_WORDS),
    firstPerson: FIRST_PERSON.filter((word) => titleWords.includes(word)),
    buzzwords: found(title, BUZZWORDS),
    broad: found(title, BROAD_WORDS),
    causal: found(title, CAUSAL_WORDS),
    repeated,
    // A title written entirely in capitals has no abbreviations to tell apart.
    abbreviations: allCapitals ? [] : abbreviations,
    grammar: grammarIndicators(title),
    patterns: classifyTitle(title),
    hasSubtitle: /\S\s*(?::|\s[–—-]\s)\s*\S/.test(title),
  };
}
