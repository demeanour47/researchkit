/**
 * What the IEEE formatter tells the researcher, as data. Decisions explain how a
 * correct reference or citation was built; notes report problems, omissions,
 * limitations and variants. Wording lives in validate.ts and with the interface.
 */

import type { AnySourceType, NumberProblem } from "../source";
import type { IeeeLocatorKind } from "./request";

export type Decision =
  | { code: "number-from-citation-order" }
  | { code: "initials-first" }
  | { code: "authors-listed"; count: number }
  | { code: "authors-shortened"; count: number }
  | { code: "organization-author" }
  | { code: "title-first" }
  | { code: "book-title-italic" }
  | { code: "article-title-quoted" }
  | { code: "conference-in-proceedings" }
  | { code: "web-elements-periods" }
  | { code: "edition-shown" }
  | { code: "place-and-publisher" }
  | { code: "journal-numbers" }
  | { code: "page-range-full" }
  | { code: "article-number" }
  | { code: "month-abbreviated"; text: string }
  | { code: "no-date" }
  | { code: "doi-prefix" }
  | { code: "doi-and-url" }
  | { code: "url-online" }
  | { code: "access-date"; text: string }
  | { code: "citation-brackets" }
  | { code: "citation-locator"; text: string }
  | { code: "citations-written-out" }
  | { code: "citations-en-dash" }
  | { code: "text-names" };

export type Note =
  | { code: "missing-title" }
  | { code: "missing-journal" }
  | { code: "missing-proceedings" }
  | { code: "unsupported-source-type"; value: string }
  | { code: "invalid-doi" }
  | { code: "invalid-url" }
  | { code: "invalid-reference-number"; problem: NumberProblem | { code: "more-than-one" } }
  | { code: "no-author" }
  | { code: "author-incomplete"; position: number }
  | { code: "ambiguous-author"; position: number }
  | { code: "unsupported-contributor-role"; position: number }
  | { code: "missing-year"; sourceType: AnySourceType }
  | { code: "missing-publisher" }
  | { code: "missing-place" }
  | { code: "incomplete-journal"; missing: "volume" | "issue" | "pages" }
  | { code: "incomplete-conference"; missing: "location" | "pages" }
  | { code: "missing-site-name" }
  | { code: "missing-url" }
  | { code: "missing-access-date" }
  | { code: "invalid-date"; date: "publication" | "access" }
  | { code: "day-without-month"; date: "publication" | "access" }
  | { code: "unsupported-locator"; kind: IeeeLocatorKind }
  | { code: "incomplete-locator" }
  | { code: "missing-locator-value" }
  | { code: "numbers-not-ascending" }
  | { code: "locator-with-several-numbers" }
  | { code: "abbreviation-not-applied"; container: "journal" | "conference" }
  | { code: "publication-date-not-shown" }
  | { code: "check-title-case" }
  | { code: "check-edition" }
  | { code: "en-dash-ranges-variant" }
  | { code: "citation-order" };
