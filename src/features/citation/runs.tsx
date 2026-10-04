import { Fragment } from "react";
import type { Run } from "@/knowledge/citation/source";

/** Formatted runs: italics as italics, and missing information shown as bracketed placeholders. */
export function Runs({ runs }: { runs: readonly Run[] }) {
  return runs.map((run, index) =>
    run.italic ? (
      <i key={index}>{run.text}</i>
    ) : run.placeholder ? (
      <span key={index} className="text-text-muted">
        {run.text}
      </span>
    ) : (
      <Fragment key={index}>{run.text}</Fragment>
    ),
  );
}
