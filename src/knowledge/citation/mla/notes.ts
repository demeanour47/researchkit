/**
 * What the MLA formatter tells the researcher, as data. Decisions explain how a
 * correct entry was built; notes report problems or checks the researcher should
 * make. Wording lives with the interface and in validate.ts.
 */

import type { SourceType } from "../source";

export type Container = "journal" | "website";

/** A formatting choice made deterministically from the rules. */
export type Decision =
  | { code: "first-author-inverted" }
  | { code: "two-authors" }
  | { code: "et-al"; count: number }
  | { code: "organization-author" }
  | { code: "organization-omitted"; as: "publisher" | "site" }
  | { code: "title-first" }
  | { code: "standalone-title" }
  | { code: "title-in-container"; container: Container }
  | { code: "no-container" }
  | { code: "edition-shown" }
  | { code: "first-edition-omitted" }
  | { code: "publisher-omitted-same-as-site" }
  | { code: "date-written"; text: string }
  | { code: "date-omitted" }
  | { code: "access-date"; text: string }
  | { code: "pages-shortened"; from: string; to: string }
  | { code: "article-number-omitted" }
  | { code: "doi-used" }
  | { code: "url-left-out-for-doi" }
  | { code: "url-protocol-omitted" }
  | { code: "in-text-page" }
  | { code: "in-text-paragraph" }
  | { code: "in-text-no-locator" }
  | { code: "in-text-title" }
  | { code: "in-text-et-al" }
  | { code: "prose-and-others" };

/** Fields MLA needs before an entry can identify the source. */
export type RequiredField = "title" | "journal";
/** Fields an entry should normally have; without them the entry is still usable. */
export type RecommendedField = "publisher" | "site-name" | "url";

export type Note =
  | { code: "missing"; field: RequiredField }
  | { code: "missing-recommended"; field: RecommendedField }
  | { code: "no-author" }
  | { code: "author-incomplete"; position: number }
  | { code: "ambiguous-author"; position: number }
  | { code: "no-date"; sourceType: SourceType }
  | { code: "invalid-date"; date: "publication" | "access" }
  | { code: "day-without-month"; date: "publication" | "access" }
  | { code: "no-journal-numbers" }
  | { code: "invalid-doi" }
  | { code: "invalid-url" }
  | { code: "check-title-case" }
  | { code: "check-edition" }
  | { code: "publisher-abbreviation"; suggestion: string | null }
  | { code: "unsupported-locator"; kind: "section" }
  | { code: "unsupported-source-type"; value: string };
