import { Link } from "@/ui";
import { referenceLink, referenceRuns, type Reference } from "@/knowledge/research";

/** References in APA style, with titles in italics and DOIs or URLs as links. */
export function ReferenceList({ references }: { references: readonly Reference[] }) {
  return (
    <ul className="grid gap-2">
      {references.map((reference) => {
        const link = referenceLink(reference);
        return (
          <li key={reference.id} className="ps-6 -indent-6 wrap-anywhere">
            {referenceRuns(reference).map((run, index) => (run.italic ? <i key={index}>{run.text}</i> : run.text))}
            {link && (
              <>
                {" "}
                <Link href={link}>{link}</Link>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
