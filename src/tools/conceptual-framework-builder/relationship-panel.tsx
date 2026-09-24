"use client";

import { useState } from "react";
import { Button, SelectField, TextField } from "@/ui";
import {
  RELATIONSHIP_TYPES,
  RELATIONSHIP_TYPE_INFO,
  describeRelationship,
  type ConceptualFramework,
  type NewRelationship,
  type RelationshipType,
} from "@/knowledge/research";
import { steps } from "./copy";

const typeOptions = RELATIONSHIP_TYPES.map((type) => ({ value: type, label: RELATIONSHIP_TYPE_INFO[type].label }));

export interface RelationshipPanelProps {
  framework: ConceptualFramework;
  onRetype: (id: string, type: RelationshipType) => void;
  onRelabel: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onAdd: (relationship: NewRelationship) => string | null;
}

/** Every relationship with its type, label and controls, then a form to add one. */
export function RelationshipPanel({ framework, onRetype, onRelabel, onDelete, onSelect, onAdd }: RelationshipPanelProps) {
  const [draft, setDraft] = useState<{ source: string; target: string; type: RelationshipType; moderates: string; label: string }>({
    source: "",
    target: "",
    type: "direct",
    moderates: "",
    label: "",
  });
  const [error, setError] = useState<string | null>(null);
  const variableOptions = framework.variables.map((variable) => ({ value: variable.id, label: variable.name }));
  const moderatable = framework.relationships
    .filter((relationship) => relationship.type !== "moderation")
    .map((relationship) => ({ value: relationship.id, label: describeRelationship(framework, relationship) }));

  return (
    <div className="grid gap-6">
      {framework.relationships.length === 0 ? (
        <p className="text-text-muted">{steps.noRelationships}</p>
      ) : (
        <ul className="grid gap-3">
          {framework.relationships.map((relationship) => {
            const description = describeRelationship(framework, relationship);
            return (
              <li key={relationship.id} className="grid gap-3 rounded-panel border border-border p-4">
                <p>{description}</p>
                <div className="grid items-end gap-3 sm:grid-cols-2">
                  <SelectField
                    id={`relationship-type-${relationship.id}`}
                    label={steps.relationshipType(description)}
                    options={typeOptions}
                    value={relationship.type}
                    onChange={(event) => onRetype(relationship.id, event.target.value as RelationshipType)}
                  />
                  <TextField
                    id={`relationship-label-${relationship.id}`}
                    label={steps.relationshipLabel(description)}
                    value={relationship.label ?? ""}
                    autoComplete="off"
                    onChange={(event) => onRelabel(relationship.id, event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" onClick={() => onSelect(relationship.id)}>
                    {steps.showDetails}
                  </Button>
                  <Button variant="subtle" size="sm" onClick={() => onDelete(relationship.id)}>
                    {steps.deleteRelationship}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        className="grid gap-4 rounded-panel border border-border bg-surface p-4"
        aria-labelledby="new-relationship-title"
        onSubmit={(event) => {
          event.preventDefault();
          const problem = onAdd({
            source: draft.source,
            target: draft.target,
            type: draft.type,
            label: draft.label,
            moderates: draft.type === "moderation" ? draft.moderates || null : null,
          });
          setError(problem);
          if (!problem) setDraft((current) => ({ ...current, label: "" }));
        }}
      >
        <h3 id="new-relationship-title" className="text-subheading font-semibold">
          {steps.newRelationship}
        </h3>
        <div className="grid items-end gap-3 sm:grid-cols-3">
          <SelectField id="new-relationship-source" label={steps.from} emptyOption={steps.choose} options={variableOptions} value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} />
          <SelectField id="new-relationship-type" label={steps.type} options={typeOptions} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as RelationshipType })} />
          <SelectField id="new-relationship-target" label={steps.to} emptyOption={steps.choose} options={variableOptions} value={draft.target} onChange={(event) => setDraft({ ...draft, target: event.target.value })} />
        </div>
        {draft.type === "moderation" && (
          <SelectField id="new-relationship-moderates" label={steps.moderatesField} emptyOption={steps.noModerated} options={moderatable} value={draft.moderates} onChange={(event) => setDraft({ ...draft, moderates: event.target.value })} />
        )}
        <TextField id="new-relationship-label" label={steps.label} value={draft.label} autoComplete="off" onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
        {error && (
          <p role="alert" className="text-small font-medium">
            {error}
          </p>
        )}
        <div>
          <Button type="submit" variant="secondary">
            {steps.addRelationship}
          </Button>
        </div>
      </form>
    </div>
  );
}
