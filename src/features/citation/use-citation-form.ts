"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { SOURCE_TYPES, type AnySource, type AnySourceType, type SourceRecord } from "@/knowledge/citation/source";
import { emptyAuthor, type AuthorDraft } from "./author-draft";
import { firstFieldId } from "./author-fields";
import { blankDraft, isEmptyDraft, toAnySource, toSource, withOfferedType, type SourceDraft } from "./source-draft";

/** How long typing must pause before an updated result is announced to screen readers. */
const ANNOUNCE_AFTER_MS = 1000;

export interface CitationFormOptions<Kind extends string> {
  /** The same prefix the form's fields use, so focus can return to the first field. */
  idPrefix: string;
  /** The locator kind selected when the form is new or cleared, or "" for none. */
  defaultLocator: Kind | "";
  /** The source types the form offers. Defaults to the types every style supports. */
  types?: readonly AnySourceType[];
}

/**
 * The state every citation generator's form shares: the source being typed, its
 * authors, the locator, and what is announced to screen readers. Focus moves to a
 * newly added author, back to the add button when one is removed, and to the first
 * field when the form is cleared. Nothing is stored or sent anywhere.
 */
export function useCitationForm<Kind extends string>({ idPrefix, defaultLocator, types = SOURCE_TYPES }: CitationFormOptions<Kind>) {
  const nextKey = useRef(2);
  const [draft, setDraft] = useState<SourceDraft<AnySourceType>>(() => blankDraft(1));
  const [locatorKind, setLocatorKind] = useState<Kind | "">(defaultLocator);
  const [locatorValue, setLocatorValue] = useState("");
  const [announcement, setAnnouncement] = useState("");
  /** Whether the latest change came from typing, so the updated result should be announced. */
  const typed = useRef(false);
  const addAuthorButton = useRef<HTMLButtonElement>(null);
  /** An author just added, whose first field should receive focus once it has rendered. */
  const focusAuthorKey = useRef<number | null>(null);
  const focusFirstField = useRef(false);

  /** The source, for the styles every generator supports; null for an opt-in type such as a conference paper. */
  const record = useMemo<SourceRecord | null>(
    () => (isEmptyDraft(draft) || draft.type === "conference-paper" ? null : { source: toSource({ ...draft, type: draft.type }), provenance: "user-entered" }),
    [draft],
  );
  /** The source, of any type in the model, for styles that format the opt-in types. */
  const anySource = useMemo<AnySource | null>(() => (isEmptyDraft(draft) ? null : toAnySource(draft)), [draft]);
  const locator = useMemo<{ kind: Kind; value: string } | undefined>(
    () => (locatorKind && locatorValue.trim() ? { kind: locatorKind, value: locatorValue } : undefined),
    [locatorKind, locatorValue],
  );

  useEffect(() => {
    if (focusFirstField.current) {
      document.querySelector<HTMLInputElement>(`input[name="${idPrefix}-source-type"]:checked`)?.focus();
      focusFirstField.current = false;
    }
    if (focusAuthorKey.current === null) return;
    const author = draft.authors.find((candidate) => candidate.key === focusAuthorKey.current);
    if (author) document.getElementById(firstFieldId(author))?.focus();
    focusAuthorKey.current = null;
  }, [draft, idPrefix]);

  /** Announces a message, even if it repeats the last one, by clearing the region first. */
  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 50);
  };

  const update = (changes: Partial<SourceDraft<AnySourceType>>) => {
    typed.current = true;
    setDraft((current) => ({ ...current, ...changes }));
  };

  return {
    draft,
    record,
    anySource,
    locator,
    locatorKind,
    locatorValue,
    announcement,
    addAuthorButton,
    announce,
    update,
    setType: (value: string) => {
      typed.current = true;
      setDraft((current) => withOfferedType(current, value, types));
    },
    updateAuthor: (changed: AuthorDraft) => update({ authors: draft.authors.map((author) => (author.key === changed.key ? changed : author)) }),
    addAuthor: () => {
      const key = nextKey.current++;
      focusAuthorKey.current = key;
      update({ authors: [...draft.authors, emptyAuthor(key)] });
    },
    removeAuthor: (key: number) => {
      update({ authors: draft.authors.filter((author) => author.key !== key) });
      addAuthorButton.current?.focus();
    },
    setLocatorKind: (kind: Kind | "") => {
      setLocatorKind(kind);
      if (!kind) setLocatorValue("");
    },
    setLocatorValue,
    /** Empties the form and moves focus to its first field. */
    clear: (message: string) => {
      typed.current = false;
      focusFirstField.current = true;
      setLocatorKind(defaultLocator);
      setLocatorValue("");
      setDraft(blankDraft(nextKey.current++));
      announce(message);
    },
    /** Fills the form with an example, whose authors take fresh keys. */
    loadExample: (example: (firstAuthorKey: number) => SourceDraft<AnySourceType>, exampleLocator: { kind: Kind; value: string } | null, message: string) => {
      typed.current = false;
      const filled = example(nextKey.current);
      nextKey.current += filled.authors.length;
      setDraft(filled);
      setLocatorKind(exampleLocator?.kind ?? defaultLocator);
      setLocatorValue(exampleLocator?.value ?? "");
      announce(message);
    },
    /** Whether the latest change came from typing; read by useAnnounceWhenTyped. */
    typed,
    setAnnouncement,
  };
}

/** Announces an updated result once typing pauses. Results changed by loading an example or clearing aren't announced. */
export function useAnnounceWhenTyped(form: { typed: RefObject<boolean>; setAnnouncement: (message: string) => void }, message: string | null) {
  const { typed, setAnnouncement } = form;
  useEffect(() => {
    if (!typed.current || !message) return;
    const timer = setTimeout(() => setAnnouncement(message), ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [message, typed, setAnnouncement]);
}
