import { COMPARISON_MATRIX, MATRIX_COLUMNS } from "@/knowledge/research/test-finder";
import { statisticsCopy } from "./copy";
import { DataTable } from "./data-table";

/** The core tests side by side, in a table that scrolls sideways on narrow screens. */
export function ComparisonMatrix() {
  return (
    <div className="grid gap-2">
      <DataTable
        id="comparison-matrix"
        caption={statisticsCopy.matrix.caption}
        columns={MATRIX_COLUMNS}
        rows={COMPARISON_MATRIX.map((row) => [
          row.test,
          <span key="purpose" className="block max-w-64">
            {row.purpose}
          </span>,
          <span key="outcome" className="block max-w-48">
            {row.outcome}
          </span>,
          <span key="variables" className="block max-w-64">
            {row.variables}
          </span>,
          <span key="structure" className="block max-w-56">
            {row.structure}
          </span>,
          <ul key="assumptions" className="grid max-w-56 list-disc gap-0.5 ps-4">
            {row.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>,
          <span key="alternative" className="block max-w-48">
            {row.alternative}
          </span>,
        ])}
      />
      <p className="text-caption text-text-muted">{statisticsCopy.matrix.scrollHint}</p>
    </div>
  );
}
