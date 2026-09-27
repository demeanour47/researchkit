/**
 * Typography: typeface roles and the type scale.
 *
 * Typefaces are not chosen here. Each role reads an optional --typeface-* hook,
 * set by whichever font loader is used, and falls back to the platform's own
 * interface faces, which are fast and familiar.
 *
 * Fluid sizes grow gently with the viewport; the rem component keeps every size
 * responsive to the reader's own text-size setting. Body text never drops below
 * 1rem. Large sizes tighten their tracking and leading; small sizes open them.
 */

export interface TypeStep {
  /** The Tailwind name, used as `text-<name>`. */
  name: string;
  /** What the step is for, in the design vocabulary. */
  role: string;
  size: string;
  lineHeight: number;
  letterSpacing?: string;
}

export const FONT_FAMILIES = {
  body: 'var(--typeface-body, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif)',
  display: "var(--typeface-display, var(--font-body))",
  mono: 'var(--typeface-mono, ui-monospace, "SF Mono", Menlo, Consolas, monospace)',
} as const;

export const TYPE_SCALE = [
  { name: "display-lg", role: "Display Large: the homepage headline, once at most", size: "clamp(2.75rem, 1.6rem + 4.6vw, 4.75rem)", lineHeight: 1.02, letterSpacing: "-0.035em" },
  { name: "display", role: "Display: landing-page headlines", size: "clamp(2.375rem, 1.7rem + 2.8vw, 3.75rem)", lineHeight: 1.06, letterSpacing: "-0.03em" },
  { name: "title", role: "H1: page titles", size: "clamp(2rem, 1.65rem + 1.5vw, 2.75rem)", lineHeight: 1.12, letterSpacing: "-0.025em" },
  { name: "heading", role: "H2: section headings", size: "clamp(1.5rem, 1.3rem + 0.85vw, 2rem)", lineHeight: 1.2, letterSpacing: "-0.02em" },
  { name: "subheading", role: "H3: sub-sections and card titles", size: "clamp(1.125rem, 1.06rem + 0.3vw, 1.3125rem)", lineHeight: 1.35, letterSpacing: "-0.012em" },
  { name: "heading-sm", role: "H4: minor headings and compact card titles", size: "1.0625rem", lineHeight: 1.45, letterSpacing: "-0.006em" },
  { name: "lead", role: "Body Large: introductions and long-form reading", size: "clamp(1.125rem, 1.08rem + 0.2vw, 1.25rem)", lineHeight: 1.6, letterSpacing: "-0.004em" },
  { name: "body", role: "Body: interface and explanatory text", size: "clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)", lineHeight: 1.65 },
  { name: "small", role: "Small: labels, hints and metadata", size: "0.875rem", lineHeight: 1.55 },
  { name: "caption", role: "Caption: captions and eyebrows; the smallest permitted size", size: "0.8125rem", lineHeight: 1.45, letterSpacing: "0.01em" },
] as const satisfies readonly TypeStep[];

/** Older names kept for the foundation components; each points at a step above. */
export const TYPE_ALIASES = { base: "body", sm: "small" } as const;

/** Readable line lengths. */
export const MEASURE = {
  /** Prose and tool pages. */
  reading: "68ch",
  /** Introductions under headings. */
  intro: "60ch",
} as const;
