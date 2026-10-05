/** Text handling shared by the search stages: tidying, folding and word matching. */

const TAGS = /<[^>]*>/g;
const ENTITIES: Readonly<Record<string, string>> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " " };

/** Provider text as plain text: markup removed, entities decoded, whitespace collapsed. Output is rendered as text, never as HTML. */
export function plainTextOf(input: string): string {
  return input
    .replace(TAGS, " ")
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lower case, accents removed, punctuation turned to spaces: the form used to compare text. */
export function fold(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** A word reduced so that "feedbacks" and "feedback" compare equal. A light rule, deliberately not a stemmer. */
export function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && /[^s]s$/.test(word) && !/(?:is|us|ics)$/.test(word)) return word.slice(0, -1);
  return word;
}

/** The folded, lightly stemmed words of a text. */
export function wordsOf(text: string): string[] {
  const folded = fold(text);
  return folded === "" ? [] : folded.split(" ").map(stem);
}

/** Whether `phrase` (already folded and stemmed, as words) occurs in `words` as consecutive words. */
export function containsPhrase(words: readonly string[], phrase: readonly string[]): boolean {
  if (phrase.length === 0 || phrase.length > words.length) return false;
  for (let start = 0; start + phrase.length <= words.length; start += 1) {
    if (phrase.every((word, offset) => words[start + offset] === word)) return true;
  }
  return false;
}

/** Function words that carry no subject on their own. */
export const STOPWORDS: ReadonlySet<string> = new Set(
  "a about above after again all also am an and any are as at be because been before being between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just may me might more most my no nor not now of off on once only or other our out over own same she should so some such than that the their theirs them then there these they this those through to too under until up us very was we were what when where which while who whom why will with within without would you your among across via".split(" "),
);

/** Words common in abstracts of every field, which make poor suggested search terms. */
export const GENERIC_WORDS: ReadonlySet<string> = new Set(
  "using use used based study studies paper article research result results method methods analysis effect effects case review data findings aim aims purpose objective objectives present presents show shows showed found find new approach approaches different high low well one two three first second however thus therefore et al".split(" "),
);
