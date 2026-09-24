import { LearnMore } from "@/features/research";
import { HYPOTHESIS_REVIEW_NOTE, HYPOTHESIS_TYPES } from "@/knowledge/research";
import { typeGuide as copy } from "./copy";

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid list-disc gap-1 ps-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** The seven hypothesis types, rendered on the server so they read without JavaScript. */
export function TypeGuide() {
  return (
    <div className="grid gap-4">
      <h3 className="text-subheading font-semibold">{copy.heading}</h3>
      <ul className="grid gap-3">
        {HYPOTHESIS_TYPES.map((type) => (
          <li key={type.id} className="grid gap-3 rounded-panel border border-border bg-surface p-4">
            <div className="grid gap-1">
              <h4 className="font-semibold">
                {type.name}
                {type.symbol && ` (${type.symbol})`}
              </h4>
              <p className="text-small text-text-muted">{copy.describes[type.describes]}</p>
              <p>{type.definition}</p>
            </div>
            <LearnMore label={copy.learnMore(type.name)}>
              <div className="grid gap-1">
                <h5 className="font-semibold">{copy.whenAppropriate}</h5>
                <p>{type.whenAppropriate}</p>
              </div>
              <div className="grid gap-1">
                <h5 className="font-semibold">{copy.strengths}</h5>
                <List items={type.strengths} />
              </div>
              <div className="grid gap-1">
                <h5 className="font-semibold">{copy.limitations}</h5>
                <List items={type.limitations} />
              </div>
              <div className="grid gap-1">
                <h5 className="font-semibold">{copy.examples}</h5>
                <List items={type.examples} />
              </div>
              <div className="grid gap-1">
                <h5 className="font-semibold">{copy.references}</h5>
                <p className="text-text-muted">{HYPOTHESIS_REVIEW_NOTE}</p>
              </div>
            </LearnMore>
          </li>
        ))}
      </ul>
    </div>
  );
}
