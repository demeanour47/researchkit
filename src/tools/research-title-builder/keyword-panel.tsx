import { Icon, cx } from "@/ui";
import { KEYWORD_ELEMENTS, KEYWORD_LABELS, type KeywordPanel } from "@/knowledge/research/title";
import { steps } from "./copy";

/** What the title names, element by element, as chips marked in words: in the title, not in it, or read from it. */
export function KeywordPanelView({ keywords }: { keywords: KeywordPanel }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {KEYWORD_ELEMENTS.map((element) => (
        <div key={element} className="grid content-start gap-2 rounded-panel border border-border bg-surface p-4">
          <dt className="text-caption font-semibold tracking-wide text-text-muted uppercase">{KEYWORD_LABELS[element]}</dt>
          <dd>
            {keywords[element].length === 0 ? (
              <span className="text-small text-text-muted">{steps.noneFound}</span>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {keywords[element].map((keyword) => (
                  <li
                    key={keyword.text}
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-small",
                      keyword.inTitle ? "border-success/40 bg-success-soft" : "border-dashed border-border-strong bg-transparent text-text-muted",
                    )}
                  >
                    <Icon name={keyword.inTitle ? "check" : "circle-minus"} className={keyword.inTitle ? "text-success" : undefined} />
                    <span>{keyword.text}</span>
                    <span className="sr-only">: </span>
                    <span className="text-caption text-text-muted">({keyword.source === "title" ? steps.fromTitle : keyword.inTitle ? steps.inTitle : steps.notInTitle})</span>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
