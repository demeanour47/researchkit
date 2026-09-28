import { RadioGroup } from "@/ui";
import { OBJECTIVE_VERB_CATEGORIES, getVerbCategory, type ObjectiveVerbCategoryId, type VerbCategorySuggestion } from "@/knowledge/research";
import { verbs as copy } from "./copy";

export interface VerbChooserProps {
  suggestions: readonly VerbCategorySuggestion[];
  category: ObjectiveVerbCategoryId | null;
  verb: string;
  onCategory: (category: ObjectiveVerbCategoryId) => void;
  onVerb: (verb: string) => void;
}

const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** Suggested verb categories with their reasons, then a free choice among all categories and their verbs. */
export function VerbChooser({ suggestions, category, verb, onCategory, onVerb }: VerbChooserProps) {
  const chosen = category ? getVerbCategory(category) : null;
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{copy.suggestionsHeading}</h3>
        {suggestions.length > 0 ? (
          <ul className="grid gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.category} className="rounded-panel border border-border bg-surface p-4">
                <span className="font-medium">{getVerbCategory(suggestion.category).name}</span>
                <span className="block text-small text-text-muted">{suggestion.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">{copy.noSuggestions}</p>
        )}
      </div>

      <RadioGroup
        name="verb-category"
        legend={copy.legend}
        options={OBJECTIVE_VERB_CATEGORIES.map((entry) => ({ value: entry.id, label: entry.name }))}
        value={category ?? undefined}
        onChange={onCategory}
      />

      {chosen && (
        <section aria-labelledby="chosen-category-title" className="grid gap-4 rounded-panel border border-border bg-surface p-4 sm:p-6">
          <div className="grid gap-1">
            <h3 id="chosen-category-title" className="text-subheading font-semibold">
              {copy.guidanceHeading}: {chosen.name}
            </h3>
            <p className="text-small text-text-muted">{chosen.guidance}</p>
          </div>
          <RadioGroup
            name="verb"
            legend={copy.verbLegend}
            variant="inline"
            options={chosen.verbs.map((entry) => ({ value: entry, label: capitalise(entry) }))}
            value={verb}
            onChange={onVerb}
          />
        </section>
      )}
    </div>
  );
}
