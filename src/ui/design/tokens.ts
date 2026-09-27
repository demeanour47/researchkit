/**
 * Design tokens: the single entry point to the design system's values.
 * Each concern has its own module; theme.ts renders them all as CSS custom
 * properties, and the Tailwind roles in src/ui/tokens/*.css point at those.
 */

export { COLOR_ALIASES, CONTRAST_REQUIREMENTS, DARK, DESIGN_COLORS, LIGHT, type ColorRole, type Palette } from "./colors";
export { FONT_FAMILIES, MEASURE, TYPE_ALIASES, TYPE_SCALE, type TypeStep } from "./typography";
export { FINE_SPACING_STEPS, SEMANTIC_SPACING, SPACING_STEPS, SPACING_UNIT, findOffScaleSpacing } from "./spacing";
export { RADIUS } from "./radius";
export { SHADOWS, SHADOW_TINTS, Z_INDEX } from "./elevation";
export { DURATIONS, EASINGS } from "./motion";
export { ANIMATIONS } from "./animations";

/**
 * Breakpoints (mobile first, min-width) and page widths. Media queries can't read
 * custom properties, so tokens/layout.css repeats these values; design.test.ts
 * fails if the two ever disagree.
 */
export const BREAKPOINTS = { sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem" } as const;
export const CONTAINERS = { page: "76rem" } as const;
