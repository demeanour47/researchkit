"use client";

import type { Ref } from "react";
import { Button, RadioGroup, SelectField, TextField } from "@/ui";
import { MONTHS, SOURCE_TYPES, type AnySourceType, type SourceType } from "@/knowledge/citation/source";
import type { AuthorDraft } from "./author-draft";
import { AuthorFields, type AuthorFieldLabels } from "./author-fields";
import { MoreDetails } from "./more-details";
import type { SourceDraft } from "./source-draft";

/** Wording for the source fields. Each citation style supplies its own hints. */
export interface SourceFieldLabels {
  sourceType: string;
  /** A label for each type offered; the opt-in types need one only where they are offered. */
  sourceTypes: Record<SourceType, string> & Partial<Record<AnySourceType, string>>;
  authors: string;
  authorsHint: string;
  addAuthor: string;
  date: string;
  dateHint: string;
  journalDateHint: string;
  year: string;
  month: string;
  day: string;
  noMonth: string;
  title: string;
  titleHint: string;
  edition: string;
  editionHint: string;
  publisher: string;
  webPublisher: string;
  webPublisherHint: string;
  journal: string;
  journalHint: string;
  volume: string;
  issue: string;
  pages: string;
  pagesHint: string;
  articleNumber: string;
  articleNumberHint: string;
  doi: string;
  doiHint: string;
  url: string;
  urlHintOptional: string;
  urlHint: string;
  siteName: string;
  siteNameHint: string;
  moreDetails: string;
  accessed: string;
  accessedHint: string;
  /** For forms that ask for a book's place of publication. */
  place?: string;
  placeHint?: string;
  /** For forms that offer conference papers. */
  proceedings?: string;
  proceedingsHint?: string;
  location?: string;
  locationHint?: string;
  conferenceDateHint?: string;
}

/** Which date parts a style asks for, and in what order. */
export interface SourceFieldOptions {
  /** Whether a journal article's date includes its month. */
  journalMonth: boolean;
  /** The order of a full date's parts, as the style writes them. */
  dateOrder: "day-month-year" | "month-day-year";
  /** Whether a book's place of publication is asked for. */
  bookPlace?: boolean;
  /** Whether books and journal articles ask for an access date, for styles that date every URL. */
  accessDates?: boolean;
  /** The source types offered. Defaults to the types every style supports. */
  types?: readonly AnySourceType[];
}

export interface SourceFieldsProps {
  /** Prefix for every field id and the source-type radio name, unique on the page. */
  idPrefix: string;
  draft: SourceDraft<AnySourceType>;
  labels: SourceFieldLabels;
  authorLabels: AuthorFieldLabels;
  options: SourceFieldOptions;
  addAuthorButton: Ref<HTMLButtonElement>;
  onChange: (changes: Partial<SourceDraft<AnySourceType>>) => void;
  onTypeChange: (value: string) => void;
  onAuthorChange: (author: AuthorDraft) => void;
  onAddAuthor: () => void;
  onRemoveAuthor: (key: number) => void;
}

const monthOptions = MONTHS.map((name, index) => ({ value: String(index + 1), label: name }));

type TextKey = Exclude<keyof SourceDraft<AnySourceType>, "type" | "authors">;

/** The form describing one source: its type, authors, title, container, date and identifiers. */
export function SourceFields({ idPrefix, draft, labels, authorLabels, options, addAuthorButton, onChange, onTypeChange, onAuthorChange, onAddAuthor, onRemoveAuthor }: SourceFieldsProps) {
  const field = (key: TextKey, label: string, hint?: string, extra: { inputMode?: "numeric" | "url" } = {}) => (
    <TextField
      id={`${idPrefix}-${key}`}
      label={label}
      hint={hint}
      value={draft[key]}
      onChange={(event) => onChange({ [key]: event.target.value })}
      autoComplete="off"
      {...extra}
    />
  );

  const monthField = (key: "month" | "accessedMonth") => (
    <SelectField
      id={`${idPrefix}-${key}`}
      label={labels.month}
      emptyOption={labels.noMonth}
      options={monthOptions}
      value={draft[key]}
      onChange={(event) => onChange({ [key]: event.target.value })}
    />
  );

  /** Day, month and year fields, in the style's order. */
  const fullDate = (day: "day" | "accessedDay", month: "month" | "accessedMonth", year: "year" | "accessedYear") => {
    const dayField = field(day, labels.day, undefined, { inputMode: "numeric" });
    return options.dateOrder === "day-month-year" ? (
      <>
        {dayField}
        {monthField(month)}
        {field(year, labels.year, undefined, { inputMode: "numeric" })}
      </>
    ) : (
      <>
        {monthField(month)}
        {dayField}
        {field(year, labels.year, undefined, { inputMode: "numeric" })}
      </>
    );
  };

  const accessedFields = (
    <fieldset className="grid gap-3" aria-describedby={`${idPrefix}-accessed-hint`}>
      <legend className="mb-1 font-semibold">{labels.accessed}</legend>
      <p id={`${idPrefix}-accessed-hint`} className="text-small text-text-muted">
        {labels.accessedHint}
      </p>
      <div className="grid items-start gap-3 sm:grid-cols-3">{fullDate("accessedDay", "accessedMonth", "accessedYear")}</div>
    </fieldset>
  );

  return (
    <form className="grid min-w-0 gap-8" onSubmit={(event) => event.preventDefault()}>
      <RadioGroup
        name={`${idPrefix}-source-type`}
        legend={labels.sourceType}
        options={(options.types ?? SOURCE_TYPES).map((value) => ({ value, label: labels.sourceTypes[value] ?? value }))}
        value={draft.type}
        onChange={onTypeChange}
      />

      <fieldset className="grid gap-4" aria-describedby={`${idPrefix}-authors-hint`}>
        <legend className="mb-1 text-subheading font-semibold">{labels.authors}</legend>
        <p id={`${idPrefix}-authors-hint`} className="text-small text-text-muted">
          {labels.authorsHint}
        </p>
        {draft.authors.map((author, index) => (
          <AuthorFields
            key={author.key}
            author={author}
            position={index + 1}
            canRemove={draft.authors.length > 1}
            labels={authorLabels}
            onChange={onAuthorChange}
            onRemove={() => onRemoveAuthor(author.key)}
          />
        ))}
        <div>
          <Button ref={addAuthorButton} variant="secondary" size="sm" onClick={onAddAuthor}>
            {labels.addAuthor}
          </Button>
        </div>
      </fieldset>

      {field("title", labels.title, labels.titleHint)}

      {draft.type === "book" && (
        <>
          {options.bookPlace && labels.place && field("place", labels.place, labels.placeHint)}
          {field("publisher", labels.publisher)}
        </>
      )}

      {draft.type === "conference-paper" && labels.proceedings && labels.location && (
        <>
          {field("proceedings", labels.proceedings, labels.proceedingsHint)}
          <div className="grid items-start gap-3 sm:grid-cols-2">
            {field("location", labels.location, labels.locationHint)}
            {field("pages", labels.pages, labels.pagesHint)}
          </div>
        </>
      )}

      {draft.type === "journal-article" && (
        <>
          {field("journal", labels.journal, labels.journalHint)}
          <div className="grid items-start gap-3 sm:grid-cols-3">
            {field("volume", labels.volume)}
            {field("issue", labels.issue)}
            {field("pages", labels.pages, labels.pagesHint)}
          </div>
        </>
      )}

      {draft.type === "webpage" && field("siteName", labels.siteName, labels.siteNameHint)}

      <fieldset className="grid gap-4" aria-describedby={`${idPrefix}-date-hint`}>
        <legend className="mb-1 text-subheading font-semibold">{labels.date}</legend>
        <p id={`${idPrefix}-date-hint`} className="text-small text-text-muted">
          {draft.type === "journal-article" ? labels.journalDateHint : draft.type === "conference-paper" ? (labels.conferenceDateHint ?? labels.dateHint) : labels.dateHint}
        </p>
        <div className="grid items-start gap-3 sm:grid-cols-3">
          {draft.type === "webpage" ? (
            fullDate("day", "month", "year")
          ) : (
            <>
              {((draft.type === "journal-article" && options.journalMonth) || draft.type === "conference-paper") && monthField("month")}
              {field("year", labels.year, undefined, { inputMode: "numeric" })}
            </>
          )}
        </div>
      </fieldset>

      {draft.type === "book" && (
        <MoreDetails label={labels.moreDetails}>
          {field("edition", labels.edition, labels.editionHint)}
          {field("doi", labels.doi, labels.doiHint)}
          {field("url", labels.url, labels.urlHintOptional, { inputMode: "url" })}
          {options.accessDates && accessedFields}
        </MoreDetails>
      )}

      {draft.type === "journal-article" && (
        <>
          {field("doi", labels.doi, labels.doiHint)}
          <MoreDetails label={labels.moreDetails}>
            {field("url", labels.url, labels.urlHintOptional, { inputMode: "url" })}
            {field("articleNumber", labels.articleNumber, labels.articleNumberHint)}
            {options.accessDates && accessedFields}
          </MoreDetails>
        </>
      )}

      {draft.type === "conference-paper" && (
        <>
          {field("doi", labels.doi, labels.doiHint)}
          <MoreDetails label={labels.moreDetails}>{field("url", labels.url, labels.urlHintOptional, { inputMode: "url" })}</MoreDetails>
        </>
      )}

      {draft.type === "webpage" && (
        <>
          {field("url", labels.url, labels.urlHint, { inputMode: "url" })}
          <MoreDetails label={labels.moreDetails}>
            {field("publisher", labels.webPublisher, labels.webPublisherHint)}
            {accessedFields}
          </MoreDetails>
        </>
      )}
    </form>
  );
}
