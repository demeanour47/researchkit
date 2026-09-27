"use client";

import { Button } from "@/ui";
import { FIELD_INFO, PRIORITY_LABELS, READING_STATUS_LABELS, studyLabel, type MatrixField, type Study } from "@/knowledge/literature";
import { steps } from "./copy";
import { TagBadge } from "./parts";

export interface MatrixTableProps {
  studies: readonly Study[];
  total: number;
  fields: readonly MatrixField[];
  canReorder: boolean;
  /** Position of each study in the whole matrix, for moving. */
  positions: ReadonlyMap<string, number>;
  covered: ReadonlyMap<string, string[]>;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, by: -1 | 1) => void;
  onDelete: (id: string) => void;
  onFavourite: (id: string) => void;
}

/** The matrix as a real table: each study is a row, named in its row header, with its columns and actions. */
export function MatrixTable({ studies, total, fields, canReorder, positions, covered, onEdit, onDuplicate, onMove, onDelete, onFavourite }: MatrixTableProps) {
  const columns = fields.filter((field) => field !== "authors");
  return (
    <div role="region" aria-labelledby="matrix-caption" tabIndex={0} className="overflow-x-auto rounded-panel border border-border focus-ring">
      <table className="min-w-full border-collapse text-small">
        <caption id="matrix-caption" className="p-3 text-start font-medium">
          {steps.caption(studies.length, total)}
        </caption>
        <thead>
          <tr className="border-b border-border bg-sunken">
            <th scope="col" className="min-w-48 px-3 py-2 text-start font-semibold">
              {steps.study}
            </th>
            {columns.map((field) => (
              <th key={field} scope="col" className={`px-3 py-2 text-start font-semibold ${FIELD_INFO[field].multiline ? "min-w-64" : "min-w-32"}`}>
                {FIELD_INFO[field].label}
              </th>
            ))}
            <th scope="col" className="min-w-72 px-3 py-2 text-start font-semibold">
              {steps.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {studies.map((study) => {
            const label = studyLabel(study);
            const position = positions.get(study.id) ?? 0;
            const variables = covered.get(study.id) ?? [];
            return (
              <tr key={study.id} className="border-b border-border align-top">
                <th scope="row" className="px-3 py-2 text-start font-normal">
                  <span className="block font-semibold">{label}</span>
                  {study.fields.authors && study.fields.authors !== label && <span className="block text-text-muted">{study.fields.authors}</span>}
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-text-muted">
                    <span>{READING_STATUS_LABELS[study.status]}</span>
                    {study.priority && <span>{`${steps.priority}: ${PRIORITY_LABELS[study.priority]}`}</span>}
                    {study.tag && <TagBadge tag={study.tag} />}
                    {study.favourite && <span>★ Favourite</span>}
                  </span>
                  {variables.length > 0 && <span className="mt-1 block text-text-muted">{`${steps.covers}: ${variables.join(", ")}`}</span>}
                </th>
                {columns.map((field) => (
                  <td key={field} className="whitespace-pre-line px-3 py-2">
                    {study.fields[field]}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button id={`edit-${study.id}`} variant="secondary" size="sm" aria-label={steps.edit(label)} onClick={() => onEdit(study.id)}>
                      Edit
                    </Button>
                    <Button variant="subtle" size="sm" aria-label={steps.favourite(label)} aria-pressed={study.favourite} onClick={() => onFavourite(study.id)}>
                      {study.favourite ? "★" : "☆"}
                    </Button>
                    <Button variant="subtle" size="sm" aria-label={steps.duplicate(label)} onClick={() => onDuplicate(study.id)}>
                      Duplicate
                    </Button>
                    {canReorder && (
                      <>
                        <Button variant="subtle" size="sm" aria-label={steps.moveUp(label)} disabled={position === 0} onClick={() => onMove(study.id, -1)}>
                          ↑
                        </Button>
                        <Button variant="subtle" size="sm" aria-label={steps.moveDown(label)} disabled={position === total - 1} onClick={() => onMove(study.id, 1)}>
                          ↓
                        </Button>
                      </>
                    )}
                    <Button variant="subtle" size="sm" aria-label={steps.remove(label)} onClick={() => onDelete(study.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
