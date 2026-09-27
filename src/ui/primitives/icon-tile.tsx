import { cx } from "../cx";
import { Icon, type IconName } from "./icon";

export type IconTileTone = "action" | "accent" | "neutral" | "success";
export type IconTileSize = "sm" | "md" | "lg";

const toneClasses: Record<IconTileTone, string> = {
  action: "bg-action-soft text-action",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-secondary text-text",
  success: "bg-success-soft text-success",
};

const sizeClasses: Record<IconTileSize, string> = {
  sm: "size-8 [&>svg]:size-4",
  md: "size-10 [&>svg]:size-5",
  lg: "size-12 [&>svg]:size-6",
};

/** An icon on a soft square, marking what a card or heading is about. Always decorative. */
export function IconTile({ icon, tone = "action", size = "md", className }: { icon: IconName; tone?: IconTileTone; size?: IconTileSize; className?: string }) {
  return (
    <span aria-hidden="true" className={cx("inline-flex shrink-0 items-center justify-center rounded-tile ring-1 ring-border ring-inset", toneClasses[tone], sizeClasses[size], className)}>
      <Icon name={icon} />
    </span>
  );
}
