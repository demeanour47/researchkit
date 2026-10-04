/**
 * How a source is being cited in Chicago notes and bibliography. A source describes
 * the work; this request describes the citation: which note, which passage, and the
 * short title to use. None of it belongs in the shared source model.
 *
 * Chicago gives a full note the first time a source is cited and a shortened note
 * after that (CMOS 18, 13.33); it discourages ibid. in favour of shortened notes
 * (13.37). Which note a citation needs depends on the writer's document, which this
 * formatter can't see, so the writer chooses it explicitly.
 */

import type { LocatorKind, SourceRecord } from "../../source";

/** Which note a citation needs: the first citation of a source, or a later one. */
export type NoteContext = "full-note" | "short-note";

/** Chicago notes also locate passages by chapter, as in “chap. 6” (CMOS 18 sample citations). */
export type NoteLocatorKind = LocatorKind | "chapter";

export interface NoteLocator {
  kind: NoteLocatorKind;
  value: string;
}

export interface NotesBibliographyRequest {
  record: SourceRecord;
  /** The passage cited in the note. A locator with a kind but no value was requested and left empty. */
  locator?: NoteLocator;
  /** The writer's own short title for shortened notes, overriding the one derived from the title. */
  shortTitle?: string;
}
