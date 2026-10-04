/**
 * What the Chicago notes-and-bibliography formatter tells the researcher, as data.
 * Decisions explain how a correct note or entry was built; notes report problems,
 * omissions, limitations and points where Chicago allows a variant. Wording lives in
 * validate.ts and with the interface.
 */

import type { SourceType } from "../../source";
import type { NoteLocatorKind } from "./request";

export type Decision =
  | { code: "note-names-normal-order" }
  | { code: "note-et-al" }
  | { code: "bibliography-first-inverted" }
  | { code: "bibliography-authors-listed"; count: number }
  | { code: "bibliography-authors-shortened"; count: number }
  | { code: "organization-author" }
  | { code: "title-first" }
  | { code: "web-note-title-first" }
  | { code: "listed-under-owner" }
  | { code: "book-title-italic" }
  | { code: "article-title-quoted" }
  | { code: "page-title-quoted" }
  | { code: "book-publication-parentheses" }
  | { code: "no-place-of-publication" }
  | { code: "edition-shown" }
  | { code: "first-edition-omitted" }
  | { code: "journal-numbers" }
  | { code: "article-page-range" }
  | { code: "article-id" }
  | { code: "pages-shortened"; from: string; to: string }
  | { code: "site-name-omitted" }
  | { code: "access-date"; text: string }
  | { code: "no-date" }
  | { code: "doi-used" }
  | { code: "url-left-out-for-doi" }
  | { code: "url-used" }
  | { code: "note-locator"; kind: "page" | "chapter" }
  | { code: "short-note-surnames" }
  | { code: "short-title"; text: string; method: "custom" | "full-title" | "article-dropped" | "main-title" }
  | { code: "short-note-title-only" };

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
  | { code: "missing-publisher" }
  | { code: "incomplete-journal"; missing: "volume" | "pages" | "numbers" }
  | { code: "missing-site-name" }
  | { code: "missing-url" }
  | { code: "missing-access-date" }
  | { code: "invalid-date"; date: "publication" | "access" }
  | { code: "day-without-month"; date: "publication" | "access" }
  | { code: "unsupported-locator"; kind: NoteLocatorKind }
  | { code: "incomplete-locator" }
  | { code: "missing-locator-value" }
  | { code: "short-note-unidentifiable" }
  | { code: "access-date-not-needed" }
  | { code: "publisher-not-shown" }
  | { code: "article-number-not-shown" }
  | { code: "organization-also-publisher" }
  | { code: "web-date-label" }
  | { code: "article-note-without-page" }
  | { code: "shorten-title" }
  | { code: "check-headline-style" }
  | { code: "check-edition" }
  | { code: "ibid-not-used" };
