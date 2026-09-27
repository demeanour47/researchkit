/**
 * Colour: the single source of every colour in the interface.
 *
 * Each role names a job (“surface”, “action”), never a hue. The light and dark
 * palettes are designed separately rather than inverted: dark surfaces step up
 * in lightness as they come forward, text is softened from pure white to reduce
 * glare, and accents are lifted in lightness and lowered in saturation so they
 * read as the same colour without vibrating against a dark background.
 *
 * theme.ts turns these values into CSS custom properties; the Tailwind roles in
 * tokens/color.css point at them. design.test.ts checks every contrast promise
 * below against WCAG 2.2, so a change that breaks one fails the build.
 */

export type ColorRole =
  // Surfaces, back to front.
  | "canvas"
  | "sunken"
  | "surface"
  | "raised"
  | "hover"
  | "secondary"
  // Printed output previews stay white in both schemes, as they will print.
  | "paper"
  | "on-paper"
  // Text.
  | "text"
  | "text-muted"
  // Lines: `border` is decorative; `border-control` identifies controls (3:1).
  | "border"
  | "border-strong"
  | "border-control"
  // Interaction.
  | "action"
  | "action-hover"
  | "action-soft"
  | "on-action"
  | "focus"
  // A second, quieter hue for highlights such as “New”.
  | "accent"
  | "accent-soft"
  // The single point of emphasis, always behind text, never as text.
  | "emphasis"
  | "on-emphasis"
  // Status: always paired with words or an icon, never colour alone.
  | "success"
  | "success-soft"
  | "warning"
  | "warning-soft"
  | "danger"
  | "danger-soft"
  // Tags the researcher assigns, always shown with the tag's name.
  | "tag-red"
  | "tag-orange"
  | "tag-yellow"
  | "tag-green"
  | "tag-blue"
  | "tag-purple";

export type Palette = Readonly<Record<ColorRole, string>>;

export const LIGHT: Palette = {
  canvas: "#f8f9fb",
  sunken: "#f1f3f6",
  surface: "#ffffff",
  raised: "#ffffff",
  hover: "#f1f3f7",
  secondary: "#eceef3",
  paper: "#ffffff",
  "on-paper": "#000000",

  text: "#0e1219",
  "text-muted": "#515969",

  border: "#e2e5eb",
  "border-strong": "#cdd2db",
  "border-control": "#838b9b",

  action: "#3a45d1",
  "action-hover": "#2d37b3",
  "action-soft": "#eef0fd",
  "on-action": "#ffffff",
  focus: "#3a45d1",

  accent: "#7338c4",
  "accent-soft": "#f4eefc",

  emphasis: "#ffe45c",
  "on-emphasis": "#0e1219",

  success: "#12744a",
  "success-soft": "#e8f5ee",
  warning: "#94510a",
  "warning-soft": "#fcf2e3",
  danger: "#bd3329",
  "danger-soft": "#fcecea",

  "tag-red": "#c62828",
  "tag-orange": "#c2410c",
  "tag-yellow": "#8a6d00",
  "tag-green": "#2e7d32",
  "tag-blue": "#1d5fc2",
  "tag-purple": "#7b2cbf",
};

export const DARK: Palette = {
  canvas: "#0b0c10",
  sunken: "#08090c",
  surface: "#121419",
  raised: "#181b21",
  hover: "#1b1e25",
  secondary: "#1e2129",
  paper: "#ffffff",
  "on-paper": "#000000",

  text: "#eceef2",
  "text-muted": "#a2a8b5",

  border: "#23272f",
  "border-strong": "#323743",
  "border-control": "#666e7e",

  action: "#8d97ff",
  "action-hover": "#adb4ff",
  "action-soft": "#1a1e3b",
  "on-action": "#0b0c10",
  focus: "#8d97ff",

  accent: "#b99bff",
  "accent-soft": "#221a36",

  emphasis: "#f2d54b",
  "on-emphasis": "#0b0c10",

  success: "#52d29c",
  "success-soft": "#0f251c",
  warning: "#f0b35c",
  "warning-soft": "#29200f",
  danger: "#ff8b80",
  "danger-soft": "#2c1413",

  "tag-red": "#ff7b72",
  "tag-orange": "#ff9a57",
  "tag-yellow": "#e8c547",
  "tag-green": "#5fd07a",
  "tag-blue": "#6fa8ff",
  "tag-purple": "#c69cff",
};

/**
 * The design vocabulary, mapped to the roles that carry it. Components use the
 * role names; this map is what designers and reviewers talk about.
 */
export const DESIGN_COLORS = {
  primary: "action",
  secondary: "secondary",
  accent: "accent",
  success: "success",
  warning: "warning",
  danger: "danger",
  muted: "text-muted",
  border: "border",
  background: "canvas",
  surface: "surface",
  hover: "hover",
  focus: "focus",
} as const satisfies Record<string, ColorRole>;

/** Roles that exist only so older components keep working; they point at other roles. */
export const COLOR_ALIASES = {
  foreground: "text",
  background: "canvas",
} as const satisfies Record<string, ColorRole>;

/** The minimum WCAG contrast each pairing must keep, in both schemes. */
export interface ContrastRequirement {
  foreground: ColorRole;
  backgrounds: readonly ColorRole[];
  /** 4.5 for text, 3 for large text, icons and control boundaries. */
  minimum: number;
}

const READING_SURFACES = ["canvas", "sunken", "surface", "raised", "hover"] as const;

export const CONTRAST_REQUIREMENTS: readonly ContrastRequirement[] = [
  { foreground: "text", backgrounds: [...READING_SURFACES, "secondary", "action-soft", "accent-soft"], minimum: 7 },
  { foreground: "text-muted", backgrounds: [...READING_SURFACES, "secondary"], minimum: 4.5 },
  { foreground: "action", backgrounds: [...READING_SURFACES, "action-soft"], minimum: 4.5 },
  { foreground: "action-hover", backgrounds: READING_SURFACES, minimum: 4.5 },
  { foreground: "accent", backgrounds: [...READING_SURFACES, "accent-soft"], minimum: 4.5 },
  { foreground: "on-action", backgrounds: ["action", "action-hover", "danger"], minimum: 4.5 },
  { foreground: "on-emphasis", backgrounds: ["emphasis"], minimum: 7 },
  { foreground: "on-paper", backgrounds: ["paper"], minimum: 7 },
  { foreground: "success", backgrounds: [...READING_SURFACES, "success-soft"], minimum: 4.5 },
  { foreground: "warning", backgrounds: [...READING_SURFACES, "warning-soft"], minimum: 4.5 },
  { foreground: "danger", backgrounds: [...READING_SURFACES, "danger-soft"], minimum: 4.5 },
  { foreground: "focus", backgrounds: READING_SURFACES, minimum: 3 },
  { foreground: "border-control", backgrounds: ["canvas", "surface", "raised"], minimum: 3 },
  { foreground: "tag-red", backgrounds: ["canvas", "surface"], minimum: 4.5 },
  { foreground: "tag-orange", backgrounds: ["canvas", "surface"], minimum: 4.5 },
  { foreground: "tag-yellow", backgrounds: ["canvas", "surface"], minimum: 4.5 },
  { foreground: "tag-green", backgrounds: ["canvas", "surface"], minimum: 4.5 },
  { foreground: "tag-blue", backgrounds: ["canvas", "surface"], minimum: 4.5 },
  { foreground: "tag-purple", backgrounds: ["canvas", "surface"], minimum: 4.5 },
];
