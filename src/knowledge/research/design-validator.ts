/** Checks of the researcher's design record: choice, justification, fit and consistency with their answers. */

import { checkCompatibility } from "./design-compatibility";
import { narrowDesigns } from "./design-decision";
import { getDesign } from "./design-types";
import type { CheckStatus } from "./hypothesis-checks";
import { containsPhrase, words } from "./question-text";
import type { ResearchDesignRecord } from "./research-design";
import type { ResearchProjectDraft } from "./research-project";

export const DESIGN_CHECK_IDS = ["choice", "dimension", "justification", "compatibility", "answers"] as const;
export type DesignCheckId = (typeof DESIGN_CHECK_IDS)[number];

export const DESIGN_CHECK_LABELS: Readonly<Record<DesignCheckId, string>> = {
  choice: "Design chosen",
  dimension: "Complete description of the design",
  justification: "Justification",
  compatibility: "Fit with your project",
  answers: "Fit with your answers",
};

export interface DesignCheck {
  check: DesignCheckId;
  label: string;
  status: Exclude<CheckStatus, "missing">;
  explanation: string;
}

/** Justifications shorter than this rarely cover why the design fits the question, the project and its limits. */
export const SHORT_JUSTIFICATION_WORDS = 40;

const make = (check: DesignCheckId, status: DesignCheck["status"], explanation: string): DesignCheck => ({ check, label: DESIGN_CHECK_LABELS[check], status, explanation });

export function validateDesign(record: ResearchDesignRecord, project: ResearchProjectDraft): DesignCheck[] {
  if (!record.chosen) {
    return [
      make("choice", "review", record.shortlist.length > 0 ? "You haven't chosen a design yet. That is your decision: compare your shortlist, then choose." : "You haven't chosen or shortlisted a design yet."),
      ...(record.justification.trim() ? [] : [make("justification", "review", "Once you choose a design, write why it suits your research question and project.")]),
    ];
  }
  const design = getDesign(record.chosen);
  const checks: DesignCheck[] = [make("choice", "aligned", `You have chosen a ${design.name.toLowerCase()} design.`)];

  if (design.family === "timing" || design.family === "purpose") {
    checks.push(
      make(
        "dimension",
        "review",
        `“${design.name}” describes the ${design.family === "timing" ? "timing" : "purpose"} of a study. Most studies also need a strategy, such as a survey, experiment or case study; say which you will use.`,
      ),
    );
  }

  const count = words(record.justification).length;
  if (count === 0) checks.push(make("justification", "review", "Write why this design suits your research question, objectives and circumstances."));
  else if (count < SHORT_JUSTIFICATION_WORDS) {
    checks.push(make("justification", "worth-checking", `Your justification is ${count} words. A full justification usually covers why the design fits your question, what it assumes, and its limitations.`));
  } else if (!containsPhrase(record.justification, design.name) && !containsPhrase(record.justification, design.name.split(" ")[0])) {
    checks.push(make("justification", "worth-checking", `Your justification doesn't name the design. Say explicitly why a ${design.name.toLowerCase()} design is appropriate.`));
  } else {
    checks.push(make("justification", "aligned", "Your justification names the design and is long enough to explain your reasoning. Check it covers the points in the compatibility checks."));
  }

  const compatibility = checkCompatibility(record.chosen, project);
  const clarify = compatibility.filter((check) => check.status === "clarify");
  const worth = compatibility.filter((check) => check.status === "worth-checking");
  if (clarify.length > 0) {
    checks.push(make("compatibility", "clarify", `Some parts of your project need clarifying against this design: ${clarify.map((check) => check.label.toLowerCase()).join(", ")}. See the compatibility checks.`));
  } else if (worth.length > 0) {
    checks.push(make("compatibility", "worth-checking", `Some parts of your project are worth checking against this design: ${worth.map((check) => check.label.toLowerCase()).join(", ")}.`));
  } else {
    checks.push(make("compatibility", "aligned", "No part of your project needs clarifying against this design."));
  }

  const narrowing = narrowDesigns(record.answers).find((entry) => entry.design === record.chosen)!;
  if (Object.keys(record.answers).length === 0) {
    checks.push(make("answers", "review", "Answer the decision questions to see how the design fits your plans."));
  } else if (narrowing.differs.length > 0) {
    checks.push(make("answers", "worth-checking", narrowing.differs.map((entry) => entry.explanation).join(" ")));
  } else {
    checks.push(make("answers", "aligned", "The design fits every decision question you answered."));
  }
  return checks;
}
