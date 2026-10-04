/**
 * A source as typed into a citation generator's form, and its conversion into the
 * shared source model (ADR-0006). Every generator uses the same draft; each style
 * decides which fields it shows and how the source is formatted.
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { emptyAuthor, isBlankAuthor, toContributor, type AuthorDraft } from "./author-draft";
import { parseSourceType, type PublicationDate, type Source, type SourceType } from "../../knowledge/citation/source";

export interface SourceDraft {
  type: SourceType;
  authors: AuthorDraft[];
  year: string;
  month: string;
  day: string;
  title: string;
  edition: string;
  publisher: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  articleNumber: string;
  doi: string;
  url: string;
  siteName: string;
  accessedYear: string;
  accessedMonth: string;
  accessedDay: string;
}

/** The form as it first appears, and as "Clear all fields" restores it: a book with one empty author. */
export function blankDraft(authorKey: number): SourceDraft {
  return {
    type: "book",
    authors: [emptyAuthor(authorKey)],
    year: "",
    month: "",
    day: "",
    title: "",
    edition: "",
    publisher: "",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    articleNumber: "",
    doi: "",
    url: "",
    siteName: "",
    accessedYear: "",
    accessedMonth: "",
    accessedDay: "",
  };
}

/** The draft with another source type, if the value names a supported one; otherwise unchanged. */
export function withSourceType(draft: SourceDraft, value: string): SourceDraft {
  const type = parseSourceType(value);
  return type ? { ...draft, type } : draft;
}

const TEXT_FIELDS = [
  "year", "month", "day", "title", "edition", "publisher", "journal", "volume", "issue",
  "pages", "articleNumber", "doi", "url", "siteName", "accessedYear", "accessedMonth", "accessedDay",
] as const satisfies readonly (keyof SourceDraft)[];

/** Whether nothing has been entered yet. The source type alone doesn't count. */
export function isEmptyDraft(draft: SourceDraft): boolean {
  return draft.authors.every(isBlankAuthor) && TEXT_FIELDS.every((field) => draft[field].trim() === "");
}

/** A number from a text field, or undefined when blank; non-numbers become NaN, which the formatter reports. */
const numberFrom = (text: string) => (text.trim() === "" ? undefined : Number(text.trim()));

const dateFrom = (year: string, month: string, day: string): PublicationDate => ({ year: numberFrom(year), month: numberFrom(month), day: numberFrom(day) });

/** Converts what was typed into the shared source model. Fields that don't belong to the type are left out. */
export function toSource(draft: SourceDraft): Source {
  const common = { authors: draft.authors.map(toContributor), title: draft.title };

  switch (draft.type) {
    case "book":
      return { ...common, type: "book", date: { year: numberFrom(draft.year) }, edition: draft.edition, publisher: draft.publisher, doi: draft.doi, url: draft.url };
    case "journal-article":
      return {
        ...common,
        type: "journal-article",
        date: { year: numberFrom(draft.year), month: numberFrom(draft.month) },
        journal: draft.journal,
        volume: draft.volume,
        issue: draft.issue,
        pages: draft.pages,
        articleNumber: draft.articleNumber,
        doi: draft.doi,
        url: draft.url,
      };
    case "webpage": {
      const accessed = dateFrom(draft.accessedYear, draft.accessedMonth, draft.accessedDay);
      const hasAccessed = Object.values(accessed).some((part) => part !== undefined);
      return {
        ...common,
        type: "webpage",
        date: dateFrom(draft.year, draft.month, draft.day),
        siteName: draft.siteName,
        publisher: draft.publisher,
        url: draft.url,
        ...(hasAccessed ? { accessed } : {}),
      };
    }
  }
}
