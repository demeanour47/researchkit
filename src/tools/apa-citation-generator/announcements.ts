/** Everything the generator announces to screen readers, in one place. */

import type { CopyTarget } from "./copy-texts";

const targetNames: Record<CopyTarget, string> = {
  reference: "Reference",
  parenthetical: "Parenthetical citation",
  narrative: "Narrative citation",
};

export const announcements = {
  copied: (target: CopyTarget) => `${targetNames[target]} copied.`,
  copyFailed: (target: CopyTarget) =>
    `${targetNames[target]} couldn't be copied automatically. It is now selected: press Control+C, or Command+C on a Mac, to copy it.`,
  formCleared: "Form cleared.",
  exampleLoaded: "Example loaded.",
  referenceUpdated: (reference: string) => `Reference updated: ${reference}`,
} as const;

/** The accessible name completing each copy button: "Copy" + " reference". */
export const copySubjects: Record<CopyTarget, string> = {
  reference: "reference",
  parenthetical: "parenthetical citation",
  narrative: "narrative citation",
};
