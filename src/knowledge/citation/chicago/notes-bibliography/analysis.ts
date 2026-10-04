/**
 * What notes and bibliography entries both need to know about a source, worked out
 * once: who can be named, who owns a web page, the date as Chicago writes it, and
 * where the work can be found. Problems found here are reported whichever output is
 * being built.
 */

import type { Source } from "../../source";
import { chicagoDate, fullDate } from "../dates";
import type { NamedContributor } from "../names";
import { chicagoAuthors, chicagoLocation, sameName, soleOrganization, type ChicagoLocation } from "../source-parts";
import type { Decision, Note } from "./notes";

export interface Analysis {
  source: Source;
  title: string;
  authors: NamedContributor[];
  /** Whether a person is named as author. */
  personal: boolean;
  /** The organization responsible for a work with no person as author: an organization author, or a web page's owner. */
  owner: string | null;
  /** The site's name, unless it repeats the owner's. */
  siteName: string | null;
  /** The year, or "n.d." for an undated book or article. Web pages use an access date instead (CMOS 14.104). */
  year: string;
  /** A web page's full date, such as "March 2, 2016", or null. */
  webDate: string | null;
  /** A web page's access date, given only when the page has no date. */
  accessed: string | null;
  location: ChicagoLocation;
  decisions: Decision[];
  notes: Note[];
}

export function analyse(source: Source): Analysis {
  const decisions: Decision[] = [];
  const notes: Note[] = [];
  const { authors, problems } = chicagoAuthors(source.authors);
  notes.push(...problems);
  const title = source.title.trim();
  if (!title) notes.push({ code: "missing-title" });
  else notes.push({ code: "check-headline-style" });
  const personal = authors.some((author) => author.kind === "person");
  if (authors.length === 0) notes.push({ code: "no-author" });

  const date = chicagoDate(source.date);
  if (date.problem) notes.push({ code: date.problem, date: "publication" });
  if (date.year === null) notes.push({ code: "missing-year", sourceType: source.type });

  let owner = soleOrganization(authors);
  let siteName: string | null = null;
  let webDate: string | null = null;
  let accessed: string | null = null;
  if (source.type === "webpage") {
    const publisher = (source.publisher ?? "").trim();
    const site = (source.siteName ?? "").trim();
    if (authors.length === 0 && publisher) {
      owner = publisher;
      decisions.push({ code: "listed-under-owner" });
    } else if (publisher && !(owner && sameName(owner, publisher))) {
      notes.push({ code: "publisher-not-shown" });
    }
    if (site && owner && sameName(site, owner)) decisions.push({ code: "site-name-omitted" });
    else if (site) siteName = site;
    if (!site && !owner) notes.push({ code: "missing-site-name" });

    webDate = fullDate(date);
    if (webDate && date.monthDay) notes.push({ code: "web-date-label" });
    if (source.accessed) {
      const access = chicagoDate(source.accessed);
      if (access.problem) notes.push({ code: access.problem, date: "access" });
      const text = fullDate(access);
      if (text && webDate) notes.push({ code: "access-date-not-needed" });
      else if (text) {
        accessed = text;
        decisions.push({ code: "access-date", text });
      }
    }
    if (!webDate && !accessed) notes.push({ code: "missing-access-date" });
    if (!source.url.trim()) notes.push({ code: "missing-url" });
  } else if (date.year === null) {
    decisions.push({ code: "no-date" });
  }

  const location = source.type === "webpage" ? chicagoLocation(undefined, source.url) : chicagoLocation(source.doi, source.url);
  notes.push(...location.problems.map((code) => ({ code })));
  if (location.location?.kind === "doi") {
    decisions.push({ code: "doi-used" });
    if (location.urlLeftOut) decisions.push({ code: "url-left-out-for-doi" });
  } else if (location.location) {
    decisions.push({ code: "url-used" });
  }

  return {
    source,
    title,
    authors,
    personal,
    owner,
    siteName,
    year: date.year === null ? "n.d." : String(date.year),
    webDate,
    accessed,
    location,
    decisions,
    notes,
  };
}
