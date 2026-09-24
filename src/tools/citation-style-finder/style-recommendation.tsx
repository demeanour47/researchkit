import { Link, Tag } from "@/ui";
import { CITATION_STYLES, styleTitle, type StyleId } from "@/knowledge/citation/styles";
import type { Confidence, StyleRecommendation } from "@/knowledge/citation/style-finder";
import { confidenceLabels, firstStepText, reasonText, resultLabels, styleSummaries } from "./copy";
import { styleGuidePath } from "./path";

const confidenceTone: Record<Confidence, "info" | "neutral" | "caution"> = {
  strong: "info",
  likely: "neutral",
  open: "caution",
};

function StyleList({ styles }: { styles: readonly StyleId[] }) {
  return (
    <ul className="grid gap-3">
      {styles.map((id) => (
        <li key={id}>
          <span className="font-semibold">{styleTitle(id)}</span>
          <span className="text-text-muted"> — {styleSummaries[id]}</span>
        </li>
      ))}
    </ul>
  );
}

export interface StyleRecommendationViewProps {
  recommendation: StyleRecommendation;
  headingId: string;
  heading: string;
}

/** The recommendation, its confidence, what to check first, and every reason behind it. */
export function StyleRecommendationView({ recommendation, headingId, heading }: StyleRecommendationViewProps) {
  const { primary, alternatives, confidence, firstStep, reasons } = recommendation;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={headingId} className="text-heading font-semibold">
          {heading}
        </h2>
        <Tag tone={confidenceTone[confidence]}>{confidenceLabels[confidence]}</Tag>
      </div>

      {firstStep && (
        <p className="rounded-panel border border-border-control bg-surface p-4">
          <span className="font-semibold">{resultLabels.firstStep}</span> {firstStepText(firstStep)}
        </p>
      )}

      {primary ? (
        <div className="grid gap-3 rounded-panel border border-border bg-surface p-6">
          <h3 className="text-subheading font-semibold">
            <span className="rounded-sm bg-emphasis px-1 text-on-emphasis">{styleTitle(primary)}</span>
          </h3>
          <p>{styleSummaries[primary]}</p>
          <p className="text-small text-text-muted">
            {resultLabels.definedBy} {CITATION_STYLES[primary].authority}
          </p>
          <div>
            <Link href={styleGuidePath(primary)} variant="standalone">
              {resultLabels.guideLink(CITATION_STYLES[primary].name)}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 rounded-panel border border-border bg-surface p-6">
          <h3 className="text-subheading font-semibold">{resultLabels.noSingleStyle}</h3>
          {alternatives.length > 0 && (
            <>
              <p className="text-text-muted">{resultLabels.consider}</p>
              <StyleList styles={alternatives} />
            </>
          )}
        </div>
      )}

      {primary && alternatives.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-subheading font-semibold">{resultLabels.alternatives}</h3>
          <StyleList styles={alternatives} />
        </div>
      )}

      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{resultLabels.why}</h3>
        <ul className="grid list-disc gap-2 ps-6">
          {reasons.map((reason, index) => (
            <li key={index}>{reasonText(reason)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
