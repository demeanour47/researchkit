/**
 * Theme: renders the design tokens as CSS custom properties.
 *
 * The root layout inlines this style sheet, so tokens are defined once, in
 * TypeScript, and reach the page with no extra request. The Tailwind roles in
 * src/ui/tokens/*.css point at these properties (`--color-surface:
 * var(--rk-color-surface)`), which is how every utility class reads them.
 *
 * Colour schemes: each colour holds its light and dark value in light-dark(),
 * resolved by the root's color-scheme. With no preference saved the scheme
 * follows the system; data-theme="light" or "dark" on the root fixes it
 * (see tokens/themes.css and THEME_SCRIPT below).
 */

import { ANIMATIONS } from "./animations";
import { COLOR_ALIASES, DARK, LIGHT, type ColorRole } from "./colors";
import { SHADOWS, SHADOW_TINTS, Z_INDEX } from "./elevation";
import { DURATIONS, EASINGS } from "./motion";
import { RADIUS } from "./radius";
import { SEMANTIC_SPACING } from "./spacing";
import { CONTAINERS } from "./tokens";
import { FONT_FAMILIES, MEASURE, TYPE_ALIASES, TYPE_SCALE } from "./typography";

export type ThemePreference = "system" | "light" | "dark";

export const THEME_PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];

/** Where a chosen theme is remembered, in the reader's own browser only. */
export const THEME_STORAGE_KEY = "researchkit-theme";

/**
 * Applies a saved theme before the first paint, so a reader who chose dark never
 * sees a flash of light. Runs inline in the document head; storage may be
 * unavailable, in which case the system preference applies.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/** The custom property that holds a token, e.g. `--rk-color-surface`. */
export const tokenProperty = (group: string, name: string) => `--rk-${group}-${name}`;

function declarations(): string[] {
  const lines: string[] = [];
  const set = (property: string, value: string | number) => lines.push(`${property}:${value}`);

  for (const role of Object.keys(LIGHT) as ColorRole[]) set(tokenProperty("color", role), `light-dark(${LIGHT[role]},${DARK[role]})`);
  for (const [alias, role] of Object.entries(COLOR_ALIASES)) set(tokenProperty("color", alias), `var(${tokenProperty("color", role)})`);

  for (const [name, value] of Object.entries(FONT_FAMILIES)) set(tokenProperty("font", name), value);
  for (const step of TYPE_SCALE) {
    set(tokenProperty("text", step.name), step.size);
    set(tokenProperty("leading", step.name), step.lineHeight);
    if ("letterSpacing" in step) set(tokenProperty("tracking", step.name), step.letterSpacing);
  }
  for (const [alias, step] of Object.entries(TYPE_ALIASES)) {
    set(tokenProperty("text", alias), `var(${tokenProperty("text", step)})`);
    set(tokenProperty("leading", alias), `var(${tokenProperty("leading", step)})`);
  }

  for (const [name, value] of Object.entries(SEMANTIC_SPACING)) set(tokenProperty("space", name), value);
  for (const [name, value] of Object.entries(RADIUS)) set(tokenProperty("radius", name), value);
  for (const [name, value] of Object.entries({ ...CONTAINERS, ...MEASURE })) set(tokenProperty("container", name), value);

  set("--shadow-tint-soft", `light-dark(${SHADOW_TINTS.light.soft},${SHADOW_TINTS.dark.soft})`);
  set("--shadow-tint-strong", `light-dark(${SHADOW_TINTS.light.strong},${SHADOW_TINTS.dark.strong})`);
  for (const [name, value] of Object.entries(SHADOWS)) set(tokenProperty("shadow", name), value);
  for (const [name, value] of Object.entries(Z_INDEX)) set(`--z-${name}`, value);

  for (const [name, value] of Object.entries(EASINGS)) set(tokenProperty("ease", name), value);
  for (const [name, value] of Object.entries(DURATIONS)) set(`--duration-${name}`, value);
  for (const animation of ANIMATIONS) set(tokenProperty("animate", animation.name), `rk-${animation.name} ${animation.timing}`);

  return lines;
}

/** The complete token style sheet: values, keyframes, and the reduced-motion and print overrides. */
export function themeStyleSheet(): string {
  const zeroDurations = Object.keys(DURATIONS).map((name) => `--duration-${name}:0ms`).join(";");
  return [
    `:root{${declarations().join(";")}}`,
    ...ANIMATIONS.map((animation) => `@keyframes rk-${animation.name}{${animation.keyframes}}`),
    `@media (prefers-reduced-motion:reduce){:root{${zeroDurations}}}`,
    `@media print{:root{--shadow-tint-soft:transparent;--shadow-tint-strong:transparent;${zeroDurations}}}`,
  ].join("\n");
}
