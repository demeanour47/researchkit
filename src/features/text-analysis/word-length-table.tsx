/** How many rows are shown before the rest are left to the copied results, so very long texts don't make a huge page. */
export const MAX_ROWS = 500;

export interface WordLengthItem {
  position: number;
  /** The item's first words, to identify it. */
  opening: string;
  words: number;
}

export interface WordLengthTableLabels {
  summary: string;
  caption: string;
  columns: { item: string; opening: string; words: string };
  shortest: string;
  longest: string;
  /** Shown when only the first MAX_ROWS rows are listed. */
  truncated: (shown: number, total: number) => string;
}

/**
 * The words in each paragraph or sentence, as a collapsible table. The shortest and
 * longest are marked in words; the bars repeat the numbers visually and are hidden
 * from screen readers, so nothing depends on colour or shape alone.
 */
export function WordLengthTable({ items, shortest, longest, labels, open = true }: { items: readonly WordLengthItem[]; shortest: number | null; longest: number | null; labels: WordLengthTableLabels; open?: boolean }) {
  const most = items.reduce((max, item) => Math.max(max, item.words), 0);
  const shown = items.slice(0, MAX_ROWS);
  return (
    <details open={open} className="rounded-panel border border-border">
      <summary className="cursor-pointer rounded-panel px-4 py-3 font-semibold focus-ring">{labels.summary}</summary>
      <div className="grid gap-3 px-4 pb-4">
        <table className="w-full table-fixed border-collapse text-small">
          <caption className="sr-only">{labels.caption}</caption>
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th scope="col" className="w-20 py-2 pe-2 text-start font-medium">
                {labels.columns.item}
              </th>
              <th scope="col" className="py-2 pe-2 text-start font-medium">
                {labels.columns.opening}
              </th>
              <th scope="col" className="w-28 py-2 text-start font-medium sm:w-40">
                {labels.columns.words}
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((item) => {
              const note = item.position === longest ? labels.longest : item.position === shortest && items.length > 1 ? labels.shortest : null;
              return (
                <tr key={item.position} className="border-b border-border align-top last:border-b-0">
                  <th scope="row" className="py-2 pe-2 text-start font-medium tabular-nums">
                    {item.position}
                  </th>
                  <td className="py-2 pe-2 text-text-muted wrap-anywhere">{item.opening}</td>
                  <td className="grid gap-1 py-2">
                    <span className="tabular-nums">
                      <span className="font-semibold">{item.words}</span>
                      {note && <span className="text-text-muted"> · {note}</span>}
                    </span>
                    <span aria-hidden="true" className="block h-1.5 rounded-pill bg-action/70" style={{ width: `${most === 0 ? 0 : Math.max(4, (item.words / most) * 100)}%` }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length > shown.length && <p className="text-small text-text-muted">{labels.truncated(shown.length, items.length)}</p>}
      </div>
    </details>
  );
}
