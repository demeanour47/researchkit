/**
 * The words and phrases the title checks look for. Each list says why its words are
 * flagged; the checks only ever point them out and explain, never replace them.
 */

import { VAGUE_WORDS } from "../question-text";

/**
 * Openings that add words without adding meaning. APA (2020, section 2.4) advises
 * against title words that serve no purpose, such as “A Study of”.
 */
export const FILLER_PHRASES: readonly string[] = [
  "a study of",
  "a study on",
  "a study into",
  "a research on",
  "a research study of",
  "research on",
  "an investigation of",
  "an investigation into",
  "an experimental investigation of",
  "an analysis of",
  "an examination of",
  "an inquiry into",
  "a look at",
  "some aspects of",
  "observations on",
  "towards an understanding of",
];

/** Phrases that say the same thing twice. */
export const TAUTOLOGIES: readonly string[] = [
  "past history",
  "future prospects",
  "end result",
  "final outcome",
  "basic fundamentals",
  "each and every",
  "completely eliminate",
  "absolutely essential",
  "close proximity",
  "true facts",
  "combined together",
  "new innovations",
  "mutual cooperation",
];

/**
 * Words readers may take in different ways, so the title doesn't say exactly what is
 * studied. Builds on the words the question checks already flag.
 */
export const AMBIGUOUS_WORDS: readonly string[] = [
  ...VAGUE_WORDS,
  "issues",
  "aspects",
  "some",
  "certain",
  "several",
  "current",
  "recent",
  "today's",
  "and/or",
];

/** Everyday or conversational words that don't suit an academic title. */
export const INFORMAL_WORDS: readonly string[] = ["stuff", "things", "lots", "a lot", "kids", "guys", "gonna", "wanna", "really", "very", "pretty", "huge", "awesome", "amazing", "nice", "cool"];

/** First-person words, which academic titles leave out. */
export const FIRST_PERSON: readonly string[] = ["i", "me", "my", "we", "us", "our"];

/** Fashionable business and marketing words that sound impressive but say little. */
export const BUZZWORDS: readonly string[] = [
  "synergy",
  "synergies",
  "paradigm shift",
  "leverage",
  "leveraging",
  "holistic",
  "cutting-edge",
  "state-of-the-art",
  "game changer",
  "game-changer",
  "best practices",
  "next generation",
  "world-class",
  "disruptive",
  "revolutionary",
  "groundbreaking",
  "seamless",
  "value-added",
];

/** Scope words that stretch a title beyond what one study can cover. */
export const BROAD_WORDS: readonly string[] = ["people", "society", "the world", "worldwide", "globally", "global", "everyone", "everything", "all", "humanity", "mankind", "in general"];

/** Wording that claims cause and effect, which only some designs can support. */
export const CAUSAL_WORDS: readonly string[] = ["effect of", "effects of", "impact of", "impacts of", "influence of", "influences of", "effectiveness of", "causes of", "consequences of"];
