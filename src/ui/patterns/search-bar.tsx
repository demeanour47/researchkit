import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../cx";
import { Icon } from "../primitives/icon";

export interface SearchBarProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size"> {
  /** The visible or visually hidden label. Always required. */
  label: string;
  hideLabel?: boolean;
  /** A hint at the end of the field, such as a keyboard shortcut. */
  trailing?: ReactNode;
  size?: "md" | "lg";
}

/** A labelled search field with a search icon, for filtering or finding content. */
export function SearchBar({ label, hideLabel = true, trailing, size = "md", id, className, ...rest }: SearchBarProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={cx("grid gap-1.5", className)}>
      <label htmlFor={inputId} className={cx("font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon name="search" className="pointer-events-none absolute start-3 text-text-muted" />
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          spellCheck={false}
          className={cx(
            "w-full rounded-control border border-border-control bg-surface ps-9 pe-3 text-text shadow-card",
            "transition-[border-color] duration-(--duration-instant) ease-standard placeholder:text-text-muted hover:border-text-muted focus-ring",
            "[&::-webkit-search-cancel-button]:cursor-pointer",
            size === "lg" ? "min-h-12 text-lead" : "min-h-control",
            trailing ? "pe-16" : undefined,
          )}
          {...rest}
        />
        {trailing && <span className="pointer-events-none absolute end-3 flex items-center gap-1">{trailing}</span>}
      </div>
    </div>
  );
}
