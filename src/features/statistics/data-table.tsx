import type { ReactNode } from "react";
import { cx } from "@/ui";
import { statisticsCopy } from "./copy";

/** An id from a caption, stable across renders, for labelling a table's scrolling region. */
export const captionId = (prefix: string, caption: string) => `${prefix}-${caption.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export interface DataTableProps {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly ReactNode[])[];
  /** Which columns hold numbers, which are right-aligned so they can be compared. */
  numeric?: readonly boolean[];
  id?: string;
}

/**
 * A captioned table in a region that scrolls sideways on narrow screens. The region can
 * take keyboard focus, so it can be scrolled without a pointer.
 */
export function DataTable({ caption, columns, rows, numeric = [], id }: DataTableProps) {
  const labelId = id ?? captionId("table", caption);
  return (
    <div role="region" aria-labelledby={labelId} tabIndex={0} className="relative overflow-x-auto rounded-panel border border-border bg-surface focus-ring">
      <table className="w-full min-w-max border-collapse text-small">
        <caption id={labelId} className="px-4 pt-3 pb-2 text-start font-semibold">
          {caption}
          <span className="sr-only"> {statisticsCopy.table.scrollHint}</span>
        </caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((column, index) => (
              <th key={column} scope="col" className={cx("px-4 py-2 font-semibold", numeric[index] ? "text-end" : "text-start")}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-b-0">
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row" className={cx("px-4 py-2 font-medium", numeric[index] ? "text-end tabular-nums" : "text-start")}>
                    {cell}
                  </th>
                ) : (
                  <td key={index} className={cx("px-4 py-2 align-top", numeric[index] ? "text-end tabular-nums" : "text-start")}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
