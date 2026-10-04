/** Harvard, in ResearchKit's defined profile (Cite Them Right, 13th edition; ADR-0008): references and text citations over the shared source model (ADR-0006). */

export { formatHarvard, type HarvardCitation, type HarvardRequest } from "./citation";
export { formatHarvardTextCitations, type HarvardTextCitations } from "./in-text";
export type { Decision, Note } from "./notes";
export { formatHarvardReference, type HarvardReference, type Lead } from "./reference";
export { issuesFor, provenanceIssue, unsupportedSourceType } from "./validate";
