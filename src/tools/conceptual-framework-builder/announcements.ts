/** Everything the Conceptual Framework Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  moved: (name: string, x: number, y: number) => `${name} moved to ${Math.round(x)}, ${Math.round(y)}.`,
  added: (kind: "variable" | "relationship", name: string) => `${kind === "variable" ? "Variable" : "Relationship"} added: ${name.replace(/\.$/, "")}.`,
  deleted: (name: string) => `${name} deleted. Use Undo to restore it.`,
  undone: "Last change undone.",
  autoLayout: "Boxes rearranged to line up connected variables.",
  resetLayout: "Moved boxes returned to the automatic layout.",
  rebuilt: "Figure rebuilt from your project details.",
  selected: (description: string) => `Selected: ${description} Details are shown below the figure.`,
  exported: (format: string) => `${format} downloaded.`,
  copied: "Figure copied. Paste it into your document.",
  copyFailed: "The figure couldn't be copied. Download it as SVG or PNG instead, and insert it as a picture.",
  exportFailed: (format: string) => `The ${format} couldn't be created. Try another format.`,
} as const;

/** A summary of the warnings, naming none of them twice and never scoring the framework. */
export function warningsAnnouncement(count: number): string {
  if (count === 0) return "No warnings.";
  return count === 1 ? "1 warning to review." : `${count} warnings to review.`;
}

/** Arrow keys and the direction each moves a box, in steps. */
export const ARROW_KEYS: Readonly<Record<string, [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
