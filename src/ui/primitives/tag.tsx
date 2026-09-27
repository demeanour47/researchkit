import { Badge, type BadgeProps } from "./badge";

/** The tones tools use for statuses and judgements. */
type TagTone = "neutral" | "info" | "caution";

export interface TagProps extends Omit<BadgeProps, "tone"> {
  /** Visual emphasis only. The tag's words must carry its meaning. */
  tone?: TagTone;
}

/** A badge limited to the tones tools use for results; see `Badge`. */
export function Tag({ tone = "neutral", ...rest }: TagProps) {
  return <Badge tone={tone} {...rest} />;
}
