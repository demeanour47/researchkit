import { LearnMore } from "@/features/research";
import { MEASUREMENT_LEVEL_INFO, QUESTIONNAIRE_ITEM_TYPES, QUESTION_TYPE_INFO, SCALE_PRESETS, SCALE_PRESET_IDS, SECTION_KINDS, SECTION_KIND_INFO } from "@/knowledge/research";
import { steps } from "./copy";

/** Every question type, scale and section kind, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{steps.typesHeading}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {QUESTIONNAIRE_ITEM_TYPES.map((type) => {
            const info = QUESTION_TYPE_INFO[type];
            return (
              <li key={type} className="grid content-start gap-1 rounded-panel border border-border bg-surface p-4">
                <h4 className="font-semibold">{info.label}</h4>
                <p>{info.description}</p>
                <p className="text-small text-text-muted">
                  {steps.instruction}: “{info.instruction}”
                </p>
                <p className="text-small text-text-muted">
                  {steps.suits}: {info.levels.length > 0 ? info.levels.map((level) => MEASUREMENT_LEVEL_INFO[level].label.toLowerCase()).join(", ") : steps.noLevels}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{steps.scalesHeading}</h3>
        <ul className="grid gap-3">
          {SCALE_PRESET_IDS.map((id) => {
            const preset = SCALE_PRESETS[id];
            return (
              <li key={id} className="grid gap-2 rounded-panel border border-border bg-surface p-4">
                <h4 className="font-semibold">{preset.name}</h4>
                <p>{preset.description}</p>
                <LearnMore label={`Labels for ${preset.name.toLowerCase()}`}>
                  <ol className="grid list-decimal gap-1 ps-6">
                    {preset.labels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ol>
                  {preset.anchors && <p className="text-small text-text-muted">{`Ends: ${preset.anchors[0]} and ${preset.anchors[1]}`}</p>}
                  <p className="text-small text-text-muted">{steps.referencesPending}</p>
                </LearnMore>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="grid gap-3">
        <h3 className="text-subheading font-semibold">{steps.sectionsHeading}</h3>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
          {SECTION_KINDS.map((kind) => (
            <div key={kind} className="contents">
              <dt className="font-medium">{SECTION_KIND_INFO[kind].label}</dt>
              <dd>{SECTION_KIND_INFO[kind].purpose}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
