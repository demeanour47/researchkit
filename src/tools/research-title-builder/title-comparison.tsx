import { Badge, Icon } from "@/ui";
import { CRITERION_IDS, CRITERION_LABELS, CRITERION_STATUS_LABELS, TITLE_CATEGORY_LABELS, type TitleEvaluation } from "@/knowledge/research/title";
import { steps } from "./copy";
import { CATEGORY_STYLE, CRITERION_STYLE } from "./status-style";

export interface ComparedTitle {
  id: string;
  text: string;
  working: boolean;
  favourite: boolean;
  evaluation: TitleEvaluation;
}

/** Every title on the same criteria, statuses in words. Scrolls sideways within itself, by keyboard too. */
export function TitleComparison({ titles }: { titles: readonly ComparedTitle[] }) {
  return (
    <div role="region" aria-labelledby="compare-caption" tabIndex={0} className="overflow-x-auto rounded-panel border border-border focus-ring">
      <table className="w-full min-w-[40rem] border-collapse text-start text-small">
        <caption id="compare-caption" className="sr-only">
          {steps.compare}
        </caption>
        <thead>
          <tr className="border-b border-border-strong bg-sunken">
            <th scope="col" className="w-44 px-3 py-3 text-start font-semibold">
              {steps.criterion}
            </th>
            {titles.map((title, index) => (
              <th key={title.id} scope="col" className="px-3 py-3 text-start align-top font-semibold">
                <span className="grid gap-1">
                  <span className="text-caption text-text-muted">{steps.editLabel(index + 1)}</span>
                  <span className="font-medium">“{title.text}”</span>
                  <span className="flex flex-wrap gap-1">
                    {title.working && <Badge tone="info" icon="target">{steps.working}</Badge>}
                    {title.favourite && <Badge tone="accent" icon="sparkles">{steps.favourite}</Badge>}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <th scope="row" className="px-3 py-2 text-start font-semibold">
              {steps.category}
            </th>
            {titles.map((title) => {
              const style = CATEGORY_STYLE[title.evaluation.category];
              return (
                <td key={title.id} className="px-3 py-2">
                  <Badge tone={style.tone} icon={style.icon}>
                    {TITLE_CATEGORY_LABELS[title.evaluation.category]}
                  </Badge>
                </td>
              );
            })}
          </tr>
          {CRITERION_IDS.map((id) => (
            <tr key={id} className="border-b border-border last:border-b-0">
              <th scope="row" className="px-3 py-2 text-start font-medium">
                {CRITERION_LABELS[id]}
              </th>
              {titles.map((title) => {
                const criterion = title.evaluation.criteria.find((entry) => entry.id === id)!;
                const style = CRITERION_STYLE[criterion.status];
                return (
                  <td key={title.id} className="px-3 py-2" title={criterion.finding}>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name={style.icon ?? "alert"} className={criterion.status === "attention" ? "text-warning" : criterion.status === "strength" ? "text-success" : "text-text-muted"} />
                      {CRITERION_STATUS_LABELS[criterion.status]}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
