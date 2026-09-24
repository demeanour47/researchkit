import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../cx";

export interface SelectFieldProps extends Omit<ComponentPropsWithRef<"select">, "children"> {
  /** Always required. */
  label: ReactNode;
  hint?: ReactNode;
  options: readonly { value: string; label: string }[];
  /** A first option with an empty value, such as "Not specified". */
  emptyOption?: string;
  /** `question` for a standalone question; `field` to match text fields. */
  labelStyle?: "question" | "field";
}

/** A labelled drop-down list, with an optional hint linked for assistive technology. */
export function SelectField({
  label,
  hint,
  options,
  emptyOption,
  labelStyle = "field",
  id,
  className,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;

  return (
    <div className="grid gap-2">
      <label htmlFor={selectId} className={labelStyle === "question" ? "text-subheading font-semibold" : "font-medium"}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-small text-text-muted">
          {hint}
        </p>
      )}
      <select
        id={selectId}
        aria-describedby={hint ? hintId : undefined}
        className={cx("min-h-control w-full rounded-control border border-border-control bg-surface px-3 focus-ring sm:w-auto", className)}
        {...rest}
      >
        {emptyOption !== undefined && <option value="">{emptyOption}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
