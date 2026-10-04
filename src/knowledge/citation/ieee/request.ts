/**
 * How a source is being cited in IEEE style. In a numeric style, a citation is a
 * reference number, and the number comes from the order in which sources are first
 * cited in the writer's document (ADR-0007). The source describes the work; the
 * number, the locator and the form of a multiple citation describe the citation.
 */

import type { AnySource, LocatorKind } from "../source";

/** IEEE cites parts of a reference by page, chapter or section: [3, pp. 5–10], [3, Ch. 2], [3, Sect. 4.5]. */
export type IeeeLocatorKind = LocatorKind | "chapter";

export interface IeeeLocator {
  kind: IeeeLocatorKind;
  value: string;
}

/**
 * How consecutive numbers are written in a citation of several references. The
 * current IEEE Reference Guide writes every number out, [1], [2], [3], [4]; earlier
 * guidance, still required by some publishers, joined three or more consecutive
 * numbers with an en dash, [1]–[4].
 */
export type RangeStyle = "written-out" | "en-dash";

export interface IeeeReferenceRequest {
  source: AnySource;
  provenance: "user-entered" | "verified";
  /** The reference's number, as typed; it must be a single positive whole number. */
  number: string;
  /** The passage cited, if any. A locator with a kind but no value was requested and left empty. */
  locator?: IeeeLocator;
}

export interface IeeeMultipleRequest {
  /** The reference numbers, as typed, such as “1, 3, 7” or “4-7”. */
  numbers: string;
  ranges: RangeStyle;
}
