import { Badge, Card, Icon } from "@/ui";
import type { TitleExample } from "@/knowledge/research/title/examples";

export interface TitleExamplesProps {
  examples: readonly TitleExample[];
  /** The heading level of each example, for the page's outline. */
  level?: 3 | 4;
  /** Show the fictional stronger title, as the guide does. The tool leaves it out. */
  showStronger?: boolean;
  labels: { weak: string; whyWeak: string; stronger: string; academic: string; example?: string; nepal: string; global: string };
}

/**
 * Worked examples of weak titles: why each is weak, what a stronger title has, and the
 * academic reasoning. The same examples teach in the tool and in the guide.
 */
export function TitleExamples({ examples, level = 3, showStronger = false, labels }: TitleExamplesProps) {
  const Heading = `h${level}` as const;
  return (
    <ul className="grid gap-4">
      {examples.map((example) => (
        <Card as="li" key={example.id} className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Heading className="grid gap-1">
              <span className="text-caption font-semibold tracking-wide text-text-muted uppercase">{labels.weak}</span>
              <span className="text-heading-sm font-semibold">“{example.weak}”</span>
            </Heading>
            <Badge tone="outline" icon="map">
              {example.region === "nepal" ? labels.nepal : labels.global}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <p className="flex items-center gap-2 text-small font-semibold">
                <Icon name="alert" className="text-warning" />
                {labels.whyWeak}
              </p>
              <ul className="grid list-disc gap-1.5 ps-5 text-small marker:text-text-muted">
                {example.whyWeak.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
            <div className="grid content-start gap-2">
              <p className="flex items-center gap-2 text-small font-semibold">
                <Icon name="circle-check" className="text-success" />
                {labels.stronger}
              </p>
              <ul className="grid list-disc gap-1.5 ps-5 text-small marker:text-text-muted">
                {example.strongerCharacteristics.map((characteristic) => (
                  <li key={characteristic}>{characteristic}</li>
                ))}
              </ul>
            </div>
          </div>
          {showStronger && labels.example && (
            <p className="rounded-control bg-success-soft px-3 py-2 text-small">
              <span className="font-semibold">{labels.example}:</span> “{example.stronger}”
            </p>
          )}
          <p className="border-t border-border pt-3 text-small text-text-muted">
            <span className="font-semibold text-text">{labels.academic}:</span> {example.explanation}
          </p>
        </Card>
      ))}
    </ul>
  );
}
