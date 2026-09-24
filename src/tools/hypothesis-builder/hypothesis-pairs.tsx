import { Button, CopyButton, TextField, type CopyResult } from "@/ui";
import { pairLabel, relationshipRows, textsFor, type HypothesisEdits, type HypothesisSet } from "@/knowledge/research";
import { steps } from "./copy";

export interface HypothesisPairsProps {
  set: HypothesisSet;
  edits: HypothesisEdits;
  onEdit: (id: string, text: string) => void;
  onReset: (pairId: string, label: string) => void;
  onCopy: (subject: string, result: CopyResult) => void;
}

/** Each drafted pair: its structured relationship, then editable null and alternative wording. */
export function HypothesisPairs({ set, edits, onEdit, onReset, onCopy }: HypothesisPairsProps) {
  return (
    <ol className="grid gap-6">
      {set.pairs.map((pair, index) => {
        const label = pairLabel(pair.relationship);
        const texts = textsFor(pair, edits);
        const edited = pair.null.id in edits || pair.alternative.id in edits;
        const headingId = `pair-${pair.id}-title`;
        return (
          <li key={pair.id}>
            <section aria-labelledby={headingId} className="grid gap-4 rounded-panel border border-border bg-surface p-4 sm:p-6">
              <h3 id={headingId} className="text-subheading font-semibold">
                {steps.pairHeading(index + 1, label)}
              </h3>
              <div className="grid gap-2">
                <h4 className="font-semibold">{steps.relationshipHeading}</h4>
                <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-[max-content_1fr]">
                  {relationshipRows(pair.relationship).map((row) => (
                    <div key={row.label} className="contents">
                      <dt className="font-medium">{row.label}</dt>
                      <dd className="break-words">{row.values.join("; ")}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {(
                [
                  [pair.null.id, steps.nullLabel, texts.null, steps.copyNull],
                  [pair.alternative.id, steps.alternativeLabel, texts.alternative, steps.copyAlternative],
                ] as const
              ).map(([id, fieldLabel, text, subject]) => (
                <div key={id} className="grid gap-2">
                  <TextField id={`text-${id}`} label={fieldLabel} multiline rows={3} value={text} onChange={(event) => onEdit(id, event.target.value)} />
                  <div>
                    <CopyButton text={text} subject={`${subject} ${index + 1}`} onResult={(result) => onCopy(`${subject} ${index + 1}`, result)} />
                  </div>
                </div>
              ))}
              {edited && (
                <div>
                  <Button variant="subtle" size="sm" onClick={() => onReset(pair.id, label)}>
                    {steps.reset}
                  </Button>
                </div>
              )}
            </section>
          </li>
        );
      })}
    </ol>
  );
}
