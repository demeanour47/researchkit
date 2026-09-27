/** Radius by role: small for controls, larger for panels, round for pills. */
export const RADIUS = {
  /** Buttons, inputs and other controls. */
  control: "0.5rem",
  /** Icon tiles and nested blocks inside panels. */
  tile: "0.625rem",
  /** Cards, panels and dialogs. */
  panel: "0.875rem",
  /** Badges and chips. */
  pill: "9999px",
} as const;
