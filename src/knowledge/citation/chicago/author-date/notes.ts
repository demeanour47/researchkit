/**
 * What the Chicago author-date formatter tells the researcher, as data. Decisions
 * explain how a correct entry was built; notes report problems, omissions and
 * choices the researcher should know about. Wording lives in validate.ts and with
 * the interface.
 */

import type { SourceType } from "../../source";

/** A formatting choice made deterministically from the rules. */
export type Decision =
  | { code: "first-author-inverted" }
  | { code: "authors-listed"; count: number }
  | { code: "authors-shortened"; count: number }
  | { code: "organization-author" }
  | { code: "title-first" }
  | { code: "year-after-author" }
  | { code: "no-date" }
  | { code: "book-title-italic" }
  | { code: "article-title-quoted" }
  | { code: "page-title-quoted" }
  | { code: "journal-numbers" }
  | { code: "pages-shortened"; from: string; to: string }
  | { code: "article-id-for-pages" }
  | { code: "edition-shown" }
  | { code: "first-edition-omitted" }
  | { code: "site-name-omitted" }
  | { code: "site-owner-used" }
  | { code: "web-month-day" }
  | { code: "access-date"; text: string }
  | { code: "doi-used" }
  | { code: "url-left-out-for-doi" }
  | { code: "url-used" }
  | { code: "text-page" }
  | { code: "text-no-locator" }
  | { code: "text-et-al" }
  | { code: "text-title" }
  | { code: "text-no-date-comma" };

export type Note =
  | { code: "missing-title" }
  | { code: "missing-journal" }
  | { code: "unsupported-source-type"; value: string }
  | { code: "invalid-doi" }
  | { code: "invalid-url" }
  | { code: "no-author" }
  | { code: "author-incomplete"; position: number }
  | { code: "ambiguous-author"; position: number }
  | { code: "unsupported-contributor-role"; position: number }
  | { code: "missing-year"; sourceType: SourceType }
  | { code: "missing-access-date" }
  | { code: "invalid-date"; date: "publication" | "access" }
  | { code: "day-without-month"; date: "publication" | "access" }
  | { code: "missing-publisher" }
  | { code: "missing-url" }
  | { code: "incomplete-journal"; missing: "volume" | "pages" | "numbers" }
  | { code: "unsupported-locator"; kind: "paragraph" | "section" }
  | { code: "incomplete-locator" }
  | { code: "access-date-not-needed" }
  | { code: "publisher-not-shown" }
  | { code: "article-number-not-shown" }
  | { code: "organization-also-publisher" }
  | { code: "web-date-label" }
  | { code: "journal-issue-variant" }
  | { code: "check-headline-style" }
  | { code: "check-edition" }
  | { code: "shorten-title" }
  | { code: "same-year-suffix" };
