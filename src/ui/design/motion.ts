/**
 * Motion: brief, calm and explanatory. One easing curve for state changes, one
 * for things arriving. Under reduced motion every duration is zero, so all
 * token-based motion stops without each component having to ask.
 */

export const EASINGS = {
  /** State changes: hover, press, colour. */
  standard: "cubic-bezier(0.2, 0.7, 0.2, 1)",
  /** Things arriving: dialogs, revealed content. */
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const DURATIONS = {
  /** Hover and press feedback. */
  instant: "120ms",
  /** A control changing state. */
  quick: "200ms",
  /** A panel opening or closing. */
  moderate: "320ms",
} as const;
