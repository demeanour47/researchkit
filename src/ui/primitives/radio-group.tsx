import type { ReactNode } from "react";
import { cx } from "../cx";

export interface RadioOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface RadioGroupProps<T extends string> {
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  options: readonly RadioOption<T>[];
  /** Controlled selection. Pass together with `onChange`. */
  value?: T;
  onChange?: (value: T) => void;
  /** Initial selection when uncontrolled, such as in a plain HTML form. */
  defaultValue?: T;
  required?: boolean;
  /** `question` for a standalone question with option cards; `inline` for a compact choice. */
  variant?: "question" | "inline";
}

/**
 * A labelled group of radio buttons: a fieldset whose legend names the choice.
 * The selected option is shown by the radio itself and by bolder text, never by colour alone.
 */
export function RadioGroup<T extends string>({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  defaultValue,
  required = false,
  variant = "question",
}: RadioGroupProps<T>) {
  const hintId = `${name}-hint`;
  const controlled = onChange !== undefined;
  const question = variant === "question";

  return (
    <fieldset aria-describedby={hint ? hintId : undefined} className={question ? "grid gap-3" : "grid gap-1"}>
      <legend className={question ? "mb-3 text-subheading font-semibold" : "mb-1 font-medium"}>{legend}</legend>
      {hint && (
        <p id={hintId} className={cx("text-small text-text-muted", question && "-mt-3")}>
          {hint}
        </p>
      )}
      <div className={question ? "grid gap-2 sm:grid-cols-2" : "flex flex-wrap gap-x-6"}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cx(
              "flex min-h-control cursor-pointer items-center gap-3",
              question
                ? "rounded-control border border-border bg-surface px-3 py-2 has-[:checked]:border-action has-[:checked]:font-medium"
                : "has-[:checked]:font-medium",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              {...(controlled
                ? { checked: value === option.value, onChange: () => onChange(option.value) }
                : { defaultChecked: defaultValue === option.value })}
              required={required}
              className="size-4 shrink-0 accent-action focus-ring"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
