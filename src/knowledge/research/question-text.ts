/**
 * Small text helpers for reading and assembling research questions. They only ever
 * rearrange the researcher's own words; they never add content of their own.
 */

const LETTER_OR_DIGIT = "[\\p{L}\\p{N}]";

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Collapses whitespace and trims. */
export function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** The words in a text, in lower case. */
export function words(text: string): string[] {
  return text.toLowerCase().match(new RegExp(`${LETTER_OR_DIGIT}+(?:['’-]${LETTER_OR_DIGIT}+)*`, "gu")) ?? [];
}

/** Whether the phrase appears in the text as whole words, ignoring case and spacing. */
export function containsPhrase(text: string, phrase: string): boolean {
  const target = normalise(phrase);
  if (!target) return false;
  const pattern = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegExp(target).replace(/ /g, "\\s+")}(?![\\p{L}\\p{N}])`, "iu");
  return pattern.test(text);
}

/** Removes full stops, question marks and exclamation marks from the end of a phrase. */
export function stripEndPunctuation(text: string): string {
  return normalise(text).replace(/[.?!]+$/, "").trim();
}

export function capitalise(text: string): string {
  return text.charAt(0).toLocaleUpperCase("en") + text.slice(1);
}

/** Joins items as "a", "a and b" or "a, b and c". */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Words whose meaning readers may understand differently, so they need defining before they can be studied. */
export const VAGUE_WORDS: readonly string[] = [
  "good", "bad", "better", "best", "worse", "effective", "successful", "things", "stuff", "etc", "various", "nowadays", "modern", "proper", "properly",
];

/** Words too common to show that two texts share a subject. */
export const STOPWORDS = new Set(
  (
    "a an and are as at be been being between by can could did do does during for from had has have how in into is it its " +
    "of on or over than that the their them these they this those to under was were what when where which who whom why will " +
    "with within would your you our we my among about across after before extent there such any some more most much many " +
    "study research explore examine investigate understand aim aims project question questions"
  ).split(" "),
);

/** The meaningful words two texts share, in the order they appear in the first. */
export function sharedWords(first: string, second: string): string[] {
  const other = new Set(words(second).map(stem));
  const shared: string[] = [];
  for (const word of words(first)) {
    if (STOPWORDS.has(word) || word.length < 3 || shared.includes(word)) continue;
    if (other.has(stem(word))) shared.push(word);
  }
  return shared;
}

/** A crude stem, so that "students" matches "student". Only used to compare, never shown. */
function stem(word: string): string {
  return word.replace(/(ies|es|s)$/, "");
}
