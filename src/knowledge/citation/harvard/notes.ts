/**
 * What the Harvard formatter tells the researcher, as data. Decisions explain how a
 * correct entry was built; notes report problems, omissions, institutional
 * variations and limits the researcher should know about. Wording lives in
 * validate.ts and with the interface.
 */

import type { SourceType } from "../source";

/** A formatting choice made deterministically from the profile's rules. */
export type Decision =
  | { code: "surname-initials" }
  | { code: "authors-listed"; count: number }
  | { code: "organization-author" }
  | { code: "title-first" }
  | { code: "year-in-brackets" }
  | { code: "no-date" }
  | { code: "year-letter"; letter: string }
  | { code: "book-title-italic" }
  | { code: "article-title-quoted" }
  | { code: "page-title-italic" }
  | { code: "journal-numbers" }
  | { code: "single-page" }
  | { code: "page-range" }
  | { code: "article-number" }
  | { code: "edition-shown" }
  | { code: "first-edition-omitted" }
  | { code: "publisher-only" }
  | { code: "doi-used" }
  | { code: "url-left-out-for-doi" }
  | { code: "url-used" }
  | { code: "access-date"; text: string }
  | { code: "text-page" }
  | { code: "text-pages" }
  | { code: "text-no-locator" }
  | { code: "text-all-named"; count: number }
  | { code: "text-et-al" }
  | { code: "text-title" }
  | { code: "text-no-date" };

export type Note =
  | { code: "missing-title" }
  | { code: "missing-journal" }
  | { code: "missing-url" }
  | { code: "unsupported-source-type"; value: string }
  | { code: "invalid-doi" }
  | { code: "invalid-url" }
  | { code: "invalid-year-letter" }
  | { code: "no-author" }
  | { code: "author-incomplete"; position: number }
  | { code: "ambiguous-author"; position: number }
  | { code: "unsupported-contributor-role"; position: number }
  | { code: "missing-year"; sourceType: SourceType }
  | { code: "missing-access-date" }
  | { code: "incomplete-access-date" }
  | { code: "invalid-date"; date: "publication" | "access" }
  | { code: "day-without-month"; date: "publication" | "access" }
  | { code: "missing-publisher" }
  | { code: "incomplete-journal"; missing: "volume" | "pages" | "numbers" }
  | { code: "unsupported-locator"; kind: "paragraph" | "section" }
  | { code: "incomplete-locator" }
  | { code: "year-letter-without-year" }
  | { code: "access-date-not-needed" }
  | { code: "article-number-not-shown" }
  | { code: "site-not-shown" }
  | { code: "check-capitals" }
  | { code: "check-edition" }
  | { code: "et-al-variant" }
  | { code: "text-title-variant" }
  | { code: "same-year-letter" }
  | { code: "profile" };
