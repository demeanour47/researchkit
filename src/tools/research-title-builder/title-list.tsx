"use client";

import { Badge, Button, Card, Icon, TextField, cx } from "@/ui";
import { TITLE_CATEGORY_LABELS, type CandidateTitle, type TitleCategory } from "@/knowledge/research/title";
import { steps } from "./copy";
import { CATEGORY_STYLE } from "./status-style";

export interface TitleListProps {
  titles: readonly CandidateTitle[];
  workingId: string | null;
  /** What is typed in each title's field and not yet committed to its history. */
  drafts: Readonly<Record<string, string>>;
  categories: Readonly<Record<string, TitleCategory>>;
  onType: (id: string, text: string) => void;
  /** Called when a field is left, to keep the edit and its earlier wording. */
  onCommit: (id: string) => void;
  onWorking: (id: string) => void;
  onFavourite: (id: string) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string, index: number) => void;
}

/** The researcher's titles, each editable in place, with its rating, marks, actions and earlier versions. */
export function TitleList({ titles, workingId, drafts, categories, onType, onCommit, onWorking, onFavourite, onRemove, onRestore }: TitleListProps) {
  if (titles.length === 0) return <p className="text-text-muted">{steps.noTitles}</p>;
  return (
    <ol className="grid gap-4">
      {titles.map((title, index) => {
        const working = title.id === workingId;
        const category = categories[title.id];
        return (
          <Card as="li" key={title.id} className={cx("grid gap-3", working && "border-action ring-1 ring-action")}>
            <div className="flex flex-wrap items-center gap-2">
              {working && (
                <Badge tone="info" icon="target">
                  {steps.working}
                </Badge>
              )}
              {title.favourite && (
                <Badge tone="accent" icon="sparkles">
                  {steps.favourite}
                </Badge>
              )}
              {category && (
                <Badge tone={CATEGORY_STYLE[category].tone} icon={CATEGORY_STYLE[category].icon}>
                  {steps.category}: {TITLE_CATEGORY_LABELS[category]}
                </Badge>
              )}
            </div>
            <div onBlur={() => onCommit(title.id)}>
              <TextField id={`title-${title.id}`} label={steps.editLabel(index + 1)} multiline rows={2} value={drafts[title.id] ?? title.text} onChange={(event) => onType(title.id, event.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {!working && (
                <Button variant="secondary" size="sm" onClick={() => onWorking(title.id)}>
                  <Icon name="target" />
                  {steps.makeWorking}
                </Button>
              )}
              <Button variant="ghost" size="sm" aria-pressed={title.favourite} onClick={() => onFavourite(title.id)}>
                <Icon name="sparkles" />
                {steps.markFavourite}
              </Button>
              <Button variant="ghost" size="sm" className="text-danger" onClick={() => onRemove(title.id)}>
                <Icon name="trash" />
                {steps.remove}
                <span className="sr-only">: {title.text}</span>
              </Button>
            </div>
            {title.history.length > 0 && (
              <details className="group rounded-control border border-border bg-sunken">
                <summary className="flex min-h-control-sm cursor-pointer list-none items-center gap-2 px-3 text-small font-medium focus-ring [&::-webkit-details-marker]:hidden">
                  <Icon name="chevron-right" className="transition-transform group-open:rotate-90" />
                  <Icon name="clock" />
                  {steps.history(title.history.length)}
                </summary>
                <ol className="grid gap-2 px-3 pb-3">
                  {title.history.map((version, versionIndex) => (
                    <li key={`${version.replacedAt}-${versionIndex}`} className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-small">
                      <span>“{version.text}”</span>
                      <Button variant="outline" size="sm" aria-label={steps.restoreLabel(version.text)} onClick={() => onRestore(title.id, versionIndex)}>
                        {steps.restore}
                      </Button>
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </Card>
        );
      })}
    </ol>
  );
}
