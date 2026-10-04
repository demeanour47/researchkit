/**
 * An English syllable-counting heuristic, for readability formulas. Deterministic
 * and dictionary-free: it counts groups of vowels and then corrects for the most
 * common patterns where spelling and sound disagree. It is right for most common
 * academic words but not for every word; no spelling rule is.
 *
 * Rules
 * - Letters are compared without accents or case; anything that isn't a letter
 *   a–z is ignored, so "results," and "Results" count the same.
 * - Each run of vowels (a, e, i, o, u, and y after the first letter) is one syllable.
 * - Some vowel pairs are usually two syllables: "ia" (variable), "io" (biology),
 *   "iu" (medium), "ua" and "uo" (individual, continuous), "eo" (video), except
 *   after letters that make them one sound (social, nation, region, quality, people).
 * - A final silent e is not a syllable (since, while), except in "-le" after a
 *   consonant (table, simple). Final "-es" and "-ed" add no syllable after most
 *   consonants (makes, used), but do after s, x, z, ch, sh, ce, ge (cases, changes)
 *   and, for "-ed", after t or d (wanted, needed).
 * - A silent e before the suffixes -ly, -ment, -ness, -ful and -less is not a
 *   syllable (lately, statement, useful).
 * - A vowel before "-ing" is its own syllable (being, studying), and a diaeresis
 *   separates vowels (naïve).
 * - Hyphenated words count each part: "well-being" is "well" plus "being".
 * - Every word has at least one syllable. A word without letters, such as a number,
 *   counts as one, and so does a web or email address, which isn't read as words.
 *
 * Known limits
 * - Some words break the rules: "create" and "area" (where "ea" is two syllables)
 *   are undercounted; "recipe" (where a final e is sounded) is undercounted.
 * - Numbers, symbols and abbreviations read aloud letter by letter (2020, U.S.) are
 *   counted as one syllable.
 * - Words in other languages are counted by English spelling rules.
 */

const VOWEL_GROUP = /[aeiouy]+/g;

/** Vowel pairs that are usually two syllables, after letters that don't merge them into one sound. */
const SPLIT_PAIRS: readonly RegExp[] = [/[^cgst]ia/g, /[^cgst]io/g, /iu/g, /[^gq]ua/g, /[^gq]uo/g, /(?<!p)eo/g];

/** A silent e before a suffix: vowel, consonant, e, then the suffix at the end. */
const SILENT_E_BEFORE_SUFFIX = /[aeiouy][^aeiouy]e(?=(?:ly|ment|ness|ful|less)$)/;

const count = (word: string, pattern: RegExp) => word.match(pattern)?.length ?? 0;

/** Syllables in one hyphen-free part of a word, already reduced to a–z. */
function syllablesInPart(part: string): number {
  if (part === "") return 0;
  // A leading y is a consonant (year, young); elsewhere it acts as a vowel (study, analysis).
  const letters = part.startsWith("y") ? `#${part.slice(1)}` : part;
  let syllables = count(letters, VOWEL_GROUP);
  for (const pair of SPLIT_PAIRS) syllables += count(letters, pair);

  if (/[^aeiouy]le$/.test(letters)) {
    // "-le" after a consonant is sounded: table, simple.
  } else if (/[^aeiouy]e$/.test(letters)) {
    syllables -= 1;
  } else if (/[^aeiouy]es$/.test(letters) && !/(?:[sxzcg]|ch|sh)es$/.test(letters)) {
    syllables -= 1;
  } else if (/[^aeiouy]ed$/.test(letters) && !/[td]ed$/.test(letters)) {
    syllables -= 1;
  }
  if (SILENT_E_BEFORE_SUFFIX.test(letters)) syllables -= 1;
  // A vowel before "-ing" is its own syllable: be-ing, go-ing, stu-dy-ing.
  if (/[aeiouy]ing$/.test(letters)) syllables += 1;
  return Math.max(1, syllables);
}

/** A web or email address: its letters aren't English syllables. */
const ADDRESS = /^[("'“‘<[]*(?:https?:\/\/|www\.)|\S@\S+\.\S/iu;

/** The syllables in a word, by the heuristic above. At least one. */
export function countSyllables(word: string): number {
  if (ADDRESS.test(word)) return 1;
  // A diaeresis marks a vowel sounded separately (naïve, coöperate), so it splits the word there.
  const normalized = word.normalize("NFKD").replace(/(\p{L})\u0308/gu, "-$1").replace(/\p{M}/gu, "").toLowerCase();
  const parts = normalized.split(/[-‐‑–—]+/u).map((part) => part.replace(/[^a-z]/g, "")).filter(Boolean);
  if (parts.length === 0) return 1;
  return parts.reduce((total, part) => total + syllablesInPart(part), 0);
}
