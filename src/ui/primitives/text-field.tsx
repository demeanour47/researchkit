"use client";

import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../cx";
import { Icon } from "./icon";

interface FieldOwnProps {
  /** Always required. Use `hideLabel` only where the purpose is obvious from context. */
  label: ReactNode;
  hint?: ReactNode;
  /** Explains what went wrong and how to fix it. Setting it marks the field invalid. */
  error?: ReactNode;
  hideLabel?: boolean;
}

type InputFieldProps = FieldOwnProps & { multiline?: false } & Omit<
    ComponentPropsWithRef<"input">,
    keyof FieldOwnProps | "children"
  >;

type TextareaFieldProps = FieldOwnProps & { multiline: true } & Omit<
    ComponentPropsWithRef<"textarea">,
    keyof FieldOwnProps | "children"
  >;

export type TextFieldProps = InputFieldProps | TextareaFieldProps;

const OWN_KEYS = ["label", "hint", "error", "hideLabel", "multiline", "className"] as const;

function controlAttributes<T extends object>(props: T) {
  const rest = { ...props } as Record<string, unknown>;
  for (const key of OWN_KEYS) delete rest[key];
  return rest as Omit<T, (typeof OWN_KEYS)[number]>;
}

/** A labelled text input or text area, with an optional hint and error. */
export function TextField(props: TextFieldProps) {
  const { label, hint, error, hideLabel = false, className } = props;
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [props["aria-describedby"], hint && hintId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  const shared = {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    className: cx(
      "block w-full rounded-control bg-background px-3 text-base text-foreground",
      "placeholder:text-foreground/60 focus-ring",
      error ? "border-2 border-foreground" : "border border-foreground/60",
      className,
    ),
  };

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={cx("font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-foreground/75">
          {hint}
        </p>
      )}
      {props.multiline ? (
        <textarea
          rows={4}
          {...controlAttributes(props)}
          {...shared}
          className={cx(shared.className, "py-2.5")}
        />
      ) : (
        <input
          type="text"
          {...controlAttributes(props)}
          {...shared}
          className={cx(shared.className, "min-h-control")}
        />
      )}
      <p
        id={errorId}
        aria-live="polite"
        className={cx("flex items-start gap-1.5 text-sm font-medium", !error && "sr-only")}
      >
        {error && (
          <>
            <Icon name="alert" className="mt-[0.2em]" />
            <span>{error}</span>
          </>
        )}
      </p>
    </div>
  );
}
