import { RadioGroup } from "@/ui";
import { QUESTION_TYPES, getQuestionType, type QuestionTypeId, type TypeSuggestion } from "@/knowledge/research";
import { types as copy } from "./copy";

const dimensionLabels = { purpose: copy.purpose, approach: copy.approach } as const;

export interface TypeChooserProps {
  suggestions: readonly TypeSuggestion[];
  value: QuestionTypeId | null;
  onChange: (type: QuestionTypeId) => void;
}

/** Suggested question types with their reasons, then a free choice among all types. */
export function TypeChooser({ suggestions, value, onChange }: TypeChooserProps) {
  const chosen = value ? getQuestionType(value) : null;
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{copy.suggestionsHeading}</h3>
        {suggestions.length > 0 ? (
          <ul className="grid gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.type} className="rounded-panel border border-border bg-surface p-4">
                <span className="font-medium">{getQuestionType(suggestion.type).name}</span>
                <span className="block text-small text-text-muted">{suggestion.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">{copy.noSuggestions}</p>
        )}
      </div>

      <RadioGroup
        name="question-type"
        legend={copy.legend}
        hint={copy.purposeHint}
        options={QUESTION_TYPES.map((type) => ({
          value: type.id,
          label: (
            <span className="grid">
              <span>{type.name}</span>{" "}
              <span className="text-small font-normal text-text-muted">{dimensionLabels[type.dimension]}</span>
            </span>
          ),
        }))}
        value={value ?? undefined}
        onChange={onChange}
      />

      {chosen ? (
        <section aria-labelledby="chosen-type-title" className="grid gap-3 rounded-panel border border-border bg-surface p-4 sm:p-6">
          <h3 id="chosen-type-title" className="text-subheading font-semibold">
            {chosen.name}
          </h3>
          <p>{chosen.definition}</p>
          <div className="grid gap-1">
            <h4 className="font-semibold">{copy.stems}</h4>
            <ul className="grid list-disc gap-1 ps-6">
              {chosen.stems.map((stem) => (
                <li key={stem}>{stem}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-1">
            <h4 className="font-semibold">{copy.example}</h4>
            <p>{chosen.example}</p>
          </div>
          <p className="text-small text-text-muted">{chosen.note}</p>
        </section>
      ) : (
        <p className="text-text-muted">{copy.none}</p>
      )}
    </div>
  );
}
