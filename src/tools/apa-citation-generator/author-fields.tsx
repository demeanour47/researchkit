"use client";

import { Button, RadioGroup, TextField, VisuallyHidden } from "@/ui";
import { form } from "./copy";
import type { AuthorDraft } from "./draft";

/** The id of an author's first field, so focus can move to a newly added author. */
export const firstFieldId = (author: AuthorDraft) =>
  author.kind === "person" ? `author-${author.key}-family` : `author-${author.key}-name`;

export interface AuthorFieldsProps {
  author: AuthorDraft;
  position: number;
  canRemove: boolean;
  onChange: (author: AuthorDraft) => void;
  onRemove: () => void;
}

/** One author: a person (family and given names) or an organization. */
export function AuthorFields({ author, position, canRemove, onChange, onRemove }: AuthorFieldsProps) {
  const update = (changes: Partial<AuthorDraft>) => onChange({ ...author, ...changes });

  return (
    <fieldset className="grid gap-3 rounded-panel border border-border bg-surface p-4">
      <legend className="px-1 font-semibold">{form.author(position)}</legend>
      <RadioGroup
        variant="inline"
        name={`author-${author.key}-kind`}
        legend={form.authorKind}
        options={[
          { value: "person", label: form.person },
          { value: "organization", label: form.organization },
        ]}
        value={author.kind}
        onChange={(kind) => update({ kind })}
      />
      {author.kind === "person" ? (
        <div className="grid items-start gap-3 sm:grid-cols-2">
          <TextField
            id={`author-${author.key}-family`}
            label={form.familyName}
            value={author.family}
            onChange={(event) => update({ family: event.target.value })}
            autoComplete="off"
          />
          <TextField
            id={`author-${author.key}-given`}
            label={form.givenNames}
            hint={form.givenNamesHint}
            value={author.given}
            onChange={(event) => update({ given: event.target.value })}
            autoComplete="off"
          />
        </div>
      ) : (
        <TextField
          id={`author-${author.key}-name`}
          label={form.organizationName}
          value={author.name}
          onChange={(event) => update({ name: event.target.value })}
          autoComplete="off"
        />
      )}
      {canRemove && (
        <div>
          <Button variant="subtle" size="sm" onClick={onRemove}>
            {form.remove}
            <VisuallyHidden> {form.author(position).toLowerCase()}</VisuallyHidden>
          </Button>
        </div>
      )}
    </fieldset>
  );
}
