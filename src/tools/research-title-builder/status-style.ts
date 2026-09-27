import type { BadgeTone, IconName } from "@/ui";
import type { AlignmentStatus, CriterionStatus, TitleCategory } from "@/knowledge/research/title";

/** Each status in words with its own icon, so none is shown by colour alone. */
export const CRITERION_STYLE: Readonly<Record<CriterionStatus, { tone: BadgeTone; icon: IconName | undefined }>> = {
  strength: { tone: "success", icon: "check" },
  adequate: { tone: "info", icon: "circle-dot" },
  // Caution badges add their own alert icon.
  attention: { tone: "caution", icon: undefined },
  "not-applicable": { tone: "outline", icon: "circle-minus" },
};

export const CATEGORY_STYLE: Readonly<Record<TitleCategory, { tone: BadgeTone; icon: IconName | undefined }>> = {
  excellent: { tone: "success", icon: "circle-check" },
  good: { tone: "info", icon: "check" },
  "needs-improvement": { tone: "caution", icon: undefined },
};

export const ALIGNMENT_STYLE: Readonly<Record<AlignmentStatus, { tone: BadgeTone; icon: IconName | undefined }>> = {
  aligned: { tone: "success", icon: "check" },
  partial: { tone: "info", icon: "circle-dot" },
  "not-reflected": { tone: "caution", icon: undefined },
  unavailable: { tone: "outline", icon: "circle-minus" },
};
