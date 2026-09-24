/** Everything the Variables Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  selected: (name: string) => `Editing ${name}.`,
  added: (name: string) => `${name} added. It is now selected for editing.`,
  deleted: (name: string) => `${name} deleted. Use Undo to restore it.`,
  duplicated: (name: string) => `${name} created as a copy. It is now selected for editing.`,
  indicatorAdded: (name: string) => `Indicator ${name} added.`,
  indicatorDeleted: (name: string) => `Indicator ${name} deleted. Use Undo to restore it.`,
  indicatorMoved: (name: string, position: number, total: number) => `${name} moved to position ${position} of ${total}.`,
  imported: (count: number) => `${count} new ${count === 1 ? "variable" : "variables"} imported from your project.`,
  undone: "Last change undone.",
  copied: "Variables table copied.",
  copyFailed: "The table couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** The new position of an item moved one step, or null if it can't move that way. */
export function stepPosition(index: number, total: number, direction: -1 | 1): number | null {
  const next = index + direction;
  return next < 0 || next >= total ? null : next;
}
