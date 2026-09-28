"use client";

import { useState } from "react";
import { Button, TextField } from "@/ui";
import { stepPosition } from "./announcements";
import { specific } from "./copy";

export interface ObjectivesListProps {
  objectives: readonly string[];
  onEdit: (index: number, text: string) => void;
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  onMove: (index: number, toIndex: number) => void;
}

/** The specific objectives, each editable in place, with reordering, duplication and removal. */
export function ObjectivesList({ objectives, onEdit, onAdd, onRemove, onDuplicate, onMove }: ObjectivesListProps) {
  const [draft, setDraft] = useState("");

  return (
    <div className="grid gap-6">
      {objectives.length === 0 ? (
        <p className="text-text-muted">{specific.empty}</p>
      ) : (
        <ol className="grid gap-3">
          {objectives.map((objective, index) => {
            const position = index + 1;
            const up = stepPosition(index, objectives.length, -1);
            const down = stepPosition(index, objectives.length, 1);
            return (
              <li key={index}>
                <fieldset className="grid gap-3 rounded-panel border border-border p-4">
                  <legend className="px-1 font-medium">{specific.listLegend(position)}</legend>
                  <TextField
                    id={`specific-objective-${index}`}
                    label={specific.label(position)}
                    multiline
                    rows={2}
                    value={objective}
                    onChange={(event) => onEdit(index, event.target.value)}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" size="sm" disabled={up === null} onClick={() => up !== null && onMove(index, up)}>
                      {specific.moveUp(position)}
                    </Button>
                    <Button variant="secondary" size="sm" disabled={down === null} onClick={() => down !== null && onMove(index, down)}>
                      {specific.moveDown(position)}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onDuplicate(index)}>
                      {specific.duplicate(position)}
                    </Button>
                    <Button variant="subtle" size="sm" onClick={() => onRemove(index)}>
                      {specific.remove(position)}
                    </Button>
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ol>
      )}
      <form
        className="grid items-end gap-3 sm:grid-cols-[1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          onAdd(draft);
          setDraft("");
        }}
      >
        <TextField id="new-specific-objective" label={specific.newLabel} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button type="submit" variant="secondary">
          {specific.add}
        </Button>
      </form>
    </div>
  );
}
