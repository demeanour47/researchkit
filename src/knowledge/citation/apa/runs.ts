/**
 * Formatted text as a list of runs. APA references mix plain and italic text, so
 * formatting is data here and the interface decides how to display it.
 */

export interface Run {
  text: string;
  italic?: boolean;
  /** Stands in for missing required information, such as "[Title]". */
  placeholder?: boolean;
}

export const plain = (text: string): Run => ({ text });
export const italic = (text: string): Run => ({ text, italic: true });
export const placeholder = (text: string): Run => ({ text, placeholder: true });

export function plainText(runs: readonly Run[]): string {
  return runs.map((run) => run.text).join("");
}

/** Joins neighbouring runs with the same formatting and drops empty ones. */
export function mergeRuns(runs: readonly Run[]): Run[] {
  const merged: Run[] = [];
  for (const run of runs) {
    if (run.text === "") continue;
    const previous = merged[merged.length - 1];
    if (previous && Boolean(previous.italic) === Boolean(run.italic) && Boolean(previous.placeholder) === Boolean(run.placeholder)) {
      merged[merged.length - 1] = { ...previous, text: previous.text + run.text };
    } else {
      merged.push({ ...run });
    }
  }
  return merged;
}

/** Whether text already ends with a full stop, question mark or exclamation mark. */
export const endsWithTerminalPunctuation = (text: string) => /[.?!]$/u.test(text.trim());
