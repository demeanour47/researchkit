/**
 * The generator's form as data: what a person has typed, the empty and example
 * forms, and the conversion into a source for the formatter. No formatting
 * decisions are made here; they all belong to the knowledge layer.
 */

import type { Contributor, Source, SourceType } from "@/knowledge/citation/apa";

export type AuthorKind = "person" | "organization";

export interface AuthorDraft {
  /** A stable identity for the author's fields, never reused within a session. */
  key: number;
  kind: AuthorKind;
  family: string;
  given: string;
  name: string;
}

export interface Draft {
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
}

export const emptyAuthor = (key: number): AuthorDraft => ({ key, kind: "person", family: "", given: "", name: "" });

const person = (key: number, given: string, family: string): AuthorDraft => ({ ...emptyAuthor(key), given, family });

/** The form as it first appears, and as "Clear all fields" restores it: a book with one empty author. */
export function blankDraft(authorKey: number): Draft {
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
  };
}

/** The example: LeCun, Bengio and Hinton's 2015 article in Nature. Authors take keys from firstAuthorKey upward. */
export function exampleDraft(firstAuthorKey: number): Draft {
  return {
    ...blankDraft(firstAuthorKey),
    type: "journal-article",
    authors: [
      person(firstAuthorKey, "Yann", "LeCun"),
      person(firstAuthorKey + 1, "Yoshua", "Bengio"),
      person(firstAuthorKey + 2, "Geoffrey", "Hinton"),
    ],
    year: "2015",
    title: "Deep learning",
    journal: "Nature",
    volume: "521",
    issue: "7553",
    pages: "436–444",
    doi: "10.1038/nature14539",
  };
}

const TEXT_FIELDS = [
  "year", "month", "day", "title", "edition", "publisher", "journal",
  "volume", "issue", "pages", "articleNumber", "doi", "url", "siteName",
] as const satisfies readonly (keyof Draft)[];

/** Whether nothing has been entered yet. The source type alone doesn't count. */
export function isEmptyDraft(draft: Draft): boolean {
  const authorsBlank = draft.authors.every((author) => [author.family, author.given, author.name].every((value) => value.trim() === ""));
  return authorsBlank && TEXT_FIELDS.every((field) => draft[field].trim() === "");
}

/** A number from a text field, or undefined when blank; non-numbers become NaN, which the formatter reports. */
const numberFrom = (text: string) => (text.trim() === "" ? undefined : Number(text.trim()));

/** Converts what was typed into a source description for the formatter. */
export function toSource(draft: Draft): Source {
  const authors: Contributor[] = draft.authors.map((author) =>
    author.kind === "person"
      ? { kind: "person", family: author.family, given: author.given }
      : { kind: "organization", name: author.name },
  );
  const date = { year: numberFrom(draft.year), month: numberFrom(draft.month), day: numberFrom(draft.day) };
  const common = { authors, title: draft.title };

  switch (draft.type) {
    case "book":
      return { ...common, type: "book", date: { year: date.year }, edition: draft.edition, publisher: draft.publisher, doi: draft.doi, url: draft.url };
    case "journal-article":
      return {
        ...common,
        type: "journal-article",
        date: { year: date.year },
        journal: draft.journal,
        volume: draft.volume,
        issue: draft.issue,
        pages: draft.pages,
        articleNumber: draft.articleNumber,
        doi: draft.doi,
        url: draft.url,
      };
    case "webpage":
      return { ...common, type: "webpage", date, siteName: draft.siteName, url: draft.url };
  }
}
