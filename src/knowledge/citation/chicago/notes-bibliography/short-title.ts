/**
 * Short titles for Chicago shortened notes. The short form is the main title,
 * shortened if it is longer than four words, without an initial A, An or The
 * (CMOS 18, 13.33). The CMOS sample citations show it: “Wedding Party”, “Book by
 * Design”, “Island of Bolsö”, “Inclusion Work”.
 *
 * Only the deterministic steps are taken: dropping an initial article, and dropping a
 * subtitle when the title is longer than four words. Choosing key words from a long
 * main title (CMOS shortens “Temporal Variation in Selection Influences . . .” to
 * “Temporal Variation”) needs judgment, so such a title is kept whole and the writer
 * is asked to shorten it, or to give their own short title.
 */

const INITIAL_ARTICLE = /^(?:a|an|the)\s+/iu;
const MAX_WORDS = 4;

const words = (text: string) => text.split(/\s+/u).filter(Boolean).length;

export interface ShortTitle {
  text: string;
  /** How the short title was reached. */
  method: "custom" | "full-title" | "article-dropped" | "main-title";
  /** True when the result is still longer than four words and needs the writer's judgment. */
  needsJudgment: boolean;
}

export function chicagoShortTitle(title: string, custom?: string): ShortTitle {
  const own = (custom ?? "").trim();
  if (own) return { text: own, method: "custom", needsJudgment: false };
  const full = title.trim();
  const withoutArticle = full.replace(INITIAL_ARTICLE, "");
  const method = withoutArticle === full ? "full-title" : "article-dropped";
  if (words(withoutArticle) <= MAX_WORDS) return { text: withoutArticle, method, needsJudgment: false };
  const subtitle = withoutArticle.search(/[:;]\s/u);
  if (subtitle > 0) {
    const main = withoutArticle.slice(0, subtitle).trim();
    return { text: main, method: "main-title", needsJudgment: words(main) > MAX_WORDS };
  }
  return { text: withoutArticle, method, needsJudgment: true };
}
