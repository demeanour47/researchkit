/**
 * A source as typed into a citation generator's form, and its conversion into the
 * shared source model (ADR-0006). Every generator uses the same draft; each style
 * decides which fields it shows and how the source is formatted.
 */

// Relative imports, so the test runner can load this module (see TESTING.md).
import { emptyAuthor, isBlankAuthor, toContributor, type AuthorDraft } from "./author-draft";
import { parseAnySourceType, parseSourceType, type AnySource, type AnySourceType, type PublicationDate, type Source, type SourceType } from "../../knowledge/citation/source";

/**
 * What a person has typed. Most generators offer the source types every style
 * supports; a generator for a style with more, such as conference papers, widens the
 * type (ADR-0006).
 */
export interface SourceDraft<Type extends AnySourceType = SourceType> {
  type: Type;
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
  /** A book's place of publication. */
  place: string;
  /** A conference paper's proceedings or conference. */
  proceedings: string;
  /** Where a conference was held. */
  location: string;
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
    place: "",
    proceedings: "",
    location: "",
  };
}

/** The draft with another source type, if the value names a supported one; otherwise unchanged. */
export function withSourceType(draft: SourceDraft, value: string): SourceDraft {
  const type = parseSourceType(value);
  return type ? { ...draft, type } : draft;
}

/** The draft with another source type, if the value names one of the types offered; otherwise unchanged. */
export function withOfferedType<Type extends AnySourceType>(draft: SourceDraft<Type>, value: string, offered: readonly Type[]): SourceDraft<Type> {
  const type = parseAnySourceType(value);
  const match = offered.find((candidate) => candidate === type);
  return match ? { ...draft, type: match } : draft;
}

const TEXT_FIELDS = [
  "year", "month", "day", "title", "edition", "publisher", "journal", "volume", "issue",
  "pages", "articleNumber", "doi", "url", "siteName", "accessedYear", "accessedMonth", "accessedDay",
  "place", "proceedings", "location",
] as const satisfies readonly (keyof SourceDraft)[];

/** Whether nothing has been entered yet. The source type alone doesn't count. */
export function isEmptyDraft(draft: SourceDraft<AnySourceType>): boolean {
  return draft.authors.every(isBlankAuthor) && TEXT_FIELDS.every((field) => draft[field].trim() === "");
}

/** A number from a text field, or undefined when blank; non-numbers become NaN, which the formatter reports. */
const numberFrom = (text: string) => (text.trim() === "" ? undefined : Number(text.trim()));

const dateFrom = (year: string, month: string, day: string): PublicationDate => ({ year: numberFrom(year), month: numberFrom(month), day: numberFrom(day) });

/** The access date, only when any part of it was entered, so an untouched field adds nothing to the source. */
function accessedFrom(draft: SourceDraft): { accessed?: PublicationDate } {
  const accessed = dateFrom(draft.accessedYear, draft.accessedMonth, draft.accessedDay);
  return Object.values(accessed).some((part) => part !== undefined) ? { accessed } : {};
}

/** Converts what was typed into the shared source model. Fields that don't belong to the type are left out. */
export function toSource(draft: SourceDraft): Source {
  const common = { authors: draft.authors.map(toContributor), title: draft.title };

  switch (draft.type) {
    case "book":
      return { ...common, type: "book", date: { year: numberFrom(draft.year) }, edition: draft.edition, publisher: draft.publisher, place: draft.place, doi: draft.doi, url: draft.url, ...accessedFrom(draft) };
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
        ...accessedFrom(draft),
      };
    case "webpage":
      return {
        ...common,
        type: "webpage",
        date: dateFrom(draft.year, draft.month, draft.day),
        siteName: draft.siteName,
        publisher: draft.publisher,
        url: draft.url,
        ...accessedFrom(draft),
      };
  }
}

/** Converts what was typed into any source in the model, including the opt-in types such as conference papers. */
export function toAnySource(draft: SourceDraft<AnySourceType>): AnySource {
  if (draft.type !== "conference-paper") return toSource({ ...draft, type: draft.type });
  return {
    authors: draft.authors.map(toContributor),
    title: draft.title,
    type: "conference-paper",
    date: { year: numberFrom(draft.year), month: numberFrom(draft.month) },
    proceedings: draft.proceedings,
    location: draft.location,
    pages: draft.pages,
    doi: draft.doi,
    url: draft.url,
  };
}
