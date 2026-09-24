/**
 * Citation styles the style finder can recommend: names, current editions and
 * the authority that defines each one.
 *
 * Editions were last checked on 2026-09-24. Re-verify them against each
 * authority before relying on them; editions change every few years.
 */

export interface CitationStyle {
  name: string;
  edition?: string;
  authority: string;
}

export const CITATION_STYLES = {
  apa: {
    name: "APA Style",
    edition: "7th edition",
    authority: "Publication Manual of the American Psychological Association",
  },
  mla: {
    name: "MLA Style",
    edition: "9th edition",
    authority: "MLA Handbook, Modern Language Association",
  },
  chicago: {
    name: "Chicago Style",
    edition: "18th edition",
    authority: "The Chicago Manual of Style",
  },
  harvard: {
    name: "Harvard referencing",
    authority: "No single authority: each institution publishes its own version",
  },
  ieee: {
    name: "IEEE Style",
    authority: "IEEE Editorial Style Manual and IEEE Reference Guide",
  },
  vancouver: {
    name: "Vancouver style",
    authority: "ICMJE Recommendations and the U.S. National Library of Medicine's Citing Medicine",
  },
  ama: {
    name: "AMA Style",
    edition: "11th edition",
    authority: "AMA Manual of Style, American Medical Association",
  },
  acs: {
    name: "ACS Style",
    authority: "The ACS Guide to Scholarly Communication, American Chemical Society",
  },
  cse: {
    name: "CSE Style",
    authority: "Scientific Style and Format, Council of Science Editors",
  },
  bluebook: {
    name: "The Bluebook",
    authority: "The Bluebook: A Uniform System of Citation",
  },
  oscola: {
    name: "OSCOLA",
    authority: "Oxford University Standard for the Citation of Legal Authorities",
  },
  aglc: {
    name: "AGLC",
    authority: "Australian Guide to Legal Citation",
  },
  mcgill: {
    name: "McGill Guide",
    authority: "Canadian Guide to Uniform Legal Citation",
  },
  nzlsg: {
    name: "New Zealand Law Style Guide",
    authority: "New Zealand Law Style Guide",
  },
} as const satisfies Record<string, CitationStyle>;

export type StyleId = keyof typeof CITATION_STYLES;

/** The style's name with its edition, when it has a single current edition. */
export function styleTitle(id: StyleId): string {
  const style: CitationStyle = CITATION_STYLES[id];
  return style.edition ? `${style.name}, ${style.edition}` : style.name;
}
