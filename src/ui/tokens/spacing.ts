/**
 * The spacing scale, in spacing units (1 unit = 0.25rem, 4px at the default text size).
 * Layout uses SPACING_STEPS. FINE_SPACING_STEPS are for adjustments inside compact
 * controls only. Keep in step with spacing.css.
 */
export const SPACING_STEPS = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32] as const;
export const FINE_SPACING_STEPS = [0.5, 1.5, 2.5] as const;

const ALLOWED_STEPS = new Set<string>(
  [...SPACING_STEPS, ...FINE_SPACING_STEPS].map(String),
);

/** Utilities whose numeric values come from the spacing scale. */
const SPACING_UTILITIES = [
  "p", "px", "py", "ps", "pe", "pt", "pr", "pb", "pl",
  "m", "mx", "my", "ms", "me", "mt", "mr", "mb", "ml",
  "gap", "gap-x", "gap-y", "space-x", "space-y",
  "inset", "inset-x", "inset-y", "top", "right", "bottom", "left", "start", "end",
  "w", "h", "size", "min-w", "min-h", "max-w", "max-h",
  "scroll-m", "scroll-mt", "scroll-mb", "scroll-p", "scroll-pt", "scroll-pb",
  "indent",
];

const NUMERIC_SPACING = new RegExp(
  `^-?(?:${[...SPACING_UTILITIES].sort((a, b) => b.length - a.length).join("|")})-(\\d+(?:\\.\\d+)?)$`,
);

/**
 * Returns every class in `classNames` that uses a numeric spacing value outside
 * the scale, e.g. "p-5" or "md:gap-7". Semantic, keyword and arbitrary values are ignored.
 */
export function findOffScaleSpacing(classNames: string): string[] {
  return classNames.split(/\s+/).filter((className) => {
    const utility = className.slice(className.lastIndexOf(":") + 1).replace(/^!|!$/g, "");
    const match = NUMERIC_SPACING.exec(utility);
    return match !== null && !ALLOWED_STEPS.has(match[1]);
  });
}
