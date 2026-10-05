/**
 * BibTeX export, for pasting into the Literature Matrix's import box (or a reference
 * manager). Only fields the provider supplied are written; nothing is invented.
 */

import type { Contributor } from "../citation/source";
import { bareDoi } from "./links";
import type { LiteratureRecord } from "./types";

const ESCAPES: Readonly<Record<string, string>> = { "\\": "\\textbackslash{}", "{": "\\{", "}": "\\}", "&": "\\&", "%": "\\%", $: "\\$", "#": "\\#", _: "\\_" };
const escapeBibtex = (value: string) => value.replace(/[\\{}&%$#_]/g, (character) => ESCAPES[character] ?? character);

function authorName(author: Contributor): string {
  if (author.kind === "organization") return `{${escapeBibtex(author.name)}}`;
  const family = escapeBibtex(author.family);
  return author.given ? `${family}, ${escapeBibtex(author.given)}` : family;
}

function keyFor(record: LiteratureRecord, taken: Set<string>): string {
  const first = record.source.authors[0];
  const family = first ? (first.kind === "person" ? first.family : first.name) : "anon";
  const base = `${family.normalize("NFKD").replace(/[^A-Za-z]/g, "").toLowerCase() || "anon"}${record.source.date.year ?? ""}`;
  let key = base;
  for (let suffix = 97; taken.has(key); suffix += 1) key = `${base}${String.fromCharCode(suffix)}`;
  taken.add(key);
  return key;
}

export function toBibtex(records: readonly LiteratureRecord[]): string {
  const taken = new Set<string>();
  return records
    .map((record) => {
      const { source } = record;
      const fields: [string, string][] = [["title", `{${escapeBibtex(source.title)}}`]];
      if (source.authors.length > 0) fields.push(["author", `{${source.authors.map(authorName).join(" and ")}}`]);
      if (source.date.year !== undefined) fields.push(["year", `{${source.date.year}}`]);
      let entry = "misc";
      if (source.type === "journal-article") {
        entry = "article";
        if (source.journal !== "") fields.push(["journal", `{${escapeBibtex(source.journal)}}`]);
        if (source.volume) fields.push(["volume", `{${escapeBibtex(source.volume)}}`]);
        if (source.issue) fields.push(["number", `{${escapeBibtex(source.issue)}}`]);
        if (source.pages) fields.push(["pages", `{${escapeBibtex(source.pages)}}`]);
      } else if (source.type === "book") {
        entry = "book";
        if (source.publisher) fields.push(["publisher", `{${escapeBibtex(source.publisher)}}`]);
      }
      const doi = source.type === "webpage" ? undefined : bareDoi(source.doi);
      if (doi) fields.push(["doi", `{${doi}}`]);
      if (record.abstract) fields.push(["abstract", `{${escapeBibtex(record.abstract)}}`]);
      const body = fields.map(([name, value]) => `  ${name} = ${value}`).join(",\n");
      return `@${entry}{${keyFor(record, taken)},\n${body}\n}`;
    })
    .join("\n\n");
}
