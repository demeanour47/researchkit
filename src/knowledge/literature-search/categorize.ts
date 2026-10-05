/**
 * Grouping of a result set into topics. Nothing is hard-coded: each group is a label the
 * results themselves carry, chosen because many of the works share it. The groups are
 * ResearchKit's, built from OpenAlex's topics and keywords, and the page says so.
 * Each work is placed in exactly one group.
 */

import type { Category, LiteratureRecord } from "./types";

const MAX_GROUPS = 6;
/** A label has to be shared by this many works to form a group of its own. */
const MIN_GROUP = 2;
export const OTHER_LABEL = "Other topics";

interface Candidate {
  label: string;
  basis: Category["basis"];
}

/** A work's possible labels, most specific source first. */
function candidatesFor(record: LiteratureRecord): Candidate[] {
  const result: Candidate[] = [];
  const subfield = record.topics.find((topic) => topic.subfield !== undefined)?.subfield;
  if (subfield) result.push({ label: subfield, basis: "provider-topic" });
  for (const topic of record.topics) result.push({ label: topic.name, basis: "provider-topic" });
  for (const keyword of record.providerKeywords) result.push({ label: keyword, basis: "provider-keyword" });
  for (const term of record.researchKitKeywords) result.push({ label: term, basis: "researchkit-term" });
  return result;
}

const key = (label: string) => label.toLocaleLowerCase("en");

export interface Categorized {
  categories: Category[];
  /** Record id → category label. */
  assignment: Map<string, string>;
}

export function categorize(records: readonly LiteratureRecord[]): Categorized {
  const frequency = new Map<string, number>();
  const options = records.map((record) => {
    const seen = new Set<string>();
    return candidatesFor(record).filter((candidate) => {
      if (seen.has(key(candidate.label))) return false;
      seen.add(key(candidate.label));
      return true;
    });
  });
  for (const list of options) for (const candidate of list) frequency.set(key(candidate.label), (frequency.get(key(candidate.label)) ?? 0) + 1);

  // The labels shared widely enough to form groups, most shared first.
  const labels = new Map<string, Candidate>();
  for (const list of options) for (const candidate of list) if (!labels.has(key(candidate.label))) labels.set(key(candidate.label), candidate);
  const chosen = [...labels.entries()]
    .filter(([name]) => (frequency.get(name) ?? 0) >= MIN_GROUP)
    .sort((a, b) => (frequency.get(b[0]) ?? 0) - (frequency.get(a[0]) ?? 0) || a[1].label.localeCompare(b[1].label, "en"))
    .slice(0, MAX_GROUPS);
  const allowed = new Set(chosen.map(([name]) => name));

  const groups = new Map<string, Category>();
  const assignment = new Map<string, string>();
  records.forEach((record, index) => {
    const best = options[index]
      .filter((candidate) => allowed.has(key(candidate.label)))
      .sort((a, b) => (frequency.get(key(b.label)) ?? 0) - (frequency.get(key(a.label)) ?? 0))[0];
    const label = best?.label ?? OTHER_LABEL;
    const basis = best?.basis ?? "other";
    const group = groups.get(label) ?? { label, basis, count: 0, recordIds: [] };
    group.count += 1;
    group.recordIds.push(record.id);
    groups.set(label, group);
    assignment.set(record.id, label);
  });

  const categories = [...groups.values()].sort((a, b) => (a.label === OTHER_LABEL ? 1 : b.label === OTHER_LABEL ? -1 : b.count - a.count || a.label.localeCompare(b.label, "en")));
  return { categories, assignment };
}
