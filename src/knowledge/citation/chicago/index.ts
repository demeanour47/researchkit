/**
 * The Chicago Manual of Style, 18th edition. Rules both Chicago systems share
 * (author names, inclusive numbers, dates) live here; each system's formatter lives
 * in its own folder. Author-date is implemented; notes and bibliography will join
 * it as ./notes-bibliography/.
 */

export { chicagoDate, fullDate, type ChicagoDate } from "./dates";
export { LISTED_BEFORE_ET_AL, MAX_LISTED_AUTHORS, listAuthors, named, textAuthors, textName, type NamedContributor } from "./names";
export { formatChicagoPages, type ChicagoPages } from "./numbers";
