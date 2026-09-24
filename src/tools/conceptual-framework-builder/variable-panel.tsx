"use client";

import { useState } from "react";
import { Button, SelectField, TextField } from "@/ui";
import { VARIABLE_TYPES, VARIABLE_TYPE_LABELS, type FrameworkVariable, type VariableType } from "@/knowledge/research";
import { steps } from "./copy";

const typeOptions = VARIABLE_TYPES.map((type) => ({ value: type, label: VARIABLE_TYPE_LABELS[type] }));

/** One variable's name, type and delete control. A name is only applied once it isn't empty. */
function VariableRow({
  variable,
  onRename,
  onRetype,
  onDelete,
}: {
  variable: FrameworkVariable;
  onRename: (name: string) => void;
  onRetype: (type: VariableType) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(variable.name);
  return (
    <li className="grid items-end gap-3 rounded-panel border border-border p-4 sm:grid-cols-[1fr_auto_auto]">
      <TextField
        id={`variable-name-${variable.id}`}
        label={steps.variableName(variable.name)}
        value={name}
        autoComplete="off"
        onChange={(event) => {
          setName(event.target.value);
          if (event.target.value.trim()) onRename(event.target.value);
        }}
      />
      <SelectField
        id={`variable-type-${variable.id}`}
        label={steps.variableType(variable.name)}
        options={typeOptions}
        value={variable.type}
        onChange={(event) => onRetype(event.target.value as VariableType)}
      />
      <Button variant="subtle" onClick={onDelete}>
        {steps.deleteVariable(variable.name)}
      </Button>
    </li>
  );
}

export interface VariablePanelProps {
  variables: readonly FrameworkVariable[];
  onRename: (id: string, name: string) => void;
  onRetype: (id: string, type: VariableType) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, type: VariableType) => void;
}

export function VariablePanel({ variables, onRename, onRetype, onDelete, onAdd }: VariablePanelProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<VariableType>("independent");
  return (
    <div className="grid gap-6">
      <ul className="grid gap-3">
        {variables.map((variable) => (
          <VariableRow
            key={variable.id}
            variable={variable}
            onRename={(value) => onRename(variable.id, value)}
            onRetype={(value) => onRetype(variable.id, value)}
            onDelete={() => onDelete(variable.id)}
          />
        ))}
      </ul>
      <form
        className="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onAdd(name, type);
          setName("");
        }}
      >
        <TextField id="new-variable-name" label={steps.newVariable} value={name} autoComplete="off" onChange={(event) => setName(event.target.value)} />
        <SelectField id="new-variable-type" label={steps.newVariableType} options={typeOptions} value={type} onChange={(event) => setType(event.target.value as VariableType)} />
        <Button type="submit" variant="secondary">
          {steps.addVariable}
        </Button>
      </form>
    </div>
  );
}
