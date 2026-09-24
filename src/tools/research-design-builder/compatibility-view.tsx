import { Tag } from "@/ui";
import { CHECK_STATUS_LABELS, checkCompatibility, getDesign, supportingElements, type CheckStatus, type DesignId, type ResearchProjectDraft } from "@/knowledge/research";
import { steps } from "./copy";

export const tones: Record<CheckStatus, "info" | "neutral" | "caution"> = {
  aligned: "info",
  review: "neutral",
  "worth-checking": "caution",
  missing: "caution",
  clarify: "caution",
};

/** One design's fit with the project: every check, its assumptions, and the elements that support it. */
export function CompatibilityView({ id, project }: { id: DesignId; project: ResearchProjectDraft }) {
  const design = getDesign(id);
  const checks = checkCompatibility(id, project);
  const support = supportingElements(id, project);
  const headingId = `fit-${id}-title`;
  return (
    <section aria-labelledby={headingId} className="grid gap-4 rounded-panel border border-border bg-surface p-4 sm:p-6">
      <h3 id={headingId} className="text-subheading font-semibold">
        {design.name}
      </h3>
      <div className="grid gap-2">
        <h4 className="font-semibold">{steps.supportingHeading}</h4>
        {support.length > 0 ? (
          <ul className="grid list-disc gap-1 ps-6">
            {support.map((element) => (
              <li key={element}>{element}</li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">{steps.noSupport}</p>
        )}
      </div>
      <ul className="grid gap-3">
        {checks.map((check) => (
          <li key={check.check} className="grid gap-1 border-s-2 border-border ps-4">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{check.label}</span> <Tag tone={tones[check.status]}>{CHECK_STATUS_LABELS[check.status]}</Tag>
            </p>
            <p className="text-small">{check.explanation}</p>
            {check.supports.length > 0 && (
              <p className="text-small text-text-muted">
                {steps.supports}: {check.supports.join("; ")}
              </p>
            )}
            {check.justify && (
              <p className="text-small text-text-muted">
                <span className="font-medium text-foreground">{steps.justify}</span> {check.justify}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="grid gap-2">
        <h4 className="font-semibold">{steps.assumptions}</h4>
        <ul className="grid list-disc gap-1 ps-6">
          {design.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
