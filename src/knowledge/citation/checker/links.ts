/**
 * DOI and URL checks every style makes the same way: an identifier that can't be
 * valid is an error. How a valid one should be written differs by style, so each
 * style says which form it expects, and a different form is explained, not
 * corrected.
 */

import { findDoi, findUrl, type FoundDoi, type FoundUrl } from "./features";
import { issue } from "./issue";
import type { ReferenceCheckIssue } from "./types";

export interface LinkExpectations {
  /** The style's name, as the explanation uses it. */
  style: string;
  /** How the style writes a DOI. */
  doi: "link" | "prefix";
  /** Whether the style drops http:// and https:// from URLs. */
  bareUrls: boolean;
}

export interface Links {
  doi: FoundDoi | null;
  url: FoundUrl | null;
  issues: ReferenceCheckIssue[];
}

export function checkLinks(text: string, expect: LinkExpectations): Links {
  const issues: ReferenceCheckIssue[] = [];
  const doi = findDoi(text);
  const url = findUrl(text);
  if (doi && !doi.normalized) {
    issues.push(issue("doi", "error", "DOI syntax appears invalid.", "A DOI starts with 10., a registrant number and a slash, such as 10.1086/725865. This one doesn't have that structure, so it can't lead to the work.", "Check the DOI against the original source.", doi.raw));
  } else if (doi && doi.form !== expect.doi) {
    issues.push(
      expect.doi === "link"
        ? issue("doi", "information", `${expect.style} writes a DOI as a https://doi.org/ link.`, "A DOI written as a link leads readers straight to the work.", "Write the DOI as https://doi.org/ followed by the DOI.", doi.raw)
        : issue("doi", "information", `${expect.style} writes a DOI after “doi:”.`, "The IEEE Reference Guide gives a DOI as doi: followed by the DOI, not as a link.", "Write doi: followed by the DOI, such as doi: 10.1109/5.771073.", doi.raw),
    );
  }
  if (url && !url.valid) {
    issues.push(issue("url", "error", "URL syntax appears invalid.", "A URL in a reference must be a complete web address that leads readers to the source.", "Check the URL against the original source.", url.raw));
  } else if (url && expect.bareUrls && !url.bare) {
    issues.push(issue("url", "information", `${expect.style} generally leaves out http:// and https://.`, "The MLA Handbook recommends giving a URL without its protocol, unless your instructor asks for it.", "Remove http:// or https:// unless you have been asked to keep it.", url.raw));
  }
  return { doi, url, issues };
}
