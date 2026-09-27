/**
 * Elevation: borders separate surfaces; shadows are reserved for things that
 * lift, such as a card under the pointer, or float, such as a dialog.
 * Shadow tints are part of each palette, because a dark interface needs deeper,
 * more opaque shadows to read at all.
 */

export const SHADOW_TINTS = {
  light: { soft: "rgb(16 24 40 / 0.06)", strong: "rgb(16 24 40 / 0.12)" },
  dark: { soft: "rgb(0 0 0 / 0.4)", strong: "rgb(0 0 0 / 0.6)" },
} as const;

export const SHADOWS = {
  /** Resting cards: a hairline of depth. */
  card: "0 1px 2px var(--shadow-tint-soft)",
  /** Cards under the pointer or in focus. */
  lift: "0 1px 2px var(--shadow-tint-soft), 0 12px 32px -12px var(--shadow-tint-strong)",
  /** Menus and popovers. */
  raised: "0 1px 2px var(--shadow-tint-soft), 0 4px 16px var(--shadow-tint-soft)",
  /** Dialogs and the skip link. */
  overlay: "0 8px 24px var(--shadow-tint-soft), 0 24px 64px var(--shadow-tint-strong)",
} as const;

/** Stacking order. */
export const Z_INDEX = {
  raised: 10,
  sticky: 100,
  overlay: 1000,
  "skip-link": 2000,
} as const;
