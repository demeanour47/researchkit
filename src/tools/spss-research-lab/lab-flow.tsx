"use client";

import { useState } from "react";
import { Link, SelectField } from "@/ui";
import { SpssProcedureView, SpssWorkflow, WorkedExampleView } from "@/features/statistics";
import { ANALYSIS_METHOD_IDS, getAnalysisMethod } from "@/knowledge/research/data-analysis-types";
import { getWorkedExample, SPSS_PROCEDURE_METHODS, SPSS_WORKFLOW_STEPS, WORKED_EXAMPLE_IDS, type AnalysisMethodId } from "@/knowledge/research";
import { useWorkspace } from "@/features/workspace/store";
import { TOOL_PATH as ASSUMPTIONS_PATH } from "@/tools/statistical-assumption-checker/path";
import { TOOL_PATH as EFFECT_SIZE_PATH } from "@/tools/effect-size-calculator/path";
import { TOOL_PATH as FINDER_PATH } from "@/tools/statistical-test-finder/path";
import { TOOL_PATH as INTERPRET_PATH } from "@/tools/results-interpretation/path";
import { WORKSPACE_PATH } from "@/features/workspace/stage-links";
import { page } from "./copy";

const methodOptions = SPSS_PROCEDURE_METHODS.map((method) => ({ value: method, label: getAnalysisMethod(method).name }));
const exampleOptions = WORKED_EXAMPLE_IDS.map((id) => {
  const example = getWorkedExample(id);
  return { value: id, label: `${getAnalysisMethod(example.method).name}: ${example.question}` };
});
const projectFields = [
  ["Research question", "researchQuestion"],
  ["Research objectives", "researchObjectives"],
  ["Independent variables", "independentVariables"],
  ["Dependent variables", "dependentVariables"],
] as const;

export function LabFlow() {
  const snapshot = useWorkspace();
  const project = snapshot?.status === "ready" ? snapshot.workspace.draft : null;
  const planned = project?.dataAnalysisPlan?.methods.find((method) => SPSS_PROCEDURE_METHODS.includes(method as AnalysisMethodId)) as AnalysisMethodId | undefined;
  const [selected, setSelected] = useState<AnalysisMethodId | "" | null>(null);
  const selectedMethod = selected ?? planned ?? "";
  const [exampleId, setExampleId] = useState<(typeof WORKED_EXAMPLE_IDS)[number] | "">("");
  const example = exampleId ? getWorkedExample(exampleId) : null;
  const methods = project?.dataAnalysisPlan?.methods ?? [];

  return (
    <div className="grid gap-10">
      <section aria-labelledby="lab-workflow-title" className="grid gap-5 border-t border-border pt-8">
        <h2 id="lab-workflow-title" className="text-heading font-semibold">{page.workflowHeading}</h2>
        <SpssWorkflow steps={SPSS_WORKFLOW_STEPS} />
        <p className="text-small text-text-muted">The test-selection, assumption, effect-size and numerical-interpretation steps remain owned by their linked ResearchKit tools.</p>
      </section>

      <section aria-labelledby="lab-project-title" className="grid gap-4 border-t border-border pt-8">
        <h2 id="lab-project-title" className="text-heading font-semibold">{page.projectHeading}</h2>
        <p className="text-text-muted">{page.projectIntro}</p>
        {!project ? (
          <p className="rounded-panel border border-border bg-sunken p-4">{page.noProject} <Link href={WORKSPACE_PATH}>{"Open the research workspace"}</Link>.</p>
        ) : (
          <div className="grid gap-3">
            <dl className="grid gap-3 sm:grid-cols-2">
              {projectFields.map(([label, field]) => {
                const value = project[field];
                return (
                  <div key={field} className="grid content-start gap-1 rounded-panel border border-border bg-surface p-4">
                    <dt className="font-semibold">{label}</dt>
                    <dd className="text-small">{Array.isArray(value) ? value.join("; ") || "Not recorded" : value || (field === "researchQuestion" ? page.noQuestion : "Not recorded")}</dd>
                  </div>
                );
              })}
            </dl>
            <div className="grid gap-2 rounded-panel border border-border bg-surface p-4">
              <h3 className="font-semibold">Defined variables and measurement</h3>
              {project.variables && project.variables.length > 0 ? (
                <ul className="grid gap-2">
                  {project.variables.map((variable) => (
                    <li key={variable.id} className="text-small">
                      <span className="font-medium">{variable.name}</span>: {variable.variableType}; {variable.measurementLevel ?? "measurement level not recorded"}.
                      {variable.operationalDefinition && <span className="text-text-muted"> {variable.operationalDefinition}</span>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-small">{page.noVariables}</p>}
              {project.researchDesign && <p className="text-small">Chosen research design: {project.researchDesign.chosen ?? "not recorded"}</p>}
            </div>
            {project.hypotheses && project.hypotheses.length > 0 && (
              <div className="grid gap-2 rounded-panel border border-border bg-surface p-4">
                <h3 className="font-semibold">Project hypotheses</h3>
                <ul className="grid list-disc gap-1 ps-5 text-small">{project.hypotheses.map((hypothesis) => <li key={hypothesis.id}>{hypothesis.text}</li>)}</ul>
              </div>
            )}
            <div className="grid gap-2 rounded-panel border border-border bg-surface p-4">
              <h3 className="font-semibold">Accepted analysis methods</h3>
              {methods.length > 0 ? (
                <ul className="grid list-disc gap-1 ps-5 text-small">
                  {methods.map((method) => <li key={method}>{ANALYSIS_METHOD_IDS.includes(method as AnalysisMethodId) ? getAnalysisMethod(method as AnalysisMethodId).name : method}</li>)}
                </ul>
              ) : <p className="text-small">{page.noAnalyses}</p>}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="lab-procedure-title" className="grid gap-5 border-t border-border pt-8">
        <h2 id="lab-procedure-title" className="text-heading font-semibold">{page.procedureHeading}</h2>
        <p className="text-text-muted">{page.procedureIntro}</p>
        <SelectField id="spss-method" label="Selected statistical test or analysis" emptyOption="Choose a procedure reference" options={methodOptions} value={selectedMethod} onChange={(event) => setSelected(event.target.value as AnalysisMethodId | "")} />
        {selectedMethod ? <SpssProcedureView method={selectedMethod} /> : <p className="rounded-panel border border-border bg-sunken p-4">{page.procedureEmpty} <Link href={FINDER_PATH}>{"Use the Statistical Test Finder first"}</Link>.</p>}
      </section>

      <section aria-labelledby="lab-practice-title" className="grid gap-5 border-t border-border pt-8">
        <h2 id="lab-practice-title" className="text-heading font-semibold">{page.practiceHeading}</h2>
        <p className="text-text-muted">{page.practiceIntro}</p>
        <SelectField id="spss-example" label={page.practiceLabel} emptyOption="Choose a synthetic worked example" options={exampleOptions} value={exampleId} onChange={(event) => setExampleId(event.target.value as typeof exampleId)} />
        {example && <WorkedExampleView example={example} />}
      </section>

      <section aria-labelledby="lab-tools-title" className="grid gap-4 border-t border-border pt-8">
        <h2 id="lab-tools-title" className="text-heading font-semibold">{page.linksHeading}</h2>
        <ul className="grid gap-2">
          <li><Link href={FINDER_PATH} variant="standalone">Choose a statistical test</Link></li>
          <li><Link href={ASSUMPTIONS_PATH} variant="standalone">Review assumptions</Link></li>
          <li><Link href={EFFECT_SIZE_PATH} variant="standalone">Calculate an effect size</Link></li>
          <li><Link href={INTERPRET_PATH} variant="standalone">Interpret statistics from SPSS output</Link></li>
          <li><Link href={WORKSPACE_PATH} variant="standalone">Apply analysis decisions in the research workspace</Link></li>
        </ul>
      </section>
    </div>
  );
}