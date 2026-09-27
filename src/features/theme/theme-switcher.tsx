"use client";

import { useSyncExternalStore } from "react";
import { ChoiceChips, cx, type ChoiceChip } from "@/ui";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/ui/design/theme";

const labels = { legend: "Theme", system: "System", light: "Light", dark: "Dark" } as const;

const OPTIONS: readonly ChoiceChip<ThemePreference>[] = [
  { value: "system", label: labels.system, icon: "monitor" },
  { value: "light", label: labels.light, icon: "sun" },
  { value: "dark", label: labels.dark, icon: "moon" },
];

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

/** Tells every switcher on the page that the theme changed. */
const CHANGE_EVENT = "researchkit-theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function applyPreference(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", preference);
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable, such as in private windows; the choice then lasts for this page only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export interface ThemeSwitcherProps {
  /** A unique name for the radio group, when the switcher appears more than once. */
  name: string;
  /** Show the words beside the icons. */
  showLabels?: boolean;
  className?: string;
}

/**
 * Chooses light, dark or the system's scheme, remembered in this browser only.
 * It needs JavaScript to work, so it stays hidden, keeping its space, until it can.
 */
export function ThemeSwitcher({ name, showLabels = false, className }: ThemeSwitcherProps) {
  // The server can't know what this browser saved, so it renders nothing chosen (null).
  const preference = useSyncExternalStore<ThemePreference | null>(subscribe, readPreference, () => null);

  return (
    <ChoiceChips
      name={name}
      legend={labels.legend}
      hideLegend
      appearance="segmented"
      iconOnly={!showLabels}
      options={OPTIONS}
      value={preference ?? "system"}
      onChange={applyPreference}
      className={cx(preference === null && "invisible", className)}
    />
  );
}
