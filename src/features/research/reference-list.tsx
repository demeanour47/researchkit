import { Link } from "@/ui";
import { doiUrl, referenceRuns, type Reference } from "@/knowledge/research";

/** References in APA style, with titles in italics and DOIs as links. */
export function ReferenceList({ references }: { references: readonly Reference[] }) {
  return (
    <ul className="grid gap-2">
      {references.map((reference) => (
        <li key={reference.id} className="ps-6 -indent-6 break-words">
          {referenceRuns(reference).map((run, index) => (run.italic ? <i key={index}>{run.text}</i> : run.text))}
          {reference.doi && (
            <>
              {" "}
              <Link href={doiUrl(reference.doi)}>{doiUrl(reference.doi)}</Link>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
