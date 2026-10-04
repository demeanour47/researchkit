/**
 * One source in IEEE style: its numbered reference entry and the citations that point
 * to it. The number links the two; it comes from the request, never from the source.
 */

import { nameableAuthors, type Run } from "../source";
import { formatSingleCitation, namedCitation } from "./in-text";
import type { Decision, Note } from "./notes";
import { formatIeeeReference, numberedReference } from "./reference";
import type { IeeeReferenceRequest } from "./request";

export interface IeeeSourceCitation {
  /** The reference's number, or null if the number typed isn't valid. */
  number: number | null;
  /** The entry without its number. */
  reference: Run[];
  /** The entry as it appears in the reference list, “[1] …”, or null without a valid number. */
  entry: Run[] | null;
  /** The citation in the text, “[1]” or “[1, p. 24]”, or null without a valid number. */
  citation: Run[] | null;
  /** The citation after the authors' names, “Klaus and Horn [1]”, or null without authors or a valid number. */
  namedCitation: Run[] | null;
  decisions: Decision[];
  notes: Note[];
}

const unique = <T>(items: readonly T[]) => items.filter((item, index) => items.findIndex((other) => JSON.stringify(other) === JSON.stringify(item)) === index);

export function formatIeee(request: IeeeReferenceRequest): IeeeSourceCitation {
  const reference = formatIeeeReference(request.source);
  const citation = formatSingleCitation(request.number, request.locator);
  const number = citation.numbers[0] ?? null;
  const { authors } = nameableAuthors(request.source.authors);
  const named = citation.runs ? namedCitation(authors, citation.runs) : null;
  return {
    number,
    reference: reference.runs,
    entry: number === null ? null : numberedReference(number, reference.runs),
    citation: citation.runs,
    namedCitation: named,
    decisions: unique([...reference.decisions, ...citation.decisions, ...(named ? [{ code: "text-names" } as const] : [])]),
    // Which number a source gets depends on the writer's whole document, which a single-source generator can't see.
    notes: unique([...reference.notes, ...citation.notes, { code: "citation-order" }]),
  };
}
