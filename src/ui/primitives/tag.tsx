import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";
import { Icon } from "./icon";

type TagTone = "neutral" | "info" | "caution";

export interface TagProps extends ComponentPropsWithRef<"span"> {
  /** Visual emphasis only. The tag's words must carry its meaning. */
  tone?: TagTone;
}

const toneClasses: Record<TagTone, string> = {
  neutral: "border border-foreground/25",
  info: "bg-foreground/[0.06]",
  caution: "border border-dashed border-foreground/60",
};

/** A short, non-interactive label that gives context. */
export function Tag({ tone = "neutral", className, children, ...rest }: TagProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-sm leading-tight",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {tone === "caution" && <Icon name="alert" />}
      {children}
    </span>
  );
}
