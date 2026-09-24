import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

type ContainerWidth = "page" | "reading";

export interface PageContainerProps extends ComponentPropsWithRef<"div"> {
  /** `page` for full layouts, `reading` for prose at a comfortable line length. */
  width?: ContainerWidth;
}

/** Centres content at a maximum width, with side gutters at every screen size. */
export function PageContainer({ width = "page", className, ...rest }: PageContainerProps) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-gutter md:px-gutter-wide",
        width === "reading" ? "max-w-reading" : "max-w-page",
        className,
      )}
      {...rest}
    />
  );
}
