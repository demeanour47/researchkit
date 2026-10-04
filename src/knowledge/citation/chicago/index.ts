/**
 * The Chicago Manual of Style, 18th edition. Rules both Chicago systems share
 * (author names, inclusive numbers, dates) live here; each system's formatter lives
 * in its own folder: ./author-date/ and ./notes-bibliography/.
 */

export { chicagoDate, fullDate, type ChicagoDate } from "./dates";
export { LISTED_BEFORE_ET_AL, MAX_LISTED_AUTHORS, listAuthors, named, noteAuthors, textAuthors, textName, type NamedContributor } from "./names";
export { chicagoAuthors, chicagoEdition, chicagoLocation, sameName, soleOrganization, type AuthorProblem, type ChicagoEdition, type ChicagoLocation } from "./source-parts";
export { formatChicagoPages, type ChicagoPages } from "./numbers";
