import type { ReactNode } from "react";
import { cx } from "../cx";
import { Icon, type IconName } from "./icon";

export interface ChoiceChip<T extends string> {
  value: T;
  label: ReactNode;
  icon?: IconName;
  /** A count or note after the label, such as the number of results. */
  meta?: ReactNode;
}

export interface ChoiceChipsProps<T extends string> {
  name: string;
  /** Names the choice. Shown unless `hideLegend`. */
  legend: string;
  hideLegend?: boolean;
  options: readonly ChoiceChip<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `segmented` joins the chips into one control, for a few short choices such as a theme. */
  appearance?: "chips" | "segmented";
  /** For icon-only segmented choices: each option's label is then visually hidden. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * A single choice shown as chips: native radio buttons, so arrow keys move
 * between options and the group is announced with its legend. The chosen chip
 * is marked by weight, fill and border together, never by colour alone.
 */
export function ChoiceChips<T extends string>({ name, legend, hideLegend = false, options, value, onChange, appearance = "chips", iconOnly = false, className }: ChoiceChipsProps<T>) {
  const segmented = appearance === "segmented";
  return (
    <fieldset className={cx("min-w-0", className)}>
      <legend className={cx("mb-2 text-small font-medium text-text-muted", hideLegend && "sr-only")}>{legend}</legend>
      <div className={cx("flex", segmented ? "flex-nowrap gap-0.5 rounded-control border border-border bg-sunken p-0.5" : "flex-wrap gap-2")}>
        {options.map((option) => (
          <label
            key={option.value}
            title={iconOnly && typeof option.label === "string" ? option.label : undefined}
            className={cx(
              "relative inline-flex cursor-pointer items-center gap-1.5 text-small whitespace-nowrap select-none",
              "transition-[background-color,border-color,color] duration-(--duration-instant) ease-standard",
              "has-[:focus-visible]:outline-(length:--focus-ring-width) has-[:focus-visible]:outline-offset-(length:--focus-ring-offset) has-[:focus-visible]:outline-focus has-[:focus-visible]:outline-solid",
              segmented
                ? cx(
                    "min-h-8 rounded-[calc(var(--radius-control)-2px)] px-2.5 text-text-muted hover:text-text",
                    "has-[:checked]:bg-surface has-[:checked]:font-medium has-[:checked]:text-text has-[:checked]:shadow-card has-[:checked]:ring-1 has-[:checked]:ring-border",
                  )
                : cx(
                    "min-h-control-sm rounded-pill border border-border bg-surface px-3 text-text-muted hover:border-border-strong hover:text-text",
                    "has-[:checked]:border-action has-[:checked]:bg-action-soft has-[:checked]:font-semibold has-[:checked]:text-action",
                  ),
            )}
          >
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="sr-only" />
            {option.icon && <Icon name={option.icon} />}
            <span className={cx(iconOnly && "sr-only")}>{option.label}</span>
            {option.meta !== undefined && <span className="text-caption tabular-nums opacity-80">{option.meta}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
